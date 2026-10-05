import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Phone, MapPin, Mail, Save, ShoppingBag, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../lib/adminService';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';
import LogoutConfirmModal from '../components/LogoutConfirmModal';

export default function Profile() {
  const navigate = useNavigate();
  const { user, userData, logout, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        fullName: userData.fullName || userData.name || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
    } else if (user?.user_metadata) {
      // Fallback for metadata if database data isn't loaded yet
      const metadataName = user.user_metadata.full_name || user.user_metadata.name || user.user_metadata.display_name || '';
      setFormData(prev => ({
        ...prev,
        name: metadataName,
        fullName: metadataName
      }));
    }
  }, [userData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Please provide all required profile details");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: formData.fullName || formData.name,
        fullName: formData.fullName || formData.name,
        phone: formData.phone,
        address: formData.address
      });
      toast.success("Profile saved successfully");
    } catch (error: any) {
      console.error("Profile synchronization failure:", error);
      alert("Failed to save profile: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="pt-32 pb-20 px-6 md:px-10 min-h-screen bg-bg-dark relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 md:gap-4 text-[10px] font-black uppercase tracking-widest text-primary mb-3 md:mb-4">
            <span className="w-6 md:w-8 h-[1px] bg-primary"></span>
            {userData?.fullName || userData?.name || "Customer Profile"}
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900">Settings</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar info */}
            <div className="lg:col-span-4 space-y-6 md:space-y-8">
                <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[50px] border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-full flex items-center justify-center text-primary mx-auto mb-4 md:mb-6 text-2xl md:text-3xl font-semibold border-4 border-slate-50 shadow-inner">
                        {(userData?.fullName || userData?.name || user.email)?.[0].toUpperCase()}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 leading-tight">{userData?.fullName || userData?.name || "Client"}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Member Account</p>
                    
                    <div className="mt-6 md:mt-10 pt-6 md:pt-10 border-t border-slate-50 flex flex-col gap-4">
                        <Link to="/orders" className="flex items-center justify-center gap-3 py-3 md:py-4 bg-slate-50 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all border border-slate-100">
                            <ShoppingBag className="w-4 h-4" />
                            My Orders
                        </Link>
                        <button 
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="flex items-center justify-center gap-3 py-3 md:py-4 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 md:p-8 rounded-[30px] md:rounded-[40px] text-white overflow-hidden relative border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 md:mb-4 relative z-10">Elite Event Services</h4>
                    <p className="text-xs md:text-sm font-medium leading-relaxed relative z-10 text-white/80 font-sans font-semibold">
                      Dedicated to making your special moments truly unforgettable with premium orchestrations.
                    </p>
                </div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-8">
                <form onSubmit={handleSubmit} className="bg-white p-8 md:p-16 rounded-[40px] md:rounded-[60px] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8 md:space-y-10">
                    <div className="flex flex-col gap-6 md:gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                                <User className="w-3 h-3" />
                                Full Name
                            </label>
                            <input 
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value, name: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-full px-8 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-inner" 
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                Email Address
                            </label>
                            <input 
                                disabled
                                value={user.email || ''}
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-full px-8 py-4 text-slate-300 font-bold outline-none shadow-sm cursor-not-allowed" 
                                placeholder="Email cannot be changed"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                Contact No
                            </label>
                            <input 
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-full px-8 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-inner" 
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                Delivery Address
                            </label>
                            <textarea 
                                required
                                rows={3}
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-[30px] px-8 py-6 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-inner resize-none" 
                                placeholder="Enter full delivery address"
                            />
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-50">
                        <button 
                            disabled={loading}
                            type="submit"
                            className="w-full py-6 bg-slate-900 text-white rounded-full font-black uppercase tracking-[0.2em] text-[12px] hover:bg-primary hover:text-black transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          await logout();
          navigate('/auth');
        }}
      />
    </div>
  );
}
