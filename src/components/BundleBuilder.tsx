import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, X, Plus, ChevronUp, ChevronDown, ShoppingCart, Trash2, ArrowRight, Minus, MessageCircle } from 'lucide-react';
import { useBundle } from '../context/BundleContext';
import { cn, formatVariantNameOnly } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useWhatsAppOrder } from '../hooks/useWhatsAppOrder';
import { WhatsAppDetailsModal } from './WhatsAppDetailsModal';

export function BundleBuilder() {
  const navigate = useNavigate();
  const { 
    initiateWhatsAppOrder, 
    isModalOpen, 
    handleConfirmDetails, 
    setIsModalOpen 
  } = useWhatsAppOrder();

  const { 
    productBundleItems,
    serviceBundleItems,
    isBuildingBundle, 
    removeFromBundle, 
    updateBundleItemQuantity,
    cancelBundle, 
    finalizeProductBundle,
    clearBundle,
    activeBundleTab,
    setActiveBundleTab
  } = useBundle();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isBuildingBundle && productBundleItems.length === 0 && serviceBundleItems.length === 0) return null;

  const productTotal = productBundleItems.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
  const serviceTotal = serviceBundleItems.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
  
  const currentItems = activeBundleTab === 'products' ? productBundleItems : serviceBundleItems;
  const currentType = activeBundleTab === 'products' ? 'product' : 'service';
  const currentTotal = activeBundleTab === 'products' ? productTotal : serviceTotal;

  const handleFinalize = async () => {
    const bundle = await finalizeProductBundle();
    if (bundle) {
      navigate('/checkout', { state: { items: [bundle] } });
    }
  };

  const handleWhatsAppOrder = () => {
    const orderItems = serviceBundleItems.map(bi => ({
      title: bi.item.title,
      price: bi.item.price,
      quantity: bi.quantity,
      type: 'service' as const,
      description: bi.item.description,
      items: (bi.item as any).items
    }));
    initiateWhatsAppOrder(orderItems, () => clearBundle('service'));
  };

  return (
    <>
      <WhatsAppDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDetails}
      />
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className={cn(
            "fixed bottom-24 right-4 left-4 md:right-6 md:left-auto md:w-80 lg:w-96 z-50 transition-all duration-500",
            isMinimized ? "h-auto" : "h-auto"
          )}
        >
          <div className="bg-slate-900 text-white rounded-[24px] md:rounded-[32px] shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="p-4 md:p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <Gift size={16} className="md:w-5 md:h-5" />
                </div>
                <div className="flex gap-1 p-1 bg-white/5 rounded-full">
                   <button 
                    onClick={() => setActiveBundleTab('products')}
                    className={cn(
                      "px-2 md:px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all", 
                      activeBundleTab === 'products' ? "bg-primary text-black" : "text-slate-400 hover:text-white"
                    )}
                   >Products</button>
                   <button 
                    onClick={() => setActiveBundleTab('services')}
                    className={cn(
                      "px-2 md:px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all", 
                      activeBundleTab === 'services' ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"
                    )}
                   >Services</button>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 md:p-2 hover:bg-white/5 rounded-full transition-colors"
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button 
                  onClick={cancelBundle}
                  className="p-1.5 md:p-2 hover:bg-red-500/20 rounded-full transition-colors text-slate-400 hover:text-red-500"
                  title="Close & Clear All"
                >
                  <X size={16} />
                </button>
              </div>
            </div>


            {!isMinimized && (
              <>
                {/* Item List */}
                <div className="max-h-[280px] overflow-y-auto px-6 py-4 space-y-4">
                  {currentItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No {currentType}s selected</p>
                    </div>
                  ) : (
                    currentItems.map((bi) => {
                      const variantId = (bi.item as any).selectedVariant?.id;
                      return (
                        <motion.div 
                          key={`${bi.item.id}-${variantId || 'no-variant'}`} 
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                              <img src={bi.item.img} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0" id={`bundle-item-${bi.item.id}-${variantId || 'base'}`}>
                              <h5 className="text-xs font-bold text-white truncate mb-0.5">{bi.item.title}</h5>
                              {bi.item.selectedVariant && (() => {
                                const isColorValid = bi.item.selectedVariant.color_name && bi.item.selectedVariant.color_name.trim() !== '' && bi.item.selectedVariant.color_name.toLowerCase() !== 'standard';
                                const variantDetails = formatVariantNameOnly(bi.item.selectedVariant.color_name, bi.item.selectedVariant.size);
                                if (!variantDetails) return null;
                                return (
                                  <div className="flex items-center gap-1.5 mb-1">
                                    {isColorValid && bi.item.selectedVariant.color_code && (
                                      <div 
                                        className="w-1.5 h-1.5 rounded-full border border-white/20" 
                                        style={{ backgroundColor: bi.item.selectedVariant.color_code }} 
                                      />
                                    )}
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                      {variantDetails}
                                    </p>
                                  </div>
                                );
                              })()}
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                                Rs. {bi.item.price.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center bg-white/5 rounded-lg border border-white/5 p-1">
                              <button 
                                onClick={() => updateBundleItemQuantity(bi.item.id!, bi.quantity - 1, currentType, variantId)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="text-[11px] font-black w-6 text-center">{bi.quantity}</span>
                              <button 
                                onClick={() => updateBundleItemQuantity(bi.item.id!, bi.quantity + 1, currentType, variantId)}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromBundle(bi.item.id!, currentType, variantId)}
                              className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                              id={`remove-${bi.item.id}-${variantId || 'base'}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Clean Price Section */}
                <div className="p-8 mt-auto border-t border-white/5 bg-white/5">
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotal</span>
                      <span className="text-sm font-bold text-white">Rs. {currentTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Grand Total</span>
                      <span className="text-2xl font-serif text-white leading-none font-bold">Rs. {currentTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {activeBundleTab === 'products' ? (
                     <button 
                        onClick={handleFinalize}
                        disabled={productBundleItems.length === 0}
                        className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-xl transition-all hover:bg-white disabled:opacity-30 disabled:scale-100"
                      >
                        <ShoppingCart size={16} />
                        Finalize & Checkout
                      </button>
                  ) : (
                    <button 
                      onClick={handleWhatsAppOrder} 
                      disabled={serviceBundleItems.length === 0}
                      className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-xl transition-all hover:bg-emerald-600 disabled:opacity-30"
                    >
                      <MessageCircle size={16} />
                      Order via WhatsApp
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
