import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { Product, ProductVariant } from '../lib/adminService';
import { cn } from '../lib/utils';

interface VariantSelectorProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (variant: ProductVariant) => void;
  actionLabel?: string;
}

export function VariantSelector({ product, isOpen, onClose, onSelect, actionLabel = "Confirm Selection" }: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  if (!product) return null;

  const handleConfirm = () => {
    if (selectedVariant) {
      onSelect(selectedVariant);
      onClose();
      setSelectedVariant(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden z-10"
          >
            <div className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Choose Variant</span>
                  <h3 className="text-2xl font-serif text-slate-900 font-bold">Select <span className="not-italic text-primary font-bold">Color</span></h3>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 bg-slate-50 hover:bg-slate-100 flex items-center justify-center rounded-full text-slate-400 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <img src={product.img} className="w-16 h-16 rounded-2xl object-cover" alt={product.title} />
                <div>
                  <h4 className="font-serif text-slate-900 text-lg leading-tight font-bold">{product.title}</h4>
                  <p className="text-primary font-black text-xs mt-1">Rs. {product.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-10">
                {product.variants?.map((v) => {
                  const showColor = !!product.colors_enabled;
                  const showSize = !!product.sizes_enabled;
                  const titleLabel = showColor && showSize 
                    ? `${v.color_name} / Size ${v.size}` 
                    : showColor 
                      ? v.color_name 
                      : `Size ${v.size}`;

                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300",
                        selectedVariant?.id === v.id 
                          ? "bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/10" 
                          : "bg-white border-slate-100 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {showColor && v.color_code && (
                          <div 
                            className="w-10 h-10 rounded-xl border-2 border-white shadow-sm shrink-0"
                            style={{ backgroundColor: v.color_code }}
                          />
                        )}
                        <div className="text-left">
                          <p className={cn(
                            "text-xs font-black uppercase tracking-widest",
                            selectedVariant?.id === v.id ? "text-white" : "text-slate-900"
                          )}>
                            {titleLabel}
                          </p>
                          <p className={cn(
                            "text-[9px] font-bold uppercase tracking-wider mt-0.5",
                            selectedVariant?.id === v.id ? "text-slate-400" : "text-slate-400"
                          )}>
                            Stock: {v.stock_quantity ?? 0}
                          </p>
                        </div>
                      </div>
                      {selectedVariant?.id === v.id && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check size={14} className="text-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={!selectedVariant}
                onClick={handleConfirm}
                className={cn(
                  "w-full py-5 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg",
                  selectedVariant 
                    ? "bg-primary text-black hover:bg-slate-900 hover:text-white shadow-primary/20" 
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                )}
              >
                {actionLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
