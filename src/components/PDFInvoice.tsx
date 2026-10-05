import React from 'react';
import { Package, User, MapPin, CreditCard, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Order } from '../lib/adminService';
import { formatProductVariantName, getSizeFullName } from '../lib/utils';

interface PDFInvoiceProps {
  order: Order;
  id?: string;
}

export const PDFInvoice: React.FC<PDFInvoiceProps> = ({ order, id = "invoice-content" }) => {
  const subtotal = order.items.reduce((acc, item) => acc + ((item.item.price || item.item.totalPrice) * item.quantity), 0);

  // Safe Hex Colors to avoid oklch issues with html2canvas
  const colors = {
    primary: '#ffd200',
    slate900: '#0f172a',
    slate600: '#475569',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate300: '#cbd5e1',
    slate200: '#e2e8f0',
    slate100: '#f1f5f9',
    slate50: '#f8fafc',
    white: '#ffffff',
    emerald500: '#10b981',
    green500: '#22c55e'
  };

  return (
    <div 
      id={id} 
      style={{ 
        backgroundColor: colors.white, 
        borderRadius: '24px', 
        border: `1px solid ${colors.slate100}`,
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
      }}
      className="overflow-hidden print:shadow-none print:border-none print:rounded-none mx-auto w-full max-w-4xl"
    >
      {/* Top Branding Header */}
      <div 
        style={{ 
          borderBottom: `4px solid ${colors.primary}`, 
          backgroundColor: colors.slate900, 
          color: colors.white,
          padding: '24px'
        }}
        className="md:p-12 relative overflow-hidden"
      >
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <h1 style={{ color: colors.primary, margin: 0 }} className="text-xl md:text-3xl font-black uppercase tracking-[0.2em]">Shadi <span style={{ color: colors.white }}>Mehal</span></h1>
              <p style={{ color: colors.slate400, marginTop: '8px' }} className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Luxury Event Orchestration Bureau</p>
            </div>
            <div className="text-left md:text-right">
              <h2 style={{ color: colors.primary, margin: 0 }} className="text-3xl md:text-5xl font-sans font-semibold">Invoice</h2>
              <p style={{ color: colors.slate400, marginTop: '8px', lineHeight: '1.4' }} className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                ID: #{order.id?.slice(-8).toUpperCase()} <br />
                {new Date(order.createdAt || order.created_at || '').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
         </div>
      </div>

      <div className="p-6 md:p-12 space-y-8 md:space-y-16">
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4 md:space-y-6">
            <div style={{ color: colors.primary }} className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
               <User className="w-3 h-3 md:w-4 md:h-4" />
               Customer
            </div>
            <div 
              style={{ backgroundColor: colors.slate50, borderRadius: '20px', border: `1px solid ${colors.slate100}`, padding: '20px' }}
              className="md:p-8"
            >
               <h3 style={{ color: colors.slate900, margin: 0 }} className="text-lg md:text-xl font-sans font-semibold">{order.userName}</h3>
               <p style={{ color: colors.slate400, marginTop: '2px' }} className="text-[9px] md:text-[11px] font-black uppercase tracking-widest">{order.userEmail}</p>
               
               <div className="mt-4 md:mt-8 space-y-2 md:space-y-4">
                  <div style={{ color: colors.slate600 }} className="flex items-center gap-3 text-[9px] md:text-[11px] font-bold">
                     <div style={{ backgroundColor: '#ffd2001A', color: colors.primary }} className="w-5 h-5 rounded flex items-center justify-center">
                        <Package className="w-2.5 h-2.5" />
                     </div>
                     {order.phone}
                  </div>
                  <div style={{ color: colors.slate600 }} className="flex items-start gap-3 text-[9px] md:text-[11px] font-bold leading-relaxed">
                     <div style={{ backgroundColor: '#ffd2001A', color: colors.primary }} className="w-5 h-5 rounded flex items-center justify-center shrink-0">
                        <MapPin className="w-2.5 h-2.5" />
                     </div>
                     <span>{order.address}, {order.postalCode || order.postal_code ? ` ${order.postalCode || order.postal_code}, ` : ''} {order.city}, PK</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 md:text-right md:flex md:flex-col md:items-end">
            <div style={{ color: colors.primary }} className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest justify-start md:justify-end">
               <CreditCard className="w-3 h-3 md:w-4 md:h-4" />
               Finance
            </div>
            <div 
              style={{ backgroundColor: colors.slate900, color: colors.white, borderRadius: '20px', padding: '20px' }} 
              className="md:p-8 space-y-4 md:space-y-6 w-full"
            >
              <div className="flex justify-between items-center">
                <span style={{ color: colors.slate400 }} className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Promo Code</span>
                <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-[#ffd200]">{order.couponCode || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: colors.slate400 }} className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Method</span>
                <span className="text-[9px] md:text-xs font-black uppercase tracking-widest">{order.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span style={{ color: colors.slate400 }} className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Status</span>
                <span 
                  style={{ 
                    backgroundColor: order.paymentStatus === 'paid' ? '#10b98133' : '#f59e0b33',
                    borderColor: order.paymentStatus === 'paid' ? '#10b9814d' : '#f59e0b4d',
                    color: order.paymentStatus === 'paid' ? '#34d399' : '#fbbf24',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '8px',
                    fontWeight: 'black',
                    textTransform: 'uppercase',
                    border: '1px solid'
                  }}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: '16px' }} className="flex justify-between items-end">
                <span style={{ color: colors.slate400 }} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Total</span>
                <span style={{ color: colors.primary }} className="text-xl md:text-3xl font-sans font-semibold">Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ borderTop: `1px solid ${colors.slate100}`, paddingTop: '24px' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.slate900}` }}>
                  <th style={{ color: colors.slate400, paddingBottom: '16px' }} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Items</th>
                  <th style={{ color: colors.slate400, paddingBottom: '16px' }} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-center">Qty</th>
                  <th style={{ color: colors.slate400, paddingBottom: '16px' }} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-right">Price</th>
                  <th style={{ color: colors.slate400, paddingBottom: '16px' }} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((cartItem, idx) => {
                  const item = cartItem.item;
                  const price = item.price || item.totalPrice;
                  return (
                    <tr key={idx} style={{ borderBottom: `1px solid ${colors.slate50}` }}>
                      <td style={{ padding: '20px 0' }}>
                        <div className="flex items-center gap-4">
                           <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.slate100}`, borderRadius: '12px', overflow: 'hidden', padding: '2px' }} className="w-10 h-10 shrink-0">
                              <img 
                                 src={item.img || item.image_url} 
                                 className="w-full h-full object-cover rounded-lg" 
                                 alt="" 
                                 referrerPolicy="no-referrer"
                                 crossOrigin="anonymous"
                              />
                           </div>
                           <div>
                             <p style={{ color: colors.slate900, margin: 0 }} className="text-xs font-bold leading-tight">{cartItem.type === 'product' && item.selectedVariant ? formatProductVariantName(item.title, item.selectedVariant.color_name, item.selectedVariant.size) : (item.title || item.name)}</p>
                             <p style={{ color: colors.slate400, marginTop: '2px', margin: 0 }} className="text-[8px] font-black uppercase tracking-widest">{cartItem.type}{item.selectedVariant && (item.selectedVariant.color_name?.toLowerCase() !== 'standard' || item.selectedVariant.size) ? ` • ${[item.selectedVariant.color_name?.toLowerCase() !== 'standard' ? item.selectedVariant.color_name : null, getSizeFullName(item.selectedVariant.size)].filter(Boolean).join(' / ')}` : ''}</p>
                           </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 0', color: colors.slate900 }} className="text-center text-xs font-bold">{cartItem.quantity}</td>
                      <td style={{ padding: '20px 0', color: colors.slate500 }} className="text-right text-xs">Rs.{price.toLocaleString()}</td>
                      <td style={{ padding: '20px 0', color: colors.slate900 }} className="text-right text-xs font-black">Rs.{ (price * cartItem.quantity).toLocaleString() }</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculations & Gratitude Section */}
        <div style={{ borderTop: `1px solid ${colors.slate100}`, paddingTop: '40px' }} className="flex flex-col md:flex-row justify-between items-start gap-12">
           <div className="flex-1 space-y-8">
              <div 
                style={{ backgroundColor: colors.slate50, border: `1px solid ${colors.slate100}`, borderRadius: '24px', padding: '24px' }}
              >
                <h4 style={{ color: colors.slate900, margin: '0 0 12px 0' }} className="text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Package style={{ color: colors.primary }} className="w-3 h-3 md:w-4 md:h-4" />
                   Delivery Notes
                </h4>
                <p style={{ color: colors.slate600, margin: 0 }} className="text-[9px] md:text-[12px] font-bold leading-relaxed text-slate-500">
                  "{order.notes || "No special instructions provided."}"
                </p>
              </div>
           </div>
           
           <div className="w-full md:w-80 space-y-4">
              <div style={{ color: colors.slate500, padding: '0 12px' }} className="flex justify-between text-[10px] md:text-[12px] font-bold uppercase tracking-widest">
                <span>Subtotal</span>
                <span>Rs. {(order.subtotal || subtotal).toLocaleString()}</span>
              </div>
              <div style={{ color: colors.slate500, padding: '0 12px' }} className="flex justify-between text-[10px] md:text-[12px] font-bold uppercase tracking-widest">
                <span>Shipping Fee</span>
                <span style={{ color: colors.green500 }}>FREE</span>
              </div>
              {order.discountAmount > 0 && (
                 <div style={{ color: colors.primary, padding: '0 12px' }} className="flex justify-between text-[10px] md:text-[12px] font-bold uppercase tracking-widest">
                   <span>Discount ({order.couponCode})</span>
                   <span>- Rs. {order.discountAmount.toLocaleString()}</span>
                 </div>
              )}
              <div style={{ backgroundColor: colors.slate900, borderColor: colors.slate900, borderRadius: '24px', padding: '32px', border: '1px solid', marginTop: '16px' }} className="shadow-2xl">
                 <div className="flex justify-between items-center">
                   <span style={{ color: colors.slate400 }} className="text-[10px] font-black uppercase tracking-widest">Total Pay</span>
                   <span style={{ color: colors.primary }} className="text-2xl md:text-4xl font-sans font-semibold">Rs. {order.total.toLocaleString()}</span>
                 </div>
               </div>
            </div>
        </div>

        {/* Sign-off branding */}
        <div style={{ borderTop: `1px solid ${colors.slate50}`, paddingTop: '40px' }} className="text-center">
           <h3 style={{ color: colors.slate900, margin: 0 }} className="text-lg font-sans font-semibold">Shadi Mehal</h3>
           <p style={{ color: colors.slate400, margin: '4px 0 0 0' }} className="text-[8px] font-bold uppercase tracking-[0.2em]">Crafting Masterpieces</p>
        </div>
      </div>
    </div>
  );
};
