import AppContent from '../src/App';
import JsonLd from '../src/components/JsonLd';

export const metadata = {
  title: "IPO Allotment Predictor Nepal — Check Your IPO Chances Free",
  description: "Nepal's most accurate IPO allotment predictor. Check live oversubscription ratio, predict allotment chances, NEPSE IPO insights. 100% free.",
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "NEPSE IPO Allotment Predictor",
  "url": "https://ipoallotmentpredictor.vercel.app",
  "description": "Free IPO allotment predictor for Nepal",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ipoallotmentpredictor.vercel.app/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const WEB_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "IPO Allotment Predictor Nepal",
  "url": "https://ipoallotmentpredictor.vercel.app",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "NPR" },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "256"
  }
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How is the IPO allotment probability calculated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We use the total number of shares offered to the general public and divide it by the estimated number of valid applicants. This gives a base probability which we then adjust based on historical subscription trends for similar sectors."
      }
    },
    {
      "@type": "Question",
      "name": "Is this an official NEPSE or CDSC tool?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, this is an independent educational tool. Official allotments are conducted by the respective Issue Managers and results are published on the CDSC MeroShare portal."
      }
    },
    {
      "@type": "Question",
      "name": "Does applying for more than 10 units increase my chances?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In Nepal, for most retail IPOs that are oversubscribed, the allotment is done in lots of 10 shares via lottery. Applying for more than 10 units does not increase your probability of being selected in the lottery."
      }
    },
    {
      "@type": "Question",
      "name": "What is the 'Skip Value' in allotment?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The skip value is a number used in the systematic selection process to ensure randomization. It determines the interval at which applicants are selected from the sorted list after a random starting point is chosen."
      }
    },
    {
      "@type": "Question",
      "name": "How can I check my IPO result in Nepal?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can check your IPO result through the official CDSC IPO Result portal (iporesult.cdsc.com.np) by entering your 16-digit BOID and selecting the company."
      }
    },
    {
      "@type": "Question",
      "name": "What is the minimum number of units to apply for an IPO in Nepal?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The minimum application is usually for 10 units, which costs NPR 1,000 for most IPOs (priced at NPR 100 per share)."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take for an IPO to be listed on NEPSE?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Typically, it takes 10-15 days after the allotment for the shares to be listed and become tradable on the Nepal Stock Exchange (NEPSE)."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between IPO and FPO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An IPO (Initial Public Offering) is the first time a company offers its shares to the public, while an FPO (Further Public Offering) is an additional issuance of shares by a company that is already listed on the stock exchange."
      }
    }
  ]
};

export default function Home() {
  return (
    <>
      <JsonLd data={WEBSITE_SCHEMA} />
      <JsonLd data={WEB_APP_SCHEMA} />
      <JsonLd data={FAQ_SCHEMA} />
      <AppContent />
    </>
  );
}
