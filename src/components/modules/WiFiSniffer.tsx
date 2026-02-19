'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Shield, Lock, Signal, Globe } from 'lucide-react';

interface Network {
  ssid: string;
  signal: number;
  security: string;
  channel: number;
  bssid: string;
  clients: number;
}

const REGIONS = {
  'CORE-GRID': [
    { ssid: 'SOVEREIGN_VIRTUAL_01', signal: 92, security: 'WPA3', channel: 11, clients: 4 },
    { ssid: 'PUBLIC_ACCESS_NODE', signal: 85, security: 'OPEN', channel: 6, clients: 124 },
    { ssid: 'SECURE_POLICE_NET', signal: 40, security: 'WPA2-ENT', channel: 1, clients: 0 },
    { ssid: 'GRID_RESIDENCE_ALPHA', signal: 78, security: 'WPA2', channel: 36, clients: 8 },
  ],
  NYC: [
    { ssid: 'LinkNYC_Free_Wi-Fi', signal: 95, security: 'OPEN', channel: 6, clients: 450 },
    { ssid: 'NYPD_Surveillance_Net', signal: 35, security: 'HIDDEN', channel: 149, clients: 2 },
    { ssid: 'Starbucks_WiFi', signal: 88, security: 'WPA2', channel: 1, clients: 12 },
    { ssid: 'Trump_Tower_Secure', signal: 20, security: 'WPA3', channel: 11, clients: 5 },
  ],
  LDN: [
    { ssid: 'London_Underground', signal: 82, security: 'WPA2', channel: 1, clients: 200 },
    { ssid: 'MI6_Operative_Link', signal: 15, security: 'QUANTUM', channel: 165, clients: 1 },
    { ssid: 'The_Shard_Guest', signal: 70, security: 'WPA2', channel: 6, clients: 45 },
  ],
  MOSCOW: [
    { ssid: 'Kremlin_Internal', signal: 10, security: 'GOST-Enc', channel: 13, clients: 0 },
    { ssid: 'Yandex_Public', signal: 90, security: 'OPEN', channel: 1, clients: 300 },
    { ssid: 'FSB_Net_77', signal: 25, security: 'WPA3', channel: 11, clients: 3 },
  ]
};

export const WiFiSniffer = () => {
  const [region, setRegion] = useState<'CORE-GRID' | 'NYC' | 'LDN' | 'MOSCOW'>('CORE-GRID');
  const [networks, setNetworks] = useState<Network[]>([]);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const scan = () => {
      setScanning(true);
      setNetworks([]);
      setTimeout(() => {
        const base = REGIONS[region];
        const randomized = base.map(n => ({
          ...n,
          signal: Math.max(0, Math.min(100, n.signal + Math.floor(Math.random() * 10 - 5))),
          bssid: Array(6).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':')
        }));
        setNetworks(randomized);
        setScanning(false);
      }, 1500);
    };

    scan();
    const interval = setInterval(() => {
      // Live signal updates
      setNetworks(prev => prev.map(n => ({
        ...n,
        signal: Math.max(0, Math.min(100, n.signal + Math.floor(Math.random() * 6 - 3)))
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [region]);

  return (
    <div className="h-full bg-black/90 p-2 font-mono text-[10px] overflow-hidden flex flex-col select-none">
      {/* Region Tabs */}
      <div className="flex gap-1 border-b border-neon-cyan/20 pb-2 mb-2 overflow-x-auto scrollbar-hide">
        {(Object.keys(REGIONS) as Array<keyof typeof REGIONS>).map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`px-3 py-1 border rounded text-[9px] font-bold transition-all flex items-center gap-1 ${
              region === r 
                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' 
                : 'border-white/10 text-white/40 hover:border-white/30'
            }`}
          >
            <Globe size={10} /> {r}
          </button>
        ))}
      </div>

      {/* Header Info */}
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="flex gap-4 text-white/50">
          <span>INTERFACE: wlan0mon</span>
          <span>HOPPING: {scanning ? 'Active' : 'Paused'}</span>
        </div>
        <div className={`flex items-center gap-1 ${scanning ? 'text-neon-pink' : 'text-emerald-400'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${scanning ? 'bg-neon-pink animate-pulse' : 'bg-emerald-400'}`} />
          {scanning ? 'SCANNING...' : 'MONITORING'}
        </div>
      </div>

      {/* Network List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead className="text-neon-cyan/60 sticky top-0 bg-black text-[9px] uppercase tracking-wider">
            <tr>
              <th className="p-1 pb-2">PWR</th>
              <th className="p-1 pb-2">BSSID</th>
              <th className="p-1 pb-2">CH</th>
              <th className="p-1 pb-2">ENC</th>
              <th className="p-1 pb-2">ESSID</th>
              <th className="p-1 pb-2 text-right">CLNT</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <AnimatePresence>
              {networks.map((net, idx) => (
                <motion.tr 
                  key={net.bssid}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="hover:bg-white/5 cursor-pointer group border-b border-white/5 last:border-0"
                >
                  <td className={`p-1.5 font-bold ${net.signal > 70 ? 'text-emerald-400' : net.signal > 40 ? 'text-neon-orange' : 'text-red-500'}`}>
                    -{100 - net.signal}
                  </td>
                  <td className="p-1.5 text-gray-500 group-hover:text-neon-cyan font-mono text-[9px]">{net.bssid}</td>
                  <td className="p-1.5 text-white/60">{net.channel}</td>
                  <td className="p-1.5">
                    <span className={`px-1 rounded ${net.security === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40'}`}>
                      {net.security}
                    </span>
                  </td>
                  <td className="p-1.5 text-white font-bold tracking-wide">{net.ssid}</td>
                  <td className="p-1.5 text-right text-white/30">{net.clients}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer Stats */}
      <div className="mt-2 border-t border-neon-cyan/20 pt-2 flex justify-between text-[8px] text-neon-cyan/40 uppercase tracking-widest">
        <span>Packets: {Math.floor(Math.random() * 50000)}</span>
        <span>Filter: None</span>
        <span>Inject: Ready</span>
      </div>
    </div>
  );
};