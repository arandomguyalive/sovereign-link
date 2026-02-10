'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Smartphone, Laptop, Database, Router, ShieldAlert } from 'lucide-react';

const NODES = [
  { id: 'gw', type: 'router', ip: '192.168.1.1', label: 'Gateway', x: 250, y: 150 },
  { id: 'mb', type: 'database', ip: '192.168.1.5', label: 'Mainframe', x: 100, y: 50 },
  { id: 'pc1', type: 'laptop', ip: '192.168.1.12', label: 'Workstation-01', x: 100, y: 250 },
  { id: 'ph1', type: 'smartphone', ip: '192.168.1.45', label: 'iPhone-Sovereign', x: 400, y: 50 },
  { id: 'cam1', type: 'camera', ip: '192.168.1.102', label: 'IOT-CAM-04', x: 400, y: 250, vulnerable: true },
];

export const NetworkMap = () => {
  return (
    <div className="h-full bg-black/90 p-4 flex flex-col items-center justify-center relative overflow-hidden">
      <svg className="w-full h-full max-w-[500px] max-h-[300px]">
        {/* Connection Lines */}
        {NODES.filter(n => n.id !== 'gw').map((node) => (
          <motion.line
            key={`line-${node.id}`}
            x1={250} y1={150}
            x2={node.x} y2={node.y}
            stroke="rgba(0, 212, 229, 0.2)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        ))}

        {/* Nodes */}
        {NODES.map((node) => (
          <g key={node.id}>
            <motion.circle
              cx={node.x} cy={node.y} r="20"
              fill="rgba(0, 0, 0, 0.8)"
              stroke={node.vulnerable ? '#FF53B2' : '#00D4E5'}
              strokeWidth="1"
              whileHover={{ scale: 1.1, strokeWidth: 2 }}
              className="cursor-pointer"
            />
            <foreignObject x={node.x - 10} y={node.y - 10} width="20" height="20">
              <div className="w-full h-full flex items-center justify-center pointer-events-none">
                {node.type === 'router' && <Router size={12} className="text-neon-cyan" />}
                {node.type === 'database' && <Database size={12} className="text-neon-cyan" />}
                {node.type === 'laptop' && <Laptop size={12} className="text-neon-cyan" />}
                {node.type === 'smartphone' && <Smartphone size={12} className="text-neon-cyan" />}
                {node.type === 'camera' && <ShieldAlert size={12} className={node.vulnerable ? 'text-neon-pink' : 'text-neon-cyan'} />}
              </div>
            </foreignObject>
            
            <text 
              x={node.x} y={node.y + 35} 
              textAnchor="middle" 
              className="fill-neon-cyan/60 text-[8px] font-mono uppercase tracking-tighter"
            >
              {node.label}
            </text>
            <text 
              x={node.x} y={node.y + 45} 
              textAnchor="middle" 
              className="fill-white/30 text-[7px] font-mono"
            >
              {node.ip}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-cyan" />
          <span className="text-[8px] text-neon-cyan/60 uppercase">Secure Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
          <span className="text-[8px] text-neon-pink uppercase">Vulnerability Detected</span>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 text-[8px] text-neon-cyan/40 font-mono text-right">
        MAP_PROTOCOL: ARPV4<br/>
        SCAN_ENGINE: SOVEREIGN_CORE_v1
      </div>
    </div>
  );
};
