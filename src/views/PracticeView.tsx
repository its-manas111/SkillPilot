import React, { useState } from 'react';
import { Question } from '../engine/questionBank/types';
import { SqlEditor } from '../components/editor/SqlEditor';
import { SchemaViewer } from '../components/editor/SchemaViewer';
import { sqlEngine } from '../engine/sql/sqlEngine';
import { evaluator } from '../engine/evaluator/evaluator';
import { SqlQueryResult, EvaluationResult } from '../engine/evaluator/types';
import { Lightbulb, Sparkles, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { geminiService } from '../services/gemini';

interface PracticeViewProps {
  question: Question;
  onSubmitAnswer: (question: Question, answer: string, evalResult: EvaluationResult) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  question,
  onSubmitAnswer
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCodeQuestion = question.questionType === 'query_correction' || question.questionType === 'write_query';

  const handleEvaluateAndSubmit = async (answerText: string, execResult?: SqlQueryResult | null) => {
    setIsSubmitting(true);
    try {
      const evalResult = evaluator.evaluate(question, answerText, execResult);
      onSubmitAnswer(question, answerText, evalResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchAiHint = async () => {
    setIsAiLoading(true);
    try {
      const hint = await geminiService.generateHint(question.prompt, question.starterCode || '');
      setAiExplanation(hint);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col space-y-6">
      {/* Top Header metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono uppercase font-bold rounded-lg">
            {question.skillType}
          </span>
          <div>
            <h2 className="text-base font-bold text-white">Target Concept: {question.conceptId}</h2>
            <p className="text-xs text-slate-400">Type: {question.questionType} • Difficulty Level {question.difficulty}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {question.hints && question.hints.length > 0 && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-3 py-1.5 text-xs text-amber-400 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/60 rounded-lg flex items-center gap-1.5 transition-all font-mono"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Hint' : 'Get Hint'}</span>
            </button>
          )}

          <button
            onClick={handleFetchAiHint}
            disabled={isAiLoading}
            className="px-3 py-1.5 text-xs text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg flex items-center gap-1.5 transition-all font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAiLoading ? 'Asking Gemini...' : 'Gemini AI Tutor'}</span>
          </button>
        </div>
      </div>

      {/* AI Explanation / Hint Banner */}
      {(showHint || aiExplanation) && (
        <div className="p-4 bg-dark-900 border border-amber-500/40 rounded-xl space-y-2 text-xs">
          {showHint && question.hints[hintIndex] && (
            <div className="flex items-start gap-2 text-amber-300">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Static Hint: </span>
                {question.hints[hintIndex]}
              </div>
            </div>
          )}

          {aiExplanation && (
            <div className="flex items-start gap-2 text-cyan-300 border-t border-slate-800 pt-2 mt-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
              <div>
                <span className="font-semibold">Gemini Guidance: </span>
                {aiExplanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column: Prompt & Options / Schema */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="bg-dark-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white leading-relaxed">{question.prompt}</h3>

            {!isCodeQuestion && question.options && (
              <div className="space-y-2.5 pt-2">
                {question.options.map(opt => {
                  const isSelected = selectedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id)}
                      className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950'
                          : 'bg-dark-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            )}

            {!isCodeQuestion && (
              <button
                onClick={() => handleEvaluateAndSubmit(selectedOption)}
                disabled={!selectedOption || isSubmitting}
                className="w-full py-3.5 px-4 mt-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                <span>Submit Answer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[300px]">
            <SchemaViewer schema={question.schemaContext} />
          </div>
        </div>

        {/* Right Column: Code Editor */}
        <div className="lg:col-span-7 flex flex-col min-h-[500px]">
          {isCodeQuestion ? (
            <SqlEditor
              initialCode={question.starterCode || ''}
              onRunQuery={(code) => sqlEngine.executeQuery(code)}
              onSubmit={(code, res) => handleEvaluateAndSubmit(code, res)}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="bg-dark-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center h-full text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Conceptual Evaluation Mode</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  This activity evaluates your {question.skillType} understanding. Select your answer choice on the left panel to submit.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
