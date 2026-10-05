import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, ShoppingCart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Service, Product } from '../lib/adminService';
import { useWhatsAppOrder } from '../hooks/useWhatsAppOrder';
import { WhatsAppDetailsModal } from '../components/WhatsAppDetailsModal';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';
import { getSizeFullName, formatProductVariantName } from '../lib/utils';

export default function Cart() {
  const { userData, user } = useAuth();
  const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const { initiateWhatsAppOrder, isModalOpen, setIsModalOpen, handleConfirmDetails } = useWhatsAppOrder();

  const getItemPrice = (item: any, type: string) => {
      if (type === 'service' || type === 'product' || type === 'bundle' || type === 'deal') return item.price || item.totalPrice || 0;
      return 0;
  };

  const getItemTitle = (item: any, type: string) => {
      const baseTitle = item.title || item.name;
      if (type === 'product' && item.selectedVariant) {
        return formatProductVariantName(baseTitle, item.selectedVariant.color_name, item.selectedVariant.size);
      }
      return baseTitle;
  };

  const getItemImage = (item: any, type: string) => {
      if (item.img) return item.img;
      return item.items?.[0]?.item?.img || item.items?.[0]?.img || 'https://picsum.photos/seed/cart/200/200';
  };

  if (cart.length === 0) {
    return (
      <div className="pt-40 pb-20 px-6 min-h-screen bg-bg-dark flex flex-col items-center justify-center text-center relative overflow-hidden">
        <FloatingWeddingDecor className="opacity-10" />
        <div className="relative z-10">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-slate-200 mx-auto mb-10 shadow-2xl">
              <ShoppingBag className="w-16 h-16" />
          </div>
          <h2 className="text-5xl font-semibold text-slate-900 mb-6">Your Cart is Empty</h2>
          <p className="text-slate-400 max-w-sm mx-auto mb-12 font-medium">It seems you haven't added anything to your cart yet.</p>
          <Link 
              to="/marketplace" 
              className="px-12 py-5 bg-slate-900 text-white font-black text-[12px] uppercase tracking-widest rounded-full hover:bg-primary hover:text-black transition-all flex items-center shadow-2xl shadow-slate-900/10 mx-auto w-fit"
          >
              Go Shopping
              <ArrowRight className="ml-3 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 md:px-10 min-h-screen bg-bg-dark relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      <WhatsAppDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDetails}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-6 md:mb-12">
            <h1 className="text-3xl md:text-6xl font-semibold text-slate-900">Your <span className="text-primary font-semibold">Cart</span></h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10 md:gap-20">
          {/* Cart Items */}
          <div className="flex-1 space-y-4 md:space-y-8">
            <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest">{cart.length} Items in your selection</p>
                <button 
                  onClick={clearCart}
                  className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors bg-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-sm border border-slate-100"
                >
                  Clear
                </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              <AnimatePresence mode="popLayout">
                {cart.map((cartItem) => (
                  <motion.div 
                      key={`${cartItem.item.id}-${cartItem.item.selectedVariant?.id || 'default'}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 bg-white p-4 md:p-8 rounded-3xl md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 group"
                  >
                    <div className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl md:rounded-[30px] overflow-hidden shadow-lg border border-slate-50 shrink-0">
                      <img 
                        src={getItemImage(cartItem.item, cartItem.type)} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                      />
                    </div>

                    <div className="flex-1 space-y-0.5 md:space-y-1 text-center sm:text-left">
                      <span className="text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest block underline underline-offset-4 decoration-primary/30">
                        {cartItem.type}
                      </span>
                      <h3 className="text-lg md:text-2xl font-semibold text-slate-900">{getItemTitle(cartItem.item, cartItem.type)}</h3>
                      {cartItem.item.selectedVariant && (
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                          {cartItem.item.selectedVariant.color_code && 
                           cartItem.item.selectedVariant.color_name?.toLowerCase() !== 'standard' && (
                            <div 
                              className="w-2.5 h-2.5 rounded-full border border-slate-200" 
                              style={{ backgroundColor: cartItem.item.selectedVariant.color_code }} 
                            />
                          )}
                          <p className="text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-primary/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full w-fit">
                            {[
                              cartItem.item.selectedVariant.color_name?.toLowerCase() !== 'standard' ? cartItem.item.selectedVariant.color_name : null,
                              getSizeFullName(cartItem.item.selectedVariant.size)
                            ].filter(Boolean).join(' / ')}
                          </p>
                        </div>
                      )}
                      
                      {/* Sub-items for Bundles */}
                      {cartItem.type === 'bundle' && cartItem.item.items && cartItem.item.items.length > 0 && (
                        <div className="mt-3 md:mt-4 space-y-2 md:space-y-3 pt-3 md:pt-4 border-t border-slate-50">
                          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Bundle Contents:</p>
                          {cartItem.item.items.map((sub: any, sidx: number) => (
                            <div key={sidx} className="flex items-center gap-2 md:gap-3 bg-slate-50/50 p-1.5 md:p-2 rounded-lg md:rounded-xl">
                              <div className="w-6 h-6 md:w-8 md:h-8 rounded md:rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                                <img src={sub.item.img} className="w-full h-full object-cover" alt="" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[8px] md:text-[10px] font-bold text-slate-900 truncate">{sub.item.title}</p>
                              </div>
                              <p className="text-[8px] md:text-[10px] font-black text-slate-400">×{sub.quantity}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-slate-400 text-[10px] md:text-sm font-medium">Premium Wedding Items</p>
                    </div>

                    <div className="flex flex-col items-center sm:items-end gap-3 md:gap-6 shrink-0">
                      <p className="text-lg md:text-2xl font-semibold text-slate-900">Rs. {(getItemPrice(cartItem.item, cartItem.type) * cartItem.quantity).toLocaleString()}</p>
                      
                      <div className="flex items-center gap-3 md:gap-6">
                        <div className="flex items-center bg-slate-50 rounded-full p-1 gap-1 md:gap-4 border border-slate-100">
                          <button 
                            onClick={() => updateQuantity(cartItem.item.id!, cartItem.quantity - 1, cartItem.item.selectedVariant?.id)}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-white hover:shadow-md transition-all text-slate-400 hover:text-slate-900"
                          >
                            <Minus className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                          <span className="text-xs md:text-sm font-black text-slate-900 w-5 md:w-6 text-center">{cartItem.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(cartItem.item.id!, cartItem.quantity + 1, cartItem.item.selectedVariant?.id)}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-white hover:shadow-md transition-all text-slate-400 hover:text-slate-900"
                          >
                            <Plus className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(cartItem.item.id!, cartItem.item.selectedVariant?.id)}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>

                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="w-full lg:w-[450px]">
            <div className="sticky top-32 space-y-6 md:space-y-8">
                <div className="bg-slate-900 p-8 md:p-10 rounded-[30px] md:rounded-[50px] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                    
                    <h3 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 flex items-center gap-4">
                        <ShoppingCart className="w-6 h-6 text-primary" />
                        Order Total
                    </h3>

                    <div className="space-y-4 md:space-y-6 pt-6 md:pt-8 border-t border-white/10 mb-8 md:mb-10">
                        <div className="flex justify-between items-center opacity-60">
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Subtotal</span>
                            <span className="text-lg md:text-xl font-semibold">Rs. {totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 md:pt-6 border-t border-white/20">
                            <span className="text-[12px] font-black uppercase tracking-widest text-primary">Total</span>
                            <span className="text-3xl md:text-4xl font-semibold text-primary">Rs. {totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Link 
                            to="/checkout"
                            className="w-full py-6 bg-primary text-black text-center rounded-full font-black uppercase tracking-[0.2em] text-[12px] hover:bg-white transition-all shadow-xl block"
                        >
                            Checkout
                        </Link>
                        
                        <button 
                            onClick={() => {
                                const orderItems = cart.map(i => {
                                    const variantStr = i.item.selectedVariant
                                        ? [i.item.selectedVariant.color_name, i.item.selectedVariant.size].filter(Boolean).join(' / ')
                                        : '';
                                    const title = variantStr 
                                        ? `${i.item.title || i.item.name} (${variantStr})`
                                        : (i.item.title || i.item.name);
                                        
                                    return {
                                        title,
                                        price: (i.item.price || 0),
                                        quantity: i.quantity,
                                        type: i.type as 'product' | 'service' | 'bundle',
                                        description: i.item.description,
                                        items: i.item.items
                                    };
                                });

                                initiateWhatsAppOrder(orderItems);
                            }}
                            className="w-full py-6 border-2 border-primary text-white text-center rounded-full font-black uppercase tracking-[0.2em] text-[12px] hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-3"
                        >
                            <MessageCircle className="w-5 h-5" />
                            WhatsApp Order
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Payment Methods</h4>
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        {['Cash on Delivery', 'WhatsApp'].map(m => (
                            <div key={m} className="bg-black-300 py-3 md:py-4 rounded-xl text-center text-[8px] font-black uppercase tracking-widest text-black-300 border border-slate-100">
                                {m}
                            </div>
                        ))}
                    </div>
                    <p className="mt-8 text-[11px] text-slate-400 font-medium leading-relaxed">
                        For bank transfers or custom billings, please talk to us on WhatsApp.
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
