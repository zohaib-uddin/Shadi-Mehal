import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Star, 
  CheckCircle, 
  Calendar, 
  Users,
  Camera,
  Heart,
  Music,
  Cake,
  UtensilsCrossed,
  Gift,
  Bell,
  Loader2,
  Sparkles,
  ShoppingBag,
  X,
  Maximize2,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { adminService, Product, Service, Feedback, STATIC_SERVICES, STATIC_PRODUCTS, STATIC_CATEGORIES, STATIC_GALLERY, STATIC_FEEDBACK, STATIC_DEALS } from '../lib/adminService';
import { useData } from '../context/DataContext';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';
import { Skeleton, CardSkeleton, GallerySkeleton } from '../components/Skeleton';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { SortDropdown } from '../components/SortDropdown';
import { img } from 'motion/react-client';
import banner1 from '../assets/banner/banner1.webp';

const PRODUCT_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Most Popular' }
];

const PRODUCT_SORT_OPTIONS_MOBILE = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' }
];

const SERVICE_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' }
];

const DEAL_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' }
];

const CategorySlider = ({ categories }: { categories: any[] }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
      const step = clientWidth * (window.innerWidth < 768 ? 0.9 : 0.8);
      let scrollTo = direction === 'left' ? scrollLeft - step : scrollLeft + step;
      
      if (scrollTo < 0) scrollTo = 0;
      if (scrollTo > scrollWidth - clientWidth) scrollTo = scrollWidth - clientWidth;

      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!isAutoScrolling || isInteracting) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scroll('right');
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoScrolling, isInteracting]);

  if (!categories || categories.length === 0) return null;

  const uniqueCategories = categories.reduce((acc: any[], current) => {
    const x = acc.find(item => item.name.toLowerCase() === current.name.toLowerCase());
    if (!x) return acc.concat([current]);
    return acc;
  }, []);

  const getWeddingIcon = (name: string) => {
    const n = name.toLowerCase();
    const iconClass = "w-5 h-5 md:w-8 md:h-8";
    if (n.includes('wedding') || n.includes('shadi')) return <Heart className={iconClass} />;
    if (n.includes('mehndi') || n.includes('hina')) return <Music className={iconClass} />;
    if (n.includes('baraat') || n.includes('tray')) return <Gift className={iconClass} />;
    if (n.includes('decor') || n.includes('stage')) return <Camera className={iconClass} />;
    if (n.includes('cake') || n.includes('birth')) return <Cake className={iconClass} />;
    if (n.includes('food') || n.includes('cater')) return <UtensilsCrossed className={iconClass} />;
    if (n.includes('gift') || n.includes('box')) return <Gift className={iconClass} />;
    if (n.includes('flower') || n.includes('floral')) return <Sparkles className={iconClass} />;
    if (n.includes('invite') || n.includes('card')) return <Bell className={iconClass} />;
    return <Star className={iconClass} />;
  };

  return (
    <section className="py-8 md:py-16 px-4 md:px-10 lg:px-20 bg-white relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6 md:mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-7xl font-semibold text-slate-900 leading-tight">Best Categories</h2>
                 <div className="h-1 md:h-1.5 w-24 md:w-48 bg-primary rounded-full shadow-[0_0_20px_rgba(255,210,0,0.5)] mt-2"></div>


          </motion.div>
        </div>

        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
          className="flex overflow-x-auto pb-4 md:pb-8 snap-x scroll-smooth no-scrollbar cursor-grab active:cursor-grabbing gap-4 md:gap-8"
        >
          {uniqueCategories.map((cat, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={cat.id}
              className="w-[calc(50%-1rem)] md:w-[400px] flex-shrink-0"
            >
              <Link 
                to={`/category/${cat.id}`} 
                className="snap-start group block h-full"
              >
                <div className="bg-bg-alt border border-slate-100 p-4 md:p-10 rounded-[20px] md:rounded-[50px] relative overflow-hidden transition-all duration-700 hover:bg-slate-900 group-hover:-translate-y-2 md:group-hover:-translate-y-4 shadow-lg hover:shadow-[0_40px_80px_rgba(15,23,42,0.2)] h-full flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="absolute -top-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-primary/5 rounded-full group-hover:bg-primary/20 transition-colors duration-700" />
                  
                  <div className="w-10 h-10 md:w-20 md:h-20 bg-white rounded-xl md:rounded-3xl flex items-center justify-center text-primary mb-3 md:mb-10 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-slate-50">
                    {getWeddingIcon(cat.name)}
                  </div>
                  
                  <h3 className="text-sm md:text-3xl font-semibold text-slate-900 mb-1 md:mb-4 group-hover:text-white transition-colors">{cat.name}</h3>
                  
                  <div className="flex items-center justify-between mt-auto w-full">
                    <p className="text-[6px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] group-hover:text-primary/70">
                      {cat.type}
                    </p>
                    <div className="w-6 h-6 md:w-10 md:h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all">
                      <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform md:w-3.5 md:h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TESTIMONIALS = [
  { name: "Ahmed Malik", city: "Attock", date: "March 15, 2026", rating: 5, comment: "The wedding decor was absolutely breathtaking. Every detail in the floral arrangements spoke of premium quality. Highly recommended in Attock!" },
  { name: "Sara Khan", city: "Lahore", date: "April 02, 2026", rating: 5, comment: "I ordered a customized photography bundle for my sister's wedding. The team was professional and the results were beyond expectations." },
  { name: "Zeeshan Ali", city: "Attock", date: "February 20, 2026", rating: 4, comment: "Great experience with the stage setup. The lighting was perfect. A bit on the expensive side but totally worth the premium feel." },
  { name: "Maria Bibi", city: "Islamabad", date: "May 10, 2026", rating: 5, comment: "Their flower decor is the best in the region. They transformed the simple hall into a dreamy venue. Excellent service!" },
  { name: "Usman Sheikh", city: "Attock", date: "January 25, 2026", rating: 5, comment: "Professionalism at its peak. The catering and decor bundle we took for our corporate event was managed flawlessly." },
  { name: "Fatima Zahra", city: "Rawalpindi", date: "March 28, 2026", rating: 5, comment: "The attention to detail in their photography is commendable. They captured every precious moment perfectly." },
  { name: "Bilal Ahmed", city: "Attock", date: "April 15, 2026", rating: 5, comment: "Truly the elite service provider in Attock. Their team is dedicated and very creative with Mehndi stage designs." },
  { name: "Ayesha Noor", city: "Attock", date: "May 02, 2026", rating: 4, comment: "Loved the anniversary decor. The color theme was exactly what I asked for. Very satisfied with the outcome." }
];

const HERO_BANNERS = [
  banner1
];

export default function Home() {
  const { getServices, getProducts, getCategories, getGallery, getDeals, services: cachedServices, products: cachedProducts, categories: cachedCategories, gallery: cachedGallery, deals: cachedDeals } = useData();
  const [featuredServices, setFeaturedServices] = useState<Service[]>(() => {
    return (cachedServices || []).filter(s => (s as any).status !== 'inactive').slice(0, 10);
  });
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(() => {
    return (cachedProducts || []).filter(p => (p as any).status !== 'inactive').slice(0, 10);
  });
  const [featuredDeals, setFeaturedDeals] = useState<any[]>(() => {
    return (cachedDeals || []).slice(0, 10);
  });
  const [categories, setCategories] = useState<any[]>(() => {
    return cachedCategories || [];
  });
  const [gallery, setGallery] = useState<any[]>(() => {
    return (cachedGallery || []).slice(0, 8);
  });
  const [reviews, setReviews] = useState<Feedback[]>(STATIC_FEEDBACK);
  const [productsLoading, setProductsLoading] = useState(() => !cachedProducts || cachedProducts.length === 0);
  const [dealsLoading, setDealsLoading] = useState(() => !cachedDeals || cachedDeals.length === 0);
  const [servicesLoading, setServicesLoading] = useState(() => !cachedServices || cachedServices.length === 0);
  const [categoriesLoading, setCategoriesLoading] = useState(() => !cachedCategories || cachedCategories.length === 0);
  const [galleryLoading, setGalleryLoading] = useState(() => !cachedGallery || cachedGallery.length === 0);
  const loading = productsLoading || dealsLoading || servicesLoading || categoriesLoading || galleryLoading;
  
  const [productSort, setProductSort] = useState('newest');
  const [serviceSort, setServiceSort] = useState('newest');
  const [dealSort, setDealSort] = useState('newest');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [masterData, setMasterData] = useState<{
    services: Service[];
    products: Product[];
    feedback: Feedback[];
    categories: any[];
    gallery: any[];
    deals: any[];
  }>(() => ({
    services: cachedServices || [],
    products: cachedProducts || [],
    feedback: STATIC_FEEDBACK,
    categories: cachedCategories || [],
    gallery: cachedGallery || [],
    deals: cachedDeals || []
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, []);

  // Initial Fetch - Only once
  useEffect(() => {
    const loadData = async () => {
      const hasProducts = cachedProducts && cachedProducts.length > 0;
      if (!hasProducts) {
        setProductsLoading(true);
      }
      
      const hasOthers = (cachedServices && cachedServices.length > 0) &&
                        (cachedDeals && cachedDeals.length > 0) &&
                        (cachedCategories && cachedCategories.length > 0) &&
                        (cachedGallery && cachedGallery.length > 0);
      if (!hasOthers) {
        setDealsLoading(true);
        setServicesLoading(true);
        setCategoriesLoading(true);
        setGalleryLoading(true);
      }

      try {
        // Step 1: Fetch and display products immediately (within milliseconds)
        const productsData = await getProducts();
        setMasterData(prev => ({
          ...prev,
          products: productsData
        }));
        setProductsLoading(false);

        // Step 2: Fetch and display all other sections simultaneously, immediately after products loaded
        const [dealsData, servicesData, feedbackData, categoriesData, galleryData] = await Promise.all([
          getDeals(),
          getServices(),
          adminService.getFeedback(),
          getCategories(),
          getGallery(),
        ]);

        setMasterData(prev => ({
          ...prev,
          deals: dealsData,
          services: servicesData,
          feedback: feedbackData ?? [],
          categories: categoriesData,
          gallery: galleryData
        }));

        setDealsLoading(false);
        setServicesLoading(false);
        setCategoriesLoading(false);
        setGalleryLoading(false);
      } catch (error) {
        console.error("Home: Error in loadData:", error);
        setProductsLoading(false);
        setDealsLoading(false);
        setServicesLoading(false);
        setCategoriesLoading(false);
        setGalleryLoading(false);
      }
    };
    loadData();
  }, []); // Run only once

  // Sorting Logic - Runs when masterData or sort options change
  useEffect(() => {
    if (!masterData) return;

    // Process Products
    let sortedProducts = [...masterData.products].filter(p => (p as any).status !== 'inactive');
    if (productSort === 'newest') sortedProducts.sort((a, b) => new Date((b as any).created_at || (b as any).createdAt || 0).getTime() - new Date((a as any).created_at || (a as any).createdAt || 0).getTime());
    if (productSort === 'oldest') sortedProducts.sort((a, b) => new Date((a as any).created_at || (a as any).createdAt || 0).getTime() - new Date((b as any).created_at || (b as any).createdAt || 0).getTime());
    if (productSort === 'popular') {
      sortedProducts.sort((a, b) => ((b as any).sales || 0) - ((a as any).sales || 0));
    }
    setFeaturedProducts(sortedProducts.slice(0, 10));

    // Process Services
    let sortedServices = [...masterData.services].filter(s => (s as any).status !== 'inactive');
    if (serviceSort === 'newest') sortedServices.sort((a, b) => new Date((b as any).created_at || (b as any).createdAt || 0).getTime() - new Date((a as any).created_at || (a as any).createdAt || 0).getTime());
    if (serviceSort === 'oldest') sortedServices.sort((a, b) => new Date((a as any).created_at || (a as any).createdAt || 0).getTime() - new Date((b as any).created_at || (b as any).createdAt || 0).getTime());
    setFeaturedServices(sortedServices.slice(0, 10));

    // Process Deals
    let sortedDeals = [...((masterData as any).deals || [])];
    if (dealSort === 'newest') sortedDeals.sort((a, b) => new Date((b as any).created_at || (b as any).createdAt || 0).getTime() - new Date((a as any).created_at || (a as any).createdAt || 0).getTime());
    if (dealSort === 'oldest') sortedDeals.sort((a, b) => new Date((a as any).created_at || (a as any).createdAt || 0).getTime() - new Date((b as any).created_at || (b as any).createdAt || 0).getTime());
    setFeaturedDeals(sortedDeals.slice(0, 10));

    // Other sets
    setReviews(masterData.feedback.filter(f => f.status === 'approved'));
    setCategories(masterData.categories);
    setGallery(masterData.gallery.slice(0, 8));
  }, [masterData, productSort, serviceSort, dealSort]);

  const fetchHomeData = async () => {
    // Keep for backward compatibility or explicit refreshes, but mostly redundant now
  };

  const getIconForService = (category: string) => {
    switch (category) {
      case 'Weddings': return <CheckCircle />;
      case 'Mehndi': return <Calendar />;
      case 'Birthdays': return <Cake />;
      case 'Corporate': return <Users />;
      default: return <Star />;
    }
  };

  return (
    <div className="relative pt-16 md:pt-20">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[45vh] lg:h-[90vh] bg-white overflow-hidden mt-0 md:mt-[5px] mx-0 md:mx-4 rounded-none md:rounded-[40px] shadow-2xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0">
              <img 
                src={banner1} 
                className="w-full h-full object-cover md:object-center" 
                alt="Wedding Banner"
                referrerPolicy="no-referrer"
                fetchPriority="high"
                loading="eager"
              />
              {/* Cinematic Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[20px] md:rounded-[40px]"></div>

              {/* Floating Icons for Banner */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-primary/30"
                    style={{
                      left: `${i * 15}%`,
                      top: `${i * 10}%`
                    }}
                  >
                    {i % 3 === 0 ? <Heart size={24} /> : i % 3 === 1 ? <Sparkles size={20} /> : <Star size={22} />}
                  </div>
                ))}
              </div>

              {/* Content Over Banner */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 md:pb-16 lg:pb-24">
                 <div className="flex flex-col items-center gap-6 md:gap-10">
                    <div className="flex flex-row items-center gap-1.5 md:gap-8">
                       <Link 
                        to="/marketplace" 
                        className="px-3 md:px-12 py-1.5 md:py-5 bg-primary text-black font-black text-[7px] md:text-[12px] uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
                       >
                        Explore Services
                       </Link>
                       <Link 
                        to="/products" 
                        className="px-3 md:px-12 py-1.5 md:py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-[7px] md:text-[12px] uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
                       >
                        View Shop
                       </Link>
                    </div>
                 </div>
              </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-8 md:py-20 px-2 md:px-6 bg-white relative overflow-hidden">
        <FloatingWeddingDecor className="opacity-10" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex justify-between items-center mb-6 md:mb-12 gap-4 relative z-20 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 text-left"
            >
                  <h2 className="text-3xl md:text-7xl font-semibold text-slate-900 leading-tight">The Shop</h2>
                    <div className="h-1 md:h-1.5 w-24 md:w-48 bg-primary rounded-full shadow-[0_0_20px_rgba(255,210,0,0.5)] mt-2"></div>


            </motion.div>
            <div className="flex items-center">
              <div className="block md:hidden">
                <SortDropdown 
                  options={PRODUCT_SORT_OPTIONS_MOBILE}
                  value={productSort}
                  onChange={setProductSort}
                />
              </div>
              <div className="hidden md:block">
                <SortDropdown 
                  options={PRODUCT_SORT_OPTIONS}
                  value={productSort}
                  onChange={setProductSort}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-0.5 md:gap-2">
            {productsLoading && featuredProducts.length === 0 ? (
              <CardSkeleton count={5} gridCols="grid-cols-2 lg:grid-cols-5" />
            ) : (featuredProducts && featuredProducts.length > 0) ? featuredProducts.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group flex flex-col"
              >
                <Link to={`/product/${p.id}`} className="relative aspect-[3/4] md:aspect-[3/4.5] bg-slate-50 mb-2 md:mb-3 overflow-hidden rounded-[20px] md:rounded-[40px] shadow-xl block cursor-pointer">
                  <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt={p.title} loading={idx < 5 ? "eager" : "lazy"} fetchPriority={idx < 5 ? "high" : "low" as any} referrerPolicy="no-referrer" />
                  <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1 md:gap-2">
                    <span className="bg-white/90 backdrop-blur-md px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-[5px] md:text-[7px] font-black uppercase tracking-widest text-slate-900 border border-slate-100 shadow-sm">{p.category}</span>
                    {p.stock !== undefined && (
                      <span className={cn(
                        "px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[6px] md:text-[8px] font-black uppercase tracking-widest border backdrop-blur-md", 
                        p.stock > 0 ? "bg-emerald-50/90 text-emerald-600 border-emerald-100" : "bg-red-50/90 text-red-600 border-red-100"
                      )}>
                        {p.stock > 0 ? 'In Stock' : 'Out'}
                      </span>
                    )}
                  </div>
                  {/* Overlay Price with Discount Mock */}
                  <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
                    <div className="bg-slate-900/90 backdrop-blur-md p-2 md:p-3 rounded-xl md:rounded-2xl flex items-center justify-between border border-white/10 group-hover:bg-primary transition-all group-hover:text-black">
                       <div className="flex flex-col">
                          <span className="text-[10px] md:text-[14px] font-semibold text-white group-hover:text-black">Rs. {p.price.toLocaleString()}</span>
                          <span className="text-[6px] md:text-[8px] font-black line-through opacity-40 text-white group-hover:text-black">Rs. {(p.price * 1.2).toLocaleString()}</span>
                       </div>
                       <ArrowRight size={10} className="text-primary group-hover:text-black md:hidden" />
                       <ArrowRight size={14} className="text-primary group-hover:text-black hidden md:block" />
                    </div>
                  </div>
                </Link>
                <div className="px-1 md:px-2">
                  <h4 className="text-sm md:text-xl font-semibold text-slate-900 mb-2 md:mb-4 transition-colors line-clamp-1 md:line-clamp-none">
                    <Link to={`/product/${p.id}`}>{p.title}</Link>
                  </h4>
                  <Link 
                    to={`/product/${p.id}`}
                    className="inline-flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all border-b border-transparent hover:border-slate-900 pb-0.5 md:pb-1"
                  >
                    Details <ArrowRight size={8} className="md:w-[10px]" />
                  </Link>
                </div>
              </motion.div>
            )) : !productsLoading && (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-400 uppercase tracking-widest text-xs">No products found.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 md:mt-10 text-center">
             <Link 
              to="/products"
              className="inline-flex items-center gap-4 text-slate-400 hover:text-primary transition-all text-[11px] font-black uppercase tracking-[0.4em] group"
            >
              See All Products <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Best Packages Section - Deals */}
      <section className="py-8 md:py-16 px-2 md:px-6 bg-bg-alt relative overflow-hidden border-y border-border">
        <FloatingWeddingDecor className="opacity-10" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex justify-between items-center mb-6 md:mb-10 gap-4 relative z-20 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 text-left"
            >
                  <h2 className="text-3xl md:text-7xl font-semibold text-slate-900 leading-tight">Best Packages</h2>
                    <div className="h-1 md:h-1.5 w-24 md:w-48 bg-primary rounded-full shadow-[0_0_20px_rgba(255,210,0,0.5)] mt-2"></div>


            </motion.div>
            <div className="flex items-center">
               <SortDropdown 
                 options={DEAL_SORT_OPTIONS}
                 value={dealSort}
                 onChange={setDealSort}
               />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-0.5 md:gap-2">
            {dealsLoading && featuredDeals.length === 0 ? (
              <CardSkeleton count={5} gridCols="grid-cols-2 lg:grid-cols-5" />
            ) : featuredDeals.map((deal, idx) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group flex flex-col"
              >
                <Link to={`/deals/${deal.id}`} className="relative aspect-[3/4] md:aspect-[3/4.5] bg-slate-50 mb-2 md:mb-3 overflow-hidden rounded-[20px] md:rounded-[40px] shadow-xl block cursor-pointer">
                  <img src={deal.img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt={deal.title} loading={idx < 5 ? "eager" : "lazy"} fetchPriority={idx < 5 ? "high" : "low" as any} referrerPolicy="no-referrer" />
                  <div className="absolute top-2 md:top-3 left-2 md:left-3">
                    <span className="bg-primary px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[5px] md:text-[8px] font-black uppercase tracking-widest text-slate-900 shadow-xl">Best Deal</span>
                  </div>
                  {/* Overlay Price */}
                <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4">
  <div className="bg-slate-900/90 backdrop-blur-md p-2 md:p-3 rounded-xl md:rounded-2xl flex items-center justify-between border border-white/10 group-hover:bg-primary transition-all group-hover:text-black">
     
     <div className="flex flex-col">
        
        <span className="text-[10px] md:text-[14px] font-semibold text-white group-hover:text-black">
          Rs. {deal.price?.toLocaleString()}
        </span>

        {deal.compare_price && deal.compare_price > deal.price && (
          <span className="text-[6px] md:text-[8px] font-black line-through opacity-40 text-white group-hover:text-black">
            Rs. {deal.compare_price.toLocaleString()}
          </span>
        )}

     </div>

     <ArrowRight size={14} className="text-primary group-hover:text-black" />
  </div>
</div>
                </Link>
                <div className="px-1 md:px-2">
                  <h4 className="text-sm md:text-xl font-semibold text-slate-900 mb-2 md:mb-4 transition-colors line-clamp-1">
                    <Link to={`/deals/${deal.id}`}>{deal.title}</Link>
                  </h4>
                  <Link 
                    to={`/deals/${deal.id}`}
                    className="inline-flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all border-b border-transparent hover:border-slate-900 pb-0.5 md:pb-1"
                  >
                    Details <ArrowRight size={8} className="md:w-[10px]" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 md:mt-12 text-center">
            <Link 
                to="/deals"
                className="inline-flex items-center gap-4 text-slate-400 hover:text-primary transition-all text-[11px] font-black uppercase tracking-[0.4em] group"
            >
              Explore All Deals <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-8 md:py-16 px-2 md:px-6 bg-white relative overflow-hidden">
        <FloatingWeddingDecor className="opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/5 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex justify-between items-center mb-6 md:mb-10 gap-6 md:gap-8 relative z-20 w-full">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
            <h2 className="text-3xl md:text-7xl font-semibold text-slate-900 leading-tight">Our Services</h2>
              <div className="h-1 md:h-1.5 w-24 md:w-48 bg-primary rounded-full shadow-[0_0_20px_rgba(255,210,0,0.5)] mt-2"></div>


            </motion.div>
            <div className="flex items-center">
               <SortDropdown 
                 options={SERVICE_SORT_OPTIONS}
                 value={serviceSort}
                 onChange={setServiceSort}
               />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-0.5 md:gap-2">
            {servicesLoading && featuredServices.length === 0 ? (
              <CardSkeleton count={5} gridCols="grid-cols-2 lg:grid-cols-5" />
            ) : (featuredServices && featuredServices.length > 0) ? featuredServices.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group flex flex-col"
              >
                 <Link to={`/service/${item.id}`} className="relative aspect-[3/4] md:aspect-[3/4.5] overflow-hidden rounded-[20px] md:rounded-[50px] shadow-2xl block cursor-pointer transition-all duration-700 hover:-translate-y-2">
                  <img src={item.img} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" alt={item.title} loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 p-2 md:p-6 pt-4 md:pt-16 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent">
                    <span className="text-primary text-[5px] md:text-[7px] font-black uppercase tracking-widest mb-0.5 md:mb-1 block">{item.category}</span>
                    <h3 className="text-[11px] md:text-2xl font-semibold text-white mb-0.5 md:mb-3 line-clamp-1 md:line-clamp-2">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-[6px] md:text-[9px] font-bold uppercase tracking-widest">Book Now</span>
                      <ArrowRight className="text-primary w-2 h-2 md:w-3 md:h-3 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )) : !servicesLoading && (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-400 uppercase tracking-widest text-xs">No services found.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 md:mt-12 text-center relative z-10">
          <Link 
            to="/marketplace" 
            className="inline-flex items-center gap-4 text-slate-400 hover:text-primary transition-all text-[11px] font-black uppercase tracking-[0.4em] group"
          >
            See All Wedding Services <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Category Slider */}
      <CategorySlider categories={categories} />

      {/* Gallery Section */}
      <section className="py-8 md:py-20 px-4 md:px-10 lg:px-20 bg-bg-alt relative overflow-hidden text-center md:text-left">
        <FloatingWeddingDecor className="opacity-10" />
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between mb-6 md:mb-12 gap-6 md:gap-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
                       <h2 className="text-3xl md:text-7xl font-semibold text-slate-900 leading-tight">Sweet Memories</h2>
            <div className="h-1 md:h-1.5 w-24 md:w-48 bg-primary rounded-full shadow-[0_0_20px_rgba(255,210,0,0.5)] mt-2"></div>



          </motion.div>
          <div className="h-[2px] flex-1 bg-white hidden lg:block mx-12 opacity-50"></div>
          <Link to="/gallery" className="text-slate-400 hover:text-primary transition-colors uppercase tracking-[0.3em] text-[8px] md:text-[12px] font-black group flex items-center gap-2">
            See All Photos
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 relative z-10">
          {galleryLoading && gallery.length === 0 ? (
            <GallerySkeleton />
          ) : gallery.length > 0 ? gallery.map((item, i) => (
            <motion.div 
                key={item.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="aspect-square bg-slate-100 rounded-[3.5rem] overflow-hidden cursor-pointer group shadow-2xl shadow-slate-200/50 relative border-4 border-white"
                onClick={() => setSelectedImage(item)}
            >
                <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 ease-out grayscale-[20%] group-hover:grayscale-0" alt={item.title} loading="lazy" />
                
                {/* Center Icon */}
                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-500 z-10">
                   {/* Minimal visual feedback on hover */}
                </div>
            </motion.div>
          )) : !galleryLoading ? (
            <div className="col-span-full py-20 text-center bg-bg-alt rounded-[40px] border border-dashed border-slate-200">
                <Camera className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">Visual Journal is currently empty.<br />Add project highlights in Admin Panel.</p>
            </div>
          ) : (
            [1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-[30px]" />
            ))
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-8 md:py-20 bg-white border-y border-border overflow-hidden relative">
        <FloatingWeddingDecor className="opacity-10" />
        <div className="absolute left-0 top-0 w-50 h-full opacity-[0.01] md:opacity-[0.02] pointer-events-none font-serif text-[50vw] md:text-[30vw] text-slate-900 leading-none -translate-x-1/4 uppercase">Happy Clients</div>
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 relative z-10">
            <div className="text-center mb-6 md:mb-12">
                          <h2 className="text-3xl md:text-7xl font-semibold text-slate-900 leading-tight">What Clients Say</h2>

                <div className="h-1 md:h-1.5 w-24 md:w-48 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(255,210,0,0.5)]"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {(reviews && reviews.length > 0 ? reviews : STATIC_FEEDBACK).map((r, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        viewport={{ once: true }}
                        className="p-8 bg-white border border-slate-100 relative rounded-[40px] group hover:border-primary/50 transition-all hover:shadow-2xl shadow-xl shadow-slate-900/5 flex flex-col"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-bg-alt border border-slate-100 p-1 group-hover:border-primary/30 transition-all overflow-hidden flex-shrink-0">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.user_name || r.name}`} alt="" className="w-full h-full object-cover rounded-lg" />
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="text-slate-900 text-xs font-black uppercase tracking-widest mb-1 truncate">{r.user_name || r.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-primary text-[8px] font-black uppercase tracking-widest">{r.location || r.city}</span>
                                  <span className="text-slate-300 text-[8px] uppercase font-bold tracking-widest">• {r.created_at || r.date ? new Date(r.created_at || r.date).toLocaleDateString() : 'Recent'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, idx) => (
                                <Star key={idx} className={`w-3 h-3 ${idx < r.rating ? 'fill-primary text-primary' : 'text-slate-100'}`} />
                            ))}
                        </div>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed flex-grow">"{r.comment}"</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Gallery Modal */}
      <AnimatePresence>
        {selectedImage && (
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
                className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl cursor-zoom-out"
                onClick={() => setSelectedImage(null)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="relative max-w-7xl w-full max-h-[90vh] md:max-h-[85vh] bg-white rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 md:top-8 md:right-8 z-20 w-10 h-10 md:w-14 md:h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 hover:bg-primary hover:scale-110 transition-all shadow-xl border border-slate-100"
              >
                <X size={20} className="md:w-6 md:h-6" />
              </button>

              <div className="flex-1 bg-slate-100 overflow-hidden relative group/modal min-h-[400px] md:min-h-0 h-[60vh] md:h-auto">
                <img 
                  src={selectedImage.img} 
                  className="w-full h-full object-contain p-4 md:p-8" 
                  alt={selectedImage.title}
                  referrerPolicy="no-referrer" 
                />
                
                {/* Minimal Info Overlay for Mobile/Minimal View */}
                <div className="absolute bottom-6 left-6 md:hidden z-20">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50">
                        <span className="text-primary text-[8px] font-black uppercase tracking-widest mb-1 block">{selectedImage.category}</span>
                        <h3 className="text-sm font-serif font-bold text-slate-900">{selectedImage.title}</h3>
                    </div>
                </div>
              </div>

              <div className="hidden md:flex w-full md:w-[450px] p-12 md:p-16 flex-col justify-center bg-white relative z-10">
                <div className="mb-12">
                    <span className="text-primary text-[11px] font-black uppercase tracking-[0.6em] mb-6 block underline underline-offset-8 decoration-primary/20">Archive № {selectedImage.id?.slice(0,4)}</span>
                    <h3 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-8 leading-[1.1]">{selectedImage.title}</h3>
                    
                    <div className="flex flex-wrap gap-3">
                       <div className="px-6 py-3 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10">
                          {selectedImage.category}
                       </div>
                       <div className="px-6 py-3 bg-bg-alt border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Premium Event
                       </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <p className="text-slate-600 font-medium leading-relaxed text-xl border-l-4 border-primary pl-8 py-2">
                      "Transforming dreams into digital reality through artisanal decoration and meticulous planning."
                    </p>
                    
                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Location</span>
                            <span className="text-sm font-bold text-slate-900">Attock, PK</span>
                        </div>
                        <button 
                          onClick={() => setSelectedImage(null)}
                          className="px-10 py-5 bg-slate-50 text-slate-900 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                        >
                          Dismiss View
                        </button>
                    </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

     {/* Contact Section */}
      <section className="py-20 md:py-40 bg-white relative overflow-hidden">
        <FloatingWeddingDecor className="opacity-10" />
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-20 flex flex-col lg:flex-row gap-16 md:gap-32 relative z-10">
            <div className="flex-1">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-sans text-slate-900 mb-8 md:mb-16 leading-tight md:leading-none">Talk to us for <br /><span className="font-semibold text-primary">Your Wedding</span></h2>
                
                <div className="space-y-8 md:space-y-16">
                    <div className="flex items-center gap-6 md:gap-8 group cursor-pointer">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-bg-alt rounded-2xl md:rounded-3xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-lg shadow-slate-100 flex-shrink-0">
                            <Phone className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <p className="text-slate-300 text-[9px] md:text-[11px] uppercase font-black tracking-widest mb-1 md:mb-2">Direct Line</p>
                            <p className="text-xl md:text-3xl font-serif text-slate-900">+92 (311) 686 9582</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-8 group cursor-pointer">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-[#25D366]/5 rounded-2xl md:rounded-3xl flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all shadow-lg shadow-[#25D366]/10 flex-shrink-0">
                            <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <p className="text-[#25D366]/40 text-[9px] md:text-[11px] uppercase font-black tracking-widest mb-1 md:mb-2">Instant Message</p>
                            <p className="text-xl md:text-3xl font-serif text-slate-900">+92 311 6869582</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-8 group cursor-pointer">
                        <div className="w-14 h-14 md:w-20 md:h-20 bg-bg-alt rounded-2xl md:rounded-3xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-lg shadow-slate-100 flex-shrink-0">
                            <MapPin className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <p className="text-slate-300 text-[9px] md:text-[11px] uppercase font-black tracking-widest mb-1 md:mb-2">Location</p>
                            <p className="text-xl md:text-3xl font-serif text-slate-900">Main Meena Bazar Chowk, Attock City</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[500px] flex flex-col gap-12">
                <div className="p-2 bg-white rounded-[50px] shadow-2xl shadow-slate-200 border border-slate-50 overflow-hidden min-h-0 aspect-square lg:aspect-auto lg:min-h-[500px]">
                    <div className="w-full h-full rounded-[40px] overflow-hidden">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3316.6622523169053!2d72.35039113873414!3d33.76939261368978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df183e18b59e89%3A0xdb88ed08629ebf74!2sMeena%20Bazar%20Attock%2C%20Pakistan!5e0!3m2!1sen!2s!4v1778253514072!5m2!1sen!2s"
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            className="grayscale contrast-125 hover:grayscale-0 transition-all duration-1000 w-full h-full"
                        ></iframe>
                    </div>
                </div>
                
                <div className="flex gap-8 justify-center">
                    <motion.a whileHover={{ y: -5 }} href="https://www.instagram.com/hamziiproduction"  target="_blank"
        rel="noopener noreferrer" className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-xl shadow-slate-100">
                        <Instagram className="w-7 h-7" />
                    </motion.a>
                    <motion.a whileHover={{ y: -5 }} href="https://www.facebook.com/share/19eaXE9rtK/"  target="_blank"
        rel="noopener noreferrer" className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-xl shadow-slate-100">
                        <Facebook className="w-7 h-7" />
                    </motion.a>


                     {/* TikTok */}
    <motion.a 
        whileHover={{ y: -5 }} 
        href="https://www.tiktok.com/@hamziiproduction"
        target="_blank"
        rel="noopener noreferrer"
        className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all shadow-xl shadow-slate-100"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7"
        >
            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.716h-3.219v13.677a2.896 2.896 0 1 1-2.896-2.896c.298 0 .584.046.854.13V9.615a6.115 6.115 0 1 0 6.115 6.115V9.046a8.012 8.012 0 0 0 4.684 1.506V7.333a4.781 4.781 0 0 1-1.768-.647z"/>
        </svg>
    </motion.a>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}