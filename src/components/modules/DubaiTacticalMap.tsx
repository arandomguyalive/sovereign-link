'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = {
  cyan: '#00D4E5',
  pink: '#FF53B2',
  purple: '#6B0098',
  grid: '#111111',
};

const BurjKhalifa = () => {
  const sections = [
    { radius: 1.5, height: 2, y: 1 },
    { radius: 1.2, height: 2, y: 3 },
    { radius: 0.9, height: 2, y: 5 },
    { radius: 0.6, height: 2, y: 7 },
    { radius: 0.3, height: 3, y: 9 },
    { radius: 0.05, height: 4, y: 12 },
  ];

  return (
    <group>
      {sections.map((s, i) => (
        <mesh key={i} position={[0, s.y, 0]}>
          <cylinderGeometry args={[s.radius * 0.8, s.radius, s.height, 6]} />
          <meshBasicMaterial color={COLORS.cyan} wireframe opacity={0.3} transparent />
        </mesh>
      ))}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
        <meshBasicMaterial color={COLORS.pink} />
        <pointLight color={COLORS.pink} intensity={2} distance={5} />
      </mesh>
    </group>
  );
};

const PalmJumeirah = () => {
  return (
    <group position={[0, -0.5, 5]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[1, 5]} />
        <meshBasicMaterial color={COLORS.cyan} wireframe opacity={0.2} transparent />
      </mesh>
      {[...Array(8)].map((_, i) => (
        <group key={i} position={[0, i * 0.6 + 1, 0]}>
          <mesh rotation={[0, 0, Math.PI / 4]} position={[1.5, 0, 0]}>
            <planeGeometry args={[3, 0.1]} />
            <meshBasicMaterial color={COLORS.cyan} wireframe opacity={0.2} transparent />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]} position={[-1.5, 0, 0]}>
            <planeGeometry args={[3, 0.1]} />
            <meshBasicMaterial color={COLORS.cyan} wireframe opacity={0.2} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const HackingNode = ({ position, type, label, onHack }: any) => {
  const [hovered, setHovered] = useState(false);
  const [hacked, setHacked] = useState(false);

  return (
    <group position={position}>
      <mesh 
        onPointerOver={() => setHovered(true)} 
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (!hacked) onHack(label);
          setHacked(true);
        }}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={hacked ? '#10b981' : (hovered ? COLORS.pink : (type === 'WIFI' ? '#3b82f6' : COLORS.pink))} />
      </mesh>
      {(hovered || hacked) && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Text position={[0, 0.4, 0]} fontSize={0.15} color="white">
            {`${label}\n${hacked ? '[ACCESS GRANTED]' : '[LOCKED]'}`}
          </Text>
        </Float>
      )}
      <mesh scale={hovered ? 1.5 : 1}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={hacked ? '#10b981' : COLORS.cyan} wireframe opacity={0.1} transparent />
      </mesh>
    </group>
  );
};

const CrowdSim = () => {
  const count = 100;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({ t: Math.random() * 100, speed: 0.01 + Math.random() / 200, radius: 2 + Math.random() * 8 });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    particles.forEach((p, i) => {
      p.t += p.speed;
      dummy.position.set(Math.cos(p.t) * p.radius, 0, Math.sin(p.t) * p.radius);
      dummy.scale.set(0.05, 0.05, 0.05);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.4} />
    </instancedMesh>
  );
};

export const DubaiTacticalMap = () => {
  const [lastHack, setLastHack] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-black" />;

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair pointer-events-auto">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-neon-cyan animate-pulse font-mono text-xs">INITIALIZING_3D_GRID...</div>}>
        <Canvas shadows camera={{ position: [10, 10, 15], fov: 50 }}>
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={5}
            maxDistance={30}
          />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color={COLORS.cyan} />
          <gridHelper args={[100, 50, COLORS.purple, COLORS.grid]} position={[0, -0.1, 0]} />
          <group>
            <BurjKhalifa />
            <PalmJumeirah />
            <CrowdSim />
            <HackingNode position={[0, 10, 0]} type="SERVER" label="BURJ_CORE_154" onHack={setLastHack} />
            <HackingNode position={[2, 0, 6]} type="WIFI" label="PALM_RES_WIFI_08" onHack={setLastHack} />
            <HackingNode position={[-2, 0, 8]} type="CAM" label="JBR_SURVEILLANCE_04" onHack={setLastHack} />
            <HackingNode position={[4, 0, 4]} type="WIFI" label="DUBAI_MALL_GUEST" onHack={setLastHack} />
          </group>
        </Canvas>
      </Suspense>

      <div className="absolute top-4 left-4 pointer-events-none font-mono">
        <div className="text-[10px] text-neon-cyan font-black tracking-[0.5em] mb-1">TACTICAL_MAP_V1.0</div>
        <div className="text-[8px] text-white/40 uppercase">Region: Dubai Central Hub</div>
        {lastHack && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mt-4 bg-emerald-500/10 border-l-2 border-emerald-500 p-2">
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Uplink_Established</div>
            <div className="text-[8px] text-white/60 uppercase">Node: {lastHack}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
};