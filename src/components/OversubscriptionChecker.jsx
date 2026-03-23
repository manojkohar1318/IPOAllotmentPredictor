import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Calculator, Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { cn } from '../cn';
import { db, ref, onValue } from '../firebase';

export const OversubscriptionChecker = ({ lang }) => {
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
      const overSubRef = ref(db, 'oversubscription');
      onValue(overSubRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
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
    
    const ratio = selectedCompany.appliedUnits / selectedCompany.issuedUnits;
    setResult({
      ratio: ratio.toFixed(2),
      issued: selectedCompany.issuedUnits.toLocaleString(),
      applied: selectedCompany.appliedUnits.toLocaleString(),
      lastUpdated: new Date(selectedCompany.lastUpdated).toLocaleTimeString(),
      percentage: Math.min((ratio / 20) * 100, 100) // Visual progress cap at 20x
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-navy-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-navy-800"
      >
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <Calculator size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {t.oversubscriptionChecker}
                  </h2>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Live</span>
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Real-time data synced from CDSC ipolist
                </p>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800 transition-all text-slate-500 flex items-center gap-2"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              <span className="text-xs font-bold hidden sm:inline">Refresh Data</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Searchable Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t.selectCompany}
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder={loading ? "Loading IPO data..." : "-- Select Current IPO --"}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 dark:text-white font-medium"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedCompany && e.target.value !== selectedCompany.name) {
                      setSelectedCompany(null);
                      setResult(null);
                    }
                  }}
                />
              </div>
              
              {showDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
                  {companies.length === 0 && !loading ? (
                    <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                      <p className="text-sm font-medium">No active IPOs found at the moment.</p>
                      <button 
                        onClick={handleRefresh}
                        className="mt-2 text-emerald-500 text-xs font-bold hover:underline"
                      >
                        Try Refreshing
                      </button>
                    </div>
                  ) : filteredCompanies.length === 0 && searchTerm ? (
                    <div className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">
                      No matching companies found for "{searchTerm}"
                    </div>
                  ) : (
                    (searchTerm ? filteredCompanies : companies).map((company) => (
                      <button
                        key={company.id}
                        onClick={() => {
                          setSelectedCompany(company);
                          setSearchTerm(company.name);
                          setResult(null);
                        }}
                        className="w-full text-left px-6 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-b border-slate-100 dark:border-navy-700 last:border-0 group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{company.name}</span>
                          {company.oversubscription && (
                            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg border border-emerald-500/20">
                              {company.oversubscription}x
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleCheck}
              disabled={!selectedCompany || loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-navy-800 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <Calculator size={20} />}
              {t.checkOversubscription}
            </button>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3">
                <AlertCircle size={20} />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12 p-8 bg-slate-50 dark:bg-navy-800/50 rounded-3xl border border-slate-200 dark:border-navy-700"
              >
                <div className="text-center mb-8">
                  <p className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider font-bold mb-4">
                    {t.oversubscribedBy || 'Oversubscription Result'}
                  </p>
                  
                  <div className={cn(
                    "inline-block px-8 py-4 rounded-3xl text-5xl md:text-7xl font-black mb-6 shadow-xl",
                    parseFloat(result.ratio) >= 1 
                      ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                      : "bg-orange-500 text-white shadow-orange-500/20"
                  )}>
                    {result.ratio}x
                  </div>
                  
                  <p className={cn(
                    "text-xl font-bold uppercase tracking-widest",
                    parseFloat(result.ratio) >= 1 ? "text-emerald-500" : "text-orange-500"
                  )}>
                    {parseFloat(result.ratio) >= 1 ? 'Oversubscribed' : 'Under-subscribed'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="h-4 bg-slate-200 dark:bg-navy-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.percentage}%` }}
                      className={cn(
                        "h-full transition-all duration-1000",
                        parseFloat(result.ratio) >= 1 ? "bg-emerald-500" : "bg-orange-500"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.totalIssuedUnits}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{result.issued}</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.totalAppliedUnits}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{result.applied}</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
                  <Clock size={14} />
                  <span>{t.lastUpdated}: {result.lastUpdated}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
