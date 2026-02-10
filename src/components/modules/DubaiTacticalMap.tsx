'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, Text, Float, Stars, PerspectiveCamera, Html, Trail, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Wifi, Smartphone, ShieldAlert, Cpu, Crosshair } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF', // Cyber Cyan
  blue: '#0066FF',
  pink: '#FF0055',
  gold: '#FFD700',
  danger: '#FF3333',
  grid: '#0a1a2a',
  traffic_white: '#ffffff',
  traffic_red: '#ff0000'
};

// --- GOD EYE VISUALS: Traffic & Particles ---
const TrafficStream = ({ path, color, count = 30, speed = 0.5, width = 0.2 }: any) => {
  const [offsets] = useState(() => Array.from({ length: count }, () => Math.random()));
  return (
    <group>
      {offsets.map((offset, i) => (
        <TrafficPacket key={i} path={path} color={color} offset={offset} speed={speed} width={width} />
      ))}
    </group>
  );
};

const TrafficPacket = ({ path, color, offset, speed, width }: any) => {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const t = (state.clock.getElapsedTime() * speed * 0.1 + offset) % 1;
    const pos = path.getPointAt(t);
    const tangent = path.getTangentAt(t).normalize();
    mesh.current.position.set(pos.x, pos.y, pos.z);
    mesh.current.lookAt(pos.clone().add(tangent));
  });
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[width, 0.1, width * 3]} />
      <meshBasicMaterial color={color} />
      {/* Light Trail */}
      <Trail width={width} length={8} color={new THREE.Color(color)} attenuation={(t) => t * t}>
        <mesh />
      </Trail>
    </mesh>
  );
};

// --- GEOMETRY: Burj Khalifa (Wireframe Titan) ---
const BurjKhalifa = ({ onHack }: any) => {
  return (
    <group position={[20, 0, -20]} onClick={(e) => { e.stopPropagation(); onHack("BURJ_CORE", "BUILDING"); }}>
      {/* Base Tiers */}
      {[0, 120, 240].map((rot, i) => (
        <group key={i} rotation={[0, rot * (Math.PI/180), 0]}>
           {[...Array(5)].map((_, j) => (
             <mesh key={j} position={[0, j * 3, 0]}>
               <cylinderGeometry args={[1.5 - j*0.2, 2 - j*0.2, 6, 3]} />
               <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.3} />
             </mesh>
           ))}
        </group>
      ))}
      
      {/* Main Spire */}
      <mesh position={[0, 25, 0]}>
        <cylinderGeometry args={[0.1, 1.8, 50, 6]} />
        <meshBasicMaterial color="#001133" transparent opacity={0.8} />
      </mesh>
      <lineSegments position={[0, 25, 0]}>
        <edgesGeometry args={[new THREE.CylinderGeometry(0.1, 1.8, 50, 6)]} />
        <lineBasicMaterial color={COLORS.cyan} opacity={0.8} transparent />
      </lineSegments>

      {/* FLOOR 154 - High Value Target */}
      <group position={[0, 35, 0]} onClick={(e) => { e.stopPropagation(); onHack("FLOOR_154_SERVER", "RESTRICTED"); }}>
        <mesh>
          <torusGeometry args={[2, 0.1, 16, 100]} />
          <meshBasicMaterial color={COLORS.danger} />
        </mesh>
        <Html distanceFactor={60}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
            <div className="bg-red-950/90 border border-red-500 text-[10px] text-red-500 px-2 py-1 font-mono font-bold tracking-widest whitespace-nowrap">
              ⚠ FLOOR 154 // RESTRICTED
            </div>
          </div>
        </Html>
      </group>

      {/* Floating Label */}
      <Html position={[8, 40, 0]} distanceFactor={80}>
        <div className="text-right">
          <div className="text-[12px] text-neon-cyan font-black tracking-widest">BURJ_KHALIFA</div>
          <div className="text-[8px] text-white/50">HGT: 828m // SECTOR: DOWNTOWN</div>
        </div>
        <div className="w-16 h-px bg-neon-cyan/50 mt-1" />
        <div className="w-px h-16 bg-neon-cyan/50 absolute top-0 right-0" />
      </Html>
    </group>
  );
};

// --- GEOMETRY: Palm Jumeirah (Digital Blueprint) ---
const PalmJumeirah = ({ onHack }: any) => {
  const palmShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Simplified procedural palm for stability
    shape.absarc(0, 0, 2, 0, Math.PI * 2, false);
    return shape;
  }, []);

  return (
    <group position={[-40, 0.2, 20]} onClick={(e) => { e.stopPropagation(); onHack("PALM_GRID_MASTER", "WIFI"); }}>
      {/* Trunk (Road) */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 4]}>
        <planeGeometry args={[1.5, 12]} />
        <meshBasicMaterial color={COLORS.purple} wireframe transparent opacity={0.5} />
      </mesh>
      
      {/* Fronds (Holo-Fins) */}
      {[...Array(16)].map((_, i) => (
        <group key={i} rotation={[0, (i/16)*Math.PI + Math.PI, 0]}>
           <mesh position={[0, 0, 4]} rotation={[Math.PI/2, 0, 0]}>
             <planeGeometry args={[0.5, 6]} />
             <meshBasicMaterial color={COLORS.purple} wireframe transparent opacity={0.3} />
           </mesh>
        </group>
      ))}

      {/* Crescent (Shield) */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 9]}>
        <ringGeometry args={[8, 9, 32, 1, Math.PI, Math.PI]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe />
      </mesh>

      <Html position={[0, 5, 0]} distanceFactor={60}>
        <div className="text-center">
          <div className="text-[10px] text-purple-400 font-bold border border-purple-500 px-2 bg-black/80">PALM_JUMEIRAH</div>
          <div className="text-[8px] text-white/40">RESIDENTIAL_GRID</div>
        </div>
      </Html>
    </group>
  );
};

// --- GEOMETRY: Burj Al Arab (The Sail) ---
const BurjAlArab = ({ onHack }: any) => (
  <group position={[-10, 0, 5]} rotation={[0, Math.PI/4, 0]} onClick={(e) => { e.stopPropagation(); onHack("ROYAL_SUITE_WIFI", "WIFI"); }}>
    <mesh position={[0, 5, 0]}>
      <cylinderGeometry args={[0, 3, 12, 3]} />
      <meshBasicMaterial color="white" transparent opacity={0.1} />
      <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0, 3, 12, 3)]} /><lineBasicMaterial color={COLORS.cyan} /></lineSegments>
    </mesh>
    <mesh position={[0, 8, 1.5]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[1, 1, 0.2, 16]} />
      <meshBasicMaterial color={COLORS.gold} wireframe />
    </mesh>
    <Html position={[0, 12, 0]} distanceFactor={50}>
      <div className="text-[8px] text-white border border-white/30 px-1 bg-black/80">BURJ_AL_ARAB</div>
    </Html>
  </group>
);

// --- GEOMETRY: Bank of Emirates (Financial Fortress) ---
const BankNBD = ({ onHack }: any) => (
  <group position={[25, 0, -10]} onClick={(e) => { e.stopPropagation(); onHack("NBD_VAULT_CORE", "BANK"); }}>
    <mesh position={[0, 4, 0]}>
      <boxGeometry args={[6, 8, 4]} />
      <meshBasicMaterial color={COLORS.gold} wireframe transparent opacity={0.2} />
      <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(6, 8, 4)]} /><lineBasicMaterial color={COLORS.gold} /></lineSegments>
    </mesh>
    <Html position={[0, 9, 0]} distanceFactor={40}>
      <div className="text-[8px] text-yellow-500 border border-yellow-500 px-1 bg-black/80 font-black">$ NBD_HQ</div>
    </Html>
  </group>
);

// --- ENVIRONMENT: Parabolic Mesh & Ocean ---
const Environment = () => (
  <group>
    {/* Ocean Grid */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <planeGeometry args={[500, 500, 100, 100]} />
      <meshBasicMaterial color={COLORS.grid} wireframe transparent opacity={0.3} />
    </mesh>
    {/* Water Surface */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
      <planeGeometry args={[500, 500]} />
      <meshBasicMaterial color="#000810" />
    </mesh>
  </group>
);

// --- AGENTS: Lidar Humanoids (God Eye Dots) ---
const GodEyeTarget = ({ position, type, onInspect }: any) => {
  const ref = useRef<THREE.Group>(null);
  const [speed] = useState(0.05 + Math.random() * 0.05);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.x += Math.sin(t * speed + position[0]) * 0.02;
    ref.current.position.z += Math.cos(t * speed + position[2]) * 0.02;
  });

  return (
    <group ref={ref} position={position} onClick={(e) => { e.stopPropagation(); onInspect(type); }}>
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
        <meshBasicMaterial color={type === 'VIP' ? COLORS.gold : COLORS.cyan} />
      </mesh>
      {/* Selection Ring */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.3, 0.35, 16]} />
        <meshBasicMaterial color={type === 'VIP' ? COLORS.gold : COLORS.cyan} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// --- MAIN COMPONENT ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [mounted, setMounted] = useState(false);
  const [targetLock, setTargetLock] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleHack = (target: string, type: string) => {
    if (type === 'RESTRICTED') {
      addLog(`[ALERT] RESTRICTED ZONE ACCESSED: ${target}`, 'error');
      addLog(`[SYSTEM] ENCRYPTION LEVEL 5 DETECTED`, 'warning');
    }
    updateWindow('terminal', { isOpen: true, title: `TERMINAL // TARGET: ${target}` });
    openWindow('terminal');
    setTargetLock(target);
  };

  const handleInspect = (type: string) => {
    updateWindow('terminal', { isOpen: true });
    openWindow('terminal');
    addLog(`[SCAN] BIOMETRIC MATCH FOUND: ${type}`, 'success');
    addLog(`[DATA] DOWNLOADING DEVICE LOGS...`, 'info');
  };

  // Traffic Path (Highway)
  const highwayPath = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-60, 0.2, 30),
    new THREE.Vector3(-20, 0.2, 10),
    new THREE.Vector3(20, 0.2, -20),
    new THREE.Vector3(60, 0.2, -40),
  ]), []);

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">GOD_EYE_INIT...</div>;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 60, 60]} fov={40} />
        <MapControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={10} 
          maxDistance={200}
          maxPolarAngle={Math.PI / 2.1} 
        />
        <Stars radius={200} count={10000} factor={4} fade />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 50, 10]} intensity={2} color={COLORS.cyan} />

        {/* Environment */}
        <Environment />
        
        {/* Traffic Arteries */}
        <TrafficStream path={highwayPath} color={COLORS.traffic_white} count={40} speed={0.05} width={0.3} />
        <TrafficStream path={highwayPath} color={COLORS.traffic_red} count={40} speed={0.04} width={0.3} />

        {/* Major Landmarks */}
        <BurjKhalifa onHack={handleHack} />
        <PalmJumeirah onHack={handleHack} />
        <BurjAlArab onHack={handleHack} />
        <BankNBD onHack={handleHack} />

        {/* Lidar Crowds */}
        <group>
          {[...Array(30)].map((_, i) => (
            <GodEyeTarget key={i} position={[(Math.random()-0.5)*40, 0, (Math.random()-0.5)*40]} type="CIVILIAN" onInspect={handleInspect} />
          ))}
          <GodEyeTarget position={[22, 0, -22]} type="VIP" onInspect={handleInspect} /> {/* VIP near Burj */}
        </group>

      </Canvas>

      {/* GOD EYE HUD */}
      <div className="absolute top-4 left-4 pointer-events-none font-mono">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={16} className="text-neon-cyan animate-spin-slow" />
          <div className="text-xs text-neon-cyan font-black tracking-[0.4em]">GOD_EYE_V14</div>
        </div>
        <div className="text-[9px] text-white/60">LAT: 25.2048 // LONG: 55.2708</div>
        <div className="text-[9px] text-white/60">TARGETS_ACTIVE: 184</div>
        {targetLock && (
          <div className="mt-4 border-l-2 border-red-500 pl-2">
            <div className="text-[10px] text-red-500 font-bold animate-pulse">LOCKED: {targetLock}</div>
            <div className="text-[8px] text-white/40">INITIATE HACK SEQUENCE</div>
          </div>
        )}
      </div>

      {/* Targeting Reticle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
        <Crosshair size={48} className="text-neon-cyan" />
      </div>
    </div>
  );
};