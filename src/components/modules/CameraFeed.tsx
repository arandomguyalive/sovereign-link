'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Database, Activity, Scan, Signal, Lock, Crosshair } from 'lucide-react';

interface Feed {
  id: string;
  source: string;
  label: string;
  location: string;
  type: 'YOUTUBE' | 'VIDEO';
  meta: {
    ip: string;
    protocol: string;
    encryption: string;
  }
}

const FEEDS: Feed[] = [
  { id: 'MAK-LIVE', source: '3_Xp1431YpI', label: 'Masjid al-Haram // Kaaba', location: 'Makkah, KSA', type: 'YOUTUBE', meta: { ip: '10.0.8.44', protocol: 'RTSP', encryption: 'Sovereign-v1' } },
  { id: 'DXB-SURV', source: 'https://cdn.coverr.co/videos/preview/720/coverr-busy-city-traffic-in-dubai-at-night-8461.mp4', label: 'Dubai Marina // South', location: 'Dubai, UAE', type: 'VIDEO', meta: { ip: '192.168.4.12', protocol: 'HTTP-FLV', encryption: 'AES-256' } },
  { id: 'TKY-RECON', source: 'HpdO5Kq3o7Y', label: 'Shibuya Crossing // South', location: 'Tokyo, Japan', type: 'YOUTUBE', meta: { ip: '172.16.0.4', protocol: 'RTSP', encryption: 'Sovereign-v2' } },
  { id: 'NYC-TACT', source: '1-iS7LArMPA', label: 'Times Square // Sector 04', location: 'New York, USA', type: 'YOUTUBE', meta: { ip: '10.0.5.99', protocol: 'RTSP', encryption: 'None' } },
  { id: 'ORB-LINK', source: 'https://cdn.coverr.co/videos/preview/720/coverr-view-of-earth-from-space-8451.mp4', label: 'Orbital Satellite // Link', location: 'Low Orbit', type: 'VIDEO', meta: { ip: '0.0.0.0', protocol: 'UPLINK', encryption: 'Quantum' } },
];

export const CameraFeed = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [progress, setProgress] = useState(0);

  const current = FEEDS[activeIdx];

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
      {/* Viewport */}
      <div className="flex-1 relative bg-zinc-950 overflow-hidden">
        <AnimatePresence mode="wait">
          {isIntercepting ? (
            <motion.div 
              key="intercept"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50"
            >
              <Crosshair size={40} className="text-neon-cyan animate-spin mb-4" />
              <div className="text-[10px] text-neon-cyan font-bold tracking-[0.5em] mb-4 uppercase">Synchronizing_Uplink... {progress}%</div>
              <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-neon-cyan shadow-[0_0_15px_#00D4E5]" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full relative"
            >
              {current.type === 'YOUTUBE' ? (
                <iframe
                  src={`https://www.youtube.com/embed/${current.source}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3`}
                  className="w-full h-full grayscale contrast-[1.5] brightness-[0.7] scale-[1.15] pointer-events-none"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <video 
                  src={current.source}
                  autoPlay loop muted playsInline
                  className="w-full h-full object-cover grayscale contrast-[1.6] brightness-[0.7] sepia-[0.3]"
                />
              )}
              
              {/* Overlays */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="bg-black/70 backdrop-blur-xl p-4 border-l-4 border-neon-cyan rounded-r-lg">
                    <div className="text-[11px] text-red-500 font-black flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> LIVE_RECON: {current.id}
                    </div>
                    <div className="text-lg text-white font-black tracking-widest uppercase">{current.label}</div>
                    <div className="text-[10px] text-neon-cyan/80 font-bold uppercase mt-1">LOC: {current.location}</div>
                  </div>
                  <div className="bg-black/60 backdrop-blur-xl p-4 border border-white/10 rounded-lg text-right">
                    <div className="text-sm text-neon-cyan font-black mb-1">{new Date().toLocaleTimeString()}</div>
                    <div className="text-[8px] text-white/40 tracking-widest uppercase font-bold">Enc: {current.meta.encryption}</div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-24 h-24 border-l-2 border-b-2 border-white/20 rounded-bl-[30px]" />
                  <div className="flex flex-col items-center">
                     <div className="text-[10px] text-neon-cyan/40 mb-3 uppercase tracking-[1em] font-black">Scanning...</div>
                     <div className="flex gap-1 items-end h-6">
                        {[...Array(8)].map((_, i) => (
                          <motion.div key={i} animate={{ height: [4, 16, 6, 20, 8] }} transition={{ duration: 1 + Math.random(), repeat: Infinity }} className="w-1 bg-neon-cyan/30" />
                        ))}
                     </div>
                  </div>
                  <div className="w-24 h-24 border-r-2 border-b-2 border-white/20 rounded-br-[30px]" />
                </div>
              </div>

              {/* Scanline / Grain Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,2px_100%]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selector */}
      <div className="h-32 bg-zinc-950 border-t border-white/10 p-3 flex gap-3 overflow-x-auto scrollbar-hide shrink-0">
        {FEEDS.map((f, idx) => (
          <button
            key={f.id}
            onClick={() => handleSwitch(idx)}
            className={`relative flex-shrink-0 w-48 h-full rounded-lg border-2 transition-all overflow-hidden group ${
              activeIdx === idx ? 'border-neon-cyan shadow-[0_0_20px_rgba(0,212,229,0.4)]' : 'border-white/5 opacity-40 grayscale hover:opacity-100'
            }`}
          >
            {f.type === 'VIDEO' ? (
              <video src={f.source} muted className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <Signal size={24} className="text-white/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 text-center">
              <span className="text-[10px] text-white font-black uppercase tracking-tighter leading-tight mb-1">{f.label}</span>
              <span className="text-[7px] text-neon-cyan/80 font-bold tracking-widest">{f.id}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
