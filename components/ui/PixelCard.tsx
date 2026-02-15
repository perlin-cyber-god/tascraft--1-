import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const PixelCard: React.FC<PixelCardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !hoverEffect) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (!hoverEffect) return;
    setHovering(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    if (!hoverEffect) return;
    setHovering(true);
  };

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        rotateX: hoverEffect ? rotateX : 0,
        rotateY: hoverEffect ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      initial={{ scale: 1 }}
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      whileTap={hoverEffect ? { scale: 0.98 } : {}}
      className={`
        bg-mc-stone 
        relative
        border-t-[4px] border-l-[4px] border-mc-stoneLight 
        border-b-[4px] border-r-[4px] border-mc-stoneDark 
        shadow-3d
        p-6 
        text-white
        transition-shadow duration-300
        ${hovering ? 'shadow-3d-hover' : ''}
        ${className}
      `}
    >
      {/* Depth Layer for 3D effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/20 pointer-events-none" 
        style={{ transform: "translateZ(20px)" }}
      />
      
      {/* Corner Bolts */}
      <div className="absolute top-2 left-2 w-2 h-2 bg-mc-stoneDark/80 shadow-[1px_1px_0px_rgba(255,255,255,0.1)]" style={{ transform: "translateZ(10px)" }} />
      <div className="absolute top-2 right-2 w-2 h-2 bg-mc-stoneDark/80 shadow-[1px_1px_0px_rgba(255,255,255,0.1)]" style={{ transform: "translateZ(10px)" }} />
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-mc-stoneDark/80 shadow-[1px_1px_0px_rgba(255,255,255,0.1)]" style={{ transform: "translateZ(10px)" }} />
      <div className="absolute bottom-2 right-2 w-2 h-2 bg-mc-stoneDark/80 shadow-[1px_1px_0px_rgba(255,255,255,0.1)]" style={{ transform: "translateZ(10px)" }} />
      
      <div style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
    </motion.div>
  );
};
