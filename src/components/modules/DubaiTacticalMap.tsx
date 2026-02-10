'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, PerspectiveCamera, Html, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';

const COLORS = {
  cyan: '#00D4E5',
  pink: '#FF53B2',
  purple: '#6B0098',
  gold: '#FFD700',
  grid: '#050505',
  danger: '#ff0000',
  success: '#00ff00',
  building: '#111111'
};

// --- Procedural City Generation ---
const CityBlock = ({ count = 40 }) => {
  const buildings = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const h = Math.random() * 3 + 1;
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      if (Math.abs(x) < 2 && Math.abs(z) < 2) continue; // Clear center for Burj
      temp.push({ position: [x, h/2, z], args: [0.5 + Math.random(), h, 0.5 + Math.random()] });
    }
    return temp;
  }, [count]);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={b.position as any}>
          <boxGeometry args={b.args as any} />
          <meshStandardMaterial color={COLORS.building} transparent opacity={0.8} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(...b.args)]} />
            <lineBasicMaterial color="#222" />
          </lineSegments>
        </mesh>
      ))}
    </group>
  );
};

// --- Humanoid Crowd System (Low Poly) ---
const Human = ({ position, color = COLORS.cyan }: any) => {
  const group = useRef<THREE.Group>(null);
  const [speed] = useState(0.02 + Math.random() * 0.02);
  const [offset] = useState(Math.random() * 100);
  
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() + offset;
    // Walk along a path
    group.current.position.x += Math.sin(t * 0.5) * speed;
    group.current.position.z += Math.cos(t * 0.5) * speed;
    group.current.rotation.y = Math.atan2(Math.cos(t * 0.5), -Math.sin(t * 0.5));
    
    // Bobbing animation (walking)
    group.current.position.y = Math.abs(Math.sin(t * 5)) * 0.05;
  });

  return (
    <group ref={group} position={position}>
      {/* Head */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.06, 0.3, 8]} />
        <meshBasicMaterial color={color} opacity={0.6} transparent />
      </mesh>
    </group>
  );
};

const CrowdSystem = () => {
  return (
    <group>
      {[...Array(30)].map((_, i) => <Human key={`civ-${i}`} position={[(Math.random()-0.5)*10, 0, (Math.random()-0.5)*10]} color={COLORS.cyan} />)}
      {[...Array(10)].map((_, i) => <Human key={`sec-${i}`} position={[4 + (Math.random()-0.5), 0, -4 + (Math.random()-0.5)]} color={COLORS.gold} />)}
    </group>
  );
};

// --- Detailed Buildings ---
const BurjKhalifa = ({ onHack }: any) => (
  <group position={[-2, 0, -2]} onClick={() => onHack("BURJ_CORE", "SERVER")}>
    <mesh position={[0, 4, 0]}>
      <cylinderGeometry args={[0.1, 1.5, 8, 4]} />
      <meshStandardMaterial color={COLORS.grid} opacity={0.9} transparent />
      <lineSegments>
        <edgesGeometry args={[new THREE.CylinderGeometry(0.1, 1.5, 8, 4)]} />
        <lineBasicMaterial color={COLORS.cyan} />
      </lineSegments>
    </mesh>
    <Html position={[0, 6, 0]} distanceFactor={15}>
      <div className="text-[6px] text-neon-cyan bg-black/80 px-1 border border-neon-cyan">BURJ_KHALIFA</div>
    </Html>
  </group>
);

const BankNBD = ({ onHack }: any) => (
  <group position={[4, 0, -4]} onClick={() => onHack("NBD_VAULT", "BANK")}>
    <mesh position={[0, 1.5, 0]}>
      <boxGeometry args={[2, 3, 1]} />
      <meshStandardMaterial color={COLORS.gold} opacity={0.2} transparent />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2, 3, 1)]} />
        <lineBasicMaterial color={COLORS.gold} />
      </lineSegments>
    </mesh>
    <Html position={[0, 3.5, 0]} distanceFactor={15}>
      <div className="text-[6px] text-yellow-500 bg-black/80 px-1 border border-yellow-500 font-bold">$ NBD_HQ</div>
    </Html>
  </group>
);

const PalmJumeirah = ({ onHack }: any) => (
  <group position={[5, -0.1, 5]} rotation={[-Math.PI/2, 0, -0.5]} onClick={() => onHack("PALM_GRID", "WIFI")}>
    <mesh>
      <ringGeometry args={[0.5, 4, 32]} />
      <meshBasicMaterial color={COLORS.purple} opacity={0.1} transparent side={THREE.DoubleSide} />
    </mesh>
    <line>
      <ringGeometry args={[0.5, 4, 32]} />
      <lineBasicMaterial color={COLORS.purple} />
    </line>
    <Html position={[0, 0, 1]} distanceFactor={15}>
      <div className="text-[6px] text-purple-400 bg-black/80 px-1 border border-purple-500">PALM_JUMEIRAH</div>
    </Html>
  </group>
);

// --- Hacking Node ---
const Node = ({ position, type, label, onHack }: any) => {
  const [hovered, setHovered] = useState(false);
  const color = type === 'WIFI' ? COLORS.cyan : (type === 'BANK' ? COLORS.gold : COLORS.danger);
  
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onHack(label, type); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={color} wireframe={!hovered} />
      </mesh>
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/90 border border-white/20 p-1 text-[6px] text-white font-mono whitespace-nowrap z-50">
            {label}<br/>
            <span style={{ color }}>CLICK_TO_BREACH</span>
          </div>
        </Html>
      )}
    </group>
  );
};

export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHack = (target: string, type: string) => {
    updateWindow('terminal', { isOpen: true });
    openWindow('terminal');
    addLog(`INITIATING BREACH SEQUENCE ON ${target}...`, 'warning');
    addLog(`REQUIRED PROTOCOL: crack ${target} --type ${type}`, 'output');
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">LOADING_GEO_DATA...</div>;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair">
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 40 }}>
        <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={45} />
        <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={50} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color={COLORS.cyan} />
        
        {/* City Environment */}
        <gridHelper args={[100, 50, '#222', '#050505']} position={[0, -0.1, 0]} />
        <CityBlock count={60} />
        <CrowdSystem />

        {/* High Value Targets */}
        <group>
          <BurjKhalifa onHack={handleHack} />
          <PalmJumeirah onHack={handleHack} />
          <BankNBD onHack={handleHack} />

          {/* High Density Node Grid */}
          {[...Array(15)].map((_, i) => (
            <Node 
              key={`wifi-${i}`} 
              position={[(Math.random()-0.5)*15, 0.2, (Math.random()-0.5)*15]} 
              type="WIFI" 
              label={`RES_NET_${100+i}`} 
              onHack={handleHack} 
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <Node 
              key={`cam-${i}`} 
              position={[(Math.random()-0.5)*10, 1, (Math.random()-0.5)*10]} 
              type="CAM" 
              label={`STREET_CAM_${50+i}`} 
              onHack={handleHack} 
            />
          ))}
          
          {/* Specific Bank Nodes */}
          <Node position={[4.2, 0.5, -4.2]} type="BANK" label="NBD_ATM_GATEWAY" onHack={handleHack} />
          <Node position={[3.8, 2, -3.8]} type="BANK" label="NBD_EXECUTIVE_WIFI" onHack={handleHack} />
        </group>
      </Canvas>

      <div className="absolute top-4 left-4 pointer-events-none font-mono">
        <div className="text-[10px] text-neon-cyan font-black tracking-[0.3em] mb-1">DUBAI_GRID_LIVE</div>
        <div className="text-[8px] text-white/40">SECTOR: DOWNTOWN // PALM // DIFC</div>
        <div className="text-[8px] text-emerald-500 animate-pulse">ACTIVE_AGENTS: 42</div>
      </div>
    </div>
  );
};
