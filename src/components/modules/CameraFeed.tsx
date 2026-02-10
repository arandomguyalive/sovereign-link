'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Database, Activity, Scan, Signal, Lock, Crosshair, AlertTriangle, RefreshCw } from 'lucide-react';

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

// Stable direct video links for Synthetic Surveillance
const FEEDS: Feed[] = [
  { id: 'DXB-C-01', source: 'https://cdn.pixabay.com/video/2021/08/13/84941-587424683_tiny.mp4', label: 'Dubai Marina // North Gate', location: 'Dubai, UAE', sector: 'GULF', meta: { ip: '192.168.4.12', protocol: 'RTSP', encryption: 'AES-256' } },
  { id: 'AUH-C-03', source: 'https://cdn.pixabay.com/video/2022/10/24/136323-764353787_tiny.mp4', label: 'Corniche // Abu Dhabi', location: 'Abu Dhabi, UAE', sector: 'GULF', meta: { ip: '192.168.9.102', protocol: 'ONVIF', encryption: 'None' } },
  { id: 'TKY-S-09', source: 'https://cdn.pixabay.com/video/2021/04/10/70654-536965825_tiny.mp4', label: 'Shibuya Crossing // South', location: 'Tokyo, Japan', sector: 'ASIA', meta: { ip: '172.16.0.4', protocol: 'RTSP', encryption: 'Sovereign-v2' } },
  { id: 'SEL-G-04', source: 'https://cdn.pixabay.com/video/2020/06/19/42557-432292850_tiny.mp4', label: 'Gangnam Dist // Sector 04', location: 'Seoul, Korea', sector: 'ASIA', meta: { ip: '192.168.12.5', protocol: 'HTTP-FLV', encryption: 'SSL/TLS' } },
  { id: 'NYC-T-04', source: 'https://cdn.pixabay.com/video/2017/08/17/11383-228941706_tiny.mp4', label: 'Times Square // Sector 04', location: 'New York, USA', sector: 'WEST', meta: { ip: '10.0.5.99', protocol: 'RTSP', encryption: 'None' } },
  { id: 'LDN-B-12', source: 'https://cdn.pixabay.com/video/2019/11/14/29161-374705574_tiny.mp4', label: 'London Bridge // East Gate', location: 'London, UK', sector: 'WEST', meta: { ip: '192.168.12.5', protocol: 'ONVIF', encryption: 'SSL/TLS' } },
  { id: 'SAT-L-09', source: 'https://cdn.pixabay.com/video/2019/04/23/23011-332356501_tiny.mp4', label: 'Low Orbit // Satellite Link', location: 'Orbital', sector: 'RECON', meta: { ip: '0.0.0.0', protocol: 'Sovereign-Uplink', encryption: 'Quantum' } },
];

export const CameraFeed = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sectorFilter, setSectorFilter] = useState<Feed['sector'] | 'ALL'>('ALL');
  const [timestamp, setTimestamp] = useState('');
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimestamp(new Date().toISOString().replace('T', ' ').substring(0, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (mounted && videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked
        });
      }
    }
  }, [activeIdx, mounted]);

  if (!mounted) return <div className="h-full bg-black" />;

  const filteredFeeds = sectorFilter === 'ALL' 
    ? FEEDS 
    : FEEDS.filter(f => f.sector === sectorFilter);

  const handleSwitch = (id: string) => {
    const targetIdx = FEEDS.findIndex(f => f.id === id);
    if (targetIdx === activeIdx) return;
    
    setHasError(false);
    setIsIntercepting(true);
    
    setTimeout(() => {
      setActiveIdx(targetIdx);
      setIsIntercepting(false);
    }, 1200);
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
              <div className="text-[10px] text-neon-cyan font-bold tracking-[0.5em] mb-4">ESTABLISHING_ENCRYPTED_UPLINK...</div>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1 }}
                  className="h-full bg-neon-cyan shadow-[0_0:15px_#00D4E5]" 
                />
              </div>
            </motion.div>
          ) : hasError ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-40"
            >
              <AlertTriangle size={40} className="text-neon-pink mb-4" />
              <div className="text-[11px] text-neon-pink font-black uppercase tracking-[0.3em]">Signal Interrupted // Error 404</div>
              <button 
                onClick={() => setHasError(false)}
                className="mt-6 px-4 py-2 border border-neon-cyan text-neon-cyan text-[10px] uppercase font-bold hover:bg-neon-cyan/10 transition-all z-10"
              >
                Attempt Recovery
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full relative"
            >
              <video 
                ref={videoRef}
                src={current.source}
                autoPlay loop muted playsInline
                onError={() => setHasError(true)}
                className="w-full h-full object-cover grayscale contrast-[1.6] brightness-[0.7] sepia-[0.3]"
              />
              
              {/* Tactical Overlays */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-3">
                    <div className="bg-black/70 backdrop-blur-xl p-4 border-l-4 border-neon-cyan rounded-r-lg shadow-2xl">
                      <div className="text-[11px] text-red-500 font-black flex items-center gap-2 mb-2">
                        <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" /> REC: {current.id}
                      </div>
                      <div className="text-lg text-white font-black tracking-[0.2em] uppercase leading-none">{current.label}</div>
                      <div className="text-[10px] text-neon-cyan/80 font-bold uppercase tracking-[0.3em] mt-2">
                        LOC: {current.location} // {current.meta.protocol}
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/60 backdrop-blur-xl p-4 border border-white/10 rounded-lg text-right flex flex-col items-end shadow-2xl">
                    <div className="text-lg text-neon-cyan font-black mb-1 font-mono tracking-tighter">
                      {timestamp}
                    </div>
                    <div className="text-[9px] text-white/40 tracking-[0.3em] font-black uppercase">Channel: Tactical-01</div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-24 h-24 border-l-2 border-b-2 border-white/20 rounded-bl-[30px]" />
                  <div className="flex flex-col items-center mb-6">
                     <div className="text-[10px] text-neon-cyan/40 mb-3 uppercase tracking-[1em] font-black animate-pulse">Scanning_Entities</div>
                     <div className="flex gap-1.5 items-end h-6">
                        {[...Array(8)].map((_, i) => (
                          <motion.div 
                            key={i} 
                            animate={{ height: [4, 16, 6, 20, 8] }}
                            transition={{ duration: Math.random() * 1.5 + 0.5, repeat: Infinity }}
                            className="w-1 bg-neon-cyan/40" 
                          />
                        ))}
                     </div>
                  </div>
                  <div className="w-24 h-24 border-r-2 border-b-2 border-white/20 rounded-br-[30px]" />
                </div>
              </div>

              {/* Scanline Overlay */}
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
              current.id === f.id ? 'border-neon-cyan shadow-[0_0_20px_rgba(0,212,229,0.4)]' : 'border-white/5 opacity-40 grayscale hover:opacity-100'
            }`}
          >
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 text-center z-10">
              <span className="text-[9px] text-white font-black uppercase tracking-widest leading-tight mb-1">{f.label}</span>
              <span className="text-[7px] text-neon-cyan/80 font-bold tracking-[0.3em]">{f.id}</span>
            </div>
            <div className="w-full h-full bg-zinc-900" />
          </button>
        ))}
      </div>
    </div>
  );
};
