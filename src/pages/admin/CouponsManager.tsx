import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ticket, Plus, Trash2, Edit3, X, Save, 
  Calendar, Percent, CheckCircle2, AlertCircle, Search, RotateCcw
} from 'lucide-react';
import { adminService, CouponCode } from '../../lib/adminService';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function CouponsManager() {
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null);
  
  // Modal State for Confirmation
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  // Form State
  const [formData, setFormData] = useState<CouponCode>({
    code: '',
    discount_percentage: 10,
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_percentage: 10,
      start_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true
    });
    setEditingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        start_date: new Date(formData.start_date).toISOString(),
        expiry_date: new Date(formData.expiry_date).toISOString()
      };

      if (editingCoupon?.id) {
        await adminService.updateCoupon(editingCoupon.id, payload);
        toast.success("Coupon updated successfully");
      } else {
        await adminService.addCoupon(payload);
        toast.success("Coupon added successfully");
      }
      
      setIsAdding(false);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.message || "Failed to save coupon");
    }
  };

  const handleEdit = (coupon: CouponCode) => {
    setConfirmModal({
      isOpen: true,
      title: 'Edit Coupon',
      message: `Are you sure you want to modify coupon "${coupon.code}"?`,
      type: 'info',
      onConfirm: () => {
        setEditingCoupon(coupon);
        setFormData({
          ...coupon,
          start_date: new Date(coupon.start_date).toISOString().split('T')[0],
          expiry_date: new Date(coupon.expiry_date).toISOString().split('T')[0]
        });
        setIsAdding(true);
      }
    });
  };

  const handleDelete = (id: string) => {
    const coupon = coupons.find(c => c.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Coupon',
      message: `Are you sure you want to delete coupon "${coupon?.code}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteCoupon(id);
          toast.success("Coupon deleted");
          fetchCoupons();
        } catch (error) {
          toast.error("Failed to delete coupon");
        }
      }
    });
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-serif italic text-slate-900 underline decoration-primary/30">Coupons <span className="text-slate-400 not-italic">Vault</span></h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-3">Promotional Strategy & Discounts</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-black hover:text-primary transition-all shadow-xl shadow-primary/20 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            Create New Batch
          </button>
        )}
      </div>

      {/* Adding/Editing Form Section (Inline like Services) */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-10 rounded-[40px] border-2 border-dashed border-primary/40 shadow-xl overflow-hidden mb-12"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif italic text-slate-900 underline decoration-primary/30">
                {editingCoupon ? 'Modify' : 'Initialize'} <span className="text-slate-400 not-italic">Coupon</span>
              </h2>
              <button 
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Coupon Code</label>
                  <div className="relative">
                    <Ticket className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input 
                      required
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      placeholder="SUMMER2026"
                      className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Discount %</label>
                    <div className="relative">
                      <Percent className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                      <input 
                        required
                        type="number"
                        min="1"
                        max="100"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({...formData, discount_percentage: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Launch Status</label>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                      className={cn(
                        "w-full px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-between",
                        formData.is_active 
                        ? "bg-green-50 text-green-600 border-green-100" 
                        : "bg-slate-50 text-slate-400 border-slate-100"
                      )}
                    >
                      {formData.is_active ? 'Live' : 'Paused'}
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        formData.is_active ? "bg-green-500 shadow-lg shadow-green-500/30" : "bg-slate-300"
                      )} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Start Date</label>
                  <input 
                    required
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">End Date</label>
                  <input 
                    required
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => { setIsAdding(false); resetForm(); }}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  className="flex-3 bg-slate-900 text-white py-4 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3"
                >
                  <Save className="w-4 h-4" />
                  {editingCoupon ? 'Apply Modifications' : 'Launch Coupon Code'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      {!isAdding && (
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Search by code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-3xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
          />
        </div>
      )}

      {/* Coupons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[40px] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredCoupons.map((coupon) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={coupon.id}
                className={cn(
                  "relative p-8 rounded-[40px] border transition-all overflow-hidden group",
                  coupon.is_active ? "border-slate-100 bg-white shadow-xl shadow-slate-100/50" : "border-slate-100 bg-slate-50 opacity-60"
                )}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-black transition-all">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(coupon)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-colors hover:shadow-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(coupon.id!)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-colors hover:shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-serif italic text-slate-900 mb-1">{coupon.code}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full">
                      {coupon.discount_percentage}% OFF
                    </span>
                    {new Date(coupon.expiry_date) < new Date() && (
                      <span className="text-[8px] font-black uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Expired</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 overflow-hidden">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="truncate">{new Date(coupon.start_date).toLocaleDateString()} — {new Date(coupon.expiry_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                      {coupon.is_active ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertCircle className="w-3 h-3 text-amber-500" />}
                      <span className={coupon.is_active ? 'text-green-600' : 'text-amber-600'}>
                        {coupon.is_active ? 'Live on Store' : 'Inactive / Paused'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative cut-outs */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full -translate-y-1/2" />
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full -translate-y-1/2" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredCoupons.length === 0 && !loading && !isAdding && (
          <div className="py-32 text-center bg-white rounded-[60px] border border-dashed border-slate-200">
              <Ticket className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-2xl font-serif italic text-slate-300">No promotion logic found</h3>
              <button 
                onClick={() => { resetForm(); setIsAdding(true); }}
                className="mt-8 px-10 py-4 bg-primary text-black rounded-full text-[11px] font-black uppercase tracking-widest"
              >
                  Draft First Coupon
              </button>
          </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({...confirmModal, isOpen: false})}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
