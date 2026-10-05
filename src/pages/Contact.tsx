import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Send, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';

import { FaTiktok } from "react-icons/fa";
import { adminService } from '../lib/adminService';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.addMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject || 'Direct Inquiry',
        message: formData.message
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

 const contactInfo = [
  { 
    icon: <Phone />, 
    label: "Direct Call", 
    value: "+92 311 6869582", 
    href: "tel:+923116869582" 
  },

  { 
    icon: <MessageCircle />, 
    label: "WhatsApp", 
    value: "Chat with us", 
    href: `https://wa.me/923116869582?text=${encodeURIComponent(
      "Hello Hamza Decorations, I am contacting you from your website regarding your premium services."
    )}`,
    target: "_blank"
  },

  { 
    icon: <Mail />, 
    label: "Email Address", 
    value: "decorewithhamzii@gmail.com", 
    href: "mailto:decorewithhamzii@gmail.com" 
  },

  { 
    icon: <MapPin />, 
    label: "Our Studio", 
    value: "Attock, Pakistan", 
    href: "#map" 
  }
];

  return (
    <div className="pt-32 pb-20 px-6 md:px-10 min-h-screen bg-bg-dark">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col-reverse lg:flex-row gap-12 md:gap-24 mb-20 md:mb-40">
          {/* Left Column: Contact Methods */}
          <div className="flex-1">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <span className="text-primary text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] mb-4 md:mb-8 block font-sans">Begin the Conversation</span>
                <h1 className="text-5xl md:text-8xl font-sans text-slate-900 leading-none mb-6 md:mb-10 font-semibold">
                    Get in <br /> <span className="text-primary">Touch</span>
                </h1>
                <p className="text-slate-400 max-w-md text-sm md:text-xl font-medium leading-relaxed mb-10 md:mb-16">
                    Ready to transform your vision into reality? Reach out via any channel below.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {contactInfo.slice(0, 4).map((info, i) => (
                     <a 
    key={i}
    href={info.href}
    target={info.target || "_self"}
    rel={info.target === "_blank" ? "noopener noreferrer" : ""}
    className="p-6 md:p-10 bg-white rounded-3xl md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl transition-all group"
>
                            <div className="w-10 h-10 md:w-14 md:h-14 bg-bg-alt rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-black transition-all mb-4 md:mb-6">
                                {React.cloneElement(info.icon as React.ReactElement, { size: 18 })}
                            </div>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">{info.label}</p>
                            <p className="text-lg md:text-xl font-semibold text-slate-900 truncate">{info.value}</p>
                        </a>
                    ))}
                </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-[450px]">
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 md:p-16 rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-2xl"
                >
                    {submitted ? (
                      <div className="py-10 text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-2">Message Archived</h3>
                        <p className="text-slate-500 text-xs mb-8">Coordination team will respond shortly.</p>
                        <button 
                          onClick={() => setSubmitted(false)}
                          className="text-[10px] font-black uppercase tracking-widest text-primary underline"
                        >
                          Send another
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-2">Send Message</h3>
                        <p className="text-slate-400 font-medium text-[10px] mb-8">Coordinator will contact you within 24 hours.</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-2">Your Name</label>
                                <input 
                                  required
                                  value={formData.name}
                                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                                  type="text" 
                                  className="w-full bg-bg-alt border-none rounded-2xl py-3 px-6 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20" 
                                  placeholder="John Doe" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-2">Email</label>
                                <input 
                                  required
                                  value={formData.email}
                                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                                  type="email" 
                                  className="w-full bg-bg-alt border-none rounded-2xl py-3 px-6 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20" 
                                  placeholder="john@example.com" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-2">Contact</label>
                                <input 
                                  required
                                  value={formData.phone}
                                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                  type="tel" 
                                  className="w-full bg-bg-alt border-none rounded-2xl py-3 px-6 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20" 
                                  placeholder="+92 3XX XXXXXXX" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-2">Message</label>
                                <textarea 
                                  required
                                  value={formData.message}
                                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                                  className="w-full bg-bg-alt border-none rounded-3xl py-4 px-6 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 h-24 resize-none" 
                                  placeholder="Tell us about your event..."
                                ></textarea>
                            </div>
                            
                            <button 
                              disabled={loading}
                              type="submit"
                              className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-full hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2 shadow-lg text-[10px]"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Inquiry <Send className="w-3.5 h-3.5" /></>}
                            </button>
                        </form>
                      </>
                    )}
                </motion.div>
          </div>
        </div>

        {/* Socials Bar */}
        <div className="mb-20 flex justify-center items-center gap-6 md:gap-8">
            <motion.a 
              whileHover={{ y: -5 }} 
              href="https://www.instagram.com/hamziiproduction" 
              target="_blank"
              rel="noopener noreferrer" 
              className="w-14 h-14 md:w-20 md:h-20 bg-white border border-slate-100 rounded-2xl md:rounded-[36px] flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-xl shadow-slate-100"
            >
                <Instagram className="w-6 h-6 md:w-8 md:h-8" />
            </motion.a>
            <motion.a 
              whileHover={{ y: -5 }} 
              href="https://www.facebook.com/share/19eaXE9rtK/" 
              target="_blank"
              rel="noopener noreferrer" 
              className="w-14 h-14 md:w-20 md:h-20 bg-white border border-slate-100 rounded-2xl md:rounded-[36px] flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-xl shadow-slate-100"
            >
                <Facebook className="w-6 h-6 md:w-8 md:h-8" />
            </motion.a>
            <motion.a 
                whileHover={{ y: -5 }} 
                href="https://www.tiktok.com/@hamziiproduction"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 md:w-20 md:h-20 bg-white border border-slate-100 rounded-2xl md:rounded-[36px] flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-xl shadow-slate-100"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 md:w-8 md:h-8"
                >
                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.716h-3.219v13.677a2.896 2.896 0 1 1-2.896-2.896c.298 0 .584.046.854.13V9.615a6.115 6.115 0 1 0 6.115 6.115V9.046a8.012 8.012 0 0 0 4.684 1.506V7.333a4.781 4.781 0 0 1-1.768-.647z"/>
                </svg>
            </motion.a>
        </div>

        {/* Map Section */}
        <section id="map" className="rounded-[40px] md:rounded-[60px] overflow-hidden h-[400px] md:h-[500px] relative border border-slate-100 shadow-2xl">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3316.6622523169053!2d72.35039113873414!3d33.76939261368978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df183e18b59e89%3A0xdb88ed08629ebf74!2sMeena%20Bazar%20Attock%2C%20Pakistan!5e0!3m2!1sen!2s!4v1778253514072!5m2!1sen!2s" 
                className="absolute inset-0 w-full h-full grayscale opacity-80"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
            ></iframe>
            <div className="absolute top-4 right-4 md:top-10 md:right-10 bg-white/95 backdrop-blur-md p-4 md:p-10 rounded-2xl md:rounded-[40px] border border-slate-100 shadow-2xl max-w-[180px] md:max-w-xs transition-all pointer-events-none">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/20 rounded-lg md:rounded-2xl flex items-center justify-center text-primary mb-2 md:mb-6"><MapPin size={16} /></div>
                <h4 className="text-sm md:text-2xl font-semibold text-slate-900 mb-1 md:mb-4">Visit Us</h4>
                <p className="text-slate-400 text-[8px] md:text-sm font-medium leading-relaxed uppercase tracking-wider">Main Meena Bazar, Attock City.</p>
                <div className="mt-2 md:mt-8 flex items-center gap-2 text-primary text-[7px] md:text-[10px] font-black uppercase tracking-widest">
                    <span>Open 10 AM</span>
                    <div className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-green-500 animate-pulse"></div>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
