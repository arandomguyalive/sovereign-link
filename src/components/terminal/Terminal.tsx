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

    let isMounted = true;
    let step = 0;
    
    const phases = [
      { name: 'INITIALIZING', weight: 10, logs: [
        { text: ">> BOOTING SAT-LINK MODULE v4.2.0...", type: "warning" },
        { text: "[*] WARMING UP RF FRONT-END...", type: "info" },
        { text: "[*] TUNING TO Ka-BAND FREQUENCIES...", type: "info" },
        { text: "[+] GLOBAL SIGINT ENGINE: ONLINE", type: "success" },
        { text: "[*] SEARCHING FOR OVERHEAD ASSETS...", type: "info" },
        { text: "[!] ASSET FOUND: AL-QURAIN_SAT_01 (ID: 44382)", type: "warning" },
        { text: "[+] FETCHING TLE DATA FROM SPACE-TRACK... SUCCESS", type: "success" },
      ]},
      { name: 'HANDSHAKE', weight: 15, logs: [
        { text: "[*] CALCULATING DOPPLER COMPENSATION...", type: "info" },
        { text: "[*] ORBITAL PARAMETERS: ALT=357.8km VEL=7.66km/s", type: "info" },
        { text: ">> INITIATING CARRIER LOCK... [0%]", type: "warning" },
        { text: ">> INITIATING CARRIER LOCK... [42%]", type: "warning" },
        { text: ">> INITIATING CARRIER LOCK... [89%]", type: "warning" },
        { text: "[+] CARRIER LOCK ESTABLISHED @ 14.225 GHz", type: "success" },
        { text: ">> HANDSHAKE: GND-STATION-7 -> AQ_SAT_01", type: "warning" },
        { text: "[*] NEGOTIATING RSA-4096 ENCRYPTED TUNNEL...", type: "info" },
        { text: "[!] AUTHENTICATION CHALLENGE RECEIVED", type: "error" },
      ]},
      { name: 'EXPLOITATION', weight: 20, logs: [
        { text: ">> ATTEMPTING ZERO-DAY BYPASS (CVE-2026-9912)...", type: "warning" },
        { text: "[*] INJECTING BUFFER OVERFLOW PAYLOAD...", type: "info" },
        { text: "[*] TARGETING SAT_OS KERNEL SPACE...", type: "info" },
        { text: "[+] HEAP SPRAY SUCCESSFUL. REDIRECTING EXECUTION...", type: "success" },
        { text: ">> GAINING ROOT PRIVILEGES... [##########] 100%", type: "success" },
        { text: "[!] SYSTEM WARNING: ATTITUDE CONTROL NOMINAL", type: "warning" },
        { text: "[*] DISABLING TELEMETRY LOGGING...", type: "info" },
        { text: "[+] LOGS REDIRECTED TO /dev/null", type: "success" },
        { text: ">> DEPLOYING PERSISTENT BACKDOOR...", type: "warning" },
      ]},
      { name: 'EXFILTRATION', weight: 1000, logs: [
        { text: "[*] SCANNING ONBOARD MEMORY BANKS...", type: "info" },
        { text: "[+] FOUND: CLASSIFIED_COMMS_ARCHIVE.tar.gz", type: "success" },
        { text: ">> INITIATING HIGH-SPEED DOWNLINK...", type: "warning" },
        { text: "[+] EXFILTRATING... PKT_{RAND} [########--] 82%", type: "info" },
        { text: "[*] SIGNAL NOISE RATIO: {SNR}dB", type: "info" },
        { text: "[!] TRACE DETECTION: LOW RISK", type: "success" },
        { text: "[+] EXFILTRATING... PKT_{RAND} [#########-] 91%", type: "info" },
        { text: "[!] TRACE DETECTION: MODERATE RISK", type: "warning" },
        { text: "[*] ROTATING PROXY SAT-LINK...", type: "info" },
        { text: "[+] EXFILTRATING... PKT_{RAND} [##########] 100%", type: "success" },
        { text: "[+] DOWNLOAD COMPLETE: 14.2 GB SECURED", type: "success" },
        { text: ">> SCANNING NEXT TARGET SECTOR...", type: "warning" },
      ]}
    ];

    const runHacking = async () => {
      let currentPhaseIdx = 0;
      let logIdx = 0;

      while (isMounted && isHacking) {
        const currentPhase = phases[currentPhaseIdx];
        let log = currentPhase.logs[logIdx];

        // Randomize some log content
        let logText = log.text
          .replace('{RAND}', Math.floor(Math.random() * 9999).toString())
          .replace('{SNR}', (Math.random() * 10 + 5).toFixed(2));

        addLog(logText, log.type as any);

        if (step % 4 === 0) incrementTrace(1);

        logIdx++;
        step++;

        // Advance phase
        if (logIdx >= currentPhase.logs.length) {
          if (currentPhaseIdx < phases.length - 1) {
            currentPhaseIdx++;
            logIdx = 0;
            // Longer delay between phases
            await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));
          } else {
            // Loop the last phase with randomized PKTs
            logIdx = currentPhase.logs.length - 4; // Stay in exfiltration loop
          }
        }

        // Variable delay
        const baseDelay = currentPhaseIdx === 0 ? 1500 : 800;
        const delay = baseDelay + Math.random() * 1500;
        await new Promise(r => setTimeout(r, delay));
      }
    };

    runHacking();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        setHacking(false);
        addLog(">> CONNECTION SEVERED. ENCRYPTION KEYS PURGED.", "error");
        isMounted = false;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      isMounted = false;
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
          addLog('FOUND: GRID_NODE_882 (Open)', 'success');
          addLog('FOUND: NBD_SECURE_NET (WPA3)', 'error');
          addLog('FOUND: PALM_RES_09 (Weak)', 'warning');
          openWindow('wifi');
        }, 1000);
        break;

      case 'whoami':
        addLog('ghost@core-grid-v8');
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