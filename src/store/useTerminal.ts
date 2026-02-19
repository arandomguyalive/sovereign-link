import { create } from 'zustand';

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'warning' | 'info';
  text: string;
  timestamp: number;
}

export interface HackedFile {
  name: string;
  content: string;
  type: 'text' | 'image' | 'binary';
}

interface TerminalState {
  history: TerminalLine[];
  traceLevel: number;
  isLocked: boolean;
  isHacking: boolean;
  hackedFiles: HackedFile[];
  addLog: (text: string, type?: TerminalLine['type']) => void;
  clearHistory: () => void;
  incrementTrace: (amount: number) => void;
  setLocked: (locked: boolean) => void;
  setHacking: (hacking: boolean) => void;
  addFile: (file: HackedFile) => void;
}

export const useTerminal = create<TerminalState>((set) => ({
  history: [
    { id: '1', type: 'output', text: 'GHOST_OS v8.0-KERNEL_INIT', timestamp: Date.now() },
    { id: '2', type: 'output', text: 'Secure Uplink Established. Type "help" to begin operations.', timestamp: Date.now() },
  ],
  traceLevel: 0,
  isLocked: false,
  isHacking: false,
  hackedFiles: [],
  addLog: (text, type = 'output') => set((state) => ({
    history: [...state.history, { id: Math.random().toString(36), text, type, timestamp: Date.now() }]
  })),
  clearHistory: () => set({ history: [] }),
  incrementTrace: (amount) => set((state) => ({
    traceLevel: Math.min(100, state.traceLevel + amount)
  })),
  setLocked: (locked) => set({ isLocked: locked }),
  setHacking: (hacking) => set({ isHacking: hacking }),
  addFile: (file) => set((state) => ({
    hackedFiles: [...state.hackedFiles, file]
  })),
}));