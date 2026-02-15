import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Globe } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { taskService } from '../services/taskService';
import { differenceInHours, parseISO } from 'date-fns';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await taskService.fetchLeaderboard();
      // Add ranking logic locally if needed, though SQL does sorting
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isOffline = (lastSeen?: string) => {
    if (!lastSeen) return true;
    return differenceInHours(new Date(), parseISO(lastSeen)) > 24;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-[#222] border-4 border-t-[#aaa] border-l-[#aaa] border-r-[#111] border-b-[#111] shadow-2xl pointer-events-auto flex flex-col max-h-[80vh] font-pixel"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-3 bg-[#333] border-b-4 border-[#111]">
                <div className="flex items-center gap-3">
                   <Globe className="w-6 h-6 text-mc-green animate-pulse" />
                   <h2 className="text-2xl text-[#fff] drop-shadow-md tracking-wider">Multiplayer List</h2>
                </div>
                <button onClick={onClose} className="text-[#e0e0e0] hover:text-white bg-[#555] p-1 border border-white hover:bg-mc-red active:border-[#555]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 p-3 bg-[#1a1a1a] text-[#aaa] text-sm uppercase tracking-widest border-b-2 border-[#333]">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-3 text-center">Level</div>
                <div className="col-span-2 text-right">Quests</div>
              </div>

              {/* List Content */}
              <div className="flex-grow overflow-y-auto bg-[#111] p-2 space-y-1 relative">
                {loading ? (
                   <div className="flex items-center justify-center h-40">
                      <div className="w-8 h-8 border-4 border-mc-stoneLight border-t-mc-green animate-spin"></div>
                   </div>
                ) : (
                    entries.map((entry, index) => {
                        const rank = index + 1;
                        const level = Math.floor(entry.total_xp / 1000) + 1;
                        const offline = isOffline(entry.last_seen);
                        
                        return (
                            <motion.div 
                                key={entry.user_id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`
                                    grid grid-cols-12 gap-2 items-center p-2 border border-transparent hover:border-white/20 hover:bg-white/5 transition-colors
                                    ${offline ? 'opacity-50 grayscale' : 'opacity-100'}
                                `}
                            >
                                {/* Rank */}
                                <div className="col-span-2 text-center text-xl text-[#555]">
                                    {rank === 1 ? <Crown className="w-5 h-5 text-mc-gold mx-auto fill-mc-gold" /> : `#${rank}`}
                                </div>

                                {/* Username */}
                                <div className="col-span-5 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${offline ? 'bg-gray-500' : 'bg-mc-green shadow-[0_0_5px_#5b8731]'}`} />
                                    <span className={`text-lg truncate ${rank === 1 ? 'text-mc-gold text-shadow' : 'text-white'}`}>
                                        {entry.username}
                                    </span>
                                </div>

                                {/* Level */}
                                <div className="col-span-3 text-center text-mc-green text-lg">
                                    {level}
                                </div>

                                {/* Quests */}
                                <div className="col-span-2 text-right text-[#aaa]">
                                    {entry.total_completed}
                                </div>
                            </motion.div>
                        );
                    })
                )}
                
                {!loading && entries.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        No players found. The server is empty.
                    </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="bg-[#222] p-2 text-center text-xs text-[#555] border-t-4 border-[#111]">
                 TAB LIST - Press ESC to close
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};