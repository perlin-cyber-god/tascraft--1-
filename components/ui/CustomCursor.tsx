import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Smoother spring configuration: lower stiffness, appropriate damping
  const cursorX = useSpring(0, { stiffness: 250, damping: 25, mass: 0.5 });
  const cursorY = useSpring(0, { stiffness: 250, damping: 25, mass: 0.5 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 10); // Offset to center
      cursorY.set(e.clientY - 10);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check for interactive elements
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') || 
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <>
      {/* Main Cursor Block */}
      <motion.div
        className="fixed top-0 left-0 w-5 h-5 bg-white border-2 border-black pointer-events-none z-[9999] mix-blend-exclusion"
        style={{
          x: cursorX,
          y: cursorY,
          opacity: isVisible ? 1 : 0
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          rotate: isHovering ? 45 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      {/* Trailing Ghost */}
      <motion.div
        className="fixed top-0 left-0 w-5 h-5 bg-transparent border border-white/50 pointer-events-none z-[9998]"
        style={{
          x: cursorX,
          y: cursorY,
          opacity: isVisible ? (isHovering ? 0 : 0.5) : 0
        }}
        animate={{
          scale: isHovering ? 2 : 1,
        }}
        transition={{ delay: 0.02, type: "spring", stiffness: 150, damping: 25 }}
      />
    </>
  );
};
