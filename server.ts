import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";
import ipoListHandler from "./api/ipo-list.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory cache for IPO results to minimize CDSC requests
const resultCache = new Map();
// User cooldowns for bulk requests (60 seconds)
const userCooldowns = new Map();

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/ipo-oversubscription", (req, res) => {
    // Mocking real-time data from CDSC/MeroShare
    const ipoData = [
      { id: '1', name: 'Upper Tamakoshi Hydropower', issuedUnits: 15000000, appliedUnits: 67500000, lastUpdated: new Date().toISOString() },
      { id: '2', name: 'Nabil Bank Debenture 2085', issuedUnits: 3000000, appliedUnits: 3600000, lastUpdated: new Date().toISOString() },
      { id: '3', name: 'Sarbottam Cement', issuedUnits: 6000000, appliedUnits: 93000000, lastUpdated: new Date().toISOString() },
      { id: '4', name: 'Himalayan Reinsurance', issuedUnits: 30000000, appliedUnits: 120000000, lastUpdated: new Date().toISOString() },
      { id: '5', name: 'Sonapur Minerals', issuedUnits: 12000000, appliedUnits: 48000000, lastUpdated: new Date().toISOString() }
    ];
    res.json(ipoData);
  });

  // Proxy for CDSC Company List
  app.get("/api/cdsc-companies", async (req, res) => {
    try {
      const response = await axios.get("https://iporesult.cdsc.com.np/api/company-list", {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Origin': 'https://iporesult.cdsc.com.np',
          'Referer': 'https://iporesult.cdsc.com.np/'
        },
        timeout: 10000
      });
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching CDSC companies:", error.message);
      res.status(500).json({ error: "Failed to fetch from CDSC", details: error.message });
    }
  });

  // Single IPO Result Check
  app.post("/api/check-ipo-result", async (req, res) => {
    const { companyShareId, boid } = req.body;
    const userIp = req.ip;
    
    if (!companyShareId || !boid) {
      return res.status(400).json({ success: false, message: "Missing companyShareId or boid" });
    }

    // Check cache first
    const cacheKey = `${companyShareId}-${boid}`;
    if (resultCache.has(cacheKey)) {
      console.log(`Returning cached result for ${boid}`);
      return res.json(resultCache.get(cacheKey));
    }

    try {
      // Use the requested URL and form data
      const params = new URLSearchParams();
      params.append('boid', boid);
      params.append('company', companyShareId);

      const response = await axios.post("https://iporesult.cdsc.com.np/", params, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": "https://iporesult.cdsc.com.np/",
          "Origin": "https://iporesult.cdsc.com.np"
        },
        timeout: 15000
      });

      const html = response.data;
      const $ = cheerio.load(html);
      
      // The response HTML structure for CDSC IPO result usually contains the status in a specific div or text
      // We'll look for common success/failure indicators
      const text = $("body").text();
      
      let status = "Not Allotted";
      let units = 0;
      let success = true;
      let message = "";

      if (text.includes("Congratulations") || text.includes("Allotted")) {
        status = "Allotted";
        // Try to extract units (usually "allotted 10 units")
        const match = text.match(/allotted\s+(\d+)\s+units/i);
        units = match ? parseInt(match[1]) : 10;
      } else if (text.includes("Sorry") || text.includes("not been allotted")) {
        status = "Not Allotted";
        message = "Sorry, you have not been allotted any units.";
      } else if (text.includes("Invalid") || text.includes("not found")) {
        success = false;
        message = "Invalid BOID or Company selection";
      }

      const result = {
        success,
        status,
        units,
        message
      };

      // Cache the result if successful
      if (success) {
        resultCache.set(cacheKey, result);
        // Clear cache after 1 hour
        setTimeout(() => resultCache.delete(cacheKey), 60 * 60 * 1000);
      }

      res.json(result);
    } catch (error) {
      console.error("Error checking IPO result:", error.message);
      res.status(500).json({ success: false, message: "Could not fetch IPO result", details: error.message });
    }
  });

  // Bulk IPO Result Check (Safe System)
  app.post("/api/check-bulk-ipo-result", async (req, res) => {
    const { companyShareId, boids } = req.body;
    const userIp = req.ip;
    
    if (!companyShareId || !boids || !Array.isArray(boids)) {
      return res.status(400).json({ success: false, message: "Missing companyShareId or boids array" });
    }

    // Limit BOIDs per request
    if (boids.length > 10) {
      return res.status(400).json({ success: false, message: "Max 10 BOIDs allowed per bulk request" });
    }

    // Cooldown check (60 seconds)
    const now = Date.now();
    if (userCooldowns.has(userIp)) {
      const lastRequest = userCooldowns.get(userIp);
      if (now - lastRequest < 60000) {
        const remaining = Math.ceil((60000 - (now - lastRequest)) / 1000);
        return res.status(429).json({ 
          success: false, 
          message: `Please wait ${remaining} seconds before another bulk check.` 
        });
      }
    }
    userCooldowns.set(userIp, now);

    const results = [];
    
    // Process BOIDs ONE BY ONE with delay (Queue System)
    for (const boid of boids) {
      // Check cache first
      const cacheKey = `${companyShareId}-${boid}`;
      if (resultCache.has(cacheKey)) {
        results.push({
          boid,
          ...resultCache.get(cacheKey)
        });
        continue;
      }

      try {
        const params = new URLSearchParams();
        params.append('boid', boid);
        params.append('company', companyShareId);

        const response = await axios.post("https://iporesult.cdsc.com.np/", params, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "https://iporesult.cdsc.com.np/"
          },
          timeout: 15000
        });

        const $ = cheerio.load(response.data);
        const text = $("body").text();
        
        let status = "Not Allotted";
        let units = 0;
        let success = true;

        if (text.includes("Congratulations") || text.includes("Allotted")) {
          status = "Allotted";
          const match = text.match(/allotted\s+(\d+)\s+units/i);
          units = match ? parseInt(match[1]) : 10;
        }

        const result = {
          success,
          status,
          units
        };

        // Cache result
        resultCache.set(cacheKey, result);
        setTimeout(() => resultCache.delete(cacheKey), 60 * 60 * 1000);

        results.push({
          boid,
          ...result
        });
      } catch (error) {
        console.error(`Error checking result for BOID ${boid}:`, error.message);
        results.push({
          boid,
          success: false,
          status: "Error",
          units: 0,
          message: "Failed to fetch"
        });
      }

      // Add delay: 2.5 seconds minimum between requests
      await delay(2500);
    }

    res.json({
      success: true,
      results
    });
  });

  // Live IPO List Scraper from CDSC Nepal
  app.get("/api/ipo-list", ipoListHandler);

  // Optional: Background refresh every 3 minutes
  setInterval(async () => {
    try {
      console.log("Performing background refresh of IPO data...");
      // We can just call the handler with mock req/res or refactor the scraper
      // For simplicity, we'll just let the next user request trigger it if we don't want to refactor
      // But to be proactive as requested:
      const mockRes = {
        status: () => ({ json: () => {} }),
        json: () => {}
      };
      await ipoListHandler({}, mockRes);
    } catch (err) {
      console.error("Background refresh failed:", err.message);
    }
  }, 3 * 60 * 1000);

  // Keep the old endpoint for backward compatibility if needed, 
  // but redirecting it to use the same logic or just keeping it as is.
  app.get("/api/live-oversubscription", async (req, res) => {
    const targetUrl = "https://cdsc.com.np/ipolist";
    
    // Try direct fetch first (server-side doesn't need CORS proxy)
    // Then fall back to proxies if direct fetch fails (sometimes cloud IPs are blocked)
    const urls = [
      targetUrl,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`
    ];
    
    let lastError = null;

    for (const url of urls) {
      try {
        console.log(`Fetching from: ${url}`);
        const response = await axios.get(url, { 
          timeout: 15000,
          responseType: 'text',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        const html = response.data;
        if (!html || typeof html !== 'string') continue;

        const $ = cheerio.load(html);
        const ipos = [];

        $("table tr").each((i, el) => {
          const cols = $(el).find("td");
          if (cols.length >= 6) {
            // User requested: Col 2 (Name), Col 4 (Issued), Col 6 (Applied)
            const name = $(cols[1]).text().trim();
            const issuedText = $(cols[3]).text().trim().replace(/,/g, '');
            const appliedText = $(cols[5]).text().trim().replace(/,/g, '');

            const issuedUnit = parseFloat(issuedText);
            const appliedUnit = parseFloat(appliedText);
            
            if (name && !isNaN(issuedUnit) && issuedUnit > 0) {
              ipos.push({
                id: `scraped-${i}`,
                name,
                issuedUnits: issuedUnit,
                appliedUnits: isNaN(appliedUnit) ? 0 : appliedUnit,
                oversubscription: (appliedUnit > 0 && issuedUnit > 0) ? (appliedUnit / issuedUnit).toFixed(2) : "0.00",
                lastUpdated: new Date().toISOString()
              });
            }
          }
        });

        if (ipos.length > 0) {
          return res.json(ipos);
        }
      } catch (error) {
        console.error(`Error with URL ${url}:`, error.message);
        lastError = error;
        // Wait a bit before next try
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.status(500).json({ 
      error: "Failed to fetch IPO data", 
      details: lastError ? lastError.message : "No data found"
    });
  });

  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nSitemap: https://ais-pre-juqdc7qwq7yawob6ij2axa-289326504495.asia-east1.run.app/sitemap.xml");
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ais-pre-juqdc7qwq7yawob6ij2axa-289326504495.asia-east1.run.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
