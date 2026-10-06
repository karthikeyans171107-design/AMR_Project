import React from 'react';
import { useAMR } from '../context/AMRContext';
import {
  Activity,
  Joystick,
  Navigation,
  Bot,
  Sparkles,
  Settings,
  Battery,
  Zap
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, battery, mode } = useAMR();

  const navItems = [
    { id: 'RobotStatus',        label: 'Robot Status',      icon: Activity   },
    { id: 'ManualNavigation',   label: 'Manual Navigation', icon: Joystick   },
    { id: 'AutoNavigation',     label: 'Auto Navigation',   icon: Navigation },
    { id: 'Robot',              label: 'Robot',             icon: Bot        },
    { id: 'AIAssistant',        label: 'AI Assistant',      icon: Sparkles   },
    { id: 'Settings',           label: 'Settings',          icon: Settings   }
  ];

  return (
    <aside className="w-full lg:w-[230px] bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between shrink-0 shadow-sm">
      <div className="space-y-0.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
          Main Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isActive
                  ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {item.id === 'AIAssistant' && (
                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-cyan-100 text-cyan-700'
                }`}>
                  AI
                </span>
              )}
              {item.id === 'AutoNavigation' && (
                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  AUTO
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="mt-6 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 hidden lg:block">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-600" /> System
          </span>
          <span className="text-emerald-600 font-bold">READY</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Mode: {mode}</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Battery className="w-3.5 h-3.5 text-emerald-500" /> {battery}%
          </span>
        </div>
      </div>
    </aside>
  );
}
