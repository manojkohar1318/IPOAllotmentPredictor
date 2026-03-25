import React from 'react';
import { TRANSLATIONS } from '../constants';

import { cn } from '../cn';

export const DisclaimerPage = ({ lang, isDark }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
      <div className="text-center space-y-4">
        <h1 className={cn("text-4xl md:text-5xl font-black", isDark ? "text-white" : "text-slate-900")}>{t.disclaimerPage}</h1>
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>Last Updated: March 24, 2026</p>
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
            "The information provided on NEPSE IPO Allotment Predictor is for educational and informational purposes only. It should not be considered as financial or investment advice."
          </p>
        </div>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>1. No Financial Advice</h2>
          <p>We are not licensed financial advisors, and the content on this website does not constitute financial, investment, or legal advice. You should consult with a qualified professional before making any investment decisions in the Nepal Stock Market or any other financial market.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>2. Accuracy of Predictions</h2>
          <p>Our IPO Allotment Predictor uses statistical models based on historical data and real-time subscription rates. These are <strong>estimates only</strong> and do not guarantee any specific outcome. The actual allotment is conducted by the Issue Manager and CDSC using a randomized lottery system. We are not responsible for any discrepancies between our predictions and the official results.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>3. External Links Disclaimer</h2>
          <p>Our website may contain links to external websites that are not provided or maintained by or in any way affiliated with us. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>4. Limitation of Liability</h2>
          <p>In no event shall NEPSE IPO Allotment Predictor be liable for any special, direct, indirect, consequential, or incidental damages or any damages whatsoever, whether in an action of contract, negligence or other tort, arising out of or in connection with the use of the Service or the contents of the Service.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>5. "Use at Your Own Risk"</h2>
          <p>All information in the Service is provided "as is", with no guarantee of completeness, accuracy, timeliness or of the results obtained from the use of this information, and without warranty of any kind, express or implied, including, but not limited to warranties of performance, merchantability and fitness for a particular purpose.</p>
        </section>
      </div>
    </div>
  );
};
