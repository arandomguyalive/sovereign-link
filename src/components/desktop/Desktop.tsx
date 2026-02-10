'use client';

import React from 'react';
import { useWindowManager, AppId } from '@/store/useWindowManager';
import { Window } from './Window';
import { Terminal } from '@/components/terminal/Terminal';
import { CameraFeed } from '@/components/modules/CameraFeed';
import { WiFiSniffer } from '@/components/modules/WiFiSniffer';
import { HydraCracker } from '@/components/modules/HydraCracker';
import { NetworkMap } from '@/components/modules/NetworkMap';
import { useTerminal } from '@/store/useTerminal';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, Camera, Wifi, Share2, Shield, Map, ShieldAlert } from 'lucide-react';

export const Desktop = () => {
  const { windows, openWindow } = useWindowManager();

  const icons: { id: AppId; icon: any; label: string }[] = [
    { id: 'terminal', icon: TerminalIcon, label: 'Terminal' },
    { id: 'camera', icon: Camera, label: 'CCTV' },
    { id: 'wifi', icon: Wifi, label: 'WiFi Sniffer' },
    { id: 'network', icon: Share2, label: 'Net Map' },
    { id: 'cracker', icon: Shield, label: 'Hydra' },
    { id: 'map', icon: Map, label: 'GeoTrace' },
  ];

  const { traceLevel } = useTerminal();

  return (
    <div className="relative w-full h-full overflow-hidden bg-[url('/bg-pattern.svg')] bg-center bg-cover">
      {/* Desktop Icons */}
      <div className="absolute top-10 left-10 grid grid-cols-1 gap-8">
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

      {/* Windows */}
      <Window id="terminal" title={windows.terminal.title}>
        <Terminal />
      </Window>

      <Window id="camera" title={windows.camera.title}>
        <CameraFeed />
      </Window>

      <Window id="wifi" title={windows.wifi.title}>
        <WiFiSniffer />
      </Window>

      <Window id="cracker" title={windows.cracker.title}>
        <HydraCracker />
      </Window>

      <Window id="network" title={windows.network.title}>
        <NetworkMap />
      </Window>

      <Window id="map" title={windows.map.title}>
        <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan/50 text-xs italic">
          <div className="animate-pulse">LOCALIZING TARGET COORDINATES...</div>
        </div>
      </Window>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 w-full h-8 glass-panel border-t border-neon-cyan/20 flex items-center justify-between px-4 text-[10px] text-neon-cyan/60 uppercase tracking-widest">
        <div className="flex gap-4">
          <span>Status: <span className="text-emerald-400">Connected</span></span>
          <span>Lat: 42.3601 N</span>
          <span>Long: 71.0589 W</span>
        </div>
        <div className="flex gap-4">
          <span>Signal: <span className="text-emerald-400">Encrypted</span></span>
          <span>Time: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Trace Level Overlay */}
      <div className="absolute top-10 right-10 w-64 h-12 glass-panel p-2 flex flex-col justify-between">
        <div className="flex justify-between text-[10px] uppercase tracking-tighter">
          <span className={traceLevel > 70 ? "text-neon-pink animate-pulse" : "text-neon-pink"}>
            {traceLevel > 70 ? "CRITICAL TRACE DETECTED" : "Trace Detection"}
          </span>
          <span className="text-neon-pink">{traceLevel}%</span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${traceLevel}%` }}
            className={`h-full ${traceLevel > 70 ? "bg-red-500 shadow-[0_0_15px_#ff0000]" : "bg-neon-pink shadow-[0_0_10px_#FF53B2]"}`}
          />
        </div>
      </div>

      {/* Lock Screen Overlay */}
      {traceLevel >= 100 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-[10000] bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center border-4 border-red-600 animate-pulse"
        >
          <ShieldAlert size={80} className="text-white mb-4" />
          <h1 className="text-4xl font-bold text-white uppercase tracking-[0.5em] mb-2">Physical Location Compromised</h1>
          <p className="text-red-200 font-mono text-sm uppercase">Automatic Lockdown Engaged // Sending Alert to Authorities</p>
          <div className="mt-10 text-[10px] text-white/40 font-mono uppercase tracking-[1em]">
            Reboot Required
          </div>
        </motion.div>
      )}
    </div>
  );
};
