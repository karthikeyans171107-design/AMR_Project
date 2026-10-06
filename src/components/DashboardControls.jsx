import React from 'react';
import { useAMR, DESTINATIONS } from '../context/AMRContext';
import {
  Gamepad2,
  Cpu,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  XCircle,
  Navigation
} from 'lucide-react';

export default function DashboardControls() {
  const {
    mode,
    setMode,
    status,
    speed,
    setSpeed,
    targetSpeed,
    setTargetSpeed,
    destinationKey,
    setDestinationKey,
    startNavigation,
    pauseNavigation,
    cancelMission,
    stopRobot,
    handleManualMove,
    aiNavStatus,
    eStopActive
  } = useAMR();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {/* ─── CARD 1: MANUAL CONTROL ─── */}
      <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-cyan-600" />
              Manual Control
            </h3>
            <p className="text-[11px] text-slate-500">Drive the robot manually</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            mode === 'MANUAL' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
          }`}>
            {mode === 'MANUAL' ? 'ACTIVE' : 'IDLE'}
          </span>
        </div>

        {/* D-Pad */}
        <div className="flex flex-col items-center my-2">
          <div className="grid grid-cols-3 gap-1.5 w-36">
            <div />
            <button
              onClick={() => handleManualMove('UP')}
              disabled={eStopActive}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex flex-col items-center justify-center text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Fwd</span>
            </button>
            <div />

            <button
              onClick={() => handleManualMove('LEFT')}
              disabled={eStopActive}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex items-center justify-center text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={stopRobot}
              disabled={eStopActive}
              className="py-2.5 rounded-xl bg-red-100 hover:bg-red-200 border border-red-200 flex items-center justify-center text-red-700 font-black shadow-sm transition active:scale-95 text-[10px] disabled:opacity-40"
            >
              STOP
            </button>
            <button
              onClick={() => handleManualMove('RIGHT')}
              disabled={eStopActive}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex items-center justify-center text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            <div />
            <button
              onClick={() => handleManualMove('DOWN')}
              disabled={eStopActive}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex flex-col items-center justify-center text-slate-700 shadow-sm transition active:scale-95 disabled:opacity-40"
            >
              <ArrowDown className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Rev</span>
            </button>
            <div />
          </div>
        </div>

        {/* Speed Slider */}
        <div className="mt-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">Speed</span>
            <span className="text-sm font-extrabold text-cyan-700 font-mono">{targetSpeed.toFixed(1)} m/s</span>
          </div>
          <input
            type="range" min="0" max="2.0" step="0.1"
            value={targetSpeed}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setTargetSpeed(val);
              setSpeed(val);
            }}
            className="w-full accent-cyan-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
            <span>0 m/s</span><span>2.0 m/s</span>
          </div>
        </div>
      </div>

      {/* ─── CARD 2: AUTO NAVIGATION ─── */}
      <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-600" />
              Auto Navigation
            </h3>
            <p className="text-[11px] text-slate-500">Let the AI plan the route</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            mode === 'AUTO' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-400'
          }`}>
            {mode === 'AUTO' ? 'AI ACTIVE' : 'IDLE'}
          </span>
        </div>

        {/* Destination */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-slate-600 block mb-1">Destination</label>
          <select
            value={destinationKey}
            onChange={(e) => setDestinationKey(e.target.value)}
            disabled={status === 'MOVING'}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          >
            {Object.keys(DESTINATIONS).map((key) => (
              <option key={key} value={key}>
                📍 {DESTINATIONS[key].name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={startNavigation}
          disabled={status === 'MOVING' || eStopActive}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          Start Navigation
        </button>

        {/* AI Status */}
        <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 mb-1">AI Status</div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              status === 'MOVING' ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500'
            }`} />
            <span>{aiNavStatus}</span>
          </div>
        </div>

        {/* Pause / Cancel */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-3">
          <button
            onClick={pauseNavigation}
            disabled={status === 'IDLE' || eStopActive}
            className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition active:scale-95 disabled:opacity-40"
          >
            <Pause className="w-3 h-3" />
            {status === 'PAUSED' ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={cancelMission}
            disabled={status === 'IDLE' || eStopActive}
            className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition active:scale-95 disabled:opacity-40"
          >
            <XCircle className="w-3 h-3" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
