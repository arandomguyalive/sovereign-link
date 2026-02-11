'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  MapControls, 
  Stars, 
  PerspectiveCamera, 
  Html, 
  Float, 
  MeshTransmissionMaterial,
  Instances,
  Instance,
  Detailed
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, Glitch, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Zap, ShieldAlert, Cpu, Crosshair, Activity, Database, Smartphone } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  pink: '#FF0055',
  purple: '#6B0098',
  gold: '#FFD700',
  danger: '#FF3333',
  bg: '#010101'
};

// --- CORE: Massive Instanced City Grid ---
const DenseCity = ({ count = 1500 }) => {
  const range = 150;
  const data = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * range;
      const z = (Math.random() - 0.5) * range;
      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue; 
      
      const h = Math.random() * 12 + 2;
      const w = Math.random() * 1.5 + 0.5;
      temp.push({
        position: [x, h / 2, z] as [number, number, number],
        scale: [w, h, w] as [number, number, number],
        id: `BLDG-${i}`
      });
    }
    return temp;
  }, [count]);

  return (
    <group>
      <Instances>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#050505" transparent opacity={0.8} metalness={1} roughness={0} />
        {data.map((props, i) => (
          <Instance key={i} {...props} />
        ))}
      </Instances>
      <Instances>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.1} />
        {data.map((props, i) => (
          <Instance key={i} {...props} />
        ))}
      </Instances>
    </group>
  );
};

const BurjKhalifa = ({ onHack }: any) => {
  const ref = useRef<THREE.Group>(null);
  return (
    <group ref={ref} position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onHack("BURJ_KHALIFA_SYSTEMS"); }}>
      {[...Array(40)].map((_, i) => (
        <mesh key={i} position={[0, i * 1.2, 0]}>
          <cylinderGeometry args={[2 - i * 0.04, 2.2 - i * 0.04, 0.1, 6]} />
          <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 24, 0]}>
        <cylinderGeometry args={[0.1, 2.5, 48, 6]} />
        <meshBasicMaterial color={COLORS.blue} wireframe transparent opacity={0.2} />
      </mesh>
      <group position={[0, 38, 0]} onClick={(e) => { e.stopPropagation(); onHack("FLOOR_154_VAULT"); }}>
        <mesh><torusGeometry args={[3, 0.05, 16, 100]} /><meshBasicMaterial color={COLORS.danger} /></mesh>
        <Html distanceFactor={40}>
          <div className="bg-red-600 text-white font-black px-2 py-1 text-[10px] animate-pulse whitespace-nowrap border-2 border-white shadow-[0_0_20px_#ff0000]">
            ⚠ TOP_PRIORITY_HACK: FLOOR_154
          </div>
        </Html>
      </group>
    </group>
  );
};

const BurjAlArab = () => (
  <group position={[-25, 0, 15]} rotation={[0, Math.PI / 4, 0]}>
    <mesh position={[0, 8, 0]}>
      <cylinderGeometry args={[0, 4, 16, 3]} />
      <meshBasicMaterial color="white" wireframe transparent opacity={0.3} />
    </mesh>
    <mesh position={[0, 12, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
      <meshBasicMaterial color={COLORS.gold} />
    </mesh>
    <Html position={[0, 18, 0]} distanceFactor={50}>
      <div className="text-[10px] text-white font-black border border-white px-2 bg-black/80">BURJ_AL_ARAB_HUB</div>
    </Html>
  </group>
);

const TrafficArtery = ({ path, color, count = 100, speed = 1 }: any) => {
  const [offsets] = useState(() => Array.from({ length: count }, () => Math.random()));
  return (
    <group>
      {offsets.map((offset, i) => (
        <Vehicle key={i} path={path} color={color} offset={offset} speed={speed} />
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
    mesh.current.position.set(pos.x, 0.2, pos.z);
  });
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial color={color} />
      <pointLight color={color} intensity={1} distance={2} />
    </mesh>
  );
};

const LidarAgent = ({ position, onInspect }: any) => {
  const group = useRef<THREE.Group>(null);
  const [speed] = useState(0.02 + Math.random() * 0.04);
  const [offset] = useState(Math.random() * 100);
  
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() + offset;
    group.current.position.x += Math.sin(t * 0.2) * speed;
    group.current.position.z += Math.cos(t * 0.2) * speed;
  });

  return (
    <group ref={group} position={position} onClick={(e) => { e.stopPropagation(); onInspect(); }}>
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
        <meshBasicMaterial color="#fff" wireframe />
      </mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.4, 0.5, 16]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [view, setView] = useState<'ORBIT' | 'GROUND'>('ORBIT');
  const [crackedSats, setCrackedSats] = useState<string[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleHack = (id: string) => {
    if (crackedSats.includes(id)) { setView('GROUND'); return; }
    updateWindow('terminal', { isOpen: true });
    openWindow('terminal');
    addLog(`[!] INJECTING MALWARE INTO ${id} ORBITAL_UPLINK...`, 'warning');
    setTimeout(() => {
      setCrackedSats(prev => [...prev, id]);
      setView('GROUND');
      addLog(`[SUCCESS] SATELLITE HIJACK COMPLETE. DOWNLINK ESTABLISHED.`, 'success');
    }, 2000);
  };

  const handleInspect = (target: any) => {
    setSelected(target);
    updateWindow('terminal', { isOpen: true });
    openWindow('terminal');
    addLog(`[SIGINT] TARGET_LOCKED: ${target.id}`, 'info');
  };

  const highwayPath = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-100, 0, 50),
    new THREE.Vector3(-50, 0, 20),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(50, 0, -20),
    new THREE.Vector3(100, 0, -50),
  ]), []);

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[1em] animate-pulse">OMNISCIENT_SYSTEM_BOOT</div>;

  return (
    <div className="w-full h-full bg-[#010101] relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 20, 30] : [0, 80, 80]} fov={35} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={10} maxDistance={400} maxPolarAngle={Math.PI / 2.1} />
        <Stars radius={200} count={10000} factor={4} fade />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[50, 100, 50]} intensity={2} color={COLORS.cyan} />

        {view === 'ORBIT' ? (
          <group rotation={[0, 0, 0.4]}>
            <mesh><sphereGeometry args={[10, 64, 64]} /><meshStandardMaterial color="#051030" metalness={1} roughness={0} /></mesh>
            <group position={[14, 2, 10]} onClick={() => handleHack('KH-11')}>
              <mesh><boxGeometry args={[1, 0.5, 0.8]} /><meshStandardMaterial color={crackedSats.includes('KH-11') ? '#0f0' : '#fff'} /></mesh>
              <Html distanceFactor={20} position={[0, 2, 0]}><div className="text-[10px] text-white font-black bg-black/80 px-2 border border-white">KH-11 [DUBAI]</div></Html>
            </group>
          </group>
        ) : (
          <group>
            <DenseCity />
            <BurjKhalifa onHack={(id: string) => handleInspect({ id, type: 'CORE' })} />
            <BurjAlArab />
            
            <TrafficArtery path={highwayPath} color={COLORS.traffic_white} speed={2} count={50} />
            <TrafficArtery path={highwayPath} color={COLORS.traffic_red} speed={1.5} count={50} />

            {[...Array(80)].map((_, i) => (
              <LidarAgent key={i} position={[(Math.random()-0.5)*180, 0, (Math.random()-0.5)*180]} onInspect={() => handleInspect({ id: `NODE_${8000+i}` })} />
            ))}
          </group>
        )}

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.1} intensity={2} mipmapBlur radius={0.5} />
          <Scanline opacity={0.1} />
          <Noise opacity={0.05} />
          <Glitch delay={new THREE.Vector2(2, 5)} duration={new THREE.Vector2(0.1, 0.3)} strength={new THREE.Vector2(0.1, 0.2)} />
          <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
        </EffectComposer>
      </Canvas>

      <div className="absolute top-4 left-4 font-mono pointer-events-none select-none">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={32} className="text-neon-cyan animate-spin-slow" />
          <div className="text-3xl text-neon-cyan font-black tracking-[0.5em] italic">GHOST_OMNISCIENT_V18</div>
        </div>
        <div className="text-[10px] text-white/40 mb-6 uppercase tracking-widest">Global surveillance // Uplink: {view}</div>
        
        {view !== 'ORBIT' && (
          <button 
            onClick={() => setView('ORBIT')} 
            className="px-8 py-3 border-2 border-red-500 text-red-500 text-xs font-black uppercase pointer-events-auto hover:bg-red-500/20 transition-all shadow-[0_0_40px_rgba(255,0,0,0.4)]"
          >
            TERMINATE_DOWNLINK
          </button>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} className="absolute top-20 right-4 w-[450px] bg-black/95 border-l-4 border-neon-cyan p-8 font-mono z-[2000] shadow-2xl pointer-events-auto">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <div className="text-xl text-neon-cyan font-black tracking-widest italic">SIGNAL_EXTRACTED // {selected.id}</div>
              <button onClick={() => setSelected(null)} className="text-white hover:text-red-500 transition-colors">X</button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-10 text-white/80">
              <div className="bg-white/5 p-4 border-l-2 border-neon-cyan shadow-xl">
                <div className="text-[9px] text-white/40 mb-1">LAT_COORD</div>
                <div className="text-lg font-black tracking-tighter">25.2048° N</div>
              </div>
              <div className="bg-white/5 p-4 border-l-2 border-neon-cyan shadow-xl">
                <div className="text-[9px] text-white/40 mb-1">LONG_COORD</div>
                <div className="text-lg font-black tracking-tighter">55.2708° E</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-xs text-neon-cyan font-black mb-2 uppercase tracking-widest">Active_Endpoints_Detected:</div>
              <div className="h-[300px] overflow-y-auto scrollbar-hide space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900/80 p-4 border border-white/5 hover:border-emerald-500 transition-all">
                    <div className="flex items-center gap-4">
                      <Smartphone size={20} className="text-emerald-400" />
                      <div>
                        <div className="text-[11px] text-white font-black">UID: {Math.random().toString(16).slice(2,10).toUpperCase()}</div>
                        <div className="text-[9px] text-white/30 tracking-widest">MAC: {Array(6).fill(0).map(() => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':').toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-400 font-black animate-pulse">UPLINK_STABLE</div>
                      <div className="text-[9px] text-white/20">SNR: 42dBm</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-10 py-4 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 text-xs font-black hover:bg-emerald-500/30 uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(0,255,0,0.2)]">
              EXFILTRATE_FULL_MEMORY_DUMP
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <Crosshair size={100} className="text-neon-cyan" strokeWidth={1} />
      </div>
    </div>
  );
};
