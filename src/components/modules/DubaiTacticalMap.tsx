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

// --- RECON ENGINE ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
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
        addLog(`[+] BREACHING ${targetId}...`, 'warning');
        setTimeout(() => {
          setBreachedTargets(prev => [...prev, targetId]);
          addLog(`[SUCCESS] TARGET COMPROMISED.`, 'success');
        }, 1500);
      }
    }
  }, [history]);

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[0.5em] animate-pulse">UPLINK_WAIT</div>;

  return (
    <div className="w-full h-full bg-black relative cursor-crosshair overflow-hidden pointer-events-auto select-none touch-none">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 0, 35] : [0, 60, 80]} fov={view === 'ORBIT' ? 45 : 40} />
        <MapControls 
          enableDamping dampingFactor={0.05} 
          minDistance={5} maxDistance={500} 
          screenSpacePanning={true}
        />
        <Stars radius={300} count={15000} factor={4} fade />
        <ambientLight intensity={0.3} />
        <pointLight position={[50, 100, 50]} intensity={2} color={COLORS.cyan} />

        {view === 'ORBIT' ? (
          <EarthSystem onSelectSat={(city: string) => {
            updateWindow('terminal', { isOpen: true });
            openWindow('terminal');
            addLog(`[ORBIT] ALIGNING SAT TO ${city}...`, 'info');
            setTimeout(() => setView(city), 1500);
          }} />
        ) : (
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <planeGeometry args={[1000, 1000, 100, 100]} />
              <meshBasicMaterial color="#050505" wireframe opacity={0.1} transparent />
            </mesh>
            {/* Generic Target Node for Demo */}
            <mesh position={[0, 5, 0]} onClick={() => setSelectedTarget({ id: 'BURJ_CORE', type: 'INFRASTRUCTURE' })}>
              <cylinderGeometry args={[0.5, 2, 10, 6]} />
              <meshBasicMaterial color={COLORS.cyan} wireframe />
            </mesh>
          </group>
        )}

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.1} intensity={1.5} mipmapBlur radius={0.5} />
          <Scanline opacity={0.1} />
          <Noise opacity={0.05} />
          <Vignette darkness={1.2} />
        </EffectComposer>
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
