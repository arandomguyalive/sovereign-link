'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Database, Activity, Scan, AlertCircle, Wifi, Signal, Lock } from 'lucide-react';

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
    signal: number;
  }
}

const FEEDS: Feed[] = [
  // GULF SECTOR - Dubai, Saudi, Abu Dhabi
  { id: 'DXB-C-01', source: 'https://cdn.pixabay.com/video/2021/08/13/84941-587424683_tiny.mp4', label: 'Dubai Marina // North Gate', location: 'Dubai, UAE', sector: 'GULF', meta: { ip: '192.168.4.12', protocol: 'RTSP', encryption: 'AES-256', signal: 98 } },
  { id: 'MAK-H-01', source: 'https://www.youtube.com/embed/yv_YtP9XU6w?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Masjid al-Haram // Kaaba', location: 'Makkah, KSA', sector: 'GULF', meta: { ip: '10.0.8.44', protocol: 'HTTP-FLV', encryption: 'Sovereign-v1', signal: 99 } },
  { id: 'MAD-N-02', source: 'https://www.youtube.com/embed/fD_6-m0O0-0?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Masjid al-Nabawi // Gate 15', location: 'Madinah, KSA', sector: 'GULF', meta: { ip: '10.0.8.45', protocol: 'HTTP-FLV', encryption: 'Sovereign-v1', signal: 97 } },
  { id: 'AUH-C-03', source: 'https://cdn.pixabay.com/video/2022/10/24/136323-764353787_tiny.mp4', label: 'Abu Dhabi // Corniche East', location: 'Abu Dhabi, UAE', sector: 'GULF', meta: { ip: '192.168.9.102', protocol: 'ONVIF', encryption: 'None', signal: 82 } },
  { id: 'RIY-B-05', source: 'https://cdn.pixabay.com/video/2021/11/02/94318-644455823_tiny.mp4', label: 'Riyadh // Kingdom Centre', location: 'Riyadh, KSA', sector: 'GULF', meta: { ip: '172.16.4.55', protocol: 'RTSP', encryption: 'AES-128', signal: 91 } },
  { id: 'DXB-B-09', source: 'https://cdn.pixabay.com/video/2018/06/07/16631-274801126_tiny.mp4', label: 'Burj Khalifa // Observation', location: 'Dubai, UAE', sector: 'GULF', meta: { ip: '10.10.1.1', protocol: 'RTSP', encryption: 'RSA-4096', signal: 100 } },

  // ASIA SECTOR
  { id: 'TKY-S-09', source: 'https://cdn.pixabay.com/video/2021/04/10/70654-536965825_tiny.mp4', label: 'Shibuya Crossing // South', location: 'Tokyo, Japan', sector: 'ASIA', meta: { ip: '172.16.0.4', protocol: 'RTSP', encryption: 'Sovereign-v2', signal: 88 } },
  { id: 'SEL-G-04', source: 'https://cdn.pixabay.com/video/2020/06/19/42557-432292850_tiny.mp4', label: 'Gangnam Dist // Sector 04', location: 'Seoul, Korea', sector: 'ASIA', meta: { ip: '192.168.12.5', protocol: 'HTTP-FLV', encryption: 'SSL/TLS', signal: 94 } },
  { id: 'SIN-M-12', source: 'https://cdn.pixabay.com/video/2020/12/28/60167-497793838_tiny.mp4', label: 'Marina Bay // Sands Gate', location: 'Singapore', sector: 'ASIA', meta: { ip: '172.20.5.1', protocol: 'ONVIF', encryption: 'None', signal: 76 } },

  // WEST SECTOR
  { id: 'NYC-T-04', source: 'https://www.youtube.com/embed/1-iS7LArMPA?autoplay=1&mute=1&controls=0&modestbranding=1', label: 'Times Square // Sector 04', location: 'New York, USA', sector: 'WEST', meta: { ip: '10.0.5.99', protocol: 'RTSP', encryption: 'None', signal: 92 } },
  { id: 'LDN-B-12', source: 'https://cdn.pixabay.com/video/2019/11/14/29161-374705574_tiny.mp4', label: 'London Bridge // East Gate', location: 'London, UK', sector: 'WEST', meta: { ip: '192.168.12.5', protocol: 'ONVIF', encryption: 'SSL/TLS', signal: 85 } },
  { id: 'PAR-E-01', source: 'https://cdn.pixabay.com/video/2016/11/02/6211-189635031_tiny.mp4', label: 'Eiffel Tower // Champ de Mars', location: 'Paris, France', sector: 'WEST', meta: { ip: '192.168.1.10', protocol: 'RTSP', encryption: 'AES-128', signal: 89 } },

  // RECON SECTOR
  { id: 'SAT-L-09', source: 'https://cdn.pixabay.com/video/2019/04/23/23011-332356501_tiny.mp4', label: 'Low Orbit // Satellite Link', location: 'Orbital', sector: 'RECON', meta: { ip: '0.0.0.0', protocol: 'Sovereign-Uplink', encryption: 'Quantum', signal: 65 } },
  { id: 'SEA-G-01', source: 'https://cdn.pixabay.com/video/2022/07/16/124357-730620894_tiny.mp4', label: 'Bosphorus // Naval Gate', location: 'Istanbul, Turkey', sector: 'RECON', meta: { ip: '192.168.44.1', protocol: 'RTSP', encryption: 'None', signal: 72 } },
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
        return prev + 5;
      });
    }, 50);
  };

  const current = FEEDS[activeIdx];

  return (
    <div className="h-full bg-black flex flex-col font-mono overflow-hidden pointer-events-auto">
      {/* Sector Bar */}
      <div className="h-10 bg-zinc-900 border-b border-white/10 flex items-center px-2 gap-1 overflow-x-auto scrollbar-hide">
        {['ALL', 'GULF', 'ASIA', 'WEST', 'RECON'].map((s) => (
          <button
            key={s}
            onClick={() => setSectorFilter(s as any)}
            className={`px-3 py-1 rounded text-[8px] uppercase tracking-widest transition-all ${
              sectorFilter === s ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' : 'text-white/40 border border-transparent hover:border-white/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative bg-zinc-950 overflow-hidden group">
        <AnimatePresence mode="wait">
          {isIntercepting ? (
            <motion.div 
              key="intercept"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-50"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-2 border-neon-cyan/20 rounded-full animate-ping" />
                <div className="absolute inset-2 border-2 border-neon-cyan/40 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scan size={32} className="text-neon-cyan" />
                </div>
              </div>
              <div className="text-[10px] text-neon-cyan font-bold tracking-[0.4em] mb-4">BYPASSING_FIREWALL... {progress}%</div>
              <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-neon-cyan shadow-[0_0_10px_#00D4E5]" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full"
            >
              {current.source.includes('youtube') ? (
                <iframe
                  src={current.source}
                  className="w-full h-full grayscale contrast-[1.4] brightness-[0.7] scale-[1.1] pointer-events-none"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <video 
                  src={current.source}
                  autoPlay loop muted playsInline
                  className="w-full h-full object-cover grayscale contrast-[1.5] brightness-[0.8] scale-105"
                />
              )}
              
              {/* Data Overlay Layer */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="bg-black/60 backdrop-blur-md p-3 border-l-2 border-neon-cyan rounded-r-md">
                      <div className="text-[10px] text-red-500 font-black flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> REC: {current.id}
                      </div>
                      <div className="text-sm text-white font-black tracking-widest uppercase">{current.label}</div>
                      <div className="text-[9px] text-neon-cyan/60 font-bold uppercase tracking-widest mt-1">
                        LOC: {current.location} // SEC: {current.sector}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="bg-black/60 backdrop-blur-sm px-2 py-1 border border-white/10 rounded flex items-center gap-2">
                        <Signal size={12} className="text-emerald-400" />
                        <span className="text-[8px] text-white/60">SIGNAL: {current.meta.signal}%</span>
                      </div>
                      <div className="bg-black/60 backdrop-blur-sm px-2 py-1 border border-white/10 rounded flex items-center gap-2">
                        <Lock size={12} className="text-neon-cyan" size={10} />
                        <span className="text-[8px] text-white/60">{current.meta.encryption}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/60 backdrop-blur-md p-3 border border-white/10 rounded text-right flex flex-col items-end">
                    <div className="text-sm text-neon-cyan font-black mb-1 font-mono tracking-tighter">
                      {timestamp.toISOString().replace('T', ' ').substring(0, 19)}
                    </div>
                    <div className="text-[8px] text-white/40 tracking-[0.2em] font-bold">BITRATE: {(Math.random() * 5 + 4).toFixed(2)} MBPS</div>
                    <div className="mt-4 flex flex-col gap-1 items-end">
                       <span className="text-[7px] text-white/20 uppercase tracking-[0.5em]">Frame_Buffer: Active</span>
                       <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: ['20%', '80%', '40%', '90%', '60%'] }} 
                            transition={{ duration: 4, repeat: Infinity }}
                            className="h-full bg-neon-cyan/40" 
                          />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-24 h-24 border-l-4 border-b-4 border-white/20 rounded-bl-3xl" />
                  <div className="flex flex-col items-center mb-4">
                     <div className="text-[10px] text-neon-cyan/40 mb-2 uppercase tracking-[1em] font-black">Scanning_Entities</div>
                     <div className="flex gap-1">
                        {[...Array(15)].map((_, i) => (
                          <motion.div 
                            key={i} 
                            animate={{ height: [4, 12, 6, 16, 8] }}
                            transition={{ duration: Math.random() * 2 + 1, repeat: Infinity }}
                            className="w-1 bg-neon-cyan/30" 
                          />
                        ))}
                     </div>
                  </div>
                  <div className="w-24 h-24 border-r-4 border-b-4 border-white/20 rounded-br-3xl" />
                </div>
              </div>

              {/* CRT / Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-40" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selector Grid */}
      <div className="h-28 bg-zinc-950 border-t border-white/10 p-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {filteredFeeds.map((f) => (
          <button
            key={f.id}
            onClick={() => handleSwitch(f.id)}
            className={`relative flex-shrink-0 w-44 h-full rounded-md border-2 transition-all overflow-hidden group ${
              current.id === f.id ? 'border-neon-cyan shadow-[0_0_15px_rgba(0,212,229,0.3)]' : 'border-white/5 opacity-50 grayscale hover:opacity-100'
            }`}
          >
            {f.source.includes('youtube') ? (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <Signal size={20} className="text-white/20" />
              </div>
            ) : (
              <video src={f.source} muted className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[8px] text-white/90 font-black uppercase tracking-tighter leading-tight mb-1">{f.label}</span>
              <span className="text-[6px] text-neon-cyan/60 tracking-widest">{f.id}</span>
            </div>
            {current.id === f.id && (
              <div className="absolute top-1 right-1">
                <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-ping" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
