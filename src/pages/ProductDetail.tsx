import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService, Product, Review, ProductVariant } from '../lib/adminService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MessageCircle, 
  Star, 
  ShoppingCart, 
  ShoppingBag,
  ShieldCheck, 
  Truck, 
  Clock,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Gift,
  Zap,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useBundle } from '../context/BundleContext';
import { useData } from '../context/DataContext';
import { cn, getSizeFullName, formatProductVariantName } from '../lib/utils';
import ReviewSection from '../components/ReviewSection';
import { useWhatsAppOrder } from '../hooks/useWhatsAppOrder';
import ImageGallery from '../components/ImageGallery';
import { WhatsAppDetailsModal } from '../components/WhatsAppDetailsModal';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';
import CardHoverGallery from '../components/CardHoverGallery';
import { Eye } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToBundle } = useBundle();
  const { initiateWhatsAppOrder, isModalOpen, setIsModalOpen, handleConfirmDetails } = useWhatsAppOrder();
  const { products } = useData();

  const [product, setProduct] = useState<Product | null>(() => {
    if (!id || !products) return null;
    return products.find(p => p.id === id) || null;
  });
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(() => {
    if (!product || !products) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id && p.status === 'active').slice(0, 4);
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(() => !product);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Resolve matching ProductVariant from selectedColor and selectedSize states
  useEffect(() => {
    if (product?.has_variants && product.variants) {
      const isColorConfigured = product.colors_enabled !== undefined ? product.colors_enabled : (product.variants_enabled ?? true);
      const isSizeConfigured = product.sizes_enabled ?? false;
      
      const found = product.variants.find(v => {
        const matchCol = !isColorConfigured || v.color_name === selectedColor;
        const matchSz = !isSizeConfigured || v.size === selectedSize;
        return matchCol && matchSz;
      });
      setSelectedVariant(found || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedSize, product]);

  useEffect(() => {
    if (id) fetchProductData(id);
  }, [id, products]);

  const fetchProductData = async (productId: string) => {
    const cachedProduct = products?.find(p => p.id === productId);
    if (!cachedProduct) {
      setLoading(true);
    }
    try {
      const data = await adminService.getProductById(productId);
      setProduct(data);
      
      // Ensure variants are unselected initially
      if (data?.has_variants) {
        setSelectedColor(null);
        setSelectedSize(null);
      } else {
        setSelectedColor(null);
        setSelectedSize(null);
      }
      
      // Fetch related products
      const allProducts = products || await adminService.getProducts();
      setRelatedProducts(allProducts.filter(p => p.category === data.category && p.id !== data.id && p.status === 'active').slice(0, 4));
      
      // Fetch reviews
      const reviewsData = await adminService.getApprovedReviews(productId);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateVariantSelection = (): boolean => {
    if (!product) return false;
    if (product.has_variants && product.variants && product.variants.length > 0) {
      const isColorConfigured = product.colors_enabled !== undefined ? product.colors_enabled : (product.variants_enabled ?? true);
      const isSizeConfigured = product.sizes_enabled ?? false;
      
      const missingColor = isColorConfigured && !selectedColor;
      const missingSize = isSizeConfigured && !selectedSize;

      if (missingColor && missingSize) {
        toast.error("Please select color and size");
        const variantPicker = document.getElementById('variant-picker');
        if (variantPicker) {
          variantPicker.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
      
      if (missingColor) {
        toast.error("Please select color");
        const variantPicker = document.getElementById('variant-picker');
        if (variantPicker) {
          variantPicker.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
      
      if (missingSize) {
        toast.error("Please select size");
        const variantPicker = document.getElementById('variant-picker');
        if (variantPicker) {
          variantPicker.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (product) {
      if (!validateVariantSelection()) return;
      
      const itemToSave = selectedVariant 
        ? { ...product, selectedVariant } 
        : product;
      addToCart(itemToSave, 'product');
    }
  };

  const handleBuyNow = () => {
    if (product) {
      if (!validateVariantSelection()) return;
      
      const itemToSave = selectedVariant 
        ? { ...product, selectedVariant } 
        : product;
      navigate('/checkout', { state: { items: [{ item: itemToSave, quantity: 1, type: 'product' }] } });
    }
  };

  const handleWhatsAppOrder = () => {
    if (product) {
      if (!validateVariantSelection()) return;

      const variantDesc = selectedVariant
        ? [selectedColor, selectedSize].filter(Boolean).join(' / ')
        : '';
      const title = variantDesc
        ? `${product.title} (${variantDesc})`
        : product.title;
      
      initiateWhatsAppOrder([{
        title,
        price: product.price,
        quantity: 1,
        type: 'product',
        description: product.description
      }]);
    }
  };

  const handleAddToBundle = () => {
    if (product) {
      if (!validateVariantSelection()) return;
      const itemToSave = selectedVariant 
        ? { ...product, selectedVariant } 
        : product;
      addToBundle(itemToSave, 'product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!product || product.status === 'inactive') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6">
        <h2 className="text-3xl font-semibold text-slate-900 mb-4 text-center">Product Currently Unavailable</h2>
        <Link to="/products" className="text-primary font-black uppercase tracking-widest text-xs underline underline-offset-8">Back to Shop</Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  // Compute unique colors and available sizes
  const uniqueColors: { color_name: string; color_code?: string; variants: ProductVariant[] }[] = [];
  const seenColors = new Set<string>();
  product.variants?.forEach(v => {
    if (v.color_name && v.color_name.toLowerCase() !== 'standard' && !seenColors.has(v.color_name)) {
      seenColors.add(v.color_name);
      uniqueColors.push({
        color_name: v.color_name,
        color_code: v.color_code,
        variants: product.variants?.filter(pv => pv.color_name === v.color_name) || []
      });
    }
  });

  const orderOfSizes = ['S', 'M', 'L', 'XL'];
  const availableSizesForProduct = Array.from(
    new Set(
      product.variants?.map(v => v.size).filter(v => v && v.toLowerCase() !== 'standard') as string[]
    )
  ).sort((a, b) => {
    const idxA = orderOfSizes.indexOf(a.toUpperCase());
    const idxB = orderOfSizes.indexOf(b.toUpperCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
  
  const hasSizeVariants = product.variants?.some(v => v.size);

  return (
    <div className="pt-20 md:pt-32 pb-12 md:pb-20 px-4 md:px-20 max-w-7xl mx-auto relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      <WhatsAppDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDetails}
      />
      <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-1 md:mb-12 uppercase tracking-widest text-[8px] md:text-[10px] font-black relative z-10">
        <ArrowLeft size={14} className="md:w-4 md:h-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-24 mb-12 md:mb-32 relative z-10">
        {/* Left: Images */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-[20px] md:rounded-none"
        >
          <ImageGallery 
            mainImage={product.img} 
            gallery={product.gallery} 
            title={product.title} 
          />
        </motion.div>

        {/* Right: Info */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
            <div className="flex -space-x-2 items-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 md:w-10 md:h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 20}`} 
                    alt="Client" 
                    className="w-full h-full object-cover bg-slate-50"
                  />
                </div>
              ))}
            </div>
            <div className="text-slate-400 text-[6px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] leading-none">
              Trusted by 200+ Clients
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-6">
            <span className="px-2 md:px-4 py-0.5 md:py-1 bg-primary/10 text-primary text-[7px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
              {product.category}
            </span>
            {product.stock > 0 ? (
              <span className="flex items-center gap-1 text-green-500 text-[7px] md:text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 size={10} className="md:w-[12px] md:h-[12px]" />
                In Stock ({product.stock})
              </span>
            ) : (
              <span className="text-red-500 text-[7px] md:text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
            )}
          </div>

          <h1 className="text-2xl md:text-5xl lg:text-6xl font-semibold text-slate-900 leading-tight mb-3 md:mb-6">{product.title}</h1>
          
          <div className="flex items-center gap-3 md:gap-6 mb-4 md:mb-8">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-xs text-slate-400 line-through font-black uppercase tracking-widest mb-0.5 leading-none">Rs. {(product.price * 1.2).toLocaleString()}</span>
              <p className="text-xl md:text-4xl font-black text-slate-900 font-sans leading-none">Rs. {product.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1 h-5 md:h-6 px-2 md:px-3 bg-slate-50 rounded-full border border-slate-100">
              <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-primary text-primary" />
              <span className="text-[8px] md:text-[10px] font-black text-slate-900">{averageRating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-slate-500 text-xs md:text-lg leading-relaxed mb-6 md:mb-12">
            {product.description}
          </p>

          {product.has_variants && product.variants && product.variants.length > 0 && (
            <div id="variant-picker" className="mb-4 md:mb-8 p-4 md:p-6 rounded-2xl md:rounded-[30px] border transition-all duration-500 shadow-sm bg-slate-50 border-slate-100 relative z-10 w-full">
              <div className="flex flex-col gap-6">
                {/* 1. SIZES SECTION (Shown FIRST) */}
                {(product.sizes_enabled ?? false) && availableSizesForProduct.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans">Select Size</span>
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white border border-slate-100 px-2 py-0.5 rounded-full font-sans shadow-sm">
                        {selectedSize ? getSizeFullName(selectedSize) : 'Not Selected'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {availableSizesForProduct.map((size) => {
                        const isSizeSelected = selectedSize === size;
                        const isColorConfigured = product.colors_enabled !== undefined ? product.colors_enabled : (product.variants_enabled ?? true);
                        
                        // Check if this size option exists/has stock
                        let isOutOfStock = false;
                        let isAvailable = true;
                        
                        // If color is already selected, check stock for that combination
                        if (selectedColor && isColorConfigured) {
                          const combo = product.variants?.find(v => v.color_name === selectedColor && v.size === size);
                          if (!combo) {
                            isAvailable = false;
                          } else if (combo.stock_quantity <= 0) {
                            isOutOfStock = true;
                          }
                        } else {
                          // Check if size is in stock in ANY color/variant
                          const hasStock = product.variants?.some(v => v.size === size && v.stock_quantity > 0);
                          if (!hasStock) {
                            isOutOfStock = true;
                          }
                        }
                        
                        const isDisabled = !isAvailable || isOutOfStock;
                        
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedSize(size);
                            }}
                            className={cn(
                              "h-8 md:h-11 px-3 md:px-5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center relative",
                              isSizeSelected 
                                ? "bg-slate-900 text-white border-slate-900 scale-105 shadow-md" 
                                : isDisabled
                                  ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed opacity-40"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-900 hover:bg-slate-50"
                            )}
                          >
                            {size}
                            {isOutOfStock && (
                              <span className="absolute -top-1 -right-1 text-[6px] bg-red-500 text-white font-black px-1 rounded-full scale-75 uppercase font-sans">
                                Out
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. COLORS SECTION (Shown BELOW sizes) */}
                {(product.colors_enabled !== undefined ? product.colors_enabled : (product.variants_enabled ?? true)) && uniqueColors.length > 0 && (
                  <div className={cn("space-y-3 pt-6 border-t border-slate-200/60", !(product.sizes_enabled ?? false) && "border-t-0 pt-0")}>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans">Select Color</span>
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white border border-slate-100 px-2 py-0.5 rounded-full font-sans shadow-sm">
                        {selectedColor || 'Not Selected'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {uniqueColors.map((color) => {
                        const isColorSelected = selectedColor === color.color_name;
                        
                        // Check if color is available/has stock for selected size
                        let isOutOfStock = false;
                        let isAvailable = true;
                        
                        if (selectedSize && (product.sizes_enabled ?? false)) {
                          const combo = product.variants?.find(v => v.color_name === color.color_name && v.size === selectedSize);
                          if (!combo) {
                            isAvailable = false;
                          } else if (combo.stock_quantity <= 0) {
                            isOutOfStock = true;
                          }
                        } else {
                          const hasStock = product.variants?.some(v => v.color_name === color.color_name && v.stock_quantity > 0);
                          if (!hasStock) {
                            isOutOfStock = true;
                          }
                        }
                        
                        const isDisabled = !isAvailable || isOutOfStock;
                        
                        return (
                          <button
                            key={color.color_name}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedColor(color.color_name);
                            }}
                            className={cn(
                              "relative w-8 h-8 md:w-11 md:h-11 rounded-xl transition-all duration-350 flex items-center justify-center group shrink-0",
                              isColorSelected 
                                ? "ring-2 md:ring-4 ring-primary ring-offset-2 md:ring-offset-4 ring-offset-white scale-110 shadow-lg" 
                                : isDisabled
                                  ? "opacity-30 cursor-not-allowed scale-95"
                                  : "hover:scale-105 shadow-sm border border-slate-200"
                            )}
                            style={{ backgroundColor: color.color_code }}
                            title={color.color_name}
                          >
                            {isColorSelected && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center shadow border border-white z-10">
                                <CheckCircle2 size={10} className="text-primary" />
                              </div>
                            )}
                            {isDisabled && (
                              <div className="absolute inset-0 bg-slate-200/50 rounded-xl flex items-center justify-center z-10">
                                <span className="text-[7px] font-black text-slate-500 uppercase leading-none scale-75">N/A</span>
                              </div>
                            )}
                            <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/5 transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 md:gap-4 mb-6 md:mb-12">
            <div className="p-3 md:p-6 bg-slate-50 rounded-xl md:rounded-3xl border border-slate-100 flex items-start gap-2 md:gap-4">
              <ShieldCheck className="text-primary w-4 h-4 md:w-6 md:h-6 mt-1" />
              <div>
                <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 mb-0.5 leading-none">Authenticity</p>
                <p className="text-[8px] md:text-xs text-slate-500 font-medium whitespace-nowrap leading-none">Handcrafted</p>
              </div>
            </div>
            <div className="p-3 md:p-6 bg-slate-50 rounded-xl md:rounded-3xl border border-slate-100 flex items-start gap-2 md:gap-4">
              <Truck className="text-primary w-4 h-4 md:w-6 md:h-6 mt-1" />
              <div>
                <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 mb-0.5 leading-none">Delivery</p>
                <p className="text-[8px] md:text-xs text-slate-500 font-medium whitespace-nowrap leading-none">3-5 Days</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 md:gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="py-3 md:py-6 bg-primary text-black rounded-full font-black uppercase tracking-widest text-[8px] md:text-xs flex items-center justify-center gap-1.5 md:gap-3 shadow-xl shadow-primary/10 hover:bg-slate-900 hover:text-white transition-all underline decoration-slate-900/10"
              >
                <Zap size={14} className="md:w-[18px] md:h-[18px]" />
                Buy Now
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="py-3 md:py-6 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[8px] md:text-xs flex items-center justify-center gap-1.5 md:gap-3 shadow-xl shadow-slate-900/10 hover:bg-primary hover:text-black transition-all"
              >
                <ShoppingCart size={14} className="md:w-[18px] md:h-[18px]" />
                Add to Cart
              </motion.button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 md:gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToBundle}
                className="py-3 md:py-6 bg-bg-alt text-slate-900 border border-slate-100 rounded-full font-black uppercase tracking-widest text-[8px] md:text-xs flex items-center justify-center gap-1.5 md:gap-3 transition-all hover:bg-emerald-50"
              >
                <Gift size={14} className="md:w-[18px] md:h-[18px]" />
                To Bundle
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsAppOrder}
                className="py-3 md:py-6 bg-green-500 text-white rounded-full font-black uppercase tracking-widest text-[8px] md:text-xs flex items-center justify-center gap-1.5 md:gap-3 transition-all shadow-lg hover:bg-green-600"
              >
                <MessageCircle size={14} className="md:w-[18px] md:h-[18px]" />
                WhatsApp
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs Section */}
      <div className="mb-20 md:mb-32 relative z-10">
        <div className="flex border-b border-slate-100 mb-8 md:mb-12 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab('details')}
            className={cn(
              "px-6 md:px-10 py-4 md:py-6 text-xs md:text-sm font-black uppercase tracking-widest relative transition-all whitespace-nowrap",
              activeTab === 'details' ? "text-slate-900" : "text-slate-300 hover:text-slate-500"
            )}
          >
            Details
            {activeTab === 'details' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={cn(
              "px-6 md:px-10 py-4 md:py-6 text-xs md:text-sm font-black uppercase tracking-widest relative transition-all whitespace-nowrap",
              activeTab === 'reviews' ? "text-slate-900" : "text-slate-300 hover:text-slate-500"
            )}
          >
            Reviews ({reviews.length})
            {activeTab === 'reviews' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
          </button>
        </div>

        <div className="min-h-[200px] md:min-h-[300px]">
          {activeTab === 'details' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4 md:space-y-6">
                <h4 className="text-lg md:text-xl font-semibold text-slate-900 mb-3 md:mb-4">Features</h4>
                <ul className="space-y-3 md:space-y-4">
                  {product.features?.length ? product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-500">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {f}
                    </li>
                  )) : (
                    <>
                      <li className="flex items-center gap-3 text-slate-500">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Best Wedding Item
                      </li>
                      <li className="flex items-center gap-3 text-slate-500">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        High Quality Material
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <ReviewSection itemId={product.id} itemType="product" />
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="relative z-10">
          <div className="flex items-center justify-between mb-10 md:mb-16 px-2">
            <h2 className="text-2xl md:text-4xl font-semibold text-slate-900">Related Products</h2>
            <Link to="/products" className="text-slate-400 hover:text-primary transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group">
              See All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {relatedProducts.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col"
              >
                <div className="aspect-[4/5] bg-slate-50 rounded-[30px] md:rounded-[50px] overflow-hidden mb-4 md:mb-6 border border-slate-100 shadow-sm relative group/img">
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
                      className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-slate-900 font-black uppercase tracking-widest text-[7px] transform translate-y-4 group-hover/img:translate-y-0 transition-all duration-500 shadow-2xl hover:bg-black hover:text-white group/btn"
                    >
                      <Eye size={10} className="text-black group-hover/btn:text-white transition-colors" />
                      Quick View
                    </button>
                  </div>
                </div>
                <h4 className="text-base md:text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors mb-2 cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>{p.title}</h4>
                <p className="text-slate-900 font-black text-sm">Rs. {p.price.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
