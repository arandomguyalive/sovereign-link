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
    <group position={position} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh onClick={(e) => { e.stopPropagation(); onHack(id); }}>
          <boxGeometry args={[0.8, 0.4, 0.5]} />
          <meshBasicMaterial color={isCracked ? '#00ff00' : (hovered ? COLORS.gold : COLORS.satellite)} />
        </mesh>
        {/* Solar Panels */}
        <mesh position={[0.8, 0, 0]}>
          <boxGeometry args={[1.2, 0.05, 0.4]} />
          <meshBasicMaterial color={COLORS.cyan} wireframe />
        </mesh>
        <mesh position={[-0.8, 0, 0]}>
          <boxGeometry args={[1.2, 0.05, 0.4]} />
          <meshBasicMaterial color={COLORS.cyan} wireframe />
        </mesh>
      </Float>
      <Html distanceFactor={20}>
        <div className="bg-black/95 border border-white/20 p-2 font-mono text-[9px] whitespace-nowrap pointer-events-none select-none">
          <div className="flex items-center gap-2">
            <Satellite size={14} className={isCracked ? "text-emerald-400" : "text-white"} />
            <span className={isCracked ? "text-emerald-400 font-black" : "text-white"}>{label}</span>
          </div>
          <div className="mt-1 text-white/40 uppercase tracking-widest text-[7px]">
            STATUS: {isCracked ? 'UPLINK_STABLE' : 'ENCRYPTED'}
          </div>
          {!isCracked && hovered && <div className="text-neon-cyan mt-1 animate-pulse font-black">[ CLICK TO BREACH ]</div>}
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
    <group ref={group} position={position}>
      <mesh position={[0, 0.9, 0]} onClick={(e) => { e.stopPropagation(); onInspect(); }}>
        <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.5, 0]} onClick={(e) => { e.stopPropagation(); onInspect(); }}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1, 0]} onClick={(e) => { e.stopPropagation(); onInspect(); }}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.15} />
      </mesh>
    </group>
  );
};

// --- CITY LANDMARKS ---

const DubaiRealMap = ({ onInspect }: any) => (
  <group>
    <group position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onInspect({ type: 'INFRASTRUCTURE', id: 'BURJ_KHALIFA_CORE', name: 'Burj Khalifa' }); }}>
      <mesh position={[0, 15, 0]}>
        <cylinderGeometry args={[0.1, 2, 30, 6]} />
        <meshStandardMaterial color="#050505" />
        <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0.1, 2, 30, 6)]} /><lineBasicMaterial color={COLORS.cyan} opacity={0.5} transparent /></lineSegments>
      </mesh>
      <Html position={[0, 32, 0]} distanceFactor={50}><div className="text-[8px] text-neon-cyan border border-neon-cyan px-1 bg-black/80 font-black">CORE_LINK // 828m</div></Html>
    </group>

    <group position={[-15, 0, 10]} onClick={(e) => { e.stopPropagation(); onInspect({ type: 'INFRASTRUCTURE', id: 'AL_ARAB_HUB', name: 'Burj Al Arab' }); }}>
      <mesh position={[0, 5, 0]} rotation={[0, Math.PI/4, 0]}>
        <cylinderGeometry args={[0, 2.5, 10, 3]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.8} />
        <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0, 2.5, 10, 3)]} /><lineBasicMaterial color={COLORS.cyan} /></lineSegments>
      </mesh>
    </group>

    <group position={[10, 0, -15]} onClick={(e) => { e.stopPropagation(); onInspect({ type: 'FINANCIAL', id: 'NBD_CENTRAL_VAULT', name: 'Bank of Emirates NBD' }); }}>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[4, 6, 2]} />
        <meshStandardMaterial color="#0a0a0a" />
        <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(4, 6, 2)]} /><lineBasicMaterial color={COLORS.gold} /></lineSegments>
      </mesh>
      <Html position={[0, 7, 0]} distanceFactor={40}><div className="text-[8px] text-yellow-500 border border-yellow-500 px-1 bg-black/80 font-black">VAULT_ENCRYPTED</div></Html>
    </group>

    <group position={[-30, 0, 30]} rotation={[-Math.PI/2, 0, -0.5]}>
      <mesh><ringGeometry args={[1, 10, 16]} /><meshBasicMaterial color={COLORS.purple} wireframe opacity={0.2} transparent /></mesh>
    </group>
  </group>
);

const LondonMap = ({ onInspect }: any) => (
  <group>
    <mesh position={[0, 10, 0]} onClick={(e) => { e.stopPropagation(); onInspect({ type: 'INFRASTRUCTURE', id: 'SHARD_OS', name: 'The Shard' }); }}>
      <cylinderGeometry args={[0, 2, 20, 4]} />
      <meshStandardMaterial color="#111" />
      <lineSegments><edgesGeometry args={[new THREE.CylinderGeometry(0, 2, 20, 4)]} /><lineBasicMaterial color={COLORS.cyan} /></lineSegments>
    </mesh>
    <mesh position={[-15, 5, 5]} rotation={[0, 0, Math.PI/2]} onClick={(e) => { e.stopPropagation(); onInspect({ type: 'SCADA', id: 'EYE_CONTROL', name: 'London Eye' }); }}>
      <torusGeometry args={[5, 0.1, 16, 100]} />
      <meshBasicMaterial color={COLORS.pink} wireframe />
    </mesh>
  </group>
);

const NeomMap = ({ onInspect }: any) => (
  <group>
    <mesh position={[0, 10, 0]} onClick={(e) => { e.stopPropagation(); onInspect({ type: 'EXPERIMENTAL', id: 'NEOM_AI_CORE', name: 'THE LINE' }); }}>
      <boxGeometry args={[200, 20, 1]} />
      <meshPhysicalMaterial color="silver" metalness={1} roughness={0} />
    </mesh>
  </group>
);

// --- DOSSIER PANEL ---
const DeepScanPanel = ({ target, onClose }: any) => {
  const devices = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: `UID-${Math.floor(Math.random()*100000)}`,
    vendor: ['Apple', 'Samsung', 'Intel', 'Cisco', 'Tesla', 'SpaceX'][Math.floor(Math.random()*6)],
    signal: `-${Math.floor(Math.random()*40 + 50)}dBm`,
    status: Math.random() > 0.3 ? 'CONNECTED' : 'ENCRYPTED',
    imei: Math.floor(Math.random() * 1000000000000000)
  })), [target]);

  return (
    <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="absolute top-20 right-4 w-80 bg-black/95 border-l-4 border-neon-cyan p-4 font-mono z-[2000] shadow-2xl pointer-events-auto">
      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
        <div className="text-[10px] text-neon-cyan font-black tracking-widest uppercase">Deep_Scan // {target.id}</div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">X</button>
      </div>
      <div className="text-[9px] text-white/80 mb-4 bg-white/5 p-2 border border-white/10 rounded">
        ENTITY: {target.name || target.type} <br/>
        SECTOR: GLOBAL_RECON <br/>
        STATUS: TARGET_LOCKED
      </div>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto scrollbar-hide">
        {devices.map((d, i) => (
          <div key={i} className="border border-white/5 p-2 hover:border-emerald-500/50 transition-all bg-zinc-900/50">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-emerald-400 font-black">{d.vendor} DEVICE</span>
              <span className="text-[8px] text-white/40">{d.signal}</span>
            </div>
            <div className="text-[8px] text-white/60 mt-1 uppercase">ID: {d.id} // {d.status}</div>
            <div className="text-[7px] text-white/20 mt-1">IMEI: {d.imei}</div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 py-2 bg-emerald-500/10 border border-emerald-500 text-emerald-500 text-[9px] font-black hover:bg-emerald-500/20 transition-all uppercase tracking-widest">
        Exfiltrate_Data_Package.ZIP
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

    updateWindow('terminal', { isOpen: true });
    openWindow('terminal');
    addLog(`INITIATING QUANTUM BREACH ON ${id}...`, 'warning');
    addLog(`[+] BYPASSING AES-4096 ENCRYPTION...`, 'info');
    
    setTimeout(() => {
      setCrackedSats(prev => [...prev, id]);
      addLog(`[SUCCESS] SATELLITE ${id} COMPROMISED. DOWNLINK ACTIVE.`, 'success');
    }, 2500);
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono">UPLINK_INITIALIZING...</div>;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows onCreated={({ gl }) => {
        gl.domElement.style.pointerEvents = 'auto';
      }}>
        <PerspectiveCamera makeDefault position={[0, 30, 50]} fov={view === 'ORBIT' ? 45 : 35} />
        <MapControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={2} 
          maxDistance={250} 
          maxPolarAngle={Math.PI / 2.1} 
        />
        <Stars radius={200} count={10000} factor={4} fade />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 50, 10]} intensity={2} color="white" />

        {view === 'ORBIT' ? (
          <group rotation={[0, 0, 0.4]}>
            <mesh><sphereGeometry args={[10, 64, 64]} /><meshStandardMaterial color="#051030" metalness={0.9} roughness={0.1} /></mesh>
            <SatelliteNode position={[13, 2, 10]} label="KH-11 [DUBAI]" id="KH-11" isCracked={crackedSats.includes('KH-11')} onHack={handleSatHack} />
            <SatelliteNode position={[-12, 5, 8]} label="SENTINEL-6 [NYC]" id="SENTINEL-6" isCracked={crackedSats.includes('SENTINEL-6')} onHack={handleSatHack} />
            <SatelliteNode position={[4, 14, -6]} label="EYE-1 [LONDON]" id="EYE-1" isCracked={crackedSats.includes('EYE-1')} onHack={handleSatHack} />
            <SatelliteNode position={[-6, -14, 4]} label="NEOM-CORE [NEOM]" id="NEOM-CORE" isCracked={crackedSats.includes('NEOM-CORE')} onHack={handleSatHack} />
          </group>
        ) : (
          <group>
            <gridHelper args={[500, 100, '#1a1a1a', '#050505']} position={[0, -0.1, 0]} />
            {view === 'DUBAI' && <DubaiRealMap onInspect={setSelectedTarget} />}
            {view === 'LDN' && <LondonMap onInspect={setSelectedTarget} />}
            {view === 'NEOM' && <NeomMap onInspect={setSelectedTarget} />}
            {view === 'NYC' && <LondonMap onInspect={setSelectedTarget} />} {/* Placeholder for NYC reuse */}
            
            <group>
              {[...Array(50)].map((_, i) => (
                <LidarAgent 
                  key={i} 
                  position={[(Math.random()-0.5)*120, 0, (Math.random()-0.5)*120]} 
                  onInspect={() => setSelectedTarget({ id: `NODE-${8000+i}`, type: 'MOBILE_ENDPOINT', name: 'Patrol_Agent' })} 
                />
              ))}
            </group>
          </group>
        )}
      </Canvas>

      {/* Interface HUD */}
      <div className="absolute top-4 left-4 font-mono pointer-events-none select-none">
        <div className="text-[11px] text-neon-cyan font-black tracking-[0.5em] mb-1 uppercase">GHOST_SIGINT_V13.2</div>
        <div className="text-[9px] text-white/40 uppercase tracking-widest">Downlink: {view} // Locked: {crackedSats.length}</div>
        {view !== 'ORBIT' && (
          <button 
            onClick={() => setView('ORBIT')} 
            className="mt-4 px-4 py-1.5 border border-neon-cyan text-neon-cyan text-[9px] pointer-events-auto hover:bg-neon-cyan/20 transition-all font-black uppercase tracking-widest"
          >
            Terminal_Downlink
          </button>
        )}
      </div>

      <AnimatePresence>
        {selectedTarget && <DeepScanPanel target={selectedTarget} onClose={() => setSelectedTarget(null)} />}
      </AnimatePresence>
    </div>
  );
};
