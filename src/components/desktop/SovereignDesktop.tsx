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
import { DubaiTacticalMap } from '@/components/modules/DubaiTacticalMap';
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
  Zap,
  Scan
} from 'lucide-react';

const SovereignDesktop = () => {
  const { windows, openWindow } = useWindowManager();
  const { traceLevel } = useTerminal();
  const [isBooting, setIsBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [time, setTime] = useState('');

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
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    const bootInterval = setInterval(() => {
      setBootStep(prev => {
        if (prev >= bootLogs.length - 1) {
          clearInterval(bootInterval);
          setTimeout(() => setIsBooting(false), 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 250);

    return () => {
      clearInterval(timer);
      clearInterval(bootInterval);
    };
  }, []);

  const icons: { id: AppId; icon: any; label: string }[] = [
    { id: 'terminal', icon: TerminalIcon, label: 'Terminal' },
    { id: 'camera', icon: Camera, label: 'CCTV' },
    { id: 'wifi', icon: Wifi, label: 'WiFi Sniffer' },
    { id: 'network', icon: Share2, label: 'Net Map' },
    { id: 'cracker', icon: Shield, label: 'Hydra' },
    { id: 'map', icon: Map, label: 'Dubai Map' },
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
              <div key={i} className={`text-xs ${i === bootStep ? 'text-neon-cyan' : 'text-white/40'}`}>
                <span className="mr-4 text-white/20">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050505] font-mono select-none">
      {/* Visual background layers */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-transparent to-neon-cyan/5 pointer-events-none" />
      
      {/* 1. Desktop Icons Layer - Bottom Layer */}
      <div className="absolute top-10 left-10 grid grid-cols-1 gap-6 z-[100] pointer-events-none">
        {icons.map((item) => (
          <button
            key={item.id}
            onClick={() => openWindow(item.id)}
            className="group flex flex-col items-center gap-1 w-24 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer pointer-events-auto"
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

      {/* 2. Windows Layer - Renders ON TOP of icons */}
      {Object.values(windows).map((win) => {
        if (!win.isOpen) return null;
        return (
          <Window key={win.id} id={win.id} title={win.title}>
            {win.id === 'terminal' && <Terminal />}
            {win.id === 'camera' && <CameraFeed />}
            {win.id === 'wifi' && <WiFiSniffer />}
            {win.id === 'cracker' && <HydraCracker />}
            {win.id === 'network' && <NetworkMap />}
            {win.id === 'map' && <DubaiTacticalMap />}
          </Window>
        );
      })}

      {/* 3. Status Bar Layer - Highest Z-index */}
      <div className="absolute bottom-0 left-0 w-full h-10 glass-panel border-t border-white/10 flex items-center justify-between px-6 z-[1000] bg-black/40 backdrop-blur-md">
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-3">
            <Cpu size={14} className="text-neon-cyan" />
            <span className="text-[10px] text-neon-cyan font-black tracking-widest uppercase">Kernel: 24.1%</span>
          </div>
          <div className="flex items-center gap-3">
            <Lock size={14} className="text-emerald-500" />
            <span className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">Secure Uplink</span>
          </div>
        </div>
        <div className="flex gap-8 items-center">
          <Zap size={14} className="text-neon-orange" />
          <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">98.4%</span>
          <span className="text-[11px] text-white font-black tracking-tighter">{time}</span>
        </div>
      </div>

      {/* Trace Level Overlay */}
      <div className="absolute top-10 right-10 w-80 h-20 glass-panel p-4 z-[1000] border-l-4 border-neon-cyan shadow-2xl pointer-events-none">
        <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-black">
          <span className={traceLevel > 70 ? "text-neon-pink animate-pulse" : "text-neon-cyan"}>
            {traceLevel > 70 ? "!! TRACE DETECTED !!" : "Trace Detection Active"}
          </span>
          <span className="text-white">{traceLevel}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
          <motion.div animate={{ width: `${traceLevel}%` }} className={`h-full ${traceLevel > 70 ? "bg-red-600" : "bg-neon-cyan"}`} />
        </div>
      </div>

      {/* Lockdown Overlay */}
      <AnimatePresence>
        {traceLevel >= 100 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[20000] bg-red-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center">
            <ShieldAlert size={150} className="text-white mb-8 animate-bounce" />
            <h1 className="text-7xl font-black text-white uppercase tracking-[0.5em] mb-4">Compromised</h1>
            <p className="text-xl text-red-200 uppercase tracking-widest max-w-2xl font-black leading-relaxed">
              Physical Uplink Detected. Localizing Strike... <br/>
              Disconnect Immediately to Prevent Hardware Self-Destruct.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SovereignDesktop;