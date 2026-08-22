import React, { useState } from 'react';
import { Compass, Target, Brain, ShieldCheck, ArrowRight } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (goal: string, experience: string) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [selectedGoal, setSelectedGoal] = useState('interview');
  const [experience, setExperience] = useState('intermediate');

  const goals = [
    { id: 'interview', title: 'SQL Interview Preparation', desc: 'Focus on query correction, window functions, and complex joins for tech interviews.' },
    { id: 'analytics', title: 'Data Analytics & Reporting', desc: 'Master aggregations, GROUP BY, subqueries, and window partition functions.' },
    { id: 'foundation', title: 'SQL Core Foundations', desc: 'Build solid mental models for row filtering, joins, and basic queries.' },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-dark-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 shadow-xl shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
              <Compass className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to SkillPilot</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            An adaptive learning intelligence system that understands what you can <span className="text-cyan-400 font-medium">recognize</span> vs what you can <span className="text-emerald-400 font-medium">implement</span>.
          </p>
        </div>

        {/* Goal Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Select Your Target Learning Goal</span>
          </label>
          <div className="grid grid-cols-1 gap-3">
            {goals.map(g => (
              <div
                key={g.id}
                onClick={() => setSelectedGoal(g.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedGoal === g.id
                    ? 'bg-slate-800/80 border-cyan-500 text-white shadow-lg shadow-cyan-950'
                    : 'bg-dark-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-sm text-slate-200">{g.title}</div>
                <div className="text-xs text-slate-400 mt-1">{g.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Cognitive Dimensions Teaser */}
        <div className="p-4 bg-dark-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Brain className="w-4 h-4" />
            <span>Independent 5-Skill Profile Evaluation</span>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-[11px] pt-1">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-cyan-300 font-mono">Recognition</div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-sky-300 font-mono">Reasoning</div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-amber-300 font-mono">Diagnosis</div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-orange-300 font-mono">Correction</div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-emerald-300 font-mono">Implementation</div>
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={() => onComplete(selectedGoal, experience)}
          className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-xl shadow-cyan-950 flex items-center justify-center gap-2 transition-all"
        >
          <span>Start Diagnostic Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
