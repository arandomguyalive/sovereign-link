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
      }, 300);
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
      <div className="fixed inset-0 bg-black z-[10000] flex flex-col items-center justify-center font-mono p-10 pointer-events-auto">
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
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#050505] font-mono">
      {/* Background with Grid Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-transparent to-neon-cyan/5 pointer-events-none" />
      
      {/* Desktop Icons Layer - Important: Container is pointer-events-none */}
      <div className="absolute top-10 left-10 grid grid-cols-1 gap-6 z-[500] pointer-events-none">
        {icons.map((item) => (
          <button
            key={item.id}
            onClick={() => openWindow(item.id)}
            className="group flex flex-col items-center gap-1 w-24 p-2 rounded-lg hover:bg-white/5 transition-all pointer-events-auto"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-black/60 border border-white/10 group-hover:border-neon-cyan/50 group-hover:shadow-[0_0_20px_rgba(0,212,229,0.2)] transition-all">
              <item.icon className="text-zinc-500 group-hover:text-neon-cyan transition-colors" size={28} />
            </div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black group-hover:text-neon-cyan transition-colors mt-1">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Windows Layer - Higher Z-index than Icons */}
      <div className="absolute inset-0 z-[600] pointer-events-none">
        {Object.values(windows).map((win) => {
          if (!win.isOpen) return null;
          return (
            <Window key={win.id} id={win.id} title={win.title}>
              {win.id === 'terminal' && <Terminal />}
              {win.id === 'camera' && <CameraFeed />}
              {win.id === 'wifi' && <WiFiSniffer />}
              {win.id === 'cracker' && <HydraCracker />}
              {win.id === 'network' && <NetworkMap />}
              {win.id === 'map' && (
                <div className="w-full h-full bg-black flex flex-col items-center justify-center p-10 text-center">
                  <Scan size={48} className="text-neon-cyan animate-pulse mb-4" />
                  <h3 className="text-neon-cyan text-sm font-black uppercase tracking-[0.3em]">Geo-Trace Protocol</h3>
                  <p className="text-[10px] text-white/40 mt-2 uppercase tracking-widest">Awaiting Uplink Synchronization...</p>
                </div>
              )}
            </Window>
          );
        })}
      </div>

      {/* Status Bar Layer - Important: Container is pointer-events-none */}
      <div className="absolute bottom-0 left-0 w-full h-10 glass-panel border-t border-white/10 flex items-center justify-between px-6 z-[1000] pointer-events-none">
        <div className="flex gap-8 items-center pointer-events-auto">
          <div className="flex items-center gap-3">
            <Cpu size={14} className="text-neon-cyan animate-spin-slow" />
            <span className="text-[10px] text-neon-cyan font-black tracking-widest uppercase">Kernel: 24.1%</span>
          </div>
          <div className="flex items-center gap-3">
            <Lock size={14} className="text-emerald-500" />
            <span className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">Secure Uplink</span>
          </div>
        </div>
        <div className="flex gap-8 items-center pointer-events-auto">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-neon-orange" />
            <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">98.4%</span>
          </div>
          <span className="text-[11px] text-white font-black tracking-tighter">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Trace Level Overlay */}
      <div className="absolute top-10 right-10 w-80 h-20 glass-panel p-4 flex flex-col justify-between z-[1000] pointer-events-none border-l-4 border-neon-cyan shadow-2xl">
        <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-black">
          <span className={traceLevel > 70 ? "text-neon-pink animate-pulse" : "text-neon-cyan"}>
            {traceLevel > 70 ? "!! TRACE DETECTED !!" : "Trace Detection Active"}
          </span>
          <span className="text-white">{traceLevel}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 mt-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${traceLevel}%` }}
            className={`h-full ${traceLevel > 70 ? "bg-red-600 shadow-[0_0_15px_#ff0000]" : "bg-neon-cyan shadow-[0_0_10px_#00D4E5]"}`}
          />
        </div>
        <div className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-black mt-2">Stealth Protocol: ENFORCED</div>
      </div>

      {/* Compromised Lock Screen */}
      <AnimatePresence>
        {traceLevel >= 100 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-red-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center pointer-events-auto"
          >
            <ShieldAlert size={150} className="text-white mb-8 animate-bounce" />
            <h1 className="text-7xl font-black text-white uppercase tracking-[0.5em] mb-4">Compromised</h1>
            <p className="text-xl text-red-200 uppercase tracking-widest max-w-2xl font-black">
              Physical Uplink Detected. Localizing Strike... <br/>
              Disconnect Immediately to Prevent Hardware Self-Destruct.
            </p>
            <div className="mt-16 text-sm text-white/40 font-black uppercase tracking-[1em] animate-pulse">
              [ SYSTEM TERMINATED ]
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
