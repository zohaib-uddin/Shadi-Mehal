import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, MessageCircle } from 'lucide-react';
import { Product, ProductVariant } from '../lib/adminService';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function ProductModal({ product, onClose }: { product: Product | null, onClose: () => void }) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(null);

  React.useEffect(() => {
    // Reset selection when product changes
    setSelectedVariant(null);
  }, [product]);

  const handleWhatsAppOrder = (product: Product) => {
    const title = selectedVariant 
      ? `${product.title} (${selectedVariant.color_name})`
      : product.title;
    const text = `Hello Hamza Decorations, I would like to order: ${title} (Rs. ${product.price})`;
    window.open(`https://wa.me/923116869582?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative max-w-4xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 bg-white/50 backdrop-blur-md hover:bg-white flex items-center justify-center rounded-full text-slate-900 shadow-sm transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-full md:w-1/2 bg-slate-50 relative min-h-[300px] md:min-h-[500px]">
              <img 
                src={product.img} 
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                   {product.category}
                 </span>
                 {product.stock !== undefined && (
                   <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full", product.stock > 0 ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500")}>
                     {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                   </span>
                 )}
              </div>
              
              <h2 className="text-4xl font-serif text-slate-900 mb-6 font-bold">{product.title}</h2>
              <p className="text-3xl font-black text-slate-900 mb-8">Rs. {product.price.toLocaleString()}</p>
              
              {product.has_variants && product.variants && product.variants.length > 0 && (() => {
                const isColorEnabled = !!product.colors_enabled;
                const isSizeEnabled = !!product.sizes_enabled;
                const displayLabel = isColorEnabled && isSizeEnabled 
                  ? (selectedVariant ? `${selectedVariant.color_name} / Size: ${selectedVariant.size}` : 'Select combination') 
                  : isColorEnabled 
                    ? (selectedVariant?.color_name || 'Select color') 
                    : (selectedVariant?.size || 'Select size');

                return (
                  <div className={cn(
                    "mb-8 p-4 rounded-2xl border transition-all duration-300",
                    !selectedVariant ? "bg-primary/5 border-primary/30" : "bg-slate-50 border-slate-100"
                  )}>
                      <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-sans">
                              {isColorEnabled && isSizeEnabled 
                                ? "Combination: " 
                                : isColorEnabled 
                                  ? "Color: " 
                                  : "Size: "}
                              <span className="text-slate-900">{displayLabel}</span>
                          </span>
                      </div>
                      
                      {isColorEnabled && isSizeEnabled ? (
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {product.variants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVariant(v)}
                              className={cn(
                                "flex items-center gap-2.5 p-2 rounded-xl border text-left cursor-pointer transition-all duration-200 outline-none",
                                selectedVariant?.id === v.id 
                                  ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                                  : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"
                              )}
                            >
                              {v.color_code && (
                                <div className="w-4 h-4 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: v.color_code }} />
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className={cn("text-[9px] font-bold truncate uppercase tracking-wider", selectedVariant?.id === v.id ? "text-white" : "text-slate-900")}>
                                  {v.color_name}
                                </span>
                                {v.size && (
                                  <span className={cn("text-[8px] font-bold tracking-widest uppercase", selectedVariant?.id === v.id ? "text-slate-300" : "text-slate-400")}>
                                    Size {v.size}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : isColorEnabled ? (
                        <div className="flex flex-wrap gap-2">
                          {product.variants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVariant(v)}
                              className={cn(
                                "relative w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 outline-none",
                                selectedVariant?.id === v.id 
                                  ? "ring-2 ring-slate-900 ring-offset-2 scale-110 shadow-lg border-slate-900" 
                                  : "border-slate-100 hover:scale-105"
                              )}
                              style={{ backgroundColor: v.color_code }}
                              title={v.color_name}
                            >
                              {selectedVariant?.id === v.id && (
                                <CheckCircle2 size={12} className="text-white drop-shadow-md" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {product.variants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVariant(v)}
                              className={cn(
                                "px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer duration-200 outline-none",
                                selectedVariant?.id === v.id 
                                  ? "bg-slate-900 text-white border-slate-900 scale-105 shadow-md" 
                                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-900"
                              )}
                            >
                              {v.size}
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedVariant && (
                          <p className="mt-3 text-[8px] font-black uppercase tracking-widest text-slate-400">
                              Available stock: {selectedVariant.stock_quantity ?? 0}
                          </p>
                      )}
                  </div>
                );
              })()}
              
              <div className="prose prose-slate prose-sm mb-10">
                <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

              <div className="space-y-4">
                <motion.button 
                  onClick={() => {
                      if (product.has_variants && product.variants?.length && !selectedVariant) {
                        toast.error("Please select a color variant first");
                        return;
                      }
                      const itemToSave = selectedVariant 
                        ? { ...product, selectedVariant } 
                        : product;
                      addToCart(itemToSave, 'product');
                      onClose();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all rounded-full shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>
                <button 
                  onClick={() => {
                    if (product.has_variants && product.variants?.length && !selectedVariant) {
                      toast.error("Please select a color variant first");
                      return;
                    }
                    handleWhatsAppOrder(product);
                  }}
                  className="w-full py-5 border-2 border-slate-100 text-xs font-black uppercase tracking-widest hover:border-slate-200 hover:bg-slate-50 transition-all rounded-full flex items-center justify-center gap-3 text-slate-500"
                >
                  <MessageCircle className="w-5 h-5" />
                  Order on WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
