import { create } from 'zustand';

export type AppId = 'terminal' | 'camera' | 'wifi' | 'network' | 'cracker' | 'map';

export interface WindowInstance {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface WindowState {
  windows: Record<AppId, WindowInstance>;
  activeWindow: AppId | null;
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
}

export const useWindowManager = create<WindowState>((set, get) => ({
  windows: {
    terminal: { id: 'terminal', title: 'root@sovereign:~', isOpen: true, isMaximized: false, zIndex: 10 },
    camera: { id: 'camera', title: 'GOD-EYE // CCTV_FEED', isOpen: false, isMaximized: false, zIndex: 1 },
    wifi: { id: 'wifi', title: 'WIFI_SNIFFER v2.1', isOpen: false, isMaximized: false, zIndex: 1 },
    network: { id: 'network', title: 'LOCAL_NETWORK_MAP', isOpen: false, isMaximized: false, zIndex: 1 },
    cracker: { id: 'cracker', title: 'HYDRA_FORCE // BRUTE', isOpen: false, isMaximized: false, zIndex: 1 },
    map: { id: 'map', title: 'GEO_TRACE', isOpen: false, isMaximized: false, zIndex: 1 },
  },
  activeWindow: 'terminal',
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
}));
