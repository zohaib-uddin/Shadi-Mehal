import React, { useEffect, useState } from 'react';
import { adminService, Order } from '../../lib/adminService';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Search, 
  Filter, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={12} />;
      case 'processing': return <Package size={12} />;
      case 'shipped': return <Truck size={12} />;
      case 'cancelled': return <XCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 md:mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-slate-900 italic mb-2">Order Management</h1>
            <p className="text-sm text-slate-500 font-sans tracking-wide">Monitor and process customer orders</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all w-full md:w-64"
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-black uppercase tracking-widest text-[10px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order ID</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOrders.map((order) => (
                      <motion.tr 
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <span className="font-mono text-xs text-slate-400">#{order.id?.slice(0, 8)}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-bold text-slate-900 mb-0.5">{order.userName}</p>
                            <p className="text-xs text-slate-400">{order.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs text-slate-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-bold text-slate-900">Rs. {order.total.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-2 w-fit",
                            getStatusColor(order.status)
                          )}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="p-2.5 rounded-xl hover:bg-white hover:shadow-lg transition-all text-slate-400 hover:text-slate-900"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredOrders.map((order) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-mono text-[10px] text-slate-300 mb-1">#{order.id?.slice(0, 8)}</p>
                      <h4 className="font-bold text-slate-900">{order.userName}</h4>
                      <p className="text-xs text-slate-400">{order.userEmail}</p>
                    </div>
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1.5",
                      getStatusColor(order.status)
                    )}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-300 mb-0.5">Total Amount</p>
                      <p className="text-lg font-black text-slate-900 font-sans">Rs. {order.total.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-primary hover:text-black transition-all shadow-lg shadow-slate-900/10"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                  <div className="mt-3">
                    <p className="text-[10px] text-slate-400">Ordered on: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center">
            <Package size={48} className="mx-auto text-slate-200 mb-6" />
            <h3 className="text-xl font-serif text-slate-900 italic mb-2">No orders found</h3>
            <p className="text-slate-500">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
