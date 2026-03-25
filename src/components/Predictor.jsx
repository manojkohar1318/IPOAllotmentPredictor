import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Users,
  Calculator,
  Share2,
  Download,
  Loader2,
  Facebook,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ARTICLES } from '../lib/articles';
import { TRANSLATIONS } from '../constants';
import { cn } from '../cn';
import ReactConfetti from 'react-confetti';
import html2canvas from 'html2canvas';
import { 
  firestore, 
  auth,
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  increment,
  handleFirestoreError,
  OperationType 
} from '../firebase';
import { FUNNY_COMMENTS } from '../utils/comments';

export const Predictor = ({ lang, ipos, liveIpos = [], isDark, setCurrentPage, setCurrentSlug }) => {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const resultRef = useRef(null);
  
  // Combine Firebase IPOs with Live CDSC IPOs
  const combinedIpos = [
    ...liveIpos.map(ipo => ({
      id: `live-${ipo.id}`,
      name: ipo.name,
      nameNP: ipo.name,
      category: 'Live IPO',
      sector: 'Various',
      oversubscription: ipo.oversubscription,
      issuedUnits: ipo.issuedUnits,
      isLive: true
    })),
    ...ipos.filter(ipo => !liveIpos.some(live => live.name.toLowerCase().includes(ipo.name.toLowerCase())))
  ];

  // Form State
  const [selectedIpoId, setSelectedIpoId] = useState('');
  const [oversubscription, setOversubscription] = useState('');
  const [accounts, setAccounts] = useState('1');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [kitta, setKitta] = useState('10');
  
  const [result, setResult] = useState(null);
  const t = TRANSLATIONS[lang];

  const selectedIpo = combinedIpos.find(ipo => ipo.id === selectedIpoId);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('predictor_form');
    if (saved) {
      const data = JSON.parse(saved);
      setAccounts(data.accounts || '1');
      setKitta(data.kitta || '10');
      setIsFirstTime(data.isFirstTime || false);
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('predictor_form', JSON.stringify({ accounts, kitta, isFirstTime }));
  }, [accounts, kitta, isFirstTime]);

  const handleAutoFill = async () => {
    if (!selectedIpo) return;
    setIsAutoFilling(true);
    try {
      let data = [];
      
      // Try our new robust IPO list API first
      const liveResponse = await fetch('/api/ipo-list');
      console.log("Response from /api/ipo-list (AutoFill):", liveResponse);
      if (liveResponse.ok) {
        const result = await liveResponse.json();
        console.log("Data from /api/ipo-list (AutoFill):", result);
        if (result.success) {
          data = result.data;
        }
      }
      
      // If live scraper returned nothing, try Firebase
      if (data.length === 0) {
        try {
          const overSubCollection = collection(firestore, 'oversubscription');
          const snapshot = await getDocs(overSubCollection);
          data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'oversubscription');
        }
      }
      
      const companyData = data.find(c => c.name.toLowerCase().includes(selectedIpo.name.toLowerCase()));
      if (companyData) {
        const ratio = parseFloat(companyData.oversubscription).toFixed(2);
        setOversubscription(ratio);
      } else {
        alert('No oversubscription data found for this company.');
      }
    } catch (err) {
      console.error('Auto-fill failed:', err);
      alert('Could not fetch oversubscription data. Please enter manually.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Handle back button
  useEffect(() => {
    const handlePopState = (e) => {
      if (step === 'result') {
        setStep('form');
      }
    };

    if (step === 'result') {
      window.history.pushState({ step: 'result' }, '');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [step]);

  const handlePredict = () => {
    if (!selectedIpoId || !oversubscription) return;
    
    setLoading(true);
    
    // Simulate complex calculation
    setTimeout(() => {
      const oversub = parseFloat(oversubscription);
      const numAccounts = parseInt(accounts);
      
      // Basic probability logic: 1 / oversubscription per account
      const pPerAccount = Math.min(1, 1 / oversub);
      const totalProb = (1 - Math.pow(1 - pPerAccount, numAccounts)) * 100;
      
      let verdict = '';
      let color = '';
      let comment = '';
      
      const getRandomComment = (prob) => {
        const category = prob > 80 ? 'HIGH' : prob > 50 ? 'GOOD' : prob > 20 ? 'MOD' : 'LOW';
        const list = FUNNY_COMMENTS[lang][category];
        return list[Math.floor(Math.random() * list.length)];
      };

      if (totalProb > 80) {
        verdict = lang === 'EN' ? 'Extremely High Chance' : 'अत्यधिक उच्च सम्भावना';
        color = 'text-emerald-400';
        comment = getRandomComment(totalProb);
      } else if (totalProb > 50) {
        verdict = lang === 'EN' ? 'Good Chance' : 'राम्रो सम्भावना';
        color = 'text-emerald-500';
        comment = getRandomComment(totalProb);
      } else if (totalProb > 20) {
        verdict = lang === 'EN' ? 'Moderate Chance' : 'मध्यम सम्भावना';
        color = 'text-gold-400';
        comment = getRandomComment(totalProb);
      } else {
        verdict = lang === 'EN' ? 'Low Chance' : 'न्यून सम्भावना';
        color = 'text-red-400';
        comment = getRandomComment(totalProb);
      }

      setResult({
        probability: Math.round(totalProb * 100) / 100,
        verdict,
        color,
        comment,
        companyName: lang === 'EN' ? selectedIpo.name : selectedIpo.nameNP,
        breakdown: [
          { label: lang === 'EN' ? 'Per Account Odds' : 'प्रति खाता सम्भावना', value: `${(pPerAccount * 100).toFixed(2)}%` },
          { label: lang === 'EN' ? 'Total Accounts' : 'कुल खाता संख्या', value: accounts },
          { label: lang === 'EN' ? 'Issued Units' : 'कुल कित्ता', value: selectedIpo.issuedUnits ? selectedIpo.issuedUnits.toLocaleString() : 'N/A' }
        ]
      });

      // Firebase Integration
      try {
        const sentiment = oversub > 10 ? 'Bullish' : oversub > 5 ? 'Positive' : oversub > 2 ? 'Neutral' : 'Cautious';
        
        // A. Save prediction result
        const predictionsCollection = collection(firestore, 'predictions');
        addDoc(predictionsCollection, {
          companyName: selectedIpo.name,
          totalAccounts: numAccounts,
          perAccountOdds: (pPerAccount * 100).toFixed(2) + '%',
          marketSentiment: sentiment,
          timestamp: Date.now()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'predictions'));

        // B. Update stats
        const statsDoc = doc(firestore, 'stats', 'global');
        updateDoc(statsDoc, {
          totalPredictions: increment(1)
        }).catch((err) => {
          // If doc doesn't exist, create it
          setDoc(statsDoc, { totalPredictions: 1 }, { merge: true })
            .catch(setErr => handleFirestoreError(setErr, OperationType.WRITE, 'stats/global'));
        });

        const companyId = selectedIpo.name.replace(/\s+/g, '_').toLowerCase();
        const companyStatsDoc = doc(firestore, 'stats', 'companies', 'counts', companyId);
        setDoc(companyStatsDoc, {
          searchCount: increment(1)
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `stats/companies/counts/${companyId}`));
      } catch (fbError) {
        console.error('Firebase save failed:', fbError);
      }
      
      setLoading(false);
      setStep('result');
    }, 1500);
  };

  const generateCardCanvas = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1500;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Background Gradient (Dark Navy to Deep Purple)
    const bgGradient = ctx.createLinearGradient(0, 0, 1500, 1500);
    bgGradient.addColorStop(0, '#020617'); // navy-950
    bgGradient.addColorStop(1, '#1e1b4b'); // indigo-950
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1500, 1500);

    // Subtle glow effect
    const isHigh = result.probability > 50;
    const isMedium = result.probability > 20 && result.probability <= 50;
    const accentColor = isHigh ? '#10b981' : isMedium ? '#facc15' : '#ef4444';
    
    ctx.globalAlpha = 0.2;
    const glow = ctx.createRadialGradient(750, 750, 0, 750, 750, 800);
    glow.addColorStop(0, accentColor);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1500, 1500);
    ctx.globalAlpha = 1.0;

    // 2. Main Card Container (Glassmorphism style)
    const cardPadding = 100;
    const cardX = cardPadding;
    const cardY = cardPadding;
    const cardWidth = 1500 - (cardPadding * 2);
    const cardHeight = 1500 - (cardPadding * 2);
    const cardRadius = 60;

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 20;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // slate-900
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.fill();

    // Border for glass effect
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Content - Dynamic Layout Calculations
    ctx.textAlign = 'center';
    const centerX = 750;
    const internalPadding = 100;
    const safeWidth = cardWidth - (internalPadding * 2);
    
    let currentY = cardY + internalPadding;

    // Helper for wrapping text
    const wrapText = (text, maxWidth, font) => {
      ctx.font = font;
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // 1. Small top label: "Prediction Result for [Company]"
    const badgeText = `PREDICTION RESULT FOR ${result.companyName.toUpperCase()}`;
    ctx.font = 'bold 22px sans-serif';
    const badgeWidth = ctx.measureText(badgeText).width + 60;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(centerX - badgeWidth / 2, currentY, badgeWidth, 60, 30);
    ctx.fill();
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.fillText(badgeText, centerX, currentY + 38);
    currentY += 100;

    // 2. Section title: "Your Allotment Probability"
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(lang === 'EN' ? 'Your Allotment Probability' : 'तपाईको बाँडफाँडको सम्भावना', centerX, currentY);
    currentY += 80;

    // 3. Company Name (Dynamic Wrapping & Scaling)
    ctx.fillStyle = accentColor;
    let baseFontSize = 90;
    let companyLines = wrapText(result.companyName.toUpperCase(), safeWidth, `900 ${baseFontSize}px sans-serif`);
    
    if (companyLines.length > 2) {
      baseFontSize = 70;
      companyLines = wrapText(result.companyName.toUpperCase(), safeWidth, `900 ${baseFontSize}px sans-serif`);
    }
    
    companyLines.forEach(line => {
      ctx.fillText(line, centerX, currentY);
      currentY += baseFontSize + 15;
    });
    currentY += 20;

    // 4. Percentage (MOST IMPORTANT ELEMENT)
    // Dynamic scaling: roughly 14% of canvas width (210px)
    ctx.fillStyle = accentColor;
    const probFontSize = Math.floor(canvas.width * 0.14); 
    ctx.font = `900 ${probFontSize}px sans-serif`;
    currentY += 20; // Reduced breathing space from company name
    ctx.fillText(`${result.probability}%`, centerX, currentY + (probFontSize * 0.75));
    currentY += probFontSize + 40; // Spacing after percentage

    // 5. Chance Label
    const chanceFontSize = 70;
    ctx.font = `900 ${chanceFontSize}px sans-serif`;
    ctx.fillText(result.verdict.toUpperCase(), centerX, currentY);
    currentY += 80;

    // 6. Motivational Quote (Wrapped)
    ctx.fillStyle = '#cbd5e1'; // slate-300
    ctx.font = 'italic 36px sans-serif';
    const commentLines = wrapText(result.comment, safeWidth, 'italic 36px sans-serif');
    commentLines.forEach(line => {
      ctx.fillText(line, centerX, currentY);
      currentY += 50;
    });
    currentY += 30;

    // 7. GOOD LUCK
    ctx.fillStyle = '#eab308'; // gold-500
    ctx.font = '900 32px sans-serif';
    ctx.fillText(t.wish.toUpperCase(), centerX, currentY);
    currentY += 80;

    // 8. Bottom Stats Boxes
    const bCardWidth = 500;
    const bCardHeight = 160;
    const bGap = 40;
    const bCardY = cardY + cardHeight - internalPadding - bCardHeight;

    const drawBCard = (x, label, value) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(x, bCardY, bCardWidth, bCardHeight, 30);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(label.toUpperCase(), x + bCardWidth / 2, bCardY + 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 50px sans-serif';
      ctx.fillText(value, x + bCardWidth / 2, bCardY + 125);
    };

    drawBCard(centerX - bCardWidth - bGap / 2, result.breakdown[0].label, result.breakdown[0].value);
    drawBCard(centerX + bGap / 2, result.breakdown[1].label, result.breakdown[1].value);

    // 10. Branding Footer
    ctx.fillStyle = '#475569'; // slate-600
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('GENERATED BY IPO PREDICTOR NEPAL', centerX, cardY + cardHeight - 40);

    return canvas;
  };

  const handleShare = async () => {
    if (!result || isSharing) return;
    
    setIsSharing(true);
    try {
      const canvas = await generateCardCanvas();
      if (!canvas) throw new Error('Canvas generation failed');

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const fileName = `${result.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-ipo-result.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      
      const shareText = lang === 'EN' 
        ? `Check out my IPO allotment probability for ${result.companyName} from IPO Predictor Nepal!` 
        : `${result.companyName} को लागि मेरो IPO बाँडफाँड सम्भावना IPO Predictor Nepal बाट हेर्नुहोस्!`;

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My IPO Allotment Result',
            text: shareText
          });
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
          console.error('Navigator share failed:', shareErr);
          // Fallback to download
          await handleDownload();
        }
      } else {
        // No navigator.share support, fallback to download
        await handleDownload();
      }
    } catch (err) {
      console.error('Share process failed:', err);
      if (err.name !== 'AbortError') {
        await handleDownload();
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`I just predicted my NEPSE IPO allotment chances for ${result?.companyName}! My probability is ${result?.probability}%. Check yours here:`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
  };

  const handleDownload = async () => {
    if (!result || isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = await generateCardCanvas();
      if (!canvas) throw new Error('Canvas generation failed');

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${result.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-ipo-result.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Canvas generation failed:', err);
      alert(`Download failed: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {result && result.probability > 70 && step === 'result' && (
        <ReactConfetti recycle={false} numberOfPieces={200} gravity={0.1} />
      )}

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-2 space-y-8"
            >
            <div className="text-center mb-12">
              <h1 className={cn("text-4xl font-black mb-4", isDark ? "text-white" : "text-slate-900")}>{t.predictorTitle}</h1>
              <p className={isDark ? "text-slate-400" : "text-slate-500"}>{t.predictorSub}</p>
            </div>

            <div className={cn(
              "glass p-8 md:p-12 rounded-[3rem] border shadow-2xl relative overflow-hidden",
              isDark ? "border-white/10" : "border-slate-200 bg-white/50"
            )}>
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Calculator className="w-32 h-32" />
              </div>

              <div className="space-y-8 relative z-10">
                {/* Company Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> {t.selectCompany}
                  </label>
                  <select 
                    value={selectedIpoId}
                    onChange={(e) => setSelectedIpoId(e.target.value)}
                    className={cn(
                      "w-full border rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer",
                      isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                  >
                    <option value="">-- {t.selectCompany} --</option>
                    {combinedIpos.map(ipo => (
                      <option key={ipo.id} value={ipo.id}>
                        {lang === 'EN' ? ipo.name : ipo.nameNP} ({ipo.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Oversubscription */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> Expected Oversubscription (Times)
                      </span>
                    </label>
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="e.g. 15.5, 20.2, 5.0"
                      value={oversubscription}
                      onChange={(e) => setOversubscription(e.target.value)}
                      className={cn(
                        "w-full border rounded-2xl p-5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    />
                    <button 
                      onClick={() => setCurrentPage('oversubscription')}
                      className="text-xs text-indigo-500 hover:text-indigo-400 font-bold transition-colors flex items-center gap-1"
                    >
                      <Calculator size={14} />
                      Don't know oversubscription? [Click to check live]
                    </button>
                  </div>

                  {/* Number of Accounts */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4 h-4" /> No. of Accounts Applied From
                    </label>
                    <input 
                      type="number"
                      min="1"
                      value={accounts}
                      onChange={(e) => setAccounts(e.target.value)}
                      className={cn(
                        "w-full border rounded-2xl p-5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                </div>

                {/* Additional Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kitta (Units) Applied</label>
                    <input 
                      type="number"
                      step="10"
                      min="10"
                      value={kitta}
                      onChange={(e) => setKitta(e.target.value)}
                      className={cn(
                        "w-full border rounded-2xl p-5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all",
                        isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-4 h-full pt-6">
                    <button 
                      onClick={() => setIsFirstTime(!isFirstTime)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        isFirstTime ? "bg-emerald-500" : "bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        isFirstTime ? "left-7" : "left-1"
                      )} />
                    </button>
                    <span className="text-sm font-bold text-slate-300">First Time Applicant?</span>
                  </div>
                </div>

                <button 
                  onClick={handlePredict}
                  disabled={!selectedIpoId || !oversubscription || loading}
                  className="btn-gold w-full py-6 text-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {lang === 'EN' ? 'Analyzing Market Data...' : 'बजार डाटा विश्लेषण गर्दै...'}
                    </>
                  ) : (
                    <>
                      {t.predictNow} <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className={cn(
              "p-8 rounded-[2.5rem] flex items-start gap-6 border",
              isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
            )}>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Info className="text-emerald-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-emerald-500">Pro Tip for Nepali Investors</h3>
                <p className={cn("leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
                  Applying for 10 units (kitta) from multiple family accounts is statistically more effective than applying for a large number of units from a single account in the current NEPSE lottery system.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className={cn(
              "p-8 rounded-[2.5rem] border",
              isDark ? "bg-navy-900 border-white/10" : "bg-white border-slate-200 shadow-sm"
            )}>
              <h3 className={cn("text-xl font-bold mb-6 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                <TrendingUp className="text-emerald-500" /> Latest IPO Articles
              </h3>
              <div className="space-y-6">
                {ARTICLES.slice(0, 5).map((article, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentSlug(article.slug);
                      setCurrentPage('blog-post');
                    }}
                    className="group text-left block w-full"
                  >
                    <h4 className={cn(
                      "font-bold text-sm mb-1 group-hover:text-emerald-500 transition-colors line-clamp-2",
                      isDark ? "text-slate-200" : "text-slate-800"
                    )}>
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      <span>{article.date}</span>
                      <span>•</span>
                      <span className="text-emerald-500">Read More</span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage('blog')}
                className="w-full mt-8 py-3 rounded-xl border border-emerald-500/30 text-emerald-500 font-bold text-sm hover:bg-emerald-500/10 transition-all"
              >
                View All Articles
              </button>
            </div>

            <div className={cn(
              "p-8 rounded-[2.5rem] border bg-gradient-to-br from-indigo-600 to-purple-700 text-white",
              "border-white/10 shadow-xl shadow-indigo-500/20"
            )}>
              <h3 className="text-xl font-bold mb-4">Join Our Community</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                Get real-time IPO updates, allotment results, and stock market tips directly on your phone.
              </p>
              <a 
                href="https://wa.me/9779804486318"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-white text-indigo-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all"
              >
                Join WhatsApp Group
              </a>
            </div>
          </aside>
        </div>
      ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <button 
              onClick={() => setStep('form')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
            >
              <ArrowLeft className="w-5 h-5" /> {t.backToForm}
            </button>

            <div id="resultCard" ref={resultRef} className={cn(
              "p-10 md:p-16 rounded-[4rem] border text-center relative overflow-hidden",
              isDark ? "glass border-white/10" : "bg-white border-slate-200 shadow-xl"
            )}>
              {/* Result Background Glow */}
              <div className={cn(
                "absolute inset-0 opacity-10 blur-[100px] -z-10",
                result?.color.includes('emerald') ? "bg-emerald-500" : "bg-gold-500"
              )} />

              <div className="space-y-10">
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest",
                  isDark ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
                )}>
                  <Calculator className="w-3.5 h-3.5" /> {t.resultFor} {result?.companyName}
                </div>

                <div className="space-y-4">
                  <h2 className={cn("text-2xl md:text-3xl font-bold", isDark ? "text-slate-400" : "text-slate-500")}>
                    {lang === 'EN' ? 'Your Allotment Probability' : 'तपाईको बाँडफाँडको सम्भावना'}
                  </h2>
                  <div className={cn("text-4xl md:text-6xl font-black mb-6", result?.color)}>
                    {result?.companyName}
                  </div>
                  <div className={cn("text-8xl md:text-9xl font-black tracking-tighter", result?.color)}>
                    {result?.probability}%
                  </div>
                  <div className={cn("text-2xl md:text-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3", result?.color)}>
                    <CheckCircle2 className="w-8 h-8" /> {result?.verdict}
                  </div>
                  <p className={cn("text-xl md:text-2xl font-bold italic", isDark ? "text-slate-300" : "text-slate-700")}>
                    "{result?.comment}"
                  </p>
                  <p className="text-gold-500 font-black text-lg uppercase tracking-widest">
                    {t.wish}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result?.breakdown.map((item, i) => (
                    <div key={i} className={cn(
                      "p-6 rounded-3xl border",
                      isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}>
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">{item.label}</p>
                      <p className={cn("text-xl font-black", isDark ? "text-white" : "text-slate-900")}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-4 pt-6 no-download">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    <button 
                      onClick={handleFacebookShare}
                      className="w-full sm:w-auto px-8 py-5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Facebook className="w-5 h-5" />
                      Share on Facebook
                    </button>
                    <button 
                      onClick={handleShare}
                      disabled={isSharing}
                      className="btn-gold w-full sm:w-auto px-8 py-5 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                      {isSharing ? (lang === 'EN' ? 'Processing...' : 'प्रक्रिया हुँदैछ...') : t.shareResult}
                    </button>
                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className={cn(
                        "w-full sm:w-auto px-8 py-5 rounded-2xl font-bold border transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed",
                        isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-900"
                      )}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {lang === 'EN' ? 'Processing...' : 'प्रक्रिया हुँदैछ...'}
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          {t.downloadCard}
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-medium italic">
                    Don't forget to tag us on Facebook "IPO/ FPO Updates Nepal"
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gold-500/5 border border-gold-500/20 p-8 rounded-[2.5rem] flex items-start gap-6">
              <div className="w-12 h-12 bg-gold-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-gold-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-gold-400">Important Note</h3>
                <p className="text-slate-400 leading-relaxed">
                  {t.disclaimer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
