'use client';

import React, { useState, useCallback, useRef } from 'react';
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
  const windowRef = useRef<HTMLDivElement>(null);

  if (!win.isOpen) return null;

  const startDrag = (e: React.PointerEvent) => {
    // Only handle primary pointer (left click or single touch)
    if (!e.isPrimary) return;
    const target = e.target as HTMLElement;
    if (target.closest('button')) return; 

    focusWindow(id);
    
    const startX = e.clientX - win.x;
    const startY = e.clientY - win.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      updateWindow(id, { 
        x: moveEvent.clientX - startX, 
        y: moveEvent.clientY - startY 
      });
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = win.width;
    const startHeight = win.height;

    const onPointerMove = (moveEvent: PointerEvent) => {
      updateWindow(id, { 
        width: Math.max(Math.min(window.innerWidth - 20, 400), startWidth + (moveEvent.clientX - startX)), 
        height: Math.max(300, startHeight + (moveEvent.clientY - startY)) 
      });
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div
      ref={windowRef}
      onPointerDown={() => focusWindow(id)}
      className={`absolute flex flex-col rounded-xl overflow-hidden pointer-events-auto border shadow-2xl transition-[border-color,box-shadow] duration-200 ${
        activeWindow === id ? 'border-neon-cyan/50 ring-1 ring-neon-cyan/20 z-[600]' : 'border-white/10 z-[500] opacity-90'
      }`}
      style={{
        left: win.isMaximized ? 0 : win.x,
        top: win.isMaximized ? 0 : win.y,
        width: win.isMaximized ? '100vw' : Math.min(win.width, window.innerWidth - 20),
        height: win.isMaximized ? 'calc(100vh - 40px)' : win.height,
        backgroundColor: 'rgba(5, 5, 5, 0.9)',
        backdropFilter: 'blur(16px)',
        touchAction: 'none' // Prevents scrolling while dragging
      }}
    >
      {/* Title Bar */}
      <div 
        onPointerDown={startDrag}
        className="h-11 bg-zinc-900/95 border-b border-white/10 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className="flex items-center gap-3 pointer-events-none">
          <div className={`w-2 h-2 rounded-full ${activeWindow === id ? 'bg-neon-cyan animate-pulse shadow-[0_0_8px_#00D4E5]' : 'bg-zinc-700'}`} />
          <span className={`text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black truncate max-w-[150px] ${
            activeWindow === id ? 'text-neon-cyan' : 'text-zinc-500'
          }`}>
            {title}
          </span>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button className="text-zinc-500 hover:text-white transition-colors p-1"><Minus size={16} /></button>
          <button className="text-zinc-500 hover:text-white transition-colors p-1"><Square size={14} /></button>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
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
      {!win.isMaximized && (
        <div 
          onPointerDown={startResize}
          className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize flex items-end justify-end p-2 z-[100]"
        >
          <div className="w-4 h-4 border-r-2 border-b-2 border-neon-cyan/30" />
        </div>
      )}
    </div>
  );
};
