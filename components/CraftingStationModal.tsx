import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator as CalcIcon, Apple, Utensils, Plus } from 'lucide-react';
import { Calculator } from './ui/Calculator';
import { Minecraft3DBlock } from './ui/Minecraft3DBlock';

interface CraftingStationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CraftingStationModal: React.FC<CraftingStationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'food'>('calculator');
  const [calories, setCalories] = useState(0);
  const [customCals, setCustomCals] = useState('');

  const foods = [
    { name: 'Apple', cals: 50, color: '#ff5555' },
    { name: 'Bread', cals: 150, color: '#dcb96b' },
    { name: 'Steak', cals: 300, color: '#8b4513' },
    { name: 'Golden Apple', cals: 500, color: '#ffaa00' },
  ];

  const handleAddCustom = () => {
    const val = parseInt(customCals);
    if (!isNaN(val) && val > 0) {
      setCalories(c => c + val);
      setCustomCals('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4 font-pixel">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="w-full max-w-2xl bg-[#c6c6c6] border-4 border-t-white border-l-white border-r-[#555] border-b-[#555] shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-2 bg-[#8b8b8b] border-b-4 border-[#555]">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8">
                      <Minecraft3DBlock type="crafting_table" size={32} animate={false} />
                   </div>
                   <h2 className="text-2xl text-[#e0e0e0] drop-shadow-md">Crafting Station</h2>
                </div>
                <button onClick={onClose} className="text-[#e0e0e0] hover:text-white bg-[#555] p-1 border border-white hover:bg-mc-red active:border-[#555]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#333] p-1 gap-1">
                <button 
                  onClick={() => setActiveTab('calculator')}
                  className={`flex-1 py-2 flex items-center justify-center gap-2 text-xl transition-all border-2
                    ${activeTab === 'calculator' 
                      ? 'bg-[#8b8b8b] border-white text-white' 
                      : 'bg-[#555] border-[#333] text-gray-400 hover:bg-[#666]'}
                  `}
                >
                  <CalcIcon className="w-5 h-5" />
                  Redstone Calc
                </button>
                <button 
                  onClick={() => setActiveTab('food')}
                  className={`flex-1 py-2 flex items-center justify-center gap-2 text-xl transition-all border-2
                    ${activeTab === 'food' 
                      ? 'bg-[#8b8b8b] border-white text-white' 
                      : 'bg-[#555] border-[#333] text-gray-400 hover:bg-[#666]'}
                  `}
                >
                  <Utensils className="w-5 h-5" />
                  Rations (Cals)
                </button>
              </div>

              {/* Content Area */}
              <div className="p-6 bg-[#c6c6c6] overflow-y-auto flex-grow">
                {activeTab === 'calculator' && (
                   <div className="flex flex-col items-center">
                      <div className="mb-4 text-gray-700 text-lg">Perform complex Redstone calculations.</div>
                      <Calculator />
                   </div>
                )}

                {activeTab === 'food' && (
                   <div className="flex flex-col items-center w-full">
                      <div className="w-full bg-[#333] border-4 border-[#111] p-4 mb-6 flex justify-between items-center shadow-inner">
                         <span className="text-white text-xl uppercase">Total Energy:</span>
                         <span className="text-mc-gold text-4xl text-shadow">{calories} <span className="text-lg text-gray-400">kcal</span></span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 w-full">
                         {foods.map((food) => (
                           <button
                             key={food.name}
                             onClick={() => setCalories(c => c + food.cals)}
                             className="bg-[#8b8b8b] border-4 border-t-white border-l-white border-b-[#555] border-r-[#555] p-4 flex flex-col items-center gap-2 active:border-t-[#555] active:border-l-[#555] active:border-b-white active:border-r-white active:bg-[#777] transition-all hover:bg-[#999]"
                           >
                              <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#333]" style={{ backgroundColor: food.color }}>
                                 <Apple className="text-white w-6 h-6" />
                              </div>
                              <span className="text-white text-xl">{food.name}</span>
                              <span className="text-mc-green text-lg">+{food.cals}</span>
                           </button>
                         ))}
                      </div>

                      {/* Custom Calorie Input */}
                      <div className="w-full mt-4 bg-[#8b8b8b] border-4 border-[#555] p-3 flex flex-col gap-2">
                        <label className="text-sm text-[#333] font-bold uppercase">Custom Ration:</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                placeholder="Value..."
                                value={customCals}
                                onChange={(e) => setCustomCals(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                                className="flex-grow bg-[#333] border-2 border-b-white border-r-white border-t-[#222] border-l-[#222] text-white p-2 font-pixel text-xl focus:outline-none focus:bg-[#444] placeholder-gray-500"
                            />
                            <button 
                                onClick={handleAddCustom}
                                className="bg-mc-grass border-t-2 border-l-2 border-[#83d656] border-b-2 border-r-2 border-[#2d4415] text-white px-4 active:border-t-[#2d4415] active:border-l-[#2d4415] uppercase flex items-center gap-1 active:translate-y-1 shadow-md active:shadow-none"
                            >
                                <Plus className="w-5 h-5" /> Add
                            </button>
                        </div>
                      </div>

                      <button
                           onClick={() => setCalories(0)}
                           className="w-full mt-4 bg-mc-red border-4 border-t-[#ff5555] border-l-[#ff5555] border-b-[#550000] border-r-[#550000] p-2 text-white uppercase text-xl active:border-t-[#550000] active:border-l-[#550000] active:translate-y-1 shadow-md active:shadow-none"
                       >
                          Reset Intake
                       </button>
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};