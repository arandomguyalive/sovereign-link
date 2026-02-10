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
  const windowRef = useRef<HTMLDivElement>(null);

  if (!windowState.isOpen) return null;

  const handleResize = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
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
        width: Math.max(350, newWidth), 
        height: Math.max(250, newHeight) 
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <motion.div
      ref={windowRef}
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
        top: 0,
        left: 0
      }}
      onMouseDown={() => focusWindow(id)}
      className={`glass-panel flex flex-col rounded-lg overflow-hidden select-none pointer-events-auto border shadow-2xl ${
        activeWindow === id ? 'border-neon-cyan/50 ring-1 ring-neon-cyan/10' : 'border-white/10 opacity-90'
      }`}
    >
      {/* Title Bar - Drag Handle */}
      <div 
        className="h-10 bg-black/90 border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={(e) => {
          focusWindow(id);
          dragControls.start(e);
        }}
      >
        <div className="flex items-center gap-3 pointer-events-none">
          <div className={`w-2 h-2 rounded-full ${activeWindow === id ? 'bg-neon-cyan shadow-[0_0_8px_#00D4E5]' : 'bg-zinc-700'}`} />
          <span className={`text-[11px] uppercase tracking-[0.3em] font-black ${
            activeWindow === id ? 'text-neon-cyan' : 'text-zinc-500'
          }`}>
            {title}
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <button className="text-zinc-500 hover:text-white transition-colors"><Minus size={16} /></button>
          <button className="text-zinc-500 hover:text-white transition-colors"><Maximize2 size={14} /></button>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="text-zinc-500 hover:text-neon-pink transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-black/40 pointer-events-auto">
        {children}
      </div>

      {/* Resize Handles */}
      <div 
        onMouseDown={(e) => handleResize(e, 'e')}
        className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-neon-cyan/20 transition-colors z-[50]"
      />
      <div 
        onMouseDown={(e) => handleResize(e, 's')}
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-neon-cyan/20 transition-colors z-[50]"
      />
      <div 
        onMouseDown={(e) => handleResize(e, 'se')}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize hover:bg-neon-cyan/40 bg-neon-cyan/5 flex items-end justify-end p-1 z-[60] border-r-2 border-b-2 border-neon-cyan/30"
      >
        <div className="w-3 h-3 border-r-2 border-b-2 border-neon-cyan/50" />
      </div>
    </motion.div>
  );
};