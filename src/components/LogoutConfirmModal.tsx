import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, X, AlertCircle } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 isolate">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            {/* Branding Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl md:text-2xl font-serif text-slate-900 mb-2 font-bold">Log Out?</h3>
              <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest leading-relaxed mb-8">
                Are you sure you want to log out?
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={onClose}
                  className="py-3.5 md:py-4 bg-slate-100 text-slate-600 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-slate-200 transition-all font-sans"
                >
                  Stay Here
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="py-3.5 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-red-500 transition-all shadow-lg shadow-slate-900/10 font-sans"
                >
                  Sign Out
                </button>
              </div>
            </div>

         
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
