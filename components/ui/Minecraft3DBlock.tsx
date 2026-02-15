import React from 'react';
import { motion } from 'framer-motion';

export type BlockType = 'grass' | 'dirt' | 'stone' | 'cobblestone' | 'furnace' | 'furnace_active' | 'tnt' | 'diamond_ore' | 'gold_block' | 'iron_block' | 'diamond_block' | 'crafting_table';

interface Minecraft3DBlockProps {
  type: BlockType;
  size?: number;
  className?: string;
  animate?: boolean;
}

export const Minecraft3DBlock: React.FC<Minecraft3DBlockProps> = ({ 
  type, 
  size = 64, 
  className = '',
  animate = true 
}) => {
  
  // Colors and patterns definitions
  const textures: Record<BlockType, { top: string; bottom: string; side: string; front?: string }> = {
    grass: {
      top: '#5b8731',
      bottom: '#543d26',
      side: 'linear-gradient(to bottom, #5b8731 30%, #543d26 30%)',
    },
    dirt: { top: '#543d26', bottom: '#543d26', side: '#543d26' },
    stone: { top: '#7d7d7d', bottom: '#7d7d7d', side: '#7d7d7d' },
    cobblestone: {
      top: '#5a5a5a',
      bottom: '#4a4a4a',
      // Speckled pattern to simulate cobblestone texture
      side: 'radial-gradient(circle at 30% 30%, #444 10%, transparent 12%), radial-gradient(circle at 70% 70%, #444 10%, transparent 12%), radial-gradient(circle at 80% 20%, #666 5%, transparent 7%), #555'
    },
    furnace: {
      top: '#555',
      bottom: '#555',
      side: '#666',
      front: 'radial-gradient(circle, #000 30%, #555 31%)' // Simple unlit furnace
    },
    furnace_active: {
      top: '#555',
      bottom: '#555',
      side: '#666',
      front: 'radial-gradient(circle, #ffaa00 30%, #555 31%)' // Lit furnace
    },
    tnt: {
      top: 'repeating-linear-gradient(45deg, #cc0000, #cc0000 10px, #db5c5c 10px, #db5c5c 20px)',
      bottom: '#cc0000',
      side: 'linear-gradient(to bottom, #cc0000 35%, #fff 35%, #fff 65%, #cc0000 65%)',
    },
    diamond_ore: {
      top: '#7d7d7d',
      bottom: '#7d7d7d',
      side: 'radial-gradient(circle at 30% 30%, #00ffff 5%, transparent 6%), radial-gradient(circle at 70% 60%, #00ffff 5%, transparent 6%), #7d7d7d',
    },
    gold_block: { top: '#ffaa00', bottom: '#cc8800', side: '#ffaa00' },
    iron_block: { top: '#e0e0e0', bottom: '#a1a1a1', side: '#d1d1d1' },
    diamond_block: { top: '#63e5ff', bottom: '#2e8b9e', side: '#45acbf' },
    crafting_table: {
        top: '#a05f33', // Base color, enhanced with gradient in render
        bottom: '#4a3219',
        side: '#6b4522',
        front: '#6b4522'
    }
  };

  const tex = textures[type];

  // Helper for face styles
  const faceStyle = (transform: string, bg: string, isFront = false) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    background: bg,
    transform,
    backfaceVisibility: 'hidden' as const,
    boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.15)', // Inner border for blocky feel
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    imageRendering: 'pixelated' as const,
  });

  // Furnace animation
  const glowVariants = {
    idle: { opacity: 0.8 },
    burning: { 
      opacity: [0.6, 1, 0.6],
      backgroundColor: ['#ffaa00', '#ffcc00', '#ffaa00'],
      transition: { duration: 0.8, repeat: Infinity } 
    }
  };

  // Crafting Table Top Pattern (3x3 grid simulation)
  const CraftingTop = () => (
    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-[2px] bg-[#3a2510] p-[4px]">
        {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-[#a05f33] w-full h-full shadow-inner" />
        ))}
    </div>
  );

  return (
    <div className={`perspective-1000 ${className}`} style={{ width: size, height: size }}>
      <motion.div
        className="w-full h-full preserve-3d relative"
        initial={{ rotateX: -15, rotateY: 25 }}
        whileHover={animate ? { rotateX: -5, rotateY: 45, scale: 1.1 } : {}}
        animate={animate ? {
           y: [0, -10, 0],
           rotateY: [25, 30, 25],
        } : {}}
        transition={{ 
           y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
           rotateY: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Front */}
        <div style={faceStyle(`translateZ(${size / 2}px)`, tex.front || tex.side, true)}>
           {type === 'tnt' && (
              <div className="bg-white px-2 py-1 font-bold text-black text-xs border-2 border-gray-300">TNT</div>
           )}
           {type === 'furnace_active' && (
               <motion.div 
                 variants={glowVariants}
                 animate="burning"
                 className="w-1/2 h-1/2 bg-orange-500 rounded-sm shadow-[0_0_15px_#ffaa00]"
               />
           )}
           {type === 'furnace' && (
               <div className="w-1/2 h-1/2 bg-black/80 rounded-sm" />
           )}
           {type === 'crafting_table' && (
               <div className="w-full h-full border-4 border-[#4a3219] bg-[#6b4522] relative flex items-center justify-center">
                   {/* Tools simulation on side */}
                   <div className="w-1/2 h-1/2 border border-[#4a3219] flex gap-1 p-1 bg-[#5c3e20]">
                       <div className="w-2 h-full bg-[#4a3219]"></div>
                       <div className="w-full h-2 bg-[#4a3219] self-end"></div>
                   </div>
               </div>
           )}
        </div>

        {/* Back */}
        <div style={faceStyle(`rotateY(180deg) translateZ(${size / 2}px)`, tex.side)} />

        {/* Right */}
        <div style={faceStyle(`rotateY(90deg) translateZ(${size / 2}px)`, tex.side)} />

        {/* Left */}
        <div style={faceStyle(`rotateY(-90deg) translateZ(${size / 2}px)`, tex.side)} />

        {/* Top */}
        <div style={faceStyle(`rotateX(90deg) translateZ(${size / 2}px)`, tex.top)}>
             {type === 'crafting_table' && <CraftingTop />}
        </div>

        {/* Bottom */}
        <div style={faceStyle(`rotateX(-90deg) translateZ(${size / 2}px)`, tex.bottom)} />
      </motion.div>
      
      {/* Shadow */}
      <motion.div 
        animate={{ scale: [1, 0.8, 1], opacity: [0.3, 0.2, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black blur-md rounded-full"
        style={{ width: size * 0.8, height: size * 0.2 }}
      />
    </div>
  );
};
