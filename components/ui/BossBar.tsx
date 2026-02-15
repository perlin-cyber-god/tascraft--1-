import React from 'react';
import { motion } from 'framer-motion';

interface BossBarProps {
  label: string;
  current: number;
  max: number;
}

export const BossBar: React.FC<BossBarProps> = ({ label, current, max }) => {
  if (max === 0) return null;

  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="w-full max-w-3xl mx-auto mb-2 relative font-pixel group">
      {/* Label */}
      <div className="text-center text-white text-shadow-lg mb-1 tracking-widest uppercase text-lg">
        {label}
      </div>

      {/* Bar Container */}
      <div className="h-4 w-full bg-[#3d003d] border-2 border-black relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000,#000_10px,transparent_10px,transparent_20px)] pointer-events-none z-10"></div>
        
        {/* Health Fill */}
        <motion.div
          className="h-full bg-[#b400b4] relative"
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Lighter top highlight for 3D effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#ff00ff] opacity-50"></div>
          {/* Darker bottom shade */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2a002a] opacity-50"></div>
        </motion.div>

        {/* Notches */}
        <div className="absolute inset-0 flex justify-evenly pointer-events-none z-20">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-full bg-black/50"></div>
             ))}
        </div>
      </div>
    </div>
  );
};