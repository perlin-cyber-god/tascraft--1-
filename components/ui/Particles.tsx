import React, { useMemo } from 'react';

export const Particles: React.FC = () => {
  // Generate random particles with varying properties
  const particles = useMemo(() => {
    // Minecraft-ish colors: Portal purple, XP Green, Redstone, Diamond, Gold
    const colors = ['#6a4c93', '#83d656', '#aa0000', '#3ab3da', '#ffaa00'];
    
    return Array.from({ length: 50 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      animationDuration: `${10 + Math.random() * 20}s`, // Faster, varied speed
      animationDelay: `${Math.random() * -30}s`, // Start immediately scattered
      // Higher opacity range for visibility
      opacity: 0.3 + Math.random() * 0.5, 
      size: `${4 + Math.random() * 8}px`, // Larger squares
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            opacity: p.opacity,
            boxShadow: `0 0 5px ${p.color}`, // Glow effect
          }}
        />
      ))}
      {/* Vignette Overlay for atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
    </div>
  );
};