'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!windowState.isOpen) return null;

  const handleDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    focusWindow(id);
    
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateWindow(id, { 
        x: moveEvent.clientX - startX, 
        y: moveEvent.clientY - startY 
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
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
    <div
      style={{ 
        zIndex: windowState.zIndex, 
        position: 'absolute',
        top: windowState.y,
        left: windowState.x,
        width: windowState.width,
        height: windowState.height,
        transition: isDragging || isResizing ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseDown={() => focusWindow(id)}
      className={`glass-panel flex flex-col rounded-xl overflow-hidden select-none pointer-events-auto border shadow-[0_30px_60px_rgba(0,0,0,0.5)] ${
        activeWindow === id ? 'border-neon-cyan/50 ring-1 ring-neon-cyan/20' : 'border-white/10 opacity-90'
      }`}
    >
      {/* Title Bar */}
      <div 
        className="h-11 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${activeWindow === id ? 'bg-neon-cyan shadow-[0_0_10px_#00D4E5]' : 'bg-zinc-700'}`} />
          <span className={`text-[11px] uppercase tracking-[0.3em] font-black ${
            activeWindow === id ? 'text-neon-cyan' : 'text-zinc-500'
          }`}>
            {title}
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <button className="text-zinc-500 hover:text-white transition-colors p-1"><Minus size={16} /></button>
          <button className="text-zinc-500 hover:text-white transition-colors p-1"><Square size={14} /></button>
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="text-zinc-500 hover:text-neon-pink transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-black/40 pointer-events-auto">
        {children}
        {(isDragging || isResizing) && <div className="absolute inset-0 bg-neon-cyan/5 pointer-events-none" />}
      </div>

      {/* Resize Controls */}
      <div onMouseDown={(e) => handleResizeStart(e, 'e')} className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-neon-cyan/10 z-[100]" />
      <div onMouseDown={(e) => handleResizeStart(e, 's')} className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-neon-cyan/10 z-[100]" />
      <div onMouseDown={(e) => handleResizeStart(e, 'se')} className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 z-[110] group">
        <div className="w-3 h-3 border-r-2 border-b-2 border-neon-cyan/30 group-hover:border-neon-cyan/80 transition-colors" />
      </div>
    </div>
  );
};
