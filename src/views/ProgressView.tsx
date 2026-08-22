import React from 'react';
import { LearnerState } from '../engine/learnerState/types';
import { knowledgeGraph } from '../engine/knowledgeGraph/knowledgeGraph';
import { LineChart, History, AlertTriangle, CheckCircle, BarChart3, Database } from 'lucide-react';
import { SkillType } from '../engine/knowledgeGraph/types';

interface ProgressViewProps {
  learnerState: LearnerState;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ learnerState }) => {
  const globalProfile = learnerState.globalSkillProfile;
  const history = learnerState.learningHistory;

  const totalAttempts = history.length;
  const avgScore = totalAttempts > 0
    ? Math.round((history.reduce((sum, a) => sum + a.evaluationResult.score, 0) / totalAttempts) * 100)
    : 0;

  const skillKeys: SkillType[] = ['recognition', 'reasoning', 'diagnosis', 'correction', 'implementation'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
          <div className="text-xs font-mono font-semibold text-slate-400">Total Practice Attempts</div>
          <div className="text-3xl font-bold text-white font-mono">{totalAttempts}</div>
          <div className="text-[11px] text-slate-500">Recorded interactively</div>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
          <div className="text-xs font-mono font-semibold text-slate-400">Average Historical Score</div>
          <div className="text-3xl font-bold text-emerald-400 font-mono">{avgScore}%</div>
          <div className="text-[11px] text-slate-500">Across all 5 skill dimensions</div>
        </div>

        <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-xl">
          <div className="text-xs font-mono font-semibold text-slate-400">Current Adaptive Difficulty</div>
          <div className="text-3xl font-bold text-amber-400 font-mono">Level {learnerState.difficultyState}</div>
          <div className="text-[11px] text-slate-500">Dynamic difficulty fit</div>
        </div>
      </div>

      {/* 5 Cognitive Dimensions Grid */}
      <section className="bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">5 Cognitive Skill Dimensions Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {skillKeys.map(sk => {
            const val = globalProfile[sk] ?? 0;
            const pct = Math.round(val * 100);
            return (
              <div key={sk} className="bg-dark-950 p-4 rounded-xl border border-slate-800/80 space-y-2 text-center">
                <div className="text-xs font-mono font-semibold uppercase text-slate-400">{sk}</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">{pct}%</div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Concept Mastery List & Recent Attempt History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Concept Mastery Table */}
        <div className="lg:col-span-6 bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Concept Mastery Matrix</h3>
          </div>

          <div className="space-y-3">
            {knowledgeGraph.getAllConcepts().map(c => {
              const mastery = learnerState.conceptMastery[c.conceptId] ?? 0;
              const pct = Math.round(mastery * 100);
              return (
                <div key={c.conceptId} className="p-3 bg-dark-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-slate-200">{c.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{c.conceptId}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-amber-400 text-sm">{pct}%</div>
                    <div className="text-[10px] text-slate-500">{pct >= 75 ? 'Mastered' : pct >= 40 ? 'Developing' : 'Baseline'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning History Log */}
        <div className="lg:col-span-6 bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Attempt History Log</h3>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2 font-mono text-xs">
            {history.length === 0 ? (
              <div className="text-slate-500 italic p-4 text-center">No attempt history logged yet.</div>
            ) : (
              [...history].reverse().map(att => (
                <div key={att.attemptId} className="p-3 bg-dark-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-200">{att.questionId} ({att.conceptId})</div>
                    <div className="text-[10px] text-slate-500">{new Date(att.timestamp).toLocaleTimeString()} • Skill: {att.skillType}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                      att.evaluationResult.score >= 0.8
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {Math.round(att.evaluationResult.score * 100)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
