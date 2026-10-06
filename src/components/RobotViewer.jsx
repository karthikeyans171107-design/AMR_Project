import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, RoundedBox, Html } from '@react-three/drei';
import { useAMR } from '../context/AMRContext';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Maximize2, ShieldAlert, Cpu } from 'lucide-react';

// 3D AMR Robot Sub-Component
function AMRModel() {
  const { status, mode, speed, eStopActive, hasObstacle } = useAMR();
  const robotGroupRef = useRef();
  const wheelsRef = useRef([]);
  const lidarRef = useRef();

  // Animation frame loop for wheels spinning & LiDAR rotating
  useFrame((state, delta) => {
    // Spin LiDAR dome continuously
    if (lidarRef.current) {
      lidarRef.current.rotation.y += delta * 4;
    }

    // Spin wheels when AMR is moving
    if (status === 'MOVING' && !eStopActive) {
      const wheelRotation = delta * (speed * 5);
      wheelsRef.current.forEach(wheel => {
        if (wheel) wheel.rotation.x += wheelRotation;
      });

      // Subtle chassis bounce when moving
      if (robotGroupRef.current) {
        robotGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.03;
      }
    } else {
      if (robotGroupRef.current) {
        robotGroupRef.current.position.y = 0;
      }
    }
  });

  // Determine LED status indicator color
  let ledColor = '#22c55e'; // Green AUTO / Safe
  if (eStopActive) ledColor = '#ef4444'; // Red E-Stop
  else if (hasObstacle) ledColor = '#eab308'; // Yellow Obstacle Warning
  else if (mode === 'MANUAL') ledColor = '#3b82f6'; // Blue Manual

  return (
    <group ref={robotGroupRef} position={[0, 0, 0]}>
      {/* Main Chassis / Rectangular Body */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.45, 1.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Top Metallic Deck Surface */}
      <mesh position={[0, 0.69, 0]} receiveShadow>
        <boxGeometry args={[1.7, 0.05, 1.1]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Front Direction Marker (Cyan Arrow / Strip) */}
      <mesh position={[0.8, 0.72, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.4]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>

      {/* Front LiDAR Sensor Base */}
      <mesh position={[0.65, 0.78, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.12, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} />
      </mesh>

      {/* Spinning LiDAR Dome Sensor */}
      <group position={[0.65, 0.88, 0]} ref={lidarRef}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 0.1, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Laser Emitter Beam Indicator */}
        <mesh position={[0.08, 0, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.04]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* LED Status Light Bar */}
      <mesh position={[-0.85, 0.6, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.8]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={1.2} />
      </mesh>
      
      {/* Front LED Status Spot */}
      <mesh position={[0.91, 0.5, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={ledColor} emissive={ledColor} emissiveIntensity={1.5} />
      </mesh>

      {/* Top Payload Container / Equipment Box */}
      <mesh position={[-0.2, 0.95, 0]} castShadow>
        <boxGeometry args={[0.9, 0.45, 0.8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>
      <mesh position={[-0.2, 1.18, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.6]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Safety Bumper Guards */}
      <mesh position={[0.92, 0.3, 0]}>
        <boxGeometry args={[0.06, 0.18, 1.25]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.6} />
      </mesh>
      <mesh position={[-0.92, 0.3, 0]}>
        <boxGeometry args={[0.06, 0.18, 1.25]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.6} />
      </mesh>

      {/* Four Heavy-Duty AMR Wheels */}
      {[
        [0.55, 0.25, 0.65],   // Front Right
        [0.55, 0.25, -0.65],  // Front Left
        [-0.55, 0.25, 0.65],  // Rear Right
        [-0.55, 0.25, -0.65]  // Rear Left
      ].map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh
            ref={el => (wheelsRef.current[idx] = el)}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.25, 0.25, 0.15, 32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Wheel Rim Cap */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.16, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Ground Grid Shadows */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} opacity={0.4} transparent />
      </mesh>
    </group>
  );
}

// 3D Canvas Scene Wrapper with Controls & Camera
export default function RobotViewer() {
  const { status, mode, speed, eStopActive } = useAMR();
  const controlsRef = useRef();
  const [cameraZoom, setCameraZoom] = useState(1);
  const [viewPreset, setViewPreset] = useState('ISO'); // ISO | TOP | FRONT

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.multiplyScalar(0.8);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.multiplyScalar(1.25);
      controlsRef.current.update();
    }
  };

  const handleResetView = (preset = 'ISO') => {
    setViewPreset(preset);
    if (!controlsRef.current) return;

    if (preset === 'ISO') {
      controlsRef.current.object.position.set(3.5, 2.5, 3.5);
    } else if (preset === 'TOP') {
      controlsRef.current.object.position.set(0, 5, 0.01);
    } else if (preset === 'FRONT') {
      controlsRef.current.object.position.set(4, 1, 0);
    }
    controlsRef.current.target.set(0, 0.4, 0);
    controlsRef.current.update();
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 flex flex-col h-full relative overflow-hidden group">
      {/* Title & Top Info Header */}
      <div className="flex items-center justify-between mb-3 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 text-base leading-tight">3D Robot View</h2>
            <p className="text-xs text-slate-500">Real-time CAD Telemetry Model</p>
          </div>
        </div>

        {/* Status Pill Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
            eStopActive 
              ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm'
              : status === 'MOVING' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              eStopActive ? 'bg-red-600 animate-ping' : status === 'MOVING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`} />
            {eStopActive ? 'E-STOPPED' : status === 'MOVING' ? `MOVING (${speed} m/s)` : 'READY / IDLE'}
          </span>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative w-full h-[320px] lg:h-[360px] rounded-xl bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 border border-slate-200/80 overflow-hidden">
        <Canvas shadows className="w-full h-full cursor-grab active:cursor-grabbing">
          <PerspectiveCamera makeDefault position={[3.5, 2.5, 3.5]} fov={45} />
          <OrbitControls 
            ref={controlsRef} 
            enablePan={true}
            enableZoom={true} 
            minDistance={2} 
            maxDistance={8} 
            target={[0, 0.4, 0]}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <pointLight position={[-3, 4, -3]} intensity={0.5} />
          <spotLight position={[0, 6, 0]} intensity={0.4} angle={0.6} penumbra={1} />

          {/* Warehouse Floor Grid */}
          <gridHelper args={[20, 20, '#94a3b8', '#cbd5e1']} position={[0, 0, 0]} />

          {/* 3D AMR Robot */}
          <AMRModel />
        </Canvas>

        {/* Controls Overlay Bar (Zoom In, Zoom Out, Camera Views) */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/80 shadow-md z-10">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 mx-1" />

          <button
            onClick={() => handleResetView('ISO')}
            title="Isometric View"
            className={`px-2 py-1 text-xs font-medium rounded-lg transition ${
              viewPreset === 'ISO' ? 'bg-cyan-500 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            3D Iso
          </button>
          <button
            onClick={() => handleResetView('TOP')}
            title="Top-Down View"
            className={`px-2 py-1 text-xs font-medium rounded-lg transition ${
              viewPreset === 'TOP' ? 'bg-cyan-500 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => handleResetView('FRONT')}
            title="Front View"
            className={`px-2 py-1 text-xs font-medium rounded-lg transition ${
              viewPreset === 'FRONT' ? 'bg-cyan-500 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            Front
          </button>

          <button
            onClick={() => handleResetView('ISO')}
            title="Reset Orientation"
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Drag Hint Overlay */}
        <div className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg pointer-events-none flex items-center gap-1.5 shadow-sm">
          <span>💡 Click & Drag to rotate 3D view</span>
        </div>
      </div>
    </div>
  );
}
