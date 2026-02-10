'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MapControls, Text, Float, Stars, PerspectiveCamera, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';

const COLORS = {
  cyan: '#00D4E5',
  pink: '#FF53B2',
  purple: '#6B0098',
  gold: '#FFD700',
  ocean: '#020408',
  ground: '#050505',
  heat_hot: '#ffffff',
  heat_warm: '#ffaa00',
  heat_cold: '#880000',
};

// --- Multi-City Geography Config ---
const CITIES = {
  DUBAI: { name: 'DUBAI_CORE', cam: [0, 60, 60], sun: [10, 50, 10] },
  NEOM: { name: 'NEOM_THE_LINE', cam: [0, 40, 100], sun: [50, 20, 0] },
  NYC: { name: 'NYC_MANHATTAN', cam: [0, 80, 20], sun: [-20, 40, 20] },
  LDN: { name: 'LONDON_CENTRAL', cam: [0, 50, 50], sun: [0, 30, -30] },
};

// --- Heatmap Humanoid (Satellite IR Style) ---
const SatelliteHuman = ({ position }: any) => {
  const group = useRef<THREE.Group>(null);
  const [speed] = useState(0.02 + Math.random() * 0.03);
  const [offset] = useState(Math.random() * 100);
  
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() + offset;
    group.current.position.x += Math.sin(t * 0.2) * speed;
    group.current.position.z += Math.cos(t * 0.2) * speed;
    group.current.rotation.y = Math.atan2(Math.cos(t * 0.2), -Math.sin(t * 0.2));
  });

  return (
    <group ref={group} position={position}>
      {/* Thermal Core (Body) */}
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
        <meshBasicMaterial color={COLORS.heat_hot} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={COLORS.heat_hot} />
      </mesh>
      {/* Heat Halo */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial color={COLORS.heat_warm} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const CrowdSystem = ({ count = 50, area = [40, 40] }: any) => {
  return (
    <group>
      {[...Array(count)].map((_, i) => (
        <SatelliteHuman 
          key={i} 
          position={[(Math.random()-0.5)*area[0], 0, (Math.random()-0.5)*area[1]]} 
        />
      ))}
    </group>
  );
};

// --- City Architectures ---

// DUBAI: Iconic landmarks + Coastline
const DubaiMap = ({ onHack }: any) => (
  <group>
    {/* Ocean */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 20]}>
      <planeGeometry args={[200, 100]} />
      <meshStandardMaterial color={COLORS.ocean} metalness={0.9} roughness={0.1} />
    </mesh>
    
    {/* Burj Khalifa */}
    <group position={[0, 0, -10]} onClick={(e) => { e.stopPropagation(); onHack("BURJ_CORE", "SERVER"); }}>
      <mesh position={[0, 15, 0]}>
        <cylinderGeometry args={[0.1, 2, 30, 6]} />
        <meshStandardMaterial color="#111" />
        <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0.1, 2, 30, 6)]} /><lineBasicMaterial color={COLORS.cyan} /></lineSegments>
      </mesh>
    </group>

    {/* Burj Al Arab */}
    <group position={[-15, 0, 10]} onClick={(e) => { e.stopPropagation(); onHack("ROYAL_SUITE", "WIFI"); }}>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0, 2, 10, 3]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>

    <CrowdSystem count={60} />
  </group>
);

// NEOM: The Line (Massive Wall)
const NeomMap = ({ onHack }: any) => (
  <group>
    <mesh position={[0, -0.1, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[200, 200]} /><meshStandardMaterial color="#C2B280" /></mesh>
    
    <group onClick={(e) => { e.stopPropagation(); onHack("NEOM_MAIN_FRAME", "SERVER"); }}>
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[100, 10, 2]} />
        <meshPhysicalMaterial color="silver" metalness={1} roughness={0} /> {/* Mirror Effect */}
      </mesh>
      <Html position={[0, 12, 0]} distanceFactor={50}><div className="text-xs bg-black text-white px-1">THE_LINE</div></Html>
    </group>
    
    <CrowdSystem count={30} area={[80, 5]} />
  </group>
);

// NYC: Dense Grid + Central Park
const NycMap = ({ onHack }: any) => (
  <group>
    <mesh position={[0, -0.1, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#111" /></mesh>
    
    {/* Central Park (Void) */}
    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[10, 40]} /><meshBasicMaterial color="#003300" /></mesh>

    {/* Skyscrapers */}
    {[...Array(100)].map((_, i) => {
      const x = (Math.random()-0.5) * 60;
      const z = (Math.random()-0.5) * 60;
      if (Math.abs(x) < 6 && Math.abs(z) < 21) return null; // Park cutout
      return (
        <mesh key={i} position={[x, Math.random()*5+2, z]}>
          <boxGeometry args={[2, Math.random()*10+4, 2]} />
          <meshStandardMaterial color="#222" />
          <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(2, 1, 2)]} /><lineBasicMaterial color="#444" /></lineSegments>
        </mesh>
      );
    })}
    
    <CrowdSystem count={100} area={[60, 60]} />
  </group>
);

export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const [city, setCity] = useState<'DUBAI' | 'NEOM' | 'NYC' | 'LDN'>('DUBAI');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHack = (target: string, type: string) => {
    updateWindow('terminal', { isOpen: true, title: `TERMINAL // TARGET: ${target}` });
    openWindow('terminal');
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">ESTABLISHING_UPLINK...</div>;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={CITIES[city].cam as any} fov={45} />
        {/* MapControls allows panning (right click) and zooming to cursor */}
        <MapControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={2} 
          maxDistance={150} 
          maxPolarAngle={Math.PI / 2.1}
        />
        
        <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade />
        <ambientLight intensity={0.3} />
        <pointLight position={CITIES[city].sun as any} intensity={1.5} color="white" />

        <group>
          {city === 'DUBAI' && <DubaiMap onHack={handleHack} />}
          {city === 'NEOM' && <NeomMap onHack={handleHack} />}
          {city === 'NYC' && <NycMap onHack={handleHack} />}
          {city === 'LDN' && <NycMap onHack={handleHack} />} {/* Placeholder for London reuse */}
        </group>
      </Canvas>

      {/* City Selector HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 font-mono pointer-events-auto">
        <div className="text-[10px] text-neon-cyan font-black tracking-[0.3em] mb-1">GLOBAL_SAT_FEED</div>
        {Object.keys(CITIES).map((c) => (
          <button
            key={c}
            onClick={() => setCity(c as any)}
            className={`px-3 py-1 text-[9px] border text-left flex items-center gap-2 transition-all ${
              city === c 
                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' 
                : 'border-white/10 text-white/40 hover:bg-white/5'
            }`}
          >
            <Globe size={10} />
            {CITIES[c as keyof typeof CITIES].name}
          </button>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none font-mono text-right">
        <div className="text-[8px] text-white/40">LAT: {city === 'DUBAI' ? '25.2' : city === 'NYC' ? '40.7' : '28.4'} N</div>
        <div className="text-[10px] text-emerald-500 mt-1 uppercase font-bold animate-pulse">Live_Feed_Active</div>
      </div>
    </div>
  );
};