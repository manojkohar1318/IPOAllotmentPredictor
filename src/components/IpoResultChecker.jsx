import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  User, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  Save, 
  Database,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  auth, 
  firestore, 
  collection,
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  onSnapshot,
  onAuthStateChanged,
  handleFirestoreError,
  OperationType 
} from '../firebase';
import { cn } from '../cn';

export const IpoResultChecker = ({ lang, isDark, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('single');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [boid, setBoid] = useState('');
  const [singleResult, setSingleResult] = useState(null);
  const [checkingSingle, setCheckingSingle] = useState(false);
  
  const [savedBoids, setSavedBoids] = useState([]);
  const [newBoid, setNewBoid] = useState('');
  const [newBoidName, setNewBoidName] = useState('');
  const [bulkResults, setBulkResults] = useState([]);
  const [checkingBulk, setCheckingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [isAddingBoid, setIsAddingBoid] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        fetchSavedBoids(u.uid);
      }
    });

    fetchCompanies();

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/get-ipo-result-list');
      const data = await response.json();
      if (data.success) {
        const list = data.data.map(c => ({
          id: c.companyId,
          companyId: c.companyId,
          name: c.name
        }));
        setCompanies(list);
      } else {
        throw new Error(data.message || 'Failed to load IPO list');
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Failed to load IPO list from CDSC. Please try refreshing.');
    }
  };

  const fetchSavedBoids = async (uid) => {
    try {
      const docRef = doc(firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Handle legacy array of strings or new array of objects
        const boids = (data.savedBoids || []).map(b => 
          typeof b === 'string' ? { boid: b, name: 'Unnamed' } : b
        );
        setSavedBoids(boids);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }
  };

  const handleAddBoid = async () => {
    if (!newBoid || newBoid.length !== 16 || isNaN(newBoid)) {
      setError('Please enter a valid 16-digit BOID');
      return;
    }
    if (!newBoidName.trim()) {
      setError('Please enter a name for this BOID');
      return;
    }
    if (savedBoids.some(b => b.boid === newBoid)) {
      setError('BOID already saved');
      return;
    }

    const boidObj = { boid: newBoid, name: newBoidName.trim() };

    try {
      const docRef = doc(firestore, 'users', user.uid);
      await updateDoc(docRef, {
        savedBoids: arrayUnion(boidObj)
      });
      setSavedBoids([...savedBoids, boidObj]);
      setNewBoid('');
      setNewBoidName('');
      setIsAddingBoid(false);
      setError(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      setError('Failed to save BOID to database');
    }
  };

  const handleRemoveBoid = async (boidObj) => {
    try {
      const docRef = doc(firestore, 'users', user.uid);
      await updateDoc(docRef, {
        savedBoids: arrayRemove(boidObj)
      });
      setSavedBoids(savedBoids.filter(b => b.boid !== boidObj.boid));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleCheckSingle = async () => {
    if (!selectedCompany || !boid || boid.length !== 16) {
      setError('Please select a company and enter a valid 16-digit BOID');
      return;
    }

    setCheckingSingle(true);
    setSingleResult(null);
    setError(null);

    try {
      const response = await fetch('/api/check-ipo-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyShareId: selectedCompany, boid })
      });
      
      const data = await response.json();
      if (data.success) {
        setSingleResult(data);
      } else {
        setError(data.message || 'Failed to check result');
      }
    } catch (err) {
      console.error('Check failed:', err);
      setError('Connection error. Please try again.');
    } finally {
      setCheckingSingle(false);
    }
  };

  const handleCheckBulk = async () => {
    if (!selectedCompany || savedBoids.length === 0) {
      setError('Please select a company and ensure you have saved BOIDs');
      return;
    }

    if (savedBoids.length > 10) {
      setError('Bulk check is limited to 10 BOIDs at a time for safety.');
      return;
    }

    setCheckingBulk(true);
    setBulkResults([]);
    setBulkProgress(0);
    setError(null);

    try {
      const response = await fetch('/api/check-bulk-ipo-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyShareId: selectedCompany, 
          boids: savedBoids.map(b => b.boid) 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Map results back to names
        const resultsWithNames = data.results.map(res => {
          const boidData = savedBoids.find(b => b.boid === res.boid);
          return { ...res, name: boidData ? boidData.name : 'Unknown' };
        });
        setBulkResults(resultsWithNames);
      } else {
        setError(data.message || 'Failed to check bulk results');
      }
    } catch (err) {
      console.error('Bulk check failed:', err);
      setError('Connection error during bulk check.');
    } finally {
      setCheckingBulk(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-8">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-12 h-12 text-indigo-500" />
        </div>
        <h2 className={cn("text-4xl font-black", isDark ? "text-white" : "text-slate-900")}>Login Required</h2>
        <p className={cn("text-xl max-w-lg mx-auto", isDark ? "text-slate-400" : "text-slate-600")}>
          To ensure safe and controlled access to CDSC data, you must be logged in to check IPO results.
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
          className="btn-gold px-10 py-5 text-lg"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className={cn("text-4xl md:text-5xl font-black", isDark ? "text-white" : "text-slate-900")}>
          IPO Result Checker
        </h1>
        <p className={cn("text-lg", isDark ? "text-slate-400" : "text-slate-600")}>
          Check your NEPSE IPO allotment status safely and efficiently.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center p-1.5 bg-slate-200 dark:bg-navy-900 rounded-2xl max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('single')}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'single' 
              ? (isDark ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-indigo-600 shadow-sm")
              : (isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900")
          )}
        >
          <User className="w-4 h-4" /> Single Check
        </button>
        <button 
          onClick={() => setActiveTab('bulk')}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'bulk' 
              ? (isDark ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-indigo-600 shadow-sm")
              : (isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900")
          )}
        >
          <Users className="w-4 h-4" /> Bulk Check
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Form Area */}
        <div className={cn(
          "space-y-8",
          activeTab === 'single' ? "lg:col-span-3 max-w-4xl mx-auto w-full" : "lg:col-span-2"
        )}>
          <div className={cn(
            "p-8 rounded-[2.5rem] border shadow-2xl",
            isDark ? "glass border-white/10" : "bg-white border-slate-200"
          )}>
            <div className="space-y-8">
              {/* Company Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Company</label>
                  <button 
                    onClick={fetchCompanies}
                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh List
                  </button>
                </div>
                <select 
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className={cn(
                    "w-full p-5 rounded-2xl border font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all",
                    isDark ? "bg-navy-900 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  )}
                >
                  <option value="">Choose an IPO (Result Available)...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.companyId}>{c.name}</option>
                  ))}
                </select>
              </div>

              {activeTab === 'single' ? (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">BOID (16 Digits)</label>
                    <input 
                      type="text"
                      maxLength={16}
                      value={boid}
                      onChange={(e) => setBoid(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter your 16-digit BOID"
                      className={cn(
                        "w-full p-5 rounded-2xl border font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      )}
                    />
                  </div>

                  <button 
                    onClick={handleCheckSingle}
                    disabled={checkingSingle || !selectedCompany || boid.length !== 16}
                    className="w-full btn-gold py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {checkingSingle ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                    Check Result
                  </button>

                  {singleResult && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "p-8 rounded-3xl border text-center space-y-4",
                        singleResult.status === 'Allotted' 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          : "bg-red-500/10 border-red-500/30 text-red-500"
                      )}
                    >
                      {singleResult.status === 'Allotted' ? (
                        <CheckCircle2 className="w-16 h-16 mx-auto" />
                      ) : (
                        <XCircle className="w-16 h-16 mx-auto" />
                      )}
                      <h3 className="text-3xl font-black">{singleResult.status}!</h3>
                      <p className="text-lg opacity-80">
                        {singleResult.status === 'Allotted' 
                          ? `Congratulations! You have been allotted ${singleResult.units} units.`
                          : singleResult.message || "Better luck next time."}
                      </p>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="text-indigo-500 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>Bulk Checking Enabled</h4>
                      <p className="text-sm text-slate-500">Checking results for {savedBoids.length} saved BOIDs. We process them one by one to ensure safety.</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckBulk}
                    disabled={checkingBulk || !selectedCompany || savedBoids.length === 0}
                    className="w-full btn-gold py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {checkingBulk ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                    Check Bulk Results
                  </button>

                  {checkingBulk && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                        <span>Checking results one by one...</span>
                        <span>{Math.round(bulkProgress)}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-navy-900 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-indigo-500"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: savedBoids.length * 2.5, ease: "linear" }}
                          onUpdate={(latest) => {
                            if (typeof latest.width === 'string') {
                              setBulkProgress(parseFloat(latest.width));
                            }
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-center text-slate-500 font-medium">
                        Processing queue safely to avoid CDSC server overload.
                      </p>
                    </div>
                  )}

                  {bulkResults.length > 0 && (
                    <div className="overflow-x-auto rounded-3xl border border-white/10">
                      <table className="w-full text-left">
                        <thead className={isDark ? "bg-white/5" : "bg-slate-50"}>
                          <tr>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Name</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">BOID</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase">Units</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {bulkResults.map((res, i) => (
                            <tr key={i} className={isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}>
                              <td className="px-6 py-4 font-bold">{res.name}</td>
                              <td className="px-6 py-4 font-mono text-sm">{res.boid}</td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                                  res.status === 'Allotted' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                                )}>
                                  {res.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold">{res.units}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Saved BOIDs (Only for Bulk Tab) */}
        {activeTab === 'bulk' && (
          <div className="space-y-8">
            <div className={cn(
              "p-8 rounded-[2.5rem] border shadow-xl",
              isDark ? "glass border-white/10" : "bg-white border-slate-200"
            )}>
              <div className="flex items-center justify-between mb-8">
                <h3 className={cn("text-xl font-black", isDark ? "text-white" : "text-slate-900")}>Saved BOIDs</h3>
                <span className="bg-indigo-500/10 text-indigo-500 text-xs font-black px-3 py-1 rounded-full">
                  {savedBoids.length} Accounts
                </span>
              </div>

              <div className="space-y-4">
                {!isAddingBoid ? (
                  <button 
                    onClick={() => setIsAddingBoid(true)}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-indigo-500/30 text-indigo-500 font-bold flex items-center justify-center gap-2 hover:bg-indigo-500/5 transition-all group"
                  >
                    <motion.div
                      animate={{ rotate: 0 }}
                      whileHover={{ rotate: 90 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Plus className="w-5 h-5" />
                    </motion.div>
                    Add New BOID
                  </button>
                ) : (
                  <div className="space-y-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                    <input 
                      type="text"
                      value={newBoidName}
                      onChange={(e) => setNewBoidName(e.target.value)}
                      placeholder="Account Name (e.g. My Account)"
                      className={cn(
                        "w-full p-4 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      )}
                    />
                    <input 
                      type="text"
                      maxLength={16}
                      value={newBoid}
                      onChange={(e) => setNewBoid(e.target.value.replace(/\D/g, ''))}
                      placeholder="16-digit BOID"
                      className={cn(
                        "w-full p-4 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      )}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleAddBoid}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button 
                        onClick={() => {
                          setIsAddingBoid(false);
                          setError(null);
                        }}
                        className="px-4 py-3 bg-slate-200 dark:bg-navy-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-navy-700 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {savedBoids.length === 0 ? (
                    <div className="text-center py-8 space-y-3">
                      <Database className="w-12 h-12 text-slate-500/20 mx-auto" />
                      <p className="text-xs text-slate-500 font-bold uppercase">No BOIDs saved yet</p>
                    </div>
                  ) : (
                    savedBoids.map((b, i) => (
                      <div key={i} className={cn(
                        "flex items-center justify-between p-4 rounded-xl border group transition-all",
                        isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      )}>
                        <div className="flex flex-col">
                          <span className={cn("font-bold text-sm", isDark ? "text-white" : "text-slate-900")}>{b.name}</span>
                          <span className="font-mono text-[10px] text-slate-500">{b.boid}</span>
                        </div>
                        <button 
                          onClick={() => handleRemoveBoid(b)}
                          className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Safety Info */}
            <div className={cn(
              "p-8 rounded-[2.5rem] border bg-emerald-500/5 border-emerald-500/20"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-emerald-500 w-6 h-6" />
                <h4 className="font-black text-emerald-500 uppercase tracking-widest text-sm">Safe Check</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our system uses a controlled backend queue to check results. This prevents overloading CDSC servers and ensures your IP remains safe. Bulk requests are processed with a 2.5s delay per account.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
