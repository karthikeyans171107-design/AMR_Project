import React from 'react';
import { useAMR } from '../context/AMRContext';
import { OctagonAlert, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function EmergencyModal() {
  const { eStopActive, resetEmergencyStop } = useAMR();

  if (!eStopActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-red-100 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 animate-bounce">
          <OctagonAlert className="w-10 h-10" />
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          EMERGENCY STOP ENGAGED
        </h3>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          All AMR wheel motors and autonomous navigation routines have been halted immediately for safety verification.
        </p>

        <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 mt-5 text-left text-xs text-red-700 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Safety Lock Interlock Active
          </div>
          <div>• Motor Drive Power: DISCONNECTED</div>
          <div>• Brake Solenoid: ENGAGED</div>
          <div>• Navigation Controller: HALTED</div>
        </div>

        <button
          onClick={resetEmergencyStop}
          className="w-full mt-6 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg hover:shadow-glow-green transition active:scale-95 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          CLEAR EMERGENCY LOCK & RESUME
        </button>
      </div>
    </div>
  );
}
