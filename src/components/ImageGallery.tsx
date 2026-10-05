import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface ImageGalleryProps {
  mainImage: string;
  gallery?: string[];
  title: string;
}

export default function ImageGallery({ mainImage, gallery = [], title }: ImageGalleryProps) {
  const allImages = [mainImage, ...gallery].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const containerRef = useRef<HTMLDivElement>(null);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allImages.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  if (allImages.length === 0) return null;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="space-y-6">
      {/* Main Preview Container */}
      <div 
        ref={containerRef}
        className="relative aspect-square md:aspect-[4/5] bg-slate-900 rounded-[20px] md:rounded-[40px] overflow-hidden border border-slate-100 shadow-inner group cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseLeave={() => setIsZoomed(false)}
        tabIndex={0}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeIndex}
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
            <motion.img
              src={allImages[activeIndex]}
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                scale: isZoomed ? 2.5 : 1
              }}
              transition={{ scale: { duration: 0.3, ease: "easeOut" } }}
              className="w-full h-full object-cover"
              alt={title}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-6 pointer-events-none z-10">
                <button 
                    onClick={prevImage}
                    className="w-8 h-8 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white pointer-events-auto"
                >
                    <ChevronLeft size={16} className="md:w-6 md:h-6" />
                </button>
                <button 
                    onClick={nextImage}
                    className="w-8 h-8 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white pointer-events-auto"
                >
                    <ChevronRight size={16} className="md:w-6 md:h-6" />
                </button>
            </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex flex-wrap gap-4">
          {allImages.map((src, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > activeIndex ? 1 : -1);
                setActiveIndex(idx);
              }}
              className={cn(
                "relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all",
                activeIndex === idx 
                    ? "border-primary ring-2 ring-primary/20 scale-105 shadow-lg" 
                    : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={src} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
