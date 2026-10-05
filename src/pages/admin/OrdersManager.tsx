import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  User,
  Package,
  Truck,
  CheckCircle,
  FileText,
  ChevronDown,
  XCircle,
  Clock,
  MapPin,
  Phone
} from 'lucide-react';
import { adminService, Order } from '../../lib/adminService';
import { cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../../components/ConfirmModal';

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Update Order Status',
      message: `Are you sure you want to change this order status to "${newStatus}"?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await adminService.updateOrderStatus(id, newStatus);
          toast.success(`Order status updated to ${newStatus}`);
          loadOrders();
          if (selectedOrder?.id === id) {
            setSelectedOrder({ ...selectedOrder, status: newStatus as any });
          }
        } catch (error) {
          toast.error("Failed to update status");
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Order record',
      message: `Are you sure you want to delete this order record? This is a permanent action.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminService.deleteOrder(id);
          toast.success("Order record deleted");
          loadOrders();
        } catch (error) {
          toast.error("Failed to delete order");
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered': return 'bg-green-50 text-green-500 border-green-100';
      case 'processing': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'shipped': return 'bg-amber-50 text-amber-500 border-amber-100';
      case 'cancelled': return 'bg-red-50 text-red-500 border-red-100';
      case 'pending': return 'bg-slate-50 text-slate-400 border-slate-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="space-y-10">
      {/* Detail Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[30px] md:rounded-[50px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100"
          >
            <div className="p-6 md:p-10 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl md:text-3xl font-serif italic text-slate-900">Order Detail</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Ref: #{selectedOrder.id?.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                <XCircle className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 md:p-10 space-y-8 md:space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-8">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-primary pl-4">Delivery Logistics</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0"><User className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Client</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{selectedOrder.userName}</p>
                        <p className="text-[11px] text-slate-500">{selectedOrder.userEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0"><MapPin className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Shipping Architecture</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{selectedOrder.address}, {selectedOrder.city}</p>
                        {selectedOrder.postalCode && <p className="text-[11px] text-slate-500 mt-0.5">Zip: {selectedOrder.postalCode}</p>}
                        {selectedOrder.billingAddress && selectedOrder.billingAddress !== selectedOrder.address && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Billing Site</p>
                            <p className="text-[11px] font-bold text-slate-900 mt-1">{selectedOrder.billingAddress}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0"><Phone className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Contact Phone</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{selectedOrder.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-primary pl-4">Financial Overview</h4>
                  <div className="bg-slate-50 p-8 rounded-[30px] border border-slate-100 space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Value</span>
                        <span className="text-xl font-serif italic text-slate-900">Rs. {selectedOrder.total.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Payment Strategy</span>
                        <span className="text-[10px] text-slate-900 font-black uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200">
                          {selectedOrder.paymentMethod}
                        </span>
                     </div>
                     <div className="pt-4">
                        <Link 
                          to={`/orders/${selectedOrder.id}/invoice`}
                          target="_blank"
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                        >
                          <FileText className="w-4 h-4" />
                          View Full Invoice
                        </Link>
                     </div>
                     <div className="pt-6 mt-6 border-t border-slate-200">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Command Action</p>
                        <div className="grid grid-cols-2 gap-3">
                           {['pending', 'processing', 'completed', 'cancelled'].map(st => (
                             <button
                               key={st}
                               onClick={() => handleStatusChange(selectedOrder.id!, st)}
                               className={cn(
                                 "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                 selectedOrder.status === st 
                                 ? "bg-slate-900 text-white border-slate-900" 
                                 : "bg-white text-slate-400 border-slate-200 hover:border-primary"
                               )}
                             >
                               {st}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 border-l-4 border-primary pl-4">Item Catalog</h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 transition-all">
                       <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                          <img src={item.item.img || item.item.image_url} className="w-full h-full object-cover" alt="" />
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{item.item.title}</p>
                          {item.item.selectedVariant && (
                            <div className="flex items-center gap-2 mt-1 mb-1">
                              {item.item.selectedVariant.color_code && (
                                <div 
                                  className="w-2 h-2 rounded-full border border-slate-200" 
                                  style={{ backgroundColor: item.item.selectedVariant.color_code }} 
                                />
                              )}
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary leading-none">
                                {[item.item.selectedVariant.color_name, item.item.selectedVariant.size].filter(Boolean).join(' / ')}
                              </span>
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">{item.type} • Rs. {item.item.price.toLocaleString()} × {item.quantity}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center justify-between">
              <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Orders</p>
                  <p className="text-3xl md:text-4xl font-serif italic text-slate-900">{orders.length}</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-900"><Package className="w-5 h-5 md:w-6 md:h-6" /></div>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center justify-between">
              <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Sales</p>
                  <p className="text-2xl md:text-4xl font-serif italic text-slate-900 leading-tight">Rs. {orders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-900"><CreditCard className="w-5 h-5 md:w-6 md:h-6" /></div>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center justify-between sm:col-span-2 lg:col-span-1">
              <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Pending Delivery</p>
                  <p className="text-3xl md:text-4xl font-serif italic text-slate-900">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-900"><Truck className="w-5 h-5 md:w-6 md:h-6" /></div>
          </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/30 gap-6">
          <h3 className="text-2xl font-serif italic text-slate-900">Order Ledger</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input placeholder="Transaction ID..." className="w-full bg-white border border-slate-100 rounded-xl py-3 pl-10 pr-4 text-[10px] uppercase font-black outline-none focus:ring-2 focus:ring-primary/20" />
             </div>
             <button className="flex items-center justify-center p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-10 py-6">Reference</th>
                <th className="px-10 py-6">Customer</th>
                <th className="px-10 py-6">Total Amount</th>
                <th className="px-10 py-6">Order Status</th>
                <th className="px-10 py-6">Payment</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                   [1,2,3,4,5].map(i => (
                     <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-10 py-6"><div className="h-4 bg-slate-100 rounded"></div></td>
                     </tr>
                   ))
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8 min-w-[200px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><FileText className="w-5 h-5" /></div>
                        <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">#{order.id?.slice(-8).toUpperCase()}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Drafted'}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-[10px]">
                        {order.userName ? order.userName[0] : 'U'}
                      </div>
                      <div>
                         <p className="text-[13px] font-bold text-slate-900">{order.userName}</p>
                         <p className="text-[9px] text-slate-400 font-medium">{order.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-serif italic text-slate-900">Rs. {order.total.toLocaleString()}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="relative flex items-center gap-2 group/status">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                        getStatusColor(order.status)
                      )}>
                        {order.status}
                      </span>
                      <div className="opacity-0 group-hover/status:opacity-100 transition-opacity flex gap-1">
                         {['processing', 'completed', 'cancelled'].filter(s => s !== order.status).slice(0, 1).map(next => (
                           <button 
                             key={next}
                             onClick={() => handleStatusChange(order.id!, next)}
                             className="p-1 hover:text-primary transition-colors"
                             title={`Move to ${next}`}
                           >
                              <ChevronDown className="w-4 h-4" />
                           </button>
                         ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-2">
                        {order.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-slate-300" />}
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{order.paymentMethod}</span>
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button 
                         onClick={() => handleDelete(order.id!)}
                         className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {orders.length === 0 && !loading && (
            <div className="py-32 text-center bg-white">
                <CreditCard className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <h3 className="text-2xl font-serif italic text-slate-300">Revenue stream is currently quiet</h3>
            </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({...confirmModal, isOpen: false})}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
