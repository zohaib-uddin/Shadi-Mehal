import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Sparkles, 
  Users, 
  CreditCard, 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Mail,
  Tags,
  Star,
  Ticket,
  Search as SearchIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../../components/LogoutConfirmModal';

const ADMIN_MENU = [
  { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
  { name: 'Categories', icon: Tags, path: '/admin/categories' },
  { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
  { name: 'Services', icon: Sparkles, path: '/admin/services' },
  { name: 'Service Inquiries', icon: Sparkles, path: '/admin/service-requests' },
  { name: 'Orders & Sales', icon: CreditCard, path: '/admin/orders' },
  { name: 'Customers', icon: Users, path: '/admin/customers' },
  { name: 'Invoices', icon: FileText, path: '/admin/invoices' },
  { name: 'Coupons', icon: Ticket, path: '/admin/coupons' },
  { name: 'Gallery', icon: ImageIcon, path: '/admin/gallery' },
  { name: 'Reviews', icon: Star, path: '/admin/reviews' },
  { name: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
  { name: 'Deals', icon: ShoppingBag, path: '/admin/deals' },
  { name: 'Messages', icon: Mail, path: '/admin/messages' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userData } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    if (debouncedQuery.trim() && isSearchOpen) {
      navigate(`/admin/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
    }
  }, [debouncedQuery, navigate, isSearchOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Toggle */}
      <div className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-[60]">
        <Link to="/" className="flex items-center space-x-2">
            <span className="text-sm font-serif font-black tracking-widest text-primary uppercase">
              HAMZA<span className="italic text-slate-900 lowercase font-bold">Admin</span>
            </span>
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (!isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
            }} 
            className="p-1.5 text-slate-900 bg-slate-50 rounded-lg"
          >
             <SearchIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 text-slate-900 bg-slate-50 rounded-lg">
             {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Expansion */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-b border-slate-100 overflow-hidden sticky top-16 z-50 shadow-lg"
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center px-6 py-4 bg-primary/10">
               <SearchIcon className="w-5 h-5 text-slate-400 mr-3" />
               <input 
                 ref={searchInputRef}
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search Admin Panel..."
                 className="flex-1 bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 outline-none p-0"
               />
               <button type="submit" className="text-[10px] font-black uppercase text-slate-900 bg-primary px-3 py-1.5 rounded-lg shadow-sm">Search</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-16 bottom-0 left-0 z-50 w-72 md:w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-500 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
        isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="p-10 hidden lg:block">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-serif font-black tracking-widest text-primary uppercase">
              HAMZA<span className="italic text-slate-900 lowercase font-bold">Admin</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-4">Management</p>
          {ADMIN_MENU.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-4 rounded-2xl transition-all group",
                  isActive 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900")} />
                  <span className="text-sm font-bold tracking-tight">{item.name}</span>
                </div>
                {isActive && <motion.div layoutId="active-indicator"><ChevronRight className="w-4 h-4 text-primary" /></motion.div>}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-slate-100">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase">
              {userData?.name ? userData.name[0] : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-900 truncate">{userData?.name || 'Administrator'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hamza Decorations</p>
            </div>
          </div>
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          await logout();
          navigate('/admin/login');
        }}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-40">
          <h2 className="text-2xl font-serif italic text-slate-900">
            {ADMIN_MENU.find(m => m.path === location.pathname)?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-6">
             {/* Admin Search Desktop */}
             <div className="relative hidden lg:block" ref={searchContainerRef}>
                <motion.form 
                  onSubmit={handleSearchSubmit}
                  initial={false}
                  animate={isSearchOpen ? "open" : "closed"}
                  className="flex items-center"
                >
                  <motion.div
                    variants={{
                      closed: { width: 0, opacity: 0, marginRight: 0 },
                      open: { width: 300, opacity: 1, marginRight: 12 }
                    }}
                    className="overflow-hidden"
                  >
                    <input 
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search orders, clients, invoices..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 text-xs font-bold tracking-tight text-slate-900 focus:outline-none focus:border-primary transition-all shadow-inner"
                    />
                  </motion.div>
                  <button 
                    type="button"
                    onClick={() => {
                      if (!isSearchOpen) {
                        setIsSearchOpen(true);
                        setTimeout(() => searchInputRef.current?.focus(), 100);
                      } else {
                        handleSearchSubmit({ preventDefault: () => {} } as any);
                      }
                    }}
                    className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                  >
                    <SearchIcon className="w-5 h-5" />
                  </button>
                </motion.form>
             </div>
          </div>
        </header>

        <div className="p-6 md:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
