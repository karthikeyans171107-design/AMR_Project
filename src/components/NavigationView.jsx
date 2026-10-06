import React, { useState, useEffect } from 'react';
import { useAMR, DESTINATIONS, INITIAL_OBSTACLES } from '../context/AMRContext';
import {
  Navigation,
  Gamepad2,
  Cpu,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  XCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react';

export default function NavigationView() {
  const {
    isRobotConnected,
    mode,
    setMode,
    status,
    speed,
    setSpeed,
    targetSpeed,
    setTargetSpeed,
    robotPos,
    destinationKey,
    setDestinationKey,
    startNavigation,
    pauseNavigation,
    cancelMission,
    stopRobot,
    handleManualMove,
    pathPoints,
    hasObstacle,
    mission,
    aiNavStatus,
    eStopActive
  } = useAMR();

  // Local map zoom scale state for small controls [+], [-], [Reset]
  const [zoomScale, setZoomScale] = useState(1);
  const [viewCenter, setViewCenter] = useState({ x: 50, y: 50 });

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.25, 2.0));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.25, 0.75));
  const handleResetMap = () => {
    setZoomScale(1);
    setViewCenter({ x: 50, y: 50 });
  };

  // Keyboard shortcut listener for arrow keys when in MANUAL mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode !== 'MANUAL') return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleManualMove('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleManualMove('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleManualMove('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleManualMove('RIGHT');
      } else if (e.code === 'Space') {
        e.preventDefault();
        stopRobot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, handleManualMove, stopRobot]);

  // Calculate distance in meters to current target
  const currentDest = DESTINATIONS[destinationKey] || DESTINATIONS['Station B'];
  const dx = currentDest.x - robotPos.x;
  const dy = currentDest.y - robotPos.y;
  const distanceMeters = (Math.sqrt(dx * dx + dy * dy) * 0.25).toFixed(1);

  // Format ETA timer mm:ss
  const formatEta = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP OF PAGE HEADER */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-soft border border-slate-100">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Navigation className="w-6 h-6 text-cyan-600" />
            Navigation
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Control the AMR and plan its movement
          </p>
        </div>

        {/* Top Right Connection Status */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isRobotConnected ? 'bg-emerald-400' : 'bg-rose-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isRobotConnected ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />
          </span>
          <span>{isRobotConnected ? 'Robot Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* MAIN 2-COLUMN LAYOUT (LEFT 40% / RIGHT 60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: MANUAL CONTROL + AUTO NAVIGATION (lg:col-span-5 ~41.6%) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CARD 1 — MANUAL CONTROL */}
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-slate-900 text-base leading-tight flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-cyan-600" />
                    Manual Control
                  </h2>
                  <p className="text-xs text-slate-500">Drive the robot manually</p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  mode === 'MANUAL' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {mode === 'MANUAL' ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>

              {/* Directional D-Pad Controller */}
              <div className="my-3 flex flex-col items-center justify-center">
                <div className="grid grid-cols-3 gap-2 w-44">
                  <div />
                  <button
                    onClick={() => handleManualMove('UP')}
                    disabled={eStopActive}
                    className="w-13 h-13 py-2 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex flex-col items-center justify-center text-slate-700 font-bold shadow-sm transition transform active:scale-95 disabled:opacity-40"
                    title="Forward (W / Up)"
                  >
                    <ArrowUp className="w-5 h-5" />
                    <span className="text-[9px]">Forward</span>
                  </button>
                  <div />

                  <button
                    onClick={() => handleManualMove('LEFT')}
                    disabled={eStopActive}
                    className="w-13 h-13 py-2 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex flex-col items-center justify-center text-slate-700 font-bold shadow-sm transition transform active:scale-95 disabled:opacity-40"
                    title="Turn Left (A / Left)"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={stopRobot}
                    disabled={eStopActive}
                    className="w-13 h-13 py-2 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 flex items-center justify-center text-red-700 font-black shadow-sm transition transform active:scale-95 text-xs disabled:opacity-40"
                    title="Soft Stop (Spacebar)"
                  >
                    STOP
                  </button>

                  <button
                    onClick={() => handleManualMove('RIGHT')}
                    disabled={eStopActive}
                    className="w-13 h-13 py-2 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex flex-col items-center justify-center text-slate-700 font-bold shadow-sm transition transform active:scale-95 disabled:opacity-40"
                    title="Turn Right (D / Right)"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <div />
                  <button
                    onClick={() => handleManualMove('DOWN')}
                    disabled={eStopActive}
                    className="w-13 h-13 py-2 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex flex-col items-center justify-center text-slate-700 font-bold shadow-sm transition transform active:scale-95 disabled:opacity-40"
                    title="Backward (S / Down)"
                  >
                    <ArrowDown className="w-5 h-5" />
                    <span className="text-[9px]">Backward</span>
                  </button>
                  <div />
                </div>
              </div>

              {/* Speed Control Section */}
              <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Speed</span>
                  <span className="text-sm font-extrabold text-cyan-700 font-mono">
                    {targetSpeed.toFixed(1)} m/s
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="2.0"
                  step="0.1"
                  value={targetSpeed}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTargetSpeed(val);
                    setSpeed(val);
                  }}
                  className="w-full accent-cyan-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                />

                <div className="flex justify-between text-xs text-slate-400 mt-1.5 font-medium">
                  <span>0 m/s</span>
                  <span>2.0 m/s</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              💡 Manual controls only control the simulated robot.
            </p>
          </div>

          {/* CARD 2 — AUTO NAVIGATION */}
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-slate-900 text-base leading-tight flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-cyan-600" />
                    Auto Navigation
                  </h2>
                  <p className="text-xs text-slate-500">Let the AI plan the route</p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  mode === 'AUTO' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {mode === 'AUTO' ? 'AI ACTIVE' : 'IDLE'}
                </span>
              </div>

              {/* Destination Dropdown */}
              <div className="mb-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Destination
                </label>
                <select
                  value={destinationKey}
                  onChange={(e) => setDestinationKey(e.target.value)}
                  disabled={status === 'MOVING'}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer disabled:opacity-50"
                >
                  {Object.keys(DESTINATIONS).map((key) => (
                    <option key={key} value={key}>
                      📍 {DESTINATIONS[key].name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Navigation Button */}
              <button
                onClick={startNavigation}
                disabled={status === 'MOVING' || eStopActive}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Navigation
              </button>

              {/* AI Status Message Row */}
              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 mb-1">
                  AI Status
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span className={`w-2 h-2 rounded-full ${
                    status === 'MOVING' ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500'
                  }`} />
                  <span>{aiNavStatus}</span>
                </div>
              </div>
            </div>

            {/* Pause / Cancel Mission Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={pauseNavigation}
                disabled={status === 'IDLE' || eStopActive}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-40"
              >
                <Pause className="w-3.5 h-3.5" />
                {status === 'PAUSED' ? 'Resume' : 'Pause Mission'}
              </button>

              <button
                onClick={cancelMission}
                disabled={status === 'IDLE' || eStopActive}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-40"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel Mission
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COMPACT NAVIGATION MAP + MAP INFO + MISSION PROGRESS (lg:col-span-7 ~58.3%) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* COMPACT NAVIGATION MAP CARD */}
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-slate-900 text-base leading-tight flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  Navigation Map
                </h2>
                <p className="text-xs text-slate-500">Live robot location and route</p>
              </div>

              {/* Small Controls: [+], [-], [Reset] */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-700 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-700 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetMap}
                  className="px-2 py-0.5 text-[11px] font-semibold hover:bg-slate-200 rounded-lg text-slate-700 transition"
                  title="Reset View"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* 2D Compact Map Canvas SVG Container */}
            <div className="relative w-full h-[280px] lg:h-[300px] rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

              <svg
                className="w-full h-full relative z-10 transition-transform duration-300"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ transform: `scale(${zoomScale})` }}
              >
                {/* Warehouse Grid Aisles */}
                <rect x="5" y="5" width="90" height="90" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" rx="2" />
                <line x1="50" y1="5" x2="50" y2="95" stroke="#1e293b" strokeWidth="0.8" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="#1e293b" strokeWidth="0.8" />

                {/* Planned Route Line */}
                {pathPoints.length >= 2 && (
                  <polyline
                    points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={hasObstacle ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="1.2"
                    strokeDasharray={hasObstacle ? '2,1' : 'none'}
                    className="transition-all duration-300"
                  />
                )}

                {/* Destinations */}
                {Object.keys(DESTINATIONS).map((key) => {
                  const dest = DESTINATIONS[key];
                  const isTarget = key === destinationKey;
                  return (
                    <g key={key} transform={`translate(${dest.x}, ${dest.y})`}>
                      <circle
                        r={isTarget ? 3.5 : 2}
                        fill={isTarget ? '#0284c7' : '#475569'}
                        className={isTarget ? 'animate-pulse' : ''}
                      />
                      <text
                        x="0"
                        y="-4"
                        textAnchor="middle"
                        fill={isTarget ? '#38bdf8' : '#94a3b8'}
                        fontSize="2.8"
                        fontWeight={isTarget ? 'bold' : 'normal'}
                      >
                        {key}
                      </text>
                    </g>
                  );
                })}

                {/* 2-3 Obstacles 🚧 */}
                {INITIAL_OBSTACLES.map((obs) => (
                  <g key={obs.id} transform={`translate(${obs.x}, ${obs.y})`}>
                    <rect x="-2.5" y="-2.5" width="5" height="5" fill="#f59e0b" opacity="0.8" rx="0.5" />
                    <text x="0" y="4.5" textAnchor="middle" fill="#fbbf24" fontSize="2.2">
                      🚧
                    </text>
                  </g>
                ))}

                {/* Robot Position Marker 🤖 */}
                <g transform={`translate(${robotPos.x}, ${robotPos.y}) rotate(${robotPos.angle})`}>
                  <circle r="7" fill="none" stroke="#38bdf8" strokeWidth="0.3" opacity="0.3" className="animate-ping" />
                  <rect x="-2.5" y="-3.5" width="5" height="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.5" rx="1" />
                  <polygon points="0,-4.5 -1.5,-2.5 1.5,-2.5" fill="#38bdf8" />
                  <circle r="0.8" cy="0" fill={eStopActive ? '#ef4444' : hasObstacle ? '#f59e0b' : '#22c55e'} />
                </g>
              </svg>
            </div>

            {/* MAP INFORMATION STATUS ROW */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Distance</div>
                <div className="text-sm font-extrabold text-slate-800 mt-0.5">{distanceMeters} m</div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">ETA</div>
                <div className="text-sm font-extrabold font-mono text-cyan-700 mt-0.5">{formatEta(mission.etaSeconds)}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Current</div>
                <div className="text-sm font-extrabold text-emerald-600 mt-0.5">{status}</div>
              </div>
            </div>
          </div>

          {/* COMPACT MISSION PROGRESS CARD */}
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-900 text-sm">Current Mission</h2>
              <span className="text-xs font-extrabold text-cyan-700">{mission.progress}%</span>
            </div>

            <div className="text-xs font-bold text-slate-700 mb-3">
              Deliver package to {destinationKey}
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60 p-0.5 mb-3">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${mission.progress}%` }}
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span className={`w-2 h-2 rounded-full ${
                status === 'MOVING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`} />
              <span>Status: {status === 'MOVING' ? `Moving to ${destinationKey}` : 'Ready'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
