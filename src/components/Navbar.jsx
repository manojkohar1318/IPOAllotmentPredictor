import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  TrendingUp, 
  BookOpen, 
  Info, 
  Phone,
  Menu, 
  X, 
  Globe, 
  Moon, 
  Sun,
  Facebook,
  Calculator
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { cn } from '../types';

export const Navbar = ({ lang, setLang, currentPage, setCurrentPage, isDark, setIsDark }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'predictor', label: t.predictor, icon: TrendingUp },
    { id: 'oversubscription', label: 'Oversubscription', icon: Calculator },
    { id: 'education', label: t.education, icon: BookOpen },
    { id: 'about', label: t.about, icon: Info },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3",
      isScrolled 
        ? (isDark ? "bg-navy-900/80 backdrop-blur-md border-b border-white/10 py-2" : "bg-white/80 backdrop-blur-md border-b border-slate-200 py-2") 
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setCurrentPage('home')}
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform">
            <TrendingUp className="text-white w-6 h-6" />
          </div>
          <span className={cn(
            "text-xl font-bold tracking-tight hidden sm:block",
            isDark ? "text-white" : "text-slate-900"
          )}>
            IPO <span className="text-emerald-500">Predictor</span> <span className="text-gold-400">Nepal</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setCurrentPage(link.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors relative flex items-center gap-2",
                currentPage === link.id 
                  ? "text-emerald-400" 
                  : (isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
              )}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
              {currentPage === link.id && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setLang(lang === 'EN' ? 'NP' : 'EN')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
              isDark ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'EN' ? 'NP' : 'EN'}
          </button>
          
          <button 
            onClick={() => setIsDark(!isDark)}
            className={cn(
              "p-2 rounded-lg border transition-all",
              isDark ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-slate-100 hover:bg-slate-200 border-slate-200"
            )}
          >
            {isDark ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button 
            className={cn(
              "md:hidden p-2 rounded-lg border",
              isDark ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-slate-100 hover:bg-slate-200 border-slate-200"
            )}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className={cn("w-5 h-5", isDark ? "text-white" : "text-slate-900")} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-0 z-[60] p-6 flex flex-col",
              isDark ? "bg-navy-900" : "bg-white"
            )}
          >
            <div className="flex items-center justify-between mb-8">
              <span className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn("p-2 rounded-lg", isDark ? "bg-white/5" : "bg-slate-100")}
              >
                <X className={cn("w-6 h-6", isDark ? "text-white" : "text-slate-900")} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setCurrentPage(link.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl text-lg font-semibold transition-all",
                    currentPage === link.id 
                      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" 
                      : (isDark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-700")
                  )}
                >
                  <link.icon className="w-6 h-6" />
                  {link.label}
                </button>
              ))}
            </div>

            <div className={cn(
              "mt-auto p-6 rounded-2xl border",
              isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
            )}>
              <p className={cn("text-sm mb-4", isDark ? "text-slate-400" : "text-slate-500")}>{t.disclaimer}</p>
              <div className="flex gap-4">
                <a 
                  href="https://www.facebook.com/share/1BuKk986R6/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
