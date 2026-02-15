import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskCategory } from '../types';
import { Book, Sword, Pickaxe, Clock, Check, Gem } from 'lucide-react';

interface TaskSlotProps {
  task: Task;
  onToggle: (id: string, currentStatus: boolean, rect?: DOMRect) => void;
  onClick: (task: Task) => void;
}

export const TaskSlot: React.FC<TaskSlotProps> = ({ task, onToggle, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (task.category) {
      case TaskCategory.HOMEWORK: return <Book className="w-10 h-10 text-[#d32f2f]" />; // Red Book
      case TaskCategory.EXAM: return <Sword className="w-10 h-10 text-mc-diamond" />; // Diamond Sword
      case TaskCategory.PROJECT: return <Pickaxe className="w-10 h-10 text-mc-gold" />; // Gold Pickaxe
      case TaskCategory.PERSONAL: return <Clock className="w-10 h-10 text-blue-400" />;
      default: return <Book className="w-10 h-10 text-gray-400" />;
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onToggle(task.id, task.is_complete, rect);
  };

  return (
    <div className="relative inline-block m-1">
      {/* Slot Container */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleToggle}
        className={`
          w-20 h-20 bg-[#8b8b8b] 
          border-t-4 border-l-4 border-[#373737] 
          border-b-4 border-r-4 border-[#ffffff] 
          flex items-center justify-center 
          cursor-pointer relative
          shadow-md
        `}
      >
        {/* Inner shadow simulation for depth */}
        <div className="absolute inset-0 border-t-2 border-l-2 border-[#5a5a5a] border-b-2 border-r-2 border-[#a0a0a0] pointer-events-none" />

        {/* Icon */}
        <div className={`transition-opacity duration-200 ${task.is_complete ? 'opacity-50' : 'opacity-100'}`}>
          {getIcon()}
        </div>

        {/* Completion Overlay (Emerald) */}
        <AnimatePresence>
          {task.is_complete && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <Gem className="w-12 h-12 text-[#50c878] drop-shadow-[0_2px_0_rgba(0,0,0,0.5)] fill-[#50c878]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Minecraft Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
            className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-50 pointer-events-none w-48"
            style={{ x: "-50%" }}
          >
            <div className="
              bg-[#100010]/95 
              border-2 border-[#2b005e] 
              p-3 text-white font-pixel 
              shadow-[4px_4px_0_rgba(0,0,0,0.5)]
              relative
            ">
              {/* Tooltip Border effect - lighter inner border */}
              <div className="absolute inset-[2px] border border-[#3b0080] pointer-events-none" />
              
              <h4 className="text-[#a020f0] text-shadow-lg mb-1 text-lg leading-tight relative z-10">
                {task.title}
              </h4>
              <p className="text-[#aaaaaa] text-sm leading-tight relative z-10">
                {task.description || "No lore provided."}
              </p>
              <div className="mt-2 text-[#555555] text-xs italic relative z-10">
                {task.is_complete ? "Enchanted (Completed)" : "Common Item"}
              </div>
              <div className="mt-1 text-[#55ff55] text-xs relative z-10">
                Category: {task.category}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
