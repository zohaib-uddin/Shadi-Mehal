import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ options, value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative z-20", className)} ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 md:gap-3 bg-white px-3 md:px-6 py-2 md:py-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-100 md:min-w-[180px] min-w-0 justify-between group hover:border-primary transition-colors"
      >
        <div className="flex items-center gap-1.5 md:gap-3">
          <Filter size={12} className="text-primary md:w-[14px] md:h-[14px]" />
          <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 whitespace-nowrap">
            {selectedOption.label}
          </span>
        </div>
        <ChevronDown 
          size={12} 
          className={cn("text-slate-400 transition-transform duration-300 md:w-[14px] md:h-[14px]", isOpen && "rotate-180")} 
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl p-2 flex flex-col gap-1 overflow-hidden"
          >
            {options.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ x: 4, backgroundColor: "rgba(255, 210, 0, 0.05)" }}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left",
                  value === option.value ? "bg-primary/10 text-slate-900" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {option.label}
                </span>
                {value === option.value && (
                  <Check size={12} className="text-primary" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
