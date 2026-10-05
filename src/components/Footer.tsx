import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Instagram, Facebook, Mail, MapPin, Phone, 
  Heart, Camera, Cake, Gift, Music, Bell, Star 
} from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

const FloatingIcons = () => {
  const icons = [
    { Icon: Heart, size: 24, color: 'text-primary/10' },
    { Icon: Camera, size: 30, color: 'text-slate-100' },
    { Icon: Bell, size: 20, color: 'text-primary/5' },
    { Icon: Star, size: 28, color: 'text-slate-200' },
    { Icon: Music, size: 24, color: 'text-primary/15' },
    { Icon: Cake, size: 32, color: 'text-slate-100' },
    { Icon: Gift, size: 26, color: 'text-primary/10' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {icons.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.color}`}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0 
          }}
          animate={{ 
            x: [
              (Math.random() * 100) + "%", 
              (Math.random() * 100) + "%", 
              (Math.random() * 100) + "%"
            ],
            y: [
              (Math.random() * 100) + "%", 
              (Math.random() * 100) + "%", 
              (Math.random() * 100) + "%"
            ],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 45, -45, 0]
          }}
          transition={{ 
            duration: 25 + Math.random() * 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <item.Icon size={item.size} />
        </motion.div>
      ))}
    </div>
  );
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white/80 backdrop-blur-xl pt-16 md:pt-24 pb-10 md:pb-12 px-6 md:px-10 border-t border-slate-100 overflow-hidden">
      {/* Animated Background Icons */}
      <FloatingIcons />

      {/* Large Decorative Branding - Centered */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none z-0 overflow-hidden p-4 md:p-10 mb-20 md:mb-30 text-center">
        <h2 className="text-[18vw] md:text-[12vw] lg:text-[250px] font-sans text-slate-900 leading-none uppercase font-semibold tracking-tighter">
          Shadi Mehal
        </h2>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20 mb-16 md:mb-24">
          {/* Logo & Vision */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link to="/" className="flex items-center group relative py-1 mb-8 md:mb-10 w-fit">
              <motion.div 
                className="flex flex-col relative"
                whileHover="hover"
                initial="initial"
              >
                <div className="flex items-baseline overflow-hidden">
                  <span className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 uppercase transition-colors duration-500 group-hover:text-primary">
                    Shadi
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-0.5">
                  <motion.div 
                    className="h-[2px] bg-primary origin-left"
                    variants={{
                      initial: { width: "12px" },
                      hover: { width: "100%" }
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="text-[8px] md:text-[11px] font-black tracking-[0.4em] text-slate-500 uppercase leading-none group-hover:text-slate-900 transition-colors duration-500 whitespace-nowrap">
                    Mehal
                  </span>
                </div>
              </motion.div>
            </Link>

            <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed max-w-sm mb-8 md:mb-12">
              Crafting timeless weddings in Attock. From artisanal stages to luxury products, we turn your wedding dreams into a perfect reality.
            </p>
            
            <div className="flex gap-3 md:gap-4">
              {[
                { Icon: Instagram, link: 'https://instagram.com/hamziiproduction' },
                { Icon: Facebook, link: 'https://facebook.com/share/19eaXE9rtK/' },
                { Icon: FaTiktok, link: 'https://tiktok.com/@hamziiproduction' }
              ].map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-black transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
                >
                  <item.Icon className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:pl-12">
            <div>
              <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-6 md:mb-8 underline decoration-primary/30 underline-offset-8 whitespace-nowrap">Explore Studio</p>
              <ul className="space-y-3 md:space-y-4">
                {[
                  { name: 'Products Shop', path: '/products' },
                  { name: 'Wedding Services', path: '/marketplace' },
                  { name: 'Photo Gallery', path: '/gallery' },
                  { name: 'Special Deals', path: '/deals' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-slate-500 hover:text-primary transition-colors font-bold text-xs md:text-sm tracking-tight flex items-center gap-2 group">
                      <span className="w-0 h-[1.5px] bg-primary group-hover:w-3 transition-all duration-300"></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-6 md:mb-8 underline decoration-primary/30 underline-offset-8 whitespace-nowrap">Company Care</p>
              <ul className="space-y-3 md:space-y-4">
                {[
                  { name: 'Contact Us', path: '/contact' },
                  { name: 'Refund Policy', path: '/refund-policy' },
                  { name: 'Terms of Service', path: '/terms' },
                  { name: 'Privacy Policy', path: '/privacy' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-slate-500 hover:text-primary transition-colors font-bold text-xs md:text-sm tracking-tight flex items-center gap-2 group">
                      <span className="w-0 h-[1.5px] bg-primary group-hover:w-3 transition-all duration-300"></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-6 md:mb-8 underline decoration-primary/30 underline-offset-8">The Headquarters</p>
              <ul className="space-y-4 md:space-y-6">
                <li className="flex items-start gap-3 md:gap-4 group">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0 mt-1">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-slate-600 font-bold text-xs md:text-sm leading-relaxed">Main Bazar, Attock City,<br />Punjab, Pakistan</span>
                </li>
                <li className="flex items-center gap-3 md:gap-4 group">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                    <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-slate-600 font-bold text-xs md:text-sm">+92 311 686 9582</span>
                </li>
                <li className="flex items-center gap-3 md:gap-4 group">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                    <Mail className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-slate-600 font-bold text-xs md:text-sm">decorewithhamzii@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 md:pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
          <p className="text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] leading-tight">
            &copy; {currentYear} Shadi Mehal. ALL RIGHTS RESERVED.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 md:gap-x-8 gap-y-2">
             <Link to="/refund-policy" className="text-slate-400 hover:text-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all">Refund Policy</Link>
             <Link to="/terms" className="text-slate-400 hover:text-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all">Terms of Condition</Link>
             <Link to="/privacy" className="text-slate-400 hover:text-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all">Privacy Policy</Link>
             <Link to="/contact" className="text-slate-400 hover:text-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
