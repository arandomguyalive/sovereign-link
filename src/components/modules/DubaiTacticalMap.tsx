'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  MapControls, 
  Stars, 
  PerspectiveCamera, 
  Html, 
  Float, 
  Detailed,
  Instances,
  Instance,
  Text
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, Glitch, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useWindowManager } from '@/store/useWindowManager';
import { useTerminal } from '@/store/useTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Satellite, Smartphone, Cpu, Crosshair, Activity, ShieldAlert, Wifi } from 'lucide-react';

const COLORS = {
  cyan: '#00F0FF',
  blue: '#0066FF',
  purple: '#6B0098',
  gold: '#FFD700',
  danger: '#FF3333',
  ocean: '#020a15',
  land: '#020202',
};

// --- GEOMETRY: Procedural Palm Jumeirah (Digital Twin) ---
const PalmJumeirah = ({ onHack }: any) => {
  const palmShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, 0); shape.lineTo(-0.4, 4); shape.lineTo(0.4, 4); shape.lineTo(0.5, 0); // Trunk
    for (let i = 0; i < 16; i++) {
      const y = 1 + (i / 16) * 3;
      const length = 3 + Math.sin(i) * 0.5;
      shape.moveTo(0.4, y); shape.quadraticCurveTo(2, y + 0.5, 0.4 + length, y + 0.2); // Frond Right
      shape.moveTo(-0.4, y); shape.quadraticCurveTo(-2, y + 0.5, -(0.4 + length), y + 0.2); // Frond Left
    }
    return shape;
  }, []);

  return (
    <group position={[-45, 0.1, 20]} rotation={[-Math.PI / 2, 0, -0.6]} onClick={(e) => { e.stopPropagation(); onHack("PALM_SECURITY_GRID"); }}>
      <mesh><shapeGeometry args={[palmShape]} /><meshBasicMaterial color={COLORS.purple} transparent opacity={0.3} wireframe /></mesh>
      <mesh rotation={[0, 0, 0]} position={[0, 5, 0]}>
        <ringGeometry args={[5.5, 6.5, 64, 1, Math.PI, Math.PI]} />
        <meshBasicMaterial color={COLORS.purple} wireframe />
      </mesh>
      <Html position={[0, 0, 2]} distanceFactor={60}>
        <div className="text-[10px] text-purple-400 font-black border-2 border-purple-500 px-3 bg-black/90 uppercase tracking-widest">PALM_JUMEIRAH_SECTOR</div>
      </Html>
    </group>
  );
};

// --- GEOMETRY: Burj Khalifa (Intelligence Hub) ---
const BurjKhalifa = ({ onHack }: any) => (
  <group position={[35, 0, -25]} onClick={(e) => { e.stopPropagation(); onHack("BURJ_CORE_SYSTEMS"); }}>
    {[...Array(50)].map((_, i) => (
      <mesh key={i} position={[0, i * 1, 0]}>
        <cylinderGeometry args={[2.5 - i * 0.04, 2.7 - i * 0.04, 0.05, 6]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.4} />
      </mesh>
    ))}
    <mesh position={[0, 25, 0]}><cylinderGeometry args={[0.1, 2.5, 50, 6]} /><meshBasicMaterial color={COLORS.cyan} wireframe opacity={0.2} transparent /></mesh>
    {/* RESTRICTED FLOOR 154 */}
    <group position={[0, 35, 0]} onClick={(e) => { e.stopPropagation(); onHack("FLOOR_154_VAULT"); }}>
      <mesh><torusGeometry args={[3, 0.1, 16, 100]} /><meshBasicMaterial color={COLORS.danger} /></mesh>
      <Html distanceFactor={40}>
        <div className="bg-red-600 text-white font-black px-2 py-1 text-[10px] animate-pulse border-2 border-white shadow-[0_0_20px_#ff0000]">⚠ RESTRICTED: FLOOR_154</div>
      </Html>
    </group>
  </group>
);

// --- GEOMETRY: Burj Al Arab (Sail Intercept) ---
const BurjAlArab = ({ onHack }: any) => (
  <group position={[-15, 0, 5]} rotation={[0, Math.PI/4, 0]} onClick={(e) => { e.stopPropagation(); onHack("ROYAL_SUITE_SIGINT"); }}>
    <mesh position={[0, 6, 0]}>
      <cylinderGeometry args={[0, 3.5, 12, 3]} />
      <meshBasicMaterial color="white" wireframe />
    </mesh>
    <mesh position={[0, 9, 1.8]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[1, 1, 0.1, 32]} />
      <meshBasicMaterial color={COLORS.gold} />
    </mesh>
    <Html position={[0, 14, 0]} distanceFactor={50}>
      <div className="text-[10px] text-white font-black border border-white/30 px-2 bg-black/80 uppercase">BURJ_AL_ARAB</div>
    </Html>
  </group>
);

// --- GEOMETRY: Bank of Emirates (NBD) ---
const BankNBD = ({ onHack }: any) => (
  <group position={[25, 0, -10]} onClick={(e) => { e.stopPropagation(); onHack("NBD_VAULT_CORE"); }}>
    <mesh position={[0, 4, 0]}>
      <boxGeometry args={[6, 8, 4]} />
      <meshBasicMaterial color={COLORS.gold} wireframe />
    </mesh>
    <Html position={[0, 10, 0]} distanceFactor={40}>
      <div className="text-[10px] text-yellow-500 font-black border-2 border-yellow-500 px-2 bg-black/90 tracking-widest">$ NBD_FINANCIAL_HUB</div>
    </Html>
  </group>
);

// --- ENVIRONMENT: Real Geospatial Setup ---
const Environment = () => (
  <group>
    {/* Real Coastline Separation */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 50]}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color={COLORS.ocean} metalness={0.9} roughness={0.1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, -50]}>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color={COLORS.land} />
    </mesh>
    <gridHelper args={[1000, 100, COLORS.blue, '#050505']} position={[0, -0.1, 0]} />
  </group>
);

// --- AGENTS: Lidar Thermal Tracking ---
const LidarAgent = ({ position, onInspect, type = 'CIVILIAN' }: any) => {
  const ref = useRef<THREE.Group>(null);
  const [speed] = useState(0.02 + Math.random() * 0.04);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.x += Math.sin(t * speed + position[0]) * 0.05;
    ref.current.position.z += Math.cos(t * speed + position[2]) * 0.05;
  });
  return (
    <group ref={ref} position={position} onClick={(e) => { e.stopPropagation(); onInspect(); }}>
      <mesh position={[0, 0.9, 0]}><capsuleGeometry args={[0.15, 0.6, 4, 8]} /><meshBasicMaterial color={type === 'VIP' ? COLORS.gold : "#fff"} wireframe /></mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]}><ringGeometry args={[0.4, 0.5, 16]} /><meshBasicMaterial color={COLORS.cyan} transparent opacity={0.5} /></mesh>
    </group>
  );
};

// --- MAIN SIMULATION: PROMETHEUS ENGINE ---
export const DubaiTacticalMap = () => {
  const { openWindow, updateWindow } = useWindowManager();
  const { addLog } = useTerminal();
  const [view, setView] = useState<'ORBIT' | 'DUBAI' | 'NYC' | 'AUH' | 'DOHA'>('ORBIT');
  const [crackedSats, setCrackedSats] = useState<string[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSatHack = (id: string, target: any) => {
    if (crackedSats.includes(id)) { setView(target); return; }
    updateWindow('terminal', { isOpen: true, title: `BREACHING_SATELLITE // ${id}` });
    openWindow('terminal');
    addLog(`[!] SIGNAL CAPTURED. INJECTING QUANTUM PAYLOAD INTO ${id}...`, 'warning');
    setTimeout(() => {
      setCrackedSats(prev => [...prev, id]);
      setView(target);
      addLog(`[SUCCESS] DOWNLINK ESTABLISHED. DESCENDING TO ${target}...`, 'success');
    }, 2500);
  };

  const handleInspect = (id: string, type: string = 'NODE') => {
    setSelected({ id, type });
    updateWindow('terminal', { isOpen: true });
    openWindow('terminal');
    addLog(`[SIGINT] TARGET_LOCKED: ${id}`, 'info');
    if (id.includes('FLOOR_154')) addLog(`[CRITICAL] ACCESSING SECURITY ENCLAVE`, 'error');
  };

  if (!mounted) return <div className="w-full h-full bg-black flex items-center justify-center text-neon-cyan font-mono tracking-[1em] animate-pulse">PROMETHEUS_CORE_INIT</div>;

  return (
    <div className="w-full h-full bg-black relative cursor-crosshair overflow-hidden pointer-events-auto">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <PerspectiveCamera makeDefault position={view === 'ORBIT' ? [0, 20, 35] : [0, 100, 100]} fov={35} />
        <MapControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={500} maxPolarAngle={Math.PI / 2.1} />
        <Stars radius={200} count={15000} factor={6} fade />
        <ambientLight intensity={0.4} />
        <pointLight position={[50, 100, 50]} intensity={2} color={COLORS.cyan} />

        {view === 'ORBIT' ? (
          <group rotation={[0, 0, 0.4]}>
            <mesh><sphereGeometry args={[10, 64, 64]} /><meshStandardMaterial color="#051030" metalness={1} /></mesh>
            <group position={[14, 2, 10]} onClick={() => handleSatHack('KH-11', 'DUBAI')}>
              <mesh><boxGeometry args={[1.5, 0.6, 1]} /><meshStandardMaterial color={crackedSats.includes('KH-11') ? '#0f0' : '#fff'} /></mesh>
              <Html distanceFactor={20} position={[0, 3, 0]}><div className="text-[10px] text-white font-black bg-black/90 p-2 border-2 border-neon-cyan animate-pulse">KH-11 [DUBAI]</div></Html>
            </group>
            <group position={[-14, 5, 12]} onClick={() => handleSatHack('SENTINEL', 'NYC')}>
              <mesh><boxGeometry args={[1.5, 0.6, 1]} /><meshStandardMaterial color={crackedSats.includes('SENTINEL') ? '#0f0' : '#fff'} /></mesh>
              <Html distanceFactor={20} position={[0, 3, 0]}><div className="text-[10px] text-white font-black bg-black/90 p-2 border-2 border-neon-cyan animate-pulse">SENTINEL-X [NYC]</div></Html>
            </group>
          </group>
        ) : (
          <group>
            <Environment />
            {view === 'DUBAI' && (
              <>
                <BurjKhalifa onHack={(id: string) => handleInspect(id, 'INFRASTRUCTURE')} />
                <BurjAlArab onHack={(id: string) => handleInspect(id, 'INFRASTRUCTURE')} />
                <PalmJumeirah onHack={(id: string) => handleInspect(id, 'RESIDENTIAL')} />
                <BankNBD onHack={(id: string) => handleInspect(id, 'FINANCIAL')} />
                {[...Array(50)].map((_, i) => (
                  <LidarAgent key={i} position={[(Math.random()-0.5)*150, 0, (Math.random()-0.5)*150]} onInspect={() => handleInspect(`HUMAN_${Math.random().toString(16).slice(2,6)}`, 'BIOMETRIC')} />
                ))}
              </>
            )}
          </group>
        )}

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.1} intensity={2} mipmapBlur radius={0.5} />
          <Scanline opacity={0.2} />
          <Noise opacity={0.05} />
          <Glitch delay={new THREE.Vector2(3, 10)} duration={new THREE.Vector2(0.1, 0.2)} strength={new THREE.Vector2(0.1, 0.1)} />
        </EffectComposer>
      </Canvas>

      {/* INTELLIGENCE HUD */}
      <div className="absolute top-6 left-6 font-mono pointer-events-none select-none">
        <div className="flex items-center gap-4 mb-2">
          <Globe size={32} className="text-neon-cyan" />
          <div className="text-3xl text-neon-cyan font-black tracking-[0.6em] shadow-[0_0_30px_#00F0FF]">GHOST_SIGINT_V21</div>
        </div>
        <div className="text-[10px] text-white/40 uppercase tracking-widest">Global Surveillance Downlink // {view} // SAT_LOCK: {crackedSats.length}</div>
        
        {view !== 'ORBIT' && (
          <button onClick={() => setView('ORBIT')} className="mt-8 px-8 py-3 border-2 border-red-500 text-red-500 text-[11px] font-black uppercase pointer-events-auto hover:bg-red-500/20 transition-all shadow-[0_0_40px_rgba(255,0,0,0.3)]">
            TERMINATE_UPLINK
          </button>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} className="absolute top-24 right-6 w-[400px] bg-black/95 border-l-4 border-neon-cyan p-8 font-mono z-[2000] shadow-2xl pointer-events-auto">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <div className="text-xl text-neon-cyan font-black tracking-widest italic uppercase">Target_Data // {selected.id}</div>
              <button onClick={() => setSelected(null)} className="text-white hover:text-red-500 transition-colors font-bold text-lg">X</button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/5 p-4 border-l-2 border-neon-cyan">
                <div className="text-[9px] text-white/40 mb-1 uppercase tracking-widest font-black">Biometric_Signature</div>
                <div className="flex items-center gap-4">
                  <Activity className="text-emerald-400 animate-pulse" />
                  <div className="text-lg font-black text-white">HR: 74 BPM // STABLE</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] text-neon-cyan font-black uppercase tracking-widest">Intercepted_Devices:</div>
                <div className="h-[250px] overflow-y-auto scrollbar-hide space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-900/80 p-4 border border-white/5 hover:border-emerald-500/50 transition-all">
                      <div className="flex items-center gap-4">
                        <Smartphone size={20} className="text-emerald-400" />
                        <div>
                          <div className="text-[11px] text-white font-black uppercase">Endpoint_{i+1}</div>
                          <div className="text-[9px] text-white/30 font-mono tracking-widest">{Array(6).fill(0).map(() => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':').toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-emerald-400 font-black">RSSI: -{Math.floor(Math.random()*40+50)}dBm</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="w-full mt-10 py-4 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 text-xs font-black hover:bg-emerald-500/30 uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(0,255,0,0.2)]">
              DOWNLOAD_ENCRYPTED_LOGS.ZIP
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40">
        <Crosshair size={120} className="text-neon-cyan" strokeWidth={0.5} />
      </div>
    </div>
  );
};