import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, SlidersHorizontal, ChevronDown, CheckCircle2, MapPin, Loader2, ArrowRight, Star } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { adminService, Service, STATIC_SERVICES, STATIC_CATEGORIES } from '../lib/adminService';
import { useData } from '../context/DataContext';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';
import { SortDropdown } from '../components/SortDropdown';
import { CardSkeleton } from '../components/Skeleton';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' }
];

export default function Marketplace() {
  const { getServices, getCategories } = useData();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (services.length === 0) setLoading(true);
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getServices(),
        getCategories()
      ]);

      setServices(servicesData);
      setCategories(categoriesData.filter((c: any) => c.type === 'service' || c.type === 'both'));
    } catch (e) {
      console.error("MarketplacePage Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedServices = useMemo(() => {
    let result = services.filter(s => {
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const isActive = s.status !== 'inactive';
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
  }, [services, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="pt-20 md:pt-32 pb-12 md:pb-20 px-2 md:px-6 min-h-screen bg-bg-dark relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-12 gap-2 md:gap-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-7xl font-semibold text-slate-900 leading-tight">Wedding <span className="text-primary">Services</span></h1>
            </div>
            
            <div className="relative w-full md:w-[450px]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 md:w-5 md:h-5 transition-colors group-focus-within:text-primary" />
              <input 
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-full py-3.5 md:py-5 pl-12 md:pl-14 pr-6 text-slate-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-xl shadow-slate-100 placeholder:text-slate-300 text-sm"
              />
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-1 md:gap-12">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-72 space-y-4 md:space-y-10 order-1">
                <div className="relative z-20">
                    <h3 className="hidden md:flex text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 items-center">
                    <Filter className="w-3.5 h-3.5 mr-3" /> Categories
                    </h3>
                    <div className="flex overflow-x-auto lg:flex-col gap-2 md:gap-3 no-scrollbar pb-0 md:pb-0 snap-x">
                    <button
                        onClick={() => setSelectedCategory('All')}
                        className={cn(
                        "px-4 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-left border shadow-sm whitespace-nowrap snap-start",
                        selectedCategory === 'All' 
                            ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10" 
                            : "bg-white text-slate-400 border-slate-100 hover:border-primary hover:text-slate-900"
                        )}
                    >
                        All Services
                    </button>
                    {categories.map(cat => (
                        <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={cn(
                            "px-4 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all text-left border shadow-sm whitespace-nowrap snap-start",
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

                {/* Desktop only sidebar block */}
                <div className="hidden lg:block p-8 md:p-10 rounded-[40px] bg-white border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <h4 className="font-black text-slate-900 text-[11px] mb-4 flex items-center uppercase tracking-widest leading-loose">
                        Need Custom Planning?
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-8 leading-loose font-bold">We offer full-service event management tailored to your needs.</p>
                    <Link to="/contact" className="text-[11px] font-black text-primary uppercase tracking-[0.4em] hover:gap-4 transition-all flex items-center gap-2">
                        Get Quote <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 order-2 lg:order-2">
                <div className="flex flex-row items-center justify-between mb-1 md:mb-12 gap-4">
                    <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">
                    Showing <span className="text-slate-900">{filteredAndSortedServices.length}</span> results
                    </p>
                    <div className="w-auto">
                        <SortDropdown 
                        options={SORT_OPTIONS}
                        value={sortBy}
                        onChange={setSortBy}
                        />
                    </div>
                </div>

                {loading && services.length === 0 ? (
                    <CardSkeleton count={10} gridCols="grid-cols-2 lg:grid-cols-5" />
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-0.5 md:gap-2">
                    <AnimatePresence mode="popLayout">
                        {filteredAndSortedServices.map((service) => (
                        <motion.div
                            key={service.id}
                            layout
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ServiceCard service={service as any} />
                        </motion.div>
                        ))}
                    </AnimatePresence>
                    </div>
                ) : !loading ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-[50px] p-24 text-center">
                        <Loader2 className="w-16 h-16 text-slate-100 mx-auto mb-8 animate-spin" />
                        <h3 className="text-3xl font-semibold text-slate-400 mb-6">No services listed yet</h3>
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-10">We are bringing the best vendors to our marketplace.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {[1,2,3].map(i => <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-[50px]"></div>)}
                    </div>
                )}

                {/* Mobile only Custom Planning block */}
                <div className="lg:hidden mt-8 p-8 rounded-[30px] bg-white border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <h4 className="font-black text-slate-900 text-[11px] mb-4 flex items-center uppercase tracking-widest leading-loose">
                        Need Custom Planning?
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-8 leading-loose font-bold">We offer full-service event management tailored to your needs.</p>
                    <Link to="/contact" className="text-[11px] font-black text-primary uppercase tracking-[0.4em] hover:gap-4 transition-all flex items-center gap-2">
                        Get Quote <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
    
  );
}
