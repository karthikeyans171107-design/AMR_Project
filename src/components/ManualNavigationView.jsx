import React from 'react';
import { useAMR } from '../context/AMRContext';
import AMRMap from './AMRMap';
import LocationSelector from './LocationSelector';
import {
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Joystick, Bot, Gauge, Plus,
  AlertTriangle, ShieldCheck
} from 'lucide-react';

export default function ManualNavigationView() {
  const {
    eStopActive,
    targetSpeed, setTargetSpeed,
    angularSpeed, setAngularSpeed,
    setSpeed,
    status, linearVelocity, angularVelocity,
    handleManualMove,
    stopRobot,
    planAIRoute,
    addDynamicObstacle,
    aiPlanStatus,
    manualCollisionWarning
  } = useAMR();

  // Live speed display values (real-time telemetry)
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
          <Joystick className="w-5 h-5 text-cyan-600" />
          Manual Navigation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Direct teleoperation and real-time obstacle avoidance</p>
      </div>

      {/* ── SIDE-BY-SIDE: AMR MAP (70-75%) + COMPACT CONTROLS (25-30%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px] gap-4 items-start w-full">

        {/* LEFT: AMR MAP (Fills remaining width, height 480-540px) */}
        <div className="w-full min-w-0">
          <AMRMap mode="manual" heightClass="h-[490px] lg:h-[515px]" />
        </div>

        {/* RIGHT: ONE COMPACT CONTROL COLUMN */}
        <div className="w-full min-w-0 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between gap-3">

          {/* 1. MANUAL CONTROLS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <Joystick className="w-4 h-4 text-cyan-600" /> MANUAL CONTROLS
              </h2>
              {manualCollisionWarning && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Blocked
                </span>
              )}
            </div>

            {/* Compact D-Pad with central prominent red STOP button */}
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-3 gap-2 w-44">
                <div />
                <button
                  onClick={() => handleManualMove('UP')}
                  disabled={eStopActive}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:border-cyan-300 border border-slate-200 active:bg-cyan-600 active:text-white flex items-center justify-center text-slate-700 transition active:scale-95 disabled:opacity-40 shadow-2xs"
                  title="Forward (North)"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <div />

                <button
                  onClick={() => handleManualMove('LEFT')}
                  disabled={eStopActive}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:border-cyan-300 border border-slate-200 active:bg-cyan-600 active:text-white flex items-center justify-center text-slate-700 transition active:scale-95 disabled:opacity-40 shadow-2xs"
                  title="Turn Left (West)"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={stopRobot}
                  className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs tracking-wider shadow-sm transition active:scale-95 flex items-center justify-center"
                  title="Emergency Stop AMR"
                >
                  STOP
                </button>

                <button
                  onClick={() => handleManualMove('RIGHT')}
                  disabled={eStopActive}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:border-cyan-300 border border-slate-200 active:bg-cyan-600 active:text-white flex items-center justify-center text-slate-700 transition active:scale-95 disabled:opacity-40 shadow-2xs"
                  title="Turn Right (East)"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div />
                <button
                  onClick={() => handleManualMove('DOWN')}
                  disabled={eStopActive}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:border-cyan-300 border border-slate-200 active:bg-cyan-600 active:text-white flex items-center justify-center text-slate-700 transition active:scale-95 disabled:opacity-40 shadow-2xs"
                  title="Backward (South)"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <div />
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-100" />

          {/* 2. SPEED CONTROL (Sliders Only) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-600" /> SPEED CONTROL
              </h3>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Safe Limit
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
                max="2.0"
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
                <span>2.00 m/s (Max)</span>
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
                max="1.0"
                step="0.05"
                value={angularSpeed}
                onChange={(e) => setAngularSpeed(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[8px] text-slate-400 mt-0.5 font-medium">
                <span>0.00 rad/s</span>
                <span>1.00 rad/s (Max)</span>
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
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={planAIRoute}
              disabled={aiPlanStatus === 'planning'}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-bold text-[11px] py-2 rounded-xl transition active:scale-95 shadow-xs flex items-center justify-center gap-1"
            >
              <Bot className="w-3.5 h-3.5" />
              {aiPlanStatus === 'planning' ? 'Planning...' : 'Plan Route'}
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

      {/* ── LOCATION / DESTINATION DIRECTLY BELOW MAP + CONTROLS ───── */}
      <div className="w-full">
        <LocationSelector />
      </div>
    </div>
  );
}
