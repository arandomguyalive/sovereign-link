'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, Text, Float, Stars, PerspectiveCamera, Html, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Satellite as SatIcon, Crosshair, Activity, Zap, ShieldAlert, Globe } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  pink: '#FF0055',
  purple: '#6B0098',
  gold: '#FFD700',
  danger: '#FF3333',
  grid: '#050505',
};

// --- ORBITAL SATELLITE (High-End Model) ---
const SatelliteNode = ({ position, id, label, onHack, isCracked }: any) => {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.01;
    ref.current.position.y += Math.sin(state.clock.getElapsedTime() + position[0]) * 0.005;
  });

  return (
    <group position={position} ref={ref} onClick={() => onHack(id)}>
      <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <boxGeometry args={[0.8, 0.4, 0.6]} />
        <meshStandardMaterial color={isCracked ? '#00ff00' : (hovered ? COLORS.gold : '#fff')} metalness={1} />
      </mesh>
      {/* Solar Wings */}
      <mesh position={[1.2, 0, 0]}>
        <boxGeometry args={[1.5, 0.02, 0.8]} />
        <meshBasicMaterial color={COLORS.blue} wireframe />
      </mesh>
      <mesh position={[-1.2, 0, 0]}>
        <boxGeometry args={[1.5, 0.02, 0.8]} />
        <meshBasicMaterial color={COLORS.blue} wireframe />
      </mesh>
      
      <Html distanceFactor={20} position={[0, 1.5, 0]}>
        <div className={`p-2 border font-mono text-[9px] whitespace-nowrap transition-all ${
          isCracked ? 'bg-emerald-950/90 border-emerald-500 text-emerald-400' : 'bg-black/90 border-white/20 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <SatIcon size={12} />
            <span className="font-black tracking-widest">{label}</span>
          </div>
          {hovered && !isCracked && <div className="mt-1 text-neon-cyan animate-pulse">INITIATE_SIGNAL_HANDSHAKE</div>}
        </div>
      </Html>
    </group>
  );
};

// --- LIDAR CITY (Point Cloud Rendering for Realism) ---
const LidarStructure = ({ position, type, name, onInspect }: any) => {
  const points = useMemo(() => {
    const temp = [];
    const count = type === 'BURJ' ? 2000 : 500;
    for (let i = 0; i < count; i++) {
      if (type === 'BURJ') {
        const h = Math.random() * 30;
        const r = (1 - h / 30) * 2;
        const a = Math.random() * Math.PI * 2;
        temp.push(Math.cos(a) * r, h, Math.sin(a) * r);
      } else if (type === 'PALM') {
        const r = Math.random() * 15;
        const a = Math.random() * Math.PI * 2;
        temp.push(Math.cos(a) * r, 0, Math.sin(a) * r);
      } else {
        temp.push((Math.random() - 0.5) * 5, Math.random() * 8, (Math.random() - 0.5) * 5);
      }
    }
    return new Float32Array(temp);
  }, [type]);

  return (
    <group position={position} onClick={() => onInspect({ id: name, type })}>
      <Points positions={points}>
        <PointMaterial transparent color={type === 'BANK' ? COLORS.gold : COLORS.cyan} size={0.08} sizeAttenuation={true} depthWrite={false} />
      </Points>
      {type === 'BURJ' && (
        <mesh position={[0, 25, 0]} onClick={(e) => { e.stopPropagation(); onInspect({ id: 'FLOOR_154', type: 'RESTRICTED' }); }}>
          <torusGeometry args={[2.5, 0.05, 16, 100]} />
          <meshBasicMaterial color={COLORS.danger} />
          <Html distanceFactor={40}><div className="bg-red-600 text-white text-[8px] px-1 font-black animate-pulse">RESTRICTED_ZONE</div></Html>
        </mesh>
      )}
      <Html position={[0, type === 'BURJ' ? 32 : 10, 0]} distanceFactor={50}>
        <div className="text-[10px] text-white font-black bg-black/60 px-2 border border-white/20 uppercase tracking-widest">{name}</div>
      </Html>
    </group>
  );
};

// --- LIDAR AGENTS ---
const LidarAgent = ({ position, onInspect }: any) => {
  const ref = useRef<THREE.Group>(null);
  const [speed] = useState(0.05 + Math.random() * 0.05);
  
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.x += Math.sin(t * speed + position[0]) * 0.02;
    ref.current.position.z += Math.cos(t * speed + position[2]) * 0.02;
  });

  return (
    <group ref={ref} position={position} onClick={(e) => { e.stopPropagation(); onInspect(); }}>
      <mesh>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <ringGeometry args={[0.3, 0.35, 16]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// --- MAIN ENGINE ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [view, setView] = useState<'ORBIT' | 'CITY'>('ORBIT');
  const [crackedSats, setCrackedSats] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSatHack = (id: string) => {
    if (crackedSats.includes(id)) {
      setView('CITY');
      return;
    }
    updateWindow('terminal', { isOpen: true, title: `SIGNAL_BREACH // ${id}` });
    openWindow('terminal');
    addLog(`[!] DETECTING HANDSHAKE FROM ${id}...`, 'warning');
    setTimeout(() => {
      setCrackedSats(prev => [...prev, id]);
      addLog(`[SUCCESS] DOWNLINK ESTABLISHED. DESCENDING...`, 'success');
      setView('CITY');
    }, 2000);
  };

  const handleInspect = (target: any) => {
    setSelectedTarget(target);
    updateWindow('terminal', { isOpen: true });
    openWindow('terminal');
    addLog(`[SCAN] TARGET ACQUIRED: ${target.id}`, 'info');
    if (target.type === 'RESTRICTED') addLog(`[WARNING] ACCESSING HIGH-SECURITY SECTOR`, 'error');
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">GOD_EYE_BOOT...</div>;

  return (
    <div className="w-full h-full bg-[#010101] relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 15, 25] : [0, 60, 60]} fov={40} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={200} maxPolarAngle={Math.PI / 2.1} />
        <Stars radius={200} count={10000} factor={4} fade />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 50, 10]} intensity={2} color={COLORS.cyan} />

        {view === 'ORBIT' ? (
          <group rotation={[0, 0, 0.4]}>
            <mesh><sphereGeometry args={[10, 64, 64]} /><meshStandardMaterial color="#051030" metalness={0.9} roughness={0.1} /></mesh>
            <SatelliteNode position={[14, 2, 8]} label="KH-11 [DUBAI]" id="KH-11" isCracked={crackedSats.includes('KH-11')} onHack={handleSatHack} />
            <SatelliteNode position={[-12, 6, 10]} label="SENTINEL-6 [NYC]" id="SENTINEL-6" isCracked={crackedSats.includes('SENTINEL-6')} onHack={handleSatHack} />
            <SatelliteNode position={[5, 14, -6]} label="EYE-1 [LONDON]" id="EYE-1" isCracked={crackedSats.includes('EYE-1')} onHack={handleSatHack} />
          </group>
        ) : (
          <group>
            {/* Lidar Ground Grid */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <planeGeometry args={[500, 500, 100, 100]} />
              <meshBasicMaterial color={COLORS.blue} wireframe opacity={0.1} transparent />
            </mesh>
            
            <LidarStructure position={[30, 0, -20]} type="BURJ" name="BURJ_KHALIFA" onInspect={handleInspect} />
            <LidarStructure position={[-40, 0, 20]} type="PALM" name="PALM_JUMEIRAH" onInspect={handleInspect} />
            <LidarStructure position={[40, 0, -10]} type="BANK" name="BANK_OF_EMIRATES" onInspect={handleInspect} />

            {[...Array(40)].map((_, i) => (
              <LidarAgent key={i} position={[(Math.random()-0.5)*100, 0, (Math.random()-0.5)*100]} onInspect={() => handleInspect({ id: `HUMAN_${9000+i}`, type: 'BIOMETRIC' })} />
            ))}
          </group>
        )}
      </Canvas>

      {/* GOD EYE INTERFACE */}
      <div className="absolute top-4 left-4 font-mono pointer-events-none select-none">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={20} className="text-neon-cyan animate-spin-slow" />
          <div className="text-xl text-neon-cyan font-black tracking-[0.5em]">GOD_EYE_APEX</div>
        </div>
        <div className="text-[10px] text-white/40 mb-4 uppercase">Downlink: {view} // Locked: {crackedSats.length}</div>
        
        {view !== 'ORBIT' && (
          <button 
            onClick={() => setView('ORBIT')} 
            className="mt-4 px-4 py-2 border border-red-500 text-red-500 text-[10px] font-black uppercase pointer-events-auto hover:bg-red-500/20 transition-all shadow-[0_0_15px_rgba(255,0,0,0.2)]"
          >
            TERMINATE_UPLINK
          </button>
        )}
      </div>

      {/* Target Dossier */}
      <AnimatePresence>
        {selectedTarget && (
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="absolute top-20 right-4 w-80 bg-black/95 border-l-4 border-neon-cyan p-4 font-mono z-[2000] shadow-2xl pointer-events-auto">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
              <div className="text-xs text-neon-cyan font-black tracking-widest">TARGET_DOSSIER // {selectedTarget.id}</div>
              <button onClick={() => setSelectedTarget(null)} className="text-white/40 hover:text-white transition-colors">X</button>
            </div>
            <div className="text-[9px] text-white/60 space-y-2">
              <div className="flex justify-between"><span>DEVICE_TYPE:</span> <span className="text-white">IPHONE_15_PRO</span></div>
              <div className="flex justify-between"><span>STATUS:</span> <span className="text-emerald-400">ACTIVE_SIGNAL</span></div>
              <div className="flex justify-between"><span>ENCRYPTION:</span> <span className="text-yellow-400">WPA3_ENTERPRISE</span></div>
              <div className="flex justify-between"><span>OS_VER:</span> <span className="text-white">iOS_18.1.2</span></div>
            </div>
            <div className="mt-6">
               <div className="text-[8px] text-neon-cyan mb-1 font-black uppercase">Intercepting_Data_Waterfall...</div>
               <div className="h-24 overflow-hidden bg-white/5 p-2 rounded text-[7px] text-white/30 truncate">
                  {Array.from({length: 10}).map((_, i) => <div key={i}>{Math.random().toString(16).repeat(5)}</div>)}
               </div>
            </div>
            <button className="w-full mt-4 py-2 bg-emerald-500/10 border border-emerald-500 text-emerald-500 text-[9px] font-black hover:bg-emerald-500/20">
              CLONE_DEVICE_IDENTITY
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <Crosshair size={60} className="text-neon-cyan opacity-20" />
      </div>
    </div>
  );
};
