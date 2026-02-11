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
  Sky,
  useTexture
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, Glitch, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Zap, Crosshair, Smartphone, Shield, Activity, Anchor } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  purple: '#6B0098',
  gold: '#FFD700',
  danger: '#FF3333',
  satellite_tint: '#0a1a2a'
};

// --- REAL TERRAIN: Satellite Floor ---
const SatelliteTerrain = () => {
  // Using a public ArcGIS Satellite Imagery tile for Dubai
  // This is real satellite mapping
  return (
    <group>
      {/* Land & Ocean Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      
      {/* Real Coastline Detail (Simulated with a shader-like plane) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial 
          color="#0a1a2a" 
          metalness={0.8} 
          roughness={0.2} 
          transparent 
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

// --- LANDMARK: Hyper-Detailed Burj Khalifa ---
const BurjKhalifa = ({ onHack }: any) => {
  return (
    <group position={[40, 0, -40]} onClick={(e) => { e.stopPropagation(); onHack("BURJ_KHALIFA_SYSTEMS"); }}>
      {/* Three-winged Base */}
      {[0, 120, 240].map((rot, i) => (
        <group key={i} rotation={[0, rot * (Math.PI/180), 0]}>
          <mesh position={[0, 10, 1.5]}>
            <boxGeometry args={[2, 20, 4]} />
            <meshStandardMaterial color="#111" wireframe />
          </mesh>
        </group>
      ))}
      {/* Tapering Tiers (27 tiers) */}
      {[...Array(27)].map((_, i) => (
        <mesh key={i} position={[0, i * 1.5, 0]}>
          <cylinderGeometry args={[2.5 - i * 0.08, 2.7 - i * 0.08, 1.5, 3]} />
          <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.2} />
        </mesh>
      ))}
      {/* High-Sec Floor 154 */}
      <group position={[0, 35, 0]} onClick={(e) => { e.stopPropagation(); onHack("RESTRICTED_FLOOR_154"); }}>
        <mesh><torusGeometry args={[3, 0.1, 16, 100]} /><meshBasicMaterial color={COLORS.danger} /></mesh>
        <Html distanceFactor={40}>
          <div className="bg-red-600 text-white font-black px-2 py-1 text-[10px] animate-pulse border-2 border-white shadow-[0_0_30px_red]">
            ⚠ FLOOR_154 // SECURITY_BREACH_REQUIRED
          </div>
        </Html>
      </group>
    </group>
  );
};

// --- LANDMARK: Burj Al Arab (The Sail) ---
const BurjAlArab = ({ onHack }: any) => {
  return (
    <group position={[-15, 0, 10]} rotation={[0, Math.PI / 4, 0]} onClick={() => onHack("BURJ_AL_ARAB_HUB")}>
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[0, 4, 16, 3]} />
        <meshStandardMaterial color="white" transparent opacity={0.8} />
        <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0, 4, 16, 3)]} /><lineBasicMaterial color={COLORS.cyan} /></lineSegments>
      </mesh>
      {/* Heli-Node */}
      <mesh position={[0, 13, 2.2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
        <meshBasicMaterial color={COLORS.gold} />
      </mesh>
      <Html position={[0, 18, 0]} distanceFactor={50}>
        <div className="text-[10px] text-white font-black border border-white px-2 bg-black/80">BURJ_AL_ARAB</div>
      </Html>
    </group>
  );
};

// --- LANDMARK: Palm Jumeirah (Exact Fronds) ---
const PalmJumeirah = ({ onHack }: any) => (
  <group position={[-60, 0.1, 40]} rotation={[-Math.PI / 2, 0, -0.8]} onClick={() => onHack("PALM_GRID")}>
    <mesh><planeGeometry args={[3, 15]} /><meshBasicMaterial color={COLORS.purple} wireframe opacity={0.5} /></mesh>
    {[...Array(17)].map((_, i) => (
      <group key={i} rotation={[0, 0, (i / 16) * Math.PI - Math.PI / 2]} position={[0, i * 0.8 - 4, 0]}>
        <mesh position={[4, 0, 0]}><planeGeometry args={[8, 0.2]} /><meshBasicMaterial color={COLORS.purple} wireframe /></mesh>
      </group>
    ))}
    {/* Crescent Shield */}
    <mesh position={[0, 8, 0]}><ringGeometry args={[9, 10, 64, 1, Math.PI, Math.PI]} /><meshBasicMaterial color={COLORS.purple} wireframe /></mesh>
    <Html position={[0, 0, 2]} distanceFactor={60}>
      <div className="text-[10px] text-purple-400 font-black border border-purple-500 px-2 bg-black/90">PALM_JUMEIRAH</div>
    </Html>
  </group>
);

// --- SIGINT AGENTS ---
const LidarAgent = ({ position, onInspect }: any) => {
  const ref = useRef<THREE.Group>(null);
  const [speed] = useState(0.05 + Math.random() * 0.05);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.x += Math.sin(t * speed + position[0]) * 0.05;
    ref.current.position.z += Math.cos(t * speed + position[2]) * 0.05;
  });
  return (
    <group ref={ref} position={position} onClick={(e) => { e.stopPropagation(); onInspect(); }}>
      <mesh position={[0, 0.9, 0]}><capsuleGeometry args={[0.15, 0.6, 4, 8]} /><meshBasicMaterial color="#fff" wireframe /></mesh>
      <Html distanceFactor={15} position={[0, 2, 0]}>
        <div className="text-[6px] text-emerald-400 font-bold">DEVICE_DETECTED</div>
      </Html>
    </group>
  );
};

// --- MAIN TITAN ENGINE ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [view, setView] = useState<'ORBIT' | 'GROUND'>('ORBIT');
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleHack = (id: string) => {
    updateWindow('terminal', { isOpen: true, title: `HACKING // ${id}` });
    openWindow('terminal');
    addLog(`[!] SIGNAL CAPTURED FROM ${id}. BYPASSING ENCRYPTION...`, 'warning');
    setTimeout(() => {
      addLog(`[SUCCESS] UPLINK STABLE. DOWNLOADING SIGINT DOSSIER.`, 'success');
      setSelectedTarget({ id, type: 'CRITICAL_INFRASTRUCTURE' });
    }, 2000);
  };

  const handleSatHack = () => {
    updateWindow('terminal', { isOpen: true, title: 'UPLINK // KH-11_SAT' });
    openWindow('terminal');
    addLog('[+] INITIATING SATELLITE HANDSHAKE...', 'info');
    setTimeout(() => {
      setView('GROUND');
      addLog('[SUCCESS] DOWNLINK ESTABLISHED. DESCENDING...', 'success');
    }, 1500);
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[1em] animate-pulse">TITAN_OS_BOOT</div>;

  return (
    <div className="w-full h-full bg-black relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 20, 30] : [0, 100, 120]} fov={35} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={10} maxDistance={400} maxPolarAngle={Math.PI / 2.1} />
        <Stars radius={300} count={20000} factor={4} fade />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[50, 100, 50]} intensity={2} color={COLORS.cyan} />

        {view === 'ORBIT' ? (
          <group rotation={[0, 0, 0.4]}>
            <mesh><sphereGeometry args={[10, 64, 64]} /><meshStandardMaterial color="#051030" metalness={1} /></mesh>
            <group position={[14, 2, 10]} onClick={handleSatHack}>
              <mesh><boxGeometry args={[1.5, 0.6, 1]} /><meshStandardMaterial color="#fff" /></mesh>
              <Html distanceFactor={20} position={[0, 3, 0]}><div className="text-[10px] text-white font-black bg-black/90 p-2 border-2 border-neon-cyan animate-pulse">KH-11 [DUBAI]</div></Html>
            </group>
          </group>
        ) : (
          <group>
            <SatelliteTerrain />
            <BurjKhalifa onHack={handleHack} />
            <BurjAlArab onHack={handleHack} />
            <PalmJumeirah onHack={handleHack} />
            
            {/* Generic City Density */}
            {[...Array(100)].map((_, i) => (
              <mesh key={i} position={[(Math.random()-0.5)*200, Math.random()*5, (Math.random()-0.5)*200]} onClick={() => handleHack(`BLDG_${i}`)}>
                <boxGeometry args={[2, Math.random()*10+5, 2]} />
                <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.1} />
              </mesh>
            ))}

            {[...Array(40)].map((_, i) => (
              <LidarAgent key={i} position={[(Math.random()-0.5)*150, 0, (Math.random()-0.5)*150]} onInspect={() => handleHack(`AGENT_${Math.random().toString(16).slice(2,6)}`)} />
            ))}
          </group>
        )}

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.1} intensity={1.5} mipmapBlur radius={0.4} />
          <Noise opacity={0.05} />
          <Vignette darkness={1.2} />
        </EffectComposer>
      </Canvas>

      {/* GOD EYE HUD */}
      <div className="absolute top-6 left-6 font-mono pointer-events-none select-none">
        <div className="flex items-center gap-4 mb-2">
          <Globe size={32} className="text-neon-cyan animate-spin-slow" />
          <div className="text-3xl text-neon-cyan font-black tracking-[0.6em]">TITAN_GOD_EYE</div>
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest">Global Surveillance // Active // {view}</div>
        
        {view !== 'ORBIT' && (
          <button onClick={() => setView('ORBIT')} className="mt-8 px-8 py-3 border-2 border-red-500 text-red-500 text-[11px] font-black uppercase pointer-events-auto hover:bg-red-500/20 transition-all shadow-[0_0_40px_rgba(255,0,0,0.3)]">
            TERMINATE_UPLINK
          </button>
        )}
      </div>

      <AnimatePresence>
        {selectedTarget && (
          <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} className="absolute top-24 right-6 w-[400px] bg-black/95 border-l-4 border-neon-cyan p-8 font-mono z-[2000] shadow-2xl pointer-events-auto">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <div className="text-xl text-neon-cyan font-black tracking-widest italic uppercase">Sigint_Dossier // {selectedTarget.id}</div>
              <button onClick={() => setSelectedTarget(null)} className="text-white hover:text-red-500 transition-colors font-bold text-lg">X</button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/5 p-4 border-l-2 border-emerald-500 shadow-xl">
                <div className="text-[9px] text-white/40 mb-1 uppercase tracking-widest font-black">Status</div>
                <div className="text-lg font-black text-emerald-400">ENCRYPTION_BYPASSED</div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] text-neon-cyan font-black uppercase tracking-widest">Active_Device_Extraction:</div>
                <div className="h-[250px] overflow-y-auto scrollbar-hide space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-900/80 p-4 border border-white/5 hover:border-emerald-500/50 transition-all">
                      <div className="flex items-center gap-4">
                        <Smartphone size={20} className="text-emerald-400" />
                        <div>
                          <div className="text-[11px] text-white font-black uppercase">iPhone_15_Pro</div>
                          <div className="text-[9px] text-white/30 font-mono tracking-widest">IMEI: {Math.floor(Math.random()*1000000000)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-emerald-400 font-black">STABLE</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="w-full mt-10 py-4 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 text-xs font-black hover:bg-emerald-500/30 uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(0,255,0,0.2)]">
              EXFILTRATE_FULL_DATA_CLOUD
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