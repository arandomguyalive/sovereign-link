'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useWindowManager, AppId } from '@/store/useWindowManager';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  id: AppId;
  title: string;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ id, title, children }) => {
  const { windows, closeWindow, focusWindow, activeWindow } = useWindowManager();
  const windowState = windows[id];

  if (!windowState.isOpen) return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      drag
      dragMomentum={false}
      onMouseDown={() => focusWindow(id)}
      style={{ zIndex: windowState.zIndex }}
      className={`absolute top-20 left-20 w-[600px] h-[400px] glass-panel flex flex-col rounded-lg overflow-hidden ${
        activeWindow === id ? 'border-neon-cyan/50 shadow-[0_0_20px_rgba(0,212,229,0.2)]' : 'border-white/10'
      }`}
    >
      {/* Title Bar */}
      <div className="h-8 bg-black/60 border-b border-white/10 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing">
        <span className={`text-[10px] uppercase tracking-widest font-bold ${
          activeWindow === id ? 'text-neon-cyan neon-text-cyan' : 'text-gray-500'
        }`}>
          {title}
        </span>
        <div className="flex gap-2">
          <button className="text-gray-500 hover:text-white transition-colors">
            <Minus size={14} />
          </button>
          <button className="text-gray-500 hover:text-white transition-colors">
            <Square size={12} />
          </button>
          <button 
            onClick={() => closeWindow(id)}
            className="text-gray-500 hover:text-neon-pink transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};
