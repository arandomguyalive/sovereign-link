'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FEEDS = [
  { id: 'NYC-01', url: 'https://www.youtube.com/embed/1-iS7LArMPA?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Times Square // Sector 04' },
  { id: 'LDN-05', url: 'https://www.youtube.com/embed/Jm5S_E_U8yA?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'London Bridge // Sector 12' },
  { id: 'TKY-09', url: 'https://www.youtube.com/embed/V6fX6xWupW4?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Shibuya Crossing // Sector 01' },
  { id: 'DUB-15', url: 'https://www.youtube.com/embed/yv_YtP9XU6w?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Dubai Marina // Sector 22' },
];

export const CameraFeed = () => {
  const [activeFeed, setActiveFeed] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full bg-black flex flex-col p-1 gap-1">
      <div className="flex-1 relative overflow-hidden group">
        <iframe
          src={FEEDS[activeFeed].url}
          className="w-full h-full grayscale contrast-125 brightness-75 scale-110"
          frameBorder="0"
          allow="autoplay; encrypted-media"
        />
        
        {/* CCTV Overlays */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between border border-neon-cyan/20">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/80 font-bold bg-red-600 px-1 mb-1 w-fit animate-pulse">● REC</span>
              <span className="text-xs text-neon-cyan font-mono tracking-widest">{FEEDS[activeFeed].label}</span>
              <span className="text-[10px] text-white/50 font-mono">SIGNAL: 4k/60fps // ENCRYPTED</span>
            </div>
            <div className="text-right text-[10px] text-white/80 font-mono">
              {timestamp.toISOString().replace('T', ' ').substring(0, 19)}
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="w-16 h-16 border-l border-b border-white/40" />
            <div className="flex flex-col items-center">
              <div className="w-1 h-1 bg-red-500 rounded-full mb-2" />
              <span className="text-[8px] text-white/30 uppercase tracking-[0.3em]">AI_MOTION_DETECTED</span>
            </div>
            <div className="w-16 h-16 border-r border-b border-white/40" />
          </div>
        </div>

        {/* Scan effect overlay on the video */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1 w-full animate-[scan_4s_linear_infinite] pointer-events-none" />
      </div>

      {/* Thumbnails / Switcher */}
      <div className="h-16 grid grid-cols-4 gap-1">
        {FEEDS.map((feed, idx) => (
          <button
            key={feed.id}
            onClick={() => setActiveFeed(idx)}
            className={`relative overflow-hidden border ${
              activeFeed === idx ? 'border-neon-cyan shadow-[0_0_5px_rgba(0,212,229,0.5)]' : 'border-white/10 opacity-50'
            }`}
          >
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[8px] text-white/80 z-10">
              {feed.id}
            </div>
            <div className="w-full h-full bg-gray-900" />
          </button>
        ))}
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
      `}</style>
    </div>
  );
};
