import { create } from 'zustand';

export interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: string[]; // Names of children if directory
  permissions: string;
  owner: string;
  hidden?: boolean;
}

interface FileSystemState {
  fs: Record<string, FileSystemItem>;
  currentPath: string;
  cd: (path: string) => void;
  readFile: (name: string) => string | null;
  mkdir: (name: string) => void;
  touch: (name: string, content?: string) => void;
}

const INITIAL_FS: Record<string, FileSystemItem> = {
  '/': { name: '/', type: 'directory', children: ['bin', 'etc', 'home', 'logs', 'sys', 'mnt', 'opt'], permissions: 'drwxr-xr-x', owner: 'root' },
  '/bin': { name: 'bin', type: 'directory', children: ['nmap', 'ssh', 'aircrack', 'hydra', 'decrypt', 'ghost-protocol'], permissions: 'drwxr-xr-x', owner: 'root' },
  '/bin/nmap': { name: 'nmap', type: 'file', content: 'BINARY_DATA_ENCRYPTED', permissions: '-rwxr-xr-x', owner: 'root' },
  '/bin/ghost-protocol': { name: 'ghost-protocol', type: 'file', content: 'v4.2.0 SOURCE_CODE: ENCRYPTED', permissions: '-rwxr-xr-x', owner: 'root' },
  '/etc': { name: 'etc', type: 'directory', children: ['hosts', 'shadow', 'config', 'motd', 'networks'], permissions: 'drwxr-xr-x', owner: 'root' },
  '/etc/hosts': { name: 'hosts', type: 'file', content: `127.0.0.1 localhost
192.168.1.1 gateway
10.0.0.5 target-mainframe
10.0.8.44 makkah-uplink
10.10.1.1 burj-khalifa-core`, permissions: '-rw-r--r--', owner: 'root' },
  '/etc/motd': { name: 'motd', type: 'file', content: 'WARNING: Unauthorized access to this system is strictly prohibited.', permissions: '-rw-r--r--', owner: 'root' },
  '/etc/shadow': { name: 'shadow', type: 'file', content: 'root:$6$v.P/Gj8$m7...:18234:0:99999:7:::', permissions: '-rw-------', owner: 'root' },
  '/home': { name: 'home', type: 'directory', children: ['ghost', 'admin'], permissions: 'drwxr-xr-x', owner: 'root' },
  '/home/ghost': { name: 'ghost', type: 'directory', children: ['notes.txt', 'targets.json', 'exploit_db'], permissions: 'drwxr-xr-x', owner: 'ghost' },
  '/home/ghost/notes.txt': { name: 'notes.txt', type: 'file', content: `Target confirmed: Burj Khalifa Zone 154.
Encryption level: Sovereign.
Status: Pending...
Note: Check the 154th floor for the physical vault uplink.`, permissions: '-rw-r--r--', owner: 'ghost' },
  '/home/ghost/targets.json': { name: 'targets.json', type: 'file', content: '[{"id": "DXB-01", "ip": "10.10.1.1", "priority": "CRITICAL"}]', permissions: '-rw-r--r--', owner: 'ghost' },
  '/logs': { name: 'logs', type: 'directory', children: ['auth.log', 'syslog', 'trace.log'], permissions: 'drwxr-xr-x', owner: 'root' },
  '/sys': { name: 'sys', type: 'directory', children: ['kernel', 'network', 'power'], permissions: 'drwxr-xr-x', owner: 'root' },
};

export const useFileSystem = create<FileSystemState>((set, get) => ({
  fs: INITIAL_FS,
  currentPath: '/home/ghost',
  cd: (path) => {
    const { fs, currentPath } = get();
    if (path === '..') {
      if (currentPath === '/') return;
      const parts = currentPath.split('/').filter(Boolean);
      parts.pop();
      set({ currentPath: '/' + parts.join('/') });
      return;
    }
    if (path === '/') {
      set({ currentPath: '/' });
      return;
    }
    
    // Simple absolute vs relative path logic
    const absolutePath = path.startsWith('/') ? path : `${currentPath === '/' ? '' : currentPath}/${path}`;
    const target = fs[absolutePath];
    
    if (target && target.type === 'directory') {
      set({ currentPath: absolutePath });
    } else {
      throw new Error(`cd: ${path}: No such directory`);
    }
  },
  readFile: (name) => {
    const { fs, currentPath } = get();
    const path = name.startsWith('/') ? name : `${currentPath === '/' ? '' : currentPath}/${name}`;
    const file = fs[path];
    if (file && file.type === 'file') return file.content || '';
    return null;
  },
  mkdir: (name) => {
    // Implementation for realism
  },
  touch: (name, content = '') => {
    // Implementation for realism
  }
}));
