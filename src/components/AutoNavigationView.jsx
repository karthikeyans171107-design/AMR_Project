import React from 'react';
import { useAMR } from '../context/AMRContext';
import AMRMap from './AMRMap';
import LocationSelector from './LocationSelector';
import {
  Navigation, Play, Pause, Square, Plus,
  Bot, Route, Clock, Gauge, ChevronRight, Flag,
  ShieldCheck, Zap, AlertTriangle
} from 'lucide-react';

export default function AutoNavigationView() {
  const {
    destinationReached,
    pathPoints, hasObstacle, eStopActive,
    status, linearVelocity, angularVelocity,
    targetSpeed, setTargetSpeed, setSpeed,
    angularSpeed, setAngularSpeed,
    mission,
    aiPlanStatus, aiFeedbackState, routeInfo,
    distanceRemaining,
    currentWaypointDisplay,
    startNavigation, pauseNavigation, cancelMission,
    planAIRoute, addDynamicObstacle
  } = useAMR();

  // Maximum Safe Speed Limits
  const MAX_SAFE_LINEAR_SPEED = 1.50;  // m/s
  const MAX_SAFE_ANGULAR_SPEED = 0.80; // rad/s

  const formatEta = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  // Live speed display values (dynamic telemetry)
  const liveLinearDisplay = status === 'MOVING'
    ? (linearVelocity > 0 ? linearVelocity.toFixed(2) : (targetSpeed * 0.84).toFixed(2))
    : '0.00';

  const liveAngularDisplay = status === 'MOVING'
    ? (angularVelocity > 0 ? angularVelocity.toFixed(2) : (angularSpeed * 0.60).toFixed(2))
    : '0.00';

  return (
    <div className="space-y-4 w-full">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-600" />
          Auto Navigation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Autonomous navigation and AI route planning</p>
      </div>

      {/* ── SIDE-BY-SIDE: AMR MAP (70-75%) + COMPACT CONTROLS (25-30%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px] gap-4 items-start w-full">

        {/* LEFT: AMR MAP (Fills remaining width, height 480-540px) */}
        <div className="w-full min-w-0">
          <AMRMap mode="auto" heightClass="h-[490px] lg:h-[515px]" />
        </div>

        {/* RIGHT: ONE COMPACT CONTROL COLUMN */}
        <div className="w-full min-w-0 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between gap-3">

          {/* 1. AUTO NAVIGATION STATUS & ACTION BUTTONS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-600" /> AUTO CONTROLS
              </h2>
              <div className="text-[10px] font-black">
                {eStopActive ? (
                  <span className="text-rose-600">🔴 E-STOPPED</span>
                ) : status === 'MOVING' ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> NAVIGATING
                  </span>
                ) : status === 'REROUTING' ? (
                  <span className="text-amber-600 animate-pulse">🟡 REROUTING</span>
                ) : status === 'PAUSED' ? (
                  <span className="text-amber-600">🟡 PAUSED</span>
                ) : destinationReached ? (
                  <span className="text-emerald-600 font-extrabold">✓ ARRIVED</span>
                ) : (
                  <span className="text-emerald-600">🟢 READY</span>
                )}
              </div>
            </div>

            {/* Navigation Actions: [ START ], [ PAUSE ], [ STOP ] */}
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              <button
                onClick={startNavigation}
                disabled={status === 'MOVING' || eStopActive}
                className="col-span-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition active:scale-95 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> START NAVIGATION
              </button>
              <button
                onClick={pauseNavigation}
                disabled={status === 'IDLE' || eStopActive}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-[11px] py-1.5 rounded-xl transition active:scale-95 flex items-center justify-center gap-1"
              >
                <Pause className="w-3 h-3" /> {status === 'PAUSED' ? 'RESUME' : 'PAUSE'}
              </button>
              <button
                onClick={cancelMission}
                disabled={status === 'IDLE' || eStopActive}
                className="col-span-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-[11px] py-1.5 rounded-xl transition active:scale-95 flex items-center justify-center gap-1 shadow-xs"
              >
                <Square className="w-3 h-3 fill-white" /> SAFE STOP
              </button>
            </div>

            {/* Distance Remaining & Mission Progress Bar */}
            <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Distance Left</span>
                <span className="font-black font-mono text-slate-800">{distanceRemaining} m</span>
              </div>
              <div>
                <div className="flex justify-between font-bold mb-1 text-[11px]">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-cyan-700 font-mono font-black">{mission.progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${mission.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100" />

          {/* 2. AUTO SPEED CONTROL (Sliders Only) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-600" /> SPEED CONTROL
              </h3>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Max: {MAX_SAFE_LINEAR_SPEED.toFixed(2)} m/s
              </span>
            </div>

            {/* Linear Speed Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-700">Linear Speed</span>
                <span className="text-[11px] font-black font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                  {targetSpeed.toFixed(2)} m/s
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={MAX_SAFE_LINEAR_SPEED}
                step="0.05"
                value={targetSpeed}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTargetSpeed(val);
                  setSpeed(val);
                }}
                className="w-full accent-cyan-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 font-medium">
                <span>0.00 m/s</span>
                <span>{MAX_SAFE_LINEAR_SPEED.toFixed(2)} m/s</span>
              </div>
            </div>

            {/* Angular Speed Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-700">Angular Speed</span>
                <span className="text-[11px] font-black font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  {angularSpeed.toFixed(2)} rad/s
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={MAX_SAFE_ANGULAR_SPEED}
                step="0.05"
                value={angularSpeed}
                onChange={(e) => setAngularSpeed(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 font-medium">
                <span>0.00 rad/s</span>
                <span>{MAX_SAFE_ANGULAR_SPEED.toFixed(2)} rad/s</span>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100" />

          {/* 3. CURRENT SPEED TELEMETRY */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>CURRENT SPEED</span>
              <span className="flex items-center gap-1 text-[8px] text-emerald-600 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white rounded-lg p-1.5 border border-slate-100 shadow-2xs">
                <div className="text-[8px] text-slate-400 font-bold uppercase">Linear</div>
                <div className="text-xs font-black font-mono text-cyan-700 mt-0.5">
                  {liveLinearDisplay} m/s
                </div>
              </div>
              <div className="bg-white rounded-lg p-1.5 border border-slate-100 shadow-2xs">
                <div className="text-[8px] text-slate-400 font-bold uppercase">Angular</div>
                <div className="text-xs font-black font-mono text-purple-700 mt-0.5">
                  {liveAngularDisplay} rad/s
                </div>
              </div>
            </div>
          </div>

          {/* 4. AI ROUTE & DYNAMIC OBSTACLE ACTIONS */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-1">
                <div className="text-[7px] text-slate-400 font-bold uppercase">Distance</div>
                <div className="text-[11px] font-black font-mono text-slate-800">{routeInfo?.distance || '12.4'}m</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-1">
                <div className="text-[7px] text-slate-400 font-bold uppercase">ETA</div>
                <div className="text-[11px] font-black font-mono text-slate-800">{routeInfo?.eta || formatEta(mission.etaSeconds)}</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-1">
                <div className="text-[7px] text-slate-400 font-bold uppercase">Points</div>
                <div className="text-[11px] font-black font-mono text-slate-800">{routeInfo?.waypoints || pathPoints.length}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={planAIRoute}
                disabled={aiPlanStatus === 'planning' || aiPlanStatus === 'rerouting'}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-bold text-[11px] py-2 rounded-xl transition active:scale-95 shadow-xs flex items-center justify-center gap-1"
              >
                <Bot className="w-3.5 h-3.5" /> Plan Route
              </button>
              <button
                onClick={addDynamicObstacle}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] py-2 rounded-xl transition active:scale-95 shadow-xs flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Obstacle
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── LOCATION / DESTINATION DIRECTLY BELOW MAP + CONTROLS ───── */}
      <div className="w-full">
        <LocationSelector />
      </div>
    </div>
  );
}
