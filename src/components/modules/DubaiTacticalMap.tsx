'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
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
import { Globe, Satellite, Smartphone, ShieldAlert, Cpu, Crosshair, Activity, MapPin, Zap, X, Unlock, Lock } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  purple: '#6B0098',
  gold: '#FFD700',
  danger: '#FF3333',
  space: '#000000',
  atmosphere: '#00aaff'
};

// --- REALISTIC EARTH ENGINE ---
const EarthSystem = ({ onSelectSat }: any) => {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const [colorMap, lightsMap, cloudsMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
  ]);

  useFrame(({ clock }) => {
    if (earthRef.current) earthRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    if (cloudsRef.current) cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.025;
  });

  return (
    <group ref={earthRef}>
      <mesh>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap} 
          emissiveMap={lightsMap} 
          emissive={new THREE.Color(0xffff88)} 
          emissiveIntensity={0.2} 
          roughness={0.8}
        />
      </mesh>
      <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial map={cloudsMap} transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshBasicMaterial color={COLORS.atmosphere} transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>

      <OrbitalSatellite id="KH-11" label="KH-11 [DUBAI]" orbitRadius={14} speed={0.2} offset={0} onHack={() => onSelectSat('DUBAI')} />
      <OrbitalSatellite id="SENTINEL" label="SENTINEL [NYC]" orbitRadius={16} speed={0.15} offset={2} onHack={() => onSelectSat('NYC')} />
      <OrbitalSatellite id="FALCON" label="FALCON-1 [ABU DHABI]" orbitRadius={13} speed={0.25} offset={4} onHack={() => onSelectSat('ABU_DHABI')} />
      <OrbitalSatellite id="NEOM-SAT" label="Q-STAR [NEOM]" orbitRadius={15} speed={0.1} offset={1} onHack={() => onSelectSat('NEOM')} />
    </group>
  );
};

const OrbitalSatellite = ({ id, label, orbitRadius, speed, offset, onHack }: any) => {
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

// --- MOBILE FRIENDLY DOSSIER ---
const IntelligenceSidebar = ({ target, isBreached, onClose }: any) => {
  if (!target) return null;
  const devices = useMemo(() => Array.from({ length: 10 }).map((_, i) => ({
    model: ['iPhone 15', 'Samsung S24', 'MacBook Air', 'Tesla Model S'][Math.floor(Math.random() * 4)],
    signal: `-${Math.floor(Math.random() * 40 + 50)}dBm`
  })), [target.id]);

  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
      className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-black/95 border-l-2 sm:border-l-4 border-neon-cyan p-4 sm:p-8 font-mono z-[3000] shadow-2xl overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          {isBreached ? <Unlock className="text-emerald-400" size={20} /> : <Lock className="text-red-500" size={20} />}
          <div className="text-sm sm:text-xl text-neon-cyan font-black tracking-widest uppercase italic truncate max-w-[200px]">{target.id}</div>
        </div>
        <button onClick={onClose} className="text-white hover:text-red-500 p-2 bg-white/5 rounded-full"><X size={24} /></button>
      </div>

      {!isBreached ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldAlert size={64} className="text-red-500 mb-4 animate-pulse" />
          <div className="text-red-500 font-black text-lg mb-2 uppercase">Access Denied</div>
          <div className="text-white/40 text-[10px] uppercase">Encryption Layer Locked. Use terminal to breach.</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-emerald-500/10 border-l-2 border-emerald-500 p-4">
            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Uplink: Stable</div>
            <div className="text-sm text-white font-black mt-1 uppercase">Breach Success // Data Flowing</div>
          </div>
          <div className="space-y-2">
            {devices.map((d, i) => (
              <div key={i} className="bg-zinc-900/80 p-3 border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Smartphone size={16} className="text-emerald-400" />
                  <span className="text-[10px] text-white font-bold">{d.model}</span>
                </div>
                <span className="text-[9px] text-emerald-400/60 font-mono">{d.signal}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// --- LANDMARKS ---
const BurjKhalifa = ({ onSelect }: any) => (
  <group position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onSelect({ id: 'BURJ_KHALIFA', type: 'STRUCTURE', height: '828m' }); }}>
    <mesh position={[0, 40, 0]}><cylinderGeometry args={[2, 3, 80, 4]} /><meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={0.5} /></mesh>
    <mesh position={[0, 100, 0]}><cylinderGeometry args={[0.5, 2, 40, 4]} /><meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={0.8} /></mesh>
    <mesh position={[0, 130, 0]}><cylinderGeometry args={[0.01, 0.5, 20, 4]} /><meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={1.2} /></mesh>
    {/* Beacons */}
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={[0, 145, 0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={COLORS.danger} />
        <pointLight intensity={5} distance={20} color={COLORS.danger} />
      </mesh>
    </Float>
    <Html position={[0, 155, 0]} center>
      <div className="text-[10px] text-neon-cyan font-black bg-black/80 px-2 border border-neon-cyan whitespace-nowrap uppercase italic animate-pulse shadow-[0_0_15px_rgba(0,240,255,0.5)]">
        Burj Khalifa // SIGINT_NODE_ALPHA
      </div>
    </Html>
  </group>
);

const BurjAlArab = ({ onSelect }: any) => (
  <group position={[-80, 0, 50]} rotation={[0, Math.PI / 4, 0]} onClick={(e) => { e.stopPropagation(); onSelect({ id: 'BURJ_AL_ARAB', type: 'STRUCTURE', status: 'PROTECTED' }); }}>
    <mesh position={[0, 25, 0]}><boxGeometry args={[2, 50, 15]} /><meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={0.3} /></mesh>
    <mesh position={[5, 25, 0]} rotation={[0, 0, -0.2]}><planeGeometry args={[25, 45]} /><meshStandardMaterial color={COLORS.cyan} wireframe side={THREE.DoubleSide} transparent opacity={0.4} /></mesh>
    <Html position={[0, 55, 0]} center>
      <div className="text-[8px] text-neon-cyan font-black bg-black/80 px-2 border border-neon-cyan whitespace-nowrap uppercase">Burj Al Arab // Sector_04</div>
    </Html>
  </group>
);

const PalmJumeirah = () => (
  <group position={[-120, 0, -100]}>
    {Array.from({ length: 16 }).map((_, i) => (
      <mesh key={i} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 8]} position={[0, 0.5, 0]}>
        <planeGeometry args={[4, 80]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.4} />
      </mesh>
    ))}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
      <ringGeometry args={[75, 80, 128]} />
      <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.3} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <circleGeometry args={[85, 64]} />
      <meshBasicMaterial color="#001122" transparent opacity={0.2} />
    </mesh>
  </group>
);

const AinDubai = ({ onSelect }: any) => (
  <group position={[-150, 0, 80]} onClick={(e) => { e.stopPropagation(); onSelect({ id: 'AIN_DUBAI', type: 'STRUCTURE', status: 'MONITORED' }); }}>
    <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 40, 0]}>
      <torusGeometry args={[35, 0.5, 16, 100]} />
      <meshStandardMaterial color={COLORS.cyan} wireframe emissive={COLORS.cyan} emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0, 20, 5]}>
      <boxGeometry args={[2, 40, 2]} />
      <meshStandardMaterial color={COLORS.cyan} wireframe />
    </mesh>
    <mesh position={[0, 20, -5]}>
      <boxGeometry args={[2, 40, 2]} />
      <meshStandardMaterial color={COLORS.cyan} wireframe />
    </mesh>
    <Html position={[0, 80, 0]} center>
      <div className="text-[8px] text-neon-cyan font-black bg-black/80 px-2 border border-neon-cyan whitespace-nowrap uppercase tracking-widest">Ain Dubai // Recon_Node</div>
    </Html>
  </group>
);

const TrafficTrails = () => {
  const points = useMemo(() => {
    return Array.from({ length: 12 }).map(() => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-800, 0.5, (Math.random() - 0.5) * 800),
        new THREE.Vector3(0, 0.5, (Math.random() - 0.5) * 200),
        new THREE.Vector3(800, 0.5, (Math.random() - 0.5) * 800),
      ]);
      return curve;
    });
  }, []);

  return (
    <group>
      {points.map((curve, i) => (
        <TrafficTrail key={i} curve={curve} color={i % 3 === 0 ? COLORS.cyan : i % 3 === 1 ? COLORS.gold : COLORS.purple} />
      ))}
    </group>
  );
};

const TrafficTrail = ({ curve, color }: any) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = (clock.getElapsedTime() * 0.05 + Math.random() * 0.1) % 1;
      const pos = curve.getPointAt(t);
      ref.current.position.copy(pos);
    }
  });

  return (
    <>
      <mesh>
        <tubeGeometry args={[curve, 200, 0.2, 8, false]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} />
      </mesh>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={color} />
        <pointLight intensity={3} distance={20} color={color} />
      </mesh>
    </>
  );
};

const LidarAgent = ({ id, position, onSelect }: any) => {
  const ref = useRef<THREE.Group>(null);
  const scannerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x += Math.sin(clock.getElapsedTime() * 0.3 + id) * 0.1;
      ref.current.position.z += Math.cos(clock.getElapsedTime() * 0.3 + id) * 0.1;
      ref.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
    if (scannerRef.current) {
      scannerRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 4) * 0.2);
      scannerRef.current.material.opacity = 0.5 - Math.sin(clock.getElapsedTime() * 4) * 0.3;
    }
  });

  return (
    <group ref={ref} position={position} onClick={(e) => { e.stopPropagation(); onSelect({ id, type: 'CIVILIAN_AGENT', mac: `00:AB:45:${id.toString(16).toUpperCase()}:FF`, status: 'INTERCEPTED' }); }}>
      {/* Agent Body */}
      <mesh position={[0, 2, 0]}><boxGeometry args={[1, 4, 1]} /><meshStandardMaterial color={COLORS.purple} wireframe emissive={COLORS.purple} emissiveIntensity={0.5} /></mesh>
      <mesh position={[0, 5, 0]}><sphereGeometry args={[0.8, 12, 12]} /><meshStandardMaterial color={COLORS.purple} wireframe emissive={COLORS.purple} emissiveIntensity={0.8} /></mesh>
      
      {/* Vertical Data Beam */}
      <mesh position={[0, 25, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 50, 8]} />
        <meshBasicMaterial color={COLORS.purple} transparent opacity={0.1} />
      </mesh>

      {/* Ground Scanner Circle */}
      <mesh ref={scannerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[3, 3.5, 32]} />
        <meshBasicMaterial color={COLORS.purple} transparent opacity={0.5} />
      </mesh>

      <Html distanceFactor={40} position={[0, 8, 0]} center>
        <div className="text-[6px] text-purple-400 font-bold bg-black/90 px-2 py-0.5 border border-purple-500/50 whitespace-nowrap uppercase tracking-[0.2em] backdrop-blur-sm">
          DEVICE_ID: {id} // SIGINT_LOCKED
        </div>
      </Html>
    </group>
  );
};

const NeuralGrid = () => (
  <group>
    <gridHelper args={[4000, 100, COLORS.cyan, '#050505']} position={[0, -0.4, 0]} />
    <gridHelper args={[4000, 20, COLORS.blue, '#020202']} position={[0, -0.45, 0]} opacity={0.2} transparent />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[4000, 4000]} />
      <meshBasicMaterial color="#000" />
    </mesh>
  </group>
);

// --- RECON ENGINE ---
export const DubaiTacticalMap = () => {
  const { focusWindow, updateWindow } = useWindowManager();
  const { addLog, history } = useTerminal();
  const [view, setView] = useState('ORBIT');
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [breachedTargets, setBreachedTargets] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const lastCommand = history[history.length - 1];
    if (lastCommand?.type === 'input' && lastCommand.text.startsWith('breach ')) {
      const targetId = lastCommand.text.split(' ')[1];
      if (selectedTarget && targetId === selectedTarget.id) {
        addLog(`[+] INITIATING HYDRA_BREACH ON ${targetId}...`, 'warning');
        setTimeout(() => {
          setBreachedTargets(prev => [...prev, targetId]);
          addLog(`[SUCCESS] TARGET INFRASTRUCTURE COMPROMISED.`, 'success');
        }, 1500);
      }
    }
  }, [history]);

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[0.5em] animate-pulse">UPLINK_WAIT</div>;

  return (
    <div className="w-full h-full bg-black relative cursor-crosshair overflow-hidden pointer-events-auto select-none touch-none">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 0, 35] : [0, 250, 400]} fov={view === 'ORBIT' ? 45 : 35} />
          <MapControls 
            enableDamping dampingFactor={0.05} 
            minDistance={10} maxDistance={2000} 
            screenSpacePanning={true}
          />
          <Stars radius={800} count={30000} factor={6} fade speed={1} />
          <ambientLight intensity={0.4} />
          <pointLight position={[200, 400, 200]} intensity={3} color={COLORS.cyan} />
          <spotLight position={[0, 500, 0]} intensity={2} angle={0.5} penumbra={1} color={COLORS.blue} castShadow />

          {view === 'ORBIT' ? (
            <EarthSystem onSelectSat={(city: string) => {
              updateWindow('terminal', { isOpen: true });
              focusWindow('terminal');
              addLog(`[ORBIT] ALIGNING SAT TO ${city}...`, 'info');
              setTimeout(() => setView(city), 1500);
            }} />
          ) : (
            <group>
              <NeuralGrid />
              
              <BurjKhalifa onSelect={setSelectedTarget} />
              <BurjAlArab onSelect={setSelectedTarget} />
              <AinDubai onSelect={setSelectedTarget} />
              <PalmJumeirah />
              <TrafficTrails />
              
              {Array.from({ length: 50 }).map((_, i) => (
                <LidarAgent 
                  key={i} 
                  id={2000 + i} 
                  position={[(Math.random() - 0.5) * 1200, 0, (Math.random() - 0.5) * 1200]} 
                  onSelect={setSelectedTarget} 
                />
              ))}
              
              {/* Sector Bounds */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
                <ringGeometry args={[590, 600, 64]} />
                <meshBasicMaterial color={COLORS.danger} transparent opacity={0.2} />
              </mesh>
            </group>
          )}

          <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={0.15} intensity={2.5} mipmapBlur radius={0.6} />
            <Scanline opacity={0.2} />
            <Noise opacity={0.1} />
            <Vignette darkness={1.3} />
            <Glitch delay={[2, 4]} duration={[0.1, 0.3]} strength={[0.1, 0.2]} mode={THREE.NormalBlending} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* MOBILE HUD */}
      <div className="absolute top-4 left-4 font-mono pointer-events-none p-2 bg-black/40 backdrop-blur-sm border-l-2 border-neon-cyan">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={20} className="text-neon-cyan animate-spin-slow" />
          <div className="text-lg text-neon-cyan font-black tracking-widest uppercase">GHOST_SIGINT</div>
        </div>
        <div className="text-[8px] text-white/40 uppercase">Satellite Downlink: {view}</div>
        {view !== 'ORBIT' && (
          <button 
            onClick={() => setView('ORBIT')} 
            className="mt-4 px-4 py-1.5 border border-red-500 text-red-500 text-[9px] font-black uppercase pointer-events-auto hover:bg-red-500/20 active:scale-95 transition-all"
          >
            Terminal_Downlink
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
        <Crosshair size={60} className="text-neon-cyan" />
      </div>
    </div>
  );
};
