import React from 'react';
import { Compass, LayoutDashboard, LineChart, Terminal, Bug, RotateCcw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'practice' | 'progress';
  onNavigate: (tab: 'dashboard' | 'practice' | 'progress') => void;
  onToggleDebug: () => void;
  onResetState: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  onToggleDebug,
  onResetState
}) => {
  return (
    <header className="bg-dark-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight font-sans">SkillPilot</span>
            <span className="ml-2 text-[10px] font-mono px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800/50 rounded-full font-semibold">
              SQL Adaptive Engine
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-dark-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('practice')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'practice'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Practice</span>
          </button>

          <button
            onClick={() => onNavigate('progress')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'progress'
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Progress & State</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDebug}
            className="px-3 py-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 rounded-lg flex items-center gap-1.5 transition-all font-mono"
            title="Open Adaptive Engine Debug Drawer"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Debug Drawer</span>
          </button>

          <button
            onClick={onResetState}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
            title="Reset Learner State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
