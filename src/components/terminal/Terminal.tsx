'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTerminal } from '@/store/useTerminal';
import { useFileSystem } from '@/store/useFileSystem';
import { useWindowManager } from '@/store/useWindowManager';
import { motion, AnimatePresence } from 'framer-motion';

export const Terminal = () => {
  const [input, setInput] = useState('');
  const { history, addLog, clearHistory, traceLevel, incrementTrace } = useTerminal();
  const { currentPath, cd, fs } = useFileSystem();
  const { openWindow } = useWindowManager();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmdText = input.trim();
    const [cmd, ...args] = cmdText.split(' ');
    
    addLog(`${currentPath} $ ${cmdText}`, 'input');
    setInput('');

    processCommand(cmd, args);
  };

  const processCommand = (cmd: string, args: string[]) => {
    switch (cmd.toLowerCase()) {
      case 'help':
        addLog('AVAILABLE COMMANDS:', 'success');
        addLog('  ls             List directory contents');
        addLog('  cd [dir]       Change directory');
        addLog('  cat [file]     Read file content');
        addLog('  clear          Clear terminal history');
        addLog('  scan           Scan for local networks and devices');
        addLog('  wifi           Launch WiFi interceptor');
        addLog('  camera         Access global CCTV feeds');
        addLog('  exploit        Launch vulnerability exploitation module');
        addLog('  whoami         Display current user info');
        break;

      case 'ls':
        const dir = fs[currentPath];
        if (dir?.children) {
          addLog(dir.children.join('  '));
        }
        break;

      case 'cd':
        try {
          cd(args[0] || '/home/ghost');
        } catch (err: any) {
          addLog(err.message, 'error');
        }
        break;

      case 'cat':
        if (!args[0]) {
          addLog('cat: missing operand', 'error');
          break;
        }
        const path = args[0].startsWith('/') ? args[0] : `${currentPath === '/' ? '' : currentPath}/${args[0]}`;
        const file = fs[path];
        if (file && file.type === 'file') {
          addLog(file.content || '');
        } else {
          addLog(`cat: ${args[0]}: No such file`, 'error');
        }
        break;

      case 'clear':
        clearHistory();
        break;

      case 'scan':
        addLog('Initializing deep network scan...', 'warning');
        setTimeout(() => {
          addLog('FOUND: 192.168.1.1 (Gateway)', 'success');
          addLog('FOUND: 192.168.1.12 (SmartTV-LG)', 'success');
          addLog('FOUND: 192.168.1.45 (iPhone-Sovereign)', 'success');
          addLog('FOUND: 192.168.1.102 (IOT-CAM-04)', 'warning');
          openWindow('network');
        }, 1500);
        break;

      case 'camera':
        addLog('Connecting to God-Eye Satellite Uplink...', 'warning');
        setTimeout(() => {
          addLog('Uplink Synchronized. Visuals enabled.', 'success');
          openWindow('camera');
        }, 1000);
        break;

      case 'wifi':
        addLog('Activating Monitor Mode on wlan0...', 'warning');
        setTimeout(() => {
          addLog('Monitor mode enabled. Sniffing packets...', 'success');
          openWindow('wifi');
        }, 1200);
        break;

      case 'whoami':
        addLog('ghost@sovereign-node-01');
        break;

      case 'exploit':
        incrementTrace(25);
        addLog('CRITICAL: Unauthorized exploitation attempt detected.', 'error');
        addLog('TRACE LEVEL INCREASED: ' + (traceLevel + 25) + '%', 'warning');
        addLog('Searching for vulnerabilities...', 'warning');
        break;

      default:
        addLog(`sh: command not found: ${cmd}`, 'error');
    }
  };

  return (
    <div 
      className="h-full flex flex-col font-mono text-sm overflow-hidden bg-black/80 p-2"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
        {history.map((line) => (
          <div key={line.id} className={`break-all ${
            line.type === 'input' ? 'text-neon-cyan' : 
            line.type === 'error' ? 'text-neon-pink font-bold' :
            line.type === 'success' ? 'text-emerald-400' :
            line.type === 'warning' ? 'text-neon-orange' :
            'text-foreground'
          }`}>
            {line.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleCommand} className="flex mt-2 border-t border-neon-cyan/20 pt-2">
        <span className="text-neon-cyan mr-2">{currentPath} $</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-foreground"
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
};
