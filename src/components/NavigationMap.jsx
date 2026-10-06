import React from 'react';
import { useAMR, DESTINATIONS, INITIAL_OBSTACLES } from '../context/AMRContext';
import { Map, Navigation, ShieldAlert, Zap, Compass, RefreshCw } from 'lucide-react';

export default function NavigationMap() {
  const {
    robotPos,
    destinationKey,
    setDestinationKey,
    startNavigation,
    triggerSimulateObstacle,
    pathPoints,
    hasObstacle,
    status,
    eStopActive
  } = useAMR();

  const currentDest = DESTINATIONS[destinationKey];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 text-base leading-tight">2D Navigation Map</h2>
            <p className="text-xs text-slate-500">Autonomous Warehouse Floor Plan</p>
          </div>
        </div>

        {/* Action Controls & Destination Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={destinationKey}
            onChange={(e) => setDestinationKey(e.target.value)}
            disabled={status === 'MOVING'}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer disabled:opacity-50"
          >
            {Object.keys(DESTINATIONS).map((key) => (
              <option key={key} value={key}>
                🎯 {DESTINATIONS[key].name}
              </option>
            ))}
          </select>

          <button
            onClick={startNavigation}
            disabled={status === 'MOVING' || eStopActive}
            className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Navigation className="w-3.5 h-3.5 fill-white" />
            Start Navigation
          </button>

          <button
            onClick={triggerSimulateObstacle}
            disabled={status !== 'MOVING' || eStopActive}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 shadow-sm transition active:scale-95 disabled:opacity-40"
            title="Trigger dynamic obstacle for AI Smart Rerouting"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Simulate Obstacle
          </button>
        </div>
      </div>

      {/* Interactive 2D Map Canvas SVG */}
      <div className="relative w-full h-[320px] lg:h-[360px] rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner flex-1">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Warehouse Zone Labels */}
        <div className="absolute top-3 left-4 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
          ZONE A (Assembly)
        </div>
        <div className="absolute top-3 right-4 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
          ZONE B (Packaging)
        </div>
        <div className="absolute bottom-3 left-4 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
          POWER HUB (Charging)
        </div>
        <div className="absolute bottom-3 right-4 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
          ZONE C (Storage)
        </div>

        {/* Map SVG Layer */}
        <svg className="w-full h-full relative z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Warehouse Aisle Markings */}
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" rx="2" />
          <line x1="50" y1="5" x2="50" y2="95" stroke="#1e293b" strokeWidth="0.8" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="#1e293b" strokeWidth="0.8" />

          {/* Planned Trajectory / Path Line */}
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

          {/* Station Markers */}
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
                <circle
                  r={isTarget ? 6 : 0}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="0.4"
                  opacity="0.6"
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

          {/* Obstacles */}
          {INITIAL_OBSTACLES.map((obs) => (
            <g key={obs.id} transform={`translate(${obs.x}, ${obs.y})`}>
              <rect x="-3" y="-3" width="6" height="6" fill="#f59e0b" opacity="0.8" rx="0.5" />
              <text x="0" y="5.5" textAnchor="middle" fill="#fbbf24" fontSize="2.2">
                ⚠️ {obs.label}
              </text>
            </g>
          ))}

          {/* Dynamic Reroute Obstacle (if triggered) */}
          {hasObstacle && (
            <g transform="translate(40, 50)">
              <circle r="5" fill="#ef4444" opacity="0.3" className="animate-ping" />
              <circle r="3" fill="#ef4444" />
              <text x="0" y="-4" textAnchor="middle" fill="#fca5a5" fontSize="2.5" fontWeight="bold">
                ⚠️ OBSTACLE!
              </text>
            </g>
          )}

          {/* AMR Robot Marker 🤖 */}
          <g transform={`translate(${robotPos.x}, ${robotPos.y}) rotate(${robotPos.angle})`}>
            {/* Sensor Radar Pulse Circle */}
            <circle r="8" fill="none" stroke="#38bdf8" strokeWidth="0.3" opacity="0.3" className="animate-ping" />
            <circle r="4" fill="#0284c7" opacity="0.4" />
            
            {/* Robot Chassis Representation */}
            <rect x="-2.5" y="-3.5" width="5" height="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.5" rx="1" />
            {/* Direction Pointer */}
            <polygon points="0,-4.5 -1.5,-2.5 1.5,-2.5" fill="#38bdf8" />
            
            {/* Status Dot */}
            <circle r="0.8" cy="0" fill={eStopActive ? '#ef4444' : hasObstacle ? '#f59e0b' : '#22c55e'} />
          </g>
        </svg>

        {/* Legend Overlay at Bottom */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> AMR Robot 🤖
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Target Destination
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-md bg-amber-500" /> Obstacle
            </span>
          </div>

          <span className="font-mono text-cyan-400 font-semibold">
            X: {robotPos.x.toFixed(1)}m | Y: {robotPos.y.toFixed(1)}m
          </span>
        </div>
      </div>
    </div>
  );
}
