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
      const maxRetries = 2;
      for (let i = 0; i < maxRetries; i++) {
        console.log(`[SCRAPER] Fetching from ${proxyName} (Attempt ${i + 1}):`, url);
        const timeout = proxyName === "AllOrigins" ? 30000 : 15000;
        try {
          const response = await axios.get(url, { 
            timeout,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
          });
          
          let data = response.data;
          if (proxyName === "AllOrigins" && typeof data === 'object' && data !== null) {
            data = data.contents;
          }
          
          if (data && typeof data === 'string' && data.length > 500) {
            console.log(`[SCRAPER] ${proxyName} success! Data length: ${data.length}`);
            return data;
          }
          console.warn(`[SCRAPER] ${proxyName} returned invalid or short data:`, typeof data === 'string' ? data.substring(0, 100) : 'not a string');
        } catch (err) {
          console.error(`[SCRAPER] ${proxyName} attempt ${i + 1} failed:`, err.message);
          if (i < maxRetries - 1) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
      return null;
    };

    try {
      let html = null;

      // 1. Try Direct Fetch (Server-side)
      console.log("[SCRAPER] Trying direct fetch...");
      try {
        const directResponse = await axios.get(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          timeout: 10000
        });
        if (directResponse.data && directResponse.data.length > 1000) {
          html = directResponse.data;
          console.log("[SCRAPER] Direct fetch successful!");
        }
      } catch (err) {
        console.log("[SCRAPER] Direct fetch failed, moving to proxies...");
      }

      // 2. Try CorsProxy.io
      if (!html) {
        html = await fetchWithProxy(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, "CorsProxy.io");
      }

      // 3. Try AllOrigins
      if (!html) {
        await new Promise(r => setTimeout(r, 500));
        html = await fetchWithProxy(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, "AllOrigins");
      }

      // 4. Try CodeTabs Proxy
      if (!html) {
        await new Promise(r => setTimeout(r, 500));
        html = await fetchWithProxy(`https://api.codetabs.com/v1/proxy?url=${encodeURIComponent(targetUrl)}`, "CodeTabs");
      }

      // 5. Try HTMLDriven Proxy
      if (!html) {
        await new Promise(r => setTimeout(r, 500));
        html = await fetchWithProxy(`https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(targetUrl)}`, "HTMLDriven");
      }

      // 5. Try Direct Fetch
      if (!html) {
        await new Promise(r => setTimeout(r, 500)); // Small delay
        const maxDirectRetries = 2;
        for (let i = 0; i < maxDirectRetries; i++) {
          console.log(`Trying direct fetch (Attempt ${i + 1})...`);
          try {
            const directResponse = await axios.get(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
              },
              timeout: 15000
            });
            html = directResponse.data;
            if (html) break;
          } catch (err) {
            console.error(`Direct fetch attempt ${i + 1} failed:`, err.message);
            if (i < maxDirectRetries - 1) {
              await new Promise(r => setTimeout(r, 1000));
            }
          }
        }
      }

      const ipos = [];

      if (html) {
        const $ = cheerio.load(html);
        console.log("[SCRAPER] Parsing HTML...");
        
        // CDSC ipolist table structure
        // User requested: Name: Col 2 (td[1]), Issued: Col 4 (td[3]), Applied: Col 6 (td[5])
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
                lastUpdated: new Date().toISOString(),
                isLive: true
              });
            }
          }
        });

        // Fallback for different table structure (sometimes 5 columns)
        if (ipos.length === 0) {
          console.log("[SCRAPER] Primary structure failed, trying fallback structure...");
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
                  lastUpdated: new Date().toISOString(),
                  isLive: true
                });
              }
            }
          });
        }
      } else {
        console.error("[SCRAPER] All fetch attempts failed.");
      }

      // Final Fallback: If no IPOs found or all fetches failed, return mock data
      if (ipos.length === 0) {
        console.log("All scraping failed or no IPOs found. Returning mock fallback data.");
        const mockData = [
          { id: 'm1', name: 'Garima Subarna Yojana', issuedUnits: 10000000, appliedUnits: 45000000, oversubscription: "4.50", lastUpdated: new Date().toISOString(), isLive: false },
          { id: 'm2', name: 'Beni Hydropower', issuedUnits: 5000000, appliedUnits: 12500000, oversubscription: "2.50", lastUpdated: new Date().toISOString(), isLive: false },
          { id: 'm3', name: 'Sarbottam Cement (Closed)', issuedUnits: 6000000, appliedUnits: 93000000, oversubscription: "15.50", lastUpdated: new Date().toISOString(), isLive: false }
        ];
        return res.json(mockData);
      }

      console.log(`Successfully scraped ${ipos.length} IPOs`);
      res.json(ipos);
    } catch (error) {
      console.error("Scraping error:", error.message);
      // Even on error, try to return something so the UI doesn't break
      const errorFallback = [
        { id: 'e1', name: 'Data Temporarily Unavailable', issuedUnits: 1, appliedUnits: 0, oversubscription: "0.00", lastUpdated: new Date().toISOString(), isLive: false, error: true }
      ];
      res.json(errorFallback);
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
