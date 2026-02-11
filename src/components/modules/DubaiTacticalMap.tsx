'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  MapControls, 
  Stars, 
  PerspectiveCamera, 
  Html, 
  useTexture, 
  Float,
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, Glitch, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Smartphone, ShieldAlert, Cpu, Crosshair, X, Unlock, Lock, Activity, Zap, Radio } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  purple: '#6B0098',
  gold: '#FFD700',
  danger: '#FF3333',
  space: '#000000',
  atmosphere: '#00aaff'
};

// --- DATA GENERATORS ---
const generateAgentData = (id: any) => ({
  id: `ENTITY_${id}`,
  name: ['Marcus Vane', 'Elena Rossi', 'Kaelen Thorne', 'Sia Tanaka', 'Viktor Volkov'][id % 5],
  risk: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][id % 4],
  biometrics: {
    heartRate: `${72 + (id % 15)} BPM`,
    temp: '36.6°C',
    gait: '99.2% Match'
  },
  devices: [
    { model: 'iPhone 15 Pro', imei: `3567${id}882`, os: 'iOS 17.4', ip: `10.0.8.${id % 255}` },
    { model: 'Neural-Link v2', imei: `8821${id}001`, os: 'SovereignOS', ip: `10.0.8.${(id + 1) % 255}` }
  ],
  intercepts: [
    'Packet burst detected: WhatsApp Encrypted',
    'Location ping: Sector 09 (Palm)',
    'Low-frequency audio intercepted',
    'External proxy rotation detected'
  ]
});

const generateVehicleData = (id: any) => ({
  id: `VEHICLE_${id}`,
  type: ['Tesla Model S Plaid', 'Land Rover Defender', 'Mercedes-Maybach', 'Audi e-tron'][id % 4],
  plate: `DXB ${id}`,
  speed: `${85 + (id % 40)} KM/H`,
  owner: 'AL-FUTTAIM LOGISTICS',
  destination: 'DOWNTOWN_HUB'
});

// --- EARTH SYSTEM ---
const EarthSystem = ({ onSelectSat }: any) => {
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
      <OrbitalSatellite id="KH-11" label="KH-11 [DUBAI]" orbitRadius={14} speed={0.2} offset={0} onHack={() => onSelectSat('DUBAI')} />
      <OrbitalSatellite id="SENTINEL" label="SENTINEL [NYC]" orbitRadius={16} speed={0.15} offset={2} onHack={() => onSelectSat('NYC')} />
    </group>
  );
};

const OrbitalSatellite = ({ label, orbitRadius, speed, offset, onHack }: any) => {
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
        <div className="text-[8px] text-white font-black bg-black/80 px-1 border border-white/20 whitespace-nowrap hover:border-neon-cyan hover:text-neon-cyan cursor-pointer transition-colors p-1">
          {label}
        </div>
      </Html>
    </group>
  );
};

// --- INTELLIGENCE SIDEBAR ---
const IntelligenceSidebar = ({ target, isBreached, onClose }: any) => {
  if (!target) return null;
  const data = useMemo(() => {
    if (target.type === 'CIVILIAN_AGENT') return generateAgentData(target.id);
    if (target.type === 'VEHICLE') return generateVehicleData(target.id.toString().replace('VEHICLE_', ''));
    return null;
  }, [target.id, target.type]);

  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
      className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-black/95 border-l-2 border-neon-cyan p-6 font-mono z-[3000] shadow-2xl overflow-y-auto backdrop-blur-xl"
    >
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          {isBreached ? <Unlock className="text-emerald-400" size={20} /> : <Lock className="text-red-500" size={20} />}
          <div className="text-lg text-neon-cyan font-black tracking-widest uppercase italic">{target.id}</div>
        </div>
        <button onClick={onClose} className="text-white hover:text-red-500 p-2"><X size={24} /></button>
      </div>

      {!isBreached ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldAlert size={64} className="text-red-500 mb-4 animate-pulse" />
          <div className="text-red-500 font-black text-lg mb-2">ACCESS_DENIED</div>
          <div className="text-white/40 text-[10px] uppercase">Encryption Layer: RSA-4096. Breach required.</div>
        </div>
      ) : (
        <div className="space-y-6">
          {target.type === 'CIVILIAN_AGENT' && data && (
            <>
              <div className="bg-emerald-500/10 border-l-2 border-emerald-500 p-4">
                <div className="text-[10px] text-emerald-400 font-black uppercase">Biometric Stream</div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-[9px] text-white/60">HEART: <span className="text-white">{data.biometrics.heartRate}</span></div>
                  <div className="text-[9px] text-white/60">GAIT: <span className="text-white">{data.biometrics.gait}</span></div>
                  <div className="text-[9px] text-white/60">TEMP: <span className="text-white">{data.biometrics.temp}</span></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] text-neon-cyan font-black uppercase tracking-widest border-b border-white/10 pb-1">Identified Devices</div>
                {data.devices.map((d: any, i: number) => (
                  <div key={i} className="bg-zinc-900/80 p-3 border border-white/5">
                    <div className="flex justify-between text-[11px] font-black"><span>{d.model}</span><span className="text-emerald-400">{d.os}</span></div>
                    <div className="text-[8px] text-white/40 mt-1">IMEI: {d.imei} | IP: {d.ip}</div>
                  </div>
                ))}
              </div>
              <div className="bg-black border border-emerald-500/30 p-3 text-[9px] text-emerald-500/80 space-y-1">
                <div className="text-white/40 mb-2 uppercase">[Live Intercepts]</div>
                {data.intercepts.map((log: string, i: number) => <div key={i} className="flex gap-2"><span>&gt;</span><span>{log}</span></div>)}
              </div>
            </>
          )}
          {target.type === 'VEHICLE' && data && (
            <div className="space-y-4">
              <div className="bg-neon-cyan/10 border-l-2 border-neon-cyan p-4">
                <div className="text-[10px] text-neon-cyan font-black uppercase">Telematics</div>
                <div className="text-2xl text-white font-black mt-2">{data.speed}</div>
                <div className="text-[10px] text-white/40 uppercase">{data.type} // {data.plate}</div>
              </div>
              <div className="bg-zinc-900/80 p-4 border border-white/5">
                <div className="text-[10px] text-white/60 uppercase">Owner</div>
                <div className="text-sm text-white font-bold">{data.owner}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// --- LANDMARKS ---
const BurjKhalifa = ({ onSelect }: any) => (
  <group position={[0, 0, 0]}>
    <mesh position={[0, 40, 0]} onClick={() => onSelect({ id: 'BURJ_KHALIFA', type: 'STRUCTURE' })}><cylinderGeometry args={[2, 3, 80, 4]} /><meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={0.5} /></mesh>
    <mesh position={[0, 100, 0]}><cylinderGeometry args={[0.5, 2, 40, 4]} /><meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={0.8} /></mesh>
    <group position={[0, 110, 0]} onClick={(e) => { e.stopPropagation(); onSelect({ id: 'ABHED_ZONE_154', type: 'VIP_TARGET' }); }}>
      <mesh><cylinderGeometry args={[1.5, 1.5, 2, 8]} /><meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={2} /></mesh>
      <Html position={[4, 0, 0]} center><div className="text-[10px] text-gold font-black bg-black/90 px-2 border border-gold whitespace-nowrap shadow-[0_0_15px_rgba(255,215,0,0.5)]">154TH FLOOR // ABHED_ZONE</div></Html>
    </group>
    <mesh position={[0, 145, 0]}><sphereGeometry args={[1, 16, 16]} /><meshBasicMaterial color={COLORS.danger} /><pointLight intensity={5} distance={20} color={COLORS.danger} /></mesh>
  </group>
);

const PalmJumeirah = ({ onSelect }: any) => (
  <group position={[-120, 0, -100]} onClick={(e) => { e.stopPropagation(); onSelect({ id: 'PALM_JUMEIRAH', type: 'DISTRICT' }); }}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[90, 16]} /><meshBasicMaterial color={COLORS.cyan} transparent opacity={0.05} /></mesh>
    {Array.from({ length: 16 }).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 8]} position={[0, 0.5, 0]}><planeGeometry args={[4, 80]} /><meshBasicMaterial color={COLORS.cyan} transparent opacity={0.4} /></mesh>
    ))}
    <Html position={[0, 20, 0]} center><div className="text-[10px] text-neon-cyan font-black bg-black/80 px-2 border border-neon-cyan whitespace-nowrap">PALM JUMEIRAH // SECTOR_09</div></Html>
  </group>
);

const TrafficTrails = ({ onSelect }: any) => {
  const points = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    curve: new THREE.CatmullRomCurve3([new THREE.Vector3(-800, 0.5, (Math.random() - 0.5) * 800), new THREE.Vector3(0, 0.5, (Math.random() - 0.5) * 200), new THREE.Vector3(800, 0.5, (Math.random() - 0.5) * 800)]),
    id: 5000 + i
  })), []);
  return <group>{points.map((p, i) => <TrafficTrail key={i} curve={p.curve} id={p.id} color={i % 2 === 0 ? COLORS.cyan : COLORS.gold} onSelect={onSelect} />)}</group>;
};

const TrafficTrail = ({ curve, id, color, onSelect }: any) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = (clock.getElapsedTime() * 0.05 + id * 0.1) % 1;
      ref.current.position.copy(curve.getPointAt(t));
    }
  });
  return (
    <>
      <mesh ref={ref} onClick={(e) => { e.stopPropagation(); onSelect({ id: `VEHICLE_${id}`, type: 'VEHICLE' }); }}>
        <sphereGeometry args={[1.5, 8, 8]} /><meshBasicMaterial color={color} /><pointLight intensity={3} distance={20} color={color} />
        <Html distanceFactor={40} position={[0, 4, 0]} center><div className="text-[6px] text-white font-bold bg-black/60 px-1 border border-white/20">V_{id}</div></Html>
      </mesh>
    </>
  );
};

const LidarAgent = ({ id, position, onSelect }: any) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x += Math.sin(clock.getElapsedTime() * 0.3 + id) * 0.1;
      ref.current.position.z += Math.cos(clock.getElapsedTime() * 0.3 + id) * 0.1;
    }
  });
  return (
    <group ref={ref} position={position} onClick={(e) => { e.stopPropagation(); onSelect({ id, type: 'CIVILIAN_AGENT' }); }}>
      <mesh position={[0, 2, 0]}><boxGeometry args={[1, 4, 1]} /><meshStandardMaterial color={COLORS.purple} wireframe emissive={COLORS.purple} emissiveIntensity={0.5} /></mesh>
      <mesh position={[0, 25, 0]}><cylinderGeometry args={[0.1, 0.1, 50, 8]} /><meshBasicMaterial color={COLORS.purple} transparent opacity={0.1} /></mesh>
      <Html distanceFactor={40} position={[0, 8, 0]} center><div className="text-[6px] text-purple-400 font-bold bg-black/90 px-2 py-0.5 border border-purple-500/50">DEVICE_{id} // LOCKED</div></Html>
    </group>
  );
};

// --- RECON ENGINE ---
export const DubaiTacticalMap = () => {
  const { focusWindow, updateWindow } = useWindowManager();
  const { addLog, history } = useTerminal();
  const [view, setView] = useState('ORBIT');
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [breachedTargets, setBreachedTargets] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const entities = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({ id: 2000 + i, pos: [(Math.random() - 0.5) * 1200, 0, (Math.random() - 0.5) * 1200] })), []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const lastCommand = history[history.length - 1];
    if (lastCommand?.type === 'input' && lastCommand.text.startsWith('breach ')) {
      const targetId = lastCommand.text.split(' ')[1];
      if (selectedTarget && targetId === selectedTarget.id) {
        addLog(`[+] INITIATING HYDRA_BREACH ON ${targetId}...`, 'warning');
        setTimeout(() => {
          setBreachedTargets(prev => [...prev, targetId]);
          addLog(`[SUCCESS] TARGET COMPROMISED.`, 'success');
        }, 1500);
      }
    }
  }, [history, selectedTarget]);

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[0.5em] animate-pulse">UPLINK_WAIT</div>;

  return (
    <div className="w-full h-full bg-black relative cursor-crosshair overflow-hidden pointer-events-auto select-none touch-none">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 0, 35] : [0, 250, 400]} fov={view === 'ORBIT' ? 45 : 35} />
          <MapControls enableDamping dampingFactor={0.05} minDistance={10} maxDistance={2000} screenSpacePanning={true} />
          <Stars radius={800} count={30000} factor={6} fade speed={1} />
          <ambientLight intensity={0.4} />
          <pointLight position={[200, 400, 200]} intensity={3} color={COLORS.cyan} />
          
          {view === 'ORBIT' ? (
            <EarthSystem onSelectSat={(city: string) => {
              updateWindow('terminal', { isOpen: true });
              focusWindow('terminal');
              addLog(`[ORBIT] ALIGNING SAT TO ${city}...`, 'info');
              setTimeout(() => setView(city), 1500);
            }} />
          ) : (
            <group>
              <gridHelper args={[4000, 100, COLORS.cyan, '#050505']} position={[0, -0.4, 0]} />
              <BurjKhalifa onSelect={setSelectedTarget} />
              <PalmJumeirah onSelect={setSelectedTarget} />
              <TrafficTrails onSelect={setSelectedTarget} />
              {entities.map((e) => <LidarAgent key={e.id} id={e.id} position={e.pos} onSelect={setSelectedTarget} />)}
            </group>
          )}

          <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={0.15} intensity={2.5} mipmapBlur radius={0.6} />
            <Scanline opacity={0.2} />
            <Noise opacity={0.1} />
            <Vignette darkness={1.3} />
            <Glitch delay={new THREE.Vector2(2, 4)} duration={new THREE.Vector2(0.1, 0.3)} strength={new THREE.Vector2(0.1, 0.2)} mode={THREE.NormalBlending} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      <div className="absolute top-24 left-4 w-48 bottom-24 hidden lg:flex flex-col gap-2 pointer-events-none">
        <div className="text-[10px] text-neon-cyan font-black uppercase tracking-widest border-b border-white/10 pb-1">Live Intercepts</div>
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
          {entities.slice(0, 15).map((e, i) => (
            <div key={i} className="bg-black/40 backdrop-blur-md border-l border-white/10 p-2">
              <div className="text-[8px] text-white/60 font-bold">ID: {e.id}</div>
              <div className="text-[7px] text-neon-cyan/80 font-mono">SIG: -{Math.floor(Math.random() * 40 + 40)}dBm</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-4 left-4 font-mono pointer-events-none p-2 bg-black/40 backdrop-blur-sm border-l-2 border-neon-cyan">
        <div className="flex items-center gap-2 mb-1">
          <Radio size={20} className="text-neon-cyan animate-pulse" />
          <div className="text-lg text-neon-cyan font-black tracking-widest uppercase italic">GHOST_SIGINT</div>
        </div>
        <div className="text-[8px] text-white/40 uppercase">Targeting Sector: {view}</div>
        {view !== 'ORBIT' && <button onClick={() => setView('ORBIT')} className="mt-4 px-4 py-1.5 border border-red-500 text-red-500 text-[9px] font-black pointer-events-auto hover:bg-red-500/20 transition-all uppercase">Reset_Downlink</button>}
      </div>

      <AnimatePresence>
        {selectedTarget && <IntelligenceSidebar target={selectedTarget} isBreached={breachedTargets.includes(selectedTarget.id)} onClose={() => setSelectedTarget(null)} />}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20"><Crosshair size={60} className="text-neon-cyan" /></div>
    </div>
  );
};