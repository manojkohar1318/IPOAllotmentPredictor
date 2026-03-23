import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Simple cache for IPO data
  let ipoCache = {
    data: null,
    lastFetched: 0
  };

  // Live IPO List Scraper from CDSC Nepal
  app.get("/api/ipo-list", async (req, res) => {
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
    const now = Date.now();

    if (ipoCache.data && (now - ipoCache.lastFetched < CACHE_DURATION)) {
      console.log("Serving IPO data from cache");
      return res.json({ success: true, data: ipoCache.data });
    }

    const targetUrl = "https://cdsc.com.np/ipolist";
    
    try {
      console.log(`Fetching IPO data from: ${targetUrl}`);
      const response = await axios.get(targetUrl, { 
        timeout: 15000,
        responseType: 'text',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        }
      });
      
      const html = response.data;
      if (!html || typeof html !== 'string') {
        throw new Error("Invalid HTML response from CDSC");
      }

      const $ = cheerio.load(html);
      const ipos = [];

      $("table tr").each((i, el) => {
        const cols = $(el).find("td");
        if (cols.length >= 6) {
          const company = $(cols[1]).text().trim();
          const issueSizeText = $(cols[3]).text().trim().replace(/,/g, '');
          const appliedUnitsText = $(cols[5]).text().trim().replace(/,/g, '');

          const issueSize = parseFloat(issueSizeText);
          const appliedUnits = parseFloat(appliedUnitsText);
          
          if (company && !isNaN(issueSize) && issueSize > 0) {
            const oversubscription = (appliedUnits > 0) ? parseFloat((appliedUnits / issueSize).toFixed(2)) : 0;
            
            ipos.push({
              id: company, // Use company name as a unique ID
              name: company,
              company,
              issueSize,
              issuedUnits: issueSize,
              appliedUnits: isNaN(appliedUnits) ? 0 : appliedUnits,
              oversubscription
            });
          }
        }
      });

      // Sort by highest oversubscription
      ipos.sort((a, b) => b.oversubscription - a.oversubscription);

      ipoCache = {
        data: ipos,
        lastFetched: now
      };

      res.json({ success: true, data: ipos });
    } catch (error) {
      console.error(`Error fetching IPO data:`, error.message);
      res.status(500).json({ 
        success: false, 
        message: "Could not load IPO data" 
      });
    }
  });

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
