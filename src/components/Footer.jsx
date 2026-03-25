import React from 'react';
import { 
  TrendingUp, 
  Facebook, 
  Twitter, 
  Youtube, 
  Mail, 
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { cn } from '../cn';

export const Footer = ({ lang, setCurrentPage, isDark }) => {
  const t = TRANSLATIONS[lang];

  return (
    <footer className={cn(
      "pt-20 pb-10 px-4 border-t transition-colors duration-300",
      isDark ? "bg-navy-800/50 border-white/10" : "bg-slate-100 border-slate-200"
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <span className={cn(
                "text-xl font-bold tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}>
                IPO <span className="text-emerald-500">Predictor</span>
              </span>
            </div>
            <p className={cn(
              "leading-relaxed",
              isDark ? "text-slate-400" : "text-slate-600"
            )}>
              This website provides a fun and simple estimate of IPO allotment probability based on subscription data. 
              The results are approximate and for educational purposes only. Since the actual allotment process involves randomization, 
              real outcomes may differ. This is not financial advice.
            </p>
            <div className="flex flex-col gap-4">
              <a 
                href="https://www.facebook.com/share/1BuKk986R6/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all border border-white/10">
                  <Facebook className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  isDark ? "text-slate-300 group-hover:text-white" : "text-slate-500 group-hover:text-slate-900"
                )}>
                  Follow and Support on FB
                </span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={cn("text-lg font-bold mb-6", isDark ? "text-white" : "text-slate-900")}>Quick Links</h4>
            <ul className="space-y-4">
              {[
                { id: 'about', label: 'About' },
                { id: 'contact', label: 'Contact' },
                { id: 'privacy', label: 'Privacy Policy' },
                { id: 'disclaimer', label: 'Disclaimer' },
                { id: 'terms', label: 'Terms' },
                { id: 'blog', label: 'Blog' }
              ].map((link) => (
                <li key={link.id}>
                  <button 
                    onClick={() => setCurrentPage(link.id)}
                    className={cn(
                      "transition-colors capitalize",
                      isDark ? "text-slate-400 hover:text-emerald-400" : "text-slate-600 hover:text-emerald-600"
                    )}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <a 
                  href="https://www.facebook.com/share/1BuKk986R6/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "transition-colors",
                    isDark ? "text-slate-400 hover:text-emerald-400" : "text-slate-600 hover:text-emerald-600"
                  )}
                >
                  Facebook (IPO/FPO Updates Nepal)
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={cn("text-lg font-bold mb-6", isDark ? "text-white" : "text-slate-900")}>Contact Us</h4>
            <ul className="space-y-6">
              <li className={cn("flex items-center gap-3", isDark ? "text-slate-400" : "text-slate-600")}>
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>earnrealcashnepal@gmail.com</span>
              </li>
              <li>
                <a 
                  href="https://wa.me/9779804486318" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  <MessageCircle className="w-5 h-5" />
                  Message Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={cn("pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6", isDark ? "border-white/5" : "border-slate-200")}>
          <div className="hidden">
            <h2>NEPSE IPO Allotment Predictor</h2>
            <p>The best IPO allotment predictor in Nepal. Check your IPO allotment probability for Nepali stocks including Hydropower, Microfinance, and more. Get real-time data-driven insights for NEPSE IPOs.</p>
            <p>Keywords: NEPSE IPO Allotment Predictor, ipo allotment predictor nepal, nepse ipo result, ipo allotment probability, nepse stock market nepal, share market nepal, ipo result checker nepal</p>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 IPO Predictor Nepal. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <button onClick={() => setCurrentPage('contact')} className={cn("transition-colors", isDark ? "hover:text-white" : "hover:text-slate-900")}>Contact Us</button>
            <button onClick={() => setCurrentPage('privacy')} className={cn("transition-colors", isDark ? "hover:text-white" : "hover:text-slate-900")}>{t.privacyPolicy}</button>
            <button onClick={() => setCurrentPage('terms')} className={cn("transition-colors", isDark ? "hover:text-white" : "hover:text-slate-900")}>{t.termsOfService}</button>
            <button onClick={() => setCurrentPage('disclaimer')} className={cn("transition-colors", isDark ? "hover:text-white" : "hover:text-slate-900")}>{t.disclaimerPage}</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
