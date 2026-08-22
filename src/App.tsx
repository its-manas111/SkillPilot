import React, { useState, useEffect } from 'react';
import { learnerStateEngine } from './engine/learnerState/learnerStateEngine';
import { adaptivePlanner } from './engine/planner/adaptivePlanner';
import { questionBank } from './engine/questionBank/questions';
import { LearnerState } from './engine/learnerState/types';
import { Question } from './engine/questionBank/types';
import { EvaluationResult } from './engine/evaluator/types';

import { Navbar } from './components/Navbar';
import { OnboardingView } from './views/OnboardingView';
import { DiagnosticView } from './views/DiagnosticView';
import { DashboardView } from './views/DashboardView';
import { PracticeView } from './views/PracticeView';
import { FeedbackView } from './views/FeedbackView';
import { ProgressView } from './views/ProgressView';
import { DebugDrawer } from './views/DebugDrawer';

type AppStep = 'onboarding' | 'diagnostic' | 'dashboard' | 'practice' | 'feedback' | 'progress';

export function App() {
  const [learnerState, setLearnerState] = useState<LearnerState>(() => learnerStateEngine.getState());
  const [currentStep, setCurrentStep] = useState<AppStep>(() => {
    const st = learnerStateEngine.getState();
    if (!st.isOnboarded) return 'onboarding';
    if (st.learningHistory.length === 0) return 'diagnostic';
    return 'dashboard';
  });

  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [lastSubmission, setLastSubmission] = useState<{
    question: Question;
    answer: string;
    evalResult: EvaluationResult;
  } | null>(null);

  // Compute adaptive recommendation whenever learnerState updates
  useEffect(() => {
    if (learnerState.isOnboarded) {
      const { question, recommendation } = adaptivePlanner.planNextActivity(learnerState);
      learnerState.recommendation = recommendation;
      setActiveQuestion(question);
    }
  }, [learnerState]);

  const handleCompleteOnboarding = (goal: string, experience: string) => {
    learnerStateEngine.setOnboarded(true);
    setLearnerState({ ...learnerStateEngine.getState() });
    setCurrentStep('diagnostic');
  };

  const handleCompleteDiagnostic = (results: Array<{ question: Question; answer: string; score: number }>) => {
    // Record diagnostic attempts into learner state engine
    results.forEach(r => {
      learnerStateEngine.recordAttempt(
        r.question.questionId,
        r.question.conceptId,
        r.question.skillType,
        r.question.difficulty,
        r.answer,
        {
          score: r.score,
          correctness: r.score >= 0.8 ? 'correct' : 'incorrect',
          partialCredit: { syntaxValidity: r.score, successfulExecution: r.score, correctResult: r.score, targetErrorCorrected: r.score, requiredConceptsUsed: r.score },
          skillEvidence: { [r.question.skillType]: r.score },
          conceptEvidence: { [r.question.conceptId]: r.score },
          errorPatterns: r.score < 0.8 ? r.question.errorPatterns || [] : [],
          feedback: r.score >= 0.8 ? 'Diagnostic answer verified.' : 'Diagnostic identified opportunity for practice.'
        }
      );
    });

    const updatedState = learnerStateEngine.getState();
    setLearnerState({ ...updatedState });
    setCurrentStep('dashboard');
  };

  const handleStartPractice = () => {
    if (!activeQuestion) {
      const { question } = adaptivePlanner.planNextActivity(learnerState);
      setActiveQuestion(question);
    }
    setCurrentStep('practice');
  };

  const handleSubmitAnswer = (question: Question, answer: string, evalResult: EvaluationResult) => {
    // Process attempt in Learner State Engine
    const newState = learnerStateEngine.recordAttempt(
      question.questionId,
      question.conceptId,
      question.skillType,
      question.difficulty,
      answer,
      evalResult
    );

    setLearnerState({ ...newState });
    setLastSubmission({ question, answer, evalResult });
    setCurrentStep('feedback');
  };

  const handleContinueAfterFeedback = () => {
    const { question, recommendation } = adaptivePlanner.planNextActivity(learnerState);
    learnerState.recommendation = recommendation;
    setActiveQuestion(question);
    setCurrentStep('dashboard');
  };

  const handleResetState = () => {
    if (window.confirm('Reset all learner state and progress history?')) {
      const fresh = learnerStateEngine.resetState();
      setLearnerState({ ...fresh });
      setCurrentStep('onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Onboarding Step */}
      {currentStep === 'onboarding' && (
        <OnboardingView onComplete={handleCompleteOnboarding} />
      )}

      {/* Diagnostic Baseline Step */}
      {currentStep === 'diagnostic' && (
        <DiagnosticView onCompleteDiagnostic={handleCompleteDiagnostic} />
      )}

      {/* Main Application Layout for Dashboard, Practice, Feedback, Progress */}
      {currentStep !== 'onboarding' && currentStep !== 'diagnostic' && (
        <>
          <Navbar
            activeTab={
              currentStep === 'dashboard'
                ? 'dashboard'
                : currentStep === 'progress'
                ? 'progress'
                : 'practice'
            }
            onNavigate={(tab) => {
              if (tab === 'practice' && !activeQuestion) {
                handleStartPractice();
              } else {
                setCurrentStep(tab);
              }
            }}
            onToggleDebug={() => setIsDebugOpen(!isDebugOpen)}
            onResetState={handleResetState}
          />

          <main className="flex-1 flex flex-col">
            {currentStep === 'dashboard' && (
              <DashboardView
                learnerState={learnerState}
                onStartPractice={handleStartPractice}
              />
            )}

            {currentStep === 'practice' && activeQuestion && (
              <PracticeView
                question={activeQuestion}
                onSubmitAnswer={handleSubmitAnswer}
              />
            )}

            {currentStep === 'feedback' && lastSubmission && (
              <FeedbackView
                question={lastSubmission.question}
                userAnswer={lastSubmission.answer}
                evalResult={lastSubmission.evalResult}
                nextRecommendation={learnerState.recommendation}
                onContinue={handleContinueAfterFeedback}
              />
            )}

            {currentStep === 'progress' && (
              <ProgressView learnerState={learnerState} />
            )}
          </main>

          <DebugDrawer
            isOpen={isDebugOpen}
            onClose={() => setIsDebugOpen(false)}
            learnerState={learnerState}
          />
        </>
      )}
    </div>
  );
}

export default App;
