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
    const proxies = [
      `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    ];

    let lastError = null;

    for (const proxyUrl of proxies) {
      try {
        console.log(`Fetching from proxy: ${proxyUrl}`);
        const response = await axios.get(proxyUrl, { 
          timeout: 15000,
          responseType: 'text',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        
        const html = response.data;
        if (!html || typeof html !== 'string') {
          console.warn(`Empty or invalid HTML from ${proxyUrl}`);
          continue;
        }

        const $ = cheerio.load(html);
        const ipos = [];

        // Try to find any table first
        const table = $("table");
        if (table.length === 0) {
          console.warn(`No table found in HTML from ${proxyUrl}`);
          continue;
        }
        
        table.find("tr").each((i, el) => {
          const cols = $(el).find("td");
          if (cols.length >= 5) {
            const name = $(cols[1]).text().trim();
            // Try to find issued units and applied units
            // Sometimes they might be in different columns if the table structure varies
            // We'll try the requested indices first (2nd, 4th, 6th)
            let issuedText = $(cols[3]).text().trim().replace(/,/g, '');
            let appliedText = $(cols[5]).text().trim().replace(/,/g, '');
            
            // If 6th column is empty, try 5th (some tables have SN, Name, Sector, Issued, Applied)
            if (!appliedText && cols.length >= 5) {
              appliedText = $(cols[4]).text().trim().replace(/,/g, '');
            }

            const issuedUnit = parseFloat(issuedText);
            const appliedUnit = parseFloat(appliedText);
            
            if (name && name.length > 2 && !isNaN(issuedUnit) && issuedUnit > 0) {
              ipos.push({
                id: `scraped-${i}-${Math.random().toString(36).substr(2, 5)}`,
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
          console.log(`Successfully scraped ${ipos.length} IPOs using ${proxyUrl}`);
          return res.json(ipos);
        }
        
        console.warn(`No IPOs found using ${proxyUrl}, trying next proxy if available...`);
      } catch (error) {
        console.error(`Error with proxy ${proxyUrl}:`, error.message);
        lastError = error;
      }
    }

    res.status(500).json({ 
      error: "Failed to scrape IPO data from all proxies", 
      details: lastError ? lastError.message : "Unknown error"
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
