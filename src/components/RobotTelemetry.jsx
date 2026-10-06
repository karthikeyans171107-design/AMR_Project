import React from 'react';
import { useAMR } from '../context/AMRContext';
import {
  Gauge,
  RotateCw,
  MapPin,
  Compass,
  Navigation,
  Zap,
  Wifi
} from 'lucide-react';

export default function RobotTelemetry() {
  const {
    isRobotConnected,
    linearVelocity,
    angularVelocity,
    robotPos,
    heading,
    mode,
    eStopActive
  } = useAMR();

  const navSource = mode === 'AUTO' ? 'AI Navigation' : 'Manual';
  const motionSource = eStopActive ? 'E-STOPPED' : mode;

  // Convert map-grid position to simulated physical metres
  const posX = (robotPos.x * 0.12).toFixed(2);
  const posY = (robotPos.y * 0.08).toFixed(2);

  // Normalise heading to [-180, 180] for a natural compass feel
  const displayHeading = heading > 180 ? heading - 360 : heading;

  const cards = [
    {
      id: 'linear-vel',
      icon: Gauge,
      label: 'Linear Velocity',
      accent: 'cyan',
      value: (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">
            {linearVelocity.toFixed(2)}
          </span>
          <span className="text-xs font-semibold text-slate-500">m/s</span>
        </div>
      )
    },
    {
      id: 'angular-vel',
      icon: RotateCw,
      label: 'Angular Velocity',
      accent: 'purple',
      value: (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">
            {angularVelocity.toFixed(3)}
          </span>
          <span className="text-xs font-semibold text-slate-500">rad/s</span>
        </div>
      )
    },
    {
      id: 'position',
      icon: MapPin,
      label: 'Position',
      accent: 'emerald',
      value: (
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-slate-400 w-4">X</span>
            <span className="text-lg font-black text-slate-800 font-mono">{posX}</span>
            <span className="text-xs text-slate-500 font-semibold">m</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-slate-400 w-4">Y</span>
            <span className="text-lg font-black text-slate-800 font-mono">{posY}</span>
            <span className="text-xs text-slate-500 font-semibold">m</span>
          </div>
        </div>
      )
    },
    {
      id: 'heading',
      icon: Compass,
      label: 'Robot Heading',
      accent: 'amber',
      value: (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">
            {displayHeading}
          </span>
          <span className="text-sm font-bold text-slate-500">°</span>
        </div>
      )
    },
    {
      id: 'nav-source',
      icon: Navigation,
      label: 'Navigation Source',
      accent: 'blue',
      value: (
        <span className={`text-sm font-extrabold tracking-wide ${
          mode === 'AUTO' ? 'text-cyan-600' : 'text-blue-600'
        }`}>
          {navSource}
        </span>
      )
    },
    {
      id: 'motion-source',
      icon: Zap,
      label: 'Motion Source',
      accent: eStopActive ? 'red' : 'emerald',
      value: (
        <span className={`text-xl font-black tracking-wider ${
          eStopActive
            ? 'text-red-600'
            : mode === 'AUTO'
              ? 'text-emerald-600'
              : 'text-blue-600'
        }`}>
          {motionSource}
        </span>
      )
    }
  ];

  // Accent colour map
  const accentMap = {
    cyan: 'bg-cyan-50 border-cyan-100 text-cyan-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    red: 'bg-red-50 border-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-slate-900 text-base leading-tight">Robot Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live robot information</p>
        </div>

        {/* Connection + Mode Badge */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isRobotConnected ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isRobotConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </span>
            {isRobotConnected ? 'Robot Connected' : 'Disconnected'}
          </div>
          <span className="text-[11px] font-medium text-slate-400">Simulation Mode</span>
        </div>
      </div>

      {/* 6 Telemetry Cards – 3 per row on laptop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${accentMap[card.accent]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-1">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
