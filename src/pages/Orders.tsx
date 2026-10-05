import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Calendar, Clock, ChevronRight, ShoppingBag, Star, FileText, X, MessageSquare, Loader2, CheckCircle2, Eye } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService, Order, Review } from '../lib/adminService';
import { formatProductVariantName, getSizeFullName } from '../lib/utils';
import TopLoadingBar from '../components/TopLoadingBar';

export default function Orders() {
  const { user, userData, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>(() => {
    if (user) {
      return adminService.getUserOrdersCache(user.id) || [];
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (user) {
      return !adminService.getUserOrdersCache(user.id);
    }
    return true;
  });
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string, title: string, type: string } | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      const cached = adminService.getUserOrdersCache(user.id);
      if (cached) {
        setOrders(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await adminService.getUserOrders(user!.id);
      setOrders(data as any);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (item: any, type: string) => {
    setSelectedItem({ id: item.id, title: item.title, type });
    setReviewForm({ rating: 5, comment: '' });
    setReviewSuccess(false);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedItem) return;

    setIsSubmitting(true);
    try {
      const reviewPayload: Omit<Review, 'id' | 'created_at'> = {
        item_id: selectedItem.id,
        item_type: selectedItem.type as any,
        user_id: user.id,
        user_name: userData?.name || user.user_metadata?.full_name || 'Anonymous',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        status: 'pending'
      };

      await adminService.submitReview(reviewPayload);
      setReviewSuccess(true);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Review submission failed:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-bg-dark">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">
          Loading secure authentication...
        </p>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" />;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-bg-dark">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-20 px-4 md:px-10 min-h-screen bg-bg-dark">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-semibold text-slate-900">Your Orders</h1>
          <div className="flex items-center gap-3 mt-4">
            <span className="w-6 h-[1px] bg-primary"></span>
            <p className="text-slate-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest">
              Track your handcrafted decorations & luxury services
            </p>
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white p-20 rounded-[50px] border border-slate-100 shadow-xl shadow-slate-100/50 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">No orders found</h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-10 max-w-xs mx-auto">
              You haven't placed any orders yet. Start shopping to bring elegance to your space.
            </p>
            <Link 
              to="/products"
              className="inline-block px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-black transition-all shadow-2xl"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {orders.map((order: any, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={order.id}
                className="bg-white rounded-3xl md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all group"
              >
                <div className="p-6 md:p-10">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10 pb-6 md:pb-8 border-b border-slate-50">
                    <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-primary shadow-lg">
                        <Package className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                      <div>
                        <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-lg md:text-xl font-semibold text-slate-900">
                          Rs. {order.total.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                      <Link 
                        to={`/orders/${order.id}`}
                        className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      >
                         <Eye size={10} /> View Details
                      </Link>
                      <Link 
                        to={`/orders/${order.id}/invoice`}
                        className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-full border border-slate-900 text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-sm"
                      >
                        <FileText className="w-3 h-3" />
                        Invoice
                      </Link>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-[8px] md:text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full border text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'completed' || order.status === 'delivered'
                        ? "bg-green-50 border-green-100 text-green-600"
                        : "bg-amber-50 border-amber-100 text-amber-600"
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4 md:space-y-6 mb-6 md:mb-10">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 md:gap-6 group/item">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-slate-100 shrink-0">
                          <img 
                            src={item.item.img || item.item.image_url} 
                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                            alt={item.item.title} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs md:text-sm font-bold text-slate-900 mb-0.5 truncate">{item.type === 'product' && item.item.selectedVariant ? formatProductVariantName(item.item.title, item.item.selectedVariant.color_name, item.item.selectedVariant.size) : (item.item.title || item.item.name)}</h4>
                          <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {item.type} • Qty: {item.quantity} • Rs. {item.item.price.toLocaleString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => openReviewModal(item.item, item.type)}
                          className="flex items-center gap-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all"
                        >
                          Review
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6 border-t border-slate-50">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Shipping Details</span>
                        <p className="text-[10px] md:text-[11px] font-bold text-slate-600">
                          {order.address}, {order.postalCode || order.postal_code ? ` ${order.postalCode || order.postal_code}, ` : ''} {order.city}, PK
                        </p>
                        {order.notes && (
                          <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <span className="text-[8px] font-black uppercase text-primary tracking-widest block mb-1">Delivery Notes</span>
                            <p className="text-[9px] font-bold text-slate-600 leading-relaxed">
                              "{order.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
                          Paid via {order.paymentMethod}
                        </div>
                      </div>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        <AnimatePresence>
          {isReviewModalOpen && selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative overflow-hidden"
              >
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {reviewSuccess ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-2">Thank You!</h3>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      Your review has been captured and published.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900">Write Review</h3>
                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest truncate max-w-[200px]">
                          For: {selectedItem.title}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitReview} className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Your Rating</label>
                        <div className="flex gap-4 px-4">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className={`transition-all ${reviewForm.rating >= star ? 'text-primary scale-110' : 'text-slate-200'}`}
                            >
                              <Star className={`w-8 h-8 ${reviewForm.rating >= star ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Your Feedback</label>
                        <textarea
                          required
                          rows={4}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="Tell us about the quality and service..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-primary/5 shadow-sm resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-black transition-all shadow-xl flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Capturing...
                          </>
                        ) : (
                          <>
                            Submit Review
                            <Star className="w-4 h-4 fill-current" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
