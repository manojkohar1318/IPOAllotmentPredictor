import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, LogIn, UserPlus, Chrome, AlertCircle, Loader2 } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  firestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { cn } from '../cn';

export const AuthModal = ({ isOpen, onClose, isDark, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuthSuccess = async (user) => {
    try {
      // Check if user exists in Firestore, if not create
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          savedBoids: [],
          createdAt: serverTimestamp()
        });
      }
      
      onAuthSuccess && onAuthSuccess(user);
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      setError('Failed to sync user data. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      await handleAuthSuccess(userCredential.user);
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(result.user);
    } catch (err) {
      console.error('Google sign-in error:', err);
      // Handle the case where the user closes the popup
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please complete the process in the popup.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Sign-in request cancelled. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
          <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className={cn("p-2 rounded-xl transition-all", isDark ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900")}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={cn(
                    "w-full border rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                    isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full border rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                    isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                  )}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative">
            <div className={cn("absolute inset-0 flex items-center", isDark ? "opacity-10" : "opacity-20")}>
              <div className="w-full border-t border-slate-900"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={cn("px-2 font-bold", isDark ? "bg-navy-950 text-slate-500" : "bg-white text-slate-500")}>Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 border transition-all disabled:opacity-50",
              isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900"
            )}
          >
            <Chrome className="w-5 h-5" />
            Google
          </button>

          <p className={cn("text-center text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-500 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
