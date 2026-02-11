'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  MapControls, 
  Stars, 
  PerspectiveCamera, 
  Html, 
  Float, 
  MeshDistortMaterial, 
  MeshTransmissionMaterial,
  KeyboardControls
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, Glitch, ChromaticAberration } from '@react-three/postprocessing';
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
  background: '#020202',
};

// --- QUANTUM SHADER: Lidar Sweep Effect ---
const LidarSweep = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 50;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1000, 2]} />
      <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.1} />
    </mesh>
  );
};

// --- STRUCTURAL SCAN: Burj Khalifa (Massive Detail) ---
const BurjKhalifa = ({ onHack }: any) => {
  return (
    <group position={[30, 0, -30]} onClick={(e) => { e.stopPropagation(); onHack("BURJ_CORE_RESTRICTED"); }}>
      {/* Outer Shell */}
      <mesh position={[0, 20, 0]}>
        <cylinderGeometry args={[0.5, 4, 40, 6]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe opacity={0.2} transparent />
      </mesh>
      {/* Inner Volume (The "Glow") */}
      <mesh position={[0, 20, 0]}>
        <cylinderGeometry args={[0.4, 3.8, 39.8, 6]} />
        <meshStandardMaterial 
          color="#001133" 
          emissive={COLORS.blue} 
          emissiveIntensity={0.5} 
          transparent 
          opacity={0.4} 
        />
      </mesh>
      {/* Floor Segmentation */}
      {[...Array(20)].map((_, i) => (
        <mesh key={i} position={[0, i * 2, 0]}>
          <cylinderGeometry args={[4 - i*0.15, 4 - i*0.15, 0.05, 6]} />
          <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.3} />
        </mesh>
      ))}
      {/* FLOOR 154 - High Sec Node */}
      <group position={[0, 32, 0]} onClick={(e) => { e.stopPropagation(); onHack("FLOOR_154_VAULT"); }}>
        <mesh>
          <torusGeometry args={[2.5, 0.1, 16, 100]} />
          <meshBasicMaterial color={COLORS.danger} />
        </mesh>
        <Html distanceFactor={40}>
          <div className="bg-red-950/90 border-2 border-red-500 p-2 font-black text-red-500 text-[10px] animate-pulse whitespace-nowrap">
            ⚠ TARGET: FLOOR_154 // SIGINT_LOCKED
          </div>
        </Html>
      </group>
    </group>
  );
};

// --- STRUCTURAL SCAN: Palm Jumeirah (Digital Twin) ---
const PalmJumeirah = () => (
  <group position={[-50, 0.1, 20]} rotation={[-Math.PI/2, 0, -0.5]}>
    <mesh><ringGeometry args={[2, 15, 64]} /><meshBasicMaterial color={COLORS.purple} wireframe opacity={0.2} /></mesh>
    {[...Array(16)].map((_, i) => (
      <group key={i} rotation={[0, 0, (i/16) * Math.PI * 2]}>
        <mesh position={[0, 8, 0]}>
          <planeGeometry args={[1, 12]} />
          <meshBasicMaterial color={COLORS.purple} transparent opacity={0.1} />
        </mesh>
        <lineSegments position={[0, 8, 0]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(1, 12)]} />
          <lineBasicMaterial color={COLORS.purple} opacity={0.5} transparent />
        </lineSegments>
      </group>
    ))}
  </group>
);

// --- AGENT TRACKING: Lidar Human (Detailed) ---
const LidarAgent = ({ position, onInspect }: any) => {
  const ref = useRef<THREE.Group>(null);
  const [speed] = useState(0.02 + Math.random() * 0.03);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.x += Math.sin(t * speed + position[0]) * 0.05;
    ref.current.position.z += Math.cos(t * speed + position[2]) * 0.05;
  });

  return (
    <group ref={ref} position={position} onClick={(e) => { e.stopPropagation(); onInspect(); }}>
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
        <meshBasicMaterial color="#fff" wireframe />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 16]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.5} />
      </mesh>
      <Html distanceFactor={15} position={[0, 2, 0]}>
        <div className="text-[6px] text-white/40 font-mono">ID: {Math.random().toString(16).slice(2,8)}</div>
      </Html>
    </group>
  );
};

// --- ORBITAL COMMAND: Satellite Launcher ---
const OrbitalSatellite = ({ id, label, position, onHack, cracked }: any) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.01;
    ref.current.position.y += Math.sin(state.clock.getElapsedTime()) * 0.01;
  });

  return (
    <group position={position} ref={ref} onClick={() => onHack(id)}>
      <mesh>
        <boxGeometry args={[1, 0.5, 0.8]} />
        <meshStandardMaterial color={cracked ? '#00ff00' : '#fff'} metalness={1} roughness={0} />
      </mesh>
      <mesh position={[1.5, 0, 0]}><boxGeometry args={[2, 0.05, 1]} /><meshBasicMaterial color={COLORS.blue} wireframe /></mesh>
      <mesh position={[-1.5, 0, 0]}><boxGeometry args={[2, 0.05, 1]} /><meshBasicMaterial color={COLORS.blue} wireframe /></mesh>
      <Html distanceFactor={20} position={[0, 2, 0]}>
        <div className={`p-2 border font-mono text-[10px] whitespace-nowrap ${cracked ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400' : 'bg-black/90 border-white/20 text-white'}`}>
          <div className="flex items-center gap-2">
            <Satellite size={14} />
            <span className="font-black tracking-widest uppercase">{label}</span>
          </div>
          <div className="text-[7px] text-white/40 mt-1 uppercase tracking-widest">Awaiting_Downlink...</div>
        </div>
      </Html>
    </group>
  );
};

// --- MAIN ENGINE ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [view, setView] = useState<'ORBIT' | 'GROUND'>('ORBIT');
  const [crackedSats, setCrackedSats] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSatHack = (id: string) => {
    if (crackedSats.includes(id)) { setView('GROUND'); return; }
    updateWindow('terminal', { isOpen: true, title: `BYPASSING // ${id}` });
    openWindow('terminal');
    addLog(`[!] INITIATING QUANTUM INJECTION ON ${id}...`, 'warning');
    setTimeout(() => {
      setCrackedSats(prev => [...prev, id]);
      addLog(`[SUCCESS] UPLINK SYNCHRONIZED. DESCENDING...`, 'success');
      setView('GROUND');
    }, 2000);
  };

  const handleInspect = (target: any) => {
    setSelectedEntity(target);
    updateWindow('terminal', { isOpen: true });
    openWindow('terminal');
    addLog(`[SIGINT] TARGET LOCKED: ${target.id || 'HUMANOID'}`, 'info');
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[1em] animate-pulse">QUANTUM_BOOT</div>;

  return (
    <div className="w-full h-full bg-[#010101] relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows gl={{ antialias: false }}>
        <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 20, 30] : [0, 100, 100]} fov={view === 'ORBIT' ? 45 : 30} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={300} maxPolarAngle={Math.PI / 2.1} />
        <Stars radius={200} count={10000} factor={4} fade />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 100, 10]} intensity={2} color={COLORS.cyan} />

        <Suspense fallback={null}>
          {view === 'ORBIT' ? (
            <group rotation={[0, 0, 0.4]}>
              <mesh><sphereGeometry args={[10, 64, 64]} /><meshStandardMaterial color="#051030" metalness={0.9} roughness={0.1} /></mesh>
              <OrbitalSatellite id="KH-11" label="KH-11 // Dubai" position={[14, 4, 10]} onHack={handleSatHack} cracked={crackedSats.includes('KH-11')} />
              <OrbitalSatellite id="SENT-6" label="Sentinel-6 // NYC" position={[-12, 8, 12]} onHack={handleSatHack} cracked={crackedSats.includes('SENT-6')} />
            </group>
          ) : (
            <group>
              <LidarSweep />
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[1000, 1000, 100, 100]} />
                <meshBasicMaterial color="#050505" wireframe opacity={0.1} transparent />
              </mesh>
              
              <BurjKhalifa onHack={(id: string) => handleInspect({ id, type: 'CRITICAL' })} />
              <PalmJumeirah />
              
              {[...Array(60)].map((_, i) => (
                <LidarAgent key={i} position={[(Math.random()-0.5)*150, 0, (Math.random()-0.5)*150]} onInspect={() => handleInspect({ id: `NODE_${9000+i}`, type: 'BIOMETRIC' })} />
              ))}
            </group>
          )}
        </Suspense>

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.4} />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
        </EffectComposer>
      </Canvas>

      {/* GOD EYE INTERFACE HUD */}
      <div className="absolute top-4 left-4 font-mono pointer-events-none select-none">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={24} className="text-neon-cyan animate-spin-slow" />
          <div className="text-2xl text-neon-cyan font-black tracking-[0.5em] shadow-[0_0_20px_#00F0FF]">GOD_EYE_QUANTUM</div>
        </div>
        <div className="text-[10px] text-white/40 mb-6 uppercase tracking-widest">Downlink: {view} // Locked: {crackedSats.length}</div>
        
        {view !== 'ORBIT' && (
          <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setView('ORBIT')} 
            className="px-6 py-2 border-2 border-red-500 text-red-500 text-[11px] font-black uppercase pointer-events-auto hover:bg-red-500/20 transition-all shadow-[0_0_30px_rgba(255,0,0,0.3)]"
          >
            TERMINATE_UPLINK
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {selectedEntity && (
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="absolute top-20 right-4 w-96 bg-black/95 border-l-4 border-neon-cyan p-6 font-mono z-[2000] shadow-[0_0_50px_rgba(0,0,0,1)] pointer-events-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div className="text-sm text-neon-cyan font-black tracking-widest uppercase">Deep_Scan // {selectedEntity.id}</div>
              <button onClick={() => setSelectedEntity(null)} className="text-white/40 hover:text-white transition-colors">X</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 p-3 border-l-2 border-neon-cyan">
                <div className="text-[8px] text-white/40">LATITUDE</div>
                <div className="text-[11px] text-white font-black">{ (Math.random() * 10 + 25).toFixed(4) }° N</div>
              </div>
              <div className="bg-white/5 p-3 border-l-2 border-neon-cyan">
                <div className="text-[8px] text-white/40">LONGITUDE</div>
                <div className="text-[11px] text-white font-black">{ (Math.random() * 10 + 55).toFixed(4) }° E</div>
              </div>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto scrollbar-hide">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between bg-zinc-900/50 p-3 border border-white/5 hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} className="text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-white font-bold">DEVICE_UPLINK_{i+1}</div>
                      <div className="text-[8px] text-white/30">MAC: {Math.random().toString(16).slice(2,10).toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-emerald-400 font-black">STABLE</div>
                    <div className="text-[8px] text-white/20">RSSI: -{Math.floor(Math.random()*40+50)}dBm</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-3 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 text-[10px] font-black hover:bg-emerald-500/20 uppercase tracking-[0.2em] transition-all">
              Initiate_Full_Data_Exfiltration
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30">
        <Crosshair size={80} className="text-neon-cyan" />
      </div>
    </div>
  );
};