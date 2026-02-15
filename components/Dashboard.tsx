import React, { useMemo, useState } from 'react';
import { Task } from '../types';
import { PixelCard } from './ui/PixelCard';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CloudSnow, CloudRain, Sun, Wrench } from 'lucide-react';
import { isSameDay, parseISO } from 'date-fns';
import { Minecraft3DBlock } from './ui/Minecraft3DBlock';
import { CraftingStationModal } from './CraftingStationModal';

interface DashboardProps {
  tasks: Task[];
  onWeatherChange?: (type: 'snow' | 'rain' | 'none') => void;
  currentWeather?: 'snow' | 'rain' | 'none';
  completedRef?: React.RefObject<HTMLDivElement>;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, onWeatherChange, currentWeather = 'snow', completedRef }) => {
  const [isCraftingOpen, setIsCraftingOpen] = useState(false);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.is_complete).length;
    const pending = total - completed;
    const dueToday = tasks.filter(t => 
      !t.is_complete && isSameDay(parseISO(t.due_date), new Date())
    ).length;

    return { total, completed, pending, dueToday };
  }, [tasks]);

  const data = [
    { name: 'Completed', value: stats.completed },
    { name: 'Pending', value: stats.pending },
  ];

  const COLORS = ['#5b8731', '#222222']; 

  const chartData = stats.total === 0 ? [{ name: 'Empty', value: 1 }] : data;
  const chartColors = stats.total === 0 ? ['#222222'] : COLORS;

  const weatherOptions = [
    { type: 'none', icon: Sun, label: 'Clear' },
    { type: 'snow', icon: CloudSnow, label: 'Snow' },
    { type: 'rain', icon: CloudRain, label: 'Rain' },
  ] as const;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 font-pixel relative">
        
        {/* Left Column: Crafting Table & Efficiency */}
        <div className="col-span-1 flex flex-col gap-6">
            
            {/* Crafting Table Block (Clickable) */}
            <PixelCard 
                onClick={() => setIsCraftingOpen(true)}
                hoverEffect 
                className="cursor-pointer !bg-[#4a3219] !border-[#6b4522] flex items-center justify-between group overflow-hidden"
            >
                <div className="relative z-10 flex items-center gap-4">
                    <Minecraft3DBlock type="crafting_table" size={64} />
                    <div>
                        <h3 className="text-2xl text-white text-shadow uppercase">Crafting</h3>
                        <p className="text-[#a05f33] text-lg leading-none">Tap to Open</p>
                    </div>
                </div>
                <Wrench className="w-8 h-8 text-[#a05f33] opacity-50 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
                
                {/* Background Glow */}
                <div className="absolute inset-0 bg-[#a05f33]/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </PixelCard>

            {/* Progress Monitor Block */}
            <PixelCard className="flex flex-col items-center justify-center relative !bg-[#262626] !p-0 overflow-hidden group border-4 !border-[#111] min-h-[300px]">
                {/* Monitor Bezel Details */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#333] border-b-4 border-black flex items-center px-3 gap-2 z-20 shadow-sm">
                    <div className="w-3 h-3 bg-[#aa0000] border border-[#550000] shadow-[inset_1px_1px_0px_rgba(255,255,255,0.3)]" />
                    <div className="w-3 h-3 bg-[#ffaa00] border border-[#cc8800] shadow-[inset_1px_1px_0px_rgba(255,255,255,0.3)]" />
                    <div className="w-3 h-3 bg-[#55ff55] border border-[#00aa00] shadow-[inset_1px_1px_0px_rgba(255,255,255,0.3)]" />
                </div>
                
                <div className="mt-10 mb-4 relative z-10 w-full flex flex-col items-center justify-center flex-grow">
                    {/* Explicit pixel dimensions wrapper to prevent Recharts -1 width error */}
                    <div style={{ width: '200px', height: '200px' }} className="relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={75}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="#000"
                                strokeWidth={4}
                            >
                                {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                            </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Center Text Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-5xl text-white text-shadow-lg font-bold">
                            {stats.total === 0 ? '0' : Math.round((stats.completed / stats.total) * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* CRT Scanline Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,6px_100%] pointer-events-none" />
                    
                    <p className="text-mc-stoneLight text-xl uppercase mt-2 tracking-widest bg-black/50 px-2 rounded relative z-30">Efficiency</p>
                </div>
                
                {/* Screen Glow */}
                <div className="absolute inset-0 bg-mc-diamond/5 pointer-events-none animate-pulse z-10" />
            </PixelCard>
        </div>

        {/* Right Column: Stats & Controls */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 h-min">
          
          {/* Environment Control Panel */}
          <div className="col-span-1 sm:col-span-2 bg-[#222] border-4 border-[#444] p-3 flex items-center justify-between shadow-3d-sm">
             <div className="flex items-center gap-3">
               <Minecraft3DBlock type="grass" size={32} animate={false} />
               <span className="text-mc-stoneLight uppercase text-lg tracking-widest">World Settings</span>
             </div>
             <div className="flex gap-2">
                {weatherOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => onWeatherChange?.(opt.type)}
                    className={`
                      p-2 border-2 transition-all duration-150 flex items-center gap-2
                      ${currentWeather === opt.type 
                        ? 'bg-mc-gold border-[#ffaa00] text-[#550000] shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]' 
                        : 'bg-[#333] border-[#555] text-gray-400 hover:bg-[#444] hover:text-white'}
                    `}
                    title={`Set Weather: ${opt.label}`}
                  >
                    <opt.icon className="w-5 h-5" />
                    <span className="hidden sm:inline text-lg uppercase">{opt.label}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Due Today - TNT Block */}
          <PixelCard className="flex items-center gap-6 !bg-[#333] !border-mc-stoneLight overflow-visible" hoverEffect>
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center z-10">
               <Minecraft3DBlock type="tnt" size={80} />
            </div>
            <div className="z-10">
              <p className="text-mc-stoneLight text-xl uppercase mb-1">Due Today</p>
              <h4 className="text-5xl text-white text-shadow">{stats.dueToday}</h4>
              <p className="text-sm text-gray-500 font-sans">Explosive Urgency</p>
            </div>
          </PixelCard>

          {/* Pending - Furnace Block */}
          <PixelCard className="flex items-center gap-6 !bg-[#333] !border-mc-stoneLight overflow-visible" hoverEffect>
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center z-10">
               <Minecraft3DBlock type={stats.pending > 0 ? "furnace_active" : "furnace"} size={80} />
            </div>
            <div className="z-10">
              <p className="text-mc-stoneLight text-xl uppercase mb-1">Pending</p>
              <h4 className="text-5xl text-white text-shadow">{stats.pending}</h4>
              <p className="text-sm text-gray-500 font-sans">Smelting...</p>
            </div>
          </PixelCard>

          {/* Completed - Diamond Ore */}
          <div ref={completedRef} className="contents">
            <PixelCard className="flex items-center gap-6 !bg-[#222] !border-mc-stoneDark overflow-visible" hoverEffect>
                <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center z-10">
                <Minecraft3DBlock type="diamond_ore" size={80} />
                </div>
                <div className="z-10">
                <p className="text-mc-stoneLight text-xl uppercase mb-1">Completed</p>
                <h4 className="text-5xl text-white text-shadow">{stats.completed}</h4>
                <div className="h-4 w-full bg-[#111] border-2 border-[#555] mt-2 relative">
                    <div 
                        className="h-full bg-mc-diamondLight absolute top-0 left-0 transition-all duration-1000"
                        style={{ width: `${stats.total === 0 ? 0 : (stats.completed / stats.total) * 100}%` }}
                    />
                </div>
                <p className="text-xs text-mc-stoneLight mt-1 font-sans">Riches Mined</p>
                </div>
            </PixelCard>
          </div>

          {/* Total Tasks - Cobblestone */}
          <PixelCard className="flex items-center gap-6 !bg-[#333] !border-mc-stoneLight overflow-visible" hoverEffect>
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center z-10">
               <Minecraft3DBlock type="cobblestone" size={80} />
            </div>
            <div className="z-10">
              <p className="text-mc-stoneLight text-xl uppercase mb-1">Total Tasks</p>
              <h4 className="text-5xl text-white text-shadow">{stats.total}</h4>
              <p className="text-sm text-gray-500 font-sans">Structure Size</p>
            </div>
          </PixelCard>
        </div>
      </div>

      <CraftingStationModal isOpen={isCraftingOpen} onClose={() => setIsCraftingOpen(false)} />
    </>
  );
};