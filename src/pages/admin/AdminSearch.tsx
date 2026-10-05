import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Search, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  Star, 
  Mail, 
  FileText, 
  Sparkles, 
  ChevronRight,
  ArrowRight,
  Loader2,
  Inbox
} from 'lucide-react';
import { adminService } from '../../lib/adminService';

export default function AdminSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      // BUG FIX: Clear old results before fetching new ones
      setResults(null);

      try {
        const data = await adminService.searchAdminResources(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const totalResults = results ? (
    results.orders.length + 
    results.products.length + 
    results.services.length + 
    results.customers.length + 
    results.reviews.length + 
    results.messages.length + 
    results.deals.length +
    results.invoices.length
  ) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Searching Admin Archive...</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
           <Search size={40} />
        </div>
        <h2 className="text-2xl font-serif italic text-slate-900 mb-2">No search query provided</h2>
        <p className="text-slate-400 text-sm">Please enter a keyword in the search bar above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-6 h-[1px] bg-primary"></span>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Search Results</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif italic text-slate-900">
            For "{query}"
          </h1>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <span className="text-2xl font-serif italic text-primary">{totalResults}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Matches Found</span>
        </div>
      </header>

      {totalResults === 0 ? (
        <div className="bg-white p-20 rounded-[40px] border border-slate-100 text-center shadow-xl shadow-slate-100/50">
           <Inbox className="w-16 h-16 text-slate-100 mx-auto mb-6" />
           <h3 className="text-xl font-serif italic text-slate-900 mb-2">Nothing found in the archives</h3>
           <p className="text-slate-400 text-sm max-w-xs mx-auto">Try a different keyword like an order ID, customer name, or product category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-12">
          {/* Orders Section */}
          {results.orders.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-primary">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-serif italic text-slate-900">Orders ({results.orders.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.orders.map((order: any) => (
                  <Link 
                    key={order.id} 
                    to={`/admin/orders/${order.id}`}
                    className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-[8px] font-black tracking-widest uppercase text-slate-400">#{order.id.slice(-8).toUpperCase()}</div>
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        order.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mb-1">{order.userName}</div>
                    <div className="text-[10px] text-slate-400 font-medium mb-4">{order.userEmail}</div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <span className="text-lg font-serif italic text-slate-900">Rs. {order.total.toLocaleString()}</span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Products & Services Section */}
          {(results.products.length > 0 || results.services.length > 0) && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-primary">
                  <ShoppingBag size={20} />
                </div>
                <h2 className="text-xl font-serif italic text-slate-900">Products & Services ({results.products.length + results.services.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...results.products, ...results.services].map((item: any) => (
                  <Link 
                    key={item.id} 
                    to={item.category ? (item.duration ? `/admin/services` : `/admin/products`) : `/admin/products`}
                    className="bg-white p-4 rounded-3xl border border-slate-100 hover:shadow-xl transition-all flex gap-4"
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                      <img src={item.img} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">{item.category}</div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-xs font-black text-slate-400 mt-1">Rs. {item.price.toLocaleString()}</p>
                    </div>
                    <div className="self-center">
                      <ChevronRight size={16} className="text-slate-200" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Customers Section */}
          {results.customers.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-primary">
                  <Users size={20} />
                </div>
                <h2 className="text-xl font-serif italic text-slate-900">Customers ({results.customers.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.customers.map((customer: any) => (
                  <Link 
                    key={customer.id} 
                    to={`/admin/customers`}
                    className="bg-white p-5 rounded-3xl border border-slate-100 hover:shadow-xl transition-all flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-primary/10 text-primary font-black flex items-center justify-center rounded-full">
                      {customer.name?.[0] || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{customer.name || customer.fullName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{customer.email}</div>
                    </div>
                    <ArrowRight size={14} className="text-slate-200" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Reviews Section */}
          {results.reviews.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-primary">
                  <Star size={20} />
                </div>
                <h2 className="text-xl font-serif italic text-slate-900">Reviews ({results.reviews.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.reviews.map((review: any) => (
                  <div 
                    key={review.id} 
                    className="bg-white p-6 rounded-3xl border border-slate-100 relative"
                  >
                    <div className="flex items-center gap-1 text-primary mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-slate-700 italic mb-4">"{review.comment}"</p>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{review.user_name}</span>
                       <Link to="/admin/reviews" className="text-[9px] font-black uppercase text-primary hover:underline">Manage</Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Messages Section */}
          {results.messages.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <h2 className="text-xl font-serif italic text-slate-900">Communication ({results.messages.length})</h2>
              </div>
              <div className="space-y-3">
                {results.messages.map((msg: any) => (
                  <Link 
                    key={msg.id} 
                    to="/admin/messages"
                    className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,210,0,0.5)]"></div>
                       <div>
                          <h4 className="text-sm font-bold text-slate-900">{msg.subject}</h4>
                          <p className="text-xs text-slate-400">From: {msg.name} ({msg.email})</p>
                       </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Invoices Section */}
          {results.invoices.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-primary">
                  <FileText size={20} />
                </div>
                <h2 className="text-xl font-serif italic text-slate-900">Invoices ({results.invoices.length})</h2>
              </div>
              <div className="space-y-3">
                {results.invoices.map((inv: any) => (
                  <Link 
                    key={inv.id} 
                    to="/admin/invoices"
                    className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-6">
                       <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">INV-{inv.id.slice(-6).toUpperCase()}</div>
                       <div className="text-sm font-bold text-slate-900 italic">Rs. {inv.amount.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                         {inv.status}
                       </span>
                       <ArrowRight size={14} className="text-slate-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
