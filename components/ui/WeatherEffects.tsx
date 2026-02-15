import React, { useMemo } from 'react';

interface WeatherEffectsProps {
  effectType: 'snow' | 'rain' | 'none';
  particleCount?: number;
  className?: string;
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({ 
  effectType, 
  particleCount = 100,
  className = '' 
}) => {
  if (effectType === 'none') return null;

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const duration = effectType === 'snow' 
        ? 5 + Math.random() * 10 
        : 0.5 + Math.random() * 0.8;
      
      const size = effectType === 'snow' 
        ? 2 + Math.random() * 4 
        : 1; // Rain width is fixed in CSS mostly, height varies

      return {
        left: `${Math.random() * 100}vw`, // Use vw to ensure full coverage
        animationDelay: `${Math.random() * -20}s`,
        animationDuration: `${duration}s`,
        opacity: Math.random() * 0.6 + 0.2,
        size: `${size}px`,
        rainHeight: `${10 + Math.random() * 10}px`
      };
    });
  }, [particleCount, effectType]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      <style>{`
        @keyframes snow-fall {
          0% { 
            transform: translateY(-10vh) translateX(0); 
            opacity: 0; 
          }
          10% { opacity: 0.8; }
          100% { 
            transform: translateY(110vh) translateX(50px); 
            opacity: 0; 
          }
        }
        @keyframes rain-fall {
          0% { 
            transform: translateY(-20vh) translateX(0) skewX(-10deg); 
            opacity: 0; 
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { 
            transform: translateY(120vh) translateX(-20px) skewX(-10deg); 
            opacity: 0; 
          }
        }
      `}</style>
      
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute top-[-20px]"
          style={{
            left: p.left,
            width: effectType === 'snow' ? p.size : '2px',
            height: effectType === 'snow' ? p.size : p.rainHeight,
            borderRadius: effectType === 'snow' ? '50%' : '0',
            backgroundColor: effectType === 'rain' ? '#8cb5cf' : '#ffffff',
            opacity: p.opacity,
            animationName: effectType === 'snow' ? 'snow-fall' : 'rain-fall',
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            boxShadow: effectType === 'snow' ? '0 0 4px rgba(255,255,255,0.8)' : 'none',
          }}
        />
      ))}
      
      {/* Atmosphere Overlay */}
      <div className={`absolute inset-0 pointer-events-none ${
        effectType === 'rain' 
          ? 'bg-gradient-to-b from-blue-900/10 to-transparent mix-blend-overlay' 
          : 'bg-transparent'
      }`} />
    </div>
  );
};
