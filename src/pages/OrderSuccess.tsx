import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Home, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <div className="pt-40 pb-20 px-6 min-h-screen bg-bg-dark flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-32 h-32 bg-primary rounded-[40px] flex items-center justify-center text-black mb-12 shadow-2xl shadow-primary/20"
      >
        <CheckCircle className="w-16 h-16" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-6xl md:text-8xl font-sans text-slate-900 mb-6 uppercase tracking-tighter font-semibold">
            Order <span className="text-slate-400">Confirmed</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-xl font-medium leading-relaxed mb-16">
            Your masterpiece selection has been successfully archived. Our orchestration team will contact you shortly to finalize the details and begin the curation process.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6">
            <Link 
                to="/orders" 
                className="px-12 py-5 border-2 border-primary text-slate-900 font-bold text-[12px] uppercase tracking-widest rounded-full hover:bg-primary hover:text-black transition-all flex items-center bg-primary/5"
            >
                <ShoppingBag className="mr-3 w-5 h-5" />
                Track Orders
            </Link>
            <Link 
                to="/" 
                className="px-12 py-5 border-2 border-slate-900 text-slate-900 font-black text-[12px] uppercase tracking-widest rounded-full hover:bg-slate-900 hover:text-white transition-all flex items-center"
            >
                <Home className="mr-3 w-5 h-5" />
                Back Home
            </Link>
            <Link 
                to="/products" 
                className="px-12 py-5 bg-slate-900 text-white font-black text-[12px] uppercase tracking-widest rounded-full hover:bg-primary hover:text-black transition-all flex items-center shadow-2xl shadow-slate-900/10"
            >
                Continue Shopping
                <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
        </div>
      </motion.div>

      <div className="mt-32 p-10 border border-slate-100 rounded-[40px] bg-white shadow-xl shadow-slate-100/50 max-w-4xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center md:text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Next Step</h4>
                  <p className="text-slate-900 font-sans text-xl font-semibold">Order Audit</p>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">Verify your items and delivery logistics.</p>
              </div>
              <div className="text-center md:text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Orchestration</h4>
                  <p className="text-slate-900 font-sans text-xl font-semibold">Design Phase</p>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">Our designers begin mapping your requirements.</p>
              </div>
              <div className="text-center md:text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Delivery</h4>
                  <p className="text-slate-900 font-sans text-xl font-semibold">Premium Logistics</p>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">Dispatched with artisan care to your location.</p>
              </div>
          </div>
      </div>
    </div>
  );
}
