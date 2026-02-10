'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, Shield, Zap, ChevronDown } from 'lucide-react';

interface Feed {
  id: string;
  url: string;
  label: string;
  sector: 'GULF' | 'ASIA' | 'WEST' | 'RECON';
  location: string;
}

const FEEDS: Feed[] = [
  // GULF SECTOR
  { id: 'MAK-01', url: 'https://www.youtube.com/embed/3_Xp1431YpI?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Masjid al-Haram // Makkah', sector: 'GULF', location: 'Saudi Arabia' },
  { id: 'MAD-02', url: 'https://www.youtube.com/embed/fD_6-m0O0-0?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Masjid al-Nabawi // Madinah', sector: 'GULF', location: 'Saudi Arabia' },
  { id: 'DXB-04', url: 'https://www.youtube.com/embed/yv_YtP9XU6w?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Dubai Marina // Sector 22', sector: 'GULF', location: 'UAE' },
  { id: 'DOH-01', url: 'https://www.youtube.com/embed/qM_S93S9XpI?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Doha Skyline // West Bay', sector: 'GULF', location: 'Qatar' },
  { id: 'AUH-03', url: 'https://www.youtube.com/embed/J7_J7_J7_J7?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Corniche // Abu Dhabi', sector: 'GULF', location: 'UAE' },

  // ASIA SECTOR
  { id: 'TKY-01', url: 'https://www.youtube.com/embed/HpdO5Kq3o7Y?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Shibuya Crossing // Sector 01', sector: 'ASIA', location: 'Japan' },
  { id: 'OSA-05', url: 'https://www.youtube.com/embed/V6fX6xWupW4?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Dotonbori // Sector 09', sector: 'ASIA', location: 'Japan' },
  { id: 'SEL-02', url: 'https://www.youtube.com/embed/p1_p1_p1_p1?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Gangnam Dist // Sector 04', sector: 'ASIA', location: 'S. Korea' },

  // WEST SECTOR
  { id: 'NYC-01', url: 'https://www.youtube.com/embed/1-iS7LArMPA?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Times Square // Sector 04', sector: 'WEST', location: 'USA' },
  { id: 'LDN-05', url: 'https://www.youtube.com/embed/Jm5S_E_U8yA?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'London Bridge // Sector 12', sector: 'WEST', location: 'UK' },
  { id: 'VNC-02', url: 'https://www.youtube.com/embed/ph1vpnYDQp0?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Grand Canal // Sector 08', sector: 'WEST', location: 'Italy' },
  { id: 'LVG-07', url: 'https://www.youtube.com/embed/reXp6yYJ1E?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'The Strip // Sector 21', sector: 'WEST', location: 'USA' },

  // RECON SECTOR
  { id: 'SAT-09', url: 'https://www.youtube.com/embed/EEIk7gwjgIM?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Low Orbit // Satellite Link', sector: 'RECON', location: 'Orbital' },
  { id: 'SEA-01', url: 'https://www.youtube.com/embed/d3_d3_d3_d3?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Bosphorus // Naval Gate', sector: 'RECON', location: 'Turkey' },
];

export const CameraFeed = () => {
  const [activeFeed, setActiveFeed] = useState(0);
  const [sectorFilter, setSectorFilter] = useState<Feed['sector'] | 'ALL'>('ALL');
  const [timestamp, setTimestamp] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredFeeds = sectorFilter === 'ALL' 
    ? FEEDS 
    : FEEDS.filter(f => f.sector === sectorFilter);

  return (
    <div className="h-full bg-black flex flex-col p-2 gap-2 overflow-hidden">
      {/* Sector Navigation */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {['ALL', 'GULF', 'ASIA', 'WEST', 'RECON'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setSectorFilter(s as any);
              setActiveFeed(0);
            }}
            className={`px-3 py-1 rounded-sm text-[8px] uppercase tracking-[0.2em] transition-all border ${
              sectorFilter === s 
                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,212,229,0.3)]' 
                : 'border-white/5 text-gray-500 hover:border-white/20'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main Feed */}
      <div className="flex-1 relative overflow-hidden glass-panel rounded-lg group">
        <AnimatePresence mode="wait">
          <motion.div
            key={filteredFeeds[activeFeed]?.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <iframe
              src={filteredFeeds[activeFeed]?.url}
              className="w-full h-full grayscale contrast-[1.2] brightness-[0.7] scale-[1.02] sepia-[0.1]"
              frameBorder="0"
              allow="autoplay; encrypted-media"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* CCTV Overlays */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between border border-neon-cyan/10">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white font-black bg-red-600 px-1.5 py-0.5 rounded-sm animate-pulse flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                </span>
                <span className="text-[10px] text-neon-cyan font-mono tracking-widest bg-black/60 px-2 py-0.5 rounded border border-neon-cyan/30">
                  ID: {filteredFeeds[activeFeed]?.id} // {filteredFeeds[activeFeed]?.location}
                </span>
              </div>
              <span className="text-xs text-white/90 font-mono tracking-widest mt-1 neon-text-cyan uppercase">
                {filteredFeeds[activeFeed]?.label}
              </span>
            </div>
            <div className="text-right flex flex-col items-end font-mono">
              <span className="text-[12px] text-neon-cyan font-bold tracking-tighter">
                {timestamp.toISOString().replace('T', ' ').substring(0, 19)}
              </span>
              <span className="text-[8px] text-white/40 uppercase tracking-[0.3em]">Uplink: STABLE (98.4%)</span>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="w-16 h-16 border-l-2 border-b-2 border-white/20" />
            <div className="flex flex-col items-center">
              <div className="flex gap-4 mb-2">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-neon-cyan/60 mb-1">ZOOM</span>
                  <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-cyan w-1/3 shadow-[0_0_10px_rgba(0,212,229,0.8)]" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-neon-cyan/60 mb-1">FOCUS</span>
                  <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-cyan w-2/3 shadow-[0_0_10px_rgba(0,212,229,0.8)]" />
                  </div>
                </div>
              </div>
              <span className="text-[8px] text-white/30 uppercase tracking-[0.5em] animate-pulse">Sovereign_Deep_Scan_Active</span>
            </div>
            <div className="w-16 h-16 border-r-2 border-b-2 border-white/20" />
          </div>
        </div>

        {/* Dynamic Static/Glitch Overlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://media.giphy.com/media/oEI9uWUicG5R6/giphy.gif')] mix-blend-screen" />
      </div>

      {/* Thumbnails Grid */}
      <div className="h-20 grid grid-cols-5 gap-1 overflow-y-auto pr-1">
        {filteredFeeds.map((feed, idx) => (
          <button
            key={feed.id}
            onClick={() => setActiveFeed(idx)}
            className={`relative group h-full overflow-hidden rounded border transition-all ${
              activeFeed === idx 
                ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,212,229,0.4)] scale-[0.98]' 
                : 'border-white/5 opacity-50 hover:opacity-100 hover:border-white/20'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
            <div className="absolute bottom-1 left-1 z-20 flex flex-col text-left">
              <span className="text-[7px] text-white font-black tracking-tighter opacity-80">{feed.id}</span>
            </div>
            <div className="w-full h-full bg-gray-900 group-hover:scale-110 transition-transform" />
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