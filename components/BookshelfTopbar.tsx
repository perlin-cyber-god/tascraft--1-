import React, { useRef, useState } from 'react';
import { Subject } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Sword, Pickaxe, FlaskConical, Zap, Plus, Trash2, Library, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface BookshelfTopbarProps {
  subjects: Subject[];
  selectedSubjectId: string | null;
  onSelectSubject: (id: string | null) => void;
  onAddSubject: (name: string, icon: Subject['icon'], color: string) => void;
  onDeleteSubject: (id: string) => void;
}

export const BookshelfTopbar: React.FC<BookshelfTopbarProps> = ({
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

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -150 : 150,
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
    <div className="w-full bg-[#313233] border-b-4 border-[#1e1e1f] font-pixel shadow-md relative z-40">
      
      <div className="max-w-7xl mx-auto flex items-center h-28 px-2 md:px-4">
        
        {/* Label & Add Button */}
        <div className="flex flex-col gap-2 mr-4 shrink-0">
            <h2 className="text-[#ffaa00] text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Library className="w-4 h-4"/> Subjects
            </h2>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`w-10 h-10 border-2 flex items-center justify-center transition-colors shadow-pixel-sm active:translate-y-1 active:shadow-none ${isAdding ? 'bg-mc-red border-white text-white' : 'bg-[#4a4b4c] border-[#1e1e1f] hover:bg-[#5a5b5c] text-white'}`}
                title={isAdding ? "Cancel" : "Add Subject"}
            >
                {isAdding ? <X className="w-6 h-6"/> : <Plus className="w-6 h-6" />}
            </button>
        </div>

        {/* Scroll Left */}
        <button 
            onClick={() => handleScroll('left')}
            className="h-full px-2 text-[#a0a0a0] hover:text-white hover:bg-white/5 active:bg-white/10 hidden md:flex items-center"
        >
            <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Horizontal Scroll Area */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 px-2 py-2 mask-linear-fade">
            
            {/* Add Subject Form Overlay */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        onSubmit={handleAddSubmit}
                        className="flex flex-col gap-2 bg-[#c6c6c6] border-2 border-white p-2 min-w-[200px] overflow-hidden shrink-0 shadow-lg"
                    >
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Subject Name..." 
                            className="w-full bg-[#8b8b8b] border-2 border-[#373737] text-white p-1 text-sm font-pixel placeholder-gray-300 outline-none"
                            value={newSubName}
                            onChange={e => setNewSubName(e.target.value)}
                        />
                         <div className="flex justify-between gap-1">
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
                        <button type="submit" className="bg-mc-green text-white text-xs py-1 border-2 border-green-800 hover:brightness-110">
                            Create
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* All Tasks - Default Frame */}
            <ItemFrame 
                label="All Tasks"
                active={selectedSubjectId === null}
                onClick={() => onSelectSubject(null)}
                icon={<Book className="w-full h-full text-white p-2 drop-shadow-md" />}
                bgColor="#5b8731"
            />

            {/* Subject List */}
            <AnimatePresence mode='popLayout'>
                {subjects.map(sub => (
                    <ItemFrame
                        key={sub.id}
                        label={sub.name}
                        active={selectedSubjectId === sub.id}
                        onClick={() => onSelectSubject(sub.id)}
                        icon={icons[sub.icon]}
                        bgColor="#313233"
                        frameColor={sub.color}
                        onDelete={() => onDeleteSubject(sub.id)}
                    />
                ))}
            </AnimatePresence>
        </div>

        {/* Scroll Right */}
        <button 
            onClick={() => handleScroll('right')}
            className="h-full px-2 text-[#a0a0a0] hover:text-white hover:bg-white/5 active:bg-white/10 hidden md:flex items-center"
        >
            <ChevronRight className="w-8 h-8" />
        </button>

      </div>
    </div>
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
        className="group relative flex flex-col items-center cursor-pointer shrink-0"
    >
        {/* Frame Outer */}
        <div 
            className={`
                relative w-16 h-16 md:w-20 md:h-20
                bg-[#5d401f] /* Wood-like Frame Color */
                border-[3px] 
                shadow-md transition-all duration-200
                ${active 
                    ? 'border-[#ffff55] shadow-[0_0_10px_rgba(255,255,85,0.4)] scale-110 z-10' 
                    : 'border-[#3f2b15] hover:border-[#7e6b6b] hover:scale-105'}
            `}
        >
            {/* Delete Button (Visible on Hover) */}
            {onDelete && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute -top-2 -right-2 z-20 bg-mc-red border-2 border-white p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 rounded-sm"
                    title="Delete Subject"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            )}

            {/* Inner Background (Leather/Dark) */}
            <div 
                className="absolute inset-[4px] shadow-inner flex items-center justify-center bg-[#26170a]"
            >
                 {/* Item/Icon */}
                 <div 
                    className={`w-full h-full flex items-center justify-center transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                    style={{ color: frameColor || 'white' }}
                 >
                    {icon}
                 </div>
            </div>

            {/* Active Indicator (Redstone Torch look) */}
            {active && (
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-red-500 shadow-[0_0_5px_#ff0000]"></div>
            )}
        </div>

        {/* Label Plate */}
        <div className={`
            mt-1 px-1.5 py-0.5 border
            text-[10px] md:text-xs uppercase tracking-wide text-center max-w-[80px] truncate
            transition-colors
            ${active 
                ? 'bg-[#ffff55] border-[#c1c141] text-black font-bold' 
                : 'bg-[#1e1e1f] border-[#313233] text-[#a0a0a0] group-hover:text-white'}
        `}>
            {label}
        </div>
    </motion.div>
);
