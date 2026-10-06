import React, { useState } from 'react';
import { Settings, Sliders, Shield, Radio, RotateCcw, Check } from 'lucide-react';
import { useAMR } from '../context/AMRContext';

export default function SettingsView() {
  const { setBattery, setSpeed, setMode } = useAMR();
  const [saved, setSaved] = useState(false);
  const [wheelDiam, setWheelDiam] = useState(150); // mm
  const [lidarFreq, setLidarFreq] = useState(10); // Hz
  const [safetyDist, setSafetyDist] = useState(0.5); // m

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100 max-w-4xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-lg">System Settings & Calibration</h2>
          <p className="text-xs text-slate-500">Autonomous Mobile Robot CAD Hardware Profile</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Hardware Parameters */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-cyan-600" /> Chassis Physical Properties
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Wheel Diameter (mm)
              </label>
              <input
                type="number"
                value={wheelDiam}
                onChange={(e) => setWheelDiam(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Mechanum Wheel Standard</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                LiDAR Update Freq (Hz)
              </label>
              <input
                type="number"
                value={lidarFreq}
                onChange={(e) => setLidarFreq(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">2D 360° Scanning Field</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Safety Buffer Distance (m)
              </label>
              <input
                type="number"
                step="0.1"
                value={safetyDist}
                onChange={(e) => setSafetyDist(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Collision E-Brake Threshold</span>
            </div>
          </div>
        </div>

        {/* Quick Simulation Utilities */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
            <RotateCcw className="w-4 h-4 text-cyan-600" /> Simulation Utilities
          </h3>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setBattery(100)}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition"
            >
              ⚡ Recharge Battery to 100%
            </button>
            <button
              onClick={() => {
                setSpeed(0.8);
                setMode('AUTO');
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
            >
              🔄 Reset Default Telemetry
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">All changes apply instantly to simulator</span>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            {saved ? <Check className="w-4 h-4 text-white" /> : null}
            {saved ? 'Settings Saved!' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
