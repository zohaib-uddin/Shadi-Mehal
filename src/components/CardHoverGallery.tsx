import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface CardHoverGalleryProps {
  mainImage: string;
  gallery?: string[];
  alt: string;
}

export default function CardHoverGallery({ mainImage, gallery = [], alt }: CardHoverGalleryProps) {
  const images = [mainImage, ...gallery].filter(Boolean);
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : direction > 0 ? '-100%' : 0,
      opacity: 0
    })
  };

  return (
    <div 
      className="relative w-full h-full group/card-gallery overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setDirection(0);
        setIndex(0);
      }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={images[index]}
            className="w-full h-full object-cover transition-all duration-1000 group-hover/img:scale-110 group-hover:scale-110"
            alt={alt}
          />
        </motion.div>
      </AnimatePresence>

      {/* Manual Navigation Arrows */}
      {images.length > 1 && isHovered && (
        <>
          <button 
            onClick={prevImage}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 md:w-6 md:h-6 bg-white/95 rounded-full flex items-center justify-center shadow-xl text-slate-900 transition-all hover:bg-white hover:scale-110 z-20"
            aria-label="Previous image"
          >
            <ChevronLeft size={10} className="md:w-3 md:h-3" />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 md:w-6 md:h-6 bg-white/95 rounded-full flex items-center justify-center shadow-xl text-slate-900 transition-all hover:bg-white hover:scale-110 z-20"
            aria-label="Next image"
          >
            <ChevronRight size={10} className="md:w-3 md:h-3" />
          </button>
        </>
      )}

      {/* Progress Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 px-4 opacity-0 group-hover/card-gallery:opacity-100 transition-opacity">
          {images.map((_, i) => (
            <div 
              key={i}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-all duration-300",
                index === i ? "bg-white scale-y-150" : "bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
