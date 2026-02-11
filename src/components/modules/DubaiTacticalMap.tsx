'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, Text, Float, Stars, PerspectiveCamera, Html, Trail, ContactShadows, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Satellite, ShieldAlert, Cpu, Crosshair, Zap, Activity } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  pink: '#FF0055',
  gold: '#FFD700',
  danger: '#FF3333',
  grid: '#0a1a2a',
  satellite: '#e0e0e0'
};

// --- ORBITAL COMPONENT: Rotating Tactical Satellite ---
const TacticalSatellite = ({ onHack }: any) => {
  const satRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!satRef.current) return;
    satRef.current.rotation.y += 0.005;
    satRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.5;
  });

  return (
    <group ref={satRef} onClick={onHack} cursor="pointer">
      {/* Main Body */}
      <mesh>
        <boxGeometry args={[1, 1, 2]} />
        <meshStandardMaterial color={COLORS.satellite} metalness={1} roughness={0.2} />
      </mesh>
      {/* Solar Panels */}
      <group position={[0, 0, 0]}>
        <mesh position={[2, 0, 0]}>
          <boxGeometry args={[3, 0.05, 1.2]} />
          <meshStandardMaterial color={COLORS.blue} emissive={COLORS.blue} emissiveIntensity={0.5} wireframe />
        </mesh>
        <mesh position={[-2, 0, 0]}>
          <boxGeometry args={[3, 0.05, 1.2]} />
          <meshStandardMaterial color={COLORS.blue} emissive={COLORS.blue} emissiveIntensity={0.5} wireframe />
        </mesh>
      </group>
      {/* Sensor Dish */}
      <mesh position={[0, -0.6, 0.8]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.1, 0.5, 16]} />
        <meshStandardMaterial color={COLORS.gold} metalness={1} />
      </mesh>
      {/* Glowing Lens */}
      <mesh position={[0, -0.8, 1]} rotation={[Math.PI / 4, 0, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color={COLORS.cyan} />
        <pointLight color={COLORS.cyan} intensity={2} distance={5} />
      </mesh>
      
      <Html distanceFactor={15} position={[0, 2, 0]}>
        <div className="bg-black/90 border border-neon-cyan p-2 font-mono text-[10px] whitespace-nowrap animate-pulse">
          <div className="text-neon-cyan font-black tracking-widest">KH-11 // AEGIS_SATELLITE</div>
          <div className="text-white/40 text-[8px]">ENCRYPTION: AES-4096 [LOCKED]</div>
          <div className="mt-2 text-emerald-400 text-[7px] font-black underline">CLICK_TO_ESTABLISH_DOWNLINK</div>
        </div>
      </Html>
    </group>
  );
};

// --- CITY COMPONENTS: High-Fidelity Wireframes ---
const BurjKhalifa = ({ onHack }: any) => (
  <group position={[30, 0, -20]} onClick={() => onHack("BURJ_CORE_154")}>
    <mesh position={[0, 20, 0]}>
      <cylinderGeometry args={[0.1, 3, 40, 6]} />
      <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.4} />
    </mesh>
    <mesh position={[0, 35, 0]}>
      <torusGeometry args={[2.5, 0.1, 16, 100]} />
      <meshBasicMaterial color={COLORS.danger} />
    </mesh>
    <Html position={[0, 42, 0]} distanceFactor={60}>
      <div className="text-[10px] text-neon-cyan border border-neon-cyan px-2 bg-black font-black">BURJ_KHALIFA_MAIN_FRAME</div>
    </Html>
  </group>
);

const PalmJumeirah = () => (
  <group position={[-40, 0.1, 20]} rotation={[-Math.PI/2, 0, -0.5]}>
    <mesh><ringGeometry args={[2, 12, 32]} /><meshBasicMaterial color={COLORS.purple} wireframe opacity={0.3} /></mesh>
    {[...Array(16)].map((_, i) => (
      <group key={i} rotation={[0, 0, (i/16) * Math.PI * 2]}>
        <mesh position={[0, 6, 0]}><planeGeometry args={[0.5, 8]} /><meshBasicMaterial color={COLORS.purple} wireframe opacity={0.2} /></mesh>
      </group>
    ))}
  </group>
);

// --- TRAFFIC & HUMAN LOGS ---
const SigintStream = () => {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      const log = `INTERCEPTED: ${['IPHONE_15', 'SAMSUNG_S24', 'BMW_X7', 'TESLA_CYBER'][Math.floor(Math.random()*4)]} // ${Math.random().toString(16).slice(2,10).toUpperCase()} // RSSI: -${Math.floor(Math.random()*40+50)}dBm`;
      setItems(prev => [log, ...prev].slice(0, 10));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-20 right-4 w-72 bg-black/80 border-l-2 border-neon-cyan p-2 font-mono text-[8px] text-white/60 select-none">
      <div className="text-neon-cyan font-black mb-2 flex items-center gap-2">
        <Activity size={10} className="animate-pulse" /> LIVE_SIGINT_CAPTURE
      </div>
      {items.map((it, i) => <div key={i} className="mb-1 truncate">{it}</div>)}
    </div>
  );
};

export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [view, setView] = useState<'ORBIT' | 'CITY'>('ORBIT');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const initiateHack = () => {
    updateWindow('terminal', { isOpen: true, title: 'UPLINK // AEGIS_SATELLITE_BREACH' });
    openWindow('terminal');
    addLog('[!] SATELLITE SIGNAL DETECTED. INITIATING BRUTE FORCE...', 'warning');
    setTimeout(() => {
      addLog('[SUCCESS] DOWNLINK ESTABLISHED. DESCENDING TO TARGET...', 'success');
      setView('CITY');
    }, 2000);
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">AEGIS_OS_BOOT...</div>;

  return (
    <div className="w-full h-full bg-[#010101] relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 5, 10] : [0, 80, 80]} fov={40} />
        <MapControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={view === 'ORBIT' ? 5 : 10} 
          maxDistance={250} 
        />
        <Stars radius={200} count={10000} factor={4} fade />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 50, 10]} intensity={2} color={COLORS.cyan} />

        {view === 'ORBIT' ? (
          <PresentationControls global config={{ mass: 2, tension: 500 }} snap={{ mass: 4, tension: 1500 }}>
            <TacticalSatellite onHack={initiateHack} />
          </PresentationControls>
        ) : (
          <group>
            {/* Parabolic Terrain Grid */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <planeGeometry args={[500, 500, 100, 100]} />
              <meshBasicMaterial color={COLORS.grid} wireframe opacity={0.2} transparent />
            </mesh>
            
            <DubaiMap onHack={(id: string) => {
               updateWindow('terminal', { isOpen: true, title: `BREACHING // ${id}` });
               openWindow('terminal');
               addLog(`[ALERT] ATTEMPTING ACCESS TO ${id}...`, 'warning');
            }} />
            
            <BurjKhalifa onHack={(id: string) => {
               updateWindow('terminal', { isOpen: true, title: `CRITICAL // ${id}` });
               openWindow('terminal');
               addLog(`[CRITICAL] HIGH-SECURITY ZONE BREACH: ${id}`, 'error');
            }} />
            
            <PalmJumeirah />
          </group>
        )}
      </Canvas>

      {/* GOD EYE UI OVERLAY */}
      <div className="absolute top-4 left-4 font-mono pointer-events-none select-none">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 bg-neon-cyan animate-ping rounded-full" />
          <div className="text-xl text-neon-cyan font-black tracking-[0.5em]">GHOST_EYE_V15</div>
        </div>
        <div className="text-[10px] text-white/40 mb-4">STATUS: {view === 'ORBIT' ? 'ORBITAL_PATROL' : 'DOWNLINK_ACTIVE'}</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border-l-2 border-neon-cyan p-2">
            <div className="text-[8px] text-white/40">LATITUDE</div>
            <div className="text-[10px] text-white font-black tracking-widest">25.2048° N</div>
          </div>
          <div className="bg-white/5 border-l-2 border-neon-cyan p-2">
            <div className="text-[8px] text-white/40">LONGITUDE</div>
            <div className="text-[10px] text-white font-black tracking-widest">55.2708° E</div>
          </div>
        </div>
      </div>

      {view === 'CITY' && <SigintStream />}

      {/* Target Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <Crosshair size={60} className="text-neon-cyan opacity-20" />
      </div>

      <div className="absolute bottom-4 left-4 font-mono text-[8px] text-white/20 uppercase tracking-[0.5em]">
        Department of Defense // Advanced Tactical Operations // GHOST_SIGINT
      </div>
    </div>
  );
};

const DubaiMap = ({ onHack }: any) => (
  <group>
    {/* Generic Skyline Wireframes */}
    {[...Array(100)].map((_, i) => (
      <mesh key={i} position={[(Math.random()-0.5)*150, Math.random()*5, (Math.random()-0.5)*150]} onClick={() => onHack(`NODE_${i}`)}>
        <boxGeometry args={[2, Math.random()*10+5, 2]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.1} />
      </mesh>
    ))}
  </group>
);