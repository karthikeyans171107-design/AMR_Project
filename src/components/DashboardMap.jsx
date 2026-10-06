import React from 'react';
import { useAMR, DESTINATIONS, INITIAL_OBSTACLES } from '../context/AMRContext';
import { MapPin } from 'lucide-react';

export default function DashboardMap() {
  const { robotPos, destinationKey, pathPoints, hasObstacle, mission, eStopActive, status } = useAMR();

  const currentDest = DESTINATIONS[destinationKey] || DESTINATIONS['Station B'];
  const dx = currentDest.x - robotPos.x;
  const dy = currentDest.y - robotPos.y;
  const distanceMeters = (Math.sqrt(dx * dx + dy * dy) * 0.25).toFixed(1);

  const formatEta = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm leading-tight">Navigation Map</h3>
          <p className="text-[11px] text-slate-500">Live robot location</p>
        </div>
      </div>

      {/* Compact SVG Map */}
      <div className="relative w-full h-[200px] rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px]" />

        <svg className="w-full h-full relative z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.8" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.8" />

          {/* Route path */}
          {pathPoints.length >= 2 && (
            <polyline
              points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={hasObstacle ? '#f59e0b' : '#38bdf8'}
              strokeWidth="1.2"
              strokeDasharray={hasObstacle ? '2,1' : 'none'}
            />
          )}

          {/* Destinations */}
          {Object.keys(DESTINATIONS).map((key) => {
            const dest = DESTINATIONS[key];
            const isTarget = key === destinationKey;
            return (
              <g key={key} transform={`translate(${dest.x}, ${dest.y})`}>
                <circle r={isTarget ? 3 : 1.8} fill={isTarget ? '#0284c7' : '#475569'}
                  className={isTarget ? 'animate-pulse' : ''} />
                <text x="0" y="-3.5" textAnchor="middle" fill={isTarget ? '#38bdf8' : '#64748b'} fontSize="2.6" fontWeight={isTarget ? 'bold' : 'normal'}>
                  {key}
                </text>
              </g>
            );
          })}

          {/* Obstacles */}
          {INITIAL_OBSTACLES.map((obs) => (
            <g key={obs.id} transform={`translate(${obs.x}, ${obs.y})`}>
              <rect x="-2" y="-2" width="4" height="4" fill="#f59e0b" opacity="0.9" rx="0.4" />
            </g>
          ))}

          {/* Robot marker */}
          <g transform={`translate(${robotPos.x}, ${robotPos.y}) rotate(${robotPos.angle})`}>
            <circle r="6" fill="none" stroke="#38bdf8" strokeWidth="0.3" opacity="0.3" className="animate-ping" />
            <rect x="-2" y="-2.5" width="4" height="5.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.5" rx="0.8" />
            <polygon points="0,-3.5 -1.2,-2 1.2,-2" fill="#38bdf8" />
            <circle r="0.7" cy="0" fill={eStopActive ? '#ef4444' : hasObstacle ? '#f59e0b' : '#22c55e'} />
          </g>
        </svg>
      </div>

      {/* Status row */}
      <div className="grid grid-cols-3 gap-2 mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
        <div>
          <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Distance</div>
          <div className="text-sm font-extrabold text-slate-800 mt-0.5">{distanceMeters} m</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400">ETA</div>
          <div className="text-sm font-extrabold font-mono text-cyan-700 mt-0.5">{formatEta(mission.etaSeconds)}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Status</div>
          <div className={`text-xs font-extrabold mt-0.5 ${status === 'MOVING' ? 'text-emerald-600' : 'text-slate-500'}`}>{status}</div>
        </div>
      </div>
    </div>
  );
}
