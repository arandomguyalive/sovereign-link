'use client';

import React, { useState, useEffect } from 'react';
import { useWindowManager, AppId } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { Window } from './Window';
import { Terminal } from '@/components/terminal/Terminal';
import { CameraFeed } from '@/components/modules/CameraFeed';
import { WiFiSniffer } from '@/components/modules/WiFiSniffer';
import { HydraCracker } from '@/components/modules/HydraCracker';
import { NetworkMap } from '@/components/modules/NetworkMap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, 
  Camera, 
  Wifi, 
  Share2, 
  Shield, 
  Map, 
  ShieldAlert,
  Cpu,
  Lock,
  Zap
} from 'lucide-react';

export const Desktop = () => {
  const { windows, openWindow } = useWindowManager();
  const { traceLevel } = useTerminal();
  const [isBooting, setIsBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);

  const bootLogs = [
    'INITIALIZING SOVEREIGN-OS v4.2.0-STABLE...',
    'LOADING KERNEL MODULES... DONE',
    'MOUNTING VIRTUAL FILE SYSTEM... DONE',
    'ESTABLISHING NEURAL-LINK ENCRYPTION... 1024-BIT RSA',
    'SCANNING PERIPHERALS... WLAN0, ETH0, SAT-LINK DETECTED',
    'STARTING GOD-EYE SURVEILLANCE ENGINE...',
    'SYSTEM READY. WELCOME, GHOST.'
  ];

  useEffect(() => {
    if (isBooting) {
      const interval = setInterval(() => {
        setBootStep(prev => {
          if (prev >= bootLogs.length - 1) {
            clearInterval(interval);
            setTimeout(() => setIsBooting(false), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isBooting]);

  const icons: { id: AppId; icon: any; label: string }[] = [
    { id: 'terminal', icon: TerminalIcon, label: 'Terminal' },
    { id: 'camera', icon: Camera, label: 'CCTV' },
    { id: 'wifi', icon: Wifi, label: 'WiFi Sniffer' },
    { id: 'network', icon: Share2, label: 'Net Map' },
    { id: 'cracker', icon: Shield, label: 'Hydra' },
    { id: 'map', icon: Map, label: 'GeoTrace' },
  ];

  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-black z-[10000] flex flex-col items-center justify-center font-mono p-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full"
        >
          <div className="flex items-center gap-4 mb-8">
            <Zap size={40} className="text-neon-cyan animate-pulse" />
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-neon-cyan font-black tracking-[0.5em] text-xl">SOVEREIGN</span>
          </div>
          
          <div className="space-y-2">
            {bootLogs.slice(0, bootStep + 1).map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className={`text-xs ${i === bootStep ? 'text-neon-cyan' : 'text-white/40'}`}
              >
                <span className="mr-4 text-white/20">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-between text-[10px] text-white/20 uppercase tracking-widest">
            <span>Core: v4.2.0-STABLE</span>
            <div className="flex gap-2">
              <div className="w-1 h-1 rounded-full bg-neon-cyan animate-ping" />
              STATUS: SYNCING
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-center bg-cover">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      
      {/* Desktop Icons */}
      <div className="absolute top-10 left-10 grid grid-cols-1 gap-6 pointer-events-auto">
        {icons.map((item) => (
          <button
            key={item.id}
            onClick={() => openWindow(item.id)}
            className="group flex flex-col items-center gap-1 w-20 p-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 group-hover:border-neon-cyan/50 group-hover:shadow-[0_0_15px_rgba(0,212,229,0.3)] transition-all">
              <item.icon className="text-gray-400 group-hover:text-neon-cyan transition-colors" size={24} />
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-tighter group-hover:text-neon-cyan transition-colors">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Windows Container */}
      <div className="absolute inset-0 pointer-events-none">
        <Window id="terminal" title={windows.terminal.title}><Terminal /></Window>
        <Window id="camera" title={windows.camera.title}><CameraFeed /></Window>
        <Window id="wifi" title={windows.wifi.title}><WiFiSniffer /></Window>
        <Window id="cracker" title={windows.cracker.title}><HydraCracker /></Window>
        <Window id="network" title={windows.network.title}><NetworkMap /></Window>
        <Window id="map" title={windows.map.title}>
          <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan/50 text-xs italic">
            <div className="animate-pulse">LOCALIZING TARGET COORDINATES...</div>
          </div>
        </Window>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 w-full h-9 glass-panel border-t border-neon-cyan/20 flex items-center justify-between px-4 text-[10px] text-neon-cyan/60 uppercase tracking-widest z-[1000]">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <Cpu size={12} className="animate-spin-slow" />
            <span>Core Load: 24%</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={12} />
            <span>Sovereign Link: <span className="text-emerald-400">ENCRYPTED</span></span>
          </div>
        </div>
        <div className="flex gap-6">
          <span>Signal: <span className="text-emerald-400">98.4%</span></span>
          <span className="text-white/40">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Trace Level Overlay */}
      <div className="absolute top-10 right-10 w-72 h-16 glass-panel p-3 flex flex-col justify-between z-[1000]">
        <div className="flex justify-between text-[10px] uppercase tracking-tighter font-black">
          <span className={traceLevel > 70 ? "text-neon-pink animate-pulse" : "text-white/60"}>
            {traceLevel > 70 ? "!! TRACE DETECTED !!" : "Trace Detection Active"}
          </span>
          <span className="text-white">{traceLevel}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${traceLevel}%` }}
            className={`h-full ${traceLevel > 70 ? "bg-red-500 shadow-[0_0_15px_#ff0000]" : "bg-neon-cyan shadow-[0_0_10px_#00D4E5]"}`}
          />
        </div>
        <div className="text-[8px] text-white/20 uppercase tracking-[0.2em] mt-1">Status: Stealth Protocol Engaged</div>
      </div>

      {/* Lock Screen Overlay */}
      <AnimatePresence>
        {traceLevel >= 100 && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            className="absolute inset-0 z-[10000] bg-red-950/90 flex flex-col items-center justify-center border-[20px] border-red-600/20"
          >
            <ShieldAlert size={120} className="text-red-500 mb-6 animate-bounce" />
            <h1 className="text-6xl font-black text-white uppercase tracking-[1em] mb-4 neon-text-pink">Compromised</h1>
            <p className="text-red-200 font-mono text-sm uppercase tracking-widest text-center max-w-lg">
              Physical Location Uplink Detected. <br/> 
              Sovereign Protocol Initiating Hardware Self-Destruct. <br/>
              Disconnect Immediately.
            </p>
            <div className="mt-12 text-[12px] text-white/40 font-mono uppercase tracking-[0.5em] animate-pulse">
              [ ACCESS TERMINATED ]
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};