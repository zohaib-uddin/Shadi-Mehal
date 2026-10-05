import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, MessageCircle, Star, ArrowLeft, ShieldCheck, Truck, Clock, Loader2, Users, Camera, Calendar, Sparkles, CheckCircle2, ShoppingCart, Zap, ShoppingBag } from 'lucide-react';
import { adminService, Deal, DealReview } from '../lib/adminService';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { useWhatsAppOrder } from '../hooks/useWhatsAppOrder';
import ImageGallery from '../components/ImageGallery';
import { WhatsAppDetailsModal } from '../components/WhatsAppDetailsModal';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { addToCart } = useCart();
  const { initiateWhatsAppOrder, isModalOpen, setIsModalOpen, handleConfirmDetails } = useWhatsAppOrder();
  const { deals } = useData();

  const [deal, setDeal] = useState<Deal | null>(() => {
    if (!id || !deals) return null;
    return deals.find(d => d.id === id) || null;
  });
  const [reviews, setReviews] = useState<DealReview[]>([]);
  const [loading, setLoading] = useState(() => !deal);

  useEffect(() => {
    if (id) loadDealData();
  }, [id, deals]);

  const loadDealData = async () => {
    const cachedDeal = deals?.find(d => d.id === id);
    if (!cachedDeal) {
      setLoading(true);
    }
    try {
      const allDeals = deals || await adminService.getDeals();
      const found = allDeals.find(d => d.id === id);
      
      if (found) {
        setDeal(found);
        const r = await adminService.getDealReviews(id!);
        setReviews(r);
      }
    } catch (e) {
      console.error("Failed to load deal details", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (deal) {
      addToCart(deal, 'deal');
    }
  };

  const handleBuyNow = () => {
    if (deal) {
      navigate('/checkout', { state: { items: [{ item: deal, quantity: 1, type: 'deal' }] } });
    }
  };

  const handleWhatsAppOrder = () => {
    if (!deal) return;
    initiateWhatsAppOrder([{
      title: deal.title,
      price: deal.price,
      quantity: 1,
      type: 'deal',
      description: deal.description
    }]);
  };

  if (loading) {
    return (
      <div className="pt-40 pb-20 flex justify-center items-center min-h-screen bg-bg-dark">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!deal || deal.status === 'inactive') {
    return (
      <div className="pt-20 pb-20 px-6 text-center min-h-screen bg-bg-dark flex flex-col items-center justify-center">
        <h2 className="text-2xl md:text-4xl font-semibold text-slate-900 mb-6">Deal Currently Unavailable</h2>
        <Link to="/deals" className="text-primary font-black uppercase tracking-widest text-[8px] md:text-[10px] underline underline-offset-8">Go Back</Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 5.0;

  return (
    <div className="pt-20 md:pt-32 pb-12 md:pb-20 px-4 md:px-20 max-w-7xl mx-auto relative overflow-hidden bg-white">
      <FloatingWeddingDecor className="opacity-10" />
      <WhatsAppDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDetails}
      />
      <div className="relative z-10">
        <Link to="/deals" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-1 md:mb-12 uppercase tracking-widest text-[8px] md:text-[10px] font-black">
          <ArrowLeft size={14} className="md:w-4 md:h-4" /> Back to Deals
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-24 mb-12 md:mb-32">
          {/* Images */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden rounded-[20px] md:rounded-none"
          >
            <ImageGallery 
              mainImage={deal.img || "https://images.unsplash.com/photo-1549465220-1d8c9d9c67fe?w=800"} 
              gallery={deal.gallery} 
              title={deal.title} 
            />
          </motion.div>

          {/* Info */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                <div className="flex -space-x-2 items-center">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 md:w-10 md:h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 50}`} 
                        alt="Client" 
                        className="w-full h-full object-cover bg-slate-50"
                    />
                    </div>
                ))}
                </div>
                <div className="text-slate-400 text-[6px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] leading-none">
                Trusted by 200+ Clients
                </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-6">
              <span className="px-2 md:px-4 py-0.5 md:py-1 bg-primary/10 text-primary text-[7px] md:text-[10px] font-black uppercase tracking-widest rounded-full leading-none">
                Best Deal
              </span>
              <span className="flex items-center gap-1.5 text-green-500 text-[7px] md:text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 size={10} className="md:w-[12px] md:h-[12px]" />
                Exclusive Package
              </span>
            </div>

            <h1 className="text-2xl md:text-5xl lg:text-7xl font-semibold text-slate-900 leading-tight mb-4 md:mb-6">{deal.title}</h1>
            
            <div className="flex items-baseline gap-3 md:gap-4 mb-4 md:mb-6">
                <span className="text-2xl md:text-6xl font-semibold text-slate-900">Rs. {deal.price?.toLocaleString()}</span>
                {deal.compare_price && deal.compare_price > deal.price && (
  <span className="text-xs md:text-2xl font-semibold text-slate-300 line-through decoration-primary decoration-4">
    Rs. {deal.compare_price.toLocaleString()}
  </span>
)}
            </div>

            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
              <div className="flex items-center gap-1 h-5 md:h-6 px-2 md:px-3 bg-slate-50 rounded-full border border-slate-100">
                <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-primary text-primary" />
                <span className="text-[8px] md:text-[10px] font-black text-slate-900">{averageRating.toFixed(1)}</span>
              </div>
              <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-900 text-white text-[7px] md:text-[9px] font-black uppercase tracking-widest rounded-full leading-none">
                {deal.vendor || "Hamza Decoration"}
              </span>
            </div>

            <div className="space-y-4 md:space-y-8 mb-6 md:mb-10">
              <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-lg border-l-3 md:border-l-4 border-primary pl-4 md:pl-6">{deal.description}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 md:gap-4">
                <div className="p-3 md:p-4 rounded-xl md:rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-2 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                    <ShieldCheck size={14} className="md:w-[20px] md:h-[20px]" />
                  </div>
                  <div>
                    <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">Quality</p>
                    <p className="text-[8px] md:text-[12px] font-bold text-slate-900 leading-none">Premium</p>
                  </div>
                </div>
                <div className="p-3 md:p-4 rounded-xl md:rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-2 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                    <Clock size={14} className="md:w-[20px] md:h-[20px]" />
                  </div>
                  <div>
                    <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">Reliability</p>
                    <p className="text-[8px] md:text-[12px] font-bold text-slate-900 leading-none">Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:gap-4 mt-auto">
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="py-3 md:py-6 bg-primary text-black rounded-full font-black uppercase tracking-widest text-[8px] md:text-xs flex items-center justify-center gap-1.5 md:gap-3 shadow-xl shadow-primary/10 hover:bg-slate-900 hover:text-white transition-all underline decoration-slate-900/10"
                >
                  <Zap size={14} className="md:w-[18px] md:h-[18px]" />
                  Buy Now
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="py-3 md:py-6 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-[8px] md:text-xs flex items-center justify-center gap-1.5 md:gap-3 shadow-xl shadow-slate-900/10 hover:bg-primary hover:text-black transition-all"
                >
                  <ShoppingCart size={14} className="md:w-[18px] md:h-[18px]" />
                  Add to Cart
                </motion.button>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsAppOrder}
                className="w-full py-4 md:py-6 bg-green-500 text-white rounded-full font-black uppercase tracking-widest text-[8px] md:text-xs flex items-center justify-center gap-1.5 md:gap-3 transition-all shadow-lg hover:bg-green-600 group"
              >
                <MessageCircle size={16} className="md:w-[20px] md:h-[20px] group-hover:animate-bounce" /> Order on WhatsApp
              </motion.button>
              
              <div className="flex items-center justify-center gap-8 mt-6 border-t border-slate-50 pt-6">
                 <div className="flex items-center gap-2">
                    <Truck size={16} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Secure Delivery</span>
                 </div>
                 <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                 <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Best Rates</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-32 mb-32 items-center">
            {[
                { icon: Users, title: "Expert Crew", sub: "Professional Management" },
                { icon: Camera, title: "Media Support", sub: "Live Coverage Ready" },
                { icon: Calendar, title: "Flexible Slots", sub: "Custom Scheduling" },
                { icon: ShieldCheck, title: "Secure", sub: "Fully Insured" },
                { icon: Sparkles, title: "Royal", sub: "Premium Finish" },
                { icon: Clock, title: "24/7", sub: "Priority Support" }
            ].map((item, i) => (
                <div key={i} className="p-6 bg-white rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <item.icon className="text-primary mb-4 w-6 h-6" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-relaxed whitespace-nowrap">{item.sub}</p>
                </div>
            ))}
        </div>

        {/* Reviews Section */}
        <div className="mt-32">
           <div className="flex items-center justify-between mb-16 border-b border-slate-100 pb-8">
              <h3 className="text-4xl font-semibold text-slate-900">Reviews</h3>
              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 leading-none">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'}/5.0</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Satisfaction Rate</p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {reviews.map((r, i) => (
                <motion.div 
                  key={r.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-10 rounded-[40px] border border-slate-50 shadow-xl shadow-slate-100/50"
                >
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 p-1">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.user_name}`} alt={r.user_name} />
                     </div>
                     <div>
                        <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">{r.user_name}</h5>
                        <div className="flex gap-0.5 mt-1">
                           {[1,2,3,4,5].map(star => (
                             <Star key={star} size={8} className={cn("fill-primary text-primary", star > r.rating && "fill-slate-100 text-slate-100")} />
                           ))}
                        </div>
                     </div>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">"{r.comment}"</p>
                </motion.div>
              ))}
              {reviews.length === 0 && (
                <div className="col-span-full py-20 text-center">
                   <p className="text-slate-400 font-medium">No reviews yet for this deal.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
