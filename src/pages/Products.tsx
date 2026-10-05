import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, MessageCircle, Search, Filter, Loader2, Plus, ShoppingCart, X, ChevronDown, Eye, Sparkles, Check } from 'lucide-react';
import { cn, getSizeFullName, formatProductVariantName } from '../lib/utils';
import { adminService, Product, ProductVariant, STATIC_PRODUCTS, STATIC_CATEGORIES } from '../lib/adminService';
import { useData } from '../context/DataContext';
import { useCart } from '../context/CartContext';
import { useBundle } from '../context/BundleContext';
import { Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';
import { SortDropdown } from '../components/SortDropdown';
import { CardSkeleton } from '../components/Skeleton';
import { VariantSelector } from '../components/VariantSelector';
import CardHoverGallery from '../components/CardHoverGallery';
import { toast } from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Popular' }
];

export default function Products() {
  const { getProducts, getCategories, products: cachedProducts, categories: cachedCategories } = useData();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(() => cachedProducts || []);
  const [categories, setCategories] = useState<any[]>(() => {
    return cachedCategories ? cachedCategories.filter((c: any) => c.type === 'product' || c.type === 'both') : [];
  });
  const [loading, setLoading] = useState(() => !cachedProducts || !cachedCategories);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'popular'
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToBundle, productBundleItems, removeFromBundle } = useBundle();
  
  // Variant Selection State
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Sync selected colors/sizes to selectedVariants to ensure full backward compatibility
  useEffect(() => {
    const updated: Record<string, any> = {};
    products.forEach(p => {
      if (p.has_variants && p.variants) {
        const isColorConfigured = p.colors_enabled !== undefined ? p.colors_enabled : (p.variants_enabled ?? true);
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
          // If only color is configured
          const fallbackCol = p.variants.find(v => v.color_name === selColor);
          if (fallbackCol) updated[p.id!] = fallbackCol;
        } else if (selSize && !isColorConfigured) {
          // If only size is configured
          const fallbackSz = p.variants.find(v => v.size === selSize);
          if (fallbackSz) updated[p.id!] = fallbackSz;
        }
      }
    });
    setSelectedVariants(updated);
  }, [selectedColors, selectedSizes, products]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (products.length === 0) setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      setProducts(productsData);
      setCategories(categoriesData.filter((c: any) => c.type === 'product' || c.type === 'both'));
    } catch (error) {
      console.error('ProductsPage Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const isActive = p.status !== 'inactive';
      
      return matchesCategory && matchesSearch && isActive;
    });

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date((b as any).created_at || (b as any).createdAt || 0).getTime() - new Date((a as any).created_at || (a as any).createdAt || 0).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date((a as any).created_at || (a as any).createdAt || 0).getTime() - new Date((b as any).created_at || (b as any).createdAt || 0).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => ((b as any).sales || 0) - ((a as any).sales || 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleAction = (product: Product, action: 'cart' | 'buy' | 'bundle') => {
    if (product.has_variants && product.variants && product.variants.length > 0) {
      const isColorConfigured = product.colors_enabled !== undefined ? product.colors_enabled : (product.variants_enabled ?? true);
      const isSizeConfigured = product.sizes_enabled ?? false;
      const selColor = selectedColors[product.id!];
      const selSize = selectedSizes[product.id!];
      
      const missingColor = isColorConfigured && !selColor;
      const missingSize = isSizeConfigured && !selSize;

      if (missingColor && missingSize) {
        toast.error("Please select color and size");
        return;
      }
      if (missingColor) {
        toast.error("Please select color");
        return;
      }
      if (missingSize) {
        toast.error("Please select size");
        return;
      }
      
      const selectedVariant = selectedVariants[product.id!];
      if (!selectedVariant) {
        toast.error("Selected combination is not available or out of stock.");
        return;
      }
      executeAction(product, action, selectedVariant);
    } else {
      executeAction(product, action);
    }
  };

  const executeAction = (product: Product, action: 'cart' | 'buy' | 'bundle', variant?: any) => {
    const finalItem = variant ? { ...product, selectedVariant: variant } : product;
    
    switch (action) {
      case 'cart':
        addToCart(finalItem, 'product');
        break;
      case 'buy':
        navigate('/checkout', { state: { items: [{ item: finalItem, quantity: 1, type: 'product' }] } });
        break;
      case 'bundle':
        addToBundle(finalItem, 'product');
        break;
    }
  };

  return (
    <div className="pt-20 md:pt-32 pb-12 md:pb-20 px-2 md:px-6 min-h-screen bg-bg-dark relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="mb-4 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-end justify-between gap-2 md:gap-8"
          >
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-7xl font-semibold text-slate-900 leading-tight">Featured <span className="text-primary">Products</span></h1>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 md:w-5 md:h-5 transition-colors group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-full py-3.5 md:py-5 pl-12 md:pl-14 pr-6 text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-xl shadow-slate-100 placeholder:text-slate-300 text-sm"
              />
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-1 lg:gap-12">
          {/* Sidebar Filters (Desktop Only) */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-72 space-y-10 order-1"
          >
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center">
                <Filter className="w-3.5 h-3.5 mr-3" /> Categories
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={cn(
                    "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left border shadow-sm",
                    selectedCategory === 'All' 
                      ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10" 
                      : "bg-white text-slate-400 border-slate-100 hover:border-primary hover:text-slate-900"
                  )}
                >
                  All Items
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={cn(
                      "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left border shadow-sm",
                      selectedCategory === cat.name 
                        ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10" 
                        : "bg-white text-slate-400 border-slate-100 hover:border-primary hover:text-slate-900"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[40px] bg-bg-alt border border-slate-100 shadow-sm relative overflow-hidden group">
                <ShoppingBag className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-200/50 group-hover:scale-110 transition-transform" />
                <h4 className="font-black text-slate-900 text-sm mb-3 flex items-center uppercase tracking-widest relative z-10">Special Orders</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-6 leading-relaxed font-bold relative z-10">Looking for something unique? We make custom gift packs for your wedding theme.</p>
                <Link to="/contact" className="text-[11px] font-black text-primary uppercase tracking-[0.2em] hover:gap-3 transition-all flex items-center gap-2 relative z-10 w-full text-left">
                    Talk to Us <MessageCircle className="w-4 h-4" />
                </Link>
            </div>
          </motion.aside>

          {/* Categories Mobile (Horizontal Scroll) */}
          <div className="lg:hidden w-full mb-1 relative z-20">
            <div className="flex overflow-x-auto gap-2 no-scrollbar snap-x pb-0">
              <button
                onClick={() => setSelectedCategory('All')}
                className={cn(
                  "px-4 py-2.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border shadow-sm whitespace-nowrap snap-start",
                  selectedCategory === 'All' 
                    ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                    : "bg-white text-slate-400 border-slate-100 hover:border-primary hover:text-slate-900"
                )}
              >
                All Items
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "px-4 py-2.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all border shadow-sm whitespace-nowrap snap-start",
                    selectedCategory === cat.name 
                      ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                      : "bg-white text-slate-400 border-slate-100 hover:border-primary hover:text-slate-900"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 order-2">
            <div className="flex flex-row items-center justify-between mb-1 md:mb-10 gap-4">
                <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">
                  Showing <span className="text-slate-900">{filteredAndSortedProducts.length}</span> items
                </p>
                <div className="w-auto">
                  <SortDropdown 
                    options={SORT_OPTIONS}
                    value={sortBy}
                    onChange={setSortBy}
                  />
                </div>
            </div>

            {loading && products.length === 0 ? (
               <CardSkeleton count={10} gridCols="grid-cols-2 lg:grid-cols-5" />
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-0.5 md:gap-2">
                <AnimatePresence mode="popLayout">
                   {filteredAndSortedProducts.map((p, idx) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      className="group bg-white border border-slate-100 rounded-[20px] md:rounded-[30px] p-1.5 md:p-2.5 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                    >
                        <div 
                          className="aspect-[3/4] md:aspect-[3/4.5] bg-slate-50 mb-2 md:mb-3 overflow-hidden rounded-[15px] md:rounded-[25px] shadow-inner relative group/img"
                        >
                            <CardHoverGallery 
                               mainImage={p.img} 
                              gallery={p.gallery} 
                              alt={p.title} 
                            />
                            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/product/${p.id}`);
                              }}
                              className="pointer-events-auto flex items-center gap-1 md:gap-1.5 bg-white/95 backdrop-blur-md px-1.5 md:px-2.5 py-1 md:py-1.5 rounded-full text-slate-900 font-black uppercase tracking-widest text-[5px] md:text-[8px] transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-2xl hover:bg-black hover:text-white group/btn"
                            >
                              <Eye size={6} className="md:w-2 text-black group-hover/btn:text-white transition-colors" />
                              Quick View
                            </button>
                          </div>
                  <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-white/90 backdrop-blur-md px-1.5 md:px-2 py-0.5 md:py-1 rounded-full shadow-sm text-[5px] md:text-[7px] font-black text-slate-900 uppercase">
                    {p.category}
                  </div>
                </div>
                <h4 className="text-[12px] md:text-lg font-semibold text-slate-900 mb-0.5 md:mb-1 truncate px-1 cursor-pointer" title={formatProductVariantName(p.title, selectedColors[p.id!], selectedSizes[p.id!])}>
                  <Link to={`/product/${p.id}`}>
                    {formatProductVariantName(p.title, selectedColors[p.id!], selectedSizes[p.id!])}
                  </Link>
                </h4>
                
                <div className="flex items-center justify-between mb-2 md:mb-3 px-1">
                   <div className="flex flex-col">
                      <span className="text-[6px] md:text-[11px] text-slate-300 line-through font-black">Rs. {(p.price * 1.2).toLocaleString()}</span>
                      <span className="text-[5px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none"></span>
                   </div>
                   <div className="flex flex-col items-end">
                      <p className="text-primary font-black text-[11px] md:text-lg leading-none">Rs. {p.price.toLocaleString()}</p>
                      <span className="text-[5px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none"></span>
                   </div>
                </div>

                  {p.has_variants && p.variants && p.variants.length > 0 && (() => {
                    const isColorConfigured = p.colors_enabled !== undefined ? p.colors_enabled : (p.variants_enabled ?? true);
                    const isSizeConfigured = p.sizes_enabled ?? false;

                    // Extract unique colors, filtering out empty, invalid or 'Standard' color names
                    const uniqueColorVariants: ProductVariant[] = [];
                    const seenColors = new Set<string>();
                    p.variants.forEach(v => {
                      if (v.color_name && v.color_name.toLowerCase() !== 'standard' && !seenColors.has(v.color_name)) {
                        seenColors.add(v.color_name);
                        uniqueColorVariants.push(v);
                      }
                    });

                    // Extract unique sizes, filtering out empty or invalid/Standard sizes
                    const uniqueSizes = Array.from(new Set(p.variants.map(v => v.size).filter(v => v && v.toLowerCase() !== 'standard'))) as string[];

                    const selColor = selectedColors[p.id!];
                    const selSize = selectedSizes[p.id!];

                    return (
                      <div className="flex flex-col gap-2 mb-4 px-1 md:px-2 z-20 relative">
                        {/* Colors Row */}
                        {isColorConfigured && uniqueColorVariants.length > 0 && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[6.5px] md:text-[9px] font-black uppercase tracking-wider text-slate-400">Color: {selColor || 'Select'}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {uniqueColorVariants.map((v) => {
                                const isColorSelected = selColor === v.color_name;
                                return (
                                  <div 
                                    key={v.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedColors(prev => ({ ...prev, [p.id!]: v.color_name }));
                                    }}
                                    className={cn(
                                      "w-4 h-4 rounded-full border shadow-sm cursor-pointer transition-all hover:scale-110",
                                      isColorSelected 
                                        ? "ring-2 ring-primary ring-offset-2 scale-110 border-primary" 
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
                          <div className="flex flex-col gap-1">
                            <span className="text-[6.5px] md:text-[9px] font-black uppercase tracking-wider text-slate-400">Size: {selSize ? getSizeFullName(selSize) : 'Select'}</span>
                            <div className="flex flex-wrap gap-1">
                              {uniqueSizes.map((sz) => {
                                const isSizeSelected = selSize === sz;
                                const isAvailable = !selColor || p.variants?.some(v => v.color_name === selColor && v.size === sz);
                                return (
                                  <button 
                                    key={sz}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSizes(prev => ({ ...prev, [p.id!]: sz }));
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
                      <div className="grid grid-cols-2 gap-1.5 md:gap-4 mt-auto">
                        <motion.button 
                            onClick={() => handleAction(p, 'cart')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="py-2 md:py-4 bg-slate-900 text-white text-[7px] md:text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all rounded-lg md:rounded-2xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-1 md:gap-2"
                        >
                          <ShoppingCart className="w-2.5 md:w-4 h-2.5 md:h-4" />
                          Cart
                        </motion.button>
                        <motion.button 
                            onClick={() => handleAction(p, 'buy')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="py-2 md:py-4 bg-primary text-black text-[7px] md:text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all rounded-lg md:rounded-2xl shadow-lg shadow-primary/10 flex items-center justify-center gap-1 md:gap-2"
                        >
                          <ShoppingBag className="w-2.5 md:w-4 h-2.5 md:h-4" />
                          Buy
                        </motion.button>
                      </div>
                        <motion.button 
                          onClick={() => handleAction(p, 'bundle')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "w-full mt-1.5 md:mt-3 py-2 md:py-4 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 md:gap-3 shadow-sm",
                            productBundleItems.some(i => i.item.id === p.id && (!p.has_variants || (i.item as any).selectedVariant?.id === selectedVariants[p.id!]?.id))
                              ? "bg-slate-100 text-slate-400"
                              : "bg-bg-alt text-slate-600 hover:bg-emerald-500 hover:text-white"
                          )}
                      >
                        <Plus className="w-2.5 md:w-4 h-2.5 md:h-4" />
                        {productBundleItems.some(i => i.item.id === p.id && (!p.has_variants || (i.item as any).selectedVariant?.id === selectedVariants[p.id!]?.id)) ? 'In Bundle' : 'Add to Bundle'}
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : !loading ? (
                <div className="py-40 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                  <ShoppingBag className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-slate-400 mb-6">Our collection is empty</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">We are adding beautiful wedding items soon.</p>
                </div>
            ) : (
               <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-10">
                 {[1,2,3].map(i => <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-[30px]"></div>)}
               </div>
            )}

            {/* Special Orders Mobile (After Grid) */}
            <div className="lg:hidden mt-8 p-8 rounded-[30px] bg-bg-alt border border-slate-100 shadow-sm relative overflow-hidden group">
                <ShoppingBag className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-200/50 group-hover:scale-110 transition-transform" />
                <h4 className="font-black text-slate-900 text-sm mb-3 flex items-center uppercase tracking-widest relative z-10">Special Orders</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-6 leading-relaxed font-bold relative z-10">Looking for something unique? We make custom gift packs for your wedding theme.</p>
                <Link to="/contact" className="text-[11px] font-black text-primary uppercase tracking-[0.2em] hover:gap-3 transition-all flex items-center gap-2 relative z-10 w-full text-left">
                    Talk to Us <MessageCircle className="w-4 h-4" />
                </Link>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
