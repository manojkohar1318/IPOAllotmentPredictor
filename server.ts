import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/ipo-oversubscription", (req, res) => {
    // Mocking real-time data from CDSC/MeroShare
    // In a real scenario, we would use axios and cheerio to scrape or call a real API
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
      // Fallback to some common companies if CDSC is down
      res.status(500).json({ error: "Failed to fetch from CDSC", details: error.message });
    }
  });

  // Live Oversubscription Scraper from CDSC ipolist
  app.get("/api/live-oversubscription", async (req, res) => {
    try {
      const targetUrl = "https://cdsc.com.np/ipolist";
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
      
      const response = await axios.get(proxyUrl, { timeout: 15000 });
      const html = response.data.contents;
      
      // Use cheerio to parse the HTML
      const cheerio = await import("cheerio");
      const $ = cheerio.load(html);
      
      const ipos = [];
      // Assuming the data is in a table. We need to find the correct selectors.
      // Based on typical CDSC table structure:
      $("table tr").each((i, el) => {
        if (i === 0) return; // Skip header
        
        const cols = $(el).find("td");
        if (cols.length >= 5) {
          const name = $(cols[1]).text().trim();
          const issuedUnit = parseFloat($(cols[3]).text().trim().replace(/,/g, '')) || 0;
          const appliedUnit = parseFloat($(cols[4]).text().trim().replace(/,/g, '')) || 0;
          
          if (name && issuedUnit > 0) {
            ipos.push({
              id: `scraped-${i}`,
              name,
              issuedUnits: issuedUnit,
              appliedUnits: appliedUnit,
              oversubscription: appliedUnit > 0 ? (appliedUnit / issuedUnit).toFixed(2) : "0.00",
              lastUpdated: new Date().toISOString()
            });
          }
        }
      });
      
      res.json(ipos);
    } catch (error) {
      console.error("Scraping error:", error.message);
      res.status(500).json({ error: "Failed to scrape IPO data", details: error.message });
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
