import React from 'react';
import { motion } from 'motion/react';

export default function TopLoadingBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-slate-100">
      <motion.div
        className="h-full bg-primary rounded-r-full"
        style={{ width: '40%', position: 'absolute' }}
        initial={{ left: '-50%' }}
        animate={{ left: '110%' }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
}
