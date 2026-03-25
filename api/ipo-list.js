import axios from 'axios';
import * as cheerio from 'cheerio';

// Simple cache for IPO data
let ipoCache = {
  data: null,
  lastFetched: 0
};

export default async function handler(req, res) {
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
  const now = Date.now();

  // 2. ADD CACHING (VERY IMPORTANT)
  if (ipoCache.data && (now - ipoCache.lastFetched < CACHE_DURATION)) {
    console.log("Serving IPO data from cache");
    return res.status(200).json({ success: true, data: ipoCache.data });
  }

  const targetUrl = "https://cdsc.com.np/ipolist";
  
  try {
    console.log(`Fetching fresh IPO data from: ${targetUrl}`);
    
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
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Referer": "https://cdsc.com.np/"
          }
        },
        {
          url: `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Referer": "https://cdsc.com.np/"
          }
        },
        {
          url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Referer": "https://cdsc.com.np/"
          }
        }
      ];

      let lastErr = null;
      for (const config of configs) {
        try {
          console.log(`Trying fetch from: ${config.url}`);
          const res = await axios.get(config.url, { 
            timeout: 10000, 
            headers: config.headers,
            responseType: 'text'
          });
          if (res.data && typeof res.data === 'string' && res.data.includes('<table')) {
            return res.data;
          }
        } catch (e) {
          console.error(`Fetch failed for ${config.url}:`, e.message);
          lastErr = e;
        }
      }
      throw lastErr || new Error("All fetch attempts failed");
    };

    const html = await fetchWithFallback();
    const $ = cheerio.load(html);
    const ipos = [];

    // Extract ONLY required fields
    $("table tr").each((i, el) => {
      const cols = $(el).find("td");
      if (cols.length >= 6) {
        const company = $(cols[1]).text().trim();
        const issueUnitsText = $(cols[3]).text().trim().replace(/,/g, '');
        const appliedUnitsText = $(cols[5]).text().trim().replace(/,/g, '');

        // Convert values to numbers
        const issueUnits = parseFloat(issueUnitsText);
        const appliedUnits = parseFloat(appliedUnitsText);
        
        if (company && !isNaN(issueUnits) && issueUnits > 0) {
          // Calculate oversubscription
          const oversubscriptionValue = (appliedUnits > 0) ? (appliedUnits / issueUnits) : 0;
          // Format oversubscription to 2 decimal places (e.g., 3.45x)
          const oversubscription = oversubscriptionValue.toFixed(2) + "x";
          
          ipos.push({
            id: company,
            name: company,
            company,
            issueSize: issueUnits,
            issuedUnits: issueUnits,
            appliedUnits: isNaN(appliedUnits) ? 0 : appliedUnits,
            oversubscription,
            oversubscriptionValue // Keep numeric for sorting
          });
        }
      }
    });

    if (ipos.length === 0) {
      console.warn("No IPO data found in table, using static fallback.");
      const staticIpos = [
        { id: '1', name: 'Upper Tamakoshi Hydropower', issuedUnits: 15000000, appliedUnits: 67500000, oversubscription: "4.50x", oversubscriptionValue: 4.5 },
        { id: '2', name: 'Sarbottam Cement', issuedUnits: 6000000, appliedUnits: 93000000, oversubscription: "15.50x", oversubscriptionValue: 15.5 },
        { id: '3', name: 'Himalayan Reinsurance', issuedUnits: 30000000, appliedUnits: 120000000, oversubscription: "4.00x", oversubscriptionValue: 4.0 }
      ];
      return res.status(200).json({ success: true, data: staticIpos, fallback: true });
    }

    // 5. PERFORMANCE OPTIMIZATION - Sort by highest oversubscription
    ipos.sort((a, b) => b.oversubscriptionValue - a.oversubscriptionValue);

    // Remove the numeric value before sending to frontend if we want to be strict
    const finalData = ipos.map(({ oversubscriptionValue, ...rest }) => rest);

    ipoCache = {
      data: finalData,
      lastFetched: now
    };

    return res.status(200).json({ success: true, data: finalData });
  } catch (error) {
    console.error(`Error fetching IPO data:`, error.message);
    // 3. ERROR HANDLING
    return res.status(500).json({ 
      success: false, 
      message: "Could not load IPO data" 
    });
  }
}
