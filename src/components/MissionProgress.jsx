import React from 'react';
import { useAMR } from '../context/AMRContext';
import { Target, Clock, CheckCircle2, Navigation2 } from 'lucide-react';

export default function MissionProgress() {
  const { mission, status, destinationKey } = useAMR();

  // Format ETA seconds into mm:ss string
  const formatEta = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-base leading-tight">Mission Status</h2>
              <p className="text-xs text-slate-500">Autonomous Task Lifecycle</p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
            Active Mission
          </span>
        </div>

        {/* Mission Title */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mt-2">
          <div className="text-xs text-slate-400 font-medium">Current Mission</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
            <Navigation2 className="w-4 h-4 text-cyan-600 fill-cyan-100" />
            {mission.title}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600">Task Completion</span>
            <span className="text-cyan-700 font-extrabold">{mission.progress}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${mission.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Step & ETA Details */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Current Action</div>
          <div className="text-xs font-bold text-slate-700 mt-0.5 truncate flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${status === 'MOVING' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-400'}`} />
            {mission.currentStep}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            Estimated ETA
          </div>
          <div className="text-sm font-extrabold font-mono text-cyan-700 mt-0.5">
            {formatEta(mission.etaSeconds)}
          </div>
        </div>
      </div>
    </div>
  );
}
