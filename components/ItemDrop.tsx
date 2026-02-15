import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem } from 'lucide-react';

interface ItemDropProps {
  startX: number;
  dropY: number;
  targetRef: React.RefObject<HTMLDivElement>;
  onComplete: () => void;
  color?: string;
}

export const ItemDrop: React.FC<ItemDropProps> = ({ startX, dropY, targetRef, onComplete, color = '#50c878' }) => {
  const [targetPos, setTargetPos] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    // Calculate target position (center of the completed card)
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setTargetPos({
        x: rect.left + rect.width / 2 - 24, // Center - half icon width
        y: rect.top + rect.height / 2 - 24
      });
    }
  }, [targetRef]);

  if (!targetPos) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: startX - 24, y: -60, rotate: 0, scale: 0.5, opacity: 0 }}
        animate={{
          // Keyframes: 
          // 1. Start at sky (initial)
          // 2. Fall to click position (dropY)
          // 3. Hover/Bounce slightly
          // 4. Fly to target (targetPos)
          x: [startX - 24, startX - 24, startX - 24, targetPos.x],
          y: [-60, dropY - 40, dropY - 50, targetPos.y], // Offset Y slightly so it's visible above cursor
          rotate: [0, 180, 200, 720],
          scale: [1, 1.2, 1.2, 0.5],
          opacity: [1, 1, 1, 0]
        }}
        transition={{
          duration: 1.2,
          times: [0, 0.4, 0.5, 1], // Timing percentage
          ease: "easeInOut"
        }}
        onAnimationComplete={onComplete}
        className="fixed z-[100] pointer-events-none"
        style={{ filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.5))' }}
      >
         {/* Using a Lucide Gem to represent the item */}
         <div className="relative">
             <Gem 
                className="w-12 h-12" 
                style={{ color: color, fill: `${color}40` }} 
                strokeWidth={2.5}
             />
             {/* Sparkle effect wrapper */}
             <motion.div 
                animate={{ rotate: -180, scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 border-2 border-white/30 rounded-full opacity-50"
             />
         </div>
      </motion.div>
    </AnimatePresence>
  );
};
