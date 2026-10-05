import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, User, Menu, X, LogIn, LogOut, LayoutDashboard, Crown, LayoutGrid, Package, Search as SearchIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import LogoutConfirmModal from './LogoutConfirmModal';

export default React.memo(function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData, logout } = useAuth();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Navigate when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() && isSearchOpen) {
      navigate(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
    }
  }, [debouncedQuery, navigate, isSearchOpen]);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const NAV_LINKS = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Deals', path: '/deals' },
    { name: 'Services', path: '/marketplace' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
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
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-nav backdrop-blur-lg border-b border-border shadow-sm">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16 md:h-20 relative">
          {/* Mobile: Hamburger Button (Left) */}
          <div className="lg:hidden flex-1 flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-slate-900 p-2 bg-slate-50/80 backdrop-blur-sm rounded-xl hover:bg-primary hover:text-black transition-all border border-slate-100 shadow-sm active:scale-95"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>

          {/* Logo Container */}
          <div className="flex items-center lg:flex-none flex-[2] justify-center lg:justify-start">
            <Link to="/" className="flex items-center group relative py-1">
              <motion.div 
                className="flex flex-col relative"
                whileHover="hover"
                initial="initial"
              >
                <div className="flex items-baseline overflow-hidden">
                  <span className="text-lg md:text-2xl font-semibold tracking-tight text-slate-900 uppercase transition-colors duration-500 group-hover:text-primary">
                    Shadi
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <motion.div 
                    className="h-[1.5px] bg-primary origin-left"
                    variants={{
                      initial: { width: "8px" },
                      hover: { width: "100%" }
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="text-[7px] md:text-[9px] font-black tracking-[0.3em] md:tracking-[0.4em] text-slate-500 uppercase leading-none group-hover:text-slate-900 transition-colors duration-500 whitespace-nowrap">
                    Mehal
                  </span>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Desktop Navigation Hub */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8 text-[11px] uppercase tracking-nav font-black">
              {NAV_LINKS.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={cn(
                    "hover:text-primary transition-all duration-300 relative py-2",
                    isActive(link.path) ? "text-primary" : "text-slate-500"
                  )}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.span 
                      layoutId="active-nav"
                      className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary"
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-6 border-l border-slate-200 pl-10">
              {/* Search Icon Desktop */}
              <div className="relative" ref={searchContainerRef}>
                  <motion.form 
                    onSubmit={handleSearchSubmit}
                    initial={false}
                    animate={isSearchOpen ? "open" : "closed"}
                    className="flex items-center"
                  >
                    <motion.div
                      variants={{
                        closed: { width: 0, opacity: 0, marginRight: 0 },
                        open: { width: 220, opacity: 1, marginRight: 12 }
                      }}
                      className="overflow-hidden"
                    >
                      <input 
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search anything..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 px-4 text-[10px] font-bold tracking-widest text-slate-900 focus:outline-none focus:border-primary transition-all shadow-inner"
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
                      className="p-2 text-slate-700 hover:text-primary transition-colors hover:scale-110 active:scale-95"
                    >
                      <SearchIcon className="w-5 h-5" />
                    </button>
                  </motion.form>
              </div>

              {user && (
                <Link to="/orders" className="p-2 text-slate-700 hover:text-primary transition-colors hover:scale-110" title="My Orders">
                  <Package className="w-5 h-5" />
                </Link>
              )}
              
              <Link to="/cart" className="relative p-2 text-slate-700 hover:text-primary transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="flex items-center gap-3 group max-w-[220px] bg-white border border-slate-100 hover:border-primary/50 hover:bg-slate-50 py-1.5 pl-4 pr-1.5 rounded-full shadow-sm transition-all">
                    <div className="flex flex-col text-right overflow-hidden">
                      <span className="text-[11px] font-black text-slate-900 group-hover:text-primary transition-colors truncate">
                        {userData?.fullName || userData?.name || user.user_metadata?.full_name || user.user_metadata?.name || 'My Profile'}
                      </span>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-primary/20 overflow-hidden shadow-inner group-hover:border-primary transition-all flex items-center justify-center">
                      <img 
                        src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                        alt="" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  </Link>
                  <button onClick={() => setIsLogoutModalOpen(true)} className="p-2 text-slate-400 hover:text-red-500 transition-all" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/auth"
                    className="px-6 py-2.5 bg-slate-900 text-white text-[10px] uppercase tracking-widest font-black rounded-full hover:bg-primary hover:text-black transition-all shadow-lg hover:shadow-primary/20"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Bar: Search + Cart (Right) */}
          <div className="lg:hidden flex-1 flex items-center justify-end gap-1">
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="p-2 text-slate-700 hover:text-primary transition-all active:scale-110"
            >
              <SearchIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <Link to="/cart" className="relative p-2 text-slate-700 hover:text-primary transition-all hover:scale-110">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Input Expansion - FULL WIDTH & THEME SYNCED */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            className="lg:hidden overflow-hidden border-b border-slate-100 bg-white w-full z-40"
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full bg-primary/20">
              <div className="flex-1 flex items-center gap-3 px-4 h-14 md:h-16">
                <SearchIcon className="w-5 h-5 text-slate-600 flex-shrink-0" />
                <input 
                  ref={searchInputRef}
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Shadi Mehal..."
                  className="flex-1 bg-transparent border-none text-[15px] font-bold text-slate-900 focus:ring-0 placeholder:text-slate-400 outline-none w-full"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <button 
                type="submit" 
                className="h-14 md:h-16 px-6 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] active:bg-black transition-colors"
              >
                Go
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-border overflow-hidden"
          >
            <div className="px-6 md:px-10 pt-4 pb-10 space-y-3 max-h-[85vh] overflow-y-auto">
              {/* Mobile View Search (Optional, since we have top bar) - but let's keep it consistent */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {NAV_LINKS.map(link => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-center h-12 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                      isActive(link.path) 
                        ? "bg-primary text-black border-primary shadow-md shadow-primary/10" 
                        : "bg-white text-slate-900 border-slate-100"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              
              <div className="pt-2 flex flex-col space-y-2">
                <Link to="/cart" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl text-slate-900 font-black uppercase tracking-widest text-[9px]">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <span>Your Basket</span>
                  </div>
                  <span className="bg-primary text-black px-2 py-0.5 rounded-full text-[9px]">{cartCount}</span>
                </Link>

                {user && (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl text-slate-900 font-black uppercase tracking-widest text-[9px] gap-1">
                      <User className="w-4 h-4 text-primary" />
                      <span>Profile</span>
                    </Link>
                    <Link to="/orders" onClick={() => setIsOpen(false)} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl text-slate-900 font-black uppercase tracking-widest text-[9px] gap-1">
                      <Package className="w-4 h-4 text-primary" />
                      <span>Orders</span>
                    </Link>
                  </div>
                )}
                
                {user && userData?.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl text-slate-900 font-black uppercase tracking-widest text-[9px] border border-primary/20">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span>Admin Control Center</span>
                  </Link>
                )}

                {user ? (
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full bg-red-50 text-red-500 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 border border-red-100 mt-2 active:scale-95 transition-transform"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                ) : (
                  <Link 
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-center active:scale-95 transition-transform"
                  >
                    Sign In / Join Now
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          await logout();
          navigate('/auth');
        }}
      />
    </nav>
  );
});
