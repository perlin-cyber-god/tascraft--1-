import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskCategory } from '../types';
import { Check, Trash2, Calendar, Edit2, Clock, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, currentStatus: boolean, rect?: DOMRect) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const categoryColors = {
  [TaskCategory.HOMEWORK]: 'text-[#3ab3da] border-[#3ab3da] bg-[#3ab3da]/10',
  [TaskCategory.EXAM]: 'text-[#b3312c] border-[#b3312c] bg-[#b3312c]/10',
  [TaskCategory.PROJECT]: 'text-[#7b29ad] border-[#7b29ad] bg-[#7b29ad]/10',
  [TaskCategory.PERSONAL]: 'text-[#41cd34] border-[#41cd34] bg-[#41cd34]/10',
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const isDueSoon = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onToggle(task.id, task.is_complete, rect);
  };

  // Default priority if missing
  const priority = task.priority || 1;
  const isMaxPriority = priority === 5;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -50, rotateX: -90 }}
      animate={{ opacity: 1, x: 0, rotateX: 0 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.02, x: 5 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`
        relative group mb-4
        bg-mc-dirt bg-dirt-pattern
        border-t-4 border-l-4 border-[#6e5033]
        border-b-4 border-r-4 border-[#3a2a1a]
        shadow-3d-sm hover:shadow-3d transition-shadow
        cursor-pointer
        overflow-hidden
        ${task.is_complete ? 'opacity-60 grayscale-[0.3] translate-y-2 !shadow-none border-mc-dirtDark' : ''}
      `}
    >
      {/* Enchantment Glint Effect for 5 Star tasks */}
      {isMaxPriority && !task.is_complete && (
         <div className="absolute inset-0 z-[1] pointer-events-none opacity-40 mix-blend-color-dodge">
             <style>{`
                @keyframes glint {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
             `}</style>
             <div 
                className="w-[200%] h-[200%] absolute -top-1/2 -left-1/2"
                style={{
                    background: 'linear-gradient(125deg, transparent 20%, rgba(160, 32, 240, 0.6) 40%, rgba(160, 32, 240, 0.8) 50%, rgba(160, 32, 240, 0.6) 60%, transparent 80%)',
                    backgroundSize: '50% 50%',
                    animation: 'glint 3s linear infinite',
                    transform: 'rotate(-20deg)'
                }}
             />
         </div>
      )}

      <div className="p-4 flex items-start gap-5 relative z-10">
        
        {/* 3D Checkbox Mechanism */}
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`
            flex-shrink-0 w-12 h-12 mt-1
            border-4 relative overflow-hidden
            flex items-center justify-center
            transition-colors duration-200
            shadow-inner-3d
            ${task.is_complete 
              ? 'bg-mc-green border-mc-grassSide' 
              : 'bg-[#1a1a1a] border-[#555] hover:bg-[#222]'}
          `}
        >
          <AnimatePresence>
            {task.is_complete && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
              >
                <Check className="w-8 h-8 text-white drop-shadow-md" strokeWidth={5} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Content Slab */}
        <div className="flex-grow min-w-0 font-pixel" onClick={() => onEdit(task)}>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className={`px-2 py-0.5 text-lg uppercase border-2 shadow-sm ${categoryColors[task.category]}`}>
              {task.category}
            </span>
            
            {/* Nether Stars Display */}
            <div className="flex items-center gap-0.5 bg-black/40 px-2 py-0.5 rounded border border-white/10" title={`Priority: ${priority}/5`}>
                {Array.from({length: priority}).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-[#ffff55] fill-[#ffff55]" />
                ))}
            </div>

            {isDueSoon(task.due_date) && !task.is_complete && (
               <motion.span 
                 animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className="px-2 py-0.5 text-lg uppercase bg-mc-gold/20 text-mc-gold border-2 border-mc-gold flex items-center gap-1"
               >
                 <Clock className="w-4 h-4" /> Due Today
               </motion.span>
            )}
          </div>
          
          <h3 className={`text-2xl text-white mb-1 tracking-wide leading-none transition-all duration-300 ${
            task.is_complete ? 'line-through decoration-4 decoration-black/50 text-gray-500' : 'text-shadow'
          } ${isMaxPriority && !task.is_complete ? 'text-[#e0b0ff] drop-shadow-[0_0_5px_#a020f0]' : ''}`}>
            {task.title}
          </h3>
          
          <p className={`text-xl text-[#d0b49f] mb-2 line-clamp-2 leading-tight ${task.is_complete ? 'opacity-50' : ''}`}>
            {task.description}
          </p>

          <div className="flex items-center gap-4 text-lg text-gray-400/80">
            <div className="flex items-center gap-2 bg-black/20 px-2 py-0.5 rounded">
              <Calendar className="w-4 h-4" />
              {format(parseISO(task.due_date), 'MMM d, h:mm a')}
            </div>
          </div>
        </div>

        {/* Action Blocks */}
        <div className="flex flex-col gap-3">
          <motion.button 
            whileHover={{ x: -3, scale: 1.1, backgroundColor: "#555" }}
            whileTap={{ x: 0, scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-2 bg-mc-stone border-2 border-mc-stoneLight shadow-pixel-sm text-white"
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ x: -3, scale: 1.1, backgroundColor: "#ff5555" }}
            whileTap={{ x: 0, scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-2 bg-mc-red border-2 border-[#ff5555] shadow-pixel-sm text-white"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
      
      {/* Highlight glow on hover */}
      <div className="absolute inset-0 border-4 border-white opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-200" />
    </motion.li>
  );
};