import React, { useEffect } from 'react';
import { useAMR } from '../context/AMRContext';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, Square, OctagonAlert, Sliders, Gamepad2 } from 'lucide-react';

export default function RobotControls() {
  const {
    mode,
    setMode,
    status,
    speed,
    setSpeed,
    targetSpeed,
    setTargetSpeed,
    startNavigation,
    pauseNavigation,
    stopRobot,
    handleManualMove,
    triggerEmergencyStop,
    eStopActive
  } = useAMR();

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

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col justify-between h-full">
      <div>
        {/* Header Title & Mode Switch */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-base leading-tight">Robot Control</h2>
              <p className="text-xs text-slate-500">Operation & Velocity Override</p>
            </div>
          </div>

          {/* Mode Pill Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
            <button
              onClick={() => setMode('AUTO')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'AUTO'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AUTO
            </button>
            <button
              onClick={() => setMode('MANUAL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'MANUAL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MANUAL
            </button>
          </div>
        </div>

        {/* D-Pad Directional Controller */}
        <div className="my-4 flex flex-col items-center justify-center">
          <div className="grid grid-cols-3 gap-2 w-48">
            {/* Top row */}
            <div />
            <button
              onClick={() => handleManualMove('UP')}
              disabled={eStopActive}
              className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex items-center justify-center text-slate-700 font-bold shadow-sm transition transform active:scale-95 disabled:opacity-40"
              title="Move Forward (Arrow Up)"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
            <div />

            {/* Middle row */}
            <button
              onClick={() => handleManualMove('LEFT')}
              disabled={eStopActive}
              className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex items-center justify-center text-slate-700 font-bold shadow-sm transition transform active:scale-95 disabled:opacity-40"
              title="Turn Left (Arrow Left)"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Center STOP Button */}
            <button
              onClick={stopRobot}
              disabled={eStopActive}
              className="w-14 h-14 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-600 font-bold shadow-sm transition transform active:scale-95 text-xs tracking-wider disabled:opacity-40"
              title="Soft Stop (Spacebar)"
            >
              STOP
            </button>

            <button
              onClick={() => handleManualMove('RIGHT')}
              disabled={eStopActive}
              className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex items-center justify-center text-slate-700 font-bold shadow-sm transition transform active:scale-95 disabled:opacity-40"
              title="Turn Right (Arrow Right)"
            >
              <ArrowRight className="w-6 h-6" />
            </button>

            {/* Bottom row */}
            <div />
            <button
              onClick={() => handleManualMove('DOWN')}
              disabled={eStopActive}
              className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 active:bg-cyan-600 active:text-white flex items-center justify-center text-slate-700 font-bold shadow-sm transition transform active:scale-95 disabled:opacity-40"
              title="Move Reverse (Arrow Down)"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
            <div />
          </div>

          {mode === 'MANUAL' && (
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              💡 Use keyboard W, A, S, D or Arrow keys to drive
            </p>
          )}
        </div>

        {/* Speed Control Section */}
        <div className="mt-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
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

      {/* Control Action Buttons */}
      <div className="grid grid-cols-3 gap-2 mt-5">
        <button
          onClick={startNavigation}
          disabled={eStopActive}
          className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          Start
        </button>

        <button
          onClick={pauseNavigation}
          disabled={eStopActive}
          className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <Pause className="w-4 h-4 fill-white" />
          {status === 'PAUSED' ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={triggerEmergencyStop}
          className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-1 shadow-md hover:shadow-glow-red transition active:scale-95"
        >
          <Square className="w-4 h-4 fill-white" />
          STOP
        </button>
      </div>
    </div>
  );
}
