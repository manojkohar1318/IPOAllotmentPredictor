"use client";

import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Calculator,
  Star,
  Bell,
  X,
  MessageCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Sparkles,
  Search
} from 'lucide-react';
import { TRANSLATIONS } from './constants';
import { Navbar } from './components/Navbar';
import { Predictor } from './components/Predictor';
import { EducationSection } from './components/EducationSection';
import { AboutSection } from './components/AboutSection';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { DisclaimerPage } from './components/DisclaimerPage';
import { ContactPage } from './components/ContactPage';
import { OversubscriptionChecker } from './components/OversubscriptionChecker';
import { AuthModal } from './components/AuthModal';
import { BlogListing } from './components/BlogListing';
import { BlogPost } from './components/BlogPost';
import { BlogSection } from './components/BlogSection';
import { cn } from './cn';
import { DUMMY_IPOS } from './constants';
import { 
  firestore, 
  doc, 
  auth, 
  onAuthStateChanged,
  collection, 
  onSnapshot,
  handleFirestoreError,
  OperationType 
} from './firebase';

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "NEPSE IPO Allotment Predictor",
  "url": "https://ipoallotmentpredictor.vercel.app",
  "description": "Nepal's smartest IPO allotment probability predictor at one click. Get data-driven insights for NEPSE IPOs.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ipoallotmentpredictor.vercel.app/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try refreshing the page.";
      let isFirestoreError = false;

      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error && parsedError.operationType) {
          isFirestoreError = true;
          if (parsedError.error.includes('unavailable') || parsedError.error.includes('client is offline')) {
            errorMessage = "Unable to connect to the database. This might be due to a network issue or incorrect configuration. Please check your internet connection and try again.";
          } else if (parsedError.error.includes('permission-denied')) {
            errorMessage = "You don't have permission to perform this action. Please make sure you are logged in with the correct account.";
          } else {
            errorMessage = `Database Error: ${parsedError.error}`;
          }
        }
      } catch (e) {
        // Not a JSON error message
        if (this.state.error.message.includes('unavailable') || this.state.error.message.includes('client is offline')) {
          errorMessage = "Unable to connect to the database. Please check your internet connection.";
        }
      }

      return (
        <div className={cn(
          "min-h-screen flex items-center justify-center p-4 text-center",
          this.props.isDark ? "bg-navy-950 text-white" : "bg-slate-50 text-slate-900"
        )}>
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-black">Oops!</h1>
            <p className="text-lg opacity-80">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-gold px-8 py-4 w-full"
            >
              Refresh Page
            </button>
            {isFirestoreError && (
              <p className="text-xs opacity-50">
                Error Code: {JSON.parse(this.state.error.message).operationType}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [lang, setLang] = useState('EN');
  const [currentPage, setCurrentPage] = useState('home');
  const [currentSlug, setCurrentSlug] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [ipos, setIpos] = useState(DUMMY_IPOS);
  const [liveOversubscription, setLiveOversubscription] = useState([]);
  const [countdownData, setCountdownData] = useState({
    company: 'Sarbottam Cement',
    targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const handleOpenAuth = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('open-auth-modal', handleOpenAuth);
    };
  }, []);

  // Fetch data from Firebase and Live Scraper
  const fetchLiveOversubscription = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/ipo-list');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLiveOversubscription(result.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live oversubscription:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const iposCollection = collection(firestore, 'ipos');
    const unsubscribeIpos = onSnapshot(iposCollection, (snapshot) => {
      const ipoList = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      if (ipoList.length > 0) {
        setIpos(ipoList);
      } else {
        setIpos(DUMMY_IPOS);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ipos');
    });

    const countdownDoc = doc(firestore, 'countdown', 'main');
    const unsubscribeCountdown = onSnapshot(countdownDoc, (snapshot) => {
      if (snapshot.exists()) {
        setCountdownData(snapshot.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'countdown/main');
    });

    fetchLiveOversubscription();

    return () => {
      unsubscribeIpos();
      unsubscribeCountdown();
    };
  }, []);

  // Check for hidden admin page via URL hash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/adminpage-1318') {
        setCurrentPage('admin');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-navy-950 text-white';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-900';
    }
  }, [isDark]);

  // Countdown timer logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(countdownData.targetDate) - +new Date();
      let timeLeft = { d: 0, h: 0, m: 0, s: 0 };

      if (difference > 0) {
        timeLeft = {
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, [countdownData.targetDate]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Handle back button for pages
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setCurrentPage(e.state.page);
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Push state when page changes
  useEffect(() => {
    if (currentPage !== 'home') {
      // Only push if the current state is different to avoid duplicates
      if (!window.history.state || window.history.state.page !== currentPage) {
        window.history.pushState({ page: currentPage }, '');
      }
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'predictor': return <Predictor lang={lang} ipos={ipos} liveIpos={liveOversubscription} isDark={isDark} setCurrentPage={setCurrentPage} setCurrentSlug={setCurrentSlug} />;
      case 'education': return <EducationSection lang={lang} isDark={isDark} />;
      case 'about': return <AboutSection lang={lang} isDark={isDark} />;
      case 'admin': return <AdminDashboard lang={lang} ipos={ipos} setIpos={setIpos} countdownData={countdownData} setCountdownData={setCountdownData} isDark={isDark} liveOversubscription={liveOversubscription} />;
      case 'privacy': return <PrivacyPolicy lang={lang} isDark={isDark} />;
      case 'terms': return <TermsOfService lang={lang} isDark={isDark} />;
      case 'disclaimer': return <DisclaimerPage lang={lang} isDark={isDark} />;
      case 'contact': return <ContactPage lang={lang} isDark={isDark} />;
      case 'oversubscription': return <OversubscriptionChecker lang={lang} isDark={isDark} />;
      case 'blog': return <BlogListing isDark={isDark} setCurrentPage={setCurrentPage} setCurrentSlug={setCurrentSlug} />;
      case 'blog-post': return <BlogPost isDark={isDark} slug={currentSlug} setCurrentPage={setCurrentPage} setCurrentSlug={setCurrentSlug} />;
      default: return renderHome();
    }
  };

  const renderHome = () => (
    <div className="space-y-24 pb-24">
      <script type="application/ld+json">
        {JSON.stringify(JSON_LD)}
      </script>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-500/5 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className={cn(
              "text-5xl md:text-7xl font-black mb-6 leading-tight",
              isDark ? "text-white" : "text-slate-900"
            )}>
              NEPSE IPO Allotment Predictor
            </h1>
            <p className={cn(
              "text-xl md:text-2xl mb-10 max-w-3xl mx-auto",
              isDark ? "text-slate-400" : "text-slate-600"
            )}>
              Nepal's smartest IPO allotment probability predictor at one click. Get data-driven insights for NEPSE IPOs including Hydropower, Microfinance, and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setCurrentPage('predictor')}
                className="btn-gold text-lg px-10 py-5 flex items-center justify-center gap-3 group w-full sm:w-72"
              >
                {t.checkChances} <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                onClick={() => setCurrentPage('oversubscription')}
                className={cn(
                  "px-10 py-5 rounded-xl font-bold border transition-all flex items-center justify-center gap-3 w-full sm:w-72",
                  isDark ? "bg-indigo-600/20 border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-400" : "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-600"
                )}
              >
                <Calculator className="w-6 h-6" /> {t.oversubscriptionChecker}
              </button>
            </div>
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => setCurrentPage('education')}
                className={cn(
                  "px-8 py-3 rounded-xl font-bold border transition-all text-sm",
                  isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900"
                )}
              >
                Learn How It Works
              </button>
            </div>
          </motion.div>

          {/* Disclaimer Card */}
          <div className="mt-24 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-10 rounded-[2.5rem] border border-gold-500/20 bg-gold-500/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle className="w-24 h-24 text-gold-500" />
              </div>
              <div className="flex items-center gap-4 mb-6 justify-center">
                <div className="w-12 h-12 bg-gold-500/20 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="text-gold-500 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gold-500 uppercase tracking-widest">Disclaimer</h3>
              </div>
              <p className={cn(
                "text-lg leading-relaxed text-center italic",
                isDark ? "text-slate-300" : "text-slate-600"
              )}>
                "{t.disclaimer}"
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Oversubscription Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className={cn(
          "glass p-10 rounded-[3rem] border relative overflow-hidden",
          isDark ? "border-white/10" : "border-slate-200 bg-white/50"
        )}>
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Calculator className="w-64 h-64" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-12 relative">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-bold border border-indigo-500/20">
                <Sparkles className="w-4 h-4" /> New Feature
              </div>
              <div className="flex items-center justify-between mb-2">
                <h2 className={cn("text-4xl font-black leading-tight", isDark ? "text-white" : "text-slate-900")}>
                  {t.oversubscriptionChecker}
                </h2>
                <button 
                  onClick={fetchLiveOversubscription}
                  disabled={isRefreshing}
                  className={cn(
                    "p-3 rounded-xl transition-all flex items-center gap-2",
                    isDark ? "bg-white/5 hover:bg-white/10 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  )}
                  title="Refresh Data"
                >
                  <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                  <span className="text-xs font-bold hidden sm:inline">Refresh Data</span>
                </button>
              </div>
              <p className={cn("text-lg leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>
                Don't guess the oversubscription ratio. Check real-time data from CDSC and MeroShare to get accurate allotment predictions.
              </p>
              <button 
                onClick={() => setCurrentPage('oversubscription')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3"
              >
                <Calculator className="w-6 h-6" /> Check Now
              </button>
            </div>
            <div className="flex-1">
              <div className={cn(
                "p-8 rounded-3xl border shadow-2xl rotate-3",
                isDark ? "bg-navy-800 border-white/10" : "bg-white border-slate-200"
              )}>
                {liveOversubscription.length > 0 ? (
                  <div className="space-y-8">
                    {liveOversubscription.slice(0, 3).map((ipo, idx) => (
                      <div key={ipo.id || `live-${idx}`} className={cn(
                        "pb-6 border-b last:border-0 last:pb-0",
                        isDark ? "border-white/5" : "border-slate-100"
                      )}>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                            </div>
                            <div>
                              <div className={cn("font-bold text-sm", isDark ? "text-white" : "text-slate-900")}>{ipo.name}</div>
                              {idx === 0 && (
                                <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Live
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-black text-emerald-500">{ipo.oversubscription}</div>
                            <div className="text-[9px] text-slate-500 uppercase font-bold">Oversubscribed</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-1.5 bg-slate-200 dark:bg-navy-900 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-1000" 
                              style={{ width: `${Math.min((parseFloat(ipo.oversubscription) / 20) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span>Issued: {ipo.issuedUnits.toLocaleString()}</span>
                            <span>Applied: {ipo.appliedUnits.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <TrendingUp className="w-16 h-16 text-emerald-500/20 mx-auto mb-4" />
                    <p className={cn("font-bold", isDark ? "text-slate-400" : "text-slate-500")}>No active IPOs to show.</p>
                    <p className="text-xs text-slate-500 mt-2">Check back later for live updates.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={cn("text-4xl font-black mb-4", isDark ? "text-white" : "text-slate-900")}>{t.howItWorks}</h2>
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>Simple 3-step process to find your allotment odds.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className={cn(
            "hidden md:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 -z-10",
            isDark ? "bg-gradient-to-r from-transparent via-white/10 to-transparent" : "bg-gradient-to-r from-transparent via-slate-200 to-transparent"
          )} />
          
          {[
            { step: 1, title: t.step1, desc: 'Select your IPO and enter application details like number of accounts.', icon: '📝' },
            { step: 2, title: t.step2, desc: 'Our AI-powered algorithm analyzes historical trends and oversubscription data.', icon: '⚙️' },
            { step: 3, title: t.step3, desc: 'Get a detailed probability score and tips to improve your future chances.', icon: '📊' },
          ].map((item, i) => (
            <div key={i} className="text-center space-y-6">
              <div className={cn(
                "w-20 h-20 rounded-3xl border flex items-center justify-center text-4xl mx-auto shadow-2xl",
                isDark ? "bg-navy-800 border-white/10" : "bg-white border-slate-200"
              )}>
                {item.icon}
              </div>
              <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{item.title}</h3>
              <p className={cn("leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Countdown Widget */}
      {timeLeft.d + timeLeft.h + timeLeft.m + timeLeft.s > 0 && (
        <section className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 rounded-[3rem] text-center shadow-2xl shadow-emerald-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Clock className="w-32 h-32" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Next Major IPO Result Countdown</h2>
            <p className="text-white font-black text-3xl mb-8 uppercase tracking-wider">{countdownData.company}</p>
            <div className="flex justify-center gap-4 sm:gap-8">
              {[
                { label: 'Days', value: timeLeft.d },
                { label: 'Hours', value: timeLeft.h },
                { label: 'Mins', value: timeLeft.m },
                { label: 'Secs', value: timeLeft.s },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black mb-2">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 font-bold text-emerald-100">Stay tuned for upcoming IPO results!</p>
          </div>
        </section>
      )}

      {/* Market Insights Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={cn("text-4xl font-black mb-4", isDark ? "text-white" : "text-slate-900")}>Market Insights</h2>
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>Stay ahead with the latest trends in the Nepal Stock Market.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border",
            isDark ? "glass border-white/10" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-blue-500 w-6 h-6" />
              </div>
              <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>Rising Retail Participation</h3>
            </div>
            <p className={cn("leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
              The number of Demat accounts in Nepal has crossed 6 million, showing a massive surge in retail interest. This high participation means IPOs are often oversubscribed by 10x to 50x, making the lottery system the primary method of allotment.
            </p>
          </div>
          <div className={cn(
            "p-8 rounded-[2.5rem] border",
            isDark ? "glass border-white/10" : "bg-white border-slate-200 shadow-sm"
          )}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Star className="text-purple-500 w-6 h-6" />
              </div>
              <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>Sector Performance</h3>
            </div>
            <p className={cn("leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
              Hydropower and Commercial Banks continue to dominate the IPO landscape. While Hydropower companies often offer quicker listing gains, Banking sector IPOs are preferred for long-term stability and consistent dividend payouts.
            </p>
          </div>
        </div>
      </section>

      <BlogSection isDark={isDark} setCurrentPage={setCurrentPage} setCurrentSlug={setCurrentSlug} />

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={cn("text-4xl font-black mb-4", isDark ? "text-white" : "text-slate-900")}>Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              q: "How is the IPO allotment probability calculated?",
              a: "We use the total number of shares offered to the general public and divide it by the estimated number of valid applicants. This gives a base probability which we then adjust based on historical subscription trends for similar sectors."
            },
            {
              q: "Is this an official NEPSE or CDSC tool?",
              a: "No, this is an independent educational tool. Official allotments are conducted by the respective Issue Managers and results are published on the CDSC MeroShare portal."
            },
            {
              q: "Does applying for more than 10 units increase my chances?",
              a: "In Nepal, for most retail IPOs that are oversubscribed, the allotment is done in lots of 10 shares via lottery. Applying for more than 10 units does not increase your probability of being selected in the lottery."
            },
            {
              q: "What is the 'Skip Value' in allotment?",
              a: "The skip value is a number used in the systematic selection process to ensure randomization. It determines the interval at which applicants are selected from the sorted list after a random starting point is chosen."
            },
            {
              q: "How can I check my IPO result in Nepal?",
              a: "You can check your IPO result through the official CDSC IPO Result portal (iporesult.cdsc.com.np) by entering your 16-digit BOID and selecting the company."
            },
            {
              q: "What is the minimum number of units to apply for an IPO in Nepal?",
              a: "The minimum application is usually for 10 units, which costs NPR 1,000 for most IPOs (priced at NPR 100 per share)."
            },
            {
              q: "How long does it take for an IPO to be listed on NEPSE?",
              a: "Typically, it takes 10-15 days after the allotment for the shares to be listed and become tradable on the Nepal Stock Exchange (NEPSE)."
            },
            {
              q: "What is the difference between IPO and FPO?",
              a: "An IPO (Initial Public Offering) is the first time a company offers its shares to the public, while an FPO (Further Public Offering) is an additional issuance of shares by a company that is already listed on the stock exchange."
            }
          ].map((faq, i) => (
            <div key={i} className={cn(
              "p-6 rounded-2xl border",
              isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
            )}>
              <h3 className={cn("font-bold text-lg mb-2", isDark ? "text-white" : "text-slate-900")}>{faq.q}</h3>
              <p className={isDark ? "text-slate-400" : "text-slate-600"}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to Use This Tool */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className={cn("p-10 rounded-[3rem] border", isDark ? "bg-navy-900 border-white/10" : "bg-white border-slate-200 shadow-sm")}>
          <h2 className={cn("text-3xl font-black mb-8", isDark ? "text-white" : "text-slate-900")}>How to Use the NEPSE IPO Allotment Predictor</h2>
          <div className={cn("space-y-6 text-lg leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
            <p>
              Using our NEPSE IPO Allotment Predictor is simple and designed to give you instant insights into your investment chances. To get started, navigate to the "Predictor" section from the menu. First, select the company you are interested in from the dropdown list. If the company is currently open for application or recently closed, our system will automatically fetch the latest oversubscription data if available.
            </p>
            <p>
              Next, enter the number of Demat accounts you are using to apply for the IPO. Many families in Nepal apply through multiple accounts (e.g., self, spouse, children) to increase their collective probability. Our tool calculates the combined probability for all these accounts. After entering the details, click on the "Predict Now" button.
            </p>
            <p>
              The algorithm will then process the data, comparing the total issued units against the estimated or actual number of applicants. You will receive a probability score (Low, Moderate, Good, or High) along with a fun comment and a prediction of how many units (kitta) you might receive. You can also download your prediction card or share it on Facebook to compare with your friends. Remember, this tool is for educational purposes and helps you understand the statistical side of the NEPSE lottery system.
            </p>
          </div>
        </div>
      </section>

      {/* How IPO Allotment Works in Nepal */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className={cn("p-10 rounded-[3rem] border", isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-100")}>
          <h2 className={cn("text-3xl font-black mb-8", isDark ? "text-white" : "text-slate-900")}>How IPO Allotment Works in Nepal</h2>
          <div className={cn("space-y-6 text-lg leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
            <p>
              In Nepal, the IPO allotment process is governed by the Securities Board of Nepal (SEBON) and executed by the Issue Manager through the C-ASBA system. For most retail IPOs, the "10 Kitta Policy" is followed. This means that every valid applicant is eligible to receive at least 10 shares if the issue is not heavily oversubscribed.
            </p>
            <p>
              However, due to the massive number of investors (often over 2.5 million for a single issue), most IPOs become oversubscribed by many times. In such cases, a lottery system is used. The system randomly selects lucky winners who each receive 10 shares. The probability of being selected depends entirely on the ratio of available shares to the number of valid applicants. Our predictor tool uses this exact logic to give you a statistical estimate of your chances.
            </p>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      isDark ? "bg-navy-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isDark={isDark}
        setIsDark={setIsDark}
      />
      
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer lang={lang} setCurrentPage={setCurrentPage} isDark={isDark} />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        isDark={isDark} 
      />

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
        <a 
          href="https://wa.me/9779804486318" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <MessageCircle className="text-white w-8 h-8" />
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  
  // Sync dark mode for ErrorBoundary
  useEffect(() => {
    const dark = document.documentElement.classList.contains('dark');
    setIsDark(dark);
  }, []);

  return (
    <HelmetProvider>
      <Helmet>
        <title>NEPSE IPO Allotment Predictor | Check Your IPO Probability</title>
        <meta name="description" content="Predict your IPO allotment chances with high accuracy using our NEPSE IPO Allotment Predictor. Get live subscription data, expert insights, and market analysis." />
        <meta name="keywords" content="NEPSE IPO Allotment Predictor, ipo allotment predictor nepal, nepse ipo result, ipo allotment probability, nepse stock market nepal, share market nepal, ipo result checker nepal" />
        <meta name="author" content="NEPSE IPO Predictor Team" />
        <link rel="canonical" href="https://ipoallotmentpredictor.vercel.app" />
      </Helmet>
      <ErrorBoundary isDark={isDark}>
        <AppContent />
      </ErrorBoundary>
    </HelmetProvider>
  );
}
