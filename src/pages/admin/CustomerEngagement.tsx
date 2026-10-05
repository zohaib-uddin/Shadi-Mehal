import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  MessageSquare, 
  FileText, 
  MousePointer2, 
  Calendar, 
  Clock,
  Package,
  Star
} from 'lucide-react';
import { adminService, Order, Review, Invoice } from '../../lib/adminService';
import { toast } from 'react-hot-toast';

type TabType = 'orders' | 'reviews' | 'invoices' | 'activity';

export default function CustomerEngagement() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<{
    orders: Order[];
    reviews: Review[];
    invoices: Invoice[];
    drafts: any[];
  }>({
    orders: [],
    reviews: [],
    invoices: [],
    drafts: []
  });

  useEffect(() => {
    if (userId) {
      loadEngagementData();
    }
  }, [userId]);

  const loadEngagementData = async () => {
    setLoading(true);
    try {
      // 1. Get user details
      const allUsers = await adminService.getUsers();
      const foundUser = allUsers.find((u: any) => u.id === userId || u.userId === userId);
      setUser(foundUser);

      // 2. Get history
      const history = await adminService.getCustomerEngagement(userId!);
      setData(history);
    } catch (err) {
      toast.error("Failed to load engagement records");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: any; count: number }[] = [
    { id: 'orders', label: 'Order History', icon: ShoppingBag, count: data.orders.length },
    { id: 'reviews', label: 'Sentiment & Reviews', icon: MessageSquare, count: data.reviews.length },
    { id: 'invoices', label: 'Invoices', icon: FileText, count: data.invoices.length },
    { id: 'activity', label: 'Drafts & Bundles', icon: MousePointer2, count: data.drafts.length }
  ];

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-3xl font-serif italic text-slate-900">Engagement Profile</h3>
            <p className="text-slate-400 text-sm mt-1">Full interaction history for <span className="text-slate-900 font-bold">{user?.name || 'Client'}</span></p>
          </div>
        </div>
        
        <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-1">Customer ID</p>
          <code className="text-xs font-mono font-bold text-slate-900">{userId}</code>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-8 rounded-[40px] border transition-all text-left ${
              activeTab === tab.id 
                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20' 
                : 'bg-white border-slate-100 text-slate-900 hover:border-primary/50'
            }`}
          >
            <tab.icon className={`w-8 h-8 mb-6 ${activeTab === tab.id ? 'text-primary' : 'text-slate-200'}`} />
            <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-slate-400' : 'text-slate-400'}`}>
              {tab.label}
            </p>
            <h4 className="text-4xl font-serif italic mt-2 leading-none">{tab.count}</h4>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/50 min-h-[400px]">
        {activeTab === 'orders' && (
          <div className="p-10">
            <h4 className="text-2xl font-serif italic text-slate-900 mb-8 flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-primary" /> Purchased Items
            </h4>
            
            {data.orders.length === 0 ? (
              <EmptyState icon={ShoppingBag} message="No previous orders found for this client" />
            ) : (
              <div className="space-y-6">
                {data.orders.map((order) => (
                  <div key={order.id} className="p-8 rounded-3xl border border-slate-50 bg-slate-50/30 flex flex-wrap items-center justify-between gap-8 group hover:bg-white hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-900 border border-slate-100">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Order #{order.id?.slice(-6).toUpperCase()}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Calendar className="w-3 h-3" /> {new Date(order.created_at || '').toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-slate-100">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 items-center">
                      <p className="text-2xl font-serif italic text-slate-900">Rs. {order.total.toLocaleString()}</p>
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center -space-x-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm" title={item.item?.title}>
                          <img src={item.item?.img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="p-10">
            <h4 className="text-2xl font-serif italic text-slate-900 mb-8 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary" /> Customer sentiment
            </h4>
            
            {data.reviews.length === 0 ? (
              <EmptyState icon={MessageSquare} message="This customer hasn't left any reviews yet" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.reviews.map((review) => (
                  <div key={review.id} className="p-8 rounded-[40px] border border-slate-50 bg-slate-50/30">
                    <div className="flex items-center gap-1 mb-4">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-primary fill-primary' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium italic">"{review.comment}"</p>
                    <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Review for</span>
                      <span className="text-[10px] font-bold text-slate-900 uppercase">Item ID: {review.item_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="p-10">
            <h4 className="text-2xl font-serif italic text-slate-900 mb-8 flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" /> Financial Records
            </h4>
            {data.invoices.length === 0 ? (
              <EmptyState icon={FileText} message="No invoices issued for this client" />
            ) : (
              <div className="space-y-4">
                {data.invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-6 rounded-3xl border border-slate-50">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">INV-{inv.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Order link: {inv.order_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-serif italic text-slate-900">Rs. {inv.amount.toLocaleString()}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${inv.status === 'paid' ? 'text-green-500' : 'text-orange-500'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-10">
            <h4 className="text-2xl font-serif italic text-slate-900 mb-8 flex items-center gap-3">
              <MousePointer2 className="w-6 h-6 text-primary" /> Draft Designs & Cart
            </h4>
            {data.drafts.length === 0 ? (
              <EmptyState icon={MousePointer2} message="No active drafts or items in cart" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.drafts.map((draft) => (
                  <div key={draft.id} className="p-8 rounded-[40px] bg-slate-900 text-white shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-3 py-1 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-lg">{draft.type}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Last Modified: {new Date(draft.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {draft.items?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-none">{item.item?.title || 'Unknown Item'}</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">
                              {item.type} • {item.quantity} units
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-100">
      <div className="w-20 h-20 rounded-[30px] bg-white flex items-center justify-center text-slate-200 mb-6 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-slate-400 font-serif italic text-lg">{message}</p>
    </div>
  );
}
