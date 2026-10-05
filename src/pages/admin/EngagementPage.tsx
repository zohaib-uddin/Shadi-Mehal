import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, Review, Invoice, Order } from '../../lib/adminService';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Package, 
  Gift, 
  FileText, 
  Star, 
  Search,
  User,
  Activity,
  History,
  TrendingUp,
  MessageCircle,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { InvoiceModal } from '../../components/InvoiceModal';
import { PDFInvoice } from '../../components/PDFInvoice';
import { downloadPDF } from '../../lib/pdfUtils';

const EngagementPage: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [data, setData] = useState<{
    orders: Order[];
    reviews: any[];
    invoices: Invoice[];
    drafts: any[];
  }>({
    orders: [],
    reviews: [],
    invoices: [],
    drafts: []
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'shopping' | 'reviews' | 'finance'>('overview');

  const handleDownloadInvoice = async (orderId: string) => {
    const order = data.orders.find(o => o.id === orderId);
    if (!order) {
      toast.error("Order details not found");
      return;
    }

    const toastId = toast.loading("Preparing PDF...");
    try {
      setSelectedOrder(order);
      await new Promise(resolve => setTimeout(resolve, 300));
      await downloadPDF('direct-engagement-invoice', `Invoice-${order.id?.slice(0, 8)}`);
      toast.success("Downloaded successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Open invoice to try again.", { id: toastId });
    }
  };

  useEffect(() => {
    if (userId) fetchEngagementData();
  }, [userId]);

  const fetchEngagementData = async () => {
    try {
      setLoading(true);
      console.log("Admin Debug: Starting Engagement Fetch for User ID:", userId);
      
      const [engagementRes, profileRes] = await Promise.all([
        adminService.getCustomerEngagement(userId!),
        adminService.getUserProfile(userId!)
      ]);
      
      console.log("Admin Debug: Engagement Data Fetched:", engagementRes);
      console.log("Admin Debug: Orders:", engagementRes.orders);
      console.log("Admin Debug: Reviews:", engagementRes.reviews);
      console.log("Admin Debug: Invoices:", engagementRes.invoices);
      console.log("Admin Debug: Drafts:", engagementRes.drafts);
      console.log("Admin Debug: User Profile Fetched:", profileRes);
      
      setData(engagementRes as any);
      setUserInfo(profileRes);
    } catch (err) {
      console.error("Engagement fetch failed", err);
      toast.error("Failed to load engagement records");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (orderId: string) => {
    const order = data.orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsInvoiceModalOpen(true);
    } else {
      toast.error("Order details not found");
    }
  };

  const cartDraft = data.drafts?.find(d => String(d.type).toLowerCase() === 'cart');
  const bundleDrafts = data.drafts?.filter(d => ['bundle', 'product_bundle', 'service_bundle'].includes(String(d.type).toLowerCase()));

  const getPaymentStatusFromOrder = (orderId: string) => {
    const order = data.orders.find(o => o.id === orderId);
    if (!order) return 'Unpaid';
    const status = (order.paymentStatus || 'unpaid').toLowerCase();
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
         <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
       {/* Hidden container for background PDF generation - improved for canvas capture */}
       <div 
         style={{ position: 'fixed', left: '-5000px', top: '0', zIndex: -100, pointerEvents: 'none' }}
         aria-hidden="true"
       >
           {selectedOrder && (
             <PDFInvoice order={selectedOrder} id="direct-engagement-invoice" />
           )}
       </div>

       <InvoiceModal 
          order={selectedOrder}
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
       />
       <div className="max-w-7xl mx-auto">
         <button 
           onClick={() => navigate('/admin/customers')}
           className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-xs font-black uppercase tracking-widest"
         >
           <ArrowLeft size={14} /> Back to Customers
         </button>

          <header className="mb-12">
            <div className="flex items-center gap-4 lg:gap-6 mb-8">
               <div className="w-16 h-16 lg:w-24 lg:h-24 bg-slate-900 text-white rounded-full lg:rounded-[2rem] flex items-center justify-center text-xl lg:text-3xl font-serif italic shadow-2xl shadow-slate-900/10 shrink-0">
                  {userInfo?.name?.slice(0, 1).toUpperCase() || userId?.slice(0, 1).toUpperCase()}
               </div>
               <div className="min-w-0">
                  <h1 className="text-2xl lg:text-4xl font-serif text-slate-900 italic mb-1 lg:mb-2 truncate">
                    {userInfo?.name || "Customer Profile"}
                  </h1>
                  <p className="text-slate-500 text-xs lg:text-base mb-2 lg:mb-4 truncate">{userInfo?.email}</p>
                  <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                     <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Activity size={10} className="text-emerald-500" /> Active Profile
                     </span>
                     <span className="w-1 h-1 rounded-full bg-slate-200 hidden lg:block"></span>
                     <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[150px]">UID: {userId}</span>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar pb-4 lg:pb-0">
              <div className="flex gap-2 lg:gap-4 p-1.5 bg-slate-100/50 rounded-2xl lg:rounded-[2rem] w-fit min-w-full lg:min-w-0">
                 {[
                   { id: 'overview', label: 'Overview', icon: TrendingUp },
                   { id: 'shopping', label: 'Shopping & Drafts', icon: ShoppingCart },
                   { id: 'reviews', label: 'Sentiment & Reviews', icon: Star },
                   { id: 'finance', label: 'Invoices & Billing', icon: FileText },
                 ].map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={cn(
                       "px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-xl lg:rounded-[1.5rem] text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 lg:gap-3 whitespace-nowrap",
                       activeTab === tab.id ? "bg-white text-slate-900 shadow-xl shadow-slate-900/5" : "text-slate-400 hover:text-slate-600"
                     )}
                   >
                     <tab.icon size={12} /> {tab.label}
                   </button>
                 ))}
              </div>
            </div>
          </header>

         <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <History className="text-slate-900 mb-6" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Orders</p>
                    <p className="text-4xl font-serif italic text-slate-900">{data.orders.length}</p>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <Star className="text-amber-400 mb-6" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Reviews Provided</p>
                    <p className="text-4xl font-serif italic text-slate-900">{data.reviews?.length || 0}</p>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <ShoppingCart className="text-emerald-500 mb-6" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cart / Bundle</p>
                    <p className="text-4xl font-serif italic text-slate-900">
                      {(cartDraft?.items?.length || 0) + (bundleDrafts?.reduce((acc, d) => acc + (d.items?.length || 0), 0) || 0)}
                    </p>
                 </div>
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <FileText className="text-blue-500 mb-6" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Revenue</p>
                    <p className="text-4xl font-serif italic text-slate-900">Rs. {data.orders?.reduce((acc, o) => acc + (Number(o.total) || 0), 0).toLocaleString()}</p>
                 </div>
              </motion.div>
            )}

            {activeTab === 'shopping' && (
              <motion.div 
                key="shopping"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                  {/* Cart Section */}
                  <section>
                    <h3 className="text-2xl font-serif text-slate-900 italic mb-8">Active Shopping Cart</h3>
                    {cartDraft?.items && cartDraft.items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cartDraft.items.map((cartItem: any, idx: number) => (
                          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex gap-4">
                             <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                <img src={cartItem.item?.img} alt={cartItem.item?.title} className="w-full h-full object-cover" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-900 mb-1">{cartItem.resolved_name || cartItem.item?.name || cartItem.item?.title || "Item"}</p>
                                <p className="text-xs text-slate-400 mb-2">Qty: {cartItem.quantity} • Rs. {Number(cartItem.item?.price || 0).toLocaleString()}</p>
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded text-slate-500">{cartItem.type}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-50 border-dashed text-center text-slate-400">
                        No active cart items found
                      </div>
                    )}
                  </section>

                  {/* Bundle Section */}
                  <section>
                    <h3 className="text-2xl font-serif text-slate-900 italic mb-8">Custom Bundle Strategy</h3>
                    {bundleDrafts && bundleDrafts.length > 0 ? (
                      <div className="space-y-8">
                        {bundleDrafts.map((bDraft, bIdx) => (
                          <div key={bIdx} className="bg-slate-900 p-8 rounded-[3rem] text-white overflow-hidden relative group">
                             <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-12 -translate-y-12 group-hover:scale-125 transition-transform duration-1000">
                                <Gift size={200} />
                             </div>
                             <div className="mb-4 relative z-10 font-black uppercase tracking-[0.2em] text-primary text-[10px]">
                                {bDraft.type.replace('_', ' ')} Draft
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                                {bDraft.items?.map((bItem: any, idx: number) => (
                                  <div key={idx} className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
                                    <p className="text-xs font-bold mb-1 truncate">
                                        {bItem.resolved_name || bItem.item?.name || bItem.item?.title || "Item"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{bItem.type || 'Item'} • {bItem.quantity}x</p>
                                  </div>
                                ))}
                             </div>
                             <div className="mt-8 flex justify-between items-end relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{bDraft.items?.length || 0} Items Configured</p>
                                <p className="text-2xl font-serif italic text-primary">Rs. {(bDraft.items?.reduce((acc: any, i: any) => acc + ((i.item?.price || 0) * i.quantity), 0) || 0).toLocaleString()}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-50 border-dashed text-center text-slate-400">
                        No active bundle construction
                      </div>
                    )}
                  </section>

                  {/* Previous Orders */}
                  <section>
                    <h3 className="text-2xl font-serif text-slate-900 italic mb-8">Historical Orders</h3>
                    {data.orders.length > 0 ? (
                      <div className="space-y-4">
                        {data.orders.map((order) => (
                          <div 
                            key={order.id} 
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer group"
                          >
                             <div className="flex gap-6 items-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                   <Package size={20} />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-900">Order #{order.id?.slice(0, 8)}</p>
                                   <p className="text-xs text-slate-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">Rs. {(order.total || 0).toLocaleString()}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{order.status}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-50 border-dashed text-center text-slate-400">
                        No orders recorded
                      </div>
                    )}
                  </section>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div 
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                  <h3 className="text-2xl font-serif text-slate-900 italic mb-8">Sentiment Analysis & Reviews</h3>
                  {data.reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {data.reviews.map((review) => (
                         <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all">
                            <div className="flex justify-between items-start mb-6">
                               <div>
                                  <h4 className="font-bold text-slate-900 text-base mb-1">
                                    {review.resolved_name || "N/A"}
                                  </h4>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(review.created_at).toLocaleDateString()}</p>
                               </div>
                               <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={12} 
                                      className={cn(i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} 
                                    />
                                  ))}
                               </div>
                            </div>
                            <p className="text-slate-600 text-sm italic leading-relaxed mb-6">"{review.comment}"</p>
                            <span className={cn(
                               "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                               review.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                               {review.status}
                            </span>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-50 text-center text-slate-400">
                      No customer reviews found
                    </div>
                  )}
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div 
                key="finance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                  <h3 className="text-2xl font-serif text-slate-900 italic mb-8">Financial Documents & Invoices</h3>
                  {data.invoices.length > 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto custom-scrollbar pb-2">
                            <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-0">
                                <thead>
                                    <tr className="border-b border-slate-50 uppercase tracking-[0.2em] text-[9px] font-black text-slate-400">
                                        <th className="px-8 py-6">Invoice ID</th>
                                        <th className="px-8 py-6">Order ID</th>
                                        <th className="px-8 py-6">Amount</th>
                                        <th className="px-8 py-6">Date</th>
                                        <th className="px-8 py-6">Payment</th>
                                        <th className="px-8 py-6">Order Status</th>
                                        <th className="px-8 py-6">Method</th>
                                        <th className="px-8 py-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.invoices.map((inv: any) => {
                                        const relatedOrder = data.orders.find(o => o.id === inv.order_id);
                                        const paymentStatus = (relatedOrder?.paymentStatus || inv.status || 'pending').toLowerCase();
                                        const orderStatus = (relatedOrder?.status || 'N/A').toLowerCase();
                                        const paymentMethod = relatedOrder?.paymentMethod || 'N/A';

                                        return (
                                            <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6 font-mono text-xs text-slate-400">#{String(inv.id).slice(0, 8)}</td>
                                                <td className="px-8 py-6 font-mono text-xs text-slate-900 cursor-pointer hover:underline" onClick={() => navigate(`/admin/orders/${inv.order_id || inv.id}`)}>#{String(inv.order_id || inv.id || '').slice(0, 8)}</td>
                                                <td className="px-8 py-6 font-bold text-slate-900">Rs. {Number(inv.amount || 0).toLocaleString()}</td>
                                                <td className="px-8 py-6 text-xs text-slate-500">{inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit",
                                                        paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                                    )}>
                                                        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 w-fit">
                                                        {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                                        {paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                          onClick={() => handleDownloadInvoice(inv.order_id || inv.id)}
                                                          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-sm flex items-center gap-2"
                                                          title="Direct Download PDF"
                                                        >
                                                            <Download size={14} /> Download
                                                        </button>
                                                        <button 
                                                          onClick={() => handleViewInvoice(inv.order_id || inv.id)}
                                                          className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                                          title="View Invoice PDF"
                                                        >
                                                            <FileText size={14} /> View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                  ) : (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-50 text-center text-slate-400">
                      No recorded invoices for this user
                    </div>
                  )}
              </motion.div>
            )}
         </AnimatePresence>
       </div>
    </div>
  );
};

export default EngagementPage;
