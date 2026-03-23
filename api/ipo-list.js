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
    // 1. BACKEND (Vercel Serverless API)
    const response = await axios.get(targetUrl, { 
      timeout: 15000,
      responseType: 'text',
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    
    const html = response.data;
    if (!html || typeof html !== 'string') {
      throw new Error("Invalid HTML response from CDSC");
    }

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
