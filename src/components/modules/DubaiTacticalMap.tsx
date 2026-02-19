'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  MapControls, 
  Stars, 
  PerspectiveCamera, 
  Html, 
  useTexture, 
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, Glitch, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, X, Unlock, Radio, Crosshair, 
  Wifi, Car, User, MapPin, Activity, Zap, CreditCard, Search
} from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  purple: '#6B0098',
  gold: '#FFD700',
  danger: '#FF3333',
  emerald: '#10b981',
  pink: '#FF53B2'
};

// --- TYPES ---
type EntityType = 'AGENT' | 'VEHICLE' | 'WIFI' | 'CCTV' | 'SKIMMER' | 'STRUCTURE' | 'VIP_TARGET';

interface EntityData {
  id: string;
  type: EntityType;
  pos: [number, number, number];
  details: {
    lat: string;
    lng: string;
    name?: string;
    heart?: string;
    imei?: string;
    os?: string;
    ssid?: string;
    mac?: string;
    security?: string;
    plate?: string;
    speed?: string;
    model?: string;
    intercepts?: string;
    bank?: string;
  };
}

// --- DATA GENERATORS ---
const generateEntity = (id: number, type: EntityType): EntityData => {
  const pos: [number, number, number] = [(Math.random() - 0.5) * 1800, 0, (Math.random() - 0.5) * 1800];
  const details: EntityData['details'] = { 
    lat: (25.2048 + pos[0] / 10000).toFixed(6),
    lng: (55.2708 + pos[2] / 10000).toFixed(6),
  };

  if (type === 'AGENT') {
    details.name = ['Agent Thorne', 'Sia Rossi', 'Volkov', 'Molly M.'][id % 4];
    details.heart = `${70 + (id % 20)} BPM`;
    details.imei = `3567${id}0098`;
    details.os = 'iOS 17.4';
  } else if (type === 'WIFI') {
    details.ssid = `DXB_VIP_NET_${id}`;
    details.mac = `00:E0:4C:${id.toString(16).toUpperCase()}`;
    details.security = 'WPA3-ENT';
  } else if (type === 'VEHICLE') {
    details.plate = `K-100${id}`;
    details.speed = `${80 + (id % 40)} KM/H`;
    details.model = 'Tesla S';
  } else if (type === 'SKIMMER') {
    details.intercepts = `${id % 10} Cards`;
    details.bank = 'EMIRATES_NBD';
  }

  return { id: `${type}_${id}`, type, pos, details };
};

// --- EARTH SYSTEM ---
const EarthSystem = ({ onSelectSat }: { onSelectSat: (city: string) => void }) => {
  const earthRef = useRef<THREE.Group>(null);
  const [colorMap, lightsMap, cloudsMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
  ]);

  useFrame(({ clock }) => {
    if (earthRef.current) earthRef.current.rotation.y = clock.getElapsedTime() * 0.02;
  });

  return (
    <group ref={earthRef}>
      <mesh>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial map={colorMap} emissiveMap={lightsMap} emissive={new THREE.Color(0xffff88)} emissiveIntensity={0.2} />
      </mesh>
      <mesh scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial map={cloudsMap} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
      </mesh>
      <OrbitalSatellite label="KH-11 [DUBAI]" orbitRadius={14} speed={0.2} offset={0} onHack={() => onSelectSat('DUBAI')} />
      <OrbitalSatellite label="SENTINEL [NYC]" orbitRadius={16} speed={0.15} offset={2} onHack={() => onSelectSat('NYC')} />
      <OrbitalSatellite label="FALCON [ABU DHABI]" orbitRadius={13} speed={0.25} offset={4} onHack={() => onSelectSat('ABU_DHABI')} />
      <OrbitalSatellite label="ODIN [LONDON]" orbitRadius={15} speed={0.18} offset={1} onHack={() => onSelectSat('LONDON')} />
      <OrbitalSatellite label="Q-STAR [NEOM]" orbitRadius={17} speed={0.12} offset={5} onHack={() => onSelectSat('NEOM')} />
    </group>
  );
};

const OrbitalSatellite = ({ label, orbitRadius, speed, offset, onHack }: { label: string, orbitRadius: number, speed: number, offset: number, onHack: () => void }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.x = Math.cos(t) * orbitRadius;
    ref.current.position.z = Math.sin(t) * orbitRadius;
    ref.current.position.y = Math.sin(t * 0.5) * (orbitRadius * 0.3);
    ref.current.lookAt(0, 0, 0);
  });

  return (
    <group ref={ref} onPointerDown={(e) => { e.stopPropagation(); onHack(); }}>
      <mesh><boxGeometry args={[0.5, 0.2, 0.3]} /><meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={0.5} /></mesh>
      <mesh position={[0.6, 0, 0]}><boxGeometry args={[0.8, 0.02, 0.4]} /><meshBasicMaterial color={COLORS.blue} wireframe /></mesh>
      <mesh position={[-0.6, 0, 0]}><boxGeometry args={[0.8, 0.02, 0.4]} /><meshBasicMaterial color={COLORS.blue} wireframe /></mesh>
      <Html distanceFactor={25}>
        <div className="text-[8px] text-white font-black bg-black/80 px-1 border border-white/20 whitespace-nowrap hover:border-neon-cyan hover:text-neon-cyan cursor-pointer transition-colors p-1 uppercase">
          {label}
        </div>
      </Html>
    </group>
  );
};

// --- CAMERA FLY-TO CONTROLLER ---
const CameraController = ({ targetPos }: { targetPos: [number, number, number] | null }) => {
  const { camera, controls } = useThree();
  useFrame(() => {
    if (targetPos) {
      const [tx, ty, tz] = targetPos;
      const targetVec = new THREE.Vector3(tx, ty + 50, tz + 80);
      camera.position.lerp(targetVec, 0.05);
      if (controls) {
        // @ts-expect-error - controls.target exists on MapControls
        controls.target.lerp(new THREE.Vector3(tx, ty, tz), 0.05);
      }
    }
  });
  return null;
};

// --- INTELLIGENCE SIDEBAR ---
const IntelligenceSidebar = ({ target, onClose }: { target: EntityData, onClose: () => void }) => {
  const [breaching, setBreaching] = useState(true);
  const { addLog } = useTerminal();

  useEffect(() => {
    const timer = setTimeout(() => {
      setBreaching(false);
      addLog(`[SUCCESS] TARGET COMPROMISED: ${target.id}`, 'success');
    }, 1500);
    return () => clearTimeout(timer);
  }, [target.id, addLog]);

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-black/95 border-l-2 border-neon-cyan p-6 font-mono z-[3000] shadow-2xl overflow-y-auto backdrop-blur-xl">
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          {breaching ? <ShieldAlert className="text-red-500 animate-pulse" size={24} /> : <Unlock className="text-emerald-400" size={24} />}
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.3em]">{target.type}</div>
            <div className="text-lg text-neon-cyan font-black uppercase italic tracking-widest">{target.id}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-white hover:text-red-500 transition-colors p-2"><X size={28} /></button>
      </div>

      {breaching ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-neon-cyan/20 rounded-full" /><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-t-neon-cyan rounded-full shadow-[0_0_20px_rgba(0,240,255,0.5)]" />
            <div className="absolute inset-0 flex items-center justify-center text-neon-cyan font-black text-xs">BREACHING...</div>
          </div>
          <div className="text-neon-cyan text-sm animate-pulse uppercase tracking-[0.2em]">Injecting Neural Exploit</div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-700">
          <div className="bg-zinc-900/80 p-4 border border-white/10 space-y-3">
            <div className="text-[10px] text-neon-cyan font-black uppercase flex items-center gap-2"><MapPin size={14} /> GPS_LOCATOR</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-2 border border-white/5"><div className="text-[8px] text-white/40">LATITUDE</div><div className="text-sm text-white font-black">{target.details.lat}</div></div>
              <div className="bg-black/40 p-2 border border-white/5"><div className="text-[8px] text-white/40">LONGITUDE</div><div className="text-sm text-white font-black">{target.details.lng}</div></div>
            </div>
          </div>

          {target.type === 'AGENT' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4">
                <div className="text-[10px] text-emerald-400 font-black uppercase">Vitals_Monitor</div>
                <div className="text-3xl text-white font-black mt-1 flex items-center gap-3">{target.details.heart} <Activity size={24} className="text-emerald-500 animate-pulse" /></div>
                <div className="text-[10px] text-white/40 uppercase mt-1">Suspect: {target.details.name}</div>
              </div>
              <div className="bg-zinc-900/80 p-4 border border-white/10">
                <div className="text-[10px] text-neon-cyan font-black uppercase mb-3">Intercepted Hardware</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black text-white"><span>{target.details.os} Device</span><span className="text-emerald-400">ACTIVE</span></div>
                  <div className="text-[9px] text-white/40 font-mono tracking-tighter italic">IMEI: {target.details.imei}</div>
                </div>
              </div>
            </div>
          )}

          {target.type === 'VEHICLE' && (
            <div className="space-y-4">
              <div className="bg-gold/10 border-l-4 border-gold p-4">
                <div className="text-[10px] text-gold font-black uppercase">Telematic_Data</div>
                <div className="text-4xl text-white font-black mt-1">{target.details.speed}</div>
                <div className="text-[10px] text-white/40 uppercase mt-1">{target.details.model} {" // "} PLATE: {target.details.plate}</div>
              </div>
              <div className="bg-zinc-900/80 p-4 border border-white/10 text-[10px] space-y-2">
                <div className="text-neon-cyan font-black uppercase">In-Car Intercept</div>
                <div className="text-white/60">Bluetooth: Active {" // "} Route: {parseFloat(target.details.lat) > 25.2 ? 'Downtown' : 'Marina'}</div>
              </div>
            </div>
          )}

          {target.type === 'WIFI' && (
            <div className="space-y-4">
              <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-4">
                <div className="text-[10px] text-cyan-400 font-black uppercase">Signal_Intercept</div>
                <div className="text-2xl text-white font-black mt-1">{target.details.ssid}</div>
                <div className="text-[10px] text-white/40 uppercase mt-1">Security: {target.details.security} {" // "} BSSID: {target.details.mac}</div>
              </div>
              <div className="bg-zinc-900/80 p-4 border border-white/10">
                <div className="text-[10px] text-neon-cyan font-black uppercase mb-2">Connected Clients</div>
                <div className="space-y-1 text-[9px] text-white/60">
                  <div>- Smartphone (Apple)</div>
                  <div>- Laptop (Dell)</div>
                  <div>- Smart Watch (Garmin)</div>
                </div>
              </div>
            </div>
          )}

          {target.type === 'SKIMMER' && (
            <div className="space-y-4">
              <div className="bg-pink-500/10 border-l-4 border-pink-500 p-4">
                <div className="text-[10px] text-pink-400 font-black uppercase">Financial_Siphon</div>
                <div className="text-3xl text-white font-black mt-1">{target.details.intercepts}</div>
                <div className="text-[10px] text-white/40 uppercase mt-1">Target Bank: {target.details.bank}</div>
              </div>
              <div className="bg-zinc-900/80 p-4 border border-white/10 text-[10px] space-y-2 text-white/60 italic font-mono">
                [WAITING_FOR_UPLOAD] ... Buffer: 84% full
              </div>
            </div>
          )}

          {(target.type === 'STRUCTURE' || target.type === 'VIP_TARGET') && (
            <div className="space-y-4">
              <div className={`p-4 border-l-4 ${target.type === 'VIP_TARGET' ? 'bg-gold/10 border-gold' : 'bg-blue-500/10 border-blue-500'}`}>
                <div className={`text-[10px] font-black uppercase ${target.type === 'VIP_TARGET' ? 'text-gold' : 'text-blue-400'}`}>
                  {target.type === 'VIP_TARGET' ? 'PRIORITY_OBJECTIVE' : 'ARCHITECTURAL_NODE'}
                </div>
                <div className="text-xl text-white font-black mt-1 uppercase tracking-widest">{target.id.replace(/_/g, ' ')}</div>
                <div className="text-[10px] text-white/40 uppercase mt-1">Status: Compromised {" // "} Uplink: 10Gbps</div>
              </div>
              <div className="bg-zinc-900/80 p-4 border border-white/10 space-y-2">
                <div className="text-[10px] text-neon-cyan font-black uppercase flex items-center gap-2"><Zap size={12} /> Live_Telemetry</div>
                <div className="space-y-1 text-[9px] text-white/60">
                  <div className="flex justify-between"><span>Power Consumption</span><span>2.4 MW</span></div>
                  <div className="flex justify-between"><span>Occupancy Est.</span><span>{target.id === 'BURJ_KHALIFA' ? '12,400' : '840'}</span></div>
                  <div className="flex justify-between"><span>HVAC System</span><span>{target.type === 'VIP_TARGET' ? 'CRITICAL' : 'OPTIMAL'}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// --- ENTITY NODES ---
const EntityNode = ({ data, onSelect }: { data: EntityData, onSelect: (e: EntityData) => void }) => {
  const ref = useRef<THREE.Group>(null);
  const initialPos = useMemo(() => data.pos, [data.pos]);
  useFrame(({ clock }) => {
    if (ref.current && (data.type === 'AGENT' || data.type === 'VEHICLE')) {
      const t = clock.getElapsedTime();
      const idNum = parseInt(data.id.split('_')[1]) || 0;
      const speed = data.type === 'VEHICLE' ? 0.5 : 0.2;
      const range = data.type === 'VEHICLE' ? 100 : 30;
      ref.current.position.x = initialPos[0] + Math.sin(t * speed + idNum) * range;
      ref.current.position.z = initialPos[2] + Math.cos(t * speed + idNum) * range;
      ref.current.lookAt(initialPos[0] + Math.sin((t + 0.1) * speed + idNum) * range, initialPos[1], initialPos[2] + Math.cos((t + 0.1) * speed + idNum) * range);
    }
  });

  const getColor = () => {
    switch (data.type) {
      case 'WIFI': return COLORS.cyan;
      case 'VEHICLE': return COLORS.gold;
      case 'AGENT': return COLORS.emerald;
      case 'SKIMMER': return COLORS.pink;
      default: return COLORS.blue;
    }
  };

  const renderIcon = () => {
    switch (data.type) {
      case 'WIFI': return <Wifi size={14} />;
      case 'VEHICLE': return <Car size={14} />;
      case 'AGENT': return <User size={14} />;
      case 'SKIMMER': return <CreditCard size={14} />;
      default: return <Radio size={14} />;
    }
  };

  return (
    <group ref={ref} position={data.pos} onClick={(e) => { e.stopPropagation(); onSelect(data); }}>
      <mesh position={[0, 1, 0]}><boxGeometry args={[1.5, 3, 1.5]} /><meshStandardMaterial color={getColor()} wireframe emissive={getColor()} emissiveIntensity={0.8} /></mesh>
      <mesh position={[0, 20, 0]}><cylinderGeometry args={[0.02, 0.02, 40, 8]} /><meshBasicMaterial color={getColor()} transparent opacity={0.3} /></mesh>
      <Html distanceFactor={60} position={[0, 5, 0]} center>
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="p-1.5 bg-black/90 border border-white/20 rounded-full group-hover:border-neon-cyan shadow-xl" style={{ color: getColor() }}>{renderIcon()}</div>
          <div className="text-[7px] text-white font-black bg-black/95 px-2 border border-white/10 whitespace-nowrap uppercase tracking-widest">
            {data.type === 'AGENT' ? data.details.heart : data.type === 'VEHICLE' ? data.details.speed : data.type === 'WIFI' ? data.details.ssid : data.id}
          </div>
        </div>
      </Html>
    </group>
  );
};

// --- LANDMARKS ---
const BurjKhalifa = ({ onSelect }: { onSelect: (e: EntityData) => void }) => (
  <group position={[0, 0, 0]} onClick={() => onSelect({ id: 'BURJ_KHALIFA', type: 'STRUCTURE', pos: [0, 0, 0], details: { lat: '25.1972', lng: '55.2744' } })}>
    <mesh position={[0, 40, 0]}><cylinderGeometry args={[2, 6, 80, 4]} /><meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={0.5} /></mesh>
    <mesh position={[0, 100, 0]}><cylinderGeometry args={[0.5, 2, 40, 4]} /><meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={0.8} /></mesh>
    <group position={[0, 110, 0]} onClick={(e) => { e.stopPropagation(); onSelect({ id: 'ABHED_ZONE_154', type: 'VIP_TARGET', pos: [0, 110, 0], details: { lat: '25.1972', lng: '55.2744' } }); }}>
      <mesh><cylinderGeometry args={[3, 3, 2, 16]} /><meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={3} /></mesh>
      <Html position={[10, 0, 0]} center><div className="text-[10px] text-gold font-black bg-black/95 px-2 border-2 border-gold whitespace-nowrap shadow-[0_0_20px_rgba(255,215,0,0.8)] animate-pulse cursor-pointer">154TH_FLOOR // ABHED_ZONE</div></Html>
    </group>
    <mesh position={[0, 145, 0]}><sphereGeometry args={[1, 16, 16]} /><meshBasicMaterial color={COLORS.danger} /><pointLight intensity={10} distance={30} color={COLORS.danger} /></mesh>
  </group>
);

const BurjAlArab = ({ onSelect }: { onSelect: (e: EntityData) => void }) => (
  <group position={[-250, 0, 300]} onClick={() => onSelect({ id: 'BURJ_AL_ARAB', type: 'STRUCTURE', pos: [-250, 0, 300], details: { lat: '25.1412', lng: '55.1852' } })}>
    <mesh position={[0, 40, 0]}><boxGeometry args={[4, 80, 15]} /><meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={0.4} /></mesh>
    <mesh position={[15, 40, 0]} rotation={[0, 0, -0.2]}><planeGeometry args={[40, 70]} /><meshStandardMaterial color={COLORS.cyan} wireframe side={THREE.DoubleSide} transparent opacity={0.3} /></mesh>
    <mesh position={[-5, 60, 0]}><cylinderGeometry args={[8, 8, 1, 16]} /><meshStandardMaterial color={COLORS.cyan} wireframe /></mesh>
    <Html position={[0, 85, 0]} center><div className="text-[10px] text-neon-cyan font-black bg-black/90 px-2 border border-neon-cyan whitespace-nowrap uppercase">BURJ_AL_ARAB // SECTOR_JUMEIRAH</div></Html>
  </group>
);

const BankOfEmirates = ({ onSelect }: { onSelect: (e: EntityData) => void }) => (
  <group position={[200, 0, -150]} onClick={() => onSelect({ id: 'BANK_OF_EMIRATES', type: 'STRUCTURE', pos: [200, 0, -150], details: { lat: '25.2532', lng: '55.3344' } })}>
    <mesh position={[-10, 30, 0]}><boxGeometry args={[15, 60, 15]} /><meshStandardMaterial color={COLORS.gold} wireframe emissive={COLORS.gold} emissiveIntensity={0.3} /></mesh>
    <mesh position={[10, 30, 0]}><boxGeometry args={[15, 60, 15]} /><meshStandardMaterial color={COLORS.gold} wireframe emissive={COLORS.gold} emissiveIntensity={0.3} /></mesh>
    <mesh position={[0, 50, 0]}><boxGeometry args={[35, 10, 15]} /><meshStandardMaterial color={COLORS.gold} wireframe /></mesh>
    <Html position={[0, 70, 0]} center><div className="text-[10px] text-gold font-black bg-black/95 px-2 border border-gold whitespace-nowrap uppercase tracking-tighter">BANK_OF_EMIRATES // HQ_NODE</div></Html>
  </group>
);

// --- RECON ENGINE ---
export const DubaiTacticalMap = () => {
  const { focusWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [view, setView] = useState('ORBIT');
  const [selectedTarget, setSelectedTarget] = useState<EntityData | null>(null);
  const [mounted, setMounted] = useState(false);

  const entities = useMemo(() => {
    const arr: EntityData[] = [];
    for (let i = 0; i < 40; i++) arr.push(generateEntity(i, 'AGENT'));
    for (let i = 0; i < 30; i++) arr.push(generateEntity(i, 'VEHICLE'));
    for (let i = 0; i < 25; i++) arr.push(generateEntity(i, 'WIFI'));
    for (let i = 0; i < 15; i++) arr.push(generateEntity(i, 'SKIMMER'));
    return arr;
  }, []);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[0.5em] animate-pulse">BOOTING_GOD_EYE...</div>;

  const handleSelect = (entity: EntityData) => {
    setSelectedTarget(entity);
    updateWindow('terminal', { isOpen: true });
    focusWindow('terminal');
    addLog(`[TARGET_LOCKED] ENGAGING ${entity.id}`, 'warning');
  };

  return (
    <div className="w-full h-full bg-black relative cursor-crosshair overflow-hidden pointer-events-auto select-none touch-none">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 0, 35] : [0, 400, 600]} fov={view === 'ORBIT' ? 45 : 25} />
          <MapControls enableDamping dampingFactor={0.05} minDistance={10} maxDistance={2800} screenSpacePanning={true} />
          <Stars radius={900} count={50000} factor={8} fade speed={2} />
          <ambientLight intensity={0.5} />
          <pointLight position={[400, 800, 400]} intensity={5} color={COLORS.cyan} />
          <CameraController targetPos={selectedTarget ? selectedTarget.pos : null} />
          {view === 'ORBIT' ? (
            <EarthSystem onSelectSat={(city: string) => {
              updateWindow('terminal', { isOpen: true });
              focusWindow('terminal');
              addLog(`[ORBIT] TARGET SECTOR: ${city}`, 'info');
              setView(city);
            }} />
          ) : (
            <group>
              <gridHelper args={[6000, 120, COLORS.cyan, '#020202']} position={[0, -0.4, 0]} />
              <gridHelper args={[6000, 30, COLORS.blue, '#010101']} position={[0, -0.45, 0]} />
              <BurjKhalifa onSelect={handleSelect} />
              <BurjAlArab onSelect={handleSelect} />
              <BankOfEmirates onSelect={handleSelect} />
              {entities.map((e) => <EntityNode key={e.id} data={e} onSelect={handleSelect} />)}
            </group>
          )}
          <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={0.1} intensity={3.0} mipmapBlur radius={0.7} />
            <Scanline opacity={0.4} />
            <Noise opacity={0.2} />
            <Vignette darkness={1.5} />
            <Glitch delay={new THREE.Vector2(4, 8)} duration={new THREE.Vector2(0.1, 0.2)} strength={new THREE.Vector2(0.1, 0.1)} mode={THREE.NormalBlending} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <div className="absolute top-4 left-4 font-mono pointer-events-none p-4 bg-black/70 backdrop-blur-md border-l-4 border-neon-cyan shadow-2xl">
        <div className="flex items-center gap-4 mb-2"><Activity size={32} className="text-neon-cyan animate-pulse" /><div><div className="text-2xl text-neon-cyan font-black tracking-tighter italic uppercase leading-none">Sovereign Link</div><div className="text-[8px] text-white/40 uppercase tracking-[0.6em]">Tactical Surveillance Engine</div></div></div>
        <div className="flex items-center gap-6 mt-4"><div className="text-[10px] text-emerald-400 font-black">● SECTOR: {view}</div><div className="text-[10px] text-white/40 font-black">NODES: {entities.length + 3}</div><div className="text-[10px] text-white/40 font-black uppercase flex items-center gap-1"><Zap size={10} className="text-gold" /> GRID_LIVE</div></div>
        {view !== 'ORBIT' && <button onClick={() => { setView('ORBIT'); setSelectedTarget(null); }} className="mt-6 px-8 py-2.5 border-2 border-red-500 text-red-500 text-[10px] font-black pointer-events-auto hover:bg-red-500/20 transition-all uppercase tracking-widest active:scale-95 flex items-center gap-2"><Radio size={14} /> RESET_GLOBAL_UPLINK</button>}
      </div>
      <div className="absolute top-32 left-4 w-60 bottom-32 hidden xl:flex flex-col gap-3 pointer-events-none">
        <div className="text-[10px] text-neon-cyan font-black uppercase tracking-[0.4em] border-b border-neon-cyan/30 pb-2 flex items-center gap-2"><Search size={14} /> SIGINT_FEED</div>
        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-4">
          {entities.slice(0, 30).map((e, i) => (
            <div key={i} className="bg-black/60 backdrop-blur-sm border-l-2 border-white/10 p-2 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex justify-between">
                <div className="text-[9px] text-white/80 font-black">{e.id}</div>
                <div className="text-[7px] text-emerald-400/60 font-mono">TRACKING</div>
              </div>
              <div className="text-[7px] text-white/40 font-mono mt-1 uppercase italic">
                {e.type === 'WIFI' ? e.details.ssid : e.type === 'AGENT' ? e.details.name : e.type === 'VEHICLE' ? e.details.plate : e.id}
              </div>
              <div className="text-[7px] text-neon-cyan/60 font-mono mt-0.5 uppercase italic">Lat: {e.details.lat} Lng: {e.details.lng}</div>
            </div>
          ))}
        </div>
      </div>
      <AnimatePresence>{selectedTarget && <IntelligenceSidebar target={selectedTarget} onClose={() => setSelectedTarget(null)} />}</AnimatePresence>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30"><Crosshair size={100} className="text-neon-cyan animate-spin-slow" /></div>
    </div>
  );
};
