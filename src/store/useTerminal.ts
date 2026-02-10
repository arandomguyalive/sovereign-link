import { create } from 'zustand';

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'warning';
  text: string;
  timestamp: number;
}

interface TerminalState {
  history: TerminalLine[];
  traceLevel: number; // 0 to 100
  isLocked: boolean;
  addLog: (text: string, type?: TerminalLine['type']) => void;
  clearHistory: () => void;
  incrementTrace: (amount: number) => void;
  setLocked: (locked: boolean) => void;
}

export const useTerminal = create<TerminalState>((set) => ({
  history: [
    { id: '1', type: 'output', text: 'SOVEREIGN OS v4.2.0-STABLE', timestamp: Date.now() },
    { id: '2', type: 'output', text: 'Neural-Link Established. Type "help" for instructions.', timestamp: Date.now() },
  ],
  traceLevel: 0,
  isLocked: false,
  addLog: (text, type = 'output') => set((state) => ({
    history: [...state.history, { id: Math.random().toString(36), text, type, timestamp: Date.now() }]
  })),
  clearHistory: () => set({ history: [] }),
  incrementTrace: (amount) => set((state) => ({
    traceLevel: Math.min(100, state.traceLevel + amount)
  })),
  setLocked: (locked) => set({ isLocked: locked }),
}));
