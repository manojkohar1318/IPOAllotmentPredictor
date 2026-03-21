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

  // Live Oversubscription Scraper from CDSC ipolist
  app.get("/api/live-oversubscription", async (req, res) => {
    const targetUrl = "https://cdsc.com.np/ipolist";
    
    const fetchWithProxy = async (url: string, proxyName: string) => {
      console.log(`Fetching from ${proxyName}:`, url);
      try {
        const response = await axios.get(url, { timeout: 15000 });
        if (proxyName === "AllOrigins") {
          return response.data?.contents;
        }
        return response.data;
      } catch (err) {
        console.error(`${proxyName} failed:`, err.message);
        return null;
      }
    };

    try {
      let html = null;

      // 1. Try AllOrigins (User requested)
      html = await fetchWithProxy(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, "AllOrigins");

      // 2. Try CorsProxy.io as fallback
      if (!html) {
        html = await fetchWithProxy(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, "CorsProxy.io");
      }

      // 3. Try Direct Fetch as final fallback
      if (!html) {
        console.log("Trying direct fetch...");
        try {
          const directResponse = await axios.get(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            },
            timeout: 15000
          });
          html = directResponse.data;
        } catch (err) {
          console.error("Direct fetch failed:", err.message);
        }
      }

      if (!html) {
        throw new Error("All fetching methods failed (522 or timeout)");
      }

      const $ = cheerio.load(html);
      const ipos = [];

      // CDSC ipolist table structure
      $("table tr").each((i, el) => {
        const cols = $(el).find("td");
        if (cols.length >= 6) {
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

      // Fallback indices if primary fails
      if (ipos.length === 0) {
        $("table tr").each((i, el) => {
          const cols = $(el).find("td");
          if (cols.length >= 5) {
            const name = $(cols[1]).text().trim();
            const issuedText = $(cols[3]).text().trim().replace(/,/g, '');
            const appliedText = $(cols[4]).text().trim().replace(/,/g, '');
            const issuedUnit = parseFloat(issuedText);
            const appliedUnit = parseFloat(appliedText);
            if (name && !isNaN(issuedUnit) && issuedUnit > 0) {
              ipos.push({
                id: `fallback-${i}`,
                name,
                issuedUnits: issuedUnit,
                appliedUnits: isNaN(appliedUnit) ? 0 : appliedUnit,
                oversubscription: (appliedUnit > 0 && issuedUnit > 0) ? (appliedUnit / issuedUnit).toFixed(2) : "0.00",
                lastUpdated: new Date().toISOString()
              });
            }
          }
        });
      }

      console.log(`Successfully scraped ${ipos.length} IPOs`);
      res.json(ipos);
    } catch (error) {
      console.error("Scraping error:", error.message);
      res.status(500).json({ 
        error: "Failed to scrape IPO data", 
        details: error.message,
        fallback: true 
      });
    }
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
