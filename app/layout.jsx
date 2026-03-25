import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    template: '%s | NEPSE IPO Predictor',
    default: 'NEPSE IPO Allotment Predictor Nepal | Check IPO Chances',
  },
  description: 'Free Nepal IPO allotment predictor and oversubscription checker. Check your IPO allotment chances, live oversubscription ratio, and NEPSE IPO data instantly.',
  keywords: [
    "ipo allotment predictor nepal",
    "nepse ipo allotment predictor",
    "ipo allotment checker nepal",
    "check ipo allotment chances nepal",
    "ipo oversubscription checker nepal",
    "ipo allotment probability nepal",
    "nepse ipo result checker",
    "ipo chance calculator nepal",
    "nepal ipo oversubscription ratio",
    "mero share ipo allotment",
    "nepse live ipo data",
    "ipo allotment result nepal 2025"
  ],
  metadataBase: new URL('https://ipoallotmentpredictor.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_NP',
    siteName: 'NEPSE IPO Allotment Predictor',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: '-48pKBHTI6NB5x2lRcbab5N9PWQbb8dqCHU5TmeYKAQ',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta 
          name="google-site-verification" 
          content="-48pKBHTI6NB5x2lRcbab5N9PWQbb8dqCHU5TmeYKAQ" 
        />
      </head>
      <body className={`${inter.className} bg-navy-950 text-white min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
