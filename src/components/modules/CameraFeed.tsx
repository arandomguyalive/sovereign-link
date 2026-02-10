'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Database, Activity, Scan, Signal, Lock, Crosshair, AlertTriangle } from 'lucide-react';

interface Feed {
  id: string;
  videoId: string; // YouTube ID for maximum reliability
  label: string;
  location: string;
  sector: 'GULF' | 'ASIA' | 'WEST' | 'RECON';
  meta: {
    ip: string;
    protocol: string;
    encryption: string;
  }
}

const FEEDS: Feed[] = [
  { id: 'MAK-H-01', videoId: '3_Xp1431YpI', label: 'Masjid al-Haram // Holy Kaaba', location: 'Makkah, KSA', sector: 'GULF', meta: { ip: '10.0.8.44', protocol: 'RTSP', encryption: 'Sovereign-v1' } },
  { id: 'DXB-M-04', videoId: 'yv_YtP9XU6w', label: 'Dubai Marina // South Gate', location: 'Dubai, UAE', sector: 'GULF', meta: { ip: '192.168.4.12', protocol: 'HTTP-FLV', encryption: 'AES-256' } },
  { id: 'TKY-S-09', videoId: 'HpdO5Kq3o7Y', label: 'Shibuya Crossing // South', location: 'Tokyo, Japan', sector: 'ASIA', meta: { ip: '172.16.0.4', protocol: 'RTSP', encryption: 'Sovereign-v2' } },
  { id: 'NYC-T-04', videoId: '1-iS7LArMPA', label: 'Times Square // Sector 04', location: 'New York, USA', sector: 'WEST', meta: { ip: '10.0.5.99', protocol: 'RTSP', encryption: 'None' } },
  { id: 'DOH-S-01', videoId: 'qM_S93S9XpI', label: 'Doha Skyline // West Bay', location: 'Doha, Qatar', sector: 'GULF', meta: { ip: '10.5.0.1', protocol: 'ONVIF', encryption: 'SSL/TLS' } },
  { id: 'SAT-L-09', videoId: 'EEIk7gwjgIM', label: 'Low Orbit // Satellite Link', location: 'Orbital', sector: 'RECON', meta: { ip: '0.0.0.0', protocol: 'Sovereign-Uplink', encryption: 'Quantum' } },
];

export const CameraFeed = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sectorFilter, setSectorFilter] = useState<Feed['sector'] | 'ALL'>('ALL');
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full bg-black" />;

  const current = FEEDS[activeIdx];
  const filteredFeeds = sectorFilter === 'ALL' ? FEEDS : FEEDS.filter(f => f.sector === sectorFilter);

  const handleSwitch = (idx: number) => {
    if (idx === activeIdx) return;
    setIsIntercepting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setActiveIdx(idx);
          setIsIntercepting(false);
          return 100;
        }
        return p + 20;
      });
    }, 100);
  };

  return (
    <div className="h-full bg-black flex flex-col font-mono overflow-hidden pointer-events-auto">
      {/* Sector Bar */}
      <div className="h-10 bg-zinc-900 border-b border-white/10 flex items-center px-2 gap-1 overflow-x-auto scrollbar-hide shrink-0">
        {['ALL', 'GULF', 'ASIA', 'WEST', 'RECON'].map((s) => (
          <button
            key={s}
            onClick={() => setSectorFilter(s as any)}
            className={`px-3 py-1 rounded text-[9px] uppercase tracking-widest transition-all ${
              sectorFilter === s ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_10px_rgba(0,212,229,0.2)]' : 'text-white/40 border border-transparent hover:border-white/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Viewport */}
      <div className="flex-1 relative bg-zinc-950 overflow-hidden group">
        {/* Static Noise Background (Visible during transition or load) */}
        <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3o7TKSj0N0C0/giphy.gif')] opacity-10 bg-cover mix-blend-screen" />

        <AnimatePresence mode="wait">
          {isIntercepting ? (
            <motion.div 
              key="intercept"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50"
            >
              <Crosshair size={40} className="text-neon-cyan animate-spin mb-4" />
              <div className="text-[10px] text-neon-cyan font-bold tracking-[0.5em] mb-4 uppercase">Intercepting_Uplink... {progress}%</div>
              <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-neon-cyan shadow-[0_0_15px_#00D4E5]" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={current.videoId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full relative"
            >
              <iframe
                src={`https://www.youtube.com/embed/${current.videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`}
                className="w-full h-full grayscale contrast-[1.5] brightness-[0.7] scale-[1.15] pointer-events-none"
                frameBorder="0"
                allow="autoplay; encrypted-media"
              />
              
              {/* Tactical Overlays */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10 border border-neon-cyan/10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-3">
                    <div className="bg-black/70 backdrop-blur-xl p-4 border-l-4 border-neon-cyan rounded-r-lg shadow-2xl">
                      <div className="text-[11px] text-red-500 font-black flex items-center gap-2 mb-2">
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" /> LIVE_RECON: {current.id}
                      </div>
                      <div className="text-lg text-white font-black tracking-[0.2em] uppercase leading-none">{current.label}</div>
                      <div className="text-[10px] text-neon-cyan/80 font-bold uppercase tracking-[0.3em] mt-2">
                        LOC: {current.location} // SEC: {current.sector}
                      </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 border border-white/10 rounded-full w-fit flex items-center gap-2">
                      <Signal size={12} className="text-emerald-400" />
                      <span className="text-[8px] text-white/60 font-bold tracking-widest">UPLINK: STABLE_V3</span>
                    </div>
                  </div>
                  <div className="bg-black/60 backdrop-blur-xl p-4 border border-white/10 rounded-lg text-right shadow-2xl">
                    <div className="text-sm text-neon-cyan font-black mb-1 font-mono">{new Date().toISOString().substring(11, 19)}</div>
                    <div className="text-[8px] text-white/40 tracking-[0.2em] font-black uppercase">Channel: Tactical-01</div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-24 h-24 border-l-2 border-b-2 border-white/20 rounded-bl-[30px]" />
                  <div className="flex flex-col items-center mb-6">
                     <div className="text-[10px] text-neon-cyan/40 mb-3 uppercase tracking-[1em] font-black">Scanning_Entities</div>
                     <div className="flex gap-1.5 items-end h-6">
                        {[...Array(10)].map((_, i) => (
                          <motion.div key={i} animate={{ height: [4, 16, 6, 20, 8] }} transition={{ duration: 1 + Math.random(), repeat: Infinity }} className="w-1 bg-neon-cyan/30" />
                        ))}
                     </div>
                  </div>
                  <div className="w-24 h-24 border-r-2 border-b-2 border-white/20 rounded-br-[30px]" />
                </div>
              </div>

              {/* Scanline Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,2px_100%]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selector Grid */}
      <div className="h-28 bg-zinc-950 border-t border-white/10 p-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
        {filteredFeeds.map((f, idx) => (
          <button
            key={f.id}
            onClick={() => handleSwitch(FEEDS.findIndex(x => x.id === f.id))}
            className={`relative flex-shrink-0 w-44 h-full rounded border-2 transition-all overflow-hidden group ${
              current.id === f.id ? 'border-neon-cyan shadow-[0_0_15px_rgba(0,212,229,0.3)]' : 'border-white/5 opacity-40 grayscale hover:opacity-100'
            }`}
          >
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 text-center z-10">
              <span className="text-[8px] text-white font-black uppercase tracking-widest leading-tight mb-1">{f.label}</span>
              <span className="text-[6px] text-neon-cyan/80 font-bold tracking-[0.3em]">{f.id}</span>
            </div>
            <img src={`https://img.youtube.com/vi/${f.videoId}/mqdefault.jpg`} className="w-full h-full object-cover opacity-30" />
          </button>
        ))}
      </div>
    </div>
  );
};