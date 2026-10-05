import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService, Order } from '../lib/adminService';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard,
  FileText,
  Calendar,
  Gift,
  MessageSquare,
  Ticket,
  Loader2
} from 'lucide-react';
import { cn, getSizeFullName, formatProductVariantName } from '../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import TopLoadingBar from '../components/TopLoadingBar';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(() => {
    if (!orderId) return null;
    return adminService.getOrdersCache()[orderId] || null;
  });
  const [loading, setLoading] = useState(() => !order);
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      const cached = adminService.getOrdersCache()[orderId];
      setOrder(cached || null);
      setLoading(!cached);
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await adminService.getOrderById(orderId!);
      
      // Safety check: ensure user owns this order
      if (data && data.userId !== user?.id) {
        console.warn("Security: Attempt to access someone else's order");
        navigate('/orders');
        return;
      }
      
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-bg-dark">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">
          Loading order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h2 className="text-2xl font-semibold text-black mb-6">Order not found</h2>
        <Link to="/orders" className="text-amber-400 font-black uppercase tracking-widest text-[10px] hover:tracking-[0.2em] transition-all">
          Return to History
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'shipped': return <Truck className="text-blue-500" size={20} />;
      case 'processing': return <Package className="text-amber-400" size={20} />;
      case 'cancelled': return <Package className="text-rose-500 opacity-50" size={20} />;
      default: return <Clock className="text-slate-400" size={20} />;
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-20 px-4 max-w-5xl mx-auto">
       <header className="mb-8 md:mb-12">
          <Link to="/orders" className="flex items-center gap-2 text-slate-500 hover:text-black transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-4 md:mb-6">
             <ArrowLeft size={12} /> My History
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
             <div>
                <h1 className="text-3xl md:text-5xl font-semibold text-black mb-1 md:mb-2 text-primary uppercase">Order Archive</h1>
                <p className="text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] font-black text-[8px] md:text-[9px]">Ref: #{order.id?.slice(0, 8)}</p>
             </div>
             <div className="flex items-center gap-3 md:gap-6 p-3 md:p-4 bg-black/5 rounded-2xl md:rounded-3xl border border-black/5 backdrop-blur-sm">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-black/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                   {getStatusIcon(order.status)}
                </div>
                <div>
                   <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Status</p>
                   <p className="text-xs font-bold text-black uppercase tracking-[0.1em] md:tracking-[0.2em]">{order.status}</p>
                </div>
             </div>
          </div>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
             {/* Order Line Items */}
             <div className="bg-black/5 border border-black/5 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 backdrop-blur-sm">
                <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 mb-6 md:mb-8 border-b border-black/5 pb-3 md:pb-4">Manifest</h3>
                
                <div className="space-y-4 md:space-y-6">
                   {order.items.map((item, idx) => (
                     <div key={idx} className="flex gap-4 md:gap-6 group">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-black/5 rounded-xl md:rounded-2xl overflow-hidden shrink-0 border border-black/5">
                           <img 
                             src={item.item?.img || item.item?.image_url} 
                             alt="" 
                             className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                           />
                        </div>
                        <div className="flex-1 pt-0.5 md:pt-1">
                           <div className="flex justify-between items-start mb-1 md:mb-2">
                             <h4 className="text-sm md:text-lg font-bold text-black">
                               {item.type === 'product' && item.item?.selectedVariant ? (
                                 formatProductVariantName(item.item.title, item.item.selectedVariant.color_name, item.item.selectedVariant.size)
                               ) : (
                                 item.item?.title || item.item?.name
                               )}
                             </h4>
                             <p className="text-sm md:text-base font-bold text-black">Rs. {(item.item?.price * item.quantity).toLocaleString()}</p>
                           </div>
                           {item.item?.selectedVariant && (
                             <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                               {item.item.selectedVariant.color_code && item.item.selectedVariant.color_name?.toLowerCase() !== 'standard' && (
                                 <div 
                                   className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border border-black/10" 
                                   style={{ backgroundColor: item.item.selectedVariant.color_code }} 
                                 />
                               )}
                               <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary leading-none">
                                 {[item.item.selectedVariant.color_name?.toLowerCase() !== 'standard' ? item.item.selectedVariant.color_name : null, getSizeFullName(item.item.selectedVariant.size)].filter(Boolean).join(' / ')}
                               </p>
                             </div>
                           )}
                           <p className="text-[10px] md:text-xs text-slate-500 mb-2 md:mb-4">{item.quantity} x Rs. {item.item?.price.toLocaleString()}</p>
                           {item.item?.items && item.item.items.length > 0 && (
                             <div className="mt-2 md:mt-4 mb-2 md:mb-4 space-y-1.5 md:space-y-2 pl-2 md:pl-3 border-l-2 border-black/10">
                               {item.item.items.map((sub: any, sidx: number) => (
                                 <div key={sidx} className="flex items-center justify-between">
                                   <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                                     <p className="text-[8px] md:text-[10px] font-bold text-slate-800 truncate">{sub.item.title}</p>
                                   </div>
                                   <p className="text-[8px] md:text-[10px] font-black text-slate-400">×{sub.quantity}</p>
                                 </div>
                               ))}
                             </div>
                           )}
                           <div className="flex gap-2">
                             <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 md:py-0.5 bg-black/5 rounded text-amber-400 border border-black/5">
                               {item.type}
                             </span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-black/5 space-y-3 md:space-y-4">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase tracking-widest">Subtotal</span>
                      <span className="text-black font-bold">Rs. {(order.subtotal || order.total).toLocaleString()}</span>
                   </div>
                   
                   {order.couponCode && (
                     <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 md:gap-2">
                           <Ticket size={12} className="text-primary" />
                           <span className="text-primary uppercase tracking-widest font-black text-[8px] md:text-[10px]">Promo: {order.couponCode}</span>
                        </div>
                        <span className="text-primary font-bold">- Rs. {(order.discountAmount || 0).toLocaleString()}</span>
                     </div>
                   )}

                   <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 uppercase tracking-widest">Shipping</span>
                      <span className="text-emerald-500 font-bold uppercase text-[9px] md:text-[10px]">Free</span>
                   </div>
                   <div className="flex justify-between items-center pt-4 md:pt-6 border-t border-black/5">
                      <span className="text-slate-400 font-sans text-lg md:text-xl">Total</span>
                      <span className="text-2xl md:text-3xl font-sans text-amber-400 font-semibold">Rs. {order.total.toLocaleString()}</span>
                   </div>
                </div>
             </div>

             {/* Documentation */}
             <div className="grid grid-cols-2 gap-4 md:gap-8">
                <Link 
                  to={`/orders/${order.id}/invoice`}
                  className="bg-black/5 border border-black/5 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] group hover:bg-black/10 transition-all text-left"
                >
                   <FileText className="text-slate-500 mb-2 md:mb-4 group-hover:text-amber-400 transition-colors" size={20} />
                   <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-black mb-1 md:mb-2">Invoice</h4>
                   <p className="text-[7px] md:text-[9px] text-slate-500 uppercase font-black">PDF Record</p>
                </Link>
                <div className="bg-black/5 border border-black/5 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem]">
                   <Calendar className="text-slate-500 mb-2 md:mb-4" size={20} />
                   <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-black mb-1 md:mb-2">Timeline</h4>
                   <p className="text-[7px] md:text-[9px] text-slate-500 uppercase font-black">Logged: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
             </div>
          </div>

          <div className="space-y-6 md:space-y-8">
             {/* Shipping detail */}
              <div className="bg-black/5 border border-black/5 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] backdrop-blur-sm">
                 <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 mb-6 md:mb-8">Installation Site</h3>
                 <div className="space-y-4 md:space-y-6">
                    <div className="flex gap-3 md:gap-4 items-start">
                       <div className="p-2 md:p-3 bg-black/5 rounded-xl md:rounded-2xl text-slate-500">
                          <MapPin size={16} />
                       </div>
                       <div>
                          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Shipping Address</p>
                          <p className="text-xs md:text-sm font-bold text-black mb-0.5">{order.address}</p>
                          <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                            {order.postalCode || order.postal_code ? ` ${order.postalCode || order.postal_code}, ` : ''} {order.city}, Pakistan
                          </p>
                       </div>
                    </div>

                    {order.notes && (
                       <div className="flex gap-3 md:gap-4 items-start pt-4 border-t border-black/5 mt-4">
                          <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl text-primary">
                             <MessageSquare size={16} />
                          </div>
                          <div>
                             <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-primary mb-1">Delivery Notes</p>
                             <p className="text-[10px] md:text-xs font-bold text-slate-600">"{order.notes}"</p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>

             {/* Payment Detail */}
             <div className="bg-slate-900 border border-black/5 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 grayscale">
                   <CreditCard size={60} />
                </div>
                <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white mb-6 md:mb-8 relative z-10">Financial Strategy</h3>
                <div className="space-y-3 md:space-y-4 relative z-10">
                   <div className="flex justify-between items-center text-[10px] md:text-xs">
                      <span className="text-slate-400">Method</span>
                      <span className="text-amber-500 font-bold uppercase tracking-widest">{order.paymentMethod}</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] md:text-xs">
                      <span className="text-slate-400">Status</span>
                      <span className={cn(
                        "px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border",
                        order.paymentStatus === 'paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {order.paymentStatus}
                      </span>
                   </div>
                </div>
             </div>

             {/* Support */}
             <div 
               onClick={() => {
                 const itemsList = order.items.map((item, i) => `${i + 1}. ${item.item?.title} (x${item.quantity})`).join('\n');
                 const message = `Hello Hamza Decorations Support!
 
 I'm inquiring about my order.
 
 --- Order Reference: #${order.id?.toUpperCase()} ---
 Customer: ${order.userName}
 Phone: ${order.phone}
 Total Amount: Rs. ${order.total.toLocaleString()}
 Payment Method: ${order.paymentMethod.toUpperCase()}
 
 --- Logistics ---
 City: ${order.city}
 Address: ${order.address}
 
 --- Items ---
 ${itemsList}`;
 
                 const encodedMessage = encodeURIComponent(message);
                 window.open(`https://wa.me/923116869582?text=${encodedMessage}`, '_blank');
               }}
               className="bg-amber-400 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] text-black shadow-xl shadow-amber-400/10 hover:scale-[1.02] transition-transform cursor-pointer group"
             >
                <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-black/90 mb-4 md:mb-6 group-hover:tracking-[0.4em] transition-all">Support Line</h3>
                <div className="flex items-center gap-3 md:gap-4">
                   <div className="w-10 h-10 md:w-12 md:h-12 bg-black text-amber-400 rounded-xl md:rounded-2xl flex items-center justify-center">
                      <MessageSquare size={16} />
                   </div>
                   <div>
                      <p className="text-xs md:text-sm font-black uppercase tracking-widest leading-none">WhatsApp</p>
                      <p className="text-[8px] md:text-[10px] font-bold mt-1">Order Inquiry</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default OrderDetail;
