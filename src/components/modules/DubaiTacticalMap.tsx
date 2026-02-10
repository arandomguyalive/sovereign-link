'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, PerspectiveCamera, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { motion } from 'framer-motion';

const COLORS = {
  cyan: '#00D4E5',
  pink: '#FF53B2',
  purple: '#6B0098',
  gold: '#FFD700',
  ocean: '#05101a',
  grid: '#0a0a0a',
  danger: '#ff3333',
  building: '#080808'
};

// --- Real-World Geography Offsets (Scaled for 3D View) ---
// Origin (0,0) is roughly Burj Al Arab (Center Coast)
// Palm is SW (-X, +Z), Khalifa is NE (+X, -Z)
const GEO = {
  PALM: { x: -35, z: 15 },
  ARAB: { x: -5, z: 5 },
  KHALIFA: { x: 30, z: -20 },
  NBD: { x: 35, z: -15 },
};

// --- Advanced Ocean Simulation ---
const Ocean = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 20]}>
      <planeGeometry args={[200, 100]} />
      <meshStandardMaterial 
        color={COLORS.ocean} 
        metalness={0.8} 
        roughness={0.1} 
        transparent 
        opacity={0.9}
      />
    </mesh>
  );
};

// --- Landmass / Coastline ---
const Landmass = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.65, -30]}>
      <planeGeometry args={[200, 100]} />
      <meshStandardMaterial color="#020202" roughness={1} />
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
    group.current.position.x += Math.sin(t * 0.3) * speed;
    group.current.position.z += Math.cos(t * 0.3) * speed;
    group.current.rotation.y = Math.atan2(Math.cos(t * 0.3), -Math.sin(t * 0.3));
  });

  return (
    <group ref={group} position={position}>
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.12, 0.08, 0.9, 8]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
    </group>
  );
};

const CrowdSystem = ({ count = 20, area = [10, 10], offset = [0, 0] }: any) => {
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

// --- Burj Al Arab (The Sail) ---
const BurjAlArab = ({ onHack }: any) => {
  const sailShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(3, 4, 0, 8); // Curved back
    shape.lineTo(-1, 0);
    shape.lineTo(0, 0);
    return shape;
  }, []);

  return (
    <group position={[GEO.ARAB.x, 0, GEO.ARAB.z]} rotation={[0, Math.PI / 4, 0]} onClick={(e) => { e.stopPropagation(); onHack("ROYAL_SUITE_WIFI", "WIFI"); }}>
      {/* Main Sail Structure */}
      <mesh position={[0, 0, 0]}>
        <extrudeGeometry args={[sailShape, { depth: 1, bevelEnabled: false }]} />
        <meshStandardMaterial color="white" transparent opacity={0.9} />
        <lineSegments>
          <edgesGeometry args={[new THREE.ExtrudeGeometry(sailShape, { depth: 1, bevelEnabled: false })]} />
          <lineBasicMaterial color={COLORS.cyan} />
        </lineSegments>
      </mesh>
      {/* Helipad */}
      <mesh position={[0, 6.5, 1.2]}>
        <cylinderGeometry args={[0.8, 0.1, 0.2, 16]} />
        <meshBasicMaterial color={COLORS.gold} />
      </mesh>
      <Html position={[0, 9, 0]} distanceFactor={50}>
        <div className="bg-black/80 border border-white/20 text-[8px] text-white px-1 py-0.5 font-mono">BURJ_AL_ARAB</div>
      </Html>
    </group>
  );
};

// --- Burj Khalifa (Downtown) ---
const BurjKhalifa = ({ onHack }: any) => (
  <group position={[GEO.KHALIFA.x, 0, GEO.KHALIFA.z]} onClick={(e) => { e.stopPropagation(); onHack("BURJ_CORE_154", "SERVER"); }}>
    <mesh position={[0, 10, 0]}>
      <cylinderGeometry args={[0.1, 2, 20, 6]} />
      <meshStandardMaterial color={COLORS.building} opacity={0.95} transparent />
      <lineSegments>
        <edgesGeometry args={[new THREE.CylinderGeometry(0.1, 2, 20, 6)]} />
        <lineBasicMaterial color={COLORS.cyan} />
      </lineSegments>
    </mesh>
    {[0, 120, 240].map((rot, i) => (
      <mesh key={i} position={[0, 3, 0]} rotation={[0, rot * (Math.PI/180), 0]}>
        <boxGeometry args={[1, 6, 1]} />
        <meshStandardMaterial color={COLORS.building} />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1, 6, 1)]} />
          <lineBasicMaterial color={COLORS.cyan} opacity={0.5} transparent />
        </lineSegments>
      </mesh>
    ))}
    <Html position={[0, 21, 0]} distanceFactor={60}>
      <div className="text-[8px] text-neon-cyan bg-black/80 px-1 border border-neon-cyan">BURJ_KHALIFA // 828m</div>
    </Html>
  </group>
);

// --- Palm Jumeirah (Coast) ---
const PalmJumeirah = ({ onHack }: any) => {
  return (
    <group position={[GEO.PALM.x, -0.1, GEO.PALM.z]} rotation={[-Math.PI / 2, 0, -0.8]} onClick={(e) => { e.stopPropagation(); onHack("PALM_GRID_MASTER", "WIFI"); }}>
      {/* Trunk */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2, 10]} />
        <meshBasicMaterial color={COLORS.purple} wireframe />
      </mesh>
      {/* Fronds */}
      {[...Array(16)].map((_, i) => (
        <group key={i} position={[0, i * 0.8 - 4, 0]}>
          <mesh rotation={[0, 0, 0.3]} position={[3, 0, 0]}>
            <planeGeometry args={[6, 0.2]} />
            <meshBasicMaterial color={COLORS.purple} wireframe />
          </mesh>
          <mesh rotation={[0, 0, -0.3]} position={[-3, 0, 0]}>
            <planeGeometry args={[6, 0.2]} />
            <meshBasicMaterial color={COLORS.purple} wireframe />
          </mesh>
        </group>
      ))}
      {/* Crescent */}
      <mesh position={[0, 6, 0]}>
        <ringGeometry args={[5, 6, 32, 1, 0, Math.PI]} />
        <meshBasicMaterial color={COLORS.purple} wireframe />
      </mesh>
      
      <Html position={[0, 0, 2]} distanceFactor={60}>
        <div className="text-[8px] text-purple-400 bg-black/80 px-1 border border-purple-500">PALM_JUMEIRAH</div>
      </Html>
    </group>
  );
};

// --- Sheikh Zayed Road (Traffic Artery) ---
const SheikhZayedRoad = () => {
  return (
    <group>
      {/* The Highway */}
      <mesh position={[10, 0.1, -10]} rotation={[-Math.PI/2, 0, 0.6]}>
        <planeGeometry args={[5, 80]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      {/* Traffic Particles */}
      {[...Array(40)].map((_, i) => (
        <LidarHuman key={i} position={[i * 1.5 - 20, 0.5, i * -1]} color={i % 2 === 0 ? '#ff0000' : '#ffffff'} />
      ))}
    </group>
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
      title: `TERMINAL // TARGET: ${target}`,
    });
    openWindow('terminal');
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">UPLINKING_SATELLITE_FEED...</div>;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair">
      <Canvas shadows camera={{ position: [0, 40, 40], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[0, 50, 60]} fov={45} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.2} // Prevent going under ground
          minDistance={10}
          maxDistance={120}
        />
        
        <Stars radius={200} depth={50} count={8000} factor={4} saturation={0} fade speed={0.5} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 50, 10]} intensity={1.5} color={COLORS.cyan} />
        
        {/* Environment */}
        <Ocean />
        <Landmass />
        <SheikhZayedRoad />

        <group>
          <BurjKhalifa onHack={handleHack} />
          <CrowdSystem count={30} area={[10, 10]} offset={[GEO.KHALIFA.x, GEO.KHALIFA.z]} />
          
          <BurjAlArab onHack={handleHack} />
          
          <PalmJumeirah onHack={handleHack} />
          <CrowdSystem count={15} area={[8, 8]} offset={[GEO.PALM.x, GEO.PALM.z]} />
        </group>
      </Canvas>

      {/* Map HUD */}
      <div className="absolute top-4 left-4 pointer-events-none font-mono">
        <div className="text-xs text-neon-cyan font-black tracking-[0.3em] mb-1">DUBAI_TWIN_V10</div>
        <div className="text-[9px] text-white/60">SOURCE: KH-11 SATELLITE</div>
        <div className="text-[9px] text-emerald-500 animate-pulse">LIVE_FEED: ACTIVE</div>
      </div>
      
      {/* Coordinates */}
      <div className="absolute bottom-4 right-4 pointer-events-none font-mono text-right">
        <div className="text-[10px] text-white/40 font-bold">25.2048° N, 55.2708° E</div>
        <div className="text-[8px] text-neon-cyan uppercase tracking-widest">Targeting_System: ONLINE</div>
      </div>
    </div>
  );
};
