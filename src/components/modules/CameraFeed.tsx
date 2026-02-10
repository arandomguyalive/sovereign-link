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

const FEEDS: Feed[] = [
  { id: 'DXB-C-01', source: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-1070-large.mp4', label: 'Dubai Marina // North Gate', location: 'Dubai, UAE', sector: 'GULF', meta: { ip: '192.168.4.12', protocol: 'RTSP', encryption: 'AES-256' } },
  { id: 'AUH-C-03', source: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-city-at-night-1075-large.mp4', label: 'Corniche // Abu Dhabi', location: 'Abu Dhabi, UAE', sector: 'GULF', meta: { ip: '192.168.9.102', protocol: 'ONVIF', encryption: 'None' } },
  { id: 'TKY-S-09', source: 'https://assets.mixkit.co/videos/preview/mixkit-busy-street-in-a-japanese-city-at-night-4100-large.mp4', label: 'Shibuya Crossing // South', location: 'Tokyo, Japan', sector: 'ASIA', meta: { ip: '172.16.0.4', protocol: 'RTSP', encryption: 'Sovereign-v2' } },
  { id: 'NYC-T-04', source: 'https://assets.mixkit.co/videos/preview/mixkit-times-square-at-night-with-bright-neon-signs-4102-large.mp4', label: 'Times Square // Sector 04', location: 'New York, USA', sector: 'WEST', meta: { ip: '10.0.5.99', protocol: 'RTSP', encryption: 'None' } },
  { id: 'LDN-B-12', source: 'https://assets.mixkit.co/videos/preview/mixkit-bridge-in-the-city-at-night-with-bright-lights-4103-large.mp4', label: 'London Bridge // East Gate', location: 'London, UK', sector: 'WEST', meta: { ip: '192.168.12.5', protocol: 'ONVIF', encryption: 'SSL/TLS' } },
  { id: 'SAT-L-09', source: 'https://assets.mixkit.co/videos/preview/mixkit-view-of-the-earth-from-space-4101-large.mp4', label: 'Low Orbit // Satellite Link', location: 'Orbital', sector: 'RECON', meta: { ip: '0.0.0.0', protocol: 'UPLINK', encryption: 'Quantum' } },
];

export const CameraFeed = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full bg-black" />;

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
        return p + 25;
      });
    }, 80);
  };

  return (
    <div className="h-full bg-black flex flex-col font-mono overflow-hidden pointer-events-auto select-none">
      <div className="flex-1 relative bg-zinc-950 overflow-hidden">
        <AnimatePresence mode="wait">
          {isIntercepting ? (
            <motion.div 
              key="intercept"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50"
            >
              <Crosshair size={40} className="text-neon-cyan animate-spin mb-4" />
              <div className="text-[10px] text-neon-cyan font-bold tracking-[0.5em] mb-4 uppercase">Intercepting_Uplink... {progress}%</div>
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
              <video 
                src={current.source}
                autoPlay loop muted playsInline
                key={current.source}
                className="w-full h-full object-cover grayscale contrast-[1.6] brightness-[0.7] sepia-[0.3]"
              />
              
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

      {/* Selector Grid */}
      <div className="h-28 bg-zinc-950 border-t border-white/10 p-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
        {FEEDS.map((f, idx) => (
          <button
            key={f.id}
            onClick={() => handleSwitch(idx)}
            className={`relative flex-shrink-0 w-44 h-full rounded border-2 transition-all overflow-hidden group ${
              activeIdx === idx ? 'border-neon-cyan shadow-[0_0_15px_rgba(0,212,229,0.3)]' : 'border-white/5 opacity-40 grayscale hover:opacity-100'
            }`}
          >
            <video src={f.source} muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 text-center z-10">
              <span className="text-[8px] text-white font-black uppercase tracking-tighter leading-tight mb-1">{f.label}</span>
              <span className="text-[6px] text-neon-cyan/80 font-bold tracking-[0.3em]">{f.id}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};