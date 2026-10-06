import React from 'react';
import { useAMR } from '../context/AMRContext';
import RobotViewer from './RobotViewer';
import SensorStatus from './SensorStatus';
import { Bot, Cpu, Layers, Disc, Shield, Battery, Gauge, Compass } from 'lucide-react';

export default function RobotViewPage() {
  const { battery, speed, mode, status, eStopActive } = useAMR();

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-600" />
          Robot
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">3D CAD Model and robotic hardware specifications</p>
      </div>

      {/* 3D CAD Model Viewer */}
      <div>
        <RobotViewer />
      </div>

      {/* Robot Specifications */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Robot Specifications</h2>
            <p className="text-xs text-slate-500">Autonomous Mobile Robot hardware parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Dimensions */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <Layers className="w-4 h-4 text-cyan-600" /> Dimensions
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Footprint (L×W×H)</span>
                <span className="font-bold font-mono text-slate-800">850 × 600 × 320 mm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Ground Clearance</span>
                <span className="font-bold font-mono text-slate-800">45 mm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Total Curb Weight</span>
                <span className="font-bold font-mono text-slate-800">48 kg</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Max Payload Capacity</span>
                <span className="font-bold font-mono text-cyan-700">150 kg</span>
              </div>
            </div>
          </div>

          {/* 2. Drive Configuration */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <Disc className="w-4 h-4 text-purple-600" /> Drive Configuration
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Drive Architecture</span>
                <span className="font-bold text-slate-800">Dual Differential Drive</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Motors</span>
                <span className="font-bold text-slate-800">2× 250W Brushless DC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Optical Encoders</span>
                <span className="font-bold font-mono text-slate-800">2048 PPR Resolution</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Turning Geometry</span>
                <span className="font-bold text-purple-700">Zero Radius (Spin-in-Place)</span>
              </div>
            </div>
          </div>

          {/* 3. Components & Sensors */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              <Shield className="w-4 h-4 text-emerald-600" /> Components & Sensors
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Primary LiDAR</span>
                <span className="font-bold text-slate-800">Slamtec RPLiDAR S2 (360°)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Depth Camera</span>
                <span className="font-bold text-slate-800">Intel RealSense D435i</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Inertial Sensor</span>
                <span className="font-bold text-slate-800">9-DOF Bosch BNO085 IMU</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Compute Platform</span>
                <span className="font-bold text-emerald-700">NVIDIA Jetson Orin Nano</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Subsystem Health Status */}
      <div>
        <SensorStatus />
      </div>
    </div>
  );
}
