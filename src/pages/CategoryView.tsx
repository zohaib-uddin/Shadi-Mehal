import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService, Product, Service, Category } from '../lib/adminService';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Loader2, 
  ChevronRight,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { cn } from '../lib/utils';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';

export default function CategoryView() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (categoryId) fetchCategoryData(categoryId);
  }, [categoryId]);

  const fetchCategoryData = async (id: string) => {
    setLoading(true);
    try {
      const allCategories = await adminService.getCategories();
      const cat = allCategories.find(c => c.id === id);
      setCategory(cat || null);

      const [allProducts, allServices] = await Promise.all([
        adminService.getProducts(),
        adminService.getServices()
      ]);

      // Filter by category name (old system) or category_id (new system)
      if (cat) {
        setProducts(allProducts.filter(p => p.category_id === id || p.category === cat.name));
        setServices(allServices.filter(s => s.category_id === id || s.category === cat.name));
      }
    } catch (error) {
      console.error("Error fetching category items:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6">
        <h2 className="text-3xl font-semibold text-slate-900 mb-4">Category Not Found</h2>
        <Link to="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 md:px-20 max-w-7xl mx-auto relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20">
          <div className="max-w-2xl">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-8 uppercase tracking-widest text-[10px] font-black">
              <ArrowLeft size={16} />
              Go Back
            </Link>
            <h1 className="text-6xl md:text-8xl font-sans text-slate-900 leading-[0.8] mb-8 font-semibold">{category.name}</h1>
            <p className="text-slate-500 text-lg leading-relaxed uppercase tracking-widest font-black text-xs">{category.type === 'both' ? 'Products & Services' : category.type}</p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
              <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-3 rounded-xl transition-all", viewMode === 'grid' ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600")}
              >
                  <Grid size={20} />
              </button>
              <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-3 rounded-xl transition-all", viewMode === 'list' ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600")}
              >
                  <List size={20} />
              </button>
          </div>
        </div>

        {/* Services Section */}
        {services.length > 0 && (
          <section className="mb-32">
            <div className="flex items-center gap-8 mb-16">
              <h2 className="text-3xl font-serif text-slate-900 whitespace-nowrap font-bold">Services</h2>
              <div className="h-px w-full bg-slate-100" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{services.length} Items</span>
            </div>
            
            <div className={cn(
              "grid gap-8",
              viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              {services.map((item, idx) => (
                <Link to={`/service/${item.id}`} key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "group bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700",
                      viewMode === 'list' && "flex flex-col md:flex-row h-auto md:h-64"
                    )}
                  >
                    <div className={cn(
                      "overflow-hidden aspect-video",
                      viewMode === 'list' ? "md:aspect-square md:w-64" : "w-full"
                    )}>
                      <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
                    </div>
                    <div className="p-10 flex flex-col justify-center">
                      <h3 className="text-2xl font-serif text-slate-900 mb-3 group-hover:text-primary transition-colors font-bold">{item.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6">{item.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                          <span className="text-primary font-black tracking-tight">From Rs. {item.price.toLocaleString()}</span>
                          <ChevronRight className="w-5 h-5 text-slate-200 group-hover:translate-x-2 group-hover:text-primary transition-all" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <section>
            <div className="flex items-center gap-8 mb-16">
              <h2 className="text-3xl font-serif text-slate-900 whitespace-nowrap font-bold">Products</h2>
              <div className="h-px w-full bg-slate-100" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{products.length} Items</span>
            </div>
            
            <div className={cn(
              "grid gap-8",
              viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
            )}>
              {products.map((item, idx) => (
                <Link to={`/product/${item.id}`} key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "group bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700",
                      viewMode === 'list' && "flex h-40"
                    )}
                  >
                    <div className={cn(
                      "overflow-hidden aspect-[4/5]",
                      viewMode === 'list' ? "aspect-square w-40" : "w-full"
                    )}>
                      <img src={item.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <h3 className="text-lg font-serif text-slate-900 mb-2 truncate group-hover:text-primary transition-colors font-bold">{item.title}</h3>
                          <p className="text-slate-400 text-xs mt-2 line-clamp-1">{item.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                      <span className="text-primary font-black text-sm">From Rs. {item.price.toLocaleString()}</span>                    
                          <ChevronRight className="w-5 h-5 text-slate-200 group-hover:translate-x-2 group-hover:text-primary transition-all" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {products.length === 0 && services.length === 0 && (
          <div className="py-40 text-center bg-slate-50 rounded-[50px] border border-dashed border-slate-200">
            <h3 className="text-3xl font-serif text-slate-300 font-bold">Nothing here yet...</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-4">Check back soon for new items</p>
          </div>
        )}
      </div>
    </div>
  );
}
