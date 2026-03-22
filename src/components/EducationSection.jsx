import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Lightbulb, 
  ShieldCheck, 
  TrendingUp,
  ChevronRight,
  ArrowLeft,
  Facebook,
  CheckCircle2,
  Hash,
  RefreshCcw,
  SortAsc,
  Calculator,
  Dices,
  AlertCircle,
  X
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { cn } from '../types';

export const EducationSection = ({ lang, isDark }) => {
  const t = TRANSLATIONS[lang];
  const [view, setView] = useState('list'); // 'list', 'process', or 'odds'

  const articles = [
    {
      id: 'process',
      title: lang === 'EN' ? 'IPO Allotment Process in Nepal' : 'नेपालमा IPO बाँडफाँड प्रक्रिया',
      desc: lang === 'EN' ? 'Understand how CDSC handles the lottery system.' : 'CDSC ले गोलाप्रथा प्रणाली कसरी सञ्चालन गर्छ बुझ्नुहोस्।',
      icon: BookOpen,
      color: 'text-blue-400'
    },
    {
      id: 'odds',
      title: lang === 'EN' ? 'How to increase Your allotment chance' : 'आफ्नो सम्भावना कसरी बढाउने',
      desc: lang === 'EN' ? 'some strategic tips to increase you chances to increase you ipo allotment chances' : 'दोस्रो बजारमा आवेदन दिनका लागि रणनीतिक सुझावहरू।',
      icon: Lightbulb,
      color: 'text-gold-400'
    },
    {
      id: 'risk',
      title: lang === 'EN' ? 'Risk Management for Beginners' : 'सुरुवातकर्ताहरूको लागि जोखिम व्यवस्थापन',
      desc: lang === 'EN' ? 'Protect your capital while investing in IPOs.' : 'IPO मा लगानी गर्दा आफ्नो पूँजी सुरक्षित राख्नुहोस्।',
      icon: ShieldCheck,
      color: 'text-emerald-400'
    }
  ];

  const renderProcess = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <button 
        onClick={() => setView('list')}
        className={cn(
          "flex items-center gap-2 font-bold transition-colors",
          isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
        )}
      >
        <ArrowLeft className="w-5 h-5" /> Back to Guides
      </button>

      <div className="text-center space-y-4">
        <h2 className={cn("text-4xl font-black", isDark ? "text-white" : "text-slate-900")}>
          IPO Allotment Process in Nepal
        </h2>
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>
          A step-by-step breakdown of how the lottery system works.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        {[
          {
            step: "1",
            title: "Applications Collection",
            desc: "All IPO applications are collected based on the exact date and time of submission. Each valid application is assigned a serial number (SRN) in order — the first applicant gets SRN 1, the second gets SRN 2, and so on.",
            icon: CheckCircle2,
            color: "bg-blue-500/20 text-blue-500"
          },
          {
            step: "2",
            title: "Convert to 6-Digit Format",
            desc: "All serial numbers are converted into 6-digit numbers by adding zeros at the beginning (for example, 25 becomes 000025). This keeps the value same but standardizes the format.",
            icon: Hash,
            color: "bg-emerald-500/20 text-emerald-500"
          },
          {
            step: "3",
            title: "Reverse the Serial Numbers",
            desc: "Each 6-digit serial number is reversed (for example, 000123 becomes 321000). This step helps randomize the order.",
            icon: RefreshCcw,
            color: "bg-gold-500/20 text-gold-500"
          },
          {
            step: "4",
            title: "Rearrange in Ascending Order",
            desc: "The reversed serial numbers are then sorted in ascending order. This creates a newly arranged list of applicants.",
            icon: SortAsc,
            color: "bg-purple-500/20 text-purple-500"
          },
          {
            step: "5",
            title: "Calculate Skip Value",
            desc: "A skip value is calculated using the formula. This determines the interval for selecting winners.",
            icon: Calculator,
            color: "bg-pink-500/20 text-pink-500"
          },
          {
            step: "6",
            title: "Ball Draw & Systematic Selection",
            desc: "A ball containing a number between 1 and 9 is randomly drawn. If the drawn number is 5, then the 5th applicant in the newly arranged list gets the first allotment. After that, the skip value is repeatedly added to select the remaining allottees until all shares are distributed.",
            icon: Dices,
            color: "bg-indigo-500/20 text-indigo-500"
          }
        ].map((item, i) => (
          <div key={i} className={cn(
            "flex gap-6 p-8 rounded-[2.5rem] border",
            isDark ? "glass border-white/10" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className={cn(
              "w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-black",
              item.color
            )}>
              {item.step}
            </div>
            <div className="space-y-2">
              <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{item.title}</h3>
              <p className={cn("leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>{item.desc}</p>
            </div>
          </div>
        ))}

        <div className={cn(
          "p-8 rounded-[2.5rem] border flex items-start gap-6",
          isDark ? "bg-gold-500/5 border-gold-500/20" : "bg-gold-50 border-gold-200"
        )}>
          <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="text-gold-500 w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-gold-600 uppercase tracking-widest">Important Note</h4>
            <p className={cn("leading-relaxed", isDark ? "text-slate-300" : "text-slate-700")}>
              This method ensures that the allotment process is fair, transparent, and randomized, giving every valid applicant an equal chance of selection.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderOdds = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <button 
        onClick={() => setView('list')}
        className={cn(
          "flex items-center gap-2 font-bold transition-colors",
          isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
        )}
      >
        <ArrowLeft className="w-5 h-5" /> Back to Guides
      </button>

      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <h2 className={cn("text-4xl font-black leading-tight", isDark ? "text-white" : "text-slate-900")}>
          How to Increase Your <span className="text-emerald-500">IPO Allotment</span> Chance
        </h2>
        <div className={cn(
          "p-6 rounded-2xl border text-left",
          isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
        )}>
          <p className={cn("leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
            In Nepal, IPO allotment (especially in heavily oversubscribed issues) is done through a randomized and systematic process, so no one can guarantee allotment. However, you can legally improve your overall chances using smart and valid methods.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        {/* Tip 1 */}
        <div className={cn(
          "p-8 rounded-[2.5rem] border space-y-6",
          isDark ? "glass border-white/10" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="text-emerald-500 w-6 h-6" />
            </div>
            <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>1. Apply From Multiple Family Demat Accounts</h3>
          </div>
          <div className="space-y-4">
            <p className={cn(isDark ? "text-slate-400" : "text-slate-600")}>Each valid demat account is treated as a separate application.</p>
            <div className={cn("p-4 rounded-xl", isDark ? "bg-white/5" : "bg-slate-50")}>
              <p className={cn("font-mono text-sm", isDark ? "text-emerald-400" : "text-emerald-600")}>
                If:<br/>
                1 account = ~18% chance<br/>
                5 family accounts ≈ much higher combined probability
              </p>
            </div>
          </div>
        </div>

        {/* Tip 2 */}
        <div className={cn(
          "p-8 rounded-[2.5rem] border space-y-6",
          isDark ? "glass border-white/10" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="text-blue-500 w-6 h-6" />
            </div>
            <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>2. Apply for Minimum Quantity</h3>
          </div>
          <div className="space-y-4">
            <p className={cn(isDark ? "text-slate-400" : "text-slate-600")}>In Nepal, when IPO is highly oversubscribed:</p>
            <ul className={cn("space-y-2", isDark ? "text-slate-300" : "text-slate-700")}>
              <li>• Everyone generally gets only the minimum lot (10 shares)</li>
              <li>• Applying for more units does not increase probability in heavy oversubscription cases.</li>
            </ul>
            <div className={cn("p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10", isDark ? "" : "")}>
              <p className="text-emerald-500 font-bold">
                👉 Apply minimum units from multiple valid accounts instead of large quantity from one account.
              </p>
            </div>
          </div>
        </div>

        {/* Tip 3 */}
        <div className={cn(
          "p-8 rounded-[2.5rem] border space-y-6",
          isDark ? "glass border-white/10" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="text-purple-500 w-6 h-6" />
            </div>
            <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>3. Ensure Application Is Valid</h3>
          </div>
          <div className="space-y-4">
            <p className={cn(isDark ? "text-slate-400" : "text-slate-600")}>Many applications get rejected due to errors. Double-check your details:</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Demat number", "BOID", "Bank balance", "Correct personal details"
              ].map((check, i) => (
                <div key={i} className={cn("flex items-center gap-2 p-3 rounded-xl", isDark ? "bg-white/5" : "bg-slate-50")}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-700")}>{check}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Negative Section */}
        <div className={cn(
          "p-10 rounded-[3rem] border bg-red-500/5 border-red-500/20 space-y-8",
          isDark ? "" : ""
        )}>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter italic">What Does NOT Increase Chances</h3>
            <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Common myths debunked</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Applying early or late",
              "Applying on first day",
              "Applying large quantity (in heavy oversubscription)",
              "Knowing someone"
            ].map((myth, i) => (
              <div key={i} className={cn("flex items-center justify-between p-4 rounded-2xl border", isDark ? "bg-navy-900/50 border-white/5" : "bg-white border-slate-200")}>
                <span className={cn("font-bold", isDark ? "text-slate-300" : "text-slate-700")}>{myth}</span>
                <X className="w-5 h-5 text-red-500" />
              </div>
            ))}
          </div>
          <p className={cn("text-center text-sm italic", isDark ? "text-slate-500" : "text-slate-400")}>
            The process is randomized after serial reversal and systematic selection.
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderRiskManagement = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <button 
        onClick={() => setView('list')}
        className={cn(
          "flex items-center gap-2 font-bold transition-colors",
          isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
        )}
      >
        <ArrowLeft className="w-5 h-5" /> Back to Guides
      </button>

      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <h2 className={cn("text-4xl font-black leading-tight", isDark ? "text-white" : "text-slate-900")}>
          Risk Management for <span className="text-emerald-500">Beginners</span>
        </h2>
        <div className={cn(
          "p-6 rounded-2xl border text-left",
          isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
        )}>
          <p className={cn("leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
            Investing in IPOs is generally considered safe, but it's not without risks. Proper risk management ensures you stay in the game for the long run.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {[
          {
            title: "1. Never Invest All Your Money in One IPO",
            desc: "Avoid putting all your capital into a single IPO or stock as due to oversubscriptions only 10 shares are allotted.",
            icon: AlertCircle,
            color: "text-red-500",
            bg: "bg-red-500/10"
          },
          {
            title: "2. Invest Only What You Can Afford to Block",
            desc: "IPO money stays blocked until allotment. Do not invest emergency funds or money needed for daily expenses.",
            icon: ShieldCheck,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
          },
          {
            title: "3. Understand the Company Before Applying",
            desc: "Read company background, financial performance, risk factors, and industry outlook. Don’t apply only because of hype.",
            icon: BookOpen,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
          },
          {
            title: "4. Control Emotions",
            desc: "Greed and fear cause bad decisions. Avoid applying blindly due to FOMO or panic selling after listing. Stay rational.",
            icon: TrendingUp,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
          },
          {
            title: "5. Start Small",
            desc: "If you are a beginner, start with minimum investment, learn from experience, and gradually increase exposure.",
            icon: Lightbulb,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
          },
          {
            title: "6. Keep Long-Term Perspective",
            desc: "Not all IPOs give listing gains. Invest with a clear plan — short term or long term.",
            icon: RefreshCcw,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10"
          }
        ].map((tip, i) => (
          <div key={i} className={cn(
            "p-8 rounded-[2.5rem] border space-y-4",
            isDark ? "glass border-white/10" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", tip.bg)}>
                <tip.icon className={cn("w-6 h-6", tip.color)} />
              </div>
              <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{tip.title}</h3>
            </div>
            <p className={cn("leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>{tip.desc}</p>
          </div>
        ))}
      </div>

      <div className={cn(
        "p-10 rounded-[3rem] border bg-emerald-500/5 border-emerald-500/20 text-center space-y-4 max-w-4xl mx-auto",
        isDark ? "" : ""
      )}>
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="text-emerald-500 w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-emerald-500 uppercase tracking-tighter italic">🎯 Golden Rule for Beginners</h3>
        <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
          “Protect your capital first. Profit comes second.”
        </p>
      </div>
    </motion.div>
  );

  const renderList = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-20"
    >
      <div className="text-center space-y-4">
        <h1 className={cn("text-4xl font-black", isDark ? "text-white" : "text-slate-900")}>{t.education}</h1>
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>Master the art of IPO investing with our curated guides.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((article, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -10 }}
            onClick={() => {
              if (article.id === 'process') setView('process');
              if (article.id === 'odds') setView('odds');
              if (article.id === 'risk') setView('risk');
            }}
            className={cn(
              "glass p-8 rounded-[2.5rem] border group cursor-pointer",
              isDark ? "border-white/10" : "border-slate-200 bg-white/50"
            )}
          >
            <div className={cn(
              "w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
              article.color
            )}>
              <article.icon className="w-7 h-7" />
            </div>
            <h3 className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-slate-900")}>{article.title}</h3>
            <p className={cn("mb-6 leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>{article.desc}</p>
            <button className="flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:gap-3 transition-all">
              Read More <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Facebook Section */}
      <div className={cn(
        "glass p-12 rounded-[3rem] border relative overflow-hidden",
        isDark ? "border-white/10" : "border-slate-200 bg-white/50"
      )}>
        <div className="relative z-10 text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <h2 className={cn("text-3xl font-black", isDark ? "text-white" : "text-slate-900")}>Get Latest Updates on FB</h2>
            <p className={cn("text-lg", isDark ? "text-slate-400" : "text-slate-600")}>
              Stay updated with the latest IPO news, allotment results, and market analysis directly on our Facebook page. Join our community.
            </p>
          </div>
          <a 
            href="https://www.facebook.com/share/1BuKk986R6/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-gold px-10 py-5 inline-flex items-center gap-3 text-lg"
          >
            Visit Facebook Page
          </a>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <AnimatePresence mode="wait">
        {view === 'list' ? renderList() : 
         view === 'process' ? renderProcess() : 
         view === 'odds' ? renderOdds() : 
         renderRiskManagement()}
      </AnimatePresence>
    </div>
  );
};
