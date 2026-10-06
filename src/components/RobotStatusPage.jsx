import React from 'react';
import { useAMR } from '../context/AMRContext';
import {
  Gauge, RotateCw, MapPin, Compass, Navigation, Zap,
  Battery, Wifi, Shield, CheckCircle2, AlertTriangle, Activity
} from 'lucide-react';

export default function RobotStatusPage() {
  const {
    isRobotConnected,
    battery,
    mode,
    eStopActive,
    sensors,
    linearVelocity,
    angularVelocity,
    robotPos,
    heading,
  } = useAMR();

  const navSource   = mode === 'AUTO' ? 'AI Navigation' : 'Manual';
  const motionSource = eStopActive ? 'E-STOPPED' : mode;
  const posX = (robotPos.x * 0.1275).toFixed(2);
  const posY = (robotPos.y * 0.08).toFixed(2);
  const displayHeading = heading;

  // 6 telemetry cards
  const telemetryCards = [
    {
      id: 'lin-vel', icon: Gauge, label: 'Linear Velocity', accent: 'cyan',
      value: <><span className="text-2xl font-black font-mono text-slate-800">{linearVelocity.toFixed(2)}</span><span className="text-xs text-slate-500 ml-1">m/s</span></>
    },
    {
      id: 'ang-vel', icon: RotateCw, label: 'Angular Velocity', accent: 'purple',
      value: <><span className="text-2xl font-black font-mono text-slate-800">{angularVelocity.toFixed(3)}</span><span className="text-xs text-slate-500 ml-1">rad/s</span></>
    },
    {
      id: 'pos', icon: MapPin, label: 'Position', accent: 'emerald',
      value: (
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1"><span className="text-xs font-bold text-slate-400 w-3">X</span><span className="text-lg font-black font-mono text-slate-800">{posX}</span><span className="text-xs text-slate-500 ml-0.5">m</span></div>
          <div className="flex items-baseline gap-1"><span className="text-xs font-bold text-slate-400 w-3">Y</span><span className="text-lg font-black font-mono text-slate-800">{posY}</span><span className="text-xs text-slate-500 ml-0.5">m</span></div>
        </div>
      )
    },
    {
      id: 'heading', icon: Compass, label: 'Robot Heading', accent: 'amber',
      value: <><span className="text-2xl font-black font-mono text-slate-800">{displayHeading}</span><span className="text-sm font-bold text-slate-500 ml-0.5">°</span></>
    },
    {
      id: 'nav-src', icon: Navigation, label: 'Navigation Source', accent: 'blue',
      value: <span className={`text-sm font-extrabold tracking-wide ${mode === 'AUTO' ? 'text-cyan-600' : 'text-blue-600'}`}>{navSource}</span>
    },
    {
      id: 'motion-src', icon: Zap, label: 'Motion Source', accent: eStopActive ? 'red' : 'emerald',
      value: (
        <span className={`text-xl font-black tracking-wider ${
          eStopActive ? 'text-red-600' : mode === 'AUTO' ? 'text-emerald-600' : 'text-blue-600'
        }`}>{motionSource}</span>
      )
    }
  ];

  const accentMap = {
    cyan: 'bg-cyan-50 border-cyan-100 text-cyan-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    red: 'bg-red-50 border-red-100 text-red-600'
  };

  // Health items
  const healthItems = [
    { label: 'Robot System', ok: isRobotConnected && !eStopActive, okText: 'Healthy',          warnText: eStopActive ? 'E-Stopped' : 'Offline' },
    { label: 'Navigation',   ok: sensors.obstacle === 'Safe',       okText: 'Ready',            warnText: 'Obstacle Warning' },
    { label: 'Battery',      ok: battery > 20,                      okText: `Good (${battery}%)`, warnText: `Low (${battery}%)` }
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-600" />
          Robot Status
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Live overview of the AMR</p>
      </div>

      {/* ── LIVE ROBOT STATUS (6 Cards) ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 text-sm">Live Robot Status</h2>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRobotConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRobotConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </span>
            {isRobotConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {telemetryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${accentMap[card.accent]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-1">{card.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BATTERY / CONNECTION / MODE ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-slate-800 text-sm mb-4">System Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Battery */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Battery className={`w-4 h-4 ${battery > 30 ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-xs font-semibold text-slate-500">Battery</span>
            </div>
            <div className="text-2xl font-black text-slate-800 font-mono">{battery}<span className="text-sm text-slate-500 font-semibold ml-0.5">%</span></div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${battery > 50 ? 'bg-emerald-500' : battery > 25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${battery}%` }} />
            </div>
          </div>

          {/* Connection */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className={`w-4 h-4 ${isRobotConnected ? 'text-emerald-500' : 'text-rose-500'}`} />
              <span className="text-xs font-semibold text-slate-500">Connection</span>
            </div>
            <div className={`text-lg font-extrabold ${isRobotConnected ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isRobotConnected ? '🟢 Connected' : '🔴 Offline'}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Signal Strong</div>
          </div>

          {/* Mode */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-semibold text-slate-500">Mode</span>
            </div>
            <div className="text-lg font-extrabold text-cyan-700">Simulation</div>
            <div className={`text-xs font-bold mt-1 ${mode === 'AUTO' ? 'text-cyan-600' : 'text-blue-600'}`}>{mode} Active</div>
          </div>
        </div>
      </div>

      {/* ── ROBOT HEALTH ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h2 className="font-bold text-slate-800 text-sm mb-4">Robot Health</h2>
        <div className="space-y-3">
          {healthItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-sm font-semibold text-slate-700">{item.label}</span>
              <div className="flex items-center gap-1.5">
                {item.ok
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  : <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                }
                <span className={`text-sm font-bold ${item.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {item.ok ? item.okText : item.warnText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
