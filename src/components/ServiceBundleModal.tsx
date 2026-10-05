import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, MessageCircle, ShoppingBag, Trash2, ChevronRight } from 'lucide-react';
import { useBundle } from '../context/BundleContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface ServiceBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceBundleModal({ isOpen, onClose }: ServiceBundleModalProps) {
  const { serviceBundleItems, removeFromBundle, clearBundle, orderServicesViaWhatsApp } = useBundle();
  const { userData } = useAuth();
  
  const [formData, setFormData] = useState({
    name: userData?.fullName || userData?.name || '',
    phone: userData?.phone || '',
    eventType: '',
    location: '',
    date: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = serviceBundleItems.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceBundleItems.length === 0) {
      toast.error("Your service bundle is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await orderServicesViaWhatsApp(formData);
      onClose();
    } catch (err: any) {
      toast.error("Failed to process order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (serviceBundleItems.length === 0 && isOpen) {
     onClose();
     return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Side: Selected Services */}
            <div className="w-full md:w-1/2 bg-slate-50 p-8 flex flex-col border-r border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-serif text-slate-900 font-bold">Service Bundle</h3>
                    <button 
                        onClick={() => clearBundle('service')}
                        className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 flex items-center gap-2"
                    >
                        <Trash2 size={12} /> Clear All
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {serviceBundleItems.map((item) => (
                        <div key={item.item.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 group">
                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                <img src={item.item.img} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.item.title}</h4>
                                <p className="text-primary font-black text-xs">Rs. {item.item.price.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                            </div>
                            <button 
                                onClick={() => removeFromBundle(item.item.id!, 'service')}
                                className="self-center p-2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Items</span>
                        <span className="text-sm font-bold text-slate-900">{serviceBundleItems.length} Services</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Estimated Total</span>
                        <span className="text-3xl font-serif text-primary font-bold">Rs. {totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Consultation Info Form */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-serif text-slate-900 leading-none mb-2 font-bold">Booking Inquiry</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Exclusively Managed via WhatsApp</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Client Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-15 px-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all text-sm font-medium"
                    placeholder="e.g. Zainab Siddiqui"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp Phone</label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-15 px-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all text-sm font-medium"
                        placeholder="e.g. 03xx xxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Type</label>
                      <input
                        required
                        type="text"
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                        className="w-full h-15 px-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all text-sm font-medium"
                        placeholder="e.g. Wedding"
                      />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Venue / City</label>
                      <div className="relative">
                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          required
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full h-15 pl-14 pr-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all text-sm font-medium"
                          placeholder="e.g. Lahore / PC Hotel"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Proposed Event Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          required
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full h-15 pl-14 pr-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Special Requirements</label>
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all text-sm font-medium resize-none shadow-inner"
                    placeholder="Tell us about the theme, number of guests, or any specific requests..."
                  />
                </div>

                <motion.button
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-6 bg-green-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-green-600 transition-all flex items-center justify-center gap-4 shadow-xl shadow-green-500/20"
                >
                  <MessageCircle size={20} />
                  {isSubmitting ? 'Initializing Chat...' : 'Confirm Order via WhatsApp'}
                </motion.button>

                <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                   By confirming, your bundle details will be sent directly to our service specialists for a bespoke quotation.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
