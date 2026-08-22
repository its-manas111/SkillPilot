import React from 'react';
import { LearnerState } from '../engine/learnerState/types';
import { X, Bug, Cpu, Database, AlertTriangle, Activity } from 'lucide-react';

interface DebugDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  learnerState: LearnerState;
}

export const DebugDrawer: React.FC<DebugDrawerProps> = ({
  isOpen,
  onClose,
  learnerState
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-dark-900 border-l border-amber-500/30 z-50 shadow-2xl flex flex-col font-mono text-xs">
      {/* Header */}
      <div className="p-4 bg-dark-850 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-400 font-semibold">
          <Bug className="w-4 h-4" />
          <span>Adaptive Intelligence Debugger</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 overflow-y-auto flex-1 space-y-6 text-slate-300">
        {/* Recommendation Engine State */}
        <section className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold border-b border-slate-800 pb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Active Recommendation</span>
          </div>
          {learnerState.recommendation ? (
            <div className="space-y-1.5 text-[11px]">
              <div><span className="text-slate-500">Question ID:</span> <span className="text-slate-200">{learnerState.recommendation.questionId}</span></div>
              <div><span className="text-slate-500">Target Concept:</span> <span className="text-cyan-300">{learnerState.recommendation.conceptName} ({learnerState.recommendation.conceptId})</span></div>
              <div><span className="text-slate-500">Skill Type:</span> <span className="text-emerald-300 uppercase">{learnerState.recommendation.skillType}</span></div>
              <div><span className="text-slate-500">Difficulty:</span> <span className="text-amber-300">{learnerState.recommendation.difficulty}</span></div>
              <div className="bg-dark-900 p-2 rounded text-slate-300 border border-slate-800/60 mt-1 italic">
                "{learnerState.recommendation.reason}"
              </div>
            </div>
          ) : (
            <div className="text-slate-500 italic">No recommendation computed yet.</div>
          )}
        </section>

        {/* Global 5-Skill Profile */}
        <section className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold border-b border-slate-800 pb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Global 5-Skill Radar Profile</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {Object.entries(learnerState.globalSkillProfile).map(([skill, val]) => (
              <div key={skill} className="flex justify-between bg-dark-900 p-1.5 rounded border border-slate-800/40">
                <span className="capitalize text-slate-400">{skill}:</span>
                <span className="font-bold text-emerald-300">{Math.round(val * 100)}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Active Misconceptions */}
        <section className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold border-b border-slate-800 pb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Misconception Catalog</span>
          </div>
          {Object.keys(learnerState.misconceptions).length === 0 ? (
            <div className="text-slate-500 italic text-[11px]">No active misconceptions logged.</div>
          ) : (
            <div className="space-y-1.5 text-[11px]">
              {Object.values(learnerState.misconceptions).map(m => (
                <div key={m.misconceptionId} className="bg-dark-900 p-2 rounded border border-rose-900/40 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-rose-300">{m.misconceptionId}</div>
                    <div className="text-[10px] text-slate-500">{m.conceptId} • Severity: {m.severity}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-1.5 py-0.5 bg-rose-950 text-rose-400 rounded border border-rose-800 text-[10px] font-bold">
                      {m.occurrenceCount}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Concept Mastery Snapshot */}
        <section className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold border-b border-slate-800 pb-1">
            <Database className="w-3.5 h-3.5" />
            <span>Concept Mastery State</span>
          </div>
          <div className="space-y-1 text-[11px]">
            {Object.keys(learnerState.conceptMastery).length === 0 ? (
              <div className="text-slate-500 italic">No concept data recorded.</div>
            ) : (
              Object.entries(learnerState.conceptMastery).map(([cid, val]) => (
                <div key={cid} className="flex justify-between items-center bg-dark-900 p-1.5 rounded">
                  <span className="text-slate-300">{cid}</span>
                  <span className="text-amber-300 font-bold">{Math.round(val * 100)}%</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* State Raw Metadata */}
        <section className="bg-dark-950 p-3 rounded-lg border border-slate-800 space-y-1 text-[10px] text-slate-400">
          <div>Learner ID: {learnerState.learnerId}</div>
          <div>Difficulty State Level: {learnerState.difficultyState}</div>
          <div>Total History Attempts: {learnerState.learningHistory.length}</div>
          <div>Recent Questions: [{learnerState.recentQuestionIds.join(', ')}]</div>
          <div>Last Updated: {learnerState.lastUpdated}</div>
        </section>
      </div>
    </div>
  );
};
