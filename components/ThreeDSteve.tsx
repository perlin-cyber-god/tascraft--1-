import React from 'react';
import { motion } from 'framer-motion';

interface ThreeDSteveProps {
  isWorking?: boolean;
  className?: string;
}

// Helper to create a 6-sided cube
const Cube = ({ 
  width, 
  height, 
  depth, 
  x = 0, 
  y = 0, 
  z = 0, 
  colors,
  rotateX = 0
}: { 
  width: number; 
  height: number; 
  depth: number; 
  x?: number; 
  y?: number; 
  z?: number;
  colors: { front: string; back: string; left: string; right: string; top: string; bottom: string };
  rotateX?: any; // Framer motion value or number
}) => {
  // CSS Transform utils
  const getFaceStyle = (transform: string, bg: string, w: number, h: number) => ({
    position: 'absolute' as const,
    width: `${w}px`,
    height: `${h}px`,
    backgroundColor: bg,
    transform,
    backfaceVisibility: 'hidden' as const,
    boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.1)' // faint pixel border
  });

  return (
    <motion.div
      style={{
        width: width,
        height: height,
        position: 'absolute',
        transformStyle: 'preserve-3d',
        x,
        y,
        z,
        rotateX
      }}
    >
      {/* Front */}
      <div style={getFaceStyle(`translateZ(${depth / 2}px)`, colors.front, width, height)} />
      {/* Back */}
      <div style={getFaceStyle(`rotateY(180deg) translateZ(${depth / 2}px)`, colors.back, width, height)} />
      {/* Right */}
      <div style={getFaceStyle(`rotateY(90deg) translateZ(${width / 2}px)`, colors.right, depth, height)} />
      {/* Left */}
      <div style={getFaceStyle(`rotateY(-90deg) translateZ(${width / 2}px)`, colors.left, depth, height)} />
      {/* Top */}
      <div style={getFaceStyle(`rotateX(90deg) translateZ(${depth / 2}px)`, colors.top, width, depth)} />
      {/* Bottom */}
      <div style={getFaceStyle(`rotateX(-90deg) translateZ(${depth / 2}px)`, colors.bottom, width, depth)} />
    </motion.div>
  );
};

export const ThreeDSteve: React.FC<ThreeDSteveProps> = ({ isWorking = false, className = '' }) => {
  // Scale factor to make Steve visible but not huge. 
  // Standard Steve is 8(w) x 32(h) x 4(d) pixels roughly in texture coordinates.
  // We'll multiply by 4 for display.
  const s = 4; 

  // Colors
  const skin = '#ffdbac';
  const shirt = '#00a4a4';
  const pants = '#43369d';
  const hair = '#2e1f15';
  
  // Animation Variants
  const armSwingLeft = {
    rest: { rotateX: 0 },
    working: { 
      rotateX: [20, -20, 20],
      transition: { duration: 0.8, repeat: Infinity, ease: "linear" }
    }
  };
  
  const armSwingRight = {
    rest: { rotateX: 0 },
    working: { 
      rotateX: [-20, 20, -20],
      transition: { duration: 0.8, repeat: Infinity, ease: "linear" }
    }
  };

  return (
    <div className={`perspective-1000 w-32 h-64 relative ${className}`}>
      <motion.div
        className="w-full h-full preserve-3d relative"
        animate={{ rotateY: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: 'center center' }}
      >
        {/* CENTER PIVOT ADJUSTMENT: Steve's origin is usually center of torso */}
        <div style={{ transform: `translateX(45%) translateY(20%)` }} className="preserve-3d">

          {/* HEAD: 8x8x8 */}
          <Cube 
            width={8*s} height={8*s} depth={8*s} 
            y={-8*s} 
            colors={{ 
              front: skin, back: hair, left: skin, right: skin, top: hair, bottom: skin 
            }} 
          />
          {/* Face Details (Overlay) - Simplified for code, relying on Cube for structure */}
          
          {/* BODY: 8x12x4 */}
          <Cube 
            width={8*s} height={12*s} depth={4*s} 
            y={0} 
            colors={{ 
              front: shirt, back: shirt, left: shirt, right: shirt, top: shirt, bottom: shirt 
            }} 
          />

          {/* LEFT ARM: 4x12x4 */}
          <motion.div
            style={{ position: 'absolute', x: -4*s, y: 0, transformStyle: 'preserve-3d', originY: 0 }} // Pivot at shoulder
            variants={armSwingLeft}
            animate={isWorking ? "working" : "rest"}
          >
            <Cube 
              width={4*s} height={12*s} depth={4*s}
              // Adjust pivot offset if needed, but wrapper handles it
              colors={{ front: shirt, back: shirt, left: shirt, right: shirt, top: shirt, bottom: skin }} 
            />
          </motion.div>

          {/* RIGHT ARM: 4x12x4 */}
          <motion.div
            style={{ position: 'absolute', x: 8*s, y: 0, transformStyle: 'preserve-3d', originY: 0 }}
            variants={armSwingRight}
            animate={isWorking ? "working" : "rest"}
          >
             <Cube 
              width={4*s} height={12*s} depth={4*s}
              colors={{ front: shirt, back: shirt, left: shirt, right: shirt, top: shirt, bottom: skin }} 
            />
          </motion.div>

          {/* LEFT LEG: 4x12x4 */}
          <Cube 
            width={4*s} height={12*s} depth={4*s} 
            x={0} y={12*s} 
            colors={{ front: pants, back: pants, left: pants, right: pants, top: pants, bottom: pants }} 
          />

          {/* RIGHT LEG: 4x12x4 */}
          <Cube 
            width={4*s} height={12*s} depth={4*s} 
            x={4*s} y={12*s} 
            colors={{ front: pants, back: pants, left: pants, right: pants, top: pants, bottom: pants }} 
          />

        </div>
      </motion.div>
      
      {/* Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-black/40 blur-md rounded-full rotate-x-[60deg]" />
    </div>
  );
};
