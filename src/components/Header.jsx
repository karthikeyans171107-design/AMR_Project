import React from 'react';
import { useAMR } from '../context/AMRContext';
import { OctagonAlert, Sparkles, Wifi, Radio } from 'lucide-react';

export default function Header() {
  const {
    isRobotConnected,
    isDemoMode,
    setIsDemoMode,
    triggerEmergencyStop,
    resetEmergencyStop,
    eStopActive
  } = useAMR();

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-glow-cyan shadow-sm font-bold">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-lg lg:text-xl tracking-tight leading-none">
                AMR Control Center
              </h1>
              <span className="hidden sm:inline-block bg-cyan-50 border border-cyan-100 text-cyan-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                v2.4 AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              AI-Powered Autonomous Mobile Robot
            </p>
          </div>
        </div>

        {/* Right Actions & Status Badges */}
        <div className="flex items-center gap-3">
          {/* Connection Status Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isRobotConnected ? 'bg-emerald-400' : 'bg-rose-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isRobotConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </span>
            <span className="text-slate-700">
              {isRobotConnected ? 'Robot Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Demo Mode Toggle Switch */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
              isDemoMode
                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDemoMode ? 'text-amber-500 animate-spin' : 'text-slate-400'}`} />
            <span>{isDemoMode ? 'Demo Mode ACTIVE' : 'Demo Mode'}</span>
          </button>

          {/* Emergency STOP Button */}
          {eStopActive ? (
            <button
              onClick={resetEmergencyStop}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition active:scale-95 animate-pulse"
            >
              Reset E-STOP
            </button>
          ) : (
            <button
              onClick={triggerEmergencyStop}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs tracking-wide px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-glow-red transition active:scale-95 border border-red-500"
            >
              <OctagonAlert className="w-4 h-4 fill-white" />
              EMERGENCY STOP
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
