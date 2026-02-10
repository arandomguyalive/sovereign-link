'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, PerspectiveCamera, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
  cyan: '#00D4E5',
  pink: '#FF53B2',
  purple: '#6B0098',
  gold: '#FFD700',
  ocean: '#0a1a2a',
  grid: '#050505',
  danger: '#ff3333',
  text: '#ffffff'
};

// --- Ocean Simulation ---
const Ocean = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial 
        color={COLORS.ocean} 
        metalness={0.9} 
        roughness={0.2} 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
};

// --- Procedural Lidar Humanoid ---
const LidarHuman = ({ position, color = COLORS.cyan }: any) => {
  const group = useRef<THREE.Group>(null);
  const [speed] = useState(0.01 + Math.random() * 0.02);
  const [offset] = useState(Math.random() * 100);
  
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() + offset;
    // Natural walking path
    group.current.position.x += Math.sin(t * 0.3) * speed;
    group.current.position.z += Math.cos(t * 0.3) * speed;
    group.current.rotation.y = Math.atan2(Math.cos(t * 0.3), -Math.sin(t * 0.3));
  });

  return (
    <group ref={group} position={position}>
      {/* Head */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 0.9, 8]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      {/* Arms (Static for optimization) */}
      <mesh position={[0.25, 1.1, 0]}>
        <cylinderGeometry args={[0.04, 0.03, 0.8, 4]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      <mesh position={[-0.25, 1.1, 0]}>
        <cylinderGeometry args={[0.04, 0.03, 0.8, 4]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      {/* Legs (Simulated movement via scale/pos) */}
      <mesh position={[0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.05, 0.04, 0.9, 4]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      <mesh position={[-0.1, 0.4, 0]}>
        <cylinderGeometry args={[0.05, 0.04, 0.9, 4]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
    </group>
  );
};

const CrowdSystem = ({ count = 50, area = [20, 20], offset = [0, 0] }: any) => {
  return (
    <group position={[offset[0], 0, offset[1]]}>
      {[...Array(count)].map((_, i) => (
        <LidarHuman 
          key={i} 
          position={[(Math.random()-0.5)*area[0], 0, (Math.random()-0.5)*area[1]]} 
          color={Math.random() > 0.9 ? COLORS.gold : COLORS.cyan} 
        />
      ))}
    </group>
  );
};

// --- Mega-Structure: Burj Khalifa (Downtown Sector) ---
const BurjKhalifa = ({ onHack }: any) => (
  <group position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onHack("BURJ_CORE_154", "SERVER"); }}>
    {/* Main Spire */}
    <mesh position={[0, 10, 0]}>
      <cylinderGeometry args={[0.1, 2, 20, 6]} />
      <meshStandardMaterial color="#050505" opacity={0.9} transparent />
      <lineSegments>
        <edgesGeometry args={[new THREE.CylinderGeometry(0.1, 2, 20, 6)]} />
        <lineBasicMaterial color={COLORS.cyan} />
      </lineSegments>
    </mesh>
    {/* Base Wings */}
    {[0, 120, 240].map((rot, i) => (
      <mesh key={i} position={[0, 3, 0]} rotation={[0, rot * (Math.PI/180), 0]}>
        <boxGeometry args={[1, 6, 1]} />
        <meshStandardMaterial color="#111" />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1, 6, 1)]} />
          <lineBasicMaterial color={COLORS.cyan} opacity={0.5} transparent />
        </lineSegments>
      </mesh>
    ))}
    {/* Floor 154 Indicator */}
    <group position={[0, 15, 0]}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshBasicMaterial color={COLORS.danger} transparent opacity={0.8} />
      </mesh>
      <Html distanceFactor={40}>
        <div className="bg-red-950/80 border border-red-500 text-[10px] text-red-500 px-2 py-1 font-mono animate-pulse">
          ⚠ FLOOR 154 [LOCKED]
        </div>
      </Html>
    </group>
  </group>
);

// --- Mega-Structure: Palm Jumeirah (Residential Sector) ---
const PalmJumeirah = ({ onHack }: any) => {
  return (
    <group position={[-40, 0, 20]} rotation={[-Math.PI / 2, 0, -0.5]} onClick={(e) => { e.stopPropagation(); onHack("PALM_GRID_MASTER", "WIFI"); }}>
      {/* Trunk */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2, 10]} />
        <meshBasicMaterial color={COLORS.purple} wireframe opacity={0.3} transparent />
      </mesh>
      {/* Fronds */}
      {[...Array(16)].map((_, i) => (
        <group key={i} position={[0, i * 0.8 - 4, 0]}>
          <mesh rotation={[0, 0, 0.3]} position={[3, 0, 0]}>
            <planeGeometry args={[6, 0.2]} />
            <meshBasicMaterial color={COLORS.purple} wireframe opacity={0.3} transparent />
          </mesh>
          <mesh rotation={[0, 0, -0.3]} position={[-3, 0, 0]}>
            <planeGeometry args={[6, 0.2]} />
            <meshBasicMaterial color={COLORS.purple} wireframe opacity={0.3} transparent />
          </mesh>
        </group>
      ))}
      {/* Crescent */}
      <mesh position={[0, 6, 0]}>
        <ringGeometry args={[5, 6, 32, 1, 0, Math.PI]} />
        <meshBasicMaterial color={COLORS.purple} wireframe />
      </mesh>
      
      <Html position={[0, 0, 2]} distanceFactor={60}>
        <div className="text-xs text-purple-400 bg-black/80 px-2 border border-purple-500">PALM_JUMEIRAH_SECTOR</div>
      </Html>
    </group>
  );
};

// --- Mega-Structure: Bank of Emirates (Financial Sector) ---
const BankNBD = ({ onHack }: any) => (
  <group position={[20, 0, -10]} onClick={(e) => { e.stopPropagation(); onHack("NBD_VAULT_CORE", "BANK"); }}>
    <mesh position={[0, 4, 0]}>
      <boxGeometry args={[6, 8, 3]} />
      <meshStandardMaterial color={COLORS.gold} wireframe opacity={0.1} transparent />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(6, 8, 3)]} />
        <lineBasicMaterial color={COLORS.gold} />
      </lineSegments>
    </mesh>
    <Html position={[0, 9, 0]} distanceFactor={40}>
      <div className="text-xs text-yellow-500 bg-black/80 px-2 border border-yellow-500 font-bold">$ NBD_FINANCIAL_HUB</div>
    </Html>
  </group>
);

// --- SIGINT Sidebar Component ---
const SigintSidebar = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const devices = ['iPhone 15 Pro', 'Samsung S24', 'MacBook Air', 'Google Pixel 9', 'Tesla Model S'];
    const networks = ['Etisalat_5G', 'Du_Home', 'NBD_Secure', 'Burj_Guest'];
    
    const interval = setInterval(() => {
      const dev = devices[Math.floor(Math.random() * devices.length)];
      const net = networks[Math.floor(Math.random() * networks.length)];
      const id = Math.floor(Math.random() * 9999);
      const log = `[${new Date().toLocaleTimeString()}] DETECTED: ${dev} // ID: ${id} // NET: ${net}`;
      
      setLogs(prev => [log, ...prev].slice(0, 15));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-20 right-4 w-64 bg-black/80 border-l-2 border-neon-cyan/50 p-2 font-mono pointer-events-none z-[1000]">
      <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-1">
        <span className="text-[10px] text-neon-cyan font-black tracking-widest">SIGINT_MONITOR_V9</span>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col gap-1">
        {logs.map((log, i) => (
          <div key={i} className="text-[8px] text-white/60 truncate">
            {i === 0 ? <span className="text-emerald-400 font-bold">{log}</span> : log}
          </div>
        ))}
      </div>
    </div>
  );
};

export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHack = (target: string, type: string) => {
    updateWindow('terminal', { 
      isOpen: true, 
      title: `TERMINAL // BREACHING: ${target}`,
    });
    openWindow('terminal');
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">LOADING_SATELLITE_DATA...</div>;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair">
      <Canvas shadows camera={{ position: [30, 30, 30], fov: 60 }}>
        <PerspectiveCamera makeDefault position={[40, 40, 40]} fov={50} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={10}
          maxDistance={150}
        />
        
        <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 50, 10]} intensity={2} color={COLORS.cyan} />
        
        {/* Environment */}
        <Ocean />
        <gridHelper args={[200, 100, '#111', '#000']} position={[0, 0.1, 0]} />

        <group>
          {/* Downtown Sector */}
          <BurjKhalifa onHack={handleHack} />
          <CrowdSystem count={40} area={[15, 15]} offset={[0, 0]} />
          
          {/* Palm Sector (Distant) */}
          <PalmJumeirah onHack={handleHack} />
          <CrowdSystem count={20} area={[10, 10]} offset={[-40, 20]} />

          {/* Financial Sector */}
          <BankNBD onHack={handleHack} />
          <CrowdSystem count={15} area={[8, 8]} offset={[20, -10]} />
        </group>
      </Canvas>

      {/* Map HUD */}
      <div className="absolute top-4 left-4 pointer-events-none font-mono">
        <div className="text-xs text-neon-cyan font-black tracking-[0.3em] mb-1">GOD_VIEW_V9.0</div>
        <div className="text-[9px] text-white/60">SATELLITE: KH-11 [ENHANCED]</div>
        <div className="text-[9px] text-emerald-500 animate-pulse">LIVE_FEED: ACTIVE</div>
      </div>

      {/* SIGINT Sidebar */}
      <SigintSidebar />
    </div>
  );
};