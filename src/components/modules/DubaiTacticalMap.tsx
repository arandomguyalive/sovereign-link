'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
import { 
  Smartphone, ShieldAlert, X, Unlock, Lock, Radio, Crosshair, 
  Wifi, Camera as CameraIcon, Car, User, MapPin, Activity, Zap 
} from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  purple: '#6B0098',
  gold: '#FFD700',
  danger: '#FF3333',
  emerald: '#10b981',
  space: '#000000',
};

// --- TYPES ---
type EntityType = 'CIVILIAN_AGENT' | 'VEHICLE' | 'WIFI_HUB' | 'CCTV_NODE' | 'VIP_TARGET' | 'STRUCTURE';

interface EntityData {
  id: string;
  type: EntityType;
  pos: [number, number, number];
  details: any;
}

// --- DATA GENERATORS ---
const generateCoordinates = (id: string, pos: [number, number, number]) => ({
  lat: (25.2048 + pos[0] / 10000).toFixed(6),
  lng: (55.2708 + pos[2] / 10000).toFixed(6),
  alt: pos[1].toFixed(1) + 'm'
});

const generateEntity = (id: number, type: EntityType): EntityData => {
  const pos: [number, number, number] = [(Math.random() - 0.5) * 1500, 0, (Math.random() - 0.5) * 1500];
  const coords = generateCoordinates(id.toString(), pos);
  
  const details: any = { coords };

  if (type === 'CIVILIAN_AGENT') {
    details.name = ['K. Thorne', 'S. Rossi', 'V. Volkov', 'M. Millions'][id % 4];
    details.biometrics = { heart: `${70 + (id % 20)}BPM`, gait: '99.8% Match' };
    details.device = { model: 'iPhone 15', imei: `3567${id}00` };
  } else if (type === 'WIFI_HUB') {
    details.ssid = `DXB_FREE_WIFI_${id}`;
    details.mac = `00:AB:45:${id.toString(16).toUpperCase()}`;
    details.encryption = id % 2 === 0 ? 'WPA3' : 'WPA2-PSK';
    details.signal = `-${40 + (id % 30)}dBm`;
  } else if (type === 'CCTV_NODE') {
    details.id = `CAM_${id}`;
    details.res = '4K_UHD';
    details.storage = 'LOCAL_SSD_8TB';
    details.status = 'STREAMING';
  } else if (type === 'VEHICLE') {
    details.model = ['Tesla S', 'Range Rover', 'G-Wagon'][id % 3];
    details.plate = `DXB ${1000 + id}`;
    details.speed = `${60 + (id % 60)}KM/H`;
  }

  return { id: `${type}_${id}`, type, pos, details };
};

// --- INTELLIGENCE SIDEBAR ---
const IntelligenceSidebar = ({ target, isBreached, onClose }: any) => {
  if (!target) return null;

  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-black/95 border-l-2 border-neon-cyan p-6 font-mono z-[3000] shadow-2xl overflow-y-auto backdrop-blur-xl"
    >
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          {isBreached ? <Unlock className="text-emerald-400" size={20} /> : <Lock className="text-red-500" size={20} />}
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-tighter">{target.type}</div>
            <div className="text-lg text-neon-cyan font-black tracking-widest uppercase italic">{target.id}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-white hover:text-red-500 p-2 bg-white/5 rounded-full"><X size={24} /></button>
      </div>

      <div className="space-y-6">
        {/* GEOSPATIAL DATA */}
        <div className="bg-zinc-900/80 p-4 border border-white/5 space-y-2">
          <div className="text-[10px] text-neon-cyan font-black uppercase flex items-center gap-2"><MapPin size={12} /> Real-Time Coordinates</div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>LAT: <span className="text-white font-bold">{target.details.coords.lat}</span></div>
            <div>LNG: <span className="text-white font-bold">{target.details.coords.lng}</span></div>
            <div>ALT: <span className="text-white font-bold">{target.details.coords.alt}</span></div>
          </div>
        </div>

        {!isBreached ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10">
            <ShieldAlert size={64} className="text-red-500 mb-4 animate-pulse" />
            <div className="text-red-500 font-black text-lg">ENCRYPTION_LOCKED</div>
            <div className="text-white/40 text-[10px] mt-2">Execute `breach {target.id}` to access payload.</div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {target.type === 'CIVILIAN_AGENT' && (
              <>
                <div className="bg-emerald-500/10 border-l-2 border-emerald-500 p-4">
                  <div className="text-[10px] text-emerald-400 font-black uppercase">Neural-Link Biometrics</div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1">
                      <div className="text-[8px] text-white/40">HEART_RATE</div>
                      <div className="text-xl text-white font-black">{target.details.biometrics.heart}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[8px] text-white/40">GAIT_ANALYSIS</div>
                      <div className="text-xl text-white font-black">{target.details.biometrics.gait}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] text-neon-cyan font-black uppercase tracking-widest border-b border-white/10 pb-1">Primary Device</div>
                  <div className="bg-zinc-900/80 p-3 flex justify-between items-center border border-white/5">
                    <div className="flex items-center gap-3">
                      <Smartphone size={16} className="text-neon-cyan" />
                      <div>
                        <div className="text-[11px] text-white font-bold">{target.details.device.model}</div>
                        <div className="text-[8px] text-white/40">IMEI: {target.details.device.imei}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-black">UPLINK_STABLE</div>
                  </div>
                </div>
              </>
            )}

            {target.type === 'WIFI_HUB' && (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border-l-2 border-blue-500 p-4">
                  <div className="text-[10px] text-blue-400 font-black uppercase">Network Node Details</div>
                  <div className="text-2xl text-white font-black mt-1">{target.details.ssid}</div>
                  <div className="text-[10px] text-white/40 mt-1">MAC: {target.details.mac}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900/80 p-3 border border-white/5">
                    <div className="text-[8px] text-white/40 uppercase">Encryption</div>
                    <div className="text-sm text-white font-bold">{target.details.encryption}</div>
                  </div>
                  <div className="bg-zinc-900/80 p-3 border border-white/5">
                    <div className="text-[8px] text-white/40 uppercase">Signal Strength</div>
                    <div className="text-sm text-white font-bold">{target.details.signal}</div>
                  </div>
                </div>
              </div>
            )}

            {target.type === 'CCTV_NODE' && (
              <div className="space-y-4">
                <div className="bg-purple-500/10 border-l-2 border-purple-500 p-4">
                  <div className="text-[10px] text-purple-400 font-black uppercase">Optical Feed Status</div>
                  <div className="text-2xl text-white font-black mt-1">{target.details.id}</div>
                  <div className="text-[10px] text-emerald-400 font-black mt-1">● LIVE_FEED_ENCRYPTED</div>
                </div>
                <div className="bg-black border border-white/5 p-4 flex items-center justify-center aspect-video relative">
                  <CameraIcon size={48} className="text-white/10" />
                  <div className="absolute top-2 left-2 text-[8px] text-red-500 font-black animate-pulse">REC</div>
                  <div className="text-[10px] text-white/40">INTERCEPTING BITSTREAM...</div>
                </div>
              </div>
            )}

            {target.type === 'VEHICLE' && (
              <div className="space-y-4">
                <div className="bg-gold/10 border-l-2 border-gold p-4">
                  <div className="text-[10px] text-gold font-black uppercase">CAN-BUS Telematics</div>
                  <div className="text-3xl text-white font-black mt-1">{target.details.speed}</div>
                  <div className="text-[10px] text-white/40 mt-1">{target.details.model} // {target.details.plate}</div>
                </div>
                <div className="bg-zinc-900/80 p-4 border border-white/5">
                  <div className="text-[8px] text-white/40 uppercase">Registered Owner</div>
                  <div className="text-sm text-white font-bold uppercase">Government Security Fleet</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- MAP ENTITIES ---
const EntityNode = ({ data, onSelect }: { data: EntityData, onSelect: any }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (ref.current && (data.type === 'CIVILIAN_AGENT' || data.type === 'VEHICLE')) {
      const speed = data.type === 'VEHICLE' ? 0.2 : 0.05;
      ref.current.position.x += Math.sin(clock.getElapsedTime() * speed + parseInt(data.id.split('_')[1])) * 0.1;
      ref.current.position.z += Math.cos(clock.getElapsedTime() * speed + parseInt(data.id.split('_')[1])) * 0.1;
    }
  });

  const getColor = () => {
    switch (data.type) {
      case 'WIFI_HUB': return COLORS.cyan;
      case 'CCTV_NODE': return COLORS.purple;
      case 'VEHICLE': return COLORS.gold;
      case 'CIVILIAN_AGENT': return COLORS.emerald;
      default: return COLORS.blue;
    }
  };

  const Icon = () => {
    switch (data.type) {
      case 'WIFI_HUB': return <Wifi size={12} />;
      case 'CCTV_NODE': return <CameraIcon size={12} />;
      case 'VEHICLE': return <Car size={12} />;
      case 'CIVILIAN_AGENT': return <User size={12} />;
      default: return <Radio size={12} />;
    }
  };

  return (
    <group ref={ref} position={data.pos} onClick={(e) => { e.stopPropagation(); onSelect(data); }}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={getColor()} wireframe emissive={getColor()} emissiveIntensity={0.5} />
      </mesh>
      {/* Data Spike */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 20, 8]} />
        <meshBasicMaterial color={getColor()} transparent opacity={0.2} />
      </mesh>
      <Html distanceFactor={50} position={[0, 3, 0]} center>
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="p-1 bg-black/80 border border-white/20 rounded-full group-hover:border-neon-cyan transition-colors" style={{ color: getColor() }}>
            <Icon />
          </div>
          <div className="text-[6px] text-white font-black bg-black/90 px-1 border border-white/10 whitespace-nowrap uppercase hidden group-hover:block">
            {data.id}
          </div>
        </div>
      </Html>
    </group>
  );
};

// --- RECON ENGINE ---
export const DubaiTacticalMap = () => {
  const { focusWindow, updateWindow } = useWindowManager();
  const { addLog, history } = useTerminal();
  const [view, setView] = useState('ORBIT');
  const [selectedTarget, setSelectedTarget] = useState<EntityData | null>(null);
  const [breachedTargets, setBreachedTargets] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // MASSIVE ENTITY POPULATION
  const entities = useMemo(() => {
    const arr: EntityData[] = [];
    for (let i = 0; i < 50; i++) arr.push(generateEntity(i, 'CIVILIAN_AGENT'));
    for (let i = 0; i < 40; i++) arr.push(generateEntity(i, 'VEHICLE'));
    for (let i = 0; i < 30; i++) arr.push(generateEntity(i, 'WIFI_HUB'));
    for (let i = 0; i < 20; i++) arr.push(generateEntity(i, 'CCTV_NODE'));
    return arr;
  }, []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const lastCommand = history[history.length - 1];
    if (lastCommand?.type === 'input' && lastCommand.text.startsWith('breach ')) {
      const targetId = lastCommand.text.split(' ')[1];
      if (selectedTarget && targetId === selectedTarget.id) {
        addLog(`[+] INITIATING SIGINT_BREACH ON ${targetId}...`, 'warning');
        setTimeout(() => {
          setBreachedTargets(prev => [...prev, targetId]);
          addLog(`[SUCCESS] TARGET DATAFLOW ESTABLISHED.`, 'success');
        }, 800);
      }
    }
  }, [history, selectedTarget, addLog]);

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[0.5em] animate-pulse">UPLINK_WAIT</div>;

  const handleSelectEntity = (entity: EntityData) => {
    setSelectedTarget(entity);
    updateWindow('terminal', { isOpen: true });
    focusWindow('terminal');
    addLog(`[RECON] LOCKING ON ${entity.id}...`, 'info');
  };

  return (
    <div className="w-full h-full bg-black relative cursor-crosshair overflow-hidden pointer-events-auto select-none touch-none">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 0, 35] : [0, 300, 500]} fov={view === 'ORBIT' ? 45 : 30} />
          <MapControls 
            enableDamping dampingFactor={0.05} 
            minDistance={10} maxDistance={2500} 
            screenSpacePanning={true}
          />
          <Stars radius={800} count={40000} factor={7} fade speed={1.5} />
          <ambientLight intensity={0.4} />
          <pointLight position={[300, 600, 300]} intensity={4} color={COLORS.cyan} />
          
          {view === 'ORBIT' ? (
            <EarthSystem onSelectSat={(city: string) => {
              updateWindow('terminal', { isOpen: true });
              focusWindow('terminal');
              addLog(`[ORBIT] DOWNLINKING TO ${city} SECTOR...`, 'info');
              setView(city);
            }} />
          ) : (
            <group>
              <gridHelper args={[5000, 100, COLORS.cyan, '#050505']} position={[0, -0.4, 0]} />
              <gridHelper args={[5000, 20, COLORS.blue, '#020202']} position={[0, -0.45, 0]} opacity={0.1} transparent />
              
              {/* PRIMARY HUB */}
              <group position={[0, 0, 0]} onClick={() => handleSelectEntity({ id: 'BURJ_KHALIFA', type: 'STRUCTURE', pos: [0, 0, 0], details: { coords: generateCoordinates('BK', [0, 0, 0]) } })}>
                <mesh position={[0, 75, 0]}><cylinderGeometry args={[2, 5, 150, 4]} /><meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={0.5} /></mesh>
                <Html position={[0, 160, 0]} center>
                  <div className="text-[10px] text-neon-cyan font-black bg-black/90 px-2 border border-neon-cyan whitespace-nowrap uppercase italic animate-pulse">BURJ KHALIFA // GRID_MASTER</div>
                </Html>
              </group>

              {/* VIP ABHED ZONE */}
              <group position={[0, 110, 0]} onClick={(e) => { e.stopPropagation(); handleSelectEntity({ id: 'ABHED_ZONE_154', type: 'VIP_TARGET', pos: [0, 110, 0], details: { coords: generateCoordinates('AZ', [0, 110, 0]) } }); }}>
                <mesh><cylinderGeometry args={[2, 2, 4, 8]} /><meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={2} /></mesh>
                <Html position={[6, 0, 0]} center><div className="text-[8px] text-gold font-black bg-black/90 px-2 border border-gold whitespace-nowrap shadow-[0_0_20px_rgba(255,215,0,0.5)]">154TH FLOOR // ABHED_ZONE</div></Html>
              </group>

              {/* ENTITY POPULATION */}
              {entities.map((e) => (
                <EntityNode key={e.id} data={e} onSelect={handleSelectEntity} />
              ))}
            </group>
          )}

          <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={0.1} intensity={2.5} mipmapBlur radius={0.6} />
            <Scanline opacity={0.3} />
            <Noise opacity={0.15} />
            <Vignette darkness={1.4} />
            <Glitch 
              delay={new THREE.Vector2(3, 6)} 
              duration={new THREE.Vector2(0.1, 0.2)} 
              strength={new THREE.Vector2(0.1, 0.1)} 
              mode={THREE.NormalBlending} 
            />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* OPERATIONAL HUD */}
      <div className="absolute top-24 left-4 w-56 bottom-24 hidden lg:flex flex-col gap-2 pointer-events-none">
        <div className="text-[10px] text-neon-cyan font-black uppercase tracking-[0.3em] border-b border-neon-cyan/30 pb-1 flex items-center gap-2"><Radio size={14} /> Global SIGINT Feed</div>
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-2">
          {entities.slice(0, 25).map((e, i) => (
            <div key={i} className="bg-black/60 backdrop-blur-md border-l-2 border-white/10 p-2 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex justify-between items-start">
                <div className="text-[8px] text-white/60 font-bold">{e.id}</div>
                <div className="text-[6px] text-neon-cyan/40">STABLE</div>
              </div>
              <div className="text-[7px] text-neon-cyan/80 font-mono mt-1 uppercase italic">Intercepting Hardware ID...</div>
              <div className="text-[6px] text-white/20 font-mono mt-0.5">{e.details.coords.lat}, {e.details.coords.lng}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-4 left-4 font-mono pointer-events-none p-3 bg-black/60 backdrop-blur-md border-l-4 border-neon-cyan">
        <div className="flex items-center gap-3 mb-1">
          <Activity size={24} className="text-neon-cyan animate-pulse" />
          <div>
            <div className="text-xl text-neon-cyan font-black tracking-widest uppercase italic leading-none">Sovereign Link</div>
            <div className="text-[8px] text-white/40 uppercase tracking-[0.5em]">Global Intelligence Network</div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="text-[10px] text-emerald-400 font-black uppercase">● Uplink: {view}</div>
          <div className="text-[10px] text-white/40 font-black uppercase">Nodes: {entities.length}</div>
        </div>
        {view !== 'ORBIT' && (
          <button 
            onClick={() => setView('ORBIT')} 
            className="mt-4 px-6 py-2 border-2 border-red-500 text-red-500 text-[10px] font-black pointer-events-auto hover:bg-red-500/20 transition-all uppercase tracking-widest active:scale-95"
          >
            Terminal_Reset_Downlink
          </button>
        )}
      </div>

      <AnimatePresence>
        {selectedTarget && (
          <IntelligenceSidebar 
            target={selectedTarget} 
            isBreached={breachedTargets.includes(selectedTarget.id)} 
            onClose={() => setSelectedTarget(null)} 
          />
        )}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
        <Crosshair size={80} className="text-neon-cyan animate-spin-slow" />
      </div>
    </div>
  );
};
