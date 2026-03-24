import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  Save, 
  AlertCircle,
  Database,
  Clock,
  Calculator,
  RefreshCw,
  Loader2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { SECTORS, DUMMY_IPOS } from '../constants';
import { cn } from '../cn';
import { 
  firestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  handleFirestoreError,
  OperationType 
} from '../firebase';

export const AdminDashboard = ({ lang, ipos, setIpos, countdownData, setCountdownData, isDark, liveOversubscription = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverSubModalOpen, setIsOverSubModalOpen] = useState(false);
  const [isIpoResultModalOpen, setIsIpoResultModalOpen] = useState(false);
  const [editingIpo, setEditingIpo] = useState(null);
  const [editingOverSub, setEditingOverSub] = useState(null);
  const [editingIpoResult, setEditingIpoResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [overSubSearchQuery, setOverSubSearchQuery] = useState('');
  const [ipoResultSearchQuery, setIpoResultSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [overSubData, setOverSubData] = useState([]);
  const [ipoResultsListData, setIpoResultsListData] = useState([]);
  const [liveOverSubData, setLiveOverSubData] = useState(liveOversubscription);
  const [isFetchingLive, setIsFetchingLive] = useState(false);

  useEffect(() => {
    const overSubCollection = collection(firestore, 'oversubscription');
    const unsubscribeOverSub = onSnapshot(overSubCollection, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOverSubData(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'oversubscription');
    });

    const ipoResultsCollection = collection(firestore, 'ipo_results_list');
    const unsubscribeIpoResults = onSnapshot(ipoResultsCollection, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIpoResultsListData(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ipo_results_list');
    });

    fetchLiveOversubscription();
    return () => {
      unsubscribeOverSub();
      unsubscribeIpoResults();
    };
  }, []);

  const fetchLiveOversubscription = async () => {
    setIsFetchingLive(true);
    try {
      const response = await fetch('/api/ipo-list');
      console.log("Response from /api/ipo-list (Admin):", response);
      if (response.ok) {
        const result = await response.json();
        console.log("Data from /api/ipo-list (Admin):", result);
        if (result.success) {
          setLiveOverSubData(result.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live oversubscription:", err);
    } finally {
      setIsFetchingLive(false);
    }
  };

  const [countdownForm, setCountdownForm] = useState({
    company: countdownData.company,
    targetDate: countdownData.targetDate.split('T')[0] + 'T' + countdownData.targetDate.split('T')[1].substring(0, 5)
  });

  const [formData, setFormData] = useState({
    name: '',
    nameNP: '',
    sector: 'Commercial Bank',
    type: 'IPO',
    category: 'General Public',
    issuedUnits: 0,
    price: 100,
    openDate: '',
    closeDate: ''
  });

  const [overSubFormData, setOverSubFormData] = useState({
    name: '',
    issuedUnits: 0,
    appliedUnits: 0,
    lastUpdated: new Date().toISOString()
  });

  const [ipoResultFormData, setIpoResultFormData] = useState({
    name: '',
    companyId: '',
    status: 'result_published'
  });

  // Sync countdown form when data changes from Firebase
  useEffect(() => {
    if (countdownData) {
      setCountdownForm({
        company: countdownData.company,
        targetDate: countdownData.targetDate.split('T')[0] + 'T' + countdownData.targetDate.split('T')[1].substring(0, 5)
      });
    }
  }, [countdownData]);

  const handleUpdateCountdown = (e) => {
    e.preventDefault();
    const newCountdown = {
      company: countdownForm.company,
      targetDate: new Date(countdownForm.targetDate).toISOString()
    };
    
    const countdownDoc = doc(firestore, 'countdown', 'main');
    setDoc(countdownDoc, newCountdown)
      .then(() => {
        alert('Countdown updated in Firebase successfully!');
      })
      .catch(err => {
        handleFirestoreError(err, OperationType.WRITE, 'countdown/main');
      });
  };

  const [isFetchingCDSC, setIsFetchingCDSC] = useState(false);
  const [isFetchingCDSCResults, setIsFetchingCDSCResults] = useState(false);

  const fetchFromCDSC = async () => {
    setIsFetchingCDSC(true);
    setError(null);
    try {
      const response = await fetch('/api/ipo-list');
      if (!response.ok) throw new Error('Failed to fetch from CDSC');
      const result = await response.json();
      
      if (result.success && result.data) {
        const companies = result.data;
        
        if (window.confirm(`Found ${companies.length} active IPOs from CDSC. Would you like to sync them to your live oversubscription list?`)) {
          const overSubCollection = collection(firestore, 'oversubscription');
          
          for (const company of companies) {
            // Check if already exists in our list
            const exists = overSubData.find(item => item.name === company.name);
            if (exists) {
              // Update existing
              const itemDoc = doc(firestore, 'oversubscription', exists.id);
              await updateDoc(itemDoc, {
                issuedUnits: company.issuedUnits,
                appliedUnits: company.appliedUnits,
                oversubscription: company.oversubscription,
                lastUpdated: new Date().toISOString()
              });
            } else {
              // Add new
              await addDoc(overSubCollection, {
                name: company.name,
                issuedUnits: company.issuedUnits,
                appliedUnits: company.appliedUnits,
                oversubscription: company.oversubscription,
                lastUpdated: new Date().toISOString()
              });
            }
          }
          alert('CDSC IPO data synced successfully!');
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data from CDSC. The API might be down or blocked.");
    } finally {
      setIsFetchingCDSC(false);
    }
  };

  const fetchCDSCResults = async () => {
    setIsFetchingCDSCResults(true);
    setError(null);
    try {
      const response = await fetch('/api/get-ipo-result-list');
      if (!response.ok) throw new Error('Failed to fetch from CDSC');
      const result = await response.json();
      
      if (result.success && result.data) {
        const companies = result.data;
        
        if (window.confirm(`Found ${companies.length} companies with published results from CDSC. Would you like to sync them to your IPO Results list in Firestore?`)) {
          const ipoResultsCollection = collection(firestore, 'ipo_results_list');
          
          let addedCount = 0;
          for (const company of companies) {
            // Check if already exists
            const exists = ipoResultsListData.find(item => item.companyId === String(company.companyId));
            if (!exists) {
              // Add new
              await addDoc(ipoResultsCollection, {
                name: company.name,
                companyId: String(company.companyId),
                status: 'result_published'
              });
              addedCount++;
            }
          }
          alert(`Sync complete! Added ${addedCount} new companies to your list.`);
        }
      } else {
        throw new Error(result.message || 'No data found');
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch results list from CDSC: " + err.message);
    } finally {
      setIsFetchingCDSCResults(false);
    }
  };

  const handleOpenModal = (ipo) => {
    if (ipo) {
      setEditingIpo(ipo);
      setFormData(ipo);
    } else {
      setEditingIpo(null);
      setFormData({
        name: '',
        nameNP: '',
        sector: 'Commercial Bank',
        type: 'IPO',
        category: 'General Public',
        issuedUnits: 0,
        price: 100,
        openDate: '',
        closeDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (editingIpo) {
        // Update existing IPO in Firebase
        const ipoDoc = doc(firestore, 'ipos', editingIpo.id);
        await setDoc(ipoDoc, formData);
        setIsModalOpen(false);
      } else {
        // Add new IPO to Firebase
        const iposCollection = collection(firestore, 'ipos');
        await addDoc(iposCollection, formData);
        setIsModalOpen(false);
      }
    } catch (err) {
      handleFirestoreError(err, editingIpo ? OperationType.UPDATE : OperationType.CREATE, 'ipos');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this IPO?')) return;
    
    try {
      const ipoDoc = doc(firestore, 'ipos', id);
      await deleteDoc(ipoDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `ipos/${id}`);
    }
  };

  const handleOpenOverSubModal = (data) => {
    if (data) {
      setEditingOverSub(data);
      setOverSubFormData(data);
    } else {
      setEditingOverSub(null);
      setOverSubFormData({
        name: '',
        issuedUnits: 0,
        appliedUnits: 0,
        lastUpdated: new Date().toISOString()
      });
    }
    setIsOverSubModalOpen(true);
  };

  const handleOverSubSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...overSubFormData,
      lastUpdated: new Date().toISOString()
    };
    
    if (editingOverSub) {
      const overSubDoc = doc(firestore, 'oversubscription', editingOverSub.id);
      setDoc(overSubDoc, dataToSave)
        .then(() => setIsOverSubModalOpen(false))
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `oversubscription/${editingOverSub.id}`));
    } else {
      const overSubCollection = collection(firestore, 'oversubscription');
      addDoc(overSubCollection, dataToSave)
        .then(() => setIsOverSubModalOpen(false))
        .catch(err => handleFirestoreError(err, OperationType.CREATE, 'oversubscription'));
    }
  };

  const handleOverSubDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this oversubscription data?')) return;
    try {
      const overSubDoc = doc(firestore, 'oversubscription', id);
      await deleteDoc(overSubDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `oversubscription/${id}`);
    }
  };

  const handleOpenIpoResultModal = (data) => {
    if (data) {
      setEditingIpoResult(data);
      setIpoResultFormData(data);
    } else {
      setEditingIpoResult(null);
      setIpoResultFormData({
        name: '',
        companyId: '',
        status: 'result_published'
      });
    }
    setIsIpoResultModalOpen(true);
  };

  const handleIpoResultSubmit = (e) => {
    e.preventDefault();
    if (editingIpoResult) {
      const ipoResultDoc = doc(firestore, 'ipo_results_list', editingIpoResult.id);
      setDoc(ipoResultDoc, ipoResultFormData)
        .then(() => setIsIpoResultModalOpen(false))
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `ipo_results_list/${editingIpoResult.id}`));
    } else {
      const ipoResultsCollection = collection(firestore, 'ipo_results_list');
      addDoc(ipoResultsCollection, ipoResultFormData)
        .then(() => setIsIpoResultModalOpen(false))
        .catch(err => handleFirestoreError(err, OperationType.CREATE, 'ipo_results_list'));
    }
  };

  const handleIpoResultDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this IPO result entry?')) return;
    try {
      const ipoResultDoc = doc(firestore, 'ipo_results_list', id);
      await deleteDoc(ipoResultDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `ipo_results_list/${id}`);
    }
  };

  const filteredIpos = ipos.filter(ipo => 
    ipo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ipo.nameNP.includes(searchQuery)
  );

  const filteredOverSub = overSubData.filter(item => 
    item.name.toLowerCase().includes(overSubSearchQuery.toLowerCase())
  );

  const filteredIpoResults = ipoResultsListData.filter(item => 
    item.name.toLowerCase().includes(ipoResultSearchQuery.toLowerCase()) ||
    item.companyId.toLowerCase().includes(ipoResultSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className={cn("text-4xl font-black mb-2 flex items-center gap-3", isDark ? "text-white" : "text-slate-900")}>
            <Database className="text-emerald-500" /> Admin Panel
          </h1>
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>Manage IPO data and site content (Synced with Firebase).</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => {
              if (window.confirm('This will overwrite existing Firebase IPO data with dummy data. Continue?')) {
                const iposCollection = collection(firestore, 'ipos');
                DUMMY_IPOS.forEach(async (ipo) => {
                  const { id, ...rest } = ipo;
                  await addDoc(iposCollection, rest);
                });
                alert('Dummy data seeding started!');
              }
            }}
            className={cn(
              "px-8 py-4 rounded-xl font-bold border transition-all min-w-[200px]",
              isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900"
            )}
          >
            Seed Dummy Data
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-gold px-8 py-4 flex items-center justify-center gap-2 min-w-[200px]"
          >
            <Plus className="w-5 h-5" /> Add New IPO
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mb-8 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Countdown Management */}
      <div className={cn(
        "glass rounded-[2.5rem] border p-8 mb-12",
        isDark ? "border-white/10" : "border-slate-200 bg-white/50"
      )}>
        <h2 className={cn("text-2xl font-bold mb-6 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
          <Clock className="text-emerald-500" /> Manage Home Page Countdown
        </h2>
        <form onSubmit={handleUpdateCountdown} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
            <input 
              type="text"
              value={countdownForm.company}
              onChange={(e) => setCountdownForm({...countdownForm, company: e.target.value})}
              className={cn(
                "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              )}
              placeholder="e.g. Sarbottam Cement"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Target Date & Time</label>
            <input 
              type="datetime-local"
              value={countdownForm.targetDate}
              onChange={(e) => setCountdownForm({...countdownForm, targetDate: e.target.value})}
              className={cn(
                "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              )}
            />
          </div>
          <button type="submit" className="btn-gold py-4 px-8 font-bold">
            Update Countdown
          </button>
        </form>
      </div>

      {/* Live Oversubscription Monitor */}
      <div className={cn(
        "glass rounded-[2.5rem] border p-8 mb-12 relative overflow-hidden",
        isDark ? "border-white/10" : "border-slate-200 bg-white/50"
      )}>
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingUp className="w-32 h-32" />
        </div>
        <div className="flex items-center justify-between mb-8 relative">
          <div>
            <h2 className={cn("text-2xl font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
              <TrendingUp className="text-emerald-500" /> Live Oversubscription Monitor
            </h2>
            <p className="text-sm text-slate-500">Real-time data scraped from CDSC ipolist</p>
          </div>
          <button 
            onClick={fetchLiveOversubscription}
            disabled={isFetchingLive}
            className={cn(
              "p-3 rounded-xl transition-all",
              isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"
            )}
          >
            <RefreshCw className={cn("w-5 h-5", isFetchingLive && "animate-spin")} />
          </button>
        </div>

        {isFetchingLive && liveOverSubData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-slate-500 font-medium">Fetching live data from CDSC...</p>
          </div>
        ) : liveOverSubData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveOverSubData.map((ipo) => (
              <div key={ipo.id} className={cn(
                "p-6 rounded-2xl border relative group transition-all",
                isDark ? "bg-navy-900/50 border-white/10 hover:border-emerald-500/30" : "bg-white border-slate-200 hover:border-emerald-500/30 shadow-sm"
              )}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className={cn("font-bold text-lg leading-tight", isDark ? "text-white" : "text-slate-900")}>
                    {ipo.name}
                  </h3>
                  <span className="bg-emerald-500/10 text-emerald-500 text-xs font-black px-2 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                    {ipo.oversubscription} Oversubscribed
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Issued Units</span>
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>{ipo.issuedUnits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Applied Units</span>
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>{ipo.appliedUnits.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((parseFloat(ipo.oversubscription) / 20) * 100, 100)}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const exists = overSubData.some(item => item.name === ipo.name);
                    if (exists) {
                      const existing = overSubData.find(item => item.name === ipo.name);
                      const overSubDoc = doc(firestore, 'oversubscription', existing.id);
                      updateDoc(overSubDoc, {
                        appliedUnits: ipo.appliedUnits,
                        issuedUnits: ipo.issuedUnits,
                        lastUpdated: new Date().toISOString()
                      }).then(() => alert('Updated in database!'));
                    } else {
                      const overSubCollection = collection(firestore, 'oversubscription');
                      addDoc(overSubCollection, {
                        name: ipo.name,
                        issuedUnits: ipo.issuedUnits,
                        appliedUnits: ipo.appliedUnits,
                        lastUpdated: new Date().toISOString()
                      }).then(() => alert('Added to database!'));
                    }
                  }}
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-emerald-500 text-white rounded-lg shadow-lg"
                  title="Sync to Database"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No active IPOs found on CDSC ipolist.</p>
          </div>
        )}
      </div>

      {/* Oversubscription Management */}
      <div className={cn(
        "glass rounded-[2.5rem] border p-8 mb-12",
        isDark ? "border-white/10" : "border-slate-200 bg-white/50"
      )}>
        <div className="flex items-center justify-between mb-8">
          <h2 className={cn("text-2xl font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
            <Calculator className="text-indigo-500" /> Manage Oversubscription Data
          </h2>
          <div className="flex gap-4">
            <button 
              onClick={fetchFromCDSC}
              disabled={isFetchingCDSC}
              className={cn(
                "px-6 py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 min-w-[180px]",
                isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900"
              )}
            >
              {isFetchingCDSC ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
              Fetch from CDSC
            </button>
            <button 
              onClick={() => handleOpenOverSubModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 min-w-[180px]"
            >
              <Plus className="w-5 h-5" /> Add Data
            </button>
          </div>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search oversubscription data..."
            value={overSubSearchQuery}
            onChange={(e) => setOverSubSearchQuery(e.target.value)}
            className={cn(
              "w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all",
              isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            )}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={cn("border-b", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Company</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Issued Units</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Applied Units</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ratio</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-slate-100")}>
              {filteredOverSub.map((item) => (
                <tr key={item.id} className={cn("transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.issuedUnits.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.appliedUnits.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-indigo-500">{(item.appliedUnits / item.issuedUnits).toFixed(2)}x</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenOverSubModal(item)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          isDark ? "bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-500" : "bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600"
                        )}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOverSubDelete(item.id)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          isDark ? "bg-white/5 hover:bg-red-500/20 hover:text-red-500" : "bg-slate-100 hover:bg-red-100 hover:text-red-600"
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IPO Results List Management */}
      <div className={cn(
        "glass rounded-[2.5rem] border p-8 mb-12",
        isDark ? "border-white/10" : "border-slate-200 bg-white/50"
      )}>
        <div className="flex items-center justify-between mb-8">
          <h2 className={cn("text-2xl font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
            <CheckCircle2 className="text-emerald-500" /> Manage IPO Results List
          </h2>
          <div className="flex gap-4">
            <button 
              onClick={fetchCDSCResults}
              disabled={isFetchingCDSCResults}
              className={cn(
                "px-6 py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 min-w-[180px]",
                isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900"
              )}
            >
              {isFetchingCDSCResults ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              Sync with CDSC Results
            </button>
            <button 
              onClick={() => handleOpenIpoResultModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 min-w-[180px]"
            >
              <Plus className="w-5 h-5" /> Add IPO Result
            </button>
          </div>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search IPO results list..."
            value={ipoResultSearchQuery}
            onChange={(e) => setIpoResultSearchQuery(e.target.value)}
            className={cn(
              "w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all",
              isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            )}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={cn("border-b", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Company Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Company ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-slate-100")}>
              {filteredIpoResults.map((item) => (
                <tr key={item.id} className={cn("transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-700 dark:text-slate-300">{item.companyId}</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-1 rounded-full uppercase">
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenIpoResultModal(item)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          isDark ? "bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500" : "bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600"
                        )}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleIpoResultDelete(item.id)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          isDark ? "bg-white/5 hover:bg-red-500/20 hover:text-red-500" : "bg-slate-100 hover:bg-red-100 hover:text-red-600"
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isOverSubModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOverSubModalOpen(false)}
              className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-md glass rounded-[2.5rem] border overflow-hidden shadow-2xl",
                isDark ? "border-white/10" : "border-slate-200 bg-white"
              )}
            >
              <div className={cn("p-8 border-b flex items-center justify-between", isDark ? "border-white/10" : "border-slate-100")}>
                <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>{editingOverSub ? 'Edit Data' : 'Add Data'}</h2>
                <button onClick={() => setIsOverSubModalOpen(false)} className={cn("p-2 rounded-xl transition-all", isDark ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900")}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleOverSubSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                  <input 
                    required
                    value={overSubFormData.name}
                    onChange={(e) => setOverSubFormData({...overSubFormData, name: e.target.value})}
                    className={cn(
                      "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                      isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Issued Units</label>
                  <input 
                    type="number"
                    required
                    value={overSubFormData.issuedUnits}
                    onChange={(e) => setOverSubFormData({...overSubFormData, issuedUnits: Number(e.target.value)})}
                    className={cn(
                      "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                      isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Applied Units</label>
                  <input 
                    type="number"
                    required
                    value={overSubFormData.appliedUnits}
                    onChange={(e) => setOverSubFormData({...overSubFormData, appliedUnits: Number(e.target.value)})}
                    className={cn(
                      "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                      isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Save Data
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IPO Result Modal */}
      <AnimatePresence>
        {isIpoResultModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsIpoResultModalOpen(false)}
              className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-md glass rounded-[2.5rem] border overflow-hidden shadow-2xl",
                isDark ? "border-white/10" : "border-slate-200 bg-white"
              )}
            >
              <div className={cn("p-8 border-b flex items-center justify-between", isDark ? "border-white/10" : "border-slate-100")}>
                <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>{editingIpoResult ? 'Edit IPO Result' : 'Add IPO Result'}</h2>
                <button onClick={() => setIsIpoResultModalOpen(false)} className={cn("p-2 rounded-xl transition-all", isDark ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900")}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleIpoResultSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                  <input 
                    required
                    value={ipoResultFormData.name}
                    onChange={(e) => setIpoResultFormData({...ipoResultFormData, name: e.target.value})}
                    className={cn(
                      "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                      isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Company ID (from CDSC)</label>
                  <input 
                    required
                    value={ipoResultFormData.companyId}
                    onChange={(e) => setIpoResultFormData({...ipoResultFormData, companyId: e.target.value})}
                    className={cn(
                      "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono",
                      isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select 
                    value={ipoResultFormData.status}
                    onChange={(e) => setIpoResultFormData({...ipoResultFormData, status: e.target.value})}
                    className={cn(
                      "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                      isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                  >
                    <option value="result_published">Result Published</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Save Result Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all",
              isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            )}
          />
        </div>
        <div className={cn(
          "border rounded-2xl p-4 flex items-center justify-between",
          isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
        )}>
          <span className="text-slate-500 font-bold text-xs uppercase">Total IPOs</span>
          <span className="text-2xl font-black text-emerald-500">{ipos.length}</span>
        </div>
      </div>

      {/* IPO List */}
      <div className={cn(
        "glass rounded-[2.5rem] border overflow-hidden",
        isDark ? "border-white/10" : "border-slate-200 bg-white/50 shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={cn("border-b", isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Company</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Dates</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-slate-100")}>
              {filteredIpos.map((ipo) => (
                <tr key={ipo.id} className={cn("transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-slate-50")}>
                  <td className="px-6 py-4">
                    <div className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>{ipo.name}</div>
                    <div className="text-xs text-slate-500">{ipo.sector}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded border",
                      isDark ? "bg-navy-900 text-gold-400 border-gold-500/30" : "bg-slate-50 text-gold-600 border-gold-500/30"
                    )}>
                      {ipo.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded border",
                      isDark ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-700"
                    )}>
                      {ipo.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-500">NPR {ipo.price}</td>
                  <td className="px-6 py-4">
                    <div className={cn("text-xs font-medium", isDark ? "text-slate-300" : "text-slate-700")}>{ipo.openDate}</div>
                    <div className="text-[10px] text-slate-500">to {ipo.closeDate}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(ipo)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          isDark ? "bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500" : "bg-slate-100 hover:bg-emerald-100 hover:text-emerald-600"
                        )}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(ipo.id)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          isDark ? "bg-white/5 hover:bg-red-500/20 hover:text-red-500" : "bg-slate-100 hover:bg-red-100 hover:text-red-600"
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl glass rounded-[2.5rem] border overflow-hidden shadow-2xl",
                isDark ? "border-white/10" : "border-slate-200 bg-white"
              )}
            >
              <div className={cn("p-8 border-b flex items-center justify-between", isDark ? "border-white/10" : "border-slate-100")}>
                <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>{editingIpo ? 'Edit IPO' : 'Add New IPO'}</h2>
                <button onClick={() => setIsModalOpen(false)} className={cn("p-2 rounded-xl transition-all", isDark ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900")}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Live IPO Selection */}
                <div className="space-y-2 mb-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <label className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={14} /> Auto-fill from Live CDSC Data
                  </label>
                  <select 
                    className={cn(
                      "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold",
                      isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                    onChange={(e) => {
                      const selected = liveOverSubData.find(item => item.id === e.target.value);
                      if (selected) {
                        setFormData({
                          ...formData,
                          name: selected.name,
                          issuedUnits: selected.issuedUnits,
                          category: 'General Public'
                        });
                      }
                    }}
                  >
                    <option value="">-- Select Live IPO to Auto-fill --</option>
                    {liveOverSubData.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 font-medium italic">Selecting an IPO will automatically fill the name and issued units.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Company Name (EN)</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={cn(
                        "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Company Name (NP)</label>
                    <input 
                      required
                      value={formData.nameNP}
                      onChange={(e) => setFormData({...formData, nameNP: e.target.value})}
                      className={cn(
                        "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Sector</label>
                    <select 
                      value={formData.sector}
                      onChange={(e) => setFormData({...formData, sector: e.target.value})}
                      className={cn(
                        "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    >
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className={cn(
                        "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    >
                      <option value="IPO">IPO</option>
                      <option value="FPO">FPO</option>
                      <option value="Rights">Rights</option>
                      <option value="Debenture">Debenture</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className={cn(
                        "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    >
                      <option value="General Public">General Public</option>
                      <option value="Locals">Locals</option>
                      <option value="Foreign Employment">Foreign Employment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Issued Units</label>
                    <input 
                      type="number"
                      required
                      value={formData.issuedUnits}
                      onChange={(e) => setFormData({...formData, issuedUnits: Number(e.target.value)})}
                      className={cn(
                        "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Issue Price (NPR)</label>
                    <input 
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className={cn(
                        "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Open Date</label>
                    <input 
                      type="date"
                      required
                      value={formData.openDate}
                      onChange={(e) => setFormData({...formData, openDate: e.target.value})}
                      className={cn(
                        "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Close Date</label>
                    <input 
                      type="date"
                      required
                      value={formData.closeDate}
                      onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
                      className={cn(
                        "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" className="btn-gold w-full py-4 text-lg flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> {editingIpo ? 'Update IPO' : 'Save IPO'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
