'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PASSWORDS = [
  'admin', '123456', 'password', 'qwerty', 'root', 'superadmin', 'access', 'godmode',
  'sovereign', 'neural', 'cyber', 'dystopia', 'billionaire', 'inner', 'ghost', 'shell'
];

export const HydraCracker = () => {
  const [target, setTarget] = useState('192.168.1.102');
  const [service, setService] = useState('ssh');
  const [isCracking, setIsCracking] = useState(false);
  const [attempts, setAttempts] = useState<string[]>([]);
  const [foundPassword, setFoundPassword] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [attempts]);

  const startCracking = () => {
    setIsCracking(true);
    setFoundPassword(null);
    setAttempts(['[INFO] Initializing Hydra v9.1...', `[INFO] Targeting ${target} on port ${service === 'ssh' ? 22 : 80}...`]);
    
    let count = 0;
    const interval = setInterval(() => {
      const user = ['root', 'admin', 'operator'][Math.floor(Math.random() * 3)];
      const pass = PASSWORDS[Math.floor(Math.random() * PASSWORDS.length)];
      
      setAttempts(prev => [...prev.slice(-20), `[ATTEMPT] user:${user} pass:${pass} - FAILED`]);
      
      count++;
      if (count > 40) {
        clearInterval(interval);
        const finalPass = 'sovereign_2026';
        setFoundPassword(finalPass);
        setIsCracking(false);
        setAttempts(prev => [...prev, `[SUCCESS] ${target} cracked! user:admin pass:${finalPass}`]);
      }
    }, 100);
  };

  return (
    <div className="h-full bg-black/90 p-3 font-mono flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="flex flex-col gap-1">
          <label className="text-neon-cyan/60 uppercase">Target IP</label>
          <input 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="bg-black border border-neon-cyan/20 p-1 text-neon-cyan outline-none focus:border-neon-cyan/50"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neon-cyan/60 uppercase">Service</label>
          <select 
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="bg-black border border-neon-cyan/20 p-1 text-neon-cyan outline-none focus:border-neon-cyan/50"
          >
            <option value="ssh">SSH (22)</option>
            <option value="http">HTTP (80)</option>
            <option value="ftp">FTP (21)</option>
          </select>
        </div>
      </div>

      <button 
        onClick={startCracking}
        disabled={isCracking}
        className={`w-full py-2 border text-[10px] uppercase tracking-widest transition-all ${
          isCracking 
            ? 'border-neon-pink text-neon-pink opacity-50 cursor-wait' 
            : 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10'
        }`}
      >
        {isCracking ? 'Cracking...' : 'Execute Hydra Protocol'}
      </button>

      <div className="flex-1 bg-black border border-white/5 p-2 overflow-hidden flex flex-col">
        <div className="text-[8px] text-gray-500 mb-2 border-b border-white/5 pb-1 flex justify-between">
          <span>LOG_OUTPUT</span>
          <span className="animate-pulse">{isCracking ? 'ACTIVE' : 'IDLE'}</span>
        </div>
        <div ref={logRef} className="flex-1 overflow-y-auto text-[9px] space-y-0.5 scrollbar-hide">
          {attempts.map((log, idx) => (
            <div key={idx} className={
              log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : 
              log.includes('FAILED') ? 'text-white/40' : 
              'text-neon-cyan/60'
            }>
              {log}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {foundPassword && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-2 border border-emerald-500/50 bg-emerald-500/10 rounded"
          >
            <div className="text-[8px] text-emerald-400 uppercase font-bold">Access Granted</div>
            <div className="text-xs text-white break-all">CREDENTIALS FOUND: admin / {foundPassword}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
