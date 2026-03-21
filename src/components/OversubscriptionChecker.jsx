import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Calculator, Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { db, ref, onValue } from '../firebase';

export const OversubscriptionChecker = ({ lang }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setLoading(true);
    const overSubRef = ref(db, 'oversubscription');
    const unsubscribe = onValue(overSubRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCompanies(list);
        setError(null);
      } else {
        // Fallback to API if Firebase is empty (for initial setup)
        fetchFromAPI();
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      fetchFromAPI();
    });

    return () => unsubscribe();
  }, []);

  const fetchFromAPI = async () => {
    try {
      const response = await fetch('/api/ipo-oversubscription');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        setError('Could not load IPO data. Please try again later.');
      }
    } catch (err) {
      setError('Could not load IPO data. Please try again later.');
    } finally {
      setLoading(false);
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

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-navy-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-navy-800"
      >
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Calculator size={28} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {t.oversubscriptionChecker}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Real-time oversubscription data from CDSC
              </p>
            </div>
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
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchTerm('')}
                />
              </div>
              
              {searchTerm && filteredCompanies.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                  {filteredCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => {
                        setSelectedCompany(company);
                        setSearchTerm(company.name);
                      }}
                      className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors border-b border-slate-100 dark:border-navy-700 last:border-0 dark:text-white"
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleCheck}
              disabled={!selectedCompany || loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-navy-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
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
                  <p className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">
                    {t.oversubscribedBy}
                  </p>
                  <div className="text-5xl md:text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
                    {result.ratio}x
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {t.times}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="h-4 bg-slate-200 dark:bg-navy-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.percentage}%` }}
                      className="h-full bg-indigo-600 dark:bg-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.totalIssuedUnits}</p>
                    <p className="text-lg font-bold dark:text-white">{result.issued}</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-navy-800 rounded-2xl border border-slate-100 dark:border-navy-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.totalAppliedUnits}</p>
                    <p className="text-lg font-bold dark:text-white">{result.applied}</p>
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
