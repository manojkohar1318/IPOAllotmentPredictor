import React from 'react';
import { TRANSLATIONS } from '../constants';

import { cn } from '../cn';

export const TermsOfService = ({ lang, isDark }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-12">
      <div className="text-center space-y-4">
        <h1 className={cn("text-4xl md:text-5xl font-black", isDark ? "text-white" : "text-slate-900")}>{t.termsOfService}</h1>
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>Last Updated: March 24, 2026</p>
      </div>

      <div className={cn(
        "max-w-none space-y-8 text-lg leading-relaxed",
        isDark ? "text-slate-300" : "text-slate-600"
      )}>
        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>1. Acceptance of Terms</h2>
          <p>By accessing and using NEPSE IPO Allotment Predictor, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on NEPSE IPO Allotment Predictor's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>Attempt to decompile or reverse engineer any software contained on the website;</li>
            <li>Remove any copyright or other proprietary notations from the materials; or</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>3. Disclaimer</h2>
          <p>The materials on NEPSE IPO Allotment Predictor's website are provided on an 'as is' basis. NEPSE IPO Allotment Predictor makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>4. Limitations</h2>
          <p>In no event shall NEPSE IPO Allotment Predictor or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on NEPSE IPO Allotment Predictor's website, even if NEPSE IPO Allotment Predictor or a NEPSE IPO Allotment Predictor authorized representative has been notified orally or in writing of the possibility of such damage.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>5. Accuracy of Materials</h2>
          <p>The materials appearing on NEPSE IPO Allotment Predictor's website could include technical, typographical, or photographic errors. NEPSE IPO Allotment Predictor does not warrant that any of the materials on its website are accurate, complete or current. NEPSE IPO Allotment Predictor may make changes to the materials contained on its website at any time without notice.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>6. Links</h2>
          <p>NEPSE IPO Allotment Predictor has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by NEPSE IPO Allotment Predictor of the site. Use of any such linked website is at the user's own risk.</p>
        </section>

        <section className="space-y-4">
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>7. Governing Law</h2>
          <p>These terms and conditions are governed by and construed in accordance with the laws of Nepal and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
        </section>
      </div>
    </div>
  );
};
