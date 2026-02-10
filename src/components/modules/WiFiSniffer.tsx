'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Shield, Lock, Signal } from 'lucide-react';

interface Network {
  ssid: string;
  signal: number;
  security: string;
  bars: string;
  bssid: string;
}

export const WiFiSniffer = () => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const scan = async () => {
      setScanning(true);
      try {
        const res = await fetch('/api/wifi');
        const data = await res.json();
        setNetworks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setScanning(false), 2000);
      }
    };

    scan();
    const interval = setInterval(scan, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full bg-black/90 p-2 font-mono text-[10px] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-2 border-b border-neon-cyan/20 pb-1">
        <div className="flex gap-4">
          <span className="text-neon-cyan">INTERFACE: wlan0mon</span>
          <span className="text-neon-cyan">CHANNELS: 1,6,11,36,44</span>
        </div>
        <div className={`flex items-center gap-1 ${scanning ? 'text-neon-pink' : 'text-emerald-400'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${scanning ? 'bg-neon-pink animate-pulse' : 'bg-emerald-400'}`} />
          {scanning ? 'SCANNING...' : 'MONITORING'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <table className="w-full text-left">
          <thead className="text-neon-cyan/60 sticky top-0 bg-black">
            <tr>
              <th className="p-1">BSSID</th>
              <th className="p-1">PWR</th>
              <th className="p-1">BEACONS</th>
              <th className="p-1">AUTH</th>
              <th className="p-1">ESSID</th>
            </tr>
          </thead>
          <tbody>
            {networks.map((net, idx) => (
              <motion.tr 
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-white/5 cursor-pointer group"
              >
                <td className="p-1 text-gray-500 group-hover:text-neon-cyan">{net.bssid}</td>
                <td className={`p-1 ${net.signal > 70 ? 'text-emerald-400' : net.signal > 40 ? 'text-neon-orange' : 'text-neon-pink'}`}>
                  -{100 - net.signal}
                </td>
                <td className="p-1 text-gray-400">{Math.floor(Math.random() * 500)}</td>
                <td className="p-1 text-neon-cyan/80">{net.security.split(' ')[0]}</td>
                <td className="p-1 text-white font-bold">{net.ssid}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 border-t border-neon-cyan/20 pt-1 flex justify-between text-neon-cyan/40">
        <span>Found {networks.length} access points</span>
        <span>IVs: {Math.floor(Math.random() * 10000)}</span>
      </div>
    </div>
  );
};
