import { create } from 'zustand';

export type AppId = 'terminal' | 'camera' | 'wifi' | 'network' | 'cracker' | 'map';

export interface WindowInstance {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMaximized: boolean;
  zIndex: number;
  width: number;
  height: number;
  x: number;
  y: number;
}

interface WindowState {
  windows: Record<AppId, WindowInstance>;
  activeWindow: AppId | null;
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  updateWindow: (id: AppId, updates: Partial<WindowInstance>) => void;
}

export const useWindowManager = create<WindowState>((set) => ({
  windows: {
    terminal: { id: 'terminal', title: 'root@sovereign:~', isOpen: true, isMaximized: false, zIndex: 10, width: 700, height: 450, x: 50, y: 50 },
    camera: { id: 'camera', title: 'GOD-EYE // CCTV_FEED', isOpen: true, isMaximized: false, zIndex: 11, width: 800, height: 500, x: 100, y: 100 },
    wifi: { id: 'wifi', title: 'WIFI_SNIFFER v2.1', isOpen: false, isMaximized: false, zIndex: 1, width: 600, height: 400, x: 150, y: 150 },
    network: { id: 'network', title: 'LOCAL_NETWORK_MAP', isOpen: false, isMaximized: false, zIndex: 1, width: 600, height: 400, x: 200, y: 200 },
    cracker: { id: 'cracker', title: 'HYDRA_FORCE // BRUTE', isOpen: false, isMaximized: false, zIndex: 1, width: 500, height: 450, x: 250, y: 250 },
    map: { id: 'map', title: 'TACTICAL_MAP // CORE_GRID', isOpen: false, isMaximized: false, zIndex: 1, width: 900, height: 600, x: 50, y: 50 },
  },
  activeWindow: 'camera',
  openWindow: (id) => set((state) => {
    const maxZ = Math.max(...Object.values(state.windows).map(w => w.zIndex));
    return {
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], isOpen: true, zIndex: maxZ + 1 }
      },
      activeWindow: id
    };
  }),
  closeWindow: (id) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], isOpen: false }
    }
  })),
  focusWindow: (id) => set((state) => {
    const maxZ = Math.max(...Object.values(state.windows).map(w => w.zIndex));
    return {
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], zIndex: maxZ + 1 }
      },
      activeWindow: id
    };
  }),
  updateWindow: (id, updates) => set((state) => ({
    windows: {
      ...state.windows,
      [id]: { ...state.windows[id], ...updates }
    }
  })),
}));
