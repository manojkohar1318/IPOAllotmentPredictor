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

  if (ipoCache.data && (now - ipoCache.lastFetched < CACHE_DURATION)) {
    console.log("Serving IPO data from cache");
    return res.status(200).json({ success: true, data: ipoCache.data });
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
            id: company,
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

    return res.status(200).json({ success: true, data: ipos });
  } catch (error) {
    console.error(`Error fetching IPO data:`, error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Could not load IPO data" 
    });
  }
}
