import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskCategory } from '../types';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'user_id' | 'is_complete'>) => void;
  initialData?: Task;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.HOMEWORK);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      const d = new Date(initialData.due_date);
      setDate(d.toISOString().split('T')[0]);
      setTime(d.toTimeString().slice(0, 5));
      setCategory(initialData.category);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('23:59');
    setCategory(TaskCategory.HOMEWORK);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = new Date(`${date}T${time}`).toISOString();
    onSubmit({
      title,
      description,
      due_date: dateTime,
      category,
    });
    onClose();
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
            className="fixed inset-0 bg-black/80 z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4 font-pixel">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-lg bg-[#c6c6c6] border-4 border-t-white border-l-white border-r-[#555] border-b-[#555] shadow-2xl pointer-events-auto"
            >
              <div className="p-1">
                <div className="flex justify-between items-center mb-4 bg-[#8b8b8b] p-2 border-2 border-b-white border-r-white border-t-[#555] border-l-[#555] inset-shadow">
                  <h2 className="text-2xl text-[#e0e0e0] drop-shadow-md">
                    {initialData ? 'Reforge Task' : 'Craft Task'}
                  </h2>
                  <button onClick={onClose} className="text-[#e0e0e0] hover:text-white bg-[#555] p-1 border border-white hover:bg-mc-red">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                  <div>
                    <label className="block text-lg text-[#333] mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-[#8b8b8b] border-2 border-r-white border-b-white border-t-[#333] border-l-[#333] px-3 py-2 text-white focus:outline-none focus:bg-[#555] placeholder-gray-400 text-xl"
                      placeholder="Quest Name..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-lg text-[#333] mb-1">Due Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-[#8b8b8b] border-2 border-r-white border-b-white border-t-[#333] border-l-[#333] px-3 py-2 text-white focus:outline-none focus:bg-[#555] [color-scheme:dark]"
                            required
                        />
                     </div>
                     <div>
                        <label className="block text-lg text-[#333] mb-1">Due Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                            className="w-full bg-[#8b8b8b] border-2 border-r-white border-b-white border-t-[#333] border-l-[#333] px-3 py-2 text-white focus:outline-none focus:bg-[#555] [color-scheme:dark]"
                            required
                        />
                     </div>
                  </div>

                  <div>
                    <label className="block text-lg text-[#333] mb-1">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as TaskCategory)}
                      className="w-full bg-[#8b8b8b] border-2 border-r-white border-b-white border-t-[#333] border-l-[#333] px-3 py-2 text-white focus:outline-none focus:bg-[#555]"
                    >
                      {Object.values(TaskCategory).map(cat => (
                        <option key={cat} value={cat} className="bg-[#333]">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg text-[#333] mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[#8b8b8b] border-2 border-r-white border-b-white border-t-[#333] border-l-[#333] px-3 py-2 text-white focus:outline-none focus:bg-[#555] resize-none text-lg"
                      placeholder="Lore..."
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 bg-[#8b8b8b] border-t-2 border-l-2 border-[#fff] border-b-2 border-r-2 border-[#333] text-white active:border-t-[#333] active:border-l-[#333]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-mc-green border-t-2 border-l-2 border-[#83d656] border-b-2 border-r-2 border-[#2d4415] text-white shadow-md active:border-t-[#2d4415] active:border-l-[#2d4415] active:translate-y-1"
                    >
                      {initialData ? 'Update' : 'Craft'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
