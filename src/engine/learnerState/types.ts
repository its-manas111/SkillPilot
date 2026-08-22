import { SkillType } from '../knowledgeGraph/types';
import { EvaluationResult } from '../evaluator/types';

export interface SkillProfile {
  recognition: number;
  reasoning: number;
  diagnosis: number;
  correction: number;
  implementation: number;
}

export interface MisconceptionRecord {
  misconceptionId: string;
  conceptId: string;
  occurrenceCount: number;
  lastOccurrence: string; // ISO date string
  severity: 'minor' | 'moderate' | 'critical';
  remediationStatus: 'active' | 'in_remediation' | 'resolved';
}

export interface AttemptRecord {
  attemptId: string;
  timestamp: string;
  questionId: string;
  conceptId: string;
  skillType: SkillType;
  difficulty: number;
  userAnswer: string;
  evaluationResult: EvaluationResult;
}

export interface AdaptiveRecommendation {
  conceptId: string;
  conceptName: string;
  skillType: SkillType;
  questionType: string;
  difficulty: 1 | 2 | 3;
  questionId: string;
  reason: string; // Truthful explanation derived from actual learner state
  evidenceSummary: {
    skillName: string;
    skillStatus: string;
  };
}

export interface LearnerState {
  learnerId: string;
  conceptMastery: Record<string, number>; // conceptId -> overall mastery (0.0 to 1.0)
  skillMastery: Record<string, SkillProfile>; // conceptId -> 5 skill dimensions
  globalSkillProfile: SkillProfile; // Aggregated 5 skill dimensions across concepts
  confidence: number; // 0.0 to 1.0
  misconceptions: Record<string, MisconceptionRecord>;
  recentAttempts: AttemptRecord[];
  recentQuestionIds: string[];
  difficultyState: 1 | 2 | 3;
  learningHistory: AttemptRecord[];
  recommendation: AdaptiveRecommendation | null;
  lastUpdated: string;
  isOnboarded: boolean;
}
