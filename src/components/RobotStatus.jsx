import React from 'react';
import { useAMR } from '../context/AMRContext';
import { BatteryCharging, Gauge, Zap, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function RobotStatus() {
  const { battery, speed, status, mode, location, eStopActive } = useAMR();

  // Color styling based on battery status
  const getBatteryColor = (level) => {
    if (level > 50) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', bar: 'bg-emerald-500' };
    if (level > 20) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', bar: 'bg-amber-500' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', bar: 'bg-rose-500' };
  };

  const batColor = getBatteryColor(battery);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. BATTERY CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col justify-between hover:shadow-md transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Battery</span>
          <div className={`w-9 h-9 rounded-xl ${batColor.bg} ${batColor.border} border flex items-center justify-center ${batColor.text}`}>
            <BatteryCharging className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{battery}%</span>
            <span className="text-xs text-slate-400 font-medium">Capacity</span>
          </div>

          {/* Battery progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full ${batColor.bar} transition-all duration-500 rounded-full`}
              style={{ width: `${battery}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. SPEED CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col justify-between hover:shadow-md transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Speed</span>
          <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{speed.toFixed(1)}</span>
            <span className="text-sm font-semibold text-slate-500">m/s</span>
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full ${speed > 0 ? 'bg-cyan-500 animate-pulse' : 'bg-slate-300'}`} />
            <span>{speed > 0 ? 'Active velocity' : 'Stationary'}</span>
          </div>
        </div>
      </div>

      {/* 3. STATUS CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col justify-between hover:shadow-md transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
            eStopActive 
              ? 'bg-red-50 border-red-100 text-red-600' 
              : mode === 'AUTO' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                : 'bg-blue-50 border-blue-100 text-blue-600'
          }`}>
            {eStopActive ? <AlertTriangle className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold tracking-tight ${
              eStopActive ? 'text-red-600' : 'text-slate-800'
            }`}>
              {eStopActive ? 'E-STOP' : mode}
            </span>
          </div>

          <div className="mt-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              eStopActive
                ? 'bg-red-100 text-red-700'
                : status === 'MOVING'
                  ? 'bg-emerald-100 text-emerald-700'
                  : status === 'REROUTING'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
            }`}>
              <CheckCircle className="w-3 h-3" />
              {eStopActive ? 'EMERGENCY STOP' : status}
            </span>
          </div>
        </div>
      </div>

      {/* 4. LOCATION CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col justify-between hover:shadow-md transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-800 tracking-tight truncate">
            {location}
          </div>

          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>Main Floor</span>
            <span className="font-mono text-[11px] text-slate-400">GPS Lock OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
