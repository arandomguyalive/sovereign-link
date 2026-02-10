'use client';

import React, { useState, useRef, useEffect } from 'react';
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
        width: Math.max(300, newWidth), 
        height: Math.max(200, newHeight) 
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
        updateWindow(id, { x: windowState.x + info.offset.x, y: windowState.y + info.offset.y });
      }}
      animate={{ 
        width: windowState.width, 
        height: windowState.height,
        opacity: 1 
      }}
      style={{ zIndex: windowState.zIndex, position: 'absolute', top: windowState.y, left: windowState.x }}
      onMouseDown={() => focusWindow(id)}
      className={`glass-panel flex flex-col rounded-lg overflow-hidden select-none ${
        activeWindow === id ? 'border-neon-cyan/60 shadow-[0_0_30px_rgba(0,212,229,0.15)]' : 'border-white/5 opacity-80'
      }`}
    >
      {/* Title Bar */}
      <div 
        className="h-9 bg-black/80 border-b border-white/10 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${activeWindow === id ? 'bg-neon-cyan animate-pulse shadow-[0_0_5px_#00D4E5]' : 'bg-gray-600'}`} />
          <span className={`text-[10px] uppercase tracking-[0.2em] font-black ${
            activeWindow === id ? 'text-neon-cyan neon-text-cyan' : 'text-gray-500'
          }`}>
            {title}
          </span>
        </div>
        <div className="flex gap-3">
          <button className="text-gray-500 hover:text-white transition-colors"><Minus size={14} /></button>
          <button className="text-gray-500 hover:text-white transition-colors"><Maximize2 size={12} /></button>
          <button 
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="text-gray-500 hover:text-neon-pink transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-black/40 pointer-events-auto">
        {children}
        {isResizing && <div className="absolute inset-0 bg-neon-cyan/5 pointer-events-none border-2 border-neon-cyan/20" />}
      </div>

      {/* Resize Handles */}
      <div 
        onMouseDown={(e) => handleResize(e, 'e')}
        className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-neon-cyan/20 transition-colors z-[100]"
      />
      <div 
        onMouseDown={(e) => handleResize(e, 's')}
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-neon-cyan/20 transition-colors z-[100]"
      />
      <div 
        onMouseDown={(e) => handleResize(e, 'se')}
        className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize hover:bg-neon-cyan/40 bg-neon-cyan/5 rounded-tl-xl flex items-end justify-end p-0.5 z-[110] border-r-2 border-b-2 border-neon-cyan/30"
      >
        <div className="w-2 h-2 border-r border-b border-neon-cyan/60" />
      </div>
    </motion.div>
  );
};