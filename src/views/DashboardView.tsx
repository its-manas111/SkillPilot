import React from 'react';
import { LearnerState } from '../engine/learnerState/types';
import { knowledgeGraph } from '../engine/knowledgeGraph/knowledgeGraph';
import { Compass, Play, Sparkles, AlertTriangle, ArrowUpRight, BarChart2, BookOpen, Layers } from 'lucide-react';
import { SkillType } from '../engine/knowledgeGraph/types';

interface DashboardViewProps {
  learnerState: LearnerState;
  onStartPractice: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  learnerState,
  onStartPractice
}) => {
  const recommendation = learnerState.recommendation;
  const globalProfile = learnerState.globalSkillProfile;

  const getMasteryBadge = (val: number | undefined) => {
    if (val === undefined) return { label: 'Not Assessed', color: 'bg-slate-800 text-slate-400' };
    if (val >= 0.8) return { label: 'Mastered', color: 'bg-emerald-950 text-emerald-400 border border-emerald-800' };
    if (val >= 0.6) return { label: 'Proficient', color: 'bg-cyan-950 text-cyan-400 border border-cyan-800' };
    if (val >= 0.35) return { label: 'Developing', color: 'bg-amber-950 text-amber-400 border border-amber-800' };
    return { label: 'Needs Foundation', color: 'bg-rose-950 text-rose-400 border border-rose-800' };
  };

  const skillDimensions: Array<{ key: SkillType; label: string; desc: string }> = [
    { key: 'recognition', label: 'Recognition', desc: 'Identify syntax & rules' },
    { key: 'reasoning', label: 'Reasoning', desc: 'Predict query behavior' },
    { key: 'diagnosis', label: 'Diagnosis', desc: 'Spot logic flaws' },
    { key: 'correction', label: 'Correction', desc: 'Fix broken SQL' },
    { key: 'implementation', label: 'Implementation', desc: 'Write queries independently' },
  ];

  const conceptualVsPractical = globalProfile.recognition - globalProfile.implementation;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* SECTION 1: PRIMARY "NEXT BEST ACTIVITY" CARD */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-850 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-xs font-semibold rounded-full flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive Recommendation
              </span>
              <span className="text-xs text-slate-400">Targeting your immediate learning edge</span>
            </div>

            {recommendation ? (
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {recommendation.conceptName} — <span className="text-cyan-400 capitalize">{recommendation.skillType}</span>
                </h2>

                <div className="p-4 bg-dark-950/80 rounded-xl border border-slate-800/80 text-sm text-slate-300 flex items-start gap-3">
                  <Compass className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-200">Why this recommendation?</div>
                    <div className="text-slate-400 leading-relaxed text-xs sm:text-sm font-sans">
                      {recommendation.reason}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 italic">Computing initial adaptive baseline...</div>
            )}
          </div>

          <div className="shrink-0 flex flex-col items-start lg:items-end gap-3">
            {recommendation && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>Difficulty: Level {recommendation.difficulty}</span>
                <span>•</span>
                <span>Type: {recommendation.questionType}</span>
              </div>
            )}

            <button
              onClick={onStartPractice}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-xl shadow-cyan-950/60 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Next Best Activity</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: 5-SKILL DIMENSION PROFILE & KNOWING VS DOING INSIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 5-Skill Profile Bars */}
        <div className="lg:col-span-7 bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">5-Skill Proficiency Profile</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Measured Independently</span>
          </div>

          <div className="space-y-4">
            {skillDimensions.map(skill => {
              const val = globalProfile[skill.key] ?? 0;
              const pct = Math.round(val * 100);

              return (
                <div key={skill.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{skill.label}</span>
                      <span className="text-slate-500 ml-2 font-mono text-[11px]">({skill.desc})</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">{pct}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-dark-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Insight Box: Knowing vs Doing */}
          <div className="p-4 bg-dark-950/90 rounded-xl border border-slate-800 text-xs flex items-start gap-3">
            <Layers className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-amber-300">Cognitive Insight — Knowing vs Doing</div>
              <p className="text-slate-400 leading-relaxed">
                {conceptualVsPractical > 0.25
                  ? `Your conceptual recognition (${Math.round(globalProfile.recognition * 100)}%) is significantly ahead of your independent implementation ability (${Math.round(globalProfile.implementation * 100)}%). SkillPilot will prescribe query correction tasks to close this implementation gap.`
                  : `Your 5-skill dimensions are well balanced. SkillPilot will continue pushing difficulty forward.`}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Misconceptions & Recent Log */}
        <div className="lg:col-span-5 bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl flex flex-col">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Active Misconceptions</h3>
          </div>

          <div className="flex-1 space-y-3">
            {Object.keys(learnerState.misconceptions).length === 0 ? (
              <div className="p-6 text-center bg-dark-950/60 rounded-xl border border-slate-800/80 text-slate-500 text-xs italic">
                No active misconceptions detected yet. Practice queries to build diagnostic history.
              </div>
            ) : (
              Object.values(learnerState.misconceptions).map(m => (
                <div key={m.misconceptionId} className="p-3 bg-dark-950 rounded-xl border border-rose-950/80 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-semibold text-rose-300">{m.misconceptionId}</span>
                    <span className="px-2 py-0.5 bg-rose-950 text-rose-400 rounded text-[10px] font-bold border border-rose-800">
                      {m.occurrenceCount} occurrences
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Concept: {m.conceptId} • Remediation: {m.remediationStatus}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: KNOWLEDGE SNAPSHOT MATRIX */}
      <section className="bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">SQL Knowledge Snapshot</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Dynamic Graph State</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {knowledgeGraph.getAllConcepts().map(concept => {
            const masteryVal = learnerState.conceptMastery[concept.conceptId];
            const badge = getMasteryBadge(masteryVal);

            return (
              <div key={concept.conceptId} className="p-4 bg-dark-950/80 border border-slate-800/80 rounded-xl space-y-3 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-sm text-slate-200">{concept.name}</div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold shrink-0 ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{concept.description}</p>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/50 text-slate-500 font-mono">
                  <span>Prereqs: {concept.prerequisites.length}</span>
                  <span className="text-slate-300 font-semibold">
                    {masteryVal !== undefined ? `${Math.round(masteryVal * 100)}%` : '--'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
