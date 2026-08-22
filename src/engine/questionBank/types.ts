import { SkillType } from '../knowledgeGraph/types';

export type QuestionType = 'mcq' | 'predict_output' | 'spot_error' | 'query_correction' | 'write_query';

export interface DatabaseSchemaTable {
  tableName: string;
  columns: Array<{
    name: string;
    type: string;
    isPrimary?: boolean;
    isForeign?: boolean;
    references?: string;
  }>;
  sampleRows: Record<string, any>[];
}

export interface DatabaseSchemaContext {
  dbName: string;
  tables: DatabaseSchemaTable[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface Question {
  questionId: string;
  conceptId: string;
  skillType: SkillType;
  questionType: QuestionType;
  difficulty: 1 | 2 | 3;
  prompt: string;
  contextDescription?: string;
  schemaContext: DatabaseSchemaContext;
  starterCode?: string;         // Broken code for query_correction or template for write_query
  expectedAnswer?: string;       // For MCQ option ID or single text string
  options?: QuestionOption[];    // For MCQ, predict_output, spot_error
  expectedQueryResult?: {
    columns: string[];
    values: any[][];
  };
  acceptedPatterns?: string[];   // Regexes or canonical AST nodes required in write_query
  errorPatterns?: string[];      // Misconception IDs this question targets or diagnoses
  hints: string[];
  explanation: string;
  tags: string[];
  expectedTimeSeconds: number;
}
