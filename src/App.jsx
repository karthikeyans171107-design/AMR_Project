import React from 'react';
import { AMRProvider, useAMR } from './context/AMRContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RobotStatusPage from './components/RobotStatusPage';
import ManualNavigationView from './components/ManualNavigationView';
import AutoNavigationView from './components/AutoNavigationView';
import RobotViewPage from './components/RobotViewPage';
import AIAssistant from './components/AIAssistant';
import SettingsView from './components/SettingsView';
import EmergencyModal from './components/EmergencyModal';

function DashboardContent() {
  const { activeTab } = useAMR();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto px-5 py-4 gap-5">
        <Sidebar />

        {/* Main View Workspace */}
        <main className="flex-1 min-w-0">
          {(activeTab === 'RobotStatus' || activeTab === 'Dashboard') && (
            <RobotStatusPage />
          )}

          {activeTab === 'ManualNavigation' && (
            <ManualNavigationView />
          )}

          {(activeTab === 'AutoNavigation' || activeTab === 'Navigation') && (
            <AutoNavigationView />
          )}

          {activeTab === 'Robot' && (
            <RobotViewPage />
          )}

          {activeTab === 'AIAssistant' && (
            <div className="h-[600px]">
              <AIAssistant />
            </div>
          )}

          {activeTab === 'Settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      <EmergencyModal />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AMR Control Center Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-slate-900">Telemetry Stream Recovered</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              A minor dashboard render issue occurred. Click below to refresh the AMR telemetry workspace.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              Reload Dashboard Workspace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AMRProvider>
        <DashboardContent />
      </AMRProvider>
    </ErrorBoundary>
  );
}
