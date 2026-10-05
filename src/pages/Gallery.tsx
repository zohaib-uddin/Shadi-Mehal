import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Loader2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { adminService, GalleryItem, STATIC_GALLERY } from '../lib/adminService';
import { useData } from '../context/DataContext';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';
import { GallerySkeleton } from '../components/Skeleton';

const CATEGORIES = ['All', 'Weddings', 'Mehndi', 'Birthdays', 'Corporate', 'Themed Events'];

export default function Gallery() {
  const { getGallery } = useData();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    if (items.length === 0) setLoading(true);
    try {
      const data = await getGallery();
      setItems(data);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    item => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div className="pt-20 md:pt-32 pb-20 px-6 md:px-10 min-h-screen bg-bg-dark relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-sans text-slate-900 leading-tight md:leading-none mb-4 md:mb-6 font-semibold">
              Event <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-[10px] md:text-sm font-medium leading-relaxed">
              Step into a world of beautiful events. Look through our collection of premium celebrations.
            </p>
          </motion.div>
        </div>

        {/* Category Navigation - Horizontal Scroll */}
        <div className="flex overflow-x-auto pb-6 mb-10 md:mb-20 no-scrollbar snap-x gap-3 px-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap px-6 md:px-10 py-2.5 md:py-4 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all border shadow-sm snap-start",
                selectedCategory === cat 
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                  : "bg-white text-slate-400 border-slate-100 hover:text-slate-900"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Grid with increased spacing */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
          {loading && items.length === 0 ? (
            <GallerySkeleton />
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="group relative cursor-pointer break-inside-avoid rounded-[40px] overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-100/50"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative overflow-hidden aspect-auto">
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="w-full h-auto object-cover group-hover:scale-105 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-500"></div>
                  
                  <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black text-slate-900 uppercase tracking-widest">{item.category}</span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <h4 className="text-xl md:text-3xl font-semibold text-white mb-2">{item.title}</h4>
                    <div className="flex items-center gap-4 text-primary font-black text-[9px] md:text-[10px] uppercase tracking-widest leading-none">
                        <span>View Project</span>
                        <div className="w-8 md:w-10 h-[1px] bg-primary"></div>
                    </div>
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-black shadow-2xl">
                        <Maximize2 className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          )}
        </div>

        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12"
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-3xl cursor-zoom-out"
                onClick={() => setSelectedItem(null)}
              />

              <div className="absolute top-6 right-6 md:top-8 md:right-8 z-[110]">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-all shadow-2xl"
                  >
                      <Plus className="w-6 h-6 md:w-8 md:h-8 rotate-45" />
                  </button>
              </div>

              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="max-w-6xl w-full max-h-[85vh] relative z-[105] flex flex-col items-center justify-center p-4 md:p-0"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-full h-full rounded-[20px] md:rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 relative group">
                  <img 
                    src={selectedItem.img} 
                    alt="" 
                    className="w-full h-full object-contain bg-slate-900"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-slate-950/90 to-transparent translate-y-2 md:translate-y-10 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                      <span className="text-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] mb-2 md:mb-4 block underline underline-offset-8 decoration-primary/30">{selectedItem.category} Collection</span>
                      <h2 className="text-2xl md:text-5xl lg:text-7xl font-semibold text-white leading-tight md:leading-none">{selectedItem.title}</h2>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
