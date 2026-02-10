'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager } from '@/store/useWindowManager';

const COLORS = {
  cyan: '#00D4E5',
  pink: '#FF53B2',
  purple: '#6B0098',
  gold: '#FFD700',
  grid: '#0a0a0a',
  danger: '#ff0000',
  success: '#00ff00'
};

// --- Procedural Palm Jumeirah Geometry ---
const PalmJumeirah = () => {
  const palmShape = useMemo(() => {
    const shape = new THREE.Shape();
    
    // Trunk
    shape.moveTo(-0.5, 0);
    shape.lineTo(-0.4, 4);
    shape.lineTo(0.4, 4);
    shape.lineTo(0.5, 0);
    
    // Fronds (Procedural generation)
    for (let i = 0; i < 16; i++) {
      const angle = (i / 15) * Math.PI * 0.8 + 0.1 * Math.PI; 
      const length = 2.5 + Math.sin(i * 0.5) * 0.5; 
      const yStart = 1 + (i / 16) * 2.5;
      
      shape.moveTo(0.4, yStart);
      shape.quadraticCurveTo(2, yStart + 0.5, 0.4 + length, yStart + 0.2);
      shape.quadraticCurveTo(2, yStart - 0.2, 0.4, yStart - 0.1);

      shape.moveTo(-0.4, yStart);
      shape.quadraticCurveTo(-2, yStart + 0.5, -(0.4 + length), yStart + 0.2);
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
    <group position={[5, -0.5, 5]} rotation={[-Math.PI / 2, 0, -0.5]}>
      {/* Glow Effect */}
      <mesh position={[0, 0, -0.1]}>
        <shapeGeometry args={[palmShape]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.1} />
      </mesh>
      {/* Wireframe Structure */}
      <mesh>
        <shapeGeometry args={[palmShape]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe />
      </mesh>
      
      {/* Crescent */}
      <group position={[0, 0.5, 0]}>
         <mesh>
          <shapeGeometry args={[crescentShape]} />
          <meshBasicMaterial color={COLORS.purple} transparent opacity={0.2} />
        </mesh>
        <mesh>
          <shapeGeometry args={[crescentShape]} />
          <meshBasicMaterial color={COLORS.purple} wireframe />
        </mesh>
      </group>
    </group>
  );
};

// --- Detailed Burj Khalifa with Interactive Floors ---
const BurjKhalifa = ({ onHack }: { onHack: (target: string, type: string) => void }) => {
  return (
    <group position={[-2, 0, -2]}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[1.5, 2, 2, 3]} />
        <meshStandardMaterial color="#111" wireframe />
      </mesh>
      
      {[...Array(8)].map((_, i) => (
        <mesh key={i} position={[0, 2 + i * 1.5, 0]}>
          <cylinderGeometry args={[1.5 - (i * 0.15), 1.5 - (i * 0.15), 1.5, 3]} />
          <meshStandardMaterial color="#050505" transparent opacity={0.8} />
          <lineSegments>
            <edgesGeometry args={[new THREE.CylinderGeometry(1.5 - (i * 0.15), 1.5 - (i * 0.15), 1.5, 3)]} />
            <lineBasicMaterial color={COLORS.cyan} opacity={0.3} transparent />
          </lineSegments>
        </mesh>
      ))}

      <group position={[0, 10, 0]} onClick={() => onHack("BURJ_SERVER_154", "SERVER")}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 0.2, 16]} />
          <meshBasicMaterial color={COLORS.danger} transparent opacity={0.6} />
        </mesh>
        <Html distanceFactor={15}>
          <div className="bg-black/80 border border-red-500 text-[8px] text-red-500 px-1 py-0.5 font-mono whitespace-nowrap animate-pulse cursor-pointer hover:bg-red-900/50">
            ⚠ FLOOR 154 // RESTRICTED
          </div>
        </Html>
      </group>

      <mesh position={[0, 16, 0]}>
        <cylinderGeometry args={[0.05, 0.4, 5, 4]} />
        <meshBasicMaterial color={COLORS.cyan} />
      </mesh>
    </group>
  );
};

const BankNBD = ({ onHack }: { onHack: (target: string, type: string) => void }) => {
  return (
    <group position={[4, 0, -4]} onClick={() => onHack("NBD_MAIN_VAULT", "BANK")}>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[2, 4, 1]} />
        <meshStandardMaterial color="#0a0a0a" />
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(2, 4, 1)]} />
          <lineBasicMaterial color={COLORS.gold} />
        </lineSegments>
      </mesh>
      <Html position={[0, 4.5, 0]} distanceFactor={15}>
        <div className="bg-black/80 border border-yellow-500 text-[8px] text-yellow-500 px-1 py-0.5 font-mono whitespace-nowrap">
          $ NBD_CORE_VAULT
        </div>
      </Html>
    </group>
  );
};

const Node = ({ position, type, label, onHack }: any) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group position={position} onClick={() => onHack(label, type)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color={type === 'WIFI' ? COLORS.cyan : COLORS.danger} wireframe={!hovered} />
      </mesh>
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/90 border border-white/20 p-1 text-[8px] text-white font-mono whitespace-nowrap z-50">
            {label} <br/>
            <span className="text-emerald-400">CLICK TO HACK</span>
          </div>
        </Html>
      )}
      <pointLight distance={2} intensity={2} color={type === 'WIFI' ? COLORS.cyan : COLORS.danger} />
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
      title: `TERMINAL // HACKING: ${target}`,
    });
    openWindow('terminal');
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">INITIALIZING_HOLO_GRID...</div>;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-neon-cyan animate-pulse font-mono text-xs">UPLINKING_GRID_DATA...</div>}>
        <Canvas shadows camera={{ position: [8, 8, 8], fov: 45 }}>
          <PerspectiveCamera makeDefault position={[10, 12, 10]} fov={50} />
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={5}
            maxDistance={40}
            autoRotate
            autoRotateSpeed={0.5}
          />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color={COLORS.cyan} />
          <gridHelper args={[100, 50, COLORS.purple, 0x000000]} position={[0, -0.1, 0]} />
          <group>
            <BurjKhalifa onHack={handleHack} />
            <PalmJumeirah />
            <BankNBD onHack={handleHack} />
            <Node position={[6, 0, 6]} type="WIFI" label="PALM_VILLA_42_WIFI" onHack={handleHack} />
            <Node position={[4, 0, 7]} type="CAM" label="PALM_STREET_CAM_09" onHack={handleHack} />
            <Node position={[7, 0, 4]} type="WIFI" label="ATLANTIS_GUEST_NET" onHack={handleHack} />
            <Node position={[-3, 0, -1]} type="CAM" label="DUBAI_MALL_ENTRANCE" onHack={handleHack} />
            <Node position={[-1, 0, -3]} type="WIFI" label="EMAAR_CORP_NET" onHack={handleHack} />
          </group>
        </Canvas>
      </Suspense>

      <div className="absolute top-4 left-4 pointer-events-none font-mono">
        <div className="text-xs text-neon-cyan font-black tracking-[0.3em] mb-1 border-b border-neon-cyan/30 pb-1">DUBAI_GRID_V7.0</div>
        <div className="text-[9px] text-white/60 uppercase">Sector: SIGINT // RECON</div>
      </div>
    </div>
  );
};