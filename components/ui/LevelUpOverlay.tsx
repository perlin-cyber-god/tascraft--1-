import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpOverlayProps {
  show: boolean;
  level: number;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ show, level }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          {/* Background Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-white"
          />

          {/* Text Container */}
          <div className="relative flex flex-col items-center">
             <motion.h1
                initial={{ scale: 0.5, y: 50, opacity: 0 }}
                animate={{ scale: 1.5, y: -50, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="text-[#ffff00] font-pixel text-6xl md:text-8xl tracking-widest text-shadow-lg drop-shadow-[0_4px_0_rgba(0,0,0,1)] uppercase"
             >
                Level Up!
             </motion.h1>
             
             {/* Subtext */}
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-4 text-[#80ff20] font-pixel text-4xl text-shadow-lg"
             >
                Level {level}
             </motion.div>
          </div>

          {/* XP Orbs Explosion */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-[#80ff20] border-2 border-[#1a4d00] rounded-full shadow-[0_0_10px_#80ff20]"
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0 
              }}
              animate={{ 
                x: (Math.random() - 0.5) * window.innerWidth * 0.8,
                y: (Math.random() - 0.5) * window.innerHeight * 0.8,
                scale: [0, 1.5, 0],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 2 + Math.random(), 
                ease: "circOut" 
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};