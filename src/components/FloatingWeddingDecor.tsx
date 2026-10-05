import React from 'react';
import { motion } from 'motion/react';
import { Heart, Bell, Star, Sparkles, Gift, Camera, Music, Cake } from 'lucide-react';
import { cn } from '../lib/utils';

interface FloatingWeddingDecorProps {
  className?: string;
}

const icons = [
  { Icon: Heart, size: 24, color: 'text-primary/20' },
  { Icon: Bell, size: 20, color: 'text-primary/10' },
  { Icon: Star, size: 16, color: 'text-primary/10' },
  { Icon: Sparkles, size: 22, color: 'text-primary/15' },
  { Icon: Gift, size: 18, color: 'text-primary/10' },
  { Icon: Camera, size: 24, color: 'text-primary/10' },
  { Icon: Music, size: 20, color: 'text-primary/10' },
  { Icon: Cake, size: 22, color: 'text-primary/10' },
];

export const FloatingWeddingDecor: React.FC<FloatingWeddingDecorProps> = ({ className }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {[...Array(12)].map((_, i) => {
        const item = icons[i % icons.length];
        return (
          <motion.div
            key={i}
            className={cn("absolute", item.color)}
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`,
              opacity: 0,
              scale: 0.5
            }}
            animate={{ 
              x: [
                `${Math.random() * 100}%`, 
                `${Math.random() * 100}%`, 
                `${Math.random() * 100}%`
              ],
              y: [
                `${Math.random() * 100}%`, 
                `${Math.random() * 100}%`, 
                `${Math.random() * 100}%`
              ],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 180, 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{ 
              duration: 15 + Math.random() * 20, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <item.Icon size={item.size + Math.random() * 10} />
          </motion.div>
        );
      })}
    </div>
  );
};
