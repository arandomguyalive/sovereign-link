'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Database, Activity, Scan, AlertCircle } from 'lucide-react';

interface Feed {
  id: string;
  source: string; // Video source or simulated ID
  label: string;
  location: string;
  type: 'SIMULATED' | 'LIVE';
  meta: {
    ip: string;
    protocol: string;
    encryption: string;
  }
}

const FEEDS: Feed[] = [
  { id: 'DXB-MAIN-01', source: 'https://cdn.pixabay.com/video/2021/08/13/84941-587424683_tiny.mp4', label: 'Dubai Marina // Bridge Entrance', location: 'Dubai, UAE', type: 'SIMULATED', meta: { ip: '192.168.4.12', protocol: 'RTSP', encryption: 'AES-256' } },
  { id: 'NYC-TS-04', source: 'https://cdn.pixabay.com/video/2020/06/19/42557-432292850_tiny.mp4', label: 'Times Square // Sector 04', location: 'New York, USA', type: 'SIMULATED', meta: { ip: '10.0.5.99', protocol: 'HTTP-FLV', encryption: 'None' } },
  { id: 'TKY-SH-09', source: 'https://cdn.pixabay.com/video/2021/04/10/70654-536965825_tiny.mp4', label: 'Shibuya Crossing // South', location: 'Tokyo, Japan', type: 'SIMULATED', meta: { ip: '172.16.0.4', protocol: 'RTSP', encryption: 'Sovereign-v2' } },
  { id: 'LON-BR-12', source: 'https://cdn.pixabay.com/video/2019/11/14/29161-374705574_tiny.mp4', label: 'London Bridge // East Gate', location: 'London, UK', type: 'SIMULATED', meta: { ip: '192.168.12.5', protocol: 'ONVIF', encryption: 'SSL/TLS' } },
];

export const CameraFeed = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date());
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const current = FEEDS[activeIdx];

  const handleSwitch = (idx: number) => {
    setIsIntercepting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveIdx(idx);
          setIsIntercepting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  return (
    <div className="h-full bg-black flex flex-col font-mono overflow-hidden">
      {/* Simulation Header */}
      <div className="h-8 bg-zinc-900 border-b border-white/5 flex items-center justify-between px-3 text-[8px] tracking-widest uppercase">
        <div className="flex gap-4">
          <span className="text-neon-cyan flex items-center gap-1"><Shield size={10} /> Neural-Link Stable</span>
          <span className="text-white/40">Encryption: {current.meta.encryption}</span>
        </div>
        <div className="flex gap-2 text-emerald-400 font-bold">
          <Activity size={10} className="animate-pulse" /> UPLINK: {current.meta.ip}
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative bg-black overflow-hidden group">
        <AnimatePresence mode="wait">
          {isIntercepting ? (
            <motion.div 
              key="intercept"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-50"
            >
              <Scan size={40} className="text-neon-cyan animate-spin mb-4" />
              <div className="text-[10px] text-neon-cyan mb-2">INTERCEPTING HANDSHAKE... {progress}%</div>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-neon-cyan" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={current.id}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              className="w-full h-full"
            >
              <video 
                src={current.source}
                autoPlay loop muted playsInline
                className="w-full h-full object-cover grayscale contrast-150 brightness-75 sepia-[0.2] scale-105"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Realism Overlays */}
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="bg-black/40 backdrop-blur-md p-2 border border-white/10 rounded">
              <div className="text-[10px] text-red-500 font-black flex items-center gap-1 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full" /> LIVE FEED: {current.id}
              </div>
              <div className="text-xs text-white font-bold tracking-widest mt-1 uppercase">{current.label}</div>
              <div className="text-[8px] text-white/50 mt-0.5">{current.location} // {current.meta.protocol}</div>
            </div>
            <div className="bg-black/40 backdrop-blur-md p-2 border border-white/10 rounded text-right">
              <div className="text-[12px] text-neon-cyan font-bold leading-none mb-1">
                {timestamp.toISOString().replace('T', ' ').substring(0, 19)}
              </div>
              <div className="text-[8px] text-white/40 uppercase tracking-widest font-black">Bitrate: 8.2 Mbps</div>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-white/10">
                <Eye size={12} className="text-neon-cyan" />
                <span className="text-[8px] text-white/80 uppercase">Detected Entities: {Math.floor(Math.random() * 10) + 2}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-white/10">
                <Database size={12} className="text-neon-cyan" />
                <span className="text-[8px] text-white/80 uppercase">Storage: RAID-0 // Local</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-[8px] text-white/20 uppercase tracking-[0.5em] mb-4">God-Eye Security Solutions v4.0</div>
              <div className="flex gap-1 justify-end">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-0.5 h-3 bg-white/10" style={{ height: Math.random() * 12 + 4 + 'px' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1 w-full animate-[scan_4s_linear_infinite] pointer-events-none" />
      </div>

      {/* Sidebar Selector */}
      <div className="h-20 bg-zinc-950 border-t border-white/10 flex items-center p-2 gap-2 overflow-x-auto scrollbar-hide">
        {FEEDS.map((f, i) => (
          <button
            key={f.id}
            onClick={() => handleSwitch(i)}
            className={`relative flex-shrink-0 w-32 h-14 rounded border transition-all overflow-hidden group ${
              activeIdx === i ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,212,229,0.3)]' : 'border-white/5 opacity-50 grayscale hover:opacity-100'
            }`}
          >
            <video src={f.source} muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
              <span className="text-[7px] text-white font-bold text-center uppercase tracking-tighter">{f.id}</span>
            </div>
          </button>
        ))}
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(800%); }
        }
      `}</style>
    </div>
  );
};