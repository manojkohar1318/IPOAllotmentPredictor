import React from 'react';
import { TRANSLATIONS } from '../constants';

import { cn } from '../types';

export const PrivacyPolicy = ({ lang, isDark }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
      <div className="text-center space-y-4">
        <h1 className={cn("text-4xl md:text-5xl font-black", isDark ? "text-white" : "text-slate-900")}>{t.privacyPolicy}</h1>
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>Last Updated: March 2024</p>
      </div>

      <div className={cn(
        "max-w-none space-y-8 text-lg leading-relaxed",
        isDark ? "text-slate-300" : "text-slate-600"
      )}>
        <section className="space-y-4">
          <p>Your privacy is important to us. It is IPO Predictor Nepal's policy to respect your privacy regarding any information we may collect from you across our website, <a href="https://ipo-allotment-predictor.vercel.app" className="text-emerald-500 hover:underline">https://ipo-allotment-predictor.vercel.app</a>, and other sites we own and operate.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>1. Information We Collect</h2>
          <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Log Data:</strong> When you visit our website, our servers may automatically log the standard data provided by your web browser. It may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.</li>
            <li><strong>Device Data:</strong> We may also collect data about the device you’re using to access our website. This data may include the device type, operating system, unique device identifiers, device settings, and geo-location data.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>2. Google AdSense and DoubleClick Cookie</h2>
          <p>Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DoubleClick cookie enables it and its partners to serve ads to our users based on their visit to our site or other sites on the Internet.</p>
          <p>Users may opt out of the use of the DoubleClick cookie for interest-based advertising by visiting the <a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Google Ads Settings</a> web page.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>3. Cookies and Web Beacons</h2>
          <p>We use "cookies" to collect information about you and your activity across our site. A cookie is a small piece of data that our website stores on your computer, and accesses each time you visit, so we can understand how you use our site. This helps us serve you content based on preferences you have specified.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>4. Third-party Privacy Policies</h2>
          <p>IPO Predictor Nepal's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>5. Children's Information</h2>
          <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</p>
          <p>IPO Predictor Nepal does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>6. Consent</h2>
          <p>By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>7. Contact Us</h2>
          <p>If you have any questions about our privacy practices or this policy, please contact us at <span className="text-emerald-500 font-bold">earnrealcashnepal@gmail.com</span>.</p>
        </section>
      </div>
    </div>
  );
};
