import React, { useRef, useState } from 'react';
import { Subject } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Sword, Pickaxe, FlaskConical, Zap, Plus, Trash2, Library, ChevronUp, ChevronDown, Check } from 'lucide-react';

interface BookshelfSidebarProps {
  subjects: Subject[];
  selectedSubjectId: string | null;
  onSelectSubject: (id: string | null) => void;
  onAddSubject: (name: string, icon: Subject['icon'], color: string) => void;
  onDeleteSubject: (id: string) => void;
}

export const BookshelfSidebar: React.FC<BookshelfSidebarProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  onAddSubject,
  onDeleteSubject
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIcon, setNewSubIcon] = useState<Subject['icon']>('book');

  const icons = {
    book: <Book className="w-full h-full p-2" />,
    sword: <Sword className="w-full h-full p-2" />,
    pickaxe: <Pickaxe className="w-full h-full p-2" />,
    potion: <FlaskConical className="w-full h-full p-2" />,
    redstone: <Zap className="w-full h-full p-2" />,
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: direction === 'up' ? -120 : 120,
        behavior: 'smooth'
      });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubName.trim()) {
      const colors = ['#ff5555', '#55ff55', '#5555ff', '#ffaa00', '#aa00aa', '#00aaaa'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      onAddSubject(newSubName, newSubIcon, randomColor);
      setNewSubName('');
      setIsAdding(false);
    }
  };

  return (
    <aside className="w-full md:w-64 bg-[#313233] border-r-4 border-[#1e1e1f] flex flex-col font-pixel relative shadow-2xl h-full">
      
      {/* Header */}
      <div className="p-3 border-b-4 border-[#1e1e1f] bg-[#313233] relative z-10 flex items-center justify-between">
        <h2 className="text-[#a0a0a0] text-lg uppercase tracking-wide flex items-center gap-2">
            <Library className="w-5 h-5"/> Subjects
        </h2>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="w-6 h-6 bg-[#4a4b4c] border-2 border-[#1e1e1f] flex items-center justify-center hover:bg-[#5a5b5c] text-white"
            title="Add Subject"
        >
            <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll Up Button */}
      <button 
        onClick={() => handleScroll('up')}
        className="h-8 bg-[#313233] border-b-4 border-[#1e1e1f] hover:bg-[#454647] flex items-center justify-center text-[#a0a0a0] active:bg-[#2a2a2b] transition-colors"
      >
        <ChevronUp className="w-6 h-6" />
      </button>

      {/* Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4 bg-[#212122] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
        
        {/* Add Form (Expandable) */}
        <AnimatePresence>
            {isAdding && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-2"
                >
                    <div className="bg-[#c6c6c6] border-2 border-white p-2 text-black">
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Name..." 
                            className="w-full bg-[#8b8b8b] border-2 border-[#373737] text-white p-1 text-sm font-pixel mb-2 placeholder-gray-300"
                            value={newSubName}
                            onChange={e => setNewSubName(e.target.value)}
                        />
                         <div className="flex justify-between gap-1 mb-2">
                            {(Object.keys(icons) as Subject['icon'][]).map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setNewSubIcon(icon)}
                                    className={`p-1 border ${newSubIcon === icon ? 'bg-[#55ff55] border-[#228822]' : 'bg-[#8b8b8b] border-[#373737]'}`}
                                >
                                    <div className="w-3 h-3 text-white">
                                        {icons[icon]}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1">
                             <button onClick={handleAddSubmit} className="flex-1 bg-mc-green text-white text-xs py-1 border border-black">Add</button>
                             <button onClick={() => setIsAdding(false)} className="flex-1 bg-mc-red text-white text-xs py-1 border border-black">Cancel</button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* All Tasks - Item Frame */}
        <ItemFrame 
            label="All Tasks"
            active={selectedSubjectId === null}
            onClick={() => onSelectSubject(null)}
            icon={<Book className="w-8 h-8 text-white drop-shadow-md" />}
            bgColor="#5b8731"
        />

        {/* Dynamic Subjects */}
        <AnimatePresence>
            {subjects.map(sub => (
                <ItemFrame
                    key={sub.id}
                    label={sub.name}
                    active={selectedSubjectId === sub.id}
                    onClick={() => onSelectSubject(sub.id)}
                    icon={icons[sub.icon]}
                    bgColor="#313233" // Default background, icon provides color or distinct frame
                    frameColor={sub.color}
                    onDelete={() => onDeleteSubject(sub.id)}
                />
            ))}
        </AnimatePresence>

      </div>

      {/* Scroll Down Button */}
      <button 
        onClick={() => handleScroll('down')}
        className="h-8 bg-[#313233] border-t-4 border-[#1e1e1f] hover:bg-[#454647] flex items-center justify-center text-[#a0a0a0] active:bg-[#2a2a2b] transition-colors"
      >
        <ChevronDown className="w-6 h-6" />
      </button>

    </aside>
  );
};

interface ItemFrameProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  bgColor?: string;
  frameColor?: string;
  onDelete?: () => void;
}

const ItemFrame: React.FC<ItemFrameProps> = ({ label, active, onClick, icon, bgColor = '#313233', frameColor, onDelete }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={onClick}
        className="group relative flex flex-col items-center cursor-pointer"
    >
        {/* Frame Outer */}
        <div 
            className={`
                relative w-full aspect-square max-w-[120px] 
                bg-[#5d401f] /* Wood-like Frame Color */
                border-[4px] 
                shadow-md transition-all duration-200
                ${active 
                    ? 'border-[#ffff55] shadow-[0_0_10px_rgba(255,255,85,0.4)] scale-105' 
                    : 'border-[#3f2b15] hover:border-[#7e6b6b]'}
            `}
        >
            {/* Delete Button (Visible on Hover) */}
            {onDelete && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute -top-2 -right-2 z-20 bg-mc-red border-2 border-white p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    title="Delete Subject"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            )}

            {/* Inner Background (Leather/Dark) */}
            <div 
                className="absolute inset-[6px] shadow-inner flex items-center justify-center"
                style={{ backgroundColor: active ? '#4a3219' : '#26170a' }}
            >
                 {/* Item/Icon */}
                 <div 
                    className={`w-3/4 h-3/4 flex items-center justify-center transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                    style={{ color: frameColor || 'white' }}
                 >
                    {icon}
                 </div>
            </div>

            {/* Color Tag (if provided) */}
            {frameColor && (
                 <div 
                    className="absolute bottom-1 right-1 w-3 h-3 border border-black"
                    style={{ backgroundColor: frameColor }}
                 />
            )}
        </div>

        {/* Label Plate */}
        <div className={`
            mt-2 px-2 py-0.5 border-2 
            text-xs uppercase tracking-wide text-center w-full max-w-[120px] truncate
            ${active 
                ? 'bg-[#ffff55] border-[#c1c141] text-black font-bold' 
                : 'bg-[#1e1e1f] border-[#313233] text-[#a0a0a0] group-hover:text-white'}
        `}>
            {label}
        </div>
    </motion.div>
);
