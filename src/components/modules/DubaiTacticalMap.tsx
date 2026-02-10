'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, PerspectiveCamera, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Wifi, Smartphone, Server } from 'lucide-react';

const COLORS = {
  cyan: '#00D4E5',
  pink: '#FF53B2',
  gold: '#FFD700',
  danger: '#ff3333',
  satellite: '#ffffff'
};

// --- ORBITAL VIEW (Start Screen) ---
const Earth = ({ onSelectSat }: any) => {
  return (
    <group>
      <mesh rotation={[0, 0, 0.4]}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial color="#051040" metalness={0.6} roughness={0.4} wireframe={false} />
      </mesh>
      <mesh scale={1.01}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.1} />
      </mesh>
      
      {/* Satellites */}
      <SatelliteNode position={[12, 4, 8]} label="KH-11 [DUBAI]" id="KH-11" onClick={onSelectSat} />
      <SatelliteNode position={[-10, 6, 10]} label="SENTINEL-6 [NYC]" id="SENTINEL-6" onClick={onSelectSat} />
      <SatelliteNode position={[5, 12, -5]} label="NEOM-SAT [NEOM]" id="NEOM-SAT" onClick={onSelectSat} />
    </group>
  );
};

const SatelliteNode = ({ position, label, id, onClick }: any) => {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position} onClick={() => onClick(id)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color={hovered ? COLORS.gold : COLORS.satellite} />
      </mesh>
      <Html distanceFactor={20}>
        <div className="bg-black/80 border border-white/20 p-1 text-[8px] text-white font-mono whitespace-nowrap cursor-pointer hover:bg-white/10">
          <div className="flex items-center gap-1">
            <Satellite size={10} className={hovered ? "text-yellow-400" : "text-white"} />
            {label}
          </div>
          {hovered && <div className="text-[6px] text-neon-cyan mt-1">CLICK_TO_HACK_DOWNLINK</div>}
        </div>
      </Html>
    </group>
  );
};

// --- DEEP SCAN DOSSIER (Entity Popup) ---
const DeepScanDossier = ({ entity, onClose }: any) => {
  if (!entity) return null;
  
  // Mock Data Generator
  const devices = Array.from({ length: Math.floor(Math.random() * 5) + 3 }).map((_, i) => ({
    id: `DEV-${Math.floor(Math.random()*9999)}`,
    type: Math.random() > 0.5 ? 'iPhone 15 Pro' : 'Samsung S24 Ultra',
    os: Math.random() > 0.5 ? 'iOS 18.1' : 'Android 15',
    mac: Array.from({length: 6}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':').toUpperCase()
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
      className="absolute top-20 right-4 w-80 bg-black/90 border-l-4 border-neon-cyan p-4 font-mono z-[2000]"
    >
      <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-2">
        <div>
          <div className="text-xs text-neon-cyan font-black tracking-[0.2em]">DEEP_SCAN_RESULT</div>
          <div className="text-[9px] text-white/60">TARGET: {entity.type} // ID: {entity.id}</div>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white">X</button>
      </div>
      
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {devices.map((d, i) => (
          <div key={i} className="bg-white/5 p-2 rounded border border-white/5 hover:border-neon-cyan/50 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone size={12} className="text-emerald-400" />
              <span className="text-[9px] text-white font-bold">{d.type}</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[8px] text-white/50">
              <span>OS: {d.os}</span>
              <span>ID: {d.id}</span>
              <span className="col-span-2 font-mono text-white/30">MAC: {d.mac}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-2 border-t border-white/10">
        <button className="w-full bg-neon-cyan/10 border border-neon-cyan text-neon-cyan text-[9px] py-1 hover:bg-neon-cyan/20">
          DOWNLOAD_ALL_LOGS.ZIP
        </button>
      </div>
    </motion.div>
  );
};

// --- CITY ENGINES ---

const DubaiGrid = ({ onInspect }: any) => (
  <group>
    {/* Burj Khalifa */}
    <mesh position={[0, 15, 0]} onClick={() => onInspect({ type: 'BUILDING', id: 'BURJ_KHALIFA' })}>
      <cylinderGeometry args={[0.5, 2, 30, 6]} />
      <meshStandardMaterial color="#111" />
      <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0.5, 2, 30, 6)]} /><lineBasicMaterial color={COLORS.cyan} /></lineSegments>
    </mesh>
    {/* Palm Jumeirah (Simplified for reliability) */}
    <group position={[-40, 0, 20]} onClick={() => onInspect({ type: 'SECTOR', id: 'PALM_JUMEIRAH' })}>
      <mesh rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[2, 10, 16]} />
        <meshBasicMaterial color={COLORS.purple} wireframe />
      </mesh>
    </group>
  </group>
);

const NycGrid = ({ onInspect }: any) => (
  <group>
    {/* Skyscrapers */}
    {[...Array(50)].map((_, i) => (
      <mesh 
        key={i} 
        position={[(Math.random()-0.5)*60, Math.random()*5, (Math.random()-0.5)*60]} 
        onClick={(e) => { e.stopPropagation(); onInspect({ type: 'BUILDING', id: `NYC_TOWER_${i}` }); }}
      >
        <boxGeometry args={[2, Math.random()*10+5, 2]} />
        <meshStandardMaterial color="#111" />
        <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(2, 1, 2)]} /><lineBasicMaterial color="#444" /></lineSegments>
      </mesh>
    ))}
  </group>
);

// --- MAIN COMPONENT ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const [view, setView] = useState<'ORBIT' | 'DUBAI' | 'NYC'>('ORBIT');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSatelliteHack = (id: string) => {
    updateWindow('terminal', { isOpen: true, title: `TERMINAL // HACKING: ${id}` });
    openWindow('terminal');
    // Simulate hack success after delay
    setTimeout(() => {
      if (id === 'KH-11') setView('DUBAI');
      if (id === 'SENTINEL-6') setView('NYC');
    }, 2000);
  };

  const handleInspect = (entity: any) => {
    setSelectedEntity(entity);
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">SYSTEM_INIT...</div>;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair">
      <Canvas shadows camera={{ position: [0, 20, 40], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[0, 30, 50]} fov={view === 'ORBIT' ? 45 : 30} />
        <OrbitControls 
          enableDamping 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={10} 
          maxDistance={200} 
          autoRotate={view === 'ORBIT'}
        />
        <Stars radius={200} count={5000} factor={4} fade />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={COLORS.cyan} />

        {view === 'ORBIT' && <Earth onSelectSat={handleSatelliteHack} />}
        
        {view !== 'ORBIT' && (
          <group>
            <gridHelper args={[200, 100, '#222', '#050505']} position={[0, -0.1, 0]} />
            {view === 'DUBAI' && <DubaiGrid onInspect={handleInspect} />}
            {view === 'NYC' && <NycGrid onInspect={handleInspect} />}
            
            {/* Lidar Crowds (Clickable) */}
            {[...Array(20)].map((_, i) => (
              <mesh 
                key={i} 
                position={[(Math.random()-0.5)*40, 1, (Math.random()-0.5)*40]}
                onClick={(e) => { e.stopPropagation(); onInspect({ type: 'CIVILIAN', id: `CITIZEN_${9000+i}` }); }}
              >
                <capsuleGeometry args={[0.2, 1, 4, 8]} />
                <meshBasicMaterial color={COLORS.cyan} />
              </mesh>
            ))}
          </group>
        )}
      </Canvas>

      {/* HUD Layers */}
      <div className="absolute top-4 left-4 pointer-events-none font-mono">
        <div className="text-xs text-neon-cyan font-black tracking-[0.3em] mb-1">GOD_MODE_V13</div>
        <div className="text-[9px] text-white/60">VIEW: {view}</div>
      </div>

      <AnimatePresence>
        {selectedEntity && <DeepScanDossier entity={selectedEntity} onClose={() => setSelectedEntity(null)} />}
      </AnimatePresence>
    </div>
  );
};
