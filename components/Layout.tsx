import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CustomCursor } from './ui/CustomCursor';
import { WeatherEffects } from './ui/WeatherEffects';

interface LayoutProps {
  children: React.ReactNode;
  weather?: 'snow' | 'rain' | 'none';
  level?: number;
  progress?: number;
  topbar?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children, weather = 'snow', level = 0, progress = 0, topbar }) => {
  return (
    <div className="min-h-screen bg-mc-bg text-gray-200 font-pixel selection:bg-mc-green selection:text-white relative overflow-hidden flex flex-col pt-20">
      <CustomCursor />
      
      <WeatherEffects effectType={weather} particleCount={80} />

      {/* Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden relative z-10">
        
        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto w-full">
             {/* Topbar (Scrolls with content) */}
             {topbar && (
                 <div className="w-full sticky top-0 z-30">
                     {topbar}
                 </div>
             )}
             
             <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {children}
             </div>
        </main>
      </div>
    </div>
  );
};