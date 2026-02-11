'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  MapControls, 
  Stars, 
  PerspectiveCamera, 
  Html, 
  Instances, 
  Instance,
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Smartphone, ShieldAlert, Cpu, Crosshair, Activity, Database, Lock, Unlock, Signal } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  gold: '#FFD700',
  danger: '#FF3333',
  success: '#00FF66',
  bg: '#020202'
};

// --- CORE: Geospatial Digital Twin Landmarks ---
const BurjKhalifa = ({ onSelect }: any) => (
  <group position={[40, 0, -40]} onClick={(e) => { e.stopPropagation(); onSelect("BURJ_CORE_154", "INFRASTRUCTURE"); }}>
    {[...Array(30)].map((_, i) => (
      <mesh key={i} position={[0, i * 1.5, 0]}>
        <cylinderGeometry args={[2.5 - i * 0.08, 2.7 - i * 0.08, 1.2, 3]} />
        <meshStandardMaterial color="#050505" metalness={1} roughness={0.1} transparent opacity={0.8} />
        <lineSegments>
          <edgesGeometry args={[new THREE.CylinderGeometry(2.5 - i * 0.08, 2.7 - i * 0.08, 1.2, 3)]} />
          <lineBasicMaterial color={COLORS.cyan} transparent opacity={0.4} />
        </lineSegments>
      </mesh>
    ))}
    <Html position={[0, 50, 0]} distanceFactor={60}><div className="text-[10px] text-neon-cyan border border-neon-cyan px-2 bg-black font-black">TARGET: BURJ_KHALIFA</div></Html>
  </group>
);

const BurjAlArab = ({ onSelect }: any) => (
  <group position={[-15, 0, 10]} rotation={[0, Math.PI / 4, 0]} onClick={(e) => { e.stopPropagation(); onSelect("AL_ARAB_HUB", "INFRASTRUCTURE"); }}>
    <mesh position={[0, 8, 0]}>
      <cylinderGeometry args={[0, 4, 16, 3]} />
      <meshStandardMaterial color="#fff" transparent opacity={0.1} />
      <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0, 4, 16, 3)]} /><lineBasicMaterial color={COLORS.cyan} /></lineSegments>
    </mesh>
    <Html position={[0, 18, 0]} distanceFactor={50}><div className="text-[10px] text-white font-black border border-white px-2 bg-black/80">TARGET: BURJ_AL_ARAB</div></Html>
  </group>
);

const PalmJumeirah = ({ onSelect }: any) => (
  <group position={[-60, 0.1, 40]} rotation={[-Math.PI / 2, 0, -0.8]} onClick={(e) => { e.stopPropagation(); onSelect("PALM_GRID_MASTER", "RESIDENTIAL"); }}>
    <mesh><planeGeometry args={[4, 18]} /><meshBasicMaterial color={COLORS.blue} wireframe opacity={0.2} /></mesh>
    {[...Array(17)].map((_, i) => (
      <group key={i} rotation={[0, 0, (i / 16) * Math.PI - Math.PI / 2]} position={[0, i * 1 - 5, 0]}>
        <mesh position={[5, 0, 0]}><planeGeometry args={[10, 0.3]} /><meshBasicMaterial color={COLORS.blue} wireframe /></mesh>
      </group>
    ))}
    <Html position={[0, 0, 2]} distanceFactor={60}><div className="text-[10px] text-blue-400 font-black border border-blue-500 px-2 bg-black/90">SECTOR: PALM_JUMEIRAH</div></Html>
  </group>
);

const BankNBD = ({ onSelect }: any) => (
  <group position={[20, 0, -10]} onClick={(e) => { e.stopPropagation(); onSelect("NBD_VAULT_CORE", "FINANCIAL"); }}>
    <mesh position={[0, 4, 0]}><boxGeometry args={[6, 8, 4]} /><meshStandardMaterial color="#050505" metalness={1} /><lineSegments><edgesGeometry args={[new THREE.BoxGeometry(6, 8, 4)]} /><lineBasicMaterial color={COLORS.gold} /></lineSegments></mesh>
    <Html position={[0, 10, 0]} distanceFactor={40}><div className="text-[10px] text-yellow-500 font-black border-2 border-yellow-500 px-2 bg-black/90 uppercase">$ NBD_CENTRAL_BANK</div></Html>
  </group>
);

// --- AGENTS: Animated Lidar Humanoids ---
const LidarAgent = ({ position, onSelect }: any) => {
  const ref = useRef<THREE.Group>(null);
  const [speed] = useState(0.03 + Math.random() * 0.04);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.x += Math.sin(t * speed + position[0]) * 0.05;
    ref.current.position.z += Math.cos(t * speed + position[2]) * 0.05;
  });
  return (
    <group ref={ref} position={position} onClick={(e) => { e.stopPropagation(); onSelect(`HUMAN_${Math.random().toString(16).slice(2,6)}`, "BIOMETRIC"); }}>
      <mesh position={[0, 0.9, 0]}><capsuleGeometry args={[0.15, 0.6, 4, 8]} /><meshBasicMaterial color="#fff" wireframe /></mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]}><ringGeometry args={[0.4, 0.5, 16]} /><meshBasicMaterial color={COLORS.cyan} transparent opacity={0.5} /></mesh>
    </group>
  );
};

// --- INTELLIGENCE DOSSIER SIDEBAR ---
const IntelligenceSidebar = ({ target, isBreached, onClose }: any) => {
  if (!target) return null;
  const devices = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    model: ['iPhone 15 Pro', 'Samsung S24', 'MacBook Air M3', 'Pixel 9', 'Tesla Model S', 'Cisco Router'][Math.floor(Math.random() * 6)],
    mac: Array(6).fill(0).map(() => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':').toUpperCase(),
    imei: Math.floor(Math.random() * 1000000000000000),
    signal: `-${Math.floor(Math.random() * 40 + 50)}dBm`
  })), [target.id]);

  return (
    <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} className="absolute top-20 right-6 w-[450px] bg-black/95 border-l-4 border-neon-cyan p-8 font-mono z-[2000] shadow-2xl pointer-events-auto">
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          {isBreached ? <Unlock className="text-emerald-400" size={24} /> : <Lock className="text-red-500" size={24} />}
          <div className="text-xl text-neon-cyan font-black tracking-widest uppercase italic">SIGINT_REPORT // {target.id}</div>
        </div>
        <button onClick={onClose} className="text-white hover:text-red-500 font-bold text-lg">X</button>
      </div>

      {!isBreached ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldAlert size={64} className="text-red-500 mb-4 animate-pulse" />
          <div className="text-red-500 font-black text-lg mb-2">ACCESS_DENIED</div>
          <div className="text-white/40 text-xs">TERMINAL COMMAND REQUIRED: <br/> <span className="text-white">breach {target.id}</span></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-emerald-500/10 border-l-2 border-emerald-500 p-4 shadow-lg">
            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Breach_Status: Successful</div>
            <div className="text-lg text-white font-black mt-1 uppercase tracking-tighter">{target.type} // DATA_DUMP_ACTIVE</div>
          </div>

          <div className="text-[10px] text-neon-cyan font-black uppercase border-b border-neon-cyan/20 pb-1">Intercepted_Signal_Cloud:</div>
          <div className="h-[400px] overflow-y-auto scrollbar-hide space-y-2">
            {devices.map((d, i) => (
              <div key={i} className="bg-zinc-900/80 p-4 border border-white/5 hover:border-emerald-500 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-emerald-400" />
                    <span className="text-[11px] text-white font-black">{d.model}</span>
                  </div>
                  <span className="text-[9px] text-emerald-400/60 font-mono">{d.signal}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[8px] text-white/30 uppercase">
                  <span>MAC: {d.mac}</span>
                  <span>IMEI: {d.imei}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-[0_0_30px_#00FF66]">
            DOWNLOAD_FULL_INTEL_PACKAGE.TAR
          </button>
        </div>
      )}
    </motion.div>
  );
};

// --- MAIN SIMULATION ENGINE ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog, history } = useTerminal();
  const [view, setView] = useState<'ORBIT' | 'GROUND'>('ORBIT');
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [breachedTargets, setBreachedTargets] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Listen for terminal commands
  useEffect(() => {
    const lastCommand = history[history.length - 1];
    if (lastCommand?.type === 'input' && lastCommand.text.startsWith('breach ')) {
      const targetId = lastCommand.text.split(' ')[1];
      if (selectedTarget && targetId === selectedTarget.id) {
        addLog(`[+] EXECUTING EXPLOIT ON ${targetId}...`, 'warning');
        setTimeout(() => {
          setBreachedTargets(prev => [...prev, targetId]);
          addLog(`[SUCCESS] FIREWALL BYPASSED. SIGINT FLOWING.`, 'success');
        }, 1500);
      } else {
        addLog(`[ERROR] TARGET NOT LOCKED OR INVALID ID`, 'error');
      }
    }
  }, [history]);

  const handleSatHack = () => {
    updateWindow('terminal', { isOpen: true, title: 'UPLINK_ESTABLISHED // KH-11' });
    openWindow('terminal');
    addLog('[+] SATELLITE HANDSHAKE INITIATED...', 'info');
    setTimeout(() => {
      setView('GROUND');
      addLog('[SUCCESS] DOWNLINK ACTIVE. DESCENDING TO GRID.', 'success');
    }, 1500);
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[1em] animate-pulse font-black">NEURAL_GRID_BOOT</div>;

  return (
    <div className="w-full h-full bg-black relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows gl={{ antialias: false }}>
        <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 20, 35] : [0, 80, 100]} fov={35} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={10} maxDistance={400} />
        <Stars radius={300} count={20000} factor={4} fade />
        <ambientLight intensity={0.5} />
        <pointLight position={[50, 100, 50]} intensity={2} color={COLORS.cyan} />

        {view === 'ORBIT' ? (
          <group rotation={[0, 0, 0.4]}>
            <mesh><sphereGeometry args={[10, 64, 64]} /><meshStandardMaterial color="#051030" metalness={1} /></mesh>
            <group position={[14, 2, 10]} onClick={handleSatHack}>
              <mesh><boxGeometry args={[1.5, 0.6, 1]} /><meshStandardMaterial color="#fff" /></mesh>
              <Html distanceFactor={20} position={[0, 3, 0]}><div className="text-[10px] text-white font-black bg-black/90 p-2 border-2 border-neon-cyan animate-pulse">KH-11 [SATELLITE]</div></Html>
            </group>
          </group>
        ) : (
          <group>
            {/* Real Coastline Separation */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 50]}><planeGeometry args={[1000, 1000]} /><meshStandardMaterial color="#05101a" metalness={0.9} roughness={0.1} /></mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, -50]}><planeGeometry args={[1000, 1000]} /><meshStandardMaterial color="#020202" /></mesh>
            
            <BurjKhalifa onSelect={(id: string, type: string) => setSelectedTarget({id, type})} />
            <BurjAlArab onSelect={(id: string, type: string) => setSelectedTarget({id, type})} />
            <PalmJumeirah onSelect={(id: string, type: string) => setSelectedTarget({id, type})} />
            <BankNBD onSelect={(id: string, type: string) => setSelectedTarget({id, type})} />

            {[...Array(50)].map((_, i) => (
              <LidarAgent key={i} position={[(Math.random()-0.5)*150, 0, (Math.random()-0.5)*150]} onSelect={(id: string, type: string) => setSelectedTarget({id, type})} />
            ))}
          </group>
        )}

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.1} intensity={1.5} mipmapBlur radius={0.4} />
          <Scanline opacity={0.2} />
          <Noise opacity={0.05} />
          <Glitch delay={new THREE.Vector2(3, 10)} duration={new THREE.Vector2(0.1, 0.2)} />
        </EffectComposer>
      </Canvas>

      <div className="absolute top-6 left-6 font-mono pointer-events-none select-none">
        <div className="flex items-center gap-4 mb-2">
          <Globe size={32} className="text-neon-cyan" />
          <div className="text-3xl text-neon-cyan font-black tracking-[0.6em]">NEURAL_GRID_V24</div>
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest">Satellite Link: {view} // Locked: {selectedTarget?.id || 'NONE'}</div>
      </div>

      <AnimatePresence>
        {selectedTarget && (
          <IntelligenceSidebar 
            target={selectedTarget} 
            isBreached={breachedTargets.includes(selectedTarget.id)} 
            onClose={() => setSelectedTarget(null)} 
          />
        )}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <Crosshair size={120} className="text-neon-cyan" strokeWidth={0.5} />
      </div>
    </div>
  );
};
