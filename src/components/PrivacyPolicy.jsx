import React from 'react';
import { TRANSLATIONS } from '../constants';

import { cn } from '../cn';

export const PrivacyPolicy = ({ lang, isDark }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
      <div className="text-center space-y-4">
        <h1 className={cn("text-4xl md:text-5xl font-black", isDark ? "text-white" : "text-slate-900")}>{t.privacyPolicy}</h1>
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>Last Updated: March 24, 2026</p>
      </div>

      <div className={cn(
        "max-w-none space-y-8 text-lg leading-relaxed",
        isDark ? "text-slate-300" : "text-slate-600"
      )}>
        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>1. Introduction</h2>
          <p>Welcome to NEPSE IPO Allotment Predictor ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website at <a href="https://ipoallotmentpredictor.vercel.app" className="text-emerald-500 hover:underline">https://ipoallotmentpredictor.vercel.app</a>.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>2. Information We Collect</h2>
          <p>We collect information that you provide directly to us, such as when you fill out our contact form or use our predictor tool. This may include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Identifiers:</strong> Name, email address, and any other contact details you provide.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website, including the pages you visit and the tools you interact with.</li>
            <li><strong>Log Data:</strong> Standard web server logs, including your IP address, browser type, and operating system.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>3. Google AdSense and Third-Party Advertising</h2>
          <p>We use Google AdSense to serve advertisements on our website. Google, as a third-party vendor, uses cookies to serve ads based on your visit to our site and other sites on the internet. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</p>
          <p>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Google Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="http://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">www.aboutads.info</a>.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>4. Cookies and Web Beacons</h2>
          <p>We use "cookies" to collect information about you and your activity across our site. A cookie is a small piece of data that our website stores on your computer, and accesses each time you visit, so we can understand how you use our site. This helps us serve you content based on preferences you have specified.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>5. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Operate, maintain, and improve our website and tools.</li>
            <li>Respond to your comments, questions, and provide customer service.</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
            <li>Personalize your experience and serve advertisements that are relevant to you.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>6. Data Security</h2>
          <p>We implement reasonable security measures to protect your information from unauthorized access, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>7. Children's Privacy</h2>
          <p>Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>8. Your Rights and Choices</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data. You can also choose to disable cookies through your browser settings.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>9. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <span className="text-emerald-500 font-bold">earnrealcashnepal@gmail.com</span>.</p>
        </section>
      </div>
    </div>
  );
};
