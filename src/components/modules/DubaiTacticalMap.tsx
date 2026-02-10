'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, Stars, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { motion } from 'framer-motion';

const COLORS = {
  cyan: '#00D4E5',
  pink: '#FF53B2',
  purple: '#6B0098',
  gold: '#FFD700',
  ocean: '#05101a',
  grid: '#1a1a1a',
  danger: '#ff3333',
  building: '#080808',
  traffic_white: '#ffffff',
  traffic_red: '#ff0000'
};

// --- GEOMETRY: Palm Jumeirah (Exact Shape) ---
const PalmJumeirah = ({ onHack }: any) => {
  const palmShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, 0); shape.lineTo(-0.4, 4); shape.lineTo(0.4, 4); shape.lineTo(0.5, 0);
    for (let i = 0; i < 16; i++) {
      const yStart = 1 + (i / 16) * 2.5;
      shape.moveTo(0.4, yStart);
      shape.quadraticCurveTo(2, yStart + 0.5, 0.4 + (2.5 + Math.sin(i)*0.5), yStart + 0.2);
      shape.quadraticCurveTo(2, yStart - 0.2, 0.4, yStart - 0.1);
      shape.moveTo(-0.4, yStart);
      shape.quadraticCurveTo(-2, yStart + 0.5, -(0.4 + (2.5 + Math.sin(i)*0.5)), yStart + 0.2);
      shape.quadraticCurveTo(-2, yStart - 0.2, -0.4, yStart - 0.1);
    }
    return shape;
  }, []);

  const crescentShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 4.5, 4.5, 0, Math.PI, false);
    shape.absarc(0, 4.5, 4.0, Math.PI, 0, true);
    return shape;
  }, []);

  return (
    <group position={[-30, 0.1, 15]} rotation={[-Math.PI / 2, 0, -0.5]} onClick={(e) => { e.stopPropagation(); onHack("PALM_GRID_MASTER", "WIFI"); }}>
      <mesh>
        <shapeGeometry args={[palmShape]} />
        <meshBasicMaterial color={COLORS.purple} transparent opacity={0.3} />
      </mesh>
      <mesh>
        <shapeGeometry args={[palmShape]} />
        <meshBasicMaterial color={COLORS.purple} wireframe />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <shapeGeometry args={[crescentShape]} />
        <meshBasicMaterial color={COLORS.purple} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <shapeGeometry args={[crescentShape]} />
        <meshBasicMaterial color={COLORS.purple} wireframe />
      </mesh>
      <Html position={[0, 2, 1]} distanceFactor={60}>
        <div className="text-[8px] text-purple-400 bg-black/80 px-1 border border-purple-500 font-mono">PALM_SECTOR</div>
      </Html>
    </group>
  );
};

// --- GEOMETRY: Burj Al Arab (The Sail) ---
const BurjAlArab = ({ onHack }: any) => {
  const sailShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.quadraticCurveTo(3, 4, 0, 8); shape.lineTo(-1, 0); shape.lineTo(0, 0);
    return shape;
  }, []);

  return (
    <group position={[-10, 0, 5]} rotation={[0, Math.PI / 4, 0]} onClick={(e) => { e.stopPropagation(); onHack("ROYAL_SUITE_WIFI", "WIFI"); }}>
      <mesh>
        <extrudeGeometry args={[sailShape, { depth: 1, bevelEnabled: false }]} />
        <meshStandardMaterial color="white" transparent opacity={0.9} />
        <lineSegments>
          <edgesGeometry args={[new THREE.ExtrudeGeometry(sailShape, { depth: 1, bevelEnabled: false })]} />
          <lineBasicMaterial color={COLORS.cyan} />
        </lineSegments>
      </mesh>
      <mesh position={[0, 6.5, 1.2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
        <meshBasicMaterial color={COLORS.gold} />
      </mesh>
      <Html position={[0, 9, 0]} distanceFactor={50}>
        <div className="bg-black/80 border border-white/20 text-[8px] text-white px-1 py-0.5 font-mono">BURJ_AL_ARAB</div>
      </Html>
    </group>
  );
};

// --- GEOMETRY: Burj Khalifa (Downtown) ---
const BurjKhalifa = ({ onHack }: any) => (
  <group position={[20, 0, -20]} onClick={(e) => { e.stopPropagation(); onHack("BURJ_CORE_154", "SERVER"); }}>
    <mesh position={[0, 15, 0]}>
      <cylinderGeometry args={[0.1, 2, 30, 6]} />
      <meshStandardMaterial color={COLORS.building} opacity={0.95} transparent />
      <lineSegments>
        <edgesGeometry args={[new THREE.CylinderGeometry(0.1, 2, 30, 6)]} />
        <lineBasicMaterial color={COLORS.cyan} />
      </lineSegments>
    </mesh>
    {[0, 120, 240].map((rot, i) => (
      <mesh key={i} position={[0, 5, 0]} rotation={[0, rot * (Math.PI/180), 0]}>
        <boxGeometry args={[1.5, 10, 1.5]} />
        <meshStandardMaterial color={COLORS.building} />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.5, 10, 1.5)]} />
          <lineBasicMaterial color={COLORS.cyan} opacity={0.5} transparent />
        </lineSegments>
      </mesh>
    ))}
    <Html position={[0, 31, 0]} distanceFactor={60}>
      <div className="text-[8px] text-neon-cyan bg-black/80 px-1 border border-neon-cyan font-mono">BURJ_KHALIFA</div>
    </Html>
  </group>
);

// --- GEOMETRY: Bank of Emirates (NBD) ---
const BankNBD = ({ onHack }: any) => (
  <group position={[25, 0, -15]} onClick={(e) => { e.stopPropagation(); onHack("NBD_VAULT_CORE", "BANK"); }}>
    <mesh position={[0, 4, 0]}>
      <boxGeometry args={[4, 8, 2]} />
      <meshStandardMaterial color={COLORS.gold} wireframe opacity={0.1} transparent />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4, 8, 2)]} />
        <lineBasicMaterial color={COLORS.gold} />
      </lineSegments>
    </mesh>
    <Html position={[0, 9, 0]} distanceFactor={40}>
      <div className="text-xs text-yellow-500 bg-black/80 px-2 border border-yellow-500 font-bold font-mono">$ NBD_HQ</div>
    </Html>
  </group>
);

const TrafficStream = ({ path, color, count = 20, speed = 0.1 }: any) => {
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
    const t = (state.clock.getElapsedTime() * speed + offset) % 1;
    const pos = path.getPointAt(t);
    mesh.current.position.set(pos.x, 0.2, pos.z);
  });
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[0.2, 0.2, 0.4]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const ParabolicGrid = () => (
  <group position={[0, -0.5, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[300, 300, 50, 50]} />
      <meshBasicMaterial color={COLORS.grid} wireframe opacity={0.2} transparent />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial color={COLORS.ocean} metalness={0.9} roughness={0.1} />
    </mesh>
  </group>
);

const SatelliteHuman = ({ position }: any) => {
  const group = useRef<THREE.Group>(null);
  const [speed] = useState(0.01 + Math.random() * 0.02);
  const [offset] = useState(Math.random() * 100);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime() + offset;
    group.current.position.x += Math.sin(t * 0.3) * speed;
    group.current.position.z += Math.cos(t * 0.3) * speed;
    group.current.rotation.y = Math.atan2(Math.cos(t * 0.3), -Math.sin(t * 0.3));
  });
  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
    </group>
  );
};

const CrowdSystem = ({ count = 50, area = [20, 20], center = [0, 0] }: any) => (
  <group position={[center[0], 0, center[1]]}>
    {[...Array(count)].map((_, i) => (
      <SatelliteHuman key={i} position={[(Math.random()-0.5)*area[0], 0, (Math.random()-0.5)*area[1]]} />
    ))}
  </group>
);

const Node = ({ position, type, label, onHack }: any) => {
  const [hovered, setHovered] = useState(false);
  const color = type === 'WIFI' ? COLORS.cyan : COLORS.danger;
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onHack(label, type); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color={color} wireframe={!hovered} />
      </mesh>
      {hovered && (
        <Html distanceFactor={15}>
          <div className="bg-black/90 border border-white/20 p-1 text-[8px] text-white font-mono whitespace-nowrap z-50">
            {label}<br/><span style={{ color }}>CLICK_TO_BREACH</span>
          </div>
        </Html>
      )}
      <pointLight distance={5} intensity={2} color={color} />
    </group>
  );
};

export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const handleHack = (target: string, type: string) => {
    updateWindow('terminal', { isOpen: true, title: `TERMINAL // TARGET: ${target}` });
    openWindow('terminal');
  };
  const highwayPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-40, 0, 20),
      new THREE.Vector3(-10, 0, 10),
      new THREE.Vector3(20, 0, -20),
      new THREE.Vector3(50, 0, -30),
    ]);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">SAT_LINK_INIT...</div>;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair">
      <Canvas shadows camera={{ position: [0, 60, 60], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[0, 80, 80]} fov={40} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={200} maxPolarAngle={Math.PI / 2.1} />
        <Stars radius={200} depth={50} count={8000} factor={4} saturation={0} fade />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 50, 10]} intensity={1.5} color={COLORS.cyan} />
        <ParabolicGrid />
        <BurjKhalifa onHack={handleHack} />
        <BurjAlArab onHack={handleHack} />
        <PalmJumeirah onHack={handleHack} />
        <BankNBD onHack={handleHack} />
        <TrafficStream path={highwayPath} color={COLORS.traffic_white} count={30} speed={0.05} />
        <TrafficStream path={highwayPath} color={COLORS.traffic_red} count={30} speed={0.04} />
        <CrowdSystem count={40} area={[15, 15]} center={[20, -20]} />
        <CrowdSystem count={20} area={[10, 10]} center={[-30, 15]} />
        {[...Array(20)].map((_, i) => (
          <Node key={i} position={[(Math.random()-0.5)*60, 1, (Math.random()-0.5)*60]} type="WIFI" label={`WIFI_NODE_${i}`} onHack={handleHack} />
        ))}
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none font-mono">
        <div className="text-xs text-neon-cyan font-black tracking-[0.3em] mb-1 border-b border-neon-cyan/30 pb-1">APEX_GRID_V12</div>
        <div className="text-[9px] text-white/60">TARGET: DUBAI // GEOSPATIAL_TWIN</div>
      </div>
    </div>
  );
};