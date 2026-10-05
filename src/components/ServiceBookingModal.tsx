import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Users, MapPin, MessageCircle, Calculator, ChevronRight, Check } from 'lucide-react';
import { Service } from '../lib/adminService';
import { supabase } from '../lib/supabase';
import { openWhatsAppOrder } from '../lib/whatsappService';
import { toast } from 'react-hot-toast';

interface ServiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service;
  userData?: any;
}

export default function ServiceBookingModal({ isOpen, onClose, service, userData }: ServiceBookingModalProps) {
  const [formData, setFormData] = useState({
    name: userData?.fullName || userData?.name || '',
    phone: userData?.phone || '',
    eventType: '',
    location: '',
    date: '',
    guests: 100,
    notes: ''
  });

  const [estimate, setEstimate] = useState(service.price);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Basic estimation logic: base price + guests surcharge
    // For every 50 guests above 100, add 10% of base price
    const basePrice = service.price;
    const guestSurcharge = formData.guests > 100 ? (Math.floor((formData.guests - 100) / 50) * (basePrice * 0.1)) : 0;
    setEstimate(basePrice + guestSurcharge);
  }, [formData.guests, service.price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Save to Supabase
      // Check if service.id is a valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(service.id || '');
      
      const { error } = await supabase.from('service_requests').insert({
        user_name: formData.name,
        user_phone: formData.phone,
        service_id: isUuid ? service.id : null,
        service_name: service.title,
        event_type: formData.eventType,
        location: formData.location,
        event_date: formData.date,
        guests_count: formData.guests,
        estimated_price: estimate,
        notes: formData.notes
      });

      if (error) throw error;

      // 2. Generate WhatsApp Message
      const message = `Hello, I want to book a service:

*Service:* ${service.title}
*Location:* ${formData.location}
*Event Type:* ${formData.eventType}
*Guests:* ${formData.guests}
*Date:* ${formData.date}

*Requirements:*
${formData.notes || 'No specific requirements mentioned.'}

*Estimated Budget:* ${estimate.toLocaleString()} PKR

Please confirm availability and discuss details further.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/923116869582?text=${encodedMessage}`;

      // 3. Open WhatsApp
      window.open(whatsappUrl, "_blank");
      
      toast.success("Request submitted successfully!");
      onClose();
    } catch (err: any) {
      toast.error("Failed to submit request: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Side: Info */}
            <div className="hidden md:flex md:w-1/3 bg-slate-900 p-8 text-white flex-col justify-between">
              <div>
                <h3 className="text-2xl font-serif mb-4 font-bold">{service.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Fill details to get a professional quotation for your special occasion.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary">
                    <Check className="w-4 h-4" /> Professional Staff
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary">
                    <Check className="w-4 h-4" /> Quality Decor
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary">
                    <Check className="w-4 h-4" /> Timely Setup
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Estimated Price</div>
                <div className="text-2xl font-serif text-primary">
                  Rs. {estimate.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 p-8 md:p-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-serif text-slate-900">Custom Invitation</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Provide your event details</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-14 px-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                      placeholder="e.g. Ahmed Khan"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-14 px-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                      placeholder="e.g. 03001234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Type</label>
                    <select
                      required
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full h-14 px-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm font-medium appearance-none"
                    >
                      <option value="">Select Event</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Mehndi">Mehndi</option>
                      <option value="Corporate">Corporate Event</option>
                      <option value="Birthday">Birthday Party</option>
                      <option value="Engagement">Engagement</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Proposed Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location / Venue</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm font-medium"
                        placeholder="City or Hall Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estimated Guests ({formData.guests})</label>
                    <div className="relative flex items-center h-14 px-6 bg-slate-50 rounded-2xl">
                      <Users className="w-4 h-4 text-slate-400 mr-4" />
                      <input
                        type="range"
                        min="50"
                        max="2000"
                        step="50"
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                        className="flex-1 accent-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Special Requirements</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-6 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-0 transition-all text-sm font-medium resize-none"
                    placeholder="Tell us more about your vision..."
                  />
                </div>

                <div className="pt-4 flex flex-col md:flex-row gap-4">
                  <div className="md:hidden bg-slate-50 rounded-2xl p-6 mb-2">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Estimated Quote</div>
                    <div className="text-3xl font-serif text-slate-900">Rs. {estimate.toLocaleString()}</div>
                  </div>
                  
                  <button
                    disabled={isSubmitting}
                    className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">Processing...</span>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        Send Request to WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
