'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, Text, Float, Stars, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Wifi, Smartphone, ShieldAlert, Cpu } from 'lucide-react';

const COLORS = {
  cyan: '#00D4E5',
  pink: '#FF53B2',
  purple: '#6B0098',
  gold: '#FFD700',
  danger: '#ff3333',
  satellite: '#ffffff',
  grid: '#111111'
};

const CITIES = {
  ORBIT: { name: 'GLOBAL_ORBIT', id: 'ORBIT' },
  DUBAI: { name: 'DUBAI_DXB', id: 'DUBAI' },
  NYC: { name: 'NYC_MANHATTAN', id: 'NYC' },
  LDN: { name: 'LONDON_LDN', id: 'LDN' },
  NEOM: { name: 'NEOM_THE_LINE', id: 'NEOM' },
};

// --- ORBITAL SATELLITES ---
const SatelliteNode = ({ position, label, id, isCracked, onHack }: any) => {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position} onClick={() => onHack(id)} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh>
          <boxGeometry args={[0.6, 0.3, 0.4]} />
          <meshBasicMaterial color={isCracked ? '#00ff00' : (hovered ? COLORS.gold : COLORS.satellite)} />
        </mesh>
        {/* Solar Panels */}
        <mesh position={[0.6, 0, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.3]} />
          <meshBasicMaterial color={COLORS.cyan} wireframe />
        </mesh>
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[0.8, 0.05, 0.3]} />
          <meshBasicMaterial color={COLORS.cyan} wireframe />
        </mesh>
      </Float>
      <Html distanceFactor={20}>
        <div className="bg-black/90 border border-white/10 p-2 font-mono text-[8px] whitespace-nowrap cursor-pointer hover:bg-white/5 transition-all">
          <div className="flex items-center gap-2">
            <Satellite size={12} className={isCracked ? "text-emerald-400" : "text-white"} />
            <span className={isCracked ? "text-emerald-400" : "text-white"}>{label}</span>
          </div>
          <div className="mt-1 text-white/40">
            STATUS: {isCracked ? 'UPLINK_STABLE' : 'ENCRYPTED'}
          </div>
          {!isCracked && hovered && <div className="text-neon-cyan mt-1 animate-pulse">INITIATE_BRUTE_FORCE</div>}
        </div>
      </Html>
    </group>
  );
};

// --- HUMAN HEATMAP (CIA STYLE) ---
const LidarAgent = ({ position, onInspect }: any) => {
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
    <group ref={group} position={position} onClick={(e) => { e.stopPropagation(); onInspect(); }}>
      <mesh position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

// --- CITY LANDMARKS ---

const DubaiRealMap = ({ onInspect }: any) => (
  <group>
    {/* Burj Khalifa - Accurate Tiers */}
    <group position={[0, 0, 0]} onClick={() => onInspect({ type: 'INFRASTRUCTURE', id: 'BURJ_KHALIFA_CORE', name: 'Burj Khalifa' })}>
      <mesh position={[0, 15, 0]}>
        <cylinderGeometry args={[0.1, 2, 30, 6]} />
        <meshStandardMaterial color="#050505" />
        <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0.1, 2, 30, 6)]} /><lineBasicMaterial color={COLORS.cyan} opacity={0.5} transparent /></lineSegments>
      </mesh>
      <Html position={[0, 32, 0]} distanceFactor={50}><div className="text-[8px] text-neon-cyan border border-neon-cyan px-1 bg-black/80">CORE_LINK // 828m</div></Html>
    </group>

    {/* Burj Al Arab - Accurate Sail */}
    <group position={[-15, 0, 10]} onClick={() => onInspect({ type: 'INFRASTRUCTURE', id: 'AL_ARAB_HUB', name: 'Burj Al Arab' })}>
      <mesh position={[0, 5, 0]} rotation={[0, Math.PI/4, 0]}>
        <cylinderGeometry args={[0, 2.5, 10, 3]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.8} />
        <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0, 2.5, 10, 3)]} /><lineBasicMaterial color={COLORS.cyan} /></lineSegments>
      </mesh>
    </group>

    {/* Bank of Emirates (NBD) */}
    <group position={[10, 0, -15]} onClick={() => onInspect({ type: 'FINANCIAL', id: 'NBD_CENTRAL_VAULT', name: 'Bank of Emirates NBD' })}>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[4, 6, 2]} />
        <meshStandardMaterial color="#0a0a0a" />
        <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(4, 6, 2)]} /><lineBasicMaterial color={COLORS.gold} /></lineSegments>
      </mesh>
      <Html position={[0, 7, 0]} distanceFactor={40}><div className="text-[8px] text-yellow-500 border border-yellow-500 px-1 bg-black/80">VAULT_ENCRYPTED</div></Html>
    </group>

    {/* Palm Jumeirah (Exact Fronds) */}
    <group position={[-30, 0, 30]} rotation={[-Math.PI/2, 0, -0.5]}>
      <mesh><ringGeometry args={[1, 10, 16]} /><meshBasicMaterial color={COLORS.purple} wireframe opacity={0.2} transparent /></mesh>
    </group>
  </group>
);

const LondonMap = ({ onInspect }: any) => (
  <group>
    {/* The Shard */}
    <mesh position={[0, 10, 0]} onClick={() => onInspect({ type: 'INFRASTRUCTURE', id: 'SHARD_OS', name: 'The Shard' })}>
      <cylinderGeometry args={[0, 2, 20, 4]} />
      <meshStandardMaterial color="#111" />
      <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0, 2, 20, 4)]} /><lineBasicMaterial color={COLORS.cyan} /></lineSegments>
    </mesh>
    {/* London Eye */}
    <mesh position={[-15, 5, 5]} rotation={[0, 0, Math.PI/2]} onClick={() => onInspect({ type: 'SCADA', id: 'EYE_CONTROL', name: 'London Eye' })}>
      <torusGeometry args={[5, 0.1, 16, 100]} />
      <meshBasicMaterial color={COLORS.pink} wireframe />
    </mesh>
  </group>
);

const NeomMap = ({ onInspect }: any) => (
  <group>
    {/* The Line - Mirror Wall */}
    <mesh position={[0, 10, 0]} onClick={() => onInspect({ type: 'EXPERIMENTAL', id: 'NEOM_AI_CORE', name: 'THE LINE' })}>
      <boxGeometry args={[200, 20, 1]} />
      <meshPhysicalMaterial color="silver" metalness={1} roughness={0} />
    </mesh>
  </group>
);

// --- DOSSIER PANEL ---
const DeepScanPanel = ({ target, onClose }: any) => {
  const devices = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({
    id: `UID-${Math.floor(Math.random()*100000)}`,
    vendor: ['Apple', 'Samsung', 'Intel', 'Cisco', 'Tesla'][Math.floor(Math.random()*5)],
    signal: `-${Math.floor(Math.random()*40 + 50)}dBm`,
    status: Math.random() > 0.3 ? 'CONNECTED' : 'ENCRYPTED'
  })), [target]);

  return (
    <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="absolute top-20 right-4 w-80 bg-black/95 border-l-4 border-neon-cyan p-4 font-mono z-[2000] shadow-2xl">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <div className="text-xs text-neon-cyan font-black tracking-widest">DEEP_SCAN // {target.id}</div>
        <button onClick={onClose} className="text-white/40 hover:text-white">X</button>
      </div>
      <div className="text-[10px] text-white/80 mb-4 bg-white/5 p-2 rounded">
        ENTITY: {target.name || target.type} <br/>
        COORD: {Math.random().toFixed(4)}, {Math.random().toFixed(4)}
      </div>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-hide">
        {devices.map((d, i) => (
          <div key={i} className="border border-white/5 p-2 hover:border-emerald-500/50 transition-all bg-zinc-900/50">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-emerald-400 font-bold">{d.vendor} DEVICE</span>
              <span className="text-[8px] text-white/40">{d.signal}</span>
            </div>
            <div className="text-[8px] text-white/60 mt-1">ID: {d.id} // {d.status}</div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 bg-emerald-500/10 border border-emerald-500 text-emerald-500 text-[9px] font-black hover:bg-emerald-500/20 transition-all">
        DOWNLOAD_PAYLOAD.ZIP
      </button>
    </motion.div>
  );
};

export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [view, setView] = useState<'ORBIT' | 'DUBAI' | 'NYC' | 'LDN' | 'NEOM'>('ORBIT');
  const [crackedSats, setCrackedSats] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSatHack = (id: string) => {
    if (crackedSats.includes(id)) {
      if (id === 'KH-11') setView('DUBAI');
      if (id === 'SENTINEL-6') setView('NYC');
      if (id === 'EYE-1') setView('LDN');
      if (id === 'NEOM-CORE') setView('NEOM');
      return;
    }

    updateWindow('terminal', { isOpen: true, title: `HACKING_UPLINK: ${id}` });
    openWindow('terminal');
    addLog(`INITIATING QUANTUM BREACH ON ${id}...`, 'warning');
    
    setTimeout(() => {
      setCrackedSats(prev => [...prev, id]);
      addLog(`[SUCCESS] SATELLITE ${id} COMPROMISED. DOWNLINK AVAILABLE.`, 'success');
    }, 3000);
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">CORE_UPLINK_WAIT...</div>;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 30, 50]} fov={view === 'ORBIT' ? 45 : 35} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={200} maxPolarAngle={Math.PI / 2.1} />
        <Stars radius={200} count={8000} factor={4} fade />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 50, 10]} intensity={2} color="white" />

        {view === 'ORBIT' ? (
          <group rotation={[0, 0, 0.4]}>
            <mesh><sphereGeometry args={[10, 64, 64]} /><meshStandardMaterial color="#051030" metalness={0.8} /></mesh>
            <SatelliteNode position={[12, 4, 8]} label="KH-11 [DUBAI]" id="KH-11" isCracked={crackedSats.includes('KH-11')} onHack={handleSatHack} />
            <SatelliteNode position={[-10, 6, 10]} label="SENTINEL-6 [NYC]" id="SENTINEL-6" isCracked={crackedSats.includes('SENTINEL-6')} onHack={handleSatHack} />
            <SatelliteNode position={[5, 12, -5]} label="EYE-1 [LONDON]" id="EYE-1" isCracked={crackedSats.includes('EYE-1')} onHack={handleSatHack} />
            <SatelliteNode position={[-5, -12, 5]} label="NEOM-CORE [NEOM]" id="NEOM-CORE" isCracked={crackedSats.includes('NEOM-CORE')} onHack={handleSatHack} />
          </group>
        ) : (
          <group>
            <gridHelper args={[400, 100, '#111', '#050505']} position={[0, -0.1, 0]} />
            {view === 'DUBAI' && <DubaiRealMap onInspect={setSelectedTarget} />}
            {view === 'LDN' && <LondonMap onInspect={setSelectedTarget} />}
            {view === 'NEOM' && <NeomMap onInspect={setSelectedTarget} />}
            
            <group>
              {[...Array(40)].map((_, i) => (
                <LidarAgent key={i} position={[(Math.random()-0.5)*100, 0, (Math.random()-0.5)*100]} onInspect={() => setSelectedTarget({ id: `TARGET-${9000+i}`, type: 'HUMANOID' })} />
              ))}
            </group>
          </group>
        )}
      </Canvas>

      {/* Interface Overlays */}
      <div className="absolute top-4 left-4 font-mono pointer-events-none">
        <div className="text-xs text-neon-cyan font-black tracking-[0.4em] mb-1">GHOST_SIGINT_V13</div>
        <div className="text-[9px] text-white/40">SECTOR: {view} // SAT_LOCK: {crackedSats.length}</div>
        {view !== 'ORBIT' && (
          <button onClick={() => setView('ORBIT')} className="mt-4 px-3 py-1 border border-neon-cyan text-neon-cyan text-[8px] pointer-events-auto hover:bg-neon-cyan/10 transition-all">
            RETURN_TO_ORBIT
          </button>
        )}
      </div>

      <AnimatePresence>
        {selectedTarget && <DeepScanPanel target={selectedTarget} onClose={() => setSelectedTarget(null)} />}
      </AnimatePresence>
    </div>
  );
};