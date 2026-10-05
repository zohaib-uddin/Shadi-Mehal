import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, ExternalLink, Plus, Package, Gift, MessageCircle, Users, Eye, Sparkles } from 'lucide-react';
import { Service } from '../lib/adminService';
import { useBundle } from '../context/BundleContext';
import { cn } from '../lib/utils';
import { useWhatsAppOrder } from '../hooks/useWhatsAppOrder';
import { WhatsAppDetailsModal } from './WhatsAppDetailsModal';
import CardHoverGallery from './CardHoverGallery';

import { Link, useNavigate } from 'react-router-dom';

export const ServiceCard = React.memo(({ service }: { service: Service }) => {
  const { addToBundle, serviceBundleItems, removeFromBundle } = useBundle();
  const navigate = useNavigate();
  const isInBundle = serviceBundleItems.some(i => i.item.id === service.id);
  const { initiateWhatsAppOrder, isModalOpen, setIsModalOpen, handleConfirmDetails } = useWhatsAppOrder();

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    initiateWhatsAppOrder([{
      title: service.title,
      price: service.price,
      quantity: 1,
      type: 'service',
      description: service.description
    }]);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group bg-white border border-slate-100 rounded-[20px] md:rounded-[30px] p-2 md:p-3 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col h-full"
    >
      <WhatsAppDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDetails}
      />
      <div 
        className="relative aspect-[3/4] md:aspect-[3/4.5] overflow-hidden rounded-[15px] md:rounded-[25px] bg-slate-50 mb-2 md:mb-3 group/img"
      >
        <CardHoverGallery 
          mainImage={service.img} 
          gallery={service.gallery} 
          alt={service.title} 
        />
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/service/${service.id}`);
              }}
              className="pointer-events-auto flex items-center gap-1 md:gap-1.5 bg-white/95 backdrop-blur-md px-1.5 md:px-2.5 py-1 md:py-1.5 rounded-full text-slate-900 font-black uppercase tracking-widest text-[5px] md:text-[8px] transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-2xl hover:bg-black hover:text-white group/btn"
            >
                <Eye size={6} className="md:w-2 text-black group-hover/btn:text-white transition-colors" />
                Quick View
            </button>
        </div>
        {service.category && (
          <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-white/90 backdrop-blur-md text-[5px] md:text-[7px] text-slate-900 font-black uppercase tracking-[0.2em] px-1.5 md:px-2 py-0.5 md:py-1 rounded-full shadow-sm border border-slate-100">
            {service.category}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col px-1">
          <h3 className="text-[12px] md:text-lg font-semibold text-slate-900 mb-0.5 md:mb-1 truncate cursor-pointer">
            <Link to={`/service/${service.id}`}>{service.title}</Link>
          </h3>
          
          <div className="flex items-center justify-between mb-2 md:mb-3">
             <div className="flex flex-col">
                {service.compare_price && service.compare_price > service.price && (
                  <span className="text-[6px] md:text-[11px] text-slate-300 line-through font-black">Rs. {service.compare_price.toLocaleString()}</span>
                )}
                <span className="text-[5px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none"></span>
             </div>
             <div className="flex flex-col items-end">
                <p className="text-primary font-black text-[11px] md:text-lg leading-none">Rs. {service.price.toLocaleString()}</p>
                <span className="text-[5px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none"></span>
             </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2 mb-2 bg-slate-50 py-1 px-2 rounded-full w-fit">
            <Users className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 text-slate-400" />
            <span className="text-[6px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[50px] md:max-w-[100px]">
              {service.vendor || 'Hamza Decor'}
            </span>
          </div>

          <p className="hidden md:block text-slate-400 text-[9px] md:text-[11px] font-medium leading-relaxed mb-4 md:mb-6 line-clamp-1 md:line-clamp-2">
            {service.description}
          </p>
        </div>

      <div className="flex flex-col gap-1.5 md:gap-3">
          <button 
            onClick={handleWhatsAppOrder}
            className="w-full py-2 md:py-4 bg-green-500 text-white text-[7px] md:text-[10px] uppercase tracking-widest font-black rounded-lg md:rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-1 md:gap-2 active:scale-95"
          >
            <MessageCircle size={10} className="md:w-[14px]" />
            Order on whatsapp
          </button>
          
          <button
              onClick={() => isInBundle ? removeFromBundle(service.id!, 'service') : addToBundle(service, 'service')}
              className={cn(
                "w-full py-2 md:py-4 rounded-full text-[7px] md:text-[10px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-1 md:gap-2 active:scale-95",
                isInBundle 
                  ? "bg-slate-100 text-slate-400" 
                  : "bg-bg-alt text-slate-600 hover:bg-emerald-500 hover:text-white"
              )}
            >
              <Gift size={10} className="md:w-[14px]" />
              {isInBundle ? 'In Bundle' : 'Add to Bundle'}
            </button>
      </div>
    </motion.div>
  );
});