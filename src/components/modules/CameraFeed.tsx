'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, Shield, Zap, AlertTriangle } from 'lucide-react';

interface Feed {
  id: string;
  url: string;
  label: string;
  sector: 'GULF' | 'ASIA' | 'WEST' | 'RECON';
  location: string;
}

const FEEDS: Feed[] = [
  // GULF SECTOR
  { id: 'MAK-01', url: 'https://www.youtube.com/embed/yv_YtP9XU6w?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Masjid al-Haram // Makkah', sector: 'GULF', location: 'Saudi Arabia' },
  { id: 'DXB-04', url: 'https://www.youtube.com/embed/7SInMv-vE_o?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Dubai Marina // Sector 22', sector: 'GULF', location: 'UAE' },
  { id: 'AUH-03', url: 'https://www.youtube.com/embed/fD_6-m0O0-0?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Corniche // Abu Dhabi', sector: 'GULF', location: 'UAE' },

  // ASIA SECTOR
  { id: 'TKY-01', url: 'https://www.youtube.com/embed/HpdO5Kq3o7Y?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Shibuya Crossing // Sector 01', sector: 'ASIA', location: 'Japan' },
  { id: 'SEL-02', url: 'https://www.youtube.com/embed/V6fX6xWupW4?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Gangnam Dist // Sector 04', sector: 'ASIA', location: 'S. Korea' },

  // WEST SECTOR
  { id: 'NYC-01', url: 'https://www.youtube.com/embed/1-iS7LArMPA?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Times Square // Sector 04', sector: 'WEST', location: 'USA' },
  { id: 'LDN-05', url: 'https://www.youtube.com/embed/Jm5S_E_U8yA?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'London Bridge // Sector 12', sector: 'WEST', location: 'UK' },
  { id: 'LVG-07', url: 'https://www.youtube.com/embed/3xyUa6yQslA?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'The Strip // Sector 21', sector: 'WEST', location: 'USA' },

  // RECON SECTOR
  { id: 'SAT-09', url: 'https://www.youtube.com/embed/EEIk7gwjgIM?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Low Orbit // Satellite Link', sector: 'RECON', location: 'Orbital' },
];

export const CameraFeed = () => {
  const [activeFeed, setActiveFeed] = useState(0);
  const [sectorFilter, setSectorFilter] = useState<Feed['sector'] | 'ALL'>('ALL');
  const [timestamp, setTimestamp] = useState(new Date());
  const [hasError, setHasError] = useState(false);

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
              setHasError(false);
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
      <div className="flex-1 relative overflow-hidden glass-panel rounded-lg group bg-zinc-950">
        <AnimatePresence mode="wait">
          {!hasError ? (
            <motion.div
              key={filteredFeeds[activeFeed]?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative"
            >
              {/* YouTube Iframe with Error Detection simulation */}
              <iframe
                src={`${filteredFeeds[activeFeed]?.url}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                className="w-full h-full grayscale contrast-[1.3] brightness-[0.8] scale-[1.05] sepia-[0.1]"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                title={filteredFeeds[activeFeed]?.label}
              />
              
              {/* Scanline / Grain Overlay for realism */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.15] bg-[url('https://media.giphy.com/media/oEI9uWUicG5R6/giphy.gif')] mix-blend-screen" />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 border border-neon-pink/30"
            >
              <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3o7TKSj0N0C0/giphy.gif')] opacity-20 bg-cover mix-blend-overlay" />
              <AlertTriangle size={48} className="text-neon-pink mb-4 animate-pulse z-10" />
              <h2 className="text-xl font-bold text-neon-pink uppercase tracking-[0.3em] z-10 neon-text-pink">Signal Interrupted</h2>
              <p className="text-[10px] text-white/40 mt-2 font-mono uppercase tracking-[0.1em] z-10">Uplink Lost // Handshake Failed // Proxy Timeout</p>
              <button 
                onClick={() => setHasError(false)}
                className="mt-6 px-4 py-1 border border-neon-cyan text-neon-cyan text-[8px] uppercase tracking-widest hover:bg-neon-cyan/20 transition-all z-10"
              >
                Re-establish Connection
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* CCTV Overlays (Always Visible) */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between border border-neon-cyan/10 z-20">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white font-black bg-red-600 px-1.5 py-0.5 rounded-sm animate-pulse flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" /> {hasError ? 'LOST' : 'LIVE'}
                </span>
                <span className="text-[10px] text-neon-cyan font-mono tracking-widest bg-black/60 px-2 py-0.5 rounded border border-neon-cyan/30 backdrop-blur-sm">
                  ID: {filteredFeeds[activeFeed]?.id} // {filteredFeeds[activeFeed]?.location}
                </span>
              </div>
              <span className="text-xs text-white/90 font-mono tracking-widest mt-1 neon-text-cyan uppercase bg-black/40 px-2 w-fit">
                {filteredFeeds[activeFeed]?.label}
              </span>
            </div>
            <div className="text-right flex flex-col items-end font-mono bg-black/40 p-1 px-2 rounded">
              <span className="text-[12px] text-neon-cyan font-bold tracking-tighter">
                {timestamp.toISOString().replace('T', ' ').substring(0, 19)}
              </span>
              <span className={`text-[8px] uppercase tracking-[0.3em] ${hasError ? 'text-neon-pink' : 'text-emerald-400'}`}>
                Uplink: {hasError ? 'FAILED' : 'STABLE (98.4%)'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="w-16 h-16 border-l-2 border-b-2 border-white/20" />
            <div className="flex flex-col items-center">
              <div className="flex gap-4 mb-2">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-neon-cyan/60 mb-1 font-bold">ZOOM</span>
                  <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-cyan w-1/3 shadow-[0_0_10px_rgba(0,212,229,0.8)]" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-neon-cyan/60 mb-1 font-bold">FOCUS</span>
                  <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-cyan w-2/3 shadow-[0_0_10px_rgba(0,212,229,0.8)]" />
                  </div>
                </div>
              </div>
              <span className="text-[8px] text-white/30 uppercase tracking-[0.5em] animate-pulse">Sovereign_Deep_Scan_v4.2</span>
            </div>
            <div className="w-16 h-16 border-r-2 border-b-2 border-white/20" />
          </div>
        </div>

        {/* Scan Bar Effect */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-neon-cyan/30 shadow-[0_0_15px_rgba(0,212,229,0.5)] animate-[scan_6s_linear_infinite] pointer-events-none z-30" />
      </div>

      {/* Thumbnails Grid */}
      <div className="h-20 grid grid-cols-5 gap-1 overflow-y-auto pr-1 scrollbar-hide">
        {filteredFeeds.map((feed, idx) => (
          <button
            key={feed.id}
            onClick={() => {
              setActiveFeed(idx);
              setHasError(false);
            }}
            className={`relative group h-full overflow-hidden rounded border transition-all ${
              activeFeed === idx 
                ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,212,229,0.4)] scale-[0.98]' 
                : 'border-white/5 opacity-50 hover:opacity-100 hover:border-white/20'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            <div className="absolute bottom-1 left-1 z-20 flex flex-col text-left">
              <span className="text-[7px] text-white font-black tracking-tighter opacity-80">{feed.id}</span>
            </div>
            {/* Visual representation of a camera feed placeholder */}
            <div className="w-full h-full bg-zinc-900 group-hover:scale-110 transition-transform flex items-center justify-center">
               <MapPin size={12} className="text-white/10" />
            </div>
          </button>
        ))}
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: -5%; }
          100% { top: 105%; }
        }
      `}</style>
    </div>
  );
};
