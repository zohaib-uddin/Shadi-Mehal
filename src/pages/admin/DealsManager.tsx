import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, Search, Plus, Trash2, Edit2, Loader2, Save, X, Upload, RotateCcw, Star, AlertCircle } from 'lucide-react';
import { adminService, Deal } from '../../lib/adminService';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '../../components/ConfirmModal';

const DUMMY_REVIEWS = [
  { name: "Zohaib Khan", comment: "Outstanding deal! The value for money is UNMATCHED in Attock.", rating: 5 },
  { name: "Fatima Ali", comment: "Really impressed with the quality of items included. Highly recommended.", rating: 5 },
  { name: "Umer Sheikh", comment: "Best service and very professional team. The deal was perfect for my event.", rating: 5 },
  { name: "Sania Malik", comment: "Great experience. Everything was handled perfectly.", rating: 4 }
];

export default function DealsManager() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

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
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({
    title: '',
    description: '',
    price: 0,
    compare_price: 0,
    status: 'active',
    img: '',
    gallery: []
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const resetForm = () => {
    setImagePreview(null);
    setGalleryPreviews([]);
    setNewDeal({ title: '', description: '', price: 0, compare_price: 0, status: 'active', img: '', gallery: [] });
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDeals();
      setDeals(data);
    } catch (error) {
      console.error("Failed to load deals", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (newDeal.id) {
        await adminService.updateDeal(newDeal.id, newDeal);
        toast.success("Deal updated successfully");
      } else {
        await adminService.addDeal(newDeal as Omit<Deal, 'id' | 'created_at' | 'updated_at'>);
        toast.success("New deal created");
      }
      setIsAdding(false);
      resetForm();
      await loadDeals();
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to save deal");
    }
  };

  const handleEdit = (d: Deal) => {
    setConfirmModal({
      isOpen: true,
      title: 'Edit Deal',
      message: `Are you sure you want to edit "${d.title}"?`,
      type: 'info',
      onConfirm: () => {
        setNewDeal(d);
        setImagePreview(d.img || null);
        setGalleryPreviews(d.gallery || []);
        setIsAdding(true);
      }
    });
  };

  const handleDelete = async (id: string) => {
    const deal = deals.find(d => d.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Deal',
      message: `Are you sure you want to delete "${deal?.title || 'this deal'}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteDeal(id);
          toast.success("Deal deleted");
          await loadDeals();
        } catch (error) {
          console.error("Failed to delete deal", error);
          toast.error("Failed to delete deal");
        }
      }
    });
  };

  const handleAutoReview = async (dealId: string) => {
    setLoading(true);
    try {
      for (const review of DUMMY_REVIEWS) {
        await adminService.addDealReview({
          deal_id: dealId,
          user_name: review.name,
          rating: review.rating,
          comment: review.comment
        });
      }
      toast.success("Auto-reviews added successfully!");
    } catch (error) {
      console.error("Auto-review failed", error);
      toast.error("Failed to add auto-reviews");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      
      {isAdding ? (
        <div className="bg-white rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl p-6 md:p-10">
          <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-slate-100 pb-4 md:pb-6">
            <h3 className="text-xl md:text-2xl font-serif text-slate-900">{newDeal.id ? 'Edit Deal' : 'Create New Deal'}</h3>
            <button onClick={() => { setIsAdding(false); resetForm(); }} className="text-slate-400 hover:text-slate-900">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="col-span-full xl:col-span-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Deal Name</label>
              <input value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-slate-900" placeholder="e.g. Wedding Mega Deal" />
            </div>

            <div className="grid grid-cols-2 gap-4 col-span-full xl:col-span-1">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Price (Rs.)</label>
                <input type="number" value={newDeal.price} onChange={e => setNewDeal({...newDeal, price: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-slate-900" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Compare Price</label>
                <input type="number" value={newDeal.compare_price} onChange={e => setNewDeal({...newDeal, compare_price: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-slate-900" />
              </div>
            </div>

            <div className="col-span-full xl:col-span-1">
                 <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Visibility Status</label>
                 <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox"
                            checked={newDeal.status === 'active'}
                            onChange={(e) => setNewDeal({...newDeal, status: e.target.checked ? 'active' : 'inactive'})}
                            className="w-5 h-5 rounded border-slate-200 text-primary focus:ring-primary"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                            {newDeal.status === 'active' ? 'Public (Active)' : 'Hidden (Inactive)'}
                        </span>
                    </label>
                </div>
            </div>
            <div className="col-span-full overflow-hidden">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Deal Banner</label>
              
              {imagePreview ? (
                  <div className="relative group/preview rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-video max-w-md">
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
                                              setNewDeal({...newDeal, img: base64String});
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
                                  setNewDeal({...newDeal, img: ''});
                              }}
                              className="bg-white text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-colors shadow-xl"
                          >
                              <X className="w-5 h-5" />
                          </button>
                      </div>
                  </div>
              ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-md aspect-video border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-primary/50 transition-all cursor-pointer group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 text-slate-300 group-hover:text-primary transition-colors mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600">Click to upload deal image</p>
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
                                      setNewDeal({...newDeal, img: base64String});
                                  };
                                  reader.readAsDataURL(file);
                              }
                          }}
                      />
                  </label>
              )}
            </div>

            <div className="col-span-full">
               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Gallery Images (Optional)</label>
               <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                   {galleryPreviews.map((src, idx) => (
                       <div key={idx} className="relative group rounded-xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square">
                           <img src={src} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                           <button 
                               type="button"
                               onClick={() => {
                                   const newPreviews = galleryPreviews.filter((_, i) => i !== idx);
                                   setGalleryPreviews(newPreviews);
                                   setNewDeal({...newDeal, gallery: newPreviews});
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
                                           setNewDeal(d => ({...d, gallery: updated}));
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

            <div className="col-span-full">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Description</label>
              <textarea value={newDeal.description} onChange={e => setNewDeal({...newDeal, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 min-h-[100px]" placeholder="Explain the deal package details..." />
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
            <button onClick={() => { setIsAdding(false); resetForm(); }} className="w-full sm:w-auto px-8 py-4 rounded-xl text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors">Cancel</button>
            <button onClick={handleSave} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-colors"><Save className="w-4 h-4"/> Save Deal</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <h3 className="text-xl md:text-2xl font-serif italic text-slate-900">Manage Exclusive Deals</h3>
            <button onClick={() => { resetForm(); setIsAdding(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-colors">
              <Plus className="w-4 h-4"/> Add Deal
            </button>
          </div>

          <div className="p-6 md:p-10">
            {loading ? (
              <div className="flex justify-center py-20 text-primary">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h4 className="text-xl font-serif text-slate-900 mb-2">No Deals Yet</h4>
                <p className="text-slate-400">Create exclusive deals to display on the marketplace.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {deals.map(d => (
                  <div key={d.id} className="bg-slate-50 rounded-3xl p-6 relative group border border-slate-100">
                    <div className="h-48 rounded-2xl overflow-hidden mb-6 relative">
                      <img src={d.img || 'https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?w=800'} className="w-full h-full object-cover" />
                      <div className="absolute top-4 left-4 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Package className="w-3 h-3 text-primary" />
                        Package
                      </div>
                    </div>
                    <h4 className="font-serif text-xl text-slate-900 mb-2">{d.title}</h4>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{d.description}</p>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", d.status === 'active' ? "bg-green-400" : "bg-red-400")}></div>
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", d.status === 'active' ? "text-green-500" : "text-red-500")}>
                                {d.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {d.compare_price && d.compare_price > d.price && (
                          <span className="text-[10px] text-slate-300 line-through font-bold">Rs. {d.compare_price.toLocaleString()}</span>
                        )}
                        <div className="text-primary font-black">Rs. {d.price.toLocaleString()}</div>
                      </div>
                      <button 
                        onClick={() => handleAutoReview(d.id!)}
                        className="text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" /> Auto Review All
                      </button>
                    </div>
                    
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(d)} className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(d.id!)} className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
