import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService, Service, Review } from '../lib/adminService';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useBundle } from '../context/BundleContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useWhatsAppOrder } from '../hooks/useWhatsAppOrder';
import { WhatsAppDetailsModal } from '../components/WhatsAppDetailsModal';
import ReviewSection from '../components/ReviewSection';
import ServiceBookingModal from '../components/ServiceBookingModal';
import { 
  ArrowLeft, 
  MessageCircle, 
  Star, 
  ShieldCheck, 
  Clock,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Calendar,
  Camera,
  Music,
  Users,
  ShoppingCart,
  Gift
} from 'lucide-react';
import ImageGallery from '../components/ImageGallery';
import { cn } from '../lib/utils';
import { FloatingWeddingDecor } from '../components/FloatingWeddingDecor';
import CardHoverGallery from '../components/CardHoverGallery';
import { Eye } from 'lucide-react';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { addToBundle, serviceBundleItems, removeFromBundle } = useBundle();
  const { initiateWhatsAppOrder, isModalOpen, setIsModalOpen, handleConfirmDetails } = useWhatsAppOrder();
  const { services } = useData();

  const [service, setService] = useState<Service | null>(() => {
    if (!id || !services) return null;
    return services.find(s => s.id === id) || null;
  });
  const isInBundle = serviceBundleItems.some(i => i.item.id === service?.id);

  const handleWhatsAppOrder = () => {
    if (!service) return;
    initiateWhatsAppOrder([{
      title: service.title,
      price: service.price,
      quantity: 1,
      type: 'service',
      description: service.description
    }]);
  };

  const handleAddToBundle = () => {
    if (service) {
      if (isInBundle) {
        removeFromBundle(service.id!, 'service');
      } else {
        addToBundle(service, 'service');
      }
    }
  };
  const [relatedServices, setRelatedServices] = useState<Service[]>(() => {
    if (!service || !services) return [];
    return services.filter(s => s.category === service.category && s.id !== service.id && s.status === 'active').slice(0, 4);
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(() => !service);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    if (id) fetchServiceData(id);
  }, [id, services]);

  const fetchServiceData = async (serviceId: string) => {
    const cachedService = services?.find(s => s.id === serviceId);
    if (!cachedService) {
      setLoading(true);
    }
    try {
      const data = await adminService.getServiceById(serviceId);
      setService(data);
      
      const allServices = services || await adminService.getServices();
      setRelatedServices(allServices.filter(s => s.category === data.category && s.id !== data.id && s.status === 'active').slice(0, 4));
      
      const reviewsData = await adminService.getApprovedReviews(serviceId);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching service details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!service || service.status === 'inactive') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 px-6">
        <h2 className="text-3xl font-semibold text-slate-900 mb-4 text-center">Service Currently Unavailable</h2>
        <Link to="/marketplace" className="text-primary font-black uppercase tracking-widest text-[10px] underline underline-offset-8">Go Back</Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="pt-20 md:pt-32 pb-12 md:pb-20 bg-bg-dark relative overflow-hidden">
      <FloatingWeddingDecor className="opacity-10" />
      <WhatsAppDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDetails}
      />
      <div className="px-4 md:px-20 max-w-7xl mx-auto relative z-10">
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-1 md:mb-12 uppercase tracking-widest text-[8px] md:text-[10px] font-black">
          <ArrowLeft size={14} className="md:w-4 md:h-4" />
          Back to Marketplace
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-24 mb-12 md:mb-32 items-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="lg:col-span-7 relative overflow-hidden rounded-[20px] md:rounded-none"
            >
                <ImageGallery 
                  mainImage={service.img} 
                  gallery={service.gallery} 
                  title={service.title} 
                />
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="lg:col-span-5"
            >
                <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                  <div className="flex -space-x-2 items-center">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 md:w-10 md:h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 10}`} 
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

                <h1 className="text-2xl md:text-6xl lg:text-[5.5rem] font-semibold text-slate-900 leading-tight md:leading-[0.95] mb-4 md:mb-10">
                  {service.title}
                </h1>
                
                <div className="flex flex-col mb-4 md:mb-12">
                    <div className="flex flex-col">
                      {service.compare_price && service.compare_price > service.price && (
  <p className="text-slate-400 text-[8px] md:text-xs font-black uppercase tracking-widest line-through mb-0.5 opacity-50">
    Rs. {service.compare_price.toLocaleString()}
  </p>
)}
                        <p className="text-xl md:text-4xl font-black text-primary font-sans tracking-tight leading-none">Starting at Rs. {service.price.toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
                  <div className="flex items-center gap-1 h-5 md:h-6 px-2 md:px-3 bg-slate-50 rounded-full border border-slate-100">
                    <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-primary text-primary" />
                    <span className="text-[8px] md:text-[10px] font-black text-slate-900">{averageRating.toFixed(1)}</span>
                  </div>
                  <span className="px-2 md:px-3 py-0.5 md:py-1 bg-slate-900 text-white text-[7px] md:text-[9px] font-black uppercase tracking-widest rounded-full leading-none">
                    {service.vendor || "Hamza Decoration"}
                  </span>
                </div>

                <p className="text-slate-500 text-xs md:text-lg leading-relaxed mb-6 md:mb-12 border-l-3 md:border-l-4 border-primary/20 pl-3 md:pl-6">
                    {service.description}
                </p>

                <div className="grid grid-cols-2 gap-2 md:gap-4 mb-6 md:mb-12">
                   <div className="p-3 md:p-5 bg-white rounded-xl md:rounded-3xl border border-slate-100 flex items-start gap-2 md:gap-3">
                      <Clock className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary mt-1" />
                      <div>
                        <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none mb-0.5">Duration</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">Session</p>
                      </div>
                   </div>
                   <div className="p-3 md:p-5 bg-white rounded-xl md:rounded-3xl border border-slate-100 flex items-start gap-2 md:gap-3">
                      <ShieldCheck className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary mt-1" />
                      <div>
                        <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none mb-0.5">Includes</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none">Full Setup</p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-2 md:gap-4 mb-4">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleWhatsAppOrder}
                        className="w-full py-3.5 md:py-6 bg-green-500 text-white rounded-full font-black uppercase tracking-[0.2em] text-[8px] md:text-[11px] flex items-center justify-center gap-2 md:gap-4 shadow-2xl shadow-green-500/10 hover:bg-green-600 transition-all"
                    >
                        <MessageCircle size={14} className="md:w-[18px] md:h-[18px]" />
                        Order on WhatsApp
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToBundle}
                        className={cn(
                          "w-full py-3.5 md:py-6 rounded-full font-black uppercase tracking-[0.2em] text-[8px] md:text-[11px] flex items-center justify-center gap-2 md:gap-4 transition-all",
                          isInBundle ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white hover:bg-primary hover:text-black"
                        )}
                    >
                        <ShoppingCart size={14} className="md:w-[18px] md:h-[18px]" />
                        {isInBundle ? 'Already in Bundle' : 'Add to Bundle'}
                    </motion.button>
                </div>
                
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] text-center">
                  * Services are exclusively handled via direct consultation
                </p>
            </motion.div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-20 md:mb-32 items-center">
            {[
                { icon: Users, title: "Expert Crew", sub: "Professional" },
                { icon: Camera, title: "Media", sub: "Live Coverage" },
                { icon: Calendar, title: "Flexible", sub: "Custom Scheduling" },
                { icon: ShieldCheck, title: "Secure", sub: "Fully Insured" },
                { icon: Sparkles, title: "Royal", sub: "Premium Finish" },
                { icon: Clock, title: "24/7", sub: "Priority Support" }
            ].map((item, i) => (
                <div key={i} className="p-4 md:p-6 bg-white rounded-2xl md:rounded-[30px] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                    <item.icon className="text-primary mb-3 md:mb-4 w-5 h-5 md:w-6 md:h-6" />
                    <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-[7px] md:text-[8px] text-slate-400 font-black uppercase tracking-widest leading-relaxed whitespace-nowrap">{item.sub}</p>
                </div>
            ))}
        </div>

        {/* Detailed Features */}
        <section className="mb-20 md:mb-32">
            <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 mb-8 md:mb-16">What You Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-white p-8 md:p-12 rounded-[30px] md:rounded-[50px] border border-slate-100 shadow-2xl">
                <div>
                    <h4 className="text-[10px] md:text-xl font-black uppercase tracking-widest text-slate-300 mb-6 md:mb-8">Service Features</h4>
                    <div className="space-y-4 md:space-y-6">
                        {service.features?.length ? service.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <CheckCircle2 className="text-primary w-6 h-6 flex-shrink-0" />
                                <span className="text-slate-600 font-medium">{f}</span>
                            </div>
                        )) : (
                            ['Professional Coordination', 'Setup & Decor', 'Support Staff'].map((f, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <CheckCircle2 className="text-primary w-6 h-6 flex-shrink-0" />
                                    <span className="text-slate-600 font-medium">{f}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="bg-bg-alt rounded-[40px] p-10">
                    <h4 className="text-xl font-black uppercase tracking-widest text-slate-300 mb-8">Customer Rating</h4>
                    <div className="flex gap-1 text-primary mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'fill-current' : ''}`} />
                        ))}
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">{averageRating.toFixed(1)} / 5.0 Rating</p>
                </div>
            </div>
        </section>

        {/* Global Feedback Section */}
        <ReviewSection itemId={service.id} itemType="service" />

        {/* Related Services */}
        {relatedServices.length > 0 && (
            <section className="pb-20">
                <div className="flex items-center justify-between mb-10 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-semibold text-slate-900">Related Services</h2>
                    <Link to="/marketplace" className="text-slate-400 hover:text-primary transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group">
                        See All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {relatedServices.map((s, idx) => (
                        <motion.div 
                            key={s.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group flex flex-col"
                        >
                            <div className="aspect-square bg-slate-50 rounded-[30px] md:rounded-[40px] overflow-hidden mb-4 md:mb-6 border border-slate-100 shadow-sm relative group/img">
                                <CardHoverGallery 
                                  mainImage={s.img} 
                                  gallery={s.gallery} 
                                  alt={s.title} 
                                />
                                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/service/${s.id}`);
                                    }}
                                    className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-slate-900 font-black uppercase tracking-widest text-[7px] transform translate-y-4 group-hover/img:translate-y-0 transition-all duration-500 shadow-2xl hover:bg-black hover:text-white group/btn"
                                  >
                                    <Eye size={10} className="text-black group-hover/btn:text-white transition-colors" />
                                    Quick View
                                  </button>
                                </div>
                            </div>
                            <h4 className="text-lg md:text-xl font-semibold text-slate-900 group-hover:text-primary transition-colors mb-2 cursor-pointer" onClick={() => navigate(`/service/${s.id}`)}>{s.title}</h4>
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.category}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        )}

        <ServiceBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          service={service}
          userData={userData}
        />
      </div>
    </div>
  );
}
