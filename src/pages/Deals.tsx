import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, ShoppingBag, ShoppingCart, Eye, ChevronDown, Plus, Minus, Trash2, ArrowRight, Calculator, Loader2, Package, MessageCircle, Sparkles, Check, Users, Zap } from 'lucide-react';
import { adminService, Deal, Product, ProductVariant, Service } from '../lib/adminService';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBundle } from '../context/BundleContext';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ServiceBundleModal from '../components/ServiceBundleModal';
import { useWhatsAppOrder } from '../hooks/useWhatsAppOrder';
import { WhatsAppDetailsModal } from '../components/WhatsAppDetailsModal';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';
import { CardSkeleton } from '../components/Skeleton';
import CardHoverGallery from '../components/CardHoverGallery';

export default function Deals() {
  const navigate = useNavigate();
  const { getDeals, getProducts, getServices, deals: cachedDeals, products: cachedProducts, services: cachedServices } = useData();
  const { user, userData } = useAuth();
  const { addToCart } = useCart();
  const { initiateWhatsAppOrder, isModalOpen, setIsModalOpen, handleConfirmDetails } = useWhatsAppOrder();
  const { 
    productBundleItems, 
    serviceBundleItems, 
    addToBundle, 
    removeFromBundle, 
    updateBundleItemQuantity, 
    finalizeProductBundle, 
    clearBundle,
    activeBundleTab,
    setActiveBundleTab 
  } = useBundle();

  const [activeTab, setActiveTab] = useState<'premade' | 'custom'>('premade');
  const [exclusiveDeals, setExclusiveDeals] = useState<Deal[]>(() => {
    return cachedDeals ? cachedDeals.filter(x => x.status !== 'inactive') : [];
  });
  const [loading, setLoading] = useState(() => !cachedDeals || !cachedProducts || !cachedServices);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Custom Bundle State (Products/Services list for selection)
  const [products, setProducts] = useState<Product[]>(() => {
    return cachedProducts ? cachedProducts.filter(x => x.status !== 'inactive') : [];
  });
  const [services, setServices] = useState<Service[]>(() => {
    return cachedServices ? cachedServices.filter(x => x.status !== 'inactive') : [];
  });
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updated: Record<string, any> = {};
    products.forEach(p => {
      if (p.has_variants && p.variants) {
        const isColorConfigured = p.variants_enabled ?? true;
        const isSizeConfigured = p.sizes_enabled ?? false;
        const selColor = selectedColors[p.id!];
        const selSize = selectedSizes[p.id!];
        
        const found = p.variants.find(v => {
          const matchCol = !isColorConfigured || v.color_name === selColor;
          const matchSz = !isSizeConfigured || v.size === selSize;
          return matchCol && matchSz;
        });
        if (found) {
          updated[p.id!] = found;
        } else if (selColor && !isSizeConfigured) {
          const fallbackCol = p.variants.find(v => v.color_name === selColor);
          if (fallbackCol) updated[p.id!] = fallbackCol;
        } else if (selSize && !isColorConfigured) {
          const fallbackSz = p.variants.find(v => v.size === selSize);
          if (fallbackSz) updated[p.id!] = fallbackSz;
        }
      }
    });
    setSelectedVariants(updated);
  }, [selectedColors, selectedSizes, products]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (exclusiveDeals.length === 0) setLoading(true);
    try {
      const [d, p, s] = await Promise.all([
        getDeals(),
        getProducts(),
        getServices()
      ]);
      setExclusiveDeals(d.filter(x => x.status !== 'inactive'));
      setProducts(p.filter(x => x.status !== 'inactive'));
      setServices(s.filter(x => x.status !== 'inactive'));
    } catch (e) {
      console.error("Failed to load deals", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomItem = (item: Product | Service, type: 'product' | 'service', variant?: any) => {
    if (type === 'product' && (item as Product).has_variants) {
      const prod = item as Product;
      const isColorConfigured = prod.variants_enabled ?? true;
      const isSizeConfigured = prod.sizes_enabled ?? false;
      const selColor = selectedColors[prod.id!];
      const selSize = selectedSizes[prod.id!];
      
      if (isColorConfigured && !selColor) {
        toast.error("Please select a color option.");
        return;
      }
      if (isSizeConfigured && !selSize) {
        toast.error("Please select a size option.");
        return;
      }
      if (!variant) {
        toast.error("Selected combination is not available or out of stock.");
        return;
      }
    }

    const bundle = type === 'product' ? productBundleItems : serviceBundleItems;
    const exists = bundle.find(x => 
      x.item.id === item.id && 
      (type === 'product' ? (x.item as any).selectedVariant?.id === variant?.id : true)
    );

    if (exists) {
      removeFromBundle(item.id!, type, variant?.id);
    } else {
      const finalItem = variant ? { ...item, selectedVariant: variant } : item;
      addToBundle(finalItem, type);
    }
  };

  const productTotal = productBundleItems.reduce((sum, si) => sum + (si.item.price * si.quantity), 0);
  const serviceTotal = serviceBundleItems.reduce((sum, si) => sum + (si.item.price * si.quantity), 0);

  const handleWhatsAppOrder = (deal: Deal) => {
    initiateWhatsAppOrder([{
      title: deal.title,
      price: deal.price,
      quantity: 1,
      type: 'deal',
      description: deal.description
    }]);
  };

  const handleFinalizeProductBundle = async () => {
    const bundle = await finalizeProductBundle();
    if (bundle) {
      navigate('/checkout', { state: { items: [bundle] } });
    }
  };

  const handleCustomServiceWhatsApp = () => {
    const orderItems = serviceBundleItems.map(bi => ({
      title: bi.item.title,
      price: bi.item.price,
      quantity: bi.quantity,
      type: 'service' as const,
      description: bi.item.description
    }));
    initiateWhatsAppOrder(orderItems, () => clearBundle('service'));
  };

  return (
    <div className="pt-20 md:pt-32 pb-12 md:pb-20 px-2 md:px-6 min-h-screen bg-bg-dark relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      <WhatsAppDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDetails}
      />
      <div className="max-w-[1400px] mx-auto relative z-10">
        
        <div className="text-center mb-4 md:mb-12">
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-sans text-slate-900 leading-tight md:leading-none font-semibold">
            Wedding <span className="text-primary">Deals</span>
          </h1>
        </div>

        {/* Main Tabs */}
        <div className="flex justify-center mb-4 md:mb-16 px-4">
          <div className="inline-flex bg-white/50 backdrop-blur-md p-1.5 md:p-2 rounded-full shadow-sm border border-slate-100 w-full md:w-auto max-w-sm">
            <button 
              onClick={() => setActiveTab('premade')}
              className={cn("flex-1 md:flex-initial px-4 md:px-8 py-2.5 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all", activeTab === 'premade' ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-900")}
            >
              Ready Deals
            </button>
            <button 
              onClick={() => setActiveTab('custom')}
              className={cn("flex-1 md:flex-initial px-4 md:px-8 py-2.5 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all", activeTab === 'custom' ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-900")}
            >
              Build Your Own
            </button>
          </div>
        </div>

        {loading && exclusiveDeals.length === 0 ? (
          <CardSkeleton count={10} gridCols="grid-cols-2 lg:grid-cols-5" />
        ) : (
          <div className="min-h-[500px]">
            {activeTab === 'premade' && (
              <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-5 gap-0.5 md:gap-2">
                {exclusiveDeals.map(deal => (
                  <div 
                    key={deal.id} 
                    className="bg-white rounded-[20px] md:rounded-[35px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col group hover:-translate-y-2 transition-all duration-500 relative"
                  >
                    <div className="p-1 md:p-1.5 pb-0">
                      <div 
                        className="aspect-[3/4] md:aspect-[3/4.5] overflow-hidden relative rounded-[15px] md:rounded-[30px] bg-slate-50 shadow-inner group/img"
                      >
                          <CardHoverGallery 
                            mainImage={deal.img || "https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?w=800"} 
                            gallery={deal.gallery} 
                            alt={deal.title} 
                          />
                          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/deals/${deal.id}`);
                                }}
                                className="pointer-events-auto flex items-center gap-1 md:gap-1.5 bg-white/95 backdrop-blur-md px-1.5 md:px-2.5 py-1 md:py-1.5 rounded-full text-slate-900 font-black uppercase tracking-widest text-[5px] md:text-[8px] transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-2xl hover:bg-black hover:text-white group/btn">
                                  <Eye size={6} className="md:w-2 text-black group-hover/btn:text-white transition-colors" />
                                  Quick View
                              </button>
                          </div>
                      </div>
                    </div>

                    <div className="p-2 md:p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-3">
                        <div className="h-[1px] flex-1 bg-slate-100" />
                        <span className="text-[5px] md:text-[9px] font-black text-primary uppercase tracking-[0.3em] whitespace-nowrap px-1">Premium Package</span>
                        <div className="h-[1px] flex-1 bg-slate-100" />
                      </div>

                      <h3 className="text-[11px] md:text-lg font-semibold text-slate-900 mb-0.5 md:mb-1 leading-tight line-clamp-1">{deal.title}</h3>
                      <p className="hidden lg:block text-slate-400 text-[11px] leading-snug mb-2 flex-1 font-medium line-clamp-2">{deal.description}</p>
                      
                      <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-slate-50">
                         <div className="flex items-center justify-between">
                             <div className="flex flex-col">
                               {deal.compare_price && deal.compare_price > deal.price && (
  <span className="text-[6px] md:text-[11px] text-slate-300 line-through font-black">
    Rs. {deal.compare_price.toLocaleString()}
  </span>
)}
                                <span className="text-[5px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none"></span>
                             </div>
                             <div className="flex flex-col items-end text-right">
                                <div className="text-slate-900 font-black tracking-tighter text-[11px] md:text-xl leading-none">
                                    Rs. {deal.price.toLocaleString()}
                                </div>
                             </div>
                         </div>
                         
                         <div className="flex flex-col gap-1 md:gap-2 w-full">
                            <div className="grid grid-cols-2 gap-1 md:gap-2">
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   addToCart(deal, 'deal');
                                 }}
                                 className="py-2 md:py-3 bg-slate-900 text-white text-[7px] md:text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all rounded-lg md:rounded-xl shadow-lg flex items-center justify-center gap-1 md:gap-2"
                               >
                                  <ShoppingCart size={10} className="md:w-4 md:h-4" />
                                  Cart
                               </button>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   navigate('/checkout', { state: { items: [{ item: deal, quantity: 1, type: 'deal' }] } });
                                 }}
                                 className="py-2 md:py-3 bg-primary text-black text-[7px] md:text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all rounded-lg md:rounded-xl shadow-lg flex items-center justify-center gap-1 md:gap-2"
                               >
                                  <ShoppingBag size={10} className="md:w-4 md:h-4" />
                                  Buy
                               </button>
                            </div>
                            <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWhatsAppOrder(deal);
                                }}
                                className="w-full py-2 md:py-3 bg-green-500 text-white text-[7px] md:text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all rounded-lg md:rounded-xl shadow-lg flex items-center justify-center gap-1 md:gap-2"
                              >
                                <MessageCircle size={10} className="md:w-4 md:h-4" />
                                Order on WhatsApp
                            </button>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'custom' && (
              <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }}>
                {!user ? (
                   <div className="bg-white rounded-[30px] md:rounded-[50px] p-12 md:p-24 text-center shadow-2xl border border-slate-50 max-w-2xl mx-auto">
                      <Package className="w-16 h-16 md:w-20 md:h-20 text-slate-100 mx-auto mb-8 md:mb-10" />
                      <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4 md:mb-6">Please Sign In</h2>
                      <p className="text-slate-400 mb-8 md:mb-10 text-sm md:text-base leading-relaxed font-medium">Log in to create your own wedding pack and save your choices.</p>
                      <Link to="/auth" className="inline-flex items-center gap-4 bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-primary hover:text-black transition-all shadow-xl shadow-slate-900/10">
                        Sign In Now <ArrowRight size={16} />
                      </Link>
                   </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-10 md:gap-16">
                    {/* Items Selection */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 md:mb-10 border-b border-slate-100 pb-4">
                        <h3 className="text-xl md:text-2xl font-semibold text-slate-900 leading-none">Choose Items</h3>
                        <div className="flex gap-2 md:gap-4 p-1 md:p-1.5 bg-slate-100/50 rounded-full">
                           <button 
                             onClick={() => setActiveBundleTab('products')}
                             className={cn("px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", activeBundleTab === 'products' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700")}
                           >Products</button>
                           <button 
                             onClick={() => setActiveBundleTab('services')}
                             className={cn("px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", activeBundleTab === 'services' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700")}
                           >Services</button>
                        </div>
                      </div>
                      
                      <AnimatePresence mode="wait">
                         {activeBundleTab === 'products' ? (
                           <motion.div 
                             key="products"
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: 20 }}
                             className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6"
                           >
                             {products.map(item => {
                               const selectedVariant = selectedVariants[item.id!];
                               const isSelected = !!productBundleItems.find(x => 
                                 x.item.id === item.id && 
                                 (item.has_variants ? (x.item as any).selectedVariant?.id === selectedVariant?.id : true)
                               );
                               return (
                                 <div 
                                   key={item.id} 
                                   className={cn(
                                     "p-2 md:p-6 rounded-[20px] md:rounded-[35px] border transition-all flex flex-col group relative h-full",
                                     isSelected ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1"
                                   )}
                                 >
                                   <div 
                                     className="aspect-[4/3] md:aspect-square bg-slate-50 rounded-[12px] md:rounded-[30px] mb-2 md:mb-6 overflow-hidden shadow-inner relative group/img"
                                   >
                                      <CardHoverGallery 
                                        mainImage={item.img} 
                                        gallery={item.gallery} 
                                        alt={item.title} 
                                      />
                                      {isSelected && (
                                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                                          <div className="bg-white text-primary p-1.5 md:p-3 rounded-full shadow-xl">
                                            <Check size={12} className="md:w-5 md:h-5 stroke-[3]" />
                                          </div>
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/product/${item.id}`);
                                          }}
                                          className="pointer-events-auto flex items-center gap-1.5 md:gap-2 bg-white/95 backdrop-blur-md px-2.5 md:px-4 py-1.5 md:py-2 rounded-full text-slate-900 font-black uppercase tracking-widest text-[6px] md:text-[9px] transform translate-y-4 group-hover/img:translate-y-0 transition-all duration-500 shadow-2xl hover:bg-black hover:text-white group/btn"
                                        >
                                          <Eye size={8} className="md:w-[10px] text-black group-hover/btn:text-white transition-colors" />
                                          Quick View
                                        </button>
                                      </div>
                                   </div>
                                   <h5 className="font-bold text-slate-900 mb-0.5 truncate text-[10px] md:text-sm px-1 leading-tight">{item.title}</h5>
                                   
                                   <div className="px-1 mb-1.5">
                                      <p className="text-primary font-black text-[10px] md:text-sm mb-1.5 leading-none">Rs. {item.price.toLocaleString()}</p>
                                      
                                      {item.has_variants && item.variants && item.variants.length > 0 && (() => {
                                        const isColorConfigured = item.variants_enabled ?? true;
                                        const isSizeConfigured = item.sizes_enabled ?? false;

                                        // Extract unique colors
                                        const uniqueColorVariants: ProductVariant[] = [];
                                        const seenColors = new Set<string>();
                                        item.variants.forEach(v => {
                                          if (v.color_name && v.color_name.toLowerCase() !== 'standard' && !seenColors.has(v.color_name)) {
                                            seenColors.add(v.color_name);
                                            uniqueColorVariants.push(v);
                                          }
                                        });

                                        // Extract unique sizes
                                        const uniqueSizes = Array.from(new Set(item.variants.map(v => v.size).filter(v => v && v.toLowerCase() !== 'standard'))) as string[];

                                        const selColor = selectedColors[item.id!];
                                        const selSize = selectedSizes[item.id!];

                                        return (
                                          <div className="flex flex-col gap-2 mb-2 z-20 relative">
                                            {/* Colors Row */}
                                            {isColorConfigured && uniqueColorVariants.length > 0 && (
                                              <div className="flex flex-col gap-0.5">
                                                <span className="text-[6.5px] md:text-[8.5px] font-black uppercase tracking-wider text-slate-400">Color: {selColor || 'Select'}</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                  {uniqueColorVariants.map((v) => {
                                                    const isColorSelected = selColor === v.color_name;
                                                    return (
                                                      <div 
                                                        key={v.id}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setSelectedColors(prev => ({ ...prev, [item.id!]: v.color_name }));
                                                          
                                                          // Auto-select size if not selected and only one size is available for this color
                                                          const sizesForColor = item.variants
                                                            ?.filter(pv => pv.color_name === v.color_name)
                                                            .map(pv => pv.size)
                                                            .filter(Boolean) || [];
                                                          if (isSizeConfigured && !selSize && sizesForColor.length === 1) {
                                                            setSelectedSizes(prev => ({ ...prev, [item.id!]: sizesForColor[0]! }));
                                                          }
                                                        }}
                                                        className={cn(
                                                          "w-4 h-4 rounded-full border shadow-sm cursor-pointer transition-all hover:scale-110",
                                                          isColorSelected 
                                                            ? "ring-2 ring-primary ring-offset-1 scale-110 border-primary" 
                                                            : "border-slate-100"
                                                        )}
                                                        style={{ backgroundColor: v.color_code }}
                                                        title={v.color_name}
                                                      />
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}

                                            {/* Sizes Row */}
                                            {isSizeConfigured && uniqueSizes.length > 0 && (
                                              <div className="flex flex-col gap-0.5">
                                                <span className="text-[6.5px] md:text-[8.5px] font-black uppercase tracking-wider text-slate-400">Size: {selSize || 'Select'}</span>
                                                <div className="flex flex-wrap gap-1">
                                                  {uniqueSizes.map((sz) => {
                                                    const isSizeSelected = selSize === sz;
                                                    const isAvailable = !selColor || item.variants?.some(v => v.color_name === selColor && v.size === sz);
                                                    return (
                                                      <button 
                                                        key={sz}
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setSelectedSizes(prev => ({ ...prev, [item.id!]: sz }));
                                                        }}
                                                        className={cn(
                                                          "px-1.5 py-0.5 text-[6.5px] md:text-[8px] font-black uppercase tracking-wider border rounded transition-all",
                                                          isSizeSelected 
                                                            ? "bg-slate-900 border-slate-900 text-white" 
                                                            : isAvailable 
                                                              ? "bg-white border-slate-200 text-slate-700 hover:border-slate-900" 
                                                              : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                                        )}
                                                      >
                                                        {sz}
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                   </div>

                                   <div className="flex justify-end items-center px-1 mt-auto">
                                      {!isSelected && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCustomItem(item, 'product', selectedVariant);
                                          }}
                                          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-primary hover:text-black transition-all shadow-sm"
                                        >
                                          <Plus size={16} className="md:w-5 md:h-5" />
                                        </button>
                                      )}
                                   </div>
                                   
                                   {isSelected && (
                                      <div className="mt-3 md:mt-6 pt-3 md:mt-6 border-t border-primary/20 flex items-center justify-center">
                                         <div className="flex items-center bg-white rounded-full p-0.5 md:p-1 border border-primary/30 shadow-lg">
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); updateBundleItemQuantity(item.id!, productBundleItems.find(x => x.item.id === item.id && (item.has_variants ? (x.item as any).selectedVariant?.id === selectedVariant?.id : true))!.quantity - 1, 'product', selectedVariant?.id); }}
                                              className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                                            ><Minus size={10} /></button>
                                            <span className="text-[9px] md:text-[11px] font-black w-6 text-center text-slate-900">{productBundleItems.find(x => x.item.id === item.id && (item.has_variants ? (x.item as any).selectedVariant?.id === selectedVariant?.id : true))?.quantity}</span>
                                            <button 
                                              onClick={(e) => { e.stopPropagation(); updateBundleItemQuantity(item.id!, productBundleItems.find(x => x.item.id === item.id && (item.has_variants ? (x.item as any).selectedVariant?.id === selectedVariant?.id : true))!.quantity + 1, 'product', selectedVariant?.id); }}
                                              className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                                            ><Plus size={10} /></button>
                                         </div>
                                      </div>
                                   )}
                                 </div>
                               )
                             })}
                             </motion.div>
                          ) : (
                           <motion.div 
                             key="services"
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6"
                           >
                             {services.map(item => {
                               const isSelected = !!serviceBundleItems.find(x => x.item.id === item.id);
                               return (
                                 <div 
                                   key={item.id} 
                                   className={cn(
                                     "p-2 md:p-6 rounded-[20px] md:rounded-[35px] border transition-all flex flex-col group relative h-full",
                                     isSelected ? "border-emerald-500 bg-emerald-50/50 shadow-xl shadow-emerald-500/5 transition-all duration-500" : "border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1"
                                   )}
                                 >
                                   <div 
                                     className="aspect-[4/3] md:aspect-square bg-slate-50 rounded-[12px] md:rounded-[30px] mb-2 md:mb-6 overflow-hidden shadow-inner relative group/img"
                                   >
                                      <CardHoverGallery 
                                        mainImage={item.img} 
                                        gallery={item.gallery} 
                                        alt={item.title} 
                                      />
                                      {isSelected && (
                                        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                                          <div className="bg-white text-emerald-500 p-1.5 md:p-3 rounded-full shadow-xl">
                                            <Check size={12} className="md:w-5 md:h-5 stroke-[3]" />
                                          </div>
                                        </div>
                                      )}
                                      <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/services`);
                                          }}
                                          className="pointer-events-auto flex items-center gap-1.5 md:gap-2 bg-white/95 backdrop-blur-md px-2.5 md:px-4 py-1.5 md:py-2 rounded-full text-slate-900 font-black uppercase tracking-widest text-[6px] md:text-[9px] transform translate-y-4 group-hover/img:translate-y-0 transition-all duration-500 shadow-2xl hover:bg-black hover:text-white group/btn"
                                        >
                                          <Eye size={8} className="md:w-[10px] text-black group-hover/btn:text-white transition-colors" />
                                          Quick View
                                        </button>
                                      </div>
                                   </div>
                                   <h5 className="font-bold text-slate-900 mb-0.5 truncate text-[10px] md:text-sm px-1 leading-tight">{item.title}</h5>
                                   <div className="flex justify-start items-center px-1 mb-1 md:mb-2">
                                      <Users className="w-2 md:w-3 h-2 md:h-3 text-slate-300 mr-1 md:mr-2" />
                                      <span className="text-[6px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[50px] md:max-w-none">{item.vendor || 'Hamza Decorations'}</span>
                                   </div>
                                   <div className="flex justify-between items-center px-1 mt-auto">
                                      <p className="text-emerald-600 font-black text-[10px] md:text-sm leading-none">Rs. {item.price.toLocaleString()}</p>
                                      {!isSelected && (
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCustomItem(item, 'service');
                                          }}
                                          className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                        >
                                          <Plus size={16} className="md:w-5 md:h-5" />
                                        </button>
                                      )}
                                   </div>
                                 </div>
                               )
                             })}

                           </motion.div>
                         )}
                      </AnimatePresence>
                    </div>

                    {/* Summary Sidelines */}
                    <div className="w-full lg:w-[380px] xl:w-[400px]">
                      <div className="space-y-6 md:space-y-8 sticky top-32">
                        {/* Product Bundle Summary */}
                        <div className="bg-white rounded-[30px] md:rounded-[50px] p-8 md:p-10 shadow-2xl border border-slate-100 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:scale-110 transition-transform">
                              <ShoppingBag size={80} className="text-slate-900" />
                           </div>
                           <div className="flex justify-between items-end mb-6 md:mb-8 relative z-10">
                              <div>
                                 <p className="text-3xl md:text-4xl font-semibold text-slate-900">Rs. {productTotal.toLocaleString()}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{productBundleItems.length} Products Chosen</p>
                              </div>
                              <button 
                                onClick={() => clearBundle('product')}
                                className="w-9 h-9 md:w-10 md:h-10 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                           <button 
                             onClick={handleFinalizeProductBundle}
                             disabled={productBundleItems.length === 0}
                             className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-primary hover:text-black transition-all shadow-lg shadow-slate-900/10 disabled:opacity-30 disabled:hover:bg-slate-900"
                           >
                              Order Products <ArrowRight size={14} />
                           </button>
                        </div>
  
                        {/* Service Bundle Summary */}
                        <div className="bg-white rounded-[30px] md:rounded-[50px] p-8 md:p-10 shadow-2xl border border-slate-100 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5 group-hover:scale-110 transition-transform">
                              <MessageCircle size={80} className="text-emerald-600" />
                           </div>
                           <div className="flex justify-between items-end mb-6 md:mb-8 relative z-10">
                              <div>
                                 <p className="text-3xl md:text-4xl font-semibold text-emerald-600">Rs. {serviceTotal.toLocaleString()}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{serviceBundleItems.length} Services Chosen</p>
                              </div>
                              <button 
                                onClick={() => clearBundle('service')}
                                className="w-9 h-9 md:w-10 md:h-10 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                           <button 
                             onClick={handleCustomServiceWhatsApp}
                             disabled={serviceBundleItems.length === 0}
                             className="w-full bg-emerald-500 text-white py-4 md:py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-30 disabled:hover:bg-emerald-500"
                           >
                              WhatsApp Order <MessageCircle size={14} />
                           </button>
                        </div>

                        <div className="p-8 md:p-10 bg-slate-900 rounded-[30px] md:rounded-[50px] text-white overflow-hidden relative shadow-2xl">
                            <Plus className="absolute -right-4 -bottom-4 w-24 md:w-32 h-24 md:h-32 text-white/5 rotate-12" />
                            <h5 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-3 md:mb-4 flex items-center">
                                <Calculator className="w-4 h-4 mr-3" /> Estimate
                            </h5>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl md:text-4xl font-semibold text-primary">Rs. {(productTotal + serviceTotal).toLocaleString()}</span>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      <ServiceBundleModal 
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
      />
    </div>
  );
}
