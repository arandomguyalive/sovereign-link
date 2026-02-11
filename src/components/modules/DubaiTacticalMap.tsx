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
  Environment as DreiEnv,
  Cloud
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, Glitch, ChromaticAberration, Scanline, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Zap, ShieldAlert, Cpu, Crosshair, Activity, Database, Smartphone } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  pink: '#FF0055',
  gold: '#FFD700',
  danger: '#FF3333',
  neon_red: '#ff0033',
  neon_white: '#ffffff',
  building: '#050505',
};

// --- CORE: Infinite Urban Sprawl (5000+ Instances) ---
const MegaCity = ({ count = 4000 }) => {
  const range = 400;
  const data = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * range;
      const z = (Math.random() - 0.5) * range;
      // Clear zone for Burj Khalifa and Coastline
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue; 
      if (z > 50) continue; // Ocean clearance

      const h = Math.random() * 30 + 5;
      const w = Math.random() * 3 + 1;
      temp.push({
        position: [x, h / 2, z] as [number, number, number],
        scale: [w, h, w] as [number, number, number],
      });
    }
    return temp;
  }, [count]);

  return (
    <Instances range={count}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#080808" 
        metalness={0.8} 
        roughness={0.2} 
        emissive="#001133"
        emissiveIntensity={0.1}
      />
      {data.map((props, i) => (
        <Instance key={i} position={props.position} scale={props.scale} />
      ))}
    </Instances>
  );
};

// --- CORE: Hyper-Real Burj Khalifa ---
const BurjKhalifa = ({ onHack }: any) => {
  return (
    <group position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onHack("BURJ_CORE_SYSTEMS"); }}>
      {/* Tiers with Metallic Shader */}
      {[...Array(50)].map((_, i) => (
        <mesh key={i} position={[0, i * 1.5, 0]}>
          <cylinderGeometry args={[3 - i * 0.05, 3.2 - i * 0.05, 1.5, 6]} />
          <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
          <lineSegments>
            <edgesGeometry args={[new THREE.CylinderGeometry(3 - i * 0.05, 3.2 - i * 0.05, 1.5, 6)]} />
            <lineBasicMaterial color={COLORS.cyan} transparent opacity={0.3} />
          </lineSegments>
        </mesh>
      ))}
      {/* Interactive Floor 154 */}
      <group position={[0, 60, 0]} onClick={(e) => { e.stopPropagation(); onHack("FLOOR_154_VAULT"); }}>
        <mesh><torusGeometry args={[4, 0.2, 16, 100]} /><meshBasicMaterial color={COLORS.danger} emissive={COLORS.danger} emissiveIntensity={2} /></mesh>
        <Html distanceFactor={80}>
          <div className="bg-red-600 text-white font-black px-2 py-1 text-[10px] animate-pulse whitespace-nowrap shadow-[0_0_50px_#ff0000]">
            ⚠ RESTRICTED: FLOOR_154
          </div>
        </Html>
      </group>
    </group>
  );
};

// --- CORE: Traffic Artery (Thousands of Lights) ---
const TrafficSystem = ({ count = 200 }) => {
  const points = useMemo(() => {
    const p = [];
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-200, 0.5, 40),
      new THREE.Vector3(-50, 0.5, 20),
      new THREE.Vector3(0, 0.5, 10),
      new THREE.Vector3(50, 0.5, -20),
      new THREE.Vector3(200, 0.5, -60),
    ]);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const pos = curve.getPoint(t);
      p.push(pos.x, pos.y, pos.z);
    }
    return new Float32Array(p);
  }, [count]);

  const meshRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    // Animate texture offset or similar logic could go here for movement illusion
    // For raw points, we simulate flow by shifting positions cyclically
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.8} color={COLORS.traffic_white} transparent opacity={0.8} />
    </points>
  );
};

// --- CORE: Lidar Humanoids (Instanced) ---
const CrowdSystem = ({ count = 100 }) => {
  const data = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [(Math.random()-0.5)*100, 0, (Math.random()-0.5)*100] as [number, number, number],
      speed: 0.02 + Math.random() * 0.02
    }));
  }, [count]);

  return (
    <group>
      {data.map((d, i) => (
        <LidarAgent key={i} position={d.position} speed={d.speed} />
      ))}
    </group>
  );
};

const LidarAgent = ({ position, speed }: any) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = position[0] + Math.sin(t * speed) * 5;
    ref.current.position.z = position[2] + Math.cos(t * speed) * 5;
  });

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.9, 0]}><capsuleGeometry args={[0.12, 0.6, 4, 8]} /><meshBasicMaterial color="#fff" /></mesh>
      <mesh position={[0, 1.5, 0]}><sphereGeometry args={[0.1, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
    </group>
  );
};

// --- MAIN ENGINE ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [mounted, setMounted] = useState(false);
  const [targetLock, setTargetLock] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleHack = (target: string) => {
    updateWindow('terminal', { isOpen: true, title: `TARGETING: ${target}` });
    openWindow('terminal');
    setTargetLock(target);
    addLog(`[SIGINT] TARGET LOCKED: ${target}`, 'info');
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[1em] animate-pulse">OMNIVERSE_INIT...</div>;

  return (
    <div className="w-full h-full bg-[#010101] relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}>
        <PerspectiveCamera makeDefault position={[0, 60, 80]} fov={40} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={400} maxPolarAngle={Math.PI / 2.1} />
        
        {/* ATMOSPHERE */}
        <Stars radius={300} count={20000} factor={4} fade />
        <Sky sunPosition={[10, 20, 100]} turbidity={10} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <fog exp attach="fog" args={['#020205', 0.008]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[50, 100, 50]} intensity={2} color={COLORS.cyan} />

        {/* CITY */}
        <group>
          <MegaCity count={3000} />
          <BurjKhalifa onHack={handleHack} />
          <TrafficSystem count={500} />
          <CrowdSystem count={100} />
          
          {/* Ground Plane (Asphalt) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#020202" roughness={0.8} />
          </mesh>
        </group>

        {/* POST PROCESSING (CINEMATIC) */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} intensity={1.5} mipmapBlur radius={0.6} />
          <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={2} height={480} />
          <Noise opacity={0.05} />
          <Vignette darkness={1.1} />
          <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
        </EffectComposer>
      </Canvas>

      {/* GOD EYE HUD */}
      <div className="absolute top-4 left-4 font-mono pointer-events-none select-none">
        <div className="text-3xl text-neon-cyan font-black tracking-[0.5em] shadow-[0_0_30px_#00F0FF]">OMNIVERSE_V22</div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest">Global Surveillance // Active</div>
      </div>

      <AnimatePresence>
        {targetLock && (
          <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} className="absolute top-20 right-4 w-[400px] bg-black/95 border-l-4 border-neon-cyan p-8 font-mono z-[2000] shadow-2xl pointer-events-auto">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
              <div className="text-xl text-neon-cyan font-black tracking-widest italic uppercase">Target: {targetLock}</div>
              <button onClick={() => setTargetLock(null)} className="text-white hover:text-red-500 font-bold">X</button>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between bg-zinc-900/80 p-3 border border-white/5">
                  <div className="text-[10px] text-white font-bold">DEVICE_{i+1}</div>
                  <div className="text-[9px] text-emerald-400">SIGNAL_LOCKED</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 text-xs font-black uppercase tracking-[0.3em] hover:bg-emerald-500/20">
              INITIATE_EXFILTRATION
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <Crosshair size={100} className="text-neon-cyan" strokeWidth={0.5} />
      </div>
    </div>
  );
};
