import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Upload,
  X
} from 'lucide-react';
import { adminService, Service } from '../../lib/adminService';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  // Modal State
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

  const [formData, setFormData] = useState<Omit<Service, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    price: 0,
    compare_price: 0,
    category: '',
    description: '',
    img: '',
    gallery: [],
    vendor: '',
    status: 'active',
    stock: 0
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      title: '',
      price: 0,
      compare_price: 0,
      category: '',
      description: '',
      img: '',
      gallery: [],
      vendor: '',
      status: 'active',
      stock: 0
    });
    setImagePreview(null);
    setGalleryPreviews([]);
  };
  
  useEffect(() => {
    loadServices();
    loadCategories();
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const data = await adminService.getVendors();
      setVendors(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await adminService.getCategories();
      setAvailableCategories(data.filter(c => c.type === 'service' || c.type === 'both'));
    } catch (e) {
      console.error(e);
    }
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await adminService.getServices();
      setServices(data);
    } catch (error) {
      console.error("Failed to load services", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService?.id) {
        await adminService.updateService(editingService.id, formData);
        toast.success('Service updated successfully');
      } else {
        await adminService.addService(formData);
        toast.success('Service created successfully');
      }
      setIsAdding(false);
      resetForm();
      loadServices();
    } catch (error: any) {
      console.error("Error saving service:", error);
      toast.error(`Error saving service: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEdit = (service: Service) => {
    setConfirmModal({
      isOpen: true,
      title: 'Edit Service',
      message: `Are you sure you want to edit "${service.title}"?`,
      type: 'info',
      onConfirm: () => {
        setEditingService(service);
        setFormData({
          title: service.title,
          price: service.price,
          compare_price: service.compare_price || 0,
          category: service.category,
          description: service.description,
          img: service.img,
          gallery: service.gallery || [],
          vendor: service.vendor || '',
          status: service.status,
          stock: service.stock || 0
        });
        setImagePreview(service.img || null);
        setGalleryPreviews(service.gallery || []);
        setIsAdding(true);
      }
    });
  };

  const handleDelete = async (id: string) => {
    const service = services.find(s => s.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Service',
      message: `Are you sure you want to delete "${service?.title || 'this service'}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteService(id);
          await loadServices();
          toast.success('Service deleted');
        } catch (err: any) {
          console.error("Delete failed", err);
          toast.error('Failed to delete service');
        }
      }
    });
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
            <h3 className="text-2xl md:text-3xl font-serif italic text-slate-900 mb-2">Service Orchestration</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Manage your event categories and vendor assignments</p>
        </div>
        <button 
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="w-full lg:w-auto bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
        >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Launch New Service
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
            {isAdding && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] border-2 border-dashed border-primary/40 shadow-xl overflow-hidden"
                >
                    <h3 className="text-xl md:text-2xl font-serif italic text-slate-900 mb-6 md:mb-8">{editingService ? 'Edit Service' : 'Launch New Service'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <input 
                                required
                                placeholder="Service Name"
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    required
                                    type="number"
                                    placeholder="Starting Price"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                    value={formData.price || ''}
                                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                />
                                <input 
                                    type="number"
                                    placeholder="Compare Price"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                    value={formData.compare_price || ''}
                                    onChange={(e) => setFormData({...formData, compare_price: Number(e.target.value)})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    required
                                    type="number"
                                    placeholder="Stock / Units"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                    value={formData.stock || ''}
                                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                                />
                                <select 
                                    required
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="">Select Category</option>
                                    {availableCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            <input 
                                placeholder="Vendor Name (Optional)"
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900"
                                value={formData.vendor || ''}
                                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                            />

                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visibility Status:</span>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={formData.status === 'active'}
                                        onChange={(e) => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})}
                                        className="w-5 h-5 rounded border-slate-200 text-primary focus:ring-primary"
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                        {formData.status === 'active' ? 'Public (Active)' : 'Hidden (Inactive)'}
                                    </span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Service Banner</label>
                                
                                {imagePreview ? (
                                    <div className="relative group/preview rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-video">
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                            <label className="cursor-pointer bg-white text-slate-900 p-3 rounded-xl hover:bg-primary transition-colors shadow-xl">
                                                <RotateCcw className="w-5 h-5" />
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                const base64String = reader.result as string;
                                                                setImagePreview(base64String);
                                                                setFormData({...formData, img: base64String});
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setFormData({...formData, img: ''});
                                                }}
                                                className="bg-white text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-colors shadow-xl"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-10 h-10 text-slate-300 group-hover:text-primary transition-colors mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600">Click to upload image</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const base64String = reader.result as string;
                                                        setImagePreview(base64String);
                                                        setFormData({...formData, img: base64String});
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Gallery Images (Optional)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {galleryPreviews.map((src, idx) => (
                                        <div key={idx} className="relative group rounded-xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square">
                                            <img src={src} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newPreviews = galleryPreviews.filter((_, i) => i !== idx);
                                                    setGalleryPreviews(newPreviews);
                                                    setFormData({...formData, gallery: newPreviews});
                                                }}
                                                className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer group">
                                        <Plus className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []) as File[];
                                                files.forEach(file => {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const base64String = reader.result as string;
                                                        setGalleryPreviews(prev => {
                                                            const updated = [...prev, base64String];
                                                            setFormData(f => ({...f, gallery: updated}));
                                                            return updated;
                                                        });
                                                    };
                                                    reader.readAsDataURL(file);
                                                });
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <textarea 
                             required
                                placeholder="Service Description"
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900 h-32 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => {setIsAdding(false); setEditingService(null);}}
                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-3 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10"
                                >
                                    Confirm Configuration
                                </button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-slate-50 border border-slate-100 animate-pulse rounded-[40px]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, idx) => (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[40px] border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Image Area on Top */}
                <div className="w-full h-48 sm:h-56 relative overflow-hidden bg-slate-50 shrink-0">
                  <img src={s.img || 'https://picsum.photos/seed/service/400/300'} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt="" />
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-50">
                    <div className={cn("w-1.5 h-1.5 rounded-full", s.status === 'active' ? "bg-green-500" : "bg-red-500")}></div>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest", s.status === 'active' ? "text-green-500" : "text-red-500")}>
                      {s.status}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="px-3.5 py-1.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-slate-50">
                        {s.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Service
                      </span>
                    </div>

                    <h4 className="text-lg md:text-xl font-serif italic text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{s.title}</h4>
                    <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-4 leading-relaxed h-8 overflow-hidden">{s.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-500">
                          {s.vendor || (s.vendor_id ? (vendors.find(v => v.id === s.vendor_id)?.fullName || 'Vendor Assigned') : 'Direct Elite Service')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-300" />
                    <span className={cn("text-[8px] font-black uppercase tracking-widest", s.status === 'active' ? "text-green-500" : "text-red-500")}>
                      {s.status}
                    </span>
                      </div>
                    </div>
                  </div>

                  {/* Price and Action Footer */}
                  <div className="border-t border-slate-50 pt-5 flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Starting From</p>
                      {s.compare_price && s.compare_price > s.price && (
                        <p className="text-[10px] text-slate-300 line-through font-bold">Rs. {s.compare_price.toLocaleString()}</p>
                      )}
                      <p className="text-lg font-serif italic font-semibold text-slate-900">Rs. {s.price?.toLocaleString() || '15,000'}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleEdit(s)}
                        className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm flex items-center justify-center border border-slate-50 pointer-events-auto cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id!)}
                        className="w-10 h-10 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm flex items-center justify-center border border-slate-50 pointer-events-auto cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

       {services.length === 0 && !loading && (
          <div className="py-32 text-center bg-white rounded-[60px] border border-dashed border-slate-200">
              <Sparkles className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-2xl font-serif italic text-slate-300">No services active currently</h3>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-8 px-10 py-4 bg-primary text-black rounded-full text-[11px] font-black uppercase tracking-widest"
              >
                  Define First Service
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
