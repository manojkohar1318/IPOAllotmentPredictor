import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET() {
  const targetUrl = "https://cdsc.com.np/ipolist";
  
  try {
    const fetchWithFallback = async () => {
      const configs = [
        {
          url: targetUrl,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        },
        {
          url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
          headers: { "User-Agent": "Mozilla/5.0" }
        }
      ];

      let lastErr = null;
      for (const config of configs) {
        try {
          const response = await axios.get(config.url, { 
            timeout: 10000, 
            headers: config.headers,
            responseType: 'text'
          });
          if (response.data && typeof response.data === 'string' && response.data.includes('<table')) {
            return response.data;
          }
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error("All fetch attempts failed");
    };

    const html = await fetchWithFallback();
    const $ = cheerio.load(html);
    const ipos = [];

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

    if (ipos.length > 0) {
      return NextResponse.json(ipos);
    } else {
      throw new Error("No IPO data found in table");
    }
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to fetch IPO data", 
      details: error.message
    }, { status: 500 });
  }
}
