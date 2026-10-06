import React from 'react';
import { useAMR } from '../context/AMRContext';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';

export default function LocationSelector() {
  const { destinationKey, setGoalAndSyncRoute } = useAMR();

  const locations = [
    { key: 'Home Base', label: 'Home Base', coords: '1.5m, 2.3m', zone: 'Docking' },
    { key: 'Charging Station', label: 'Charging Station', coords: '4.8m, 1.2m', zone: 'Power Hub' },
    { key: 'Station A', label: 'Station A', coords: '8.2m, 4.6m', zone: 'Zone A' },
    { key: 'Station B', label: 'Station B', coords: '10.5m, 6.1m', zone: 'Zone B' },
    { key: 'Storage Area', label: 'Storage Area', coords: '7.1m, 8.3m', zone: 'Zone C' }
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-600" />
          <h2 className="font-bold text-slate-800 text-xs tracking-wider uppercase">
            LOCATION / DESTINATION
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-slate-500 font-medium">Selected Destination:</span>
          <span className="font-black text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-lg font-mono">
            {destinationKey}
          </span>
          <button
            onClick={() => setGoalAndSyncRoute(destinationKey)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-[11px] px-3 py-1 rounded-lg transition active:scale-95 shadow-xs flex items-center gap-1"
          >
            <Navigation className="w-3 h-3" /> SET GOAL
          </button>
        </div>
      </div>

      {/* Selectable location cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {locations.map((loc) => {
          const isSelected = destinationKey === loc.key;
          return (
            <button
              key={loc.key}
              onClick={() => setGoalAndSyncRoute(loc.key)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-50/70 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{loc.zone}</span>
                {isSelected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                )}
              </div>
              <div className="text-xs font-black text-slate-800 tracking-tight">
                {loc.label}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {loc.coords}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
