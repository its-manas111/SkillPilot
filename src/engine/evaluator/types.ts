import { SkillType } from '../knowledgeGraph/types';

export type CorrectnessStatus = 'correct' | 'partially_correct' | 'incorrect';

export interface PartialCreditBreakdown {
  syntaxValidity: number;        // 0.0 to 1.0
  successfulExecution: number;   // 0.0 to 1.0
  correctResult: number;         // 0.0 to 1.0
  targetErrorCorrected: number;  // 0.0 to 1.0
  requiredConceptsUsed: number;  // 0.0 to 1.0
}

export interface SqlQueryResult {
  columns: string[];
  values: any[][];
  error?: string;
  executionTimeMs?: number;
}

export interface EvaluationResult {
  score: number; // 0.0 to 1.0
  correctness: CorrectnessStatus;
  partialCredit: PartialCreditBreakdown;
  skillEvidence: Partial<Record<SkillType, number>>;
  conceptEvidence: Record<string, number>;
  errorPatterns: string[];
  feedback: string;
  executionResult?: SqlQueryResult | null;
  suggestedAction?: string;
}
