'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTerminal } from '@/store/useTerminal';
import { useFileSystem } from '@/store/useFileSystem';
import { useWindowManager } from '@/store/useWindowManager';

export const Terminal = () => {
  const [input, setInput] = useState('');
  const { history, addLog, clearHistory, traceLevel, incrementTrace, addFile, isHacking, setHacking } = useTerminal();
  const { currentPath, cd, fs } = useFileSystem();
  const { openWindow } = useWindowManager();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (!isHacking) return;

    let step = 0;
    const interval = setInterval(() => {
      const logs = [
        { text: ">> INITIATING SATELLITE BREACH: AL-QURAIN_SAT_01", type: "warning" as const },
        { text: "[+] FETCHING TLE DATA FROM NORAD... SUCCESS", type: "success" as const },
        { text: "[*] CALCULATING ORBITAL MECHANICS: VEL=7.6km/s ALT=358km", type: "info" as const },
        { text: "[*] ESTIMATING DOPPLER SHIFT: +4.2kHz... LOCKING ON CARRIER", type: "info" as const },
        { text: ">> HANDSHAKE: GS_DUBAI_CENTRAL -> AQ_SAT_01", type: "warning" as const },
        { text: "[+] INJECTING AES-256 BYPASS (MAN-IN-THE-MIDDLE)...", type: "warning" as const },
        { text: "[+] UPLINK SYNC: 14.2 GHz... BANDWIDTH OPTIMIZED", type: "success" as const },
        { text: "[*] TELEMETRY PACKET INTERCEPTED: BAT=82% TEMP=14C", type: "info" as const },
        { text: ">> EXPLOITING CVE-2025-8821 (GND_SYSTEM_VULNERABILITY)", type: "error" as const },
        { text: "[+] BYPASSING KERNEL AUTHENTICATION... [##########] 100%", type: "success" as const },
        { text: ">> ACCESS GRANTED: COMMAND_BUFFER_R/W", type: "success" as const },
        { text: "[!] OVERRIDING ATTITUDE CONTROL... ADJUSTING YAW: +2.5 deg", type: "warning" as const },
        { text: "[*] DOWNLOADING CLASSIFIED ENCRYPTED_MAP_DATA.pkg...", type: "info" as const },
        { text: "[+] EXFILTRATING... PACKET 102/4482 [####------]", type: "info" as const },
        { text: "[+] EXFILTRATING... PACKET 450/4482 [#####-----]", type: "info" as const },
        { text: "[+] EXFILTRATING... PACKET 980/4482 [######----]", type: "info" as const },
        { text: "[!] TRACE DETECTION TRIGGERED: DISCONNECT ADVISED", type: "error" as const },
        { text: "[+] EXFILTRATING... PACKET 1420/4482 [#######---]", type: "info" as const },
        { text: "[+] EXFILTRATING... PACKET 1980/4482 [########--]", type: "info" as const },
        { text: ">> INJECTING GHOST_ROOTKIT into SAT_OS_v4.2", type: "warning" as const },
        { text: "[SUCCESS] PERSISTENCE ESTABLISHED. SAT_LINK_HIDDEN", type: "success" as const },
      ];

      const log = logs[step % logs.length];
      addLog(log.text, log.type);
      
      if (step % 5 === 0) incrementTrace(2);
      
      step++;
    }, 1200);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        setHacking(false);
        addLog(">> HACKING SEQUENCE TERMINATED BY USER.", "error");
        clearInterval(interval);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isHacking]);

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
        addLog('AVAILABLE PROTOCOLS:', 'info');
        addLog('  crack [TARGET] [TYPE]   Initiate breach sequence', 'success');
        addLog('  hack                    Initiate satellite hacking automation', 'success');
        addLog('  scan                    Global SIGINT discovery', 'success');
        addLog('  ls                      List directory contents');
        addLog('  cd [dir]                Change directory');
        addLog('  cat [file]              Read file content');
        addLog('  clear                   Clear terminal history');
        addLog('  whoami                  Display current user info');
        break;

      case 'hack':
        setHacking(true);
        addLog('>> SATELLITE HACKING SEQUENCE INITIALIZED. Press "X" to terminate.', 'warning');
        break;

      case 'crack':
        if (!args[0]) {
          addLog('Usage: crack [TARGET_ID] [TYPE]', 'error');
          break;
        }
        const target = args[0];
        const type = args[1] || 'UNKNOWN';
        
        incrementTrace(15);
        addLog(`[+] TARGET ACQUIRED: ${target}`, 'warning');
        addLog(`[+] INJECTING PAYLOAD (${type})...`, 'warning');
        
        setTimeout(() => {
          if (Math.random() > 0.3) {
            addLog(`[SUCCESS] ROOT ACCESS GRANTED to ${target}`, 'success');
            addLog(`[DATA] Downloading secure files...`, 'info');
            
            // Simulate loot drop
            if (target.includes('NBD')) {
              addFile({ name: 'NBD_Ledger_2026.xlsx', content: 'ACCOUNT #99283: $42,000,000 (FROZEN)', type: 'text' });
              addLog('-> NBD_Ledger_2026.xlsx saved to /home/ghost', 'success');
            } else if (target.includes('BURJ')) {
              addFile({ name: 'Floor_154_Schematics.dwg', content: '[ENCRYPTED BLUEPRINT DATA]', type: 'binary' });
              addLog('-> Floor_154_Schematics.dwg saved to /home/ghost', 'success');
            } else if (target.includes('PALM')) {
              addFile({ name: 'VIP_Resident_List.csv', content: 'Villa 42: Sheikh M. // Villa 09: CEO Emaar', type: 'text' });
              addLog('-> VIP_Resident_List.csv saved to /home/ghost', 'success');
            } else if (target.includes('ROYAL')) {
              addFile({ name: 'Guest_List_VVIP.enc', content: 'Room 101: Diplomat X // Room 202: Agent 47', type: 'binary' });
              addLog('-> Guest_List_VVIP.enc saved to /home/ghost', 'success');
            } else {
              addFile({ name: 'User_Logs.txt', content: 'SMS: "Meet me at the Marina at 0200"', type: 'text' });
              addLog('-> User_Logs.txt saved to /home/ghost', 'success');
            }
          } else {
            addLog(`[FAILURE] FIREWALL DETECTED. TRACE INCREASED.`, 'error');
            incrementTrace(20);
          }
        }, 2000);
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
        addLog('INITIALIZING GLOBAL SIGINT...', 'warning');
        setTimeout(() => {
          addLog('FOUND: DUBAI_MALL_GUEST (Open)', 'success');
          addLog('FOUND: NBD_SECURE_NET (WPA3)', 'error');
          addLog('FOUND: PALM_RES_09 (Weak)', 'warning');
          openWindow('wifi');
        }, 1000);
        break;

      case 'whoami':
        addLog('ghost@dubai-grid-v8');
        break;

      default:
        addLog(`sh: command not found: ${cmd}`, 'error');
    }
  };

  return (
    <div 
      className="h-full flex flex-col font-mono text-sm overflow-hidden bg-black/90 p-2 pointer-events-auto"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
        {history.map((line) => (
          <div key={line.id} className={`break-all ${
            line.type === 'input' ? 'text-neon-cyan' : 
            line.type === 'error' ? 'text-red-500 font-bold' :
            line.type === 'success' ? 'text-emerald-400' :
            line.type === 'warning' ? 'text-yellow-400' :
            line.type === 'info' ? 'text-blue-400' :
            'text-gray-300'
          }`}>
            {line.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleCommand} className="flex mt-2 border-t border-white/10 pt-2">
        <span className="text-neon-cyan mr-2">{currentPath} $</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white font-bold"
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
};