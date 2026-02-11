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
  Line
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, Glitch, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Smartphone, ShieldAlert, Cpu, Crosshair, Activity, MapPin, Zap } from 'lucide-react';

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

  // Load NASA Textures (High Res)
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
      {/* Surface */}
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
      {/* Clouds */}
      <mesh ref={cloudsRef} scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshStandardMaterial 
          map={cloudsMap} 
          transparent 
          opacity={0.4} 
          blending={THREE.AdditiveBlending} 
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Atmosphere Glow */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[10, 64, 64]} />
        <meshBasicMaterial color={COLORS.atmosphere} transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>

      {/* Orbiting Satellites */}
      <OrbitalSatellite id="KH-11" label="KH-11 [DUBAI]" orbitRadius={14} speed={0.2} offset={0} onHack={() => onSelectSat('DUBAI')} />
      <OrbitalSatellite id="SENTINEL" label="SENTINEL [NYC]" orbitRadius={16} speed={0.15} offset={2} onHack={() => onSelectSat('NYC')} />
      <OrbitalSatellite id="FALCON" label="FALCON-1 [ABU DHABI]" orbitRadius={13} speed={0.25} offset={4} onHack={() => onSelectSat('ABU_DHABI')} />
      <OrbitalSatellite id="NEOM-SAT" label="Q-STAR [NEOM]" orbitRadius={15} speed={0.1} offset={1} onHack={() => onSelectSat('NEOM')} />
      <OrbitalSatellite id="MI6-EYE" label="EYE-1 [LONDON]" orbitRadius={14.5} speed={0.18} offset={5} onHack={() => onSelectSat('LONDON')} />
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
    ref.current.position.y = Math.sin(t * 0.5) * (orbitRadius * 0.3); // Inclined orbit
    ref.current.lookAt(0, 0, 0);
  });

  return (
    <group ref={ref} onClick={(e) => { e.stopPropagation(); onHack(); }}>
      <mesh><boxGeometry args={[0.5, 0.2, 0.3]} /><meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={0.5} /></mesh>
      <mesh position={[0.6, 0, 0]}><boxGeometry args={[0.8, 0.02, 0.4]} /><meshBasicMaterial color={COLORS.blue} wireframe /></mesh>
      <mesh position={[-0.6, 0, 0]}><boxGeometry args={[0.8, 0.02, 0.4]} /><meshBasicMaterial color={COLORS.blue} wireframe /></mesh>
      <Html distanceFactor={25}>
        <div className="text-[8px] text-white font-black bg-black/80 px-1 border border-white/20 whitespace-nowrap hover:border-neon-cyan hover:text-neon-cyan cursor-pointer transition-colors">
          {label}
        </div>
      </Html>
    </group>
  );
};

// --- CITY GENERATORS ---

const DubaiCity = ({ onHack }: any) => (
  <group>
    {/* Burj Khalifa */}
    <group position={[30, 0, -30]} onClick={() => onHack("BURJ_KHALIFA")}>
      {[...Array(40)].map((_, i) => (
        <mesh key={i} position={[0, i * 1.5, 0]}><cylinderGeometry args={[2 - i * 0.05, 2.2 - i * 0.05, 1.5, 6]} /><meshBasicMaterial color={COLORS.cyan} transparent opacity={0.3} /></mesh>
      ))}
      <mesh position={[0, 60, 0]}><cylinderGeometry args={[0.1, 2, 20, 6]} /><meshBasicMaterial color={COLORS.cyan} wireframe /></mesh>
      <Html position={[0, 70, 0]} distanceFactor={80}><div className="text-[10px] bg-black text-cyan-400 border border-cyan-400 px-1">TARGET: BURJ_KHALIFA</div></Html>
    </group>
    {/* Palm Jumeirah */}
    <group position={[-50, 0.1, 30]} rotation={[-Math.PI/2, 0, -0.5]} onClick={() => onHack("PALM_JUMEIRAH")}>
      <mesh><ringGeometry args={[2, 12, 32]} /><meshBasicMaterial color={COLORS.purple} wireframe /></mesh>
      {[...Array(16)].map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i/16)*Math.PI*2]} position={[0, 6, 0]}><planeGeometry args={[1, 10]} /><meshBasicMaterial color={COLORS.purple} transparent opacity={0.2} /></mesh>
      ))}
    </group>
    {/* Burj Al Arab */}
    <group position={[-20, 0, 10]} rotation={[0, Math.PI/4, 0]} onClick={() => onHack("BURJ_AL_ARAB")}>
      <mesh position={[0, 10, 0]}><cylinderGeometry args={[0, 4, 20, 3]} /><meshBasicMaterial color="white" wireframe transparent opacity={0.5} /></mesh>
    </group>
  </group>
);

const NycCity = ({ onHack }: any) => (
  <group>
    {/* WTC */}
    <group position={[0, 0, 0]} onClick={() => onHack("ONE_WTC")}>
      <mesh position={[0, 25, 0]}>
        <cylinderGeometry args={[1, 4, 50, 4]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe opacity={0.5} transparent />
      </mesh>
      <Html position={[0, 52, 0]} distanceFactor={80}><div className="text-[10px] bg-black text-blue-400 border border-blue-400 px-1">TARGET: FREEDOM_TOWER</div></Html>
    </group>
    {/* Empire State */}
    <group position={[20, 0, -40]} onClick={() => onHack("EMPIRE_STATE")}>
      <mesh position={[0, 20, 0]}><boxGeometry args={[5, 40, 5]} /><meshBasicMaterial color={COLORS.gold} wireframe opacity={0.3} transparent /></mesh>
      <mesh position={[0, 45, 0]}><cylinderGeometry args={[0.1, 1, 10, 4]} /><meshBasicMaterial color={COLORS.gold} /></mesh>
    </group>
    {/* Dense Grid */}
    {[...Array(200)].map((_, i) => {
      const x = (Math.random()-0.5)*150;
      const z = (Math.random()-0.5)*150;
      if (Math.abs(x) < 10 && Math.abs(z) < 10) return null;
      return (
        <mesh key={i} position={[x, Math.random()*10, z]}>
          <boxGeometry args={[2, Math.random()*20+5, 2]} />
          <meshBasicMaterial color="#111" wireframe transparent opacity={0.1} />
        </mesh>
      );
    })}
  </group>
);

const NeomCity = ({ onHack }: any) => (
  <group onClick={() => onHack("THE_LINE_CORE")}>
    {/* The Line - Infinite Mirror */}
    <mesh position={[0, 15, 0]}>
      <boxGeometry args={[300, 30, 2]} />
      <meshPhysicalMaterial color="silver" metalness={1} roughness={0} />
    </mesh>
    <Html position={[0, 32, 0]} distanceFactor={100}><div className="text-[10px] bg-black text-white border border-white px-1">PROJECT: NEOM</div></Html>
  </group>
);

const AbuDhabiCity = ({ onHack }: any) => (
  <group>
    {/* Etihad Towers */}
    {[...Array(5)].map((_, i) => (
      <mesh key={i} position={[i*5-10, 15+Math.sin(i)*5, 0]} onClick={() => onHack(`ETIHAD_TOWER_${i+1}`)}>
        <cylinderGeometry args={[1.5, 2, 30+Math.sin(i)*10, 8]} />
        <meshBasicMaterial color={COLORS.gold} wireframe transparent opacity={0.4} />
      </mesh>
    ))}
    <Html position={[0, 35, 0]} distanceFactor={60}><div className="text-[10px] bg-black text-yellow-500 border border-yellow-500 px-1">ETIHAD_COMPLEX</div></Html>
  </group>
);

// --- MAIN ENGINE ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [view, setView] = useState('ORBIT');
  const [selected, setSelected] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleHack = (id: string) => {
    updateWindow('terminal', { isOpen: true, title: `HACKING // ${id}` });
    openWindow('terminal');
    addLog(`[TARGET ACQUIRED] ${id} - INITIATING BREACH...`, 'warning');
    setTimeout(() => {
      addLog(`[SUCCESS] ROOT ACCESS GRANTED to ${id}`, 'success');
      setSelected({ id });
    }, 1500);
  };

  const switchSector = (city: string) => {
    updateWindow('terminal', { isOpen: true, title: `SATELLITE_REPOSITION // ${city}` });
    openWindow('terminal');
    addLog(`[ORBIT] ALIGNING SENSORS TO ${city}...`, 'info');
    setTimeout(() => {
      setView(city);
      addLog(`[UPLINK] CONNECTED TO ${city} GRID.`, 'success');
    }, 2000);
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[1em] animate-pulse">GLOBAL_LINK_INIT...</div>;

  return (
    <div className="w-full h-full bg-black relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 0, 35] : [0, 60, 80]} fov={view === 'ORBIT' ? 45 : 40} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={10} maxDistance={500} />
        <Stars radius={300} count={20000} factor={4} fade />
        <ambientLight intensity={0.2} />
        <pointLight position={[50, 100, 50]} intensity={2} color={COLORS.cyan} />

        {view === 'ORBIT' ? (
          <EarthSystem onSelectSat={switchSector} />
        ) : (
          <group>
            {/* Ground Grid */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <planeGeometry args={[1000, 1000, 100, 100]} />
              <meshBasicMaterial color="#050505" wireframe opacity={0.1} transparent />
            </mesh>
            
            {view === 'DUBAI' && <DubaiCity onHack={handleHack} />}
            {view === 'NYC' && <NycCity onHack={handleHack} />}
            {view === 'ABU_DHABI' && <AbuDhabiCity onHack={handleHack} />}
            {view === 'NEOM' && <NeomCity onHack={handleHack} />}
            {view === 'LONDON' && <NycCity onHack={handleHack} />} {/* Placeholder for London structure */}
          </group>
        )}

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.1} intensity={1.5} mipmapBlur radius={0.5} />
          <Scanline opacity={0.1} />
          <Noise opacity={0.05} />
          <Vignette darkness={1.2} />
          <Glitch delay={new THREE.Vector2(5, 10)} duration={new THREE.Vector2(0.1, 0.3)} strength={new THREE.Vector2(0.1, 0.1)} />
        </EffectComposer>
      </Canvas>

      {/* OVERWATCH HUD */}
      <div className="absolute top-4 left-4 font-mono pointer-events-none select-none">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={28} className="text-neon-cyan animate-spin-slow" />
          <div className="text-2xl text-neon-cyan font-black tracking-[0.5em]">GLOBAL_OVERWATCH</div>
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest">Sector: {view} // Uplink: SECURE</div>
        
        {view !== 'ORBIT' && (
          <button onClick={() => setView('ORBIT')} className="mt-6 px-6 py-2 border border-red-500 text-red-500 text-[10px] font-black uppercase pointer-events-auto hover:bg-red-500/20 transition-all">
            RETURN_TO_ORBIT
          </button>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} className="absolute top-20 right-4 w-[400px] bg-black/95 border-l-4 border-neon-cyan p-6 font-mono z-[2000] shadow-2xl pointer-events-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
              <div className="text-lg text-neon-cyan font-black tracking-widest uppercase">Target_Breached // {selected.id}</div>
              <button onClick={() => setSelected(null)} className="text-white hover:text-red-500 font-bold">X</button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-zinc-900/50 p-3 border border-white/5">
                <div className="text-[9px] text-white/40 uppercase font-bold">Encrypted_Payload</div>
                <div className="text-[10px] text-emerald-400 break-all font-mono mt-1">
                  {Array.from({length: 4}).map(() => Math.random().toString(36).substring(2)).join('')}
                </div>
              </div>
              
              <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Intercepted_Devices:</div>
              <div className="h-[300px] overflow-y-auto scrollbar-hide space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/60 p-3 border border-white/5">
                    <div className="flex items-center gap-3">
                      <Smartphone size={16} className="text-emerald-500" />
                      <div>
                        <div className="text-[10px] text-white font-bold">TARGET_{i+1}</div>
                        <div className="text-[8px] text-white/30">MAC: {Math.random().toString(16).substring(2,8).toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-white/20">Active</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30">
        <Crosshair size={80} className="text-neon-cyan" strokeWidth={0.5} />
      </div>
    </div>
  );
};