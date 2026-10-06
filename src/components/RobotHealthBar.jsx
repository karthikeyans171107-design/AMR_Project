import React from 'react';
import { useAMR } from '../context/AMRContext';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function RobotHealthBar() {
  const { battery, sensors, eStopActive, isRobotConnected, status } = useAMR();

  const items = [
    {
      label: 'Robot System',
      ok: isRobotConnected && !eStopActive,
      okText: 'Healthy',
      warnText: eStopActive ? 'E-Stopped' : 'Offline'
    },
    {
      label: 'Navigation',
      ok: sensors.obstacle === 'Safe' && isRobotConnected,
      okText: 'Ready',
      warnText: 'Obstacle Warning'
    },
    {
      label: 'Battery',
      ok: battery > 20,
      okText: `Good (${battery}%)`,
      warnText: `Low (${battery}%)`
    },
    {
      label: 'LIDAR',
      ok: sensors.lidar === 'Active',
      okText: 'Active',
      warnText: 'Inactive'
    },
    {
      label: 'Motor',
      ok: sensors.motor === 'Normal',
      okText: 'Normal',
      warnText: sensors.motor
    }
  ];

  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-soft border border-slate-100">
      <div className="flex flex-wrap items-center gap-3 sm:gap-6">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
          Robot Health
        </span>

        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            {item.ok ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
            )}
            <span className="text-xs font-semibold text-slate-700">{item.label}:</span>
            <span className={`text-xs font-bold ${item.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
              {item.ok ? item.okText : item.warnText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
