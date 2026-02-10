'use client';

import React, { useState, useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useWindowManager, AppId } from '@/store/useWindowManager';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

interface WindowProps {
  id: AppId;
  title: string;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ id, title, children }) => {
  const { windows, closeWindow, focusWindow, activeWindow, updateWindow } = useWindowManager();
  const windowState = windows[id];
  const dragControls = useDragControls();
  const [isResizing, setIsResizing] = useState(false);

  if (!windowState.isOpen) return null;

  const handleResize = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowState.width;
    const startHeight = windowState.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) newWidth = startWidth + (moveEvent.clientX - startX);
      if (direction.includes('s')) newHeight = startHeight + (moveEvent.clientY - startY);

      updateWindow(id, { 
        width: Math.max(400, newWidth), 
        height: Math.max(300, newHeight) 
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <motion.div
      initial={false}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        updateWindow(id, { 
          x: windowState.x + info.offset.x, 
          y: windowState.y + info.offset.y 
        });
      }}
      animate={{ 
        width: windowState.width, 
        height: windowState.height,
        x: windowState.x,
        y: windowState.y,
        opacity: 1 
      }}
      style={{ 
        zIndex: windowState.zIndex, 
        position: 'absolute',
        left: 0,
        top: 0
      }}
      onMouseDown={() => focusWindow(id)}
      className={`glass-panel flex flex-col rounded-lg overflow-hidden select-none pointer-events-auto shadow-2xl ${
        activeWindow === id ? 'border-neon-cyan/50 ring-1 ring-neon-cyan/20' : 'border-white/5 opacity-90'
      }`}
    >
      {/* Title Bar */}
      <div 
        className="h-10 bg-black/90 border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={(e) => {
          focusWindow(id);
          dragControls.start(e);
        }}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${activeWindow === id ? 'bg-neon-cyan shadow-[0_0_8px_#00D4E5]' : 'bg-zinc-700'}`} />
          <span className={`text-[11px] uppercase tracking-[0.3em] font-black ${
            activeWindow === id ? 'text-neon-cyan neon-text-cyan' : 'text-zinc-500'
          }`}>
            {title}
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <button className="text-zinc-500 hover:text-white transition-colors"><Minus size={16} /></button>
          <button className="text-zinc-500 hover:text-white transition-colors"><Maximize2 size={14} /></button>
          <button 
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="text-zinc-500 hover:text-neon-pink transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-black/20 pointer-events-auto">
        {children}
        {isResizing && <div className="absolute inset-0 bg-neon-cyan/5 pointer-events-none border-2 border-neon-cyan/20 backdrop-blur-[1px]" />}
      </div>

      {/* Resize Handles */}
      <div 
        onMouseDown={(e) => handleResize(e, 'e')}
        className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-neon-cyan/10 transition-colors z-[100]"
      />
      <div 
        onMouseDown={(e) => handleResize(e, 's')}
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-neon-cyan/10 transition-colors z-[100]"
      />
      <div 
        onMouseDown={(e) => handleResize(e, 'se')}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize hover:bg-neon-cyan/30 bg-neon-cyan/5 rounded-tl-2xl flex items-end justify-end p-1 z-[110] border-r-2 border-b-2 border-neon-cyan/20"
      >
        <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-neon-cyan/40" />
      </div>
    </motion.div>
  );
};
