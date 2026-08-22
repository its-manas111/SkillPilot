import React, { useState } from 'react';
import { Question } from '../engine/questionBank/types';
import { adaptivePlanner } from '../engine/planner/adaptivePlanner';
import { evaluator } from '../engine/evaluator/evaluator';
import { sqlEngine } from '../engine/sql/sqlEngine';
import { SqlEditor } from '../components/editor/SqlEditor';
import { SchemaViewer } from '../components/editor/SchemaViewer';
import { Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SqlQueryResult } from '../engine/evaluator/types';

interface DiagnosticViewProps {
  onCompleteDiagnostic: (results: Array<{ question: Question; answer: string; score: number }>) => void;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({ onCompleteDiagnostic }) => {
  const [questions] = useState<Question[]>(() => adaptivePlanner.generateDiagnosticQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Array<{ question: Question; answer: string; score: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    setUserAnswers(prev => ({ ...prev, [currentQuestion.questionId]: optionId }));
  };

  const handleNext = async (answerCode?: string, execResult?: SqlQueryResult | null) => {
    setIsSubmitting(true);
    const ans = answerCode ?? userAnswers[currentQuestion.questionId] ?? '';
    const evalRes = evaluator.evaluate(currentQuestion, ans, execResult);

    const updatedResults = [...results, { question: currentQuestion, answer: ans, score: evalRes.score }];
    setResults(updatedResults);
    setIsSubmitting(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onCompleteDiagnostic(updatedResults);
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Bar Progress */}
      <header className="px-6 py-4 border-b border-slate-800 bg-dark-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-sm">Diagnostic Baseline Assessment</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Question {currentIndex + 1} of {questions.length}</span>
          <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Diagnostic Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Question Prompt & Options / Schema */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-dark-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="px-2.5 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-md uppercase font-semibold">
                {currentQuestion.skillType}
              </span>
              <span className="text-slate-400">Concept: {currentQuestion.conceptId}</span>
            </div>

            <h2 className="text-lg font-bold text-white leading-snug">{currentQuestion.prompt}</h2>

            {currentQuestion.options && (
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map(opt => {
                  const isSelected = userAnswers[currentQuestion.questionId] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
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

            {currentQuestion.options && (
              <button
                onClick={() => handleNext()}
                disabled={!userAnswers[currentQuestion.questionId] || isSubmitting}
                className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                <span>Submit Diagnostic Answer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <SchemaViewer schema={currentQuestion.schemaContext} />
          </div>
        </div>

        {/* Right Side: SQL Editor if question requires query execution */}
        <div className="lg:col-span-7 flex flex-col">
          {currentQuestion.questionType === 'query_correction' || currentQuestion.questionType === 'write_query' ? (
            <SqlEditor
              initialCode={currentQuestion.starterCode || ''}
              onRunQuery={(code) => sqlEngine.executeQuery(code)}
              onSubmit={(code, res) => handleNext(code, res)}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="bg-dark-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Diagnostic Multiple Choice</h3>
                <p className="text-xs text-slate-400 max-w-sm">Select the best answer choice on the left panel to complete this baseline diagnostic step.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
