import React, { useState, useEffect } from 'react';
import { Question } from '../engine/questionBank/types';
import { EvaluationResult } from '../engine/evaluator/types';
import { AdaptiveRecommendation } from '../engine/learnerState/types';
import { CheckCircle2, AlertCircle, AlertTriangle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { geminiService } from '../services/gemini';

interface FeedbackViewProps {
  question: Question;
  userAnswer: string;
  evalResult: EvaluationResult;
  nextRecommendation: AdaptiveRecommendation | null;
  onContinue: () => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  question,
  userAnswer,
  evalResult,
  nextRecommendation,
  onContinue
}) => {
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    // Automatically trigger AI explanation for partial or incorrect answers
    if (evalResult.correctness !== 'correct') {
      fetchAiExplanation();
    }
  }, [evalResult]);

  const fetchAiExplanation = async () => {
    setIsAiLoading(true);
    try {
      const explanation = await geminiService.generateExplanation(
        question.prompt,
        userAnswer,
        evalResult.feedback,
        evalResult.errorPatterns
      );
      setAiExplanation(explanation);
    } finally {
      setIsAiLoading(false);
    }
  };

  const isCorrect = evalResult.correctness === 'correct';
  const isPartial = evalResult.correctness === 'partially_correct';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Banner Result Card */}
      <div className={`p-6 rounded-2xl border flex items-start gap-4 shadow-xl ${
        isCorrect
          ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
          : isPartial
          ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
          : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
      }`}>
        <div className="p-2 rounded-xl bg-dark-950 border border-slate-800 shrink-0">
          {isCorrect ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          ) : isPartial ? (
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          ) : (
            <AlertCircle className="w-8 h-8 text-rose-400" />
          )}
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              {isCorrect ? 'Correct Answer!' : isPartial ? 'Partially Correct' : 'Needs Another Look'}
            </h2>
            <span className="font-mono text-sm font-bold bg-dark-950 px-3 py-1 rounded-lg border border-slate-800">
              Score: {Math.round(evalResult.score * 100)}%
            </span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed font-sans">{evalResult.feedback}</p>
        </div>
      </div>

      {/* Partial Credit Breakdown Grid */}
      <div className="bg-dark-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Partial Credit Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-dark-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">Syntax Validity</span>
            <div className="font-bold text-slate-200">{Math.round(evalResult.partialCredit.syntaxValidity * 100)}%</div>
          </div>
          <div className="bg-dark-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">Execution</span>
            <div className="font-bold text-slate-200">{Math.round(evalResult.partialCredit.successfulExecution * 100)}%</div>
          </div>
          <div className="bg-dark-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">Correct Output</span>
            <div className="font-bold text-slate-200">{Math.round(evalResult.partialCredit.correctResult * 100)}%</div>
          </div>
          <div className="bg-dark-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">Target Error Fix</span>
            <div className="font-bold text-slate-200">{Math.round(evalResult.partialCredit.targetErrorCorrected * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Detected Misconception / Error Patterns */}
      {evalResult.errorPatterns.length > 0 && (
        <div className="bg-dark-900 border border-rose-950/80 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Detected Misconception Pattern</span>
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            {evalResult.errorPatterns.map(pattern => (
              <span key={pattern} className="px-3 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded-lg">
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Gemini AI Remediation Explanation */}
      <div className="bg-dark-900 border border-cyan-900/60 rounded-2xl p-6 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Gemini AI Learning Coach</span>
          </div>
          <button
            onClick={fetchAiExplanation}
            disabled={isAiLoading}
            className="p-1.5 text-xs text-slate-400 hover:text-cyan-300 rounded flex items-center gap-1 font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="p-4 bg-dark-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
          {isAiLoading ? (
            <div className="text-slate-500 italic">Asking Gemini for deep conceptual remediation...</div>
          ) : (
            aiExplanation || question.explanation
          )}
        </div>
      </div>

      {/* Next Adaptive Recommendation CTA Card */}
      {nextRecommendation && (
        <div className="bg-gradient-to-r from-dark-900 via-dark-850 to-slate-900 border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Next Recommended Step</div>
            <h3 className="text-lg font-bold text-white">
              {nextRecommendation.conceptName} — <span className="text-emerald-400 uppercase">{nextRecommendation.skillType}</span>
            </h3>
            <p className="text-xs text-slate-400 italic">"{nextRecommendation.reason}"</p>
          </div>

          <button
            onClick={onContinue}
            className="w-full py-4 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 shadow-xl shadow-cyan-950 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
          >
            <span>Continue Adaptive Journey</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
