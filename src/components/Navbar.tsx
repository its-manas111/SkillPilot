import React, { useState } from 'react';
import { Compass, LayoutDashboard, LineChart, Terminal, Bug, RotateCcw, LogOut, LogIn, User } from 'lucide-react';
import { UserProfile } from '../services/authService';

interface NavbarProps {
  activeTab: 'dashboard' | 'practice' | 'progress';
  userProfile: UserProfile | null;
  onNavigate: (tab: 'dashboard' | 'practice' | 'progress') => void;
  onToggleDebug: () => void;
  onResetState: () => void;
  onSignOut: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  userProfile,
  onNavigate,
  onToggleDebug,
  onResetState,
  onSignOut,
  onOpenLogin
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
        <nav className="hidden sm:flex items-center gap-1 bg-dark-950/80 p-1 rounded-xl border border-slate-800">
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

        {/* Action Controls & User Profile Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDebug}
            className="hidden md:flex px-3 py-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 rounded-lg items-center gap-1.5 transition-all font-mono"
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

          {/* User Profile Badge / Menu */}
          <div className="relative">
            {userProfile ? (
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 bg-dark-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all text-xs font-medium text-slate-200"
              >
                {userProfile.photoURL ? (
                  <img src={userProfile.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border border-cyan-500/50" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-[11px] font-bold font-mono">
                    {userProfile.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden md:inline max-w-[100px] truncate">{userProfile.displayName}</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && userProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50 text-xs">
                <div className="p-2 bg-dark-950 rounded-xl border border-slate-800/80">
                  <div className="font-semibold text-slate-100 truncate">{userProfile.displayName}</div>
                  <div className="text-[10px] text-slate-500 truncate">{userProfile.email || 'Google Authenticated'}</div>
                </div>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full p-2 text-left text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-xl flex items-center gap-2 transition-all font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
