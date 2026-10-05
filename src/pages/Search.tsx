import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, Package, Target, Sparkles, Image as ImageIcon, ArrowRight, ShoppingBag, Receipt, Truck } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { adminService, Order, Invoice } from '../lib/adminService';
import { cn } from '../lib/utils';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';
import { Skeleton } from '../components/Skeleton';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { services, products, deals, gallery, getServices, getProducts, getDeals, getGallery } = useData();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!query.trim()) {
        setResults({ products: [], services: [], deals: [], gallery: [], orders: [], invoices: [] });
        setLoading(false);
        return;
      }

      setLoading(true);
      // BUG FIX: Clear old results before fetching new ones
      setResults({ products: [], services: [], deals: [], gallery: [], orders: [], invoices: [] });

      try {
        let searchResults;
        if (user) {
          searchResults = await adminService.searchUserResources(query, user.id);
        } else {
          searchResults = await adminService.searchPublicResources(query);
        }

        if (searchResults) {
          setResults({
            products: searchResults.products || [],
            services: searchResults.services || [],
            deals: searchResults.deals || [],
            gallery: [], // Gallery not yet in backend search, can add if needed
            orders: searchResults.orders || [],
            invoices: searchResults.invoices || []
          });
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query, user]);

  const [results, setResults] = useState<{
    products: any[];
    services: any[];
    deals: any[];
    gallery: any[];
    orders: any[];
    invoices: any[];
  }>({ products: [], services: [], deals: [], gallery: [], orders: [], invoices: [] });

  const totalResults = results.products.length + results.services.length + results.deals.length + results.gallery.length + results.orders.length + results.invoices.length;

  if (loading) {
    return (
      <div className="pt-32 pb-20 px-4 md:px-10 min-h-screen bg-bg-dark relative">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-10 min-h-screen bg-bg-dark relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl">
                <SearchIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-sans text-slate-900 font-semibold">
              Search <span className="text-primary">Results</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
            Showing {totalResults} matches for <span className="text-slate-900 font-black uppercase tracking-widest text-xs px-2 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">"{query}"</span>
          </p>
        </div>

        {totalResults === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <SearchIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">No matching magic found</h3>
            <p className="text-slate-400 max-w-md mx-auto">We couldn't find anything matching your search. Try adjusting your keywords or browse our categories.</p>
            <Link to="/products" className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-black transition-all shadow-xl">
                Explore All Products
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-16">
            {/* Orders Section (If logged in) */}
            {user && results.orders.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Your Orders ({results.orders.length})</h2>
                </div>
                <div className="space-y-3">
                  {results.orders.map(order => (
                    <Link key={order.id} to={`/orders/${order.id}`} className="flex flex-wrap items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-xl transition-all gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Order ID: {order.id?.slice(0, 8)}</p>
                          <h4 className="text-sm font-bold text-slate-900">
                             {order.items?.length || 0} items for Rs. {order.total.toLocaleString()}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                            order.status === 'completed' ? "bg-green-100 text-green-600" : "bg-primary/20 text-slate-900"
                          )}>
                            {order.status}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Invoices Section (If logged in) */}
            {user && results.invoices.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Receipt className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Invoices ({results.invoices.length})</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                   {results.invoices.map(invoice => (
                     <Link key={invoice.id} to={`/orders/${invoice.order_id}/invoice`} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <Receipt className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inv #{invoice.id.slice(0, 6)}</p>
                                <p className="text-xs font-bold text-slate-900">Rs. {invoice.amount.toLocaleString()}</p>
                            </div>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary">View PDF</span>
                     </Link>
                   ))}
                </div>
              </section>
            )}

            {/* Products Row */}
            {results.products.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">Matching Products ({results.products.length})</h2>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                  {results.products.map(p => (
                    <Link key={p.id} to={`/product/${p.id}`} className="group bg-white rounded-[20px] p-2 border border-slate-100 hover:shadow-2xl transition-all">
                      <div className="aspect-[3/4] rounded-[15px] overflow-hidden mb-3">
                        <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <h4 className="text-[11px] md:text-sm font-sans font-semibold text-slate-900 px-1 truncate">{p.title}</h4>
                      <p className="text-primary font-black text-[10px] md:text-xs px-1 mt-1">Rs. {p.price.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Deals Row */}
            {results.deals.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Exclusive Deals ({results.deals.length})</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                  {results.deals.map(d => (
                    <Link key={d.id} to={`/deals/${d.id}`} className="group bg-slate-900 rounded-[20px] p-2 hover:shadow-2xl transition-all">
                      <div className="aspect-[3/4] rounded-[15px] overflow-hidden mb-3 relative">
                        <img src={d.img} alt={d.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-black text-[8px] font-black uppercase rounded-full">Deal</div>
                      </div>
                      <h4 className="text-[11px] md:text-sm font-sans font-semibold text-white px-1 truncate">{d.title}</h4>
                      <p className="text-primary font-black text-[10px] md:text-xs px-1 mt-1">Rs. {d.price.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Services Row */}
            {results.services.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Matching Services ({results.services.length})</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                  {results.services.map(s => (
                    <Link key={s.id} to={`/service/${s.id}`} className="group bg-white rounded-[20px] p-2 border border-slate-100 hover:shadow-2xl transition-all">
                      <div className="aspect-[3/4] rounded-[15px] overflow-hidden mb-3">
                        <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <h4 className="text-[11px] md:text-sm font-sans font-semibold text-slate-900 px-1 truncate">{s.title}</h4>
                      <p className="text-primary font-black text-[10px] md:text-xs px-1 mt-1">Starting from Rs. {s.price.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery Row */}
            {results.gallery.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Gallery Photos ({results.gallery.length})</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                  {results.gallery.map(g => (
                    <div key={g.id} className="group aspect-square rounded-[20px] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all relative">
                      <img src={g.img || g.image} alt={g.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">{g.category}</span>
                        <h4 className="text-white text-[10px] font-sans font-semibold truncate">{g.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
