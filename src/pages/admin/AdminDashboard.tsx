import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Database,
  Loader2,
  Package
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { adminService } from '../../lib/adminService';
import { cn } from '../../lib/utils';

const chartData = [
  { name: 'Mon', sales: 4000, orders: 24 },
  { name: 'Tue', sales: 3000, orders: 18 },
  { name: 'Wed', sales: 2000, orders: 15 },
  { name: 'Thu', sales: 2780, orders: 20 },
  { name: 'Fri', sales: 1890, orders: 12 },
  { name: 'Sat', sales: 2390, orders: 32 },
  { name: 'Sun', sales: 3490, orders: 28 },
];

const COLORS = ['#D4AF37', '#1a1a1a', '#f1f1f1', '#888888'];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 group hover:border-primary/50 transition-all"
  >
    <div className="flex items-start justify-between mb-4 md:mb-6">
      <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-black transition-all">
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-[10px] md:text-[11px] font-black uppercase tracking-widest",
        trend === 'up' ? "text-green-500" : "text-red-500"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" /> : <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />}
        {change}
      </div>
    </div>
    <h3 className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-1 md:mb-2">{title}</h3>
    <p className="text-3xl md:text-4xl font-serif italic text-slate-900">{value}</p>
  </motion.div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [timeframe, setTimeframe] = useState('Last 7 Days');
  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    allOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const data = await adminService.getAdminStats();
    setStats(data);
    setLoading(false);
  };

  const getFilteredChartData = () => {
    const orders = stats.allOrders || [];
    const completedOrders = orders.filter((o: any) => o.status === 'completed');
    
    const now = new Date();
    let startDate = new Date();
    let points: { name: string, sales: number }[] = [];
    
    if (timeframe === 'Today') {
      startDate.setHours(0, 0, 0, 0);
      // Generate 24 hourly points
      for (let i = 0; i < 24; i++) {
        const h = new Date(startDate);
        h.setHours(i);
        points.push({ name: `${i}:00`, sales: 0 });
      }
    } else if (timeframe === 'Yesterday') {
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      for (let i = 0; i < 24; i++) {
        const h = new Date(startDate);
        h.setHours(i);
        points.push({ name: `${i}:00`, sales: 0 });
      }
    } else if (timeframe === 'Last 7 Days') {
      startDate.setDate(now.getDate() - 7);
      for (let i = 0; i <= 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        points.push({ name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), sales: 0 });
      }
    } else if (timeframe === '1 Month') {
      startDate.setMonth(now.getMonth() - 1);
      const days = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      for (let i = 0; i <= days; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        points.push({ name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), sales: 0 });
      }
    } else { // 3 Months / Lifetime
      startDate.setMonth(now.getMonth() - 3);
      // Weekly points for 3 months
      for (let i = 0; i <= 12; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + (i * 7));
        points.push({ name: `Week ${i + 1}`, sales: 0 });
      }
    }

    completedOrders.forEach((o: any) => {
      const oDate = new Date(o.createdAt || o.created_at);
      if (oDate < startDate) return;

      if (timeframe === 'Today' || timeframe === 'Yesterday') {
        const hour = oDate.getHours();
        if (points[hour]) points[hour].sales += Number(o.total || 0);
      } else if (timeframe === 'Last 7 Days' || timeframe === '1 Month') {
        const key = oDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const p = points.find(p => p.name === key);
        if (p) p.sales += Number(o.total || 0);
      } else {
        // Find correct week for 3 months
        const weekIndex = Math.floor((oDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        if (points[weekIndex]) points[weekIndex].sales += Number(o.total || 0);
      }
    });

    return points;
  };

  const dashboardChartData = getFilteredChartData();

  const checkConnection = async () => {
    try {
      const dbStats = await adminService.checkTableStructures();
      setDebugInfo(dbStats);
    } catch (e) {
      setDebugInfo({ error: "Failed to run diagnostics" });
    }
  };

  const handleSeed = async () => {
    if (!confirm("Are you sure you want to add placeholder data to your Supabase tables (Products, Services, Categories)?")) return;
    
    setIsSeeding(true);
    try {
      await adminService.seedDummyCategories();
      await adminService.seedDummyProducts();
      await adminService.seedDummyServices();
      alert("Placeholder data seeded successfully! You can now explore the marketplace and shop.");
      fetchStats();
    } catch (error: any) {
      alert("Failed to seed data: " + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleBulkReviews = async () => {
    setIsSeeding(true);
    try {
      const { bulkGenerateMissingReviews } = await import('../../lib/reviewGenerator');
      const count = await bulkGenerateMissingReviews();
      alert(`Successfully generated auto-reviews for ${count} items!`);
      fetchStats();
    } catch (error: any) {
      alert("Failed to generate reviews: " + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header with Seed Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-slate-900">Admin Control Center</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Oversee your business operations</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleBulkReviews}
            disabled={isSeeding}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 border-2 border-slate-900 text-slate-900 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
          >
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            Auto Review
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Revenue" value={`Rs. ${stats.totalRevenue.toLocaleString()}`} change="Real-time" icon={CreditCard} trend="up" />
        <StatCard title="Total Orders" value={stats.totalOrders.toString()} change={`${stats.pendingOrders} Pending`} icon={ShoppingBag} trend="up" />
        <StatCard title="Active Customers" value={stats.totalUsers.toString()} change="Verified" icon={Users} trend="up" />
        <StatCard title="Completed Orders" value={stats.completedOrders.toString()} change="Archived" icon={TrendingUp} trend="up" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
            <div>
                <h3 className="text-xl md:text-2xl font-serif italic text-slate-900">Revenue Analytics</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Status: Completed Orders Only</p>
            </div>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-6 py-3 text-slate-500 outline-none focus:ring-2 focus:ring-primary/20"
            >
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 Days</option>
                <option>1 Month</option>
                <option>Last 3 Months</option>
                <option>Lifetime</option>
            </select>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#CBD5E1'}} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#CBD5E1'}}
                    tickFormatter={(value) => `Rs.${value/1000}k`}
                />
                <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}}
                    labelStyle={{fontFamily: 'serif', fontStyle: 'italic', fontSize: '16px', color: '#1a1a1a'}}
                />
                <Area type="monotone" dataKey="sales" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-serif italic text-slate-900">Recent Orders</h3>
            </div>
            <div className="space-y-6 md:space-y-8">
                {stats.recentOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No orders in last 7 days</p>
                ) : stats.recentOrders.map((item: any) => (
                    <div key={item.id} className="flex gap-4 cursor-pointer hover:bg-slate-50 transition-all p-2 rounded-2xl" onClick={() => navigate(`/admin/orders/${item.id}`)}>
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                            item.status === 'pending' ? "bg-amber-50 text-amber-500" :
                            item.status === 'completed' || item.status === 'delivered' ? "bg-green-50 text-green-500" : 
                            "bg-red-50 text-red-500"
                        )}>
                            <Package className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{item.userName}</p>
                            <p className="text-[11px] text-slate-400 font-medium">Order #{item.id?.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-1">
                                {new Date(item.createdAt || item.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="w-full mt-10 py-5 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all"
            >
                View All Orders
            </button>
        </div>
      </div>

      {/* Top Products/Services */}
       <div className="grid grid-cols-1 gap-8">
            <div className="bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50">
                <h3 className="text-xl md:text-2xl font-serif italic text-slate-900 mb-8 md:mb-10">Top Selling Products</h3>
                <div className="space-y-5 md:space-y-6">
                    {stats.topProducts.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No sales data recorded</p>
                    ) : stats.topProducts.map((row: any, i: number) => (
                        <div key={i} className="group relative">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-slate-900">{row.name}</span>
                                <span className="text-[11px] text-green-500 font-black">{row.growth}</span>
                            </div>
                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((row.sales / 20) * 100, 100)}%` }}
                                    className="h-full bg-primary"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
       </div>
    </div>
  );
}
