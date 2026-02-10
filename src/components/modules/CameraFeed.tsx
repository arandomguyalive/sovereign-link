'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Database, Activity, Scan, Signal, Lock, Crosshair } from 'lucide-react';

interface Feed {
  id: string;
  source: string;
  label: string;
  location: string;
  sector: 'GULF' | 'ASIA' | 'WEST' | 'RECON';
  meta: {
    ip: string;
    protocol: string;
    encryption: string;
  }
}

// Using high-reliability CDN video loops for the Synthetic Surveillance engine.
const FEEDS: Feed[] = [
  { id: 'DXB-C-01', source: 'https://cdn.coverr.co/videos/preview/720/coverr-busy-city-traffic-in-dubai-at-night-8461.mp4', label: 'Dubai Marina // North Gate', location: 'Dubai, UAE', sector: 'GULF', meta: { ip: '192.168.4.12', protocol: 'RTSP', encryption: 'AES-256' } },
  { id: 'MAK-H-01', source: 'https://cdn.coverr.co/videos/preview/720/coverr-crowd-of-people-walking-in-a-market-5259.mp4', label: 'Masjid al-Haram // Entrance', location: 'Makkah, KSA', sector: 'GULF', meta: { ip: '10.0.8.44', protocol: 'HTTP-FLV', encryption: 'Sovereign-v1' } },
  { id: 'DXB-B-09', source: 'https://cdn.coverr.co/videos/preview/720/coverr-dubai-skyline-at-night-8463.mp4', label: 'Burj Khalifa // Elevator Bay', location: 'Dubai, UAE', sector: 'GULF', meta: { ip: '10.10.1.1', protocol: 'RTSP', encryption: 'RSA-4096' } },
  { id: 'TKY-S-09', source: 'https://cdn.coverr.co/videos/preview/720/coverr-street-in-tokyo-at-night-1563.mp4', label: 'Shibuya Crossing // South', location: 'Tokyo, Japan', sector: 'ASIA', meta: { ip: '172.16.0.4', protocol: 'RTSP', encryption: 'Sovereign-v2' } },
  { id: 'NYC-T-04', source: 'https://cdn.coverr.co/videos/preview/720/coverr-times-square-at-night-5452.mp4', label: 'Times Square // Sector 04', location: 'New York, USA', sector: 'WEST', meta: { ip: '10.0.5.99', protocol: 'RTSP', encryption: 'None' } },
  { id: 'LDN-B-12', source: 'https://cdn.coverr.co/videos/preview/720/coverr-london-bridge-and-traffic-at-night-2637.mp4', label: 'London Bridge // East Gate', location: 'London, UK', sector: 'WEST', meta: { ip: '192.168.12.5', protocol: 'ONVIF', encryption: 'SSL/TLS' } },
  { id: 'SAT-L-09', source: 'https://cdn.coverr.co/videos/preview/720/coverr-view-of-earth-from-space-8451.mp4', label: 'Low Orbit // Satellite Link', location: 'Orbital', sector: 'RECON', meta: { ip: '0.0.0.0', protocol: 'Sovereign-Uplink', encryption: 'Quantum' } },
];

export const CameraFeed = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sectorFilter, setSectorFilter] = useState<Feed['sector'] | 'ALL'>('ALL');
  const [timestamp, setTimestamp] = useState(new Date());
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredFeeds = sectorFilter === 'ALL' 
    ? FEEDS 
    : FEEDS.filter(f => f.sector === sectorFilter);

  const handleSwitch = (id: string) => {
    const targetIdx = FEEDS.findIndex(f => f.id === id);
    if (targetIdx === activeIdx) return;
    
    setIsIntercepting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveIdx(targetIdx);
          setIsIntercepting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 50);
  };

  const current = FEEDS[activeIdx];

  return (
    <div className="h-full bg-black flex flex-col font-mono overflow-hidden pointer-events-auto select-none">
      {/* Sector Bar */}
      <div className="h-10 bg-zinc-900 border-b border-white/10 flex items-center px-2 gap-1 overflow-x-auto scrollbar-hide shrink-0">
        {['ALL', 'GULF', 'ASIA', 'WEST', 'RECON'].map((s) => (
          <button
            key={s}
            onClick={() => setSectorFilter(s as any)}
            className={`px-3 py-1 rounded text-[9px] uppercase tracking-widest transition-all ${
              sectorFilter === s ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' : 'text-white/40 border border-transparent hover:border-white/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative bg-zinc-950 overflow-hidden">
        <AnimatePresence mode="wait">
          {isIntercepting ? (
            <motion.div 
              key="intercept"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50"
            >
              <Crosshair size={40} className="text-neon-cyan animate-spin mb-4" />
              <div className="text-[10px] text-neon-cyan font-bold tracking-[0.5em] mb-4">UPLINK_SYNCHRONIZING... {progress}%</div>
              <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-neon-cyan shadow-[0_0_15px_#00D4E5]" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={current.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full relative"
            >
              <video 
                src={current.source}
                autoPlay loop muted playsInline
                key={current.source}
                className="w-full h-full object-cover grayscale contrast-[1.6] brightness-[0.7] sepia-[0.3]"
              />
              
              {/* Data Overlay Layer */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-3">
                    <div className="bg-black/60 backdrop-blur-xl p-4 border-l-4 border-neon-cyan rounded-r-lg shadow-2xl">
                      <div className="text-[11px] text-red-500 font-black flex items-center gap-2 mb-2">
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" /> LIVE_RECON: {current.id}
                      </div>
                      <div className="text-lg text-white font-black tracking-[0.2em] uppercase leading-none">{current.label}</div>
                      <div className="text-[10px] text-neon-cyan/80 font-bold uppercase tracking-[0.3em] mt-2">
                        LOC: {current.location} // {current.meta.protocol}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded flex items-center gap-2">
                        <Signal size={14} className="text-emerald-400" />
                        <span className="text-[9px] text-white/80 font-bold uppercase tracking-widest">Signal: Stable</span>
                      </div>
                      <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded flex items-center gap-2">
                        <Lock size={14} className="text-neon-cyan" />
                        <span className="text-[9px] text-white/80 font-bold uppercase tracking-widest">{current.meta.encryption}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/60 backdrop-blur-xl p-4 border border-white/10 rounded-lg text-right flex flex-col items-end shadow-2xl">
                    <div className="text-lg text-neon-cyan font-black mb-1 font-mono tracking-tighter">
                      {timestamp.toISOString().replace('T', ' ').substring(0, 19)}
                    </div>
                    <div className="text-[9px] text-white/40 tracking-[0.3em] font-black uppercase">Channel: Tactical-01</div>
                    <div className="mt-6 flex flex-col gap-1 items-end">
                       <span className="text-[8px] text-neon-cyan/40 uppercase tracking-[0.5em] font-bold">Bitrate_Buffer</span>
                       <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: ['20%', '80%', '40%', '90%', '60%'] }} 
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="h-full bg-neon-cyan/60 shadow-[0_0_10px_#00D4E5]" 
                          />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-28 h-28 border-l-4 border-b-4 border-white/20 rounded-bl-[40px]" />
                  <div className="flex flex-col items-center mb-6">
                     <div className="text-[11px] text-neon-cyan/40 mb-3 uppercase tracking-[1em] font-black animate-pulse">Scanning_Entities</div>
                     <div className="flex gap-1.5 items-end h-8">
                        {[...Array(12)].map((_, i) => (
                          <motion.div 
                            key={i} 
                            animate={{ height: [4, 20, 8, 28, 12] }}
                            transition={{ duration: Math.random() * 1.5 + 0.5, repeat: Infinity }}
                            className="w-1.5 bg-neon-cyan/40 rounded-t-sm" 
                          />
                        ))}
                     </div>
                  </div>
                  <div className="w-28 h-28 border-r-4 border-b-4 border-white/20 rounded-br-[40px]" />
                </div>
              </div>

              {/* CRT Scanline / Noise Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,2px_100%]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selector Grid */}
      <div className="h-32 bg-zinc-950 border-t border-white/10 p-3 flex gap-3 overflow-x-auto scrollbar-hide shrink-0">
        {filteredFeeds.map((f) => (
          <button
            key={f.id}
            onClick={() => handleSwitch(f.id)}
            className={`relative flex-shrink-0 w-48 h-full rounded-lg border-2 transition-all overflow-hidden group ${
              current.id === f.id ? 'border-neon-cyan shadow-[0_0_20px_rgba(0,212,229,0.4)]' : 'border-white/5 opacity-40 grayscale hover:opacity-100 hover:border-white/20'
            }`}
          >
            <video src={f.source} muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center p-3 text-center">
              <span className="text-[9px] text-white font-black uppercase tracking-widest leading-tight mb-1">{f.label}</span>
              <span className="text-[7px] text-neon-cyan/80 font-bold tracking-[0.3em]">{f.id}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
