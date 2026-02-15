import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ServerShoutProps {
  message: string | null;
}

export const ServerShout: React.FC<ServerShoutProps> = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] pointer-events-none"
        >
          <div className="bg-[#000000aa] border border-[#555] px-4 py-2 rounded-sm font-pixel text-yellow-300 text-shadow-lg flex items-center gap-2">
             <span className="text-white text-lg">!</span>
             <span className="text-lg tracking-wide">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};