import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calculator, Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { cn } from '../cn';
import { 
  firestore, 
  collection, 
  onSnapshot 
} from '../firebase';

export const OversubscriptionChecker = ({ lang, isDark }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const t = TRANSLATIONS[lang];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch live data from CDSC scraper first
      const liveResponse = await fetch('/api/ipo-list');
      console.log("Response from /api/ipo-list (Checker):", liveResponse);
      if (liveResponse.ok) {
        const result = await liveResponse.json();
        console.log("Data from /api/ipo-list (Checker):", result);
        if (result.success && result.data && result.data.length > 0) {
          setCompanies(result.data);
          setLoading(false);
          return; // Use live data if available
        }
      }
      
      // Fallback to Firebase if live fetch fails or is empty
      const overSubCollection = collection(firestore, 'oversubscription');
      onSnapshot(overSubCollection, (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        if (list.length > 0) {
          setCompanies(list);
        } else {
          fetchFromAPI(); // Final fallback
        }
        setLoading(false);
      }, (err) => {
        console.error(err);
        fetchFromAPI();
        setLoading(false);
      });
    } catch (err) {
      console.error("Error loading data:", err);
      fetchFromAPI();
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const fetchFromAPI = async () => {
    try {
      // Try our internal oversubscription API
      const response = await fetch('/api/ipo-oversubscription');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        setError('Could not load IPO data. Please try again later.');
      }
    } catch (err) {
      setError('Could not load IPO data. Please try again later.');
    }
  };

  const handleCheck = () => {
    if (!selectedCompany) return;
    
    setResult({
      ratio: selectedCompany.oversubscription,
      issued: selectedCompany.issuedUnits.toLocaleString(),
      applied: selectedCompany.appliedUnits.toLocaleString(),
      lastUpdated: selectedCompany.lastUpdated ? new Date(selectedCompany.lastUpdated).toLocaleString() : new Date().toLocaleString(),
      percentage: Math.min((parseFloat(selectedCompany.oversubscription) / 20) * 100, 100) // Visual progress cap at 20x
    });
  };

  const handleRefresh = () => {
    setCompanies([]);
    setResult(null);
    setSelectedCompany(null);
    setSearchTerm('');
    loadData();
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showDropdown = !selectedCompany && (searchTerm || companies.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-navy-900 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-navy-800"
      >
        <div className="p-6 md:p-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="p-3 md:p-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl md:rounded-[2rem] text-emerald-600 dark:text-emerald-400 shadow-inner">
                <Calculator size={24} className="md:w-10 md:h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-1">
                  <h2 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {t.oversubscriptionChecker}
                  </h2>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                  </div>
                </div>
                <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-medium">
                  Real-time data synced from CDSC Nepal
                </p>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              className={cn(
                "w-full md:w-auto px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-2 font-bold text-xs md:text-sm shadow-sm",
                isDark ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
              )}
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh Data
            </button>
          </div>

          <div className="space-y-6 md:space-y-10">
            {/* IPO Selection Dropdown */}
            <div className="space-y-3 md:space-y-4">
              <label className="block text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">
                {t.selectCompany || 'Select IPO'}
              </label>
              <div className="relative group">
                <select
                  className={cn(
                    "w-full px-4 md:px-8 py-4 md:py-6 bg-slate-50 dark:bg-navy-800 border-2 border-transparent rounded-2xl md:rounded-[2rem] focus:border-emerald-500 outline-none transition-all text-sm md:text-xl font-bold appearance-none cursor-pointer shadow-inner",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                  value={selectedCompany?.id || ''}
                  onChange={(e) => {
                    const company = companies.find(c => c.id === e.target.value);
                    setSelectedCompany(company);
                    setResult(null);
                  }}
                  disabled={loading}
                >
                  <option value="" disabled>{loading ? "Loading IPO data..." : "-- Select Active IPO --"}</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Search size={18} className="md:w-6 md:h-6" />
                </div>
              </div>
              
              {companies.length === 0 && !loading && (
                <div className="p-4 md:p-6 bg-amber-500/5 border border-amber-500/20 rounded-xl md:rounded-2xl flex items-center gap-3 text-amber-600 dark:text-amber-400">
                  <AlertCircle size={18} />
                  <p className="text-xs md:text-sm font-bold">No active IPOs found. Please try refreshing.</p>
                </div>
              )}
            </div>

            <button
              onClick={handleCheck}
              disabled={!selectedCompany || loading}
              className="w-full py-4 md:py-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-navy-800 text-white font-black text-sm md:text-xl uppercase tracking-[0.15em] rounded-2xl md:rounded-[2rem] transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <Calculator size={20} className="md:w-6 md:h-6" />}
              {t.checkOversubscription}
            </button>

            {error && (
              <div className="p-4 md:p-6 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl md:rounded-[2rem] flex items-center gap-3 md:gap-4">
                <AlertCircle size={20} className="md:w-6 md:h-6" />
                <p className="text-xs md:text-base font-bold">{error}</p>
              </div>
            )}

            {/* Result Display Card */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-8 md:mt-16 p-6 md:p-16 bg-slate-50 dark:bg-navy-800/30 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 dark:border-navy-700 relative overflow-hidden shadow-2xl"
                >
                  {/* Decorative background element */}
                  <div className={cn(
                    "absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20",
                    parseFloat(result.ratio) >= 1 ? "bg-emerald-500" : "bg-orange-500"
                  )} />

                  <div className="text-center mb-8 md:mb-12 relative z-10">
                    <h3 className={cn("text-xl md:text-5xl font-black mb-2 md:mb-4", isDark ? "text-white" : "text-slate-900")}>
                      {selectedCompany?.name}
                    </h3>
                    <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] font-black mb-6 md:mb-10">
                      Oversubscription Analysis
                    </p>
                    
                    <div className={cn(
                      "inline-flex flex-col items-center justify-center w-32 h-32 md:w-64 md:h-64 rounded-full border-4 md:border-8 shadow-2xl mb-6 md:mb-8 transition-all",
                      parseFloat(result.ratio) >= 1 
                        ? "bg-emerald-500 border-emerald-400/30 text-white shadow-emerald-500/30" 
                        : "bg-orange-500 border-orange-400/30 text-white shadow-orange-500/30"
                    )}>
                      <span className="text-3xl md:text-7xl font-black leading-none">{result.ratio}</span>
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1 md:mt-2 opacity-80">Ratio</span>
                    </div>
                    
                    <div className={cn(
                      "text-sm md:text-3xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3",
                      parseFloat(result.ratio) >= 1 ? "text-emerald-500" : "text-orange-500"
                    )}>
                      <CheckCircle2 size={18} className="md:w-8 md:h-8" />
                      {parseFloat(result.ratio) >= 1 ? 'Oversubscribed' : 'Under-subscribed'}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 relative z-10">
                    <div className={cn(
                      "p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border transition-all hover:scale-[1.02]",
                      isDark ? "bg-navy-900/50 border-white/5" : "bg-white border-slate-100 shadow-sm"
                    )}>
                      <p className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1 md:mb-3">Total Issued Units</p>
                      <p className="text-lg md:text-3xl font-black text-slate-900 dark:text-white">{result.issued}</p>
                    </div>
                    <div className={cn(
                      "p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border transition-all hover:scale-[1.02]",
                      isDark ? "bg-navy-900/50 border-white/5" : "bg-white border-slate-100 shadow-sm"
                    )}>
                      <p className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-1 md:mb-3">Total Applied Units</p>
                      <p className="text-lg md:text-3xl font-black text-slate-900 dark:text-white">{result.applied}</p>
                    </div>
                  </div>

                  <div className="mt-8 md:mt-12 flex items-center justify-center gap-2 md:gap-3 text-slate-500 dark:text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                    <Clock size={14} className="md:w-4 md:h-4" />
                    <span>{t.lastUpdated}: {result.lastUpdated}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
