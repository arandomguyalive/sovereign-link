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
import { EffectComposer, Bloom, Noise, Vignette, Glitch, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Zap, Smartphone, Crosshair, Signal, Lock, ShieldAlert } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  pink: '#FF0055',
  purple: '#6B0098',
  gold: '#FFD700',
  danger: '#FF3333',
  traffic_white: '#ffffff',
  traffic_red: '#ff0000'
};

type CityID = 'DUBAI' | 'NYC' | 'ABU_DHABI' | 'DOHA';

// --- CORE: Generic Dense City Grid ---
const DenseCity = ({ count = 1000, seed = 1 }) => {
  const range = 200;
  const buildings = useMemo(() => {
    const temp = [];
    const random = new THREE.Vector2(seed, seed); // Simple seed
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * range;
      const z = (Math.random() - 0.5) * range;
      if (Math.abs(x) < 15 && Math.abs(z) < 15) continue; 
      const h = Math.random() * 15 + 3;
      const w = Math.random() * 2 + 1;
      temp.push({ position: [x, h / 2, z] as [number, number, number], scale: [w, h, w] as [number, number, number] });
    }
    return temp;
  }, [count, seed]);

  return (
    <group>
      <Instances range={count}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#050505" metalness={1} roughness={0.1} transparent opacity={0.8} />
        {buildings.map((props, i) => <Instance key={i} position={props.position} scale={props.scale} />)}
      </Instances>
      <Instances range={count}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.1} />
        {buildings.map((props, i) => <Instance key={i} position={props.position} scale={props.scale} />)}
      </Instances>
    </group>
  );
};

// --- LANDMARKS: NYC ---
const NycLandmarks = ({ onHack }: any) => (
  <group>
    {/* One World Trade */}
    <group position={[0, 0, 0]} onClick={() => onHack("WTC_CORE")}>
      <mesh position={[0, 20, 0]}><cylinderGeometry args={[0, 3, 40, 4]} /><meshBasicMaterial color={COLORS.cyan} wireframe /></mesh>
      <Html position={[0, 42, 0]} distanceFactor={50}><div className="text-[10px] text-white font-black border border-white px-2 bg-black/80">ONE_WORLD_TRADE</div></Html>
    </group>
    {/* Empire State */}
    <group position={[20, 0, -30]} onClick={() => onHack("ESB_SIGINT")}>
      <mesh position={[0, 15, 0]}><boxGeometry args={[4, 30, 4]} /><meshBasicMaterial color={COLORS.cyan} wireframe opacity={0.3} /></mesh>
      <Html position={[0, 32, 0]} distanceFactor={50}><div className="text-[10px] text-white font-black border border-white px-2 bg-black/80">EMPIRE_STATE</div></Html>
    </group>
  </group>
);

// --- LANDMARKS: Abu Dhabi ---
const AbuDhabiLandmarks = ({ onHack }: any) => (
  <group>
    {/* Etihad Towers */}
    {[...Array(5)].map((_, i) => (
      <group key={i} position={[i * 3 - 5, 0, 0]} onClick={() => onHack(`ETIHAD_TOWER_0${i+1}`)}>
        <mesh position={[0, 10 + i, 0]}><cylinderGeometry args={[1, 1.5, 20 + i*2, 8]} /><meshBasicMaterial color={COLORS.gold} wireframe opacity={0.4} /></mesh>
      </group>
    ))}
    <Html position={[0, 25, 0]} distanceFactor={50}><div className="text-[10px] text-yellow-500 font-black border border-yellow-500 px-2 bg-black/80">ETIHAD_TOWERS_COMPLEX</div></Html>
  </group>
);

// --- LANDMARKS: Doha ---
const DohaLandmarks = ({ onHack }: any) => (
  <group>
    {/* Burj Doha (Tornado Tower) */}
    <group position={[0, 0, 0]} onClick={() => onHack("DOHA_CORE")}>
      <mesh position={[0, 10, 0]}><cylinderGeometry args={[2, 1.5, 20, 16]} /><meshBasicMaterial color={COLORS.pink} wireframe /></mesh>
      <Html position={[0, 22, 0]} distanceFactor={50}><div className="text-[10px] text-pink-500 font-black border border-pink-500 px-2 bg-black/80">BURJ_DOHA_SIGINT</div></Html>
    </group>
  </group>
);

// --- CORE: Landmarks Dubai (Restored) ---
const DubaiLandmarks = ({ onHack }: any) => (
  <group>
    <group onClick={() => onHack("BURJ_CORE_154")}>
      {[...Array(40)].map((_, i) => (
        <mesh key={i} position={[0, i * 1.1, 0]}>
          <cylinderGeometry args={[2.5 - i * 0.05, 2.7 - i * 0.05, 0.1, 6]} />
          <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.4} />
        </mesh>
      ))}
      <group position={[0, 32, 0]} onClick={(e) => { e.stopPropagation(); onHack("FLOOR_154_VAULT"); }}>
        <mesh><torusGeometry args={[3.2, 0.15, 16, 100]} /><meshBasicMaterial color={COLORS.danger} /></mesh>
        <Html distanceFactor={40}><div className="bg-red-600 text-white font-black px-2 py-1 text-[10px] animate-pulse border-2 border-white shadow-[0_0_30px_#ff0000]">⚠ RESTRICTED: FLOOR_154</div></Html>
      </group>
    </group>
    <group position={[-35, 0, 20]} rotation={[0, Math.PI / 4, 0]}>
      <mesh position={[0, 10, 0]}><cylinderGeometry args={[0, 5, 20, 3]} /><meshBasicMaterial color="white" wireframe transparent opacity={0.3} /></mesh>
      <Html position={[0, 22, 0]} distanceFactor={50}><div className="text-[10px] text-white font-black border border-white px-2 bg-black/80">BURJ_AL_ARAB</div></Html>
    </group>
  </group>
);

// --- TRAFFIC SYSTEM ---
const TrafficSystem = () => {
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-150, 0, 80),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(150, 0, -80),
  ]), []);

  return (
    <group>
      {[...Array(60)].map((_, i) => (
        <Vehicle key={i} path={path} color={i % 2 === 0 ? COLORS.traffic_white : COLORS.traffic_red} offset={i / 60} speed={1.5 + Math.random()} />
      ))}
    </group>
  );
};

const Vehicle = ({ path, color, offset, speed }: any) => {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const t = (state.clock.getElapsedTime() * speed * 0.05 + offset) % 1;
    const pos = path.getPointAt(t);
    mesh.current.position.set(pos.x, 0.3, pos.z);
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.4, 8, 8]} />
      <meshBasicMaterial color={color} />
      <pointLight color={color} intensity={2} distance={4} />
    </mesh>
  );
};

// --- MAIN ENGINE ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [view, setView] = useState<'ORBIT' | CityID>('ORBIT');
  const [crackedSats, setCrackedSats] = useState<string[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleHack = (satId: string, targetView: CityID) => {
    if (crackedSats.includes(satId)) { setView(targetView); return; }
    updateWindow('terminal', { isOpen: true });
    openWindow('terminal');
    addLog(`[!] SIGNAL_HIJACK INITIATED: ${satId} ...`, 'warning');
    setTimeout(() => {
      setCrackedSats(prev => [...prev, satId]);
      setView(targetView);
      addLog(`[SUCCESS] ${targetView} DOWNLINK ESTABLISHED.`, 'success');
    }, 2000);
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[1em] animate-pulse font-black">GLOBAL_SIGINT_BOOT</div>;

  return (
    <div className="w-full h-full bg-black relative cursor-crosshair pointer-events-auto">
      <Canvas gl={{ antialias: false, powerPreference: 'high-performance' }}>
        <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 20, 35] : [0, 100, 100]} fov={35} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={10} maxDistance={500} />
        <Stars radius={200} count={10000} factor={4} fade />
        <ambientLight intensity={0.5} />
        <pointLight position={[50, 100, 50]} intensity={2} color={COLORS.cyan} />

        {view === 'ORBIT' ? (
          <group rotation={[0, 0, 0.4]}>
            <mesh><sphereGeometry args={[10, 64, 64]} /><meshStandardMaterial color="#051030" metalness={1} /></mesh>
            <group position={[14, 2, 10]} onClick={() => handleHack('KH-11', 'DUBAI')}>
              <mesh><boxGeometry args={[1.2, 0.6, 0.8]} /><meshStandardMaterial color={crackedSats.includes('KH-11') ? '#0f0' : '#fff'} /></mesh>
              <Html distanceFactor={20} position={[0, 2, 0]}><div className="text-[10px] text-white font-black bg-black/90 p-2 border-2 border-neon-cyan animate-pulse">KH-11 [DUBAI]</div></Html>
            </group>
            <group position={[-14, 5, 8]} onClick={() => handleHack('SENTINEL-X', 'NYC')}>
              <mesh><boxGeometry args={[1.2, 0.6, 0.8]} /><meshStandardMaterial color={crackedSats.includes('SENTINEL-X') ? '#0f0' : '#fff'} /></mesh>
              <Html distanceFactor={20} position={[0, 2, 0]}><div className="text-[10px] text-white font-black bg-black/90 p-2 border-2 border-neon-cyan animate-pulse">SENTINEL-X [NYC]</div></Html>
            </group>
            <group position={[5, 14, -6]} onClick={() => handleHack('FALCON-1', 'ABU_DHABI')}>
              <mesh><boxGeometry args={[1.2, 0.6, 0.8]} /><meshStandardMaterial color={crackedSats.includes('FALCON-1') ? '#0f0' : '#fff'} /></mesh>
              <Html distanceFactor={20} position={[0, 2, 0]}><div className="text-[10px] text-white font-black bg-black/90 p-2 border-2 border-neon-cyan animate-pulse">FALCON-1 [ABU_DHABI]</div></Html>
            </group>
            <group position={[-6, -14, 4]} onClick={() => handleHack('Q-SAT', 'DOHA')}>
              <mesh><boxGeometry args={[1.2, 0.6, 0.8]} /><meshStandardMaterial color={crackedSats.includes('Q-SAT') ? '#0f0' : '#fff'} /></mesh>
              <Html distanceFactor={20} position={[0, 2, 0]}><div className="text-[10px] text-white font-black bg-black/90 p-2 border-2 border-neon-cyan animate-pulse">Q-SAT [DOHA]</div></Html>
            </group>
          </group>
        ) : (
          <group>
            <DenseCity seed={view === 'NYC' ? 2 : 1} count={view === 'NYC' ? 2000 : 1000} />
            {view === 'DUBAI' && <DubaiLandmarks onHack={(id: string) => setSelected({id})} />}
            {view === 'NYC' && <NycLandmarks onHack={(id: string) => setSelected({id})} />}
            {view === 'ABU_DHABI' && <AbuDhabiLandmarks onHack={(id: string) => setSelected({id})} />}
            {view === 'DOHA' && <DohaLandmarks onHack={(id: string) => setSelected({id})} />}
            <TrafficSystem />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <planeGeometry args={[1000, 1000, 100, 100]} />
              <meshBasicMaterial color={COLORS.blue} wireframe opacity={0.05} transparent />
            </mesh>
          </group>
        )}

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.1} intensity={1.5} mipmapBlur radius={0.4} />
          <Scanline opacity={0.1} />
          <Noise opacity={0.05} />
          <Glitch delay={new THREE.Vector2(3, 7)} duration={new THREE.Vector2(0.1, 0.2)} strength={new THREE.Vector2(0.1, 0.1)} />
          <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
        </EffectComposer>
      </Canvas>

      {/* GLOBAL HUD */}
      <div className="absolute top-6 left-6 font-mono pointer-events-none select-none">
        <div className="flex items-center gap-4 mb-2">
          <Globe size={32} className="text-neon-cyan" />
          <div className="text-3xl text-neon-cyan font-black tracking-[0.6em]">GHOST_GLOBAL_V20</div>
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest">Downlink: {view} // Locked: {crackedSats.length}</div>
        {view !== 'ORBIT' && (
          <button onClick={() => setView('ORBIT')} className="mt-8 px-8 py-3 border-2 border-red-500 text-red-500 text-[11px] font-black uppercase pointer-events-auto hover:bg-red-500/20 transition-all shadow-[0_0_40px_rgba(255,0,0,0.3)]">
            TERMINATE_UPLINK
          </button>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} className="absolute top-24 right-6 w-[450px] bg-black/95 border-l-4 border-neon-cyan p-8 font-mono z-[2000] shadow-2xl pointer-events-auto">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <div className="text-xl text-neon-cyan font-black tracking-widest italic uppercase">SIGINT_DUMP // {selected.id}</div>
              <button onClick={() => setSelected(null)} className="text-white hover:text-red-500 transition-colors font-bold text-lg">X</button>
            </div>
            <div className="space-y-4">
              <div className="text-xs text-neon-cyan font-black mb-2 uppercase tracking-widest">Endpoints_Captured:</div>
              <div className="h-[400px] overflow-y-auto scrollbar-hide space-y-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900/80 p-4 border border-white/5 hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center gap-4">
                      <Smartphone size={20} className="text-emerald-400" />
                      <div>
                        <div className="text-[11px] text-white font-black uppercase">Device_{Math.random().toString(16).slice(2,6)}</div>
                        <div className="text-[9px] text-white/30 font-mono tracking-widest">{Array(6).fill(0).map(() => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':').toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-right"><div className="text-[10px] text-emerald-400 font-black animate-pulse">STABLE</div><div className="text-[9px] text-white/20">-{Math.floor(Math.random()*40+50)}dBm</div></div>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full mt-10 py-4 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 text-xs font-black hover:bg-emerald-500/30 uppercase tracking-[0.3em] transition-all">
              EXECUTE_REMOTE_EXFILTRATION
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <Crosshair size={120} className="text-neon-cyan" strokeWidth={0.5} />
      </div>
    </div>
  );
};
