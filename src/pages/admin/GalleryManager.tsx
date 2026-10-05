import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Image as ImageIcon, Trash2, Search, Loader2, X, AlertCircle, Upload } from 'lucide-react';
import { cn } from '../../lib/utils';
import { adminService, GalleryItem } from '../../lib/adminService';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const [formData, setFormData] = useState<Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    category: 'Weddings',
    img: ''
  });

  const categories = ['All', 'Weddings', 'Mehndi', 'Birthdays', 'Themed Events', 'Corporate'];

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await adminService.getGallery();
      setItems(data);
    } catch (error) {
      console.error("Failed to load gallery", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, img: reader.result as string });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.img) {
      alert("Please upload an image first");
      return;
    }
    try {
      await adminService.addGalleryItem(formData);
      setIsAdding(false);
      setFormData({ title: '', category: 'Weddings', img: '' });
      loadGallery();
    } catch (error) {
      alert("Error saving gallery item");
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find(i => i.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Asset',
      message: `Are you sure you want to delete "${item?.title || 'this asset'}" from the gallery?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteGalleryItem(id);
          await loadGallery();
        } catch (error) {
          console.error("Error deleting item", error);
        }
      }
    });
  };

  const filteredItems = items.filter(img => {
    const matchesCategory = selectedCategory === 'All' || img.category === selectedCategory;
    const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
            <h3 className="text-2xl md:text-3xl font-serif italic text-slate-900 mb-2">Visual Portfolio</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Curate your public gallery archives</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  placeholder="Search assets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5" 
                />
             </div>
             <button 
                onClick={() => setIsAdding(true)}
                className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10"
             >
                <Plus className="w-5 h-5" />
                Upload Asset
            </button>
        </div>
      </div>

       <div className="flex items-center gap-3 pb-8 overflow-x-auto no-scrollbar scroll-smooth px-1">
            {categories.map(c => (
                <button 
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={cn(
                        "whitespace-nowrap px-6 md:px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                        selectedCategory === c ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "bg-white text-slate-400 border border-slate-100 hover:text-slate-900"
                    )}
                >
                    {c}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-2 border-dashed border-primary/50 shadow-2xl relative z-10 aspect-square flex flex-col justify-center"
                    >
                        <h3 className="text-lg md:text-xl font-serif italic text-slate-900 mb-4 md:mb-6">New Asset</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                required
                                placeholder="Asset Title"
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-slate-900 text-sm"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                            <select 
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            
                            <div className="relative">
                                <input 
                                    type="file"
                                    id="gallery-file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <label 
                                    htmlFor="gallery-file"
                                    className={cn(
                                        "w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                                        formData.img ? "border-green-200 bg-green-50" : "border-slate-100 bg-slate-50 hover:border-primary/30"
                                    )}
                                >
                                    {uploading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                                    ) : formData.img ? (
                                        <div className="w-full h-full p-2 relative">
                                            <img src={formData.img} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                                                <span className="text-white text-[8px] font-black uppercase">Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-slate-300" />
                                            <span className="text-[10px] font-black uppercase text-slate-400">Select Image</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-3 text-[9px] font-black uppercase text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-primary text-black py-3 rounded-xl text-[9px] font-black uppercase shadow-lg"
                                >
                                    Upload
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                 [1,2,3,4,5].map(i => <div key={i} className="aspect-square bg-slate-200 animate-pulse rounded-[30px] md:rounded-[40px]"></div>)
            ) : filteredItems.map((img, idx) => (
                <motion.div 
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative aspect-square bg-slate-100 rounded-[30px] md:rounded-[40px] overflow-hidden border border-slate-100 shadow-xl shadow-slate-100/50"
                >
                    <img src={img.img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" alt="" />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-500"></div>
                    
                    <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all text-black">
                        <button 
                            onClick={() => handleDelete(img.id!)}
                            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center hover:text-red-500 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all text-black">
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-1">{img.category}</p>
                        <h4 className="text-xl font-serif italic text-white truncate">{img.title}</h4>
                    </div>
                </motion.div>
            ))}
            
            {!isAdding && (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[30px] md:rounded-[40px] flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-primary hover:text-primary transition-all group"
                >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Add more images</span>
                </button>
            )}
        </div>
        
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
