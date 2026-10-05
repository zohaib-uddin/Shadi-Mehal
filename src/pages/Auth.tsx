import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, User, ArrowRight, Loader2, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminService } from '../lib/adminService';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { user, userData, signIn, signUp, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && userData?.role === 'admin') {
      logout();
      setError('Administrative accounts must authenticate via the dedicated Admin Portal.');
    }
  }, [user, userData]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      if (isLogin) {
        const userData = await signIn(formData.email, formData.password);
        
        if (userData?.role === 'admin') {
          await logout();
          setError('Administrative accounts must authenticate via the dedicated Admin Portal.');
          setLoading(false);
          return;
        }

        navigate(from, { replace: true });
      } else {
        await signUp(formData.email, formData.password, formData.name);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Signup successful!')) {
         setSuccessMsg(err.message);
         setIsLogin(true); // Switch to login view
      } else if (err.message && err.message.includes('Email not confirmed')) {
         setError('Please check your email and click the verification link before logging in.');
      } else {
         setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle(!isLogin);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark pt-32 pb-20 px-6 flex items-center justify-center">
      <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-20 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block flex-1 space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-primary text-[11px] font-black uppercase tracking-[0.5em] mb-6 block underline underline-offset-8">Join the Elite</span>
            <h1 className="text-7xl font-sans font-semibold text-slate-900 leading-tight">Crafting <br /> Memorable <span className="text-primary">Milestones</span></h1>
            <p className="text-slate-400 mt-8 text-xl font-medium leading-relaxed max-w-md">
                Access exclusive event orchestrations, track your bookings, and curate your dream celebrations with Hamza Decorations.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-10">
              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50">
                  <h4 className="text-2xl font-semibold text-slate-900">Custom Curation</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Tailored just for you</p>
              </div>
              <div className="bg-primary p-8 rounded-[40px] shadow-xl shadow-primary/20">
                  <h4 className="text-2xl font-semibold text-black">Priority Support</h4>
                  <p className="text-[10px] text-black/50 font-black uppercase tracking-widest mt-2">24/7 Concierge access</p>
              </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white p-10 md:p-16 rounded-[60px] border border-slate-100 shadow-2xl shadow-slate-200 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary text-black rounded-full flex items-center justify-center shadow-2xl">
              {isLogin ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold text-slate-900 mb-4">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">Please enter your credentials to proceed.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Artisan Name"
                      className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-5 pl-14 pr-6 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-5 pl-14 pr-6 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-5 pl-14 pr-6 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-50 py-3 rounded-xl">{error}</p>
            )}

            {successMsg && (
              <p className="text-green-600 text-[10px] font-black uppercase tracking-widest text-center bg-green-50 py-3 rounded-xl">{successMsg}</p>
            )}

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-3xl py-6 font-black uppercase tracking-[0.2em] text-[12px] hover:bg-primary hover:text-black transition-all flex items-center justify-center group shadow-2xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? 'Sign In Now' : 'Join the Collective'}
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>

            <div className="relative my-10 py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-white text-slate-300 font-black uppercase tracking-widest">Or Continue With</span></div>
            </div>

            <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full border-2 border-slate-100 rounded-3xl py-5 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-4 hover:bg-slate-50 transition-all text-slate-700"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLogin ? 'Login with Google' : 'Continue with Google'}
            </button>

            <p className="text-center mt-10 text-[11px] text-slate-400 font-medium">
              {isLogin ? "Don't have an account yet?" : "Already a member?"}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-black uppercase tracking-widest hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
