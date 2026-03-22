import React from 'react';
import { TRANSLATIONS } from '../constants';

import { cn } from '../types';

export const TermsOfService = ({ lang, isDark }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
      <div className="text-center space-y-4">
        <h1 className={cn("text-4xl md:text-5xl font-black", isDark ? "text-white" : "text-slate-900")}>{t.termsOfService}</h1>
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>Last Updated: March 2024</p>
      </div>

      <div className={cn(
        "max-w-none space-y-8 text-lg leading-relaxed",
        isDark ? "text-slate-300" : "text-slate-600"
      )}>
        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>1. Acceptance of Terms</h2>
          <p>By accessing and using <a href="https://ipo-allotment-predictor.vercel.app" className="text-emerald-500 hover:underline">IPO Predictor Nepal</a>, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>2. Description of Service</h2>
          <p>IPO Predictor Nepal provides users with tools and information related to IPO allotment probabilities in the Nepal Stock Exchange (NEPSE). This includes calculators, historical data analysis, and educational content. You understand and agree that the Service is provided "AS-IS" and that IPO Predictor Nepal assumes no responsibility for the timeliness, deletion, or failure to store any user communications or personalization settings.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>3. No Financial Advice</h2>
          <p>The content provided on this website is for informational and educational purposes only. It does not constitute financial, investment, or legal advice. We strongly recommend that you perform your own independent research or consult with a qualified financial advisor before making any investment decisions.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>4. Accuracy of Information</h2>
          <p>While we strive to provide accurate and up-to-date information, we make no warranties or representations as to the accuracy, completeness, or timeliness of the content on this site. The allotment probabilities are estimates based on available data and do not guarantee actual results.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>5. User Conduct</h2>
          <p>You agree to use the website only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the website. Prohibited behavior includes harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within the website.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>6. Intellectual Property</h2>
          <p>All content included on this site, such as text, graphics, logos, button icons, images, and software, is the property of IPO Predictor Nepal or its content suppliers and protected by international copyright laws.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>7. Limitation of Liability</h2>
          <p>IPO Predictor Nepal shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or the inability to use the service or for cost of procurement of substitute goods and services or resulting from any goods or services purchased or obtained or messages received or transactions entered into through the service.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>8. Modifications to Service</h2>
          <p>IPO Predictor Nepal reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.</p>
        </section>
      </div>
    </div>
  );
};
