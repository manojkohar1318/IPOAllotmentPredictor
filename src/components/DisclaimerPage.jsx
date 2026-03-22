import React from 'react';
import { TRANSLATIONS } from '../constants';

import { cn } from '../cn';

export const DisclaimerPage = ({ lang, isDark }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
      <div className="text-center space-y-4">
        <h1 className={cn("text-4xl md:text-5xl font-black", isDark ? "text-white" : "text-slate-900")}>{t.disclaimerPage}</h1>
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>Last Updated: March 2024</p>
      </div>

      <div className={cn(
        "max-w-none space-y-8 text-lg leading-relaxed",
        isDark ? "text-slate-300" : "text-slate-600"
      )}>
        <div className={cn(
          "p-10 border rounded-[3rem] shadow-xl",
          isDark ? "bg-gold-500/10 border-gold-500/20 shadow-gold-900/10" : "bg-gold-50 border-gold-200 shadow-gold-200/50"
        )}>
          <p className="text-gold-500 font-bold text-xl leading-relaxed italic text-center">
            "{t.disclaimer}"
          </p>
        </div>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>1. General Information</h2>
          <p>The information provided by <a href="https://ipo-allotment-predictor.vercel.app" className="text-emerald-500 hover:underline">IPO Predictor Nepal</a> is for general informational and educational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>2. Not Financial Advice</h2>
          <p>The site cannot and does not contain financial advice. The financial information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals. We do not provide any kind of financial advice. The use or reliance of any information contained on this site is solely at your own risk.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>3. External Links Disclaimer</h2>
          <p>The site may contain (or you may be sent through the site) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.</p>
          <p>We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the site or any website or feature linked in any banner or other advertising. We will not be a party to or in any way be responsible for monitoring any transaction between you and third-party providers of products or services.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>4. Professional Disclaimer</h2>
          <p>The site cannot and does not contain investment advice. Our authors are not licensed financial advisors. The information is provided for general informational and educational purposes only and is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>5. Errors and Omissions Disclaimer</h2>
          <p>While we have made every attempt to ensure that the information contained in this site has been obtained from reliable sources, IPO Predictor Nepal is not responsible for any errors or omissions, or for the results obtained from the use of this information. All information in this site is provided "as is", with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information, and without warranty of any kind, express or implied.</p>
        </section>
      </div>
    </div>
  );
};
