import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, Order } from '../../lib/adminService';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  FileText,
  MessageCircle,
  MessageSquare,
  Printer
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

import { InvoiceModal } from '../../components/InvoiceModal';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrderById(orderId!);
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Could not load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'N/A';
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '92' + clean.substring(1);
    } else if (!clean.startsWith('92')) {
      clean = '92' + clean;
    }
    
    // User requested format: +92 311 6869582
    if (clean.length === 12) {
      return `+${clean.substring(0, 2)} ${clean.substring(2, 5)} ${clean.substring(5)}`;
    }
    return '+' + clean;
  };

  const handleWhatsAppConfirmation = () => {
    if (!order) return;

    // Use requested format for the link and message
    const formattedPhone = formatPhoneNumber(order.phone);
    const digitsOnlyPhone = formattedPhone.replace(/\D/g, '');

    const itemsList = order.items.map(item => `- ${item.item.title} (x${item.quantity}): Rs. ${(item.item.price * item.quantity).toLocaleString()}`).join('\n');
    
    const subtotalText = order.subtotal || order.total;
    const discountText = order.discountAmount ? `\n- Discount (${order.couponCode}): -Rs. ${order.discountAmount.toLocaleString()}` : '';
    
    const message = `*Order Confirmation - Hamza Decorations*

Dear ${order.userName},

We are pleased to confirm your order #${order.id?.slice(0, 8)}. Below are your order details:

*Items:*
${itemsList}

*Financial Summary:*
- Subtotal: Rs. ${subtotalText.toLocaleString()}${discountText}
- Total Amount: Rs. ${order.total.toLocaleString()}
- Payment Method: ${order.paymentMethod}
- Payment Status: ${order.paymentStatus}

*Shipping Information:*
- Address: ${order.address}
- City: ${order.city || 'Karachi'}

*Customer Details:*
- Name: ${order.userName}
- Phone: ${formattedPhone}
- Email: ${order.userEmail}

Thank you for choosing Hamza Decorations. We are preparing your order with care.

Best Regards,
Hamza Decorations
+92 311 6869582`;

    const encodedMessage = encodeURIComponent(message);
    // Use api.whatsapp.com directly as it sometimes handles business numbers and specific formatting better
    window.open(`https://api.whatsapp.com/send?phone=${digitsOnlyPhone}&text=${encodedMessage}`, '_blank');
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await adminService.updateOrderStatus(orderId!, newStatus);
      setOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handlePaymentStatusUpdate = async (newStatus: 'paid' | 'unpaid') => {
    try {
      await adminService.updateOrderPaymentStatus(orderId!, newStatus);
      setOrder(prev => prev ? { ...prev, paymentStatus: newStatus } : null);
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-serif italic text-slate-900">Order not found</h2>
        <button 
          onClick={() => navigate('/admin/orders')}
          className="mt-4 text-slate-500 flex items-center gap-2 mx-auto hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <InvoiceModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
        order={order} 
      />
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate('/admin/orders')}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back to Orders
        </button>

        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 md:mb-12 gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-serif text-slate-900 italic">Order #{order.id?.slice(0, 8)}</h1>
              <span className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                order.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
              )}>
                {order.status}
              </span>
            </div>
            <p className="text-slate-500 font-sans tracking-wide flex items-center gap-2 text-sm italic">
              <Calendar size={14} className="text-primary" /> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status</label>
               <select 
                 value={order.status}
                 onChange={(e) => handleStatusUpdate(e.target.value)}
                 className="w-full bg-white border border-slate-200 px-6 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
               >
                 <option value="pending">Pending</option>
                 <option value="processing">Processing</option>
                 <option value="shipped">Shipped</option>
                 <option value="delivered">Delivered</option>
                 <option value="completed">Completed</option>
                 <option value="cancelled">Cancelled</option>
               </select>
             </div>

             <div className="flex-1">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Payment</label>
               <select 
                 value={order.paymentStatus}
                 onChange={(e) => handlePaymentStatusUpdate(e.target.value as 'paid' | 'unpaid')}
                 className={cn(
                   "w-full px-6 py-3 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 transition-all shadow-sm border",
                   order.paymentStatus === 'paid' ? "bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-500/20" : "bg-rose-50 border-rose-200 text-rose-700 focus:ring-rose-500/20"
                 )}
               >
                 <option value="unpaid">Unpaid</option>
                 <option value="paid">Paid</option>
               </select>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Items */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-sm">
              <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 md:mb-8 pb-4 border-b border-slate-50 flex items-center gap-3">
                <Package size={14} /> Items Ordered
              </h3>
              
              <div className="space-y-6">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 sm:gap-6 group">
                      <div className="w-full sm:w-24 h-48 sm:h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                        <img 
                          src={item.item?.img || item.item?.image_url || "https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?w=400"} 
                          alt={item.item?.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                          <div>
                            <h4 className="text-base font-bold text-slate-900">{item.item?.title}</h4>
                            {item.item?.selectedVariant && (
                              <div className="flex items-center gap-2 mt-1">
                                {item.item.selectedVariant.color_code && (
                                  <div 
                                    className="w-2.5 h-2.5 rounded-full border border-slate-200 shadow-sm" 
                                    style={{ backgroundColor: item.item.selectedVariant.color_code }} 
                                  />
                                )}
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                                  {[item.item.selectedVariant.color_name, item.item.selectedVariant.size].filter(Boolean).join(' / ')}
                                </span>
                              </div>
                            )}

                            {/* Bundle contents for Admin */}
                            {item.item?.items && item.item.items.length > 0 && (
                              <div className="mt-3 space-y-2 pl-3 border-l-2 border-slate-100">
                                {item.item.items.map((sub: any, sidx: number) => (
                                  <div key={sidx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <p className="text-[10px] font-bold text-slate-700 truncate">{sub.item.title}</p>
                                      {sub.item.selectedVariant && (
                                        <div 
                                          className="w-1.5 h-1.5 rounded-full border border-slate-200 flex-shrink-0" 
                                          style={{ backgroundColor: sub.item.selectedVariant.color_code }} 
                                        />
                                      )}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-300">×{sub.quantity}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-bold text-slate-900">Rs. {(item.item?.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3 sm:mb-4">{item.type} • Rs. {item.item?.price.toLocaleString()} x {item.quantity}</p>
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest",
                             item.type === 'product' ? "bg-amber-100 text-amber-700" : 
                             item.type === 'deal' ? "bg-blue-100 text-blue-700" :
                             "bg-emerald-100 text-emerald-700"
                           )}>
                             {item.type}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">No items in this order payload.</p>
                )}
              </div>

              <div className="mt-10 md:mt-12 pt-8 border-t border-slate-50 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900 font-bold">Rs. {(order.subtotal || order.total).toLocaleString()}</span>
                </div>
                
                {order.couponCode && (
                  <div className="flex justify-between items-center text-sm text-primary">
                    <span className="font-black uppercase tracking-widest text-[10px]">Coupon: {order.couponCode}</span>
                    <span className="font-bold">- Rs. {(order.discountAmount || 0).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="text-emerald-600 font-black uppercase text-[10px] tracking-widest leading-loose">Free</span>
                </div>
                <div className="flex justify-between items-center text-xl md:text-2xl font-serif italic pt-6 border-t border-slate-50">
                  <span className="text-slate-900">Final Total</span>
                  <span className="text-slate-900">Rs. {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-sm">
                <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 md:mb-8 flex items-center gap-3">
                   <FileText size={14} /> Associated Invoice
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-between p-5 md:p-6 bg-slate-50 rounded-3xl border border-slate-100 gap-6">
                   <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                         <FileText className="text-slate-400" size={20} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-900">Invoice Generation</p>
                         <p className="text-[11px] text-slate-500">Based on order status and type</p>
                      </div>
                   </div>
                   <div className="w-full sm:w-auto">
                      <button 
                        onClick={() => setIsInvoiceModalOpen(true)}
                        className="w-full sm:w-auto px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary hover:text-black transition-all shadow-lg"
                      >
                         <FileText size={14} /> View Invoice PDF
                      </button>
                   </div>
                </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             {/* Customer Profile */}
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                   <User size={14} /> Customer Profile
                </h3>
                
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-2xl font-serif italic">
                      {order.userName?.[0]}
                   </div>
                   <div>
                      <p className="text-lg font-bold">{order.userName}</p>
                      <button 
                        onClick={() => navigate(`/admin/customers/${order.userId}/engagement`)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:tracking-[0.2em] transition-all"
                      >
                        View Engagement
                      </button>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <Mail size={16} className="text-slate-500" />
                      <span className="text-sm text-slate-300">{order.userEmail}</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <Phone size={16} className="text-slate-500" />
                      <span className="text-sm text-slate-300">{formatPhoneNumber(order.phone)}</span>
                   </div>
                </div>
             </div>

             {/* Shipping Detail */}
             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                   <Truck size={14} /> Shipping Address
                </h3>
                
                <div className="flex gap-4 items-start">
                   <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                      <MapPin size={20} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{order.address}</p>
                      <p className="text-xs text-slate-500">{order.postalCode || order.postal_code ? ` ${order.postalCode || order.postal_code}, ` : ''} {order.city}, Pakistan</p>
                   </div>
                </div>
                {order.notes && (
   <div className="flex gap-4 items-start pt-6 border-t border-slate-100 mt-6">
      <div className="p-3 bg-primary/10 rounded-2xl text-primary">
         <MessageSquare size={20} />
      </div>

      <div>
         <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
            Delivery Notes
         </p>

         <p className="text-sm font-medium text-slate-600">
            "{order.notes}"
         </p>
      </div>
   </div>
)}
             </div>

             {/* Payment Detail */}
             <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                   <CreditCard size={14} /> Payment Info
                </h3>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Method</span>
                      <span className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">{order.paymentMethod}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Status</span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        order.paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {order.paymentStatus}
                      </span>
                   </div>
                </div>
             </div>

             {/* Quick Actions */}
             <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={handleWhatsAppConfirmation}
                  className="w-full bg-emerald-500 text-white p-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10"
                >
                  <MessageCircle size={16} /> WhatsApp Customer
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
