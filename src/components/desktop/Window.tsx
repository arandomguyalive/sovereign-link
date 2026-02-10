'use client';

import React, { useState, useCallback } from 'react';
import { useWindowManager, AppId } from '@/store/useWindowManager';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  id: AppId;
  title: string;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ id, title, children }) => {
  const { windows, closeWindow, focusWindow, activeWindow, updateWindow } = useWindowManager();
  const win = windows[id];
  const [dragState, setDragState] = useState<{ startX: number; startY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ startWidth: number; startHeight: number; startX: number; startY: number } | null>(null);

  if (!win.isOpen) return null;

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (dragState) {
      updateWindow(id, {
        x: e.clientX - dragState.startX,
        y: e.clientY - dragState.startY,
      });
    } else if (resizeState) {
      updateWindow(id, {
        width: Math.max(400, resizeState.startWidth + (e.clientX - resizeState.startX)),
        height: Math.max(300, resizeState.startHeight + (e.clientY - resizeState.startY)),
      });
    }
  }, [dragState, resizeState, id, updateWindow]);

  const onMouseUp = useCallback(() => {
    setDragState(null);
    setResizeState(null);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }, [onMouseMove]);

  const startDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    focusWindow(id);
    setDragState({ startX: e.clientX - win.x, startY: e.clientY - win.y });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizeState({ startWidth: win.width, startHeight: win.height, startX: e.clientX, startY: e.clientY });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      onMouseDown={() => focusWindow(id)}
      className={`absolute flex flex-col rounded-xl overflow-hidden pointer-events-auto border shadow-2xl transition-[border-color,box-shadow] duration-200 ${
        activeWindow === id ? 'border-neon-cyan/50 ring-1 ring-neon-cyan/20 z-[600]' : 'border-white/10 z-[500] opacity-90'
      }`}
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        backgroundColor: 'rgba(5, 5, 5, 0.85)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Title Bar */}
      <div 
        onMouseDown={startDrag}
        className="h-11 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${activeWindow === id ? 'bg-neon-cyan animate-pulse shadow-[0_0_8px_#00D4E5]' : 'bg-zinc-700'}`} />
          <span className={`text-[11px] uppercase tracking-[0.3em] font-black ${
            activeWindow === id ? 'text-neon-cyan' : 'text-zinc-500'
          }`}>
            {title}
          </span>
        </div>
        <div className="flex gap-4">
          <button className="text-zinc-500 hover:text-white transition-colors"><Minus size={16} /></button>
          <button className="text-zinc-500 hover:text-white transition-colors"><Square size={14} /></button>
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
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Resize Handle */}
      <div 
        onMouseDown={startResize}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 z-[100]"
      >
        <div className="w-3 h-3 border-r-2 border-b-2 border-neon-cyan/30" />
      </div>
    </div>
  );
};