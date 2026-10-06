import React from 'react';
import { useAMR } from '../context/AMRContext';
import { Activity, ShieldCheck, Radio, Cog, Battery } from 'lucide-react';

export default function SensorStatus() {
  const { sensors, hasObstacle, eStopActive } = useAMR();

  const sensorList = [
    {
      name: 'Obstacle Sensor',
      status: hasObstacle ? 'WARNING' : sensors.obstacle,
      icon: ShieldCheck,
      color: hasObstacle ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      name: 'LIDAR',
      status: sensors.lidar,
      icon: Radio,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      name: 'Motor',
      status: eStopActive ? 'HALTED' : sensors.motor,
      icon: Cog,
      color: eStopActive ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      name: 'Battery',
      status: sensors.battery,
      icon: Battery,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800 text-base leading-tight">Sensor Status</h2>
          <p className="text-xs text-slate-500">Subsystem Health Checks</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {sensorList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">{item.name}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  item.status === 'WARNING' 
                    ? 'bg-amber-500 animate-ping' 
                    : item.status === 'HALTED' 
                      ? 'bg-rose-600' 
                      : 'bg-emerald-500'
                }`} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${item.color}`}>
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
