import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../lib/adminService';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user, userData, loginAsAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userData && userData?.role !== 'admin') {
      logout();
      setError('Access Denied. This portal is strictly for administrative personnel.');
    }
  }, [user, userData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userData = await loginAsAdmin(email, password);
      
      if (userData?.role !== 'admin') {
        await logout();
        setError('Access Denied. This portal is strictly for administrative personnel.');
        setLoading(false);
        return;
      }

      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Use admin@gmail.com / admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-slate-200/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[60px] p-10 lg:p-14 border border-slate-100 shadow-2xl shadow-slate-200/50 relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-slate-900 rounded-[30px] flex items-center justify-center text-primary mx-auto mb-8 shadow-2xl shadow-slate-900/20">
             <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-serif italic text-slate-900 mb-4">Command Center</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Restricted Administrative Access</p>
        </div>

        {error && (
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8 p-4 bg-red-50 text-red-500 rounded-2xl text-[11px] font-bold text-center uppercase tracking-widest border border-red-100"
            >
                {error}
            </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-6">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-3xl py-5 pl-16 pr-8 text-slate-900 font-bold focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-200"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-6">Personal Key</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-3xl py-5 pl-16 pr-8 text-slate-900 font-bold focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              disabled={loading}
              className={cn(
                "w-full bg-slate-900 text-white rounded-3xl py-5 font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-4 group hover:bg-primary hover:text-black transition-all shadow-xl shadow-slate-900/10",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate Access
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-12 pt-10 border-t border-slate-50 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">System Operational</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                Unauthorized access attempts are logged and reported. <br className="hidden lg:block"/>
                Please contact system administrator for credentials.
            </p>
        </div>
      </motion.div>
    </div>
  );
}
