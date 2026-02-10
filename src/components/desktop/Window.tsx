'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useWindowManager, AppId } from '@/store/useWindowManager';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

interface WindowProps {
  id: AppId;
  title: string;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ id, title, children }) => {
  const { windows, closeWindow, focusWindow, activeWindow, updateWindow } = useWindowManager();
  const win = windows[id];
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!win.isOpen) return null;

  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Don't drag if clicking controls
    if ((e.target as HTMLElement).closest('.window-control')) return;

    setIsDragging(true);
    focusWindow(id);
    
    const startX = e.clientX - win.x;
    const startY = e.clientY - win.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateWindow(id, { 
        x: moveEvent.clientX - startX, 
        y: moveEvent.clientY - startY 
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = win.width;
    const startHeight = win.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      updateWindow(id, { 
        width: Math.max(400, startWidth + (moveEvent.clientX - startX)), 
        height: Math.max(300, startHeight + (moveEvent.clientY - startY)) 
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const toggleMaximize = () => {
    if (win.isMaximized) {
      updateWindow(id, { isMaximized: false, width: 800, height: 500, x: 100, y: 100 });
    } else {
      updateWindow(id, { isMaximized: true, width: window.innerWidth, height: window.innerHeight - 40, x: 0, y: 0 });
    }
  };

  return (
    <div
      onMouseDown={() => focusWindow(id)}
      className={`absolute flex flex-col rounded-xl overflow-hidden pointer-events-auto border shadow-2xl transition-[border-color,box-shadow] duration-200 ${
        activeWindow === id ? 'border-neon-cyan/50 ring-1 ring-neon-cyan/20 z-[600]' : 'border-white/10 z-[500] opacity-90'
      } ${win.isMaximized ? 'rounded-none' : ''}`}
      style={{
        left: win.isMaximized ? 0 : win.x,
        top: win.isMaximized ? 0 : win.y,
        width: win.isMaximized ? '100vw' : win.width,
        height: win.isMaximized ? 'calc(100vh - 40px)' : win.height,
        backgroundColor: 'rgba(5, 5, 5, 0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Title Bar */}
      <div 
        onMouseDown={startDrag}
        className="h-11 bg-zinc-900 border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${activeWindow === id ? 'bg-neon-cyan animate-pulse shadow-[0_0_8px_#00D4E5]' : 'bg-zinc-700'}`} />
          <span className={`text-[11px] uppercase tracking-[0.3em] font-black ${
            activeWindow === id ? 'text-neon-cyan' : 'text-zinc-500'
          }`}>
            {title}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="window-control text-zinc-500 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded"
          >
            <Minus size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
            className="window-control text-zinc-500 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded"
          >
            <Maximize2 size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
            className="window-control text-zinc-500 hover:text-neon-pink transition-colors p-1.5 hover:bg-neon-pink/10 rounded"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Resize Handle - Only show if not maximized */}
      {!win.isMaximized && (
        <div 
          onMouseDown={startResize}
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 z-[100]"
        >
          <div className="w-3 h-3 border-r-2 border-b-2 border-neon-cyan/30" />
        </div>
      )}
    </div>
  );
};