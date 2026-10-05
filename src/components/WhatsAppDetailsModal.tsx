import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface WhatsAppDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: { name: string; email: string; phone: string; address: string }) => void;
  initialDetails?: { name: string; email: string; phone: string; address: string };
}

export const WhatsAppDetailsModal: React.FC<WhatsAppDetailsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialDetails
}) => {
  const { userData, user } = useAuth();
  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (isOpen) {
      setDetails({
        name: initialDetails?.name || userData?.fullName || userData?.name || user?.user_metadata?.full_name || '',
        email: initialDetails?.email || userData?.email || user?.email || '',
        phone: initialDetails?.phone || userData?.phone || '',
        address: initialDetails?.address || userData?.address || ''
      });
    }
  }, [isOpen, userData, user, initialDetails]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.name || !details.email || !details.phone || !details.address) {
      alert("Please fill all fields to proceed with WhatsApp order.");
      return;
    }
    onConfirm(details);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden my-auto"
          >
            <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-2">
                <div>
                  <h2 className="text-3xl font-serif text-slate-900 font-bold">Order Details</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Complete your profile for WhatsApp</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    required
                    value={details.name}
                    onChange={(e) => setDetails({ ...details, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={details.email}
                    onChange={(e) => setDetails({ ...details, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> WhatsApp Number
                  </label>
                  <input
                    required
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                    placeholder="+92 3XX XXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Home Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={details.address}
                    onChange={(e) => setDetails({ ...details, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none text-sm"
                    placeholder="Enter your complete home address"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] hover:bg-primary hover:text-black transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 mt-4"
                >
                  <Send className="w-4 h-4 ml-1" />
                  Continue to WhatsApp
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
