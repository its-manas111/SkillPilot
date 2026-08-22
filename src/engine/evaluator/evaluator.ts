import { Question } from '../questionBank/types';
import { EvaluationResult, SqlQueryResult, PartialCreditBreakdown, CorrectnessStatus } from './types';

export class EvaluationEngine {
  /**
   * Main entry point to evaluate learner response against a question.
   */
  public evaluate(
    question: Question,
    userAnswer: string,
    executionResult?: SqlQueryResult | null
  ): EvaluationResult {
    switch (question.questionType) {
      case 'mcq':
      case 'predict_output':
      case 'spot_error':
        return this.evaluateMultipleChoice(question, userAnswer);

      case 'query_correction':
        return this.evaluateQueryCorrection(question, userAnswer, executionResult);

      case 'write_query':
        return this.evaluateQueryImplementation(question, userAnswer, executionResult);

      default:
        return this.evaluateMultipleChoice(question, userAnswer);
    }
  }

  /**
   * Evaluate Multiple Choice / Predict Output / Spot Error options.
   */
  private evaluateMultipleChoice(question: Question, selectedOptionId: string): EvaluationResult {
    const selectedOption = question.options?.find(o => o.id === selectedOptionId);
    const isCorrect = selectedOption?.isCorrect ?? (selectedOptionId === question.expectedAnswer);

    const score = isCorrect ? 1.0 : 0.0;
    const correctness: CorrectnessStatus = isCorrect ? 'correct' : 'incorrect';
    const errorPatterns: string[] = [];

    if (!isCorrect && question.errorPatterns) {
      errorPatterns.push(...question.errorPatterns);
    }

    const feedback = isCorrect
      ? `Correct! ${question.explanation}`
      : `Needs another look. ${selectedOption?.explanation ?? question.explanation}`;

    return {
      score,
      correctness,
      partialCredit: {
        syntaxValidity: isCorrect ? 1.0 : 0.0,
        successfulExecution: 1.0,
        correctResult: isCorrect ? 1.0 : 0.0,
        targetErrorCorrected: isCorrect ? 1.0 : 0.0,
        requiredConceptsUsed: isCorrect ? 1.0 : 0.0,
      },
      skillEvidence: {
        [question.skillType]: score
      },
      conceptEvidence: {
        [question.conceptId]: score
      },
      errorPatterns,
      feedback
    };
  }

  /**
   * Evaluate Query Correction task with partial credit:
   * Syntax validity (20%), Execution (20%), Correct result (40%), Target error corrected (20%)
   */
  private evaluateQueryCorrection(
    question: Question,
    sqlQuery: string,
    executionResult?: SqlQueryResult | null
  ): EvaluationResult {
    const errorPatterns: string[] = [];

    // 1. Syntax check
    const hasSyntaxError = executionResult?.error !== undefined && executionResult.error !== null;
    const syntaxValidity = hasSyntaxError ? 0.0 : 1.0;
    if (hasSyntaxError) {
      errorPatterns.push('syntax_error');
    }

    // 2. Successful execution check
    const successfulExecution = (executionResult && !executionResult.error) ? 1.0 : 0.0;

    // 3. Result correctness comparison
    let correctResult = 0.0;
    if (successfulExecution === 1.0 && executionResult && question.expectedQueryResult) {
      correctResult = this.compareResults(executionResult, question.expectedQueryResult);
    }

    // 4. Target error corrected (Check patterns/regex)
    let targetErrorCorrected = 0.0;
    if (question.acceptedPatterns && question.acceptedPatterns.length > 0) {
      const allPatternsMatch = question.acceptedPatterns.every(pat =>
        new RegExp(pat, 'i').test(sqlQuery)
      );
      targetErrorCorrected = allPatternsMatch ? 1.0 : 0.0;
    } else {
      targetErrorCorrected = correctResult;
    }

    if (targetErrorCorrected === 0.0 && question.errorPatterns) {
      errorPatterns.push(...question.errorPatterns);
    }

    // Calculate Weighted Score
    const score = (syntaxValidity * 0.20) +
                  (successfulExecution * 0.20) +
                  (correctResult * 0.40) +
                  (targetErrorCorrected * 0.20);

    const correctness: CorrectnessStatus =
      score >= 0.95 ? 'correct' : score >= 0.4 ? 'partially_correct' : 'incorrect';

    const feedback = this.generateFeedback(score, correctness, executionResult, question);

    return {
      score,
      correctness,
      partialCredit: {
        syntaxValidity,
        successfulExecution,
        correctResult,
        targetErrorCorrected,
        requiredConceptsUsed: targetErrorCorrected
      },
      skillEvidence: {
        [question.skillType]: score
      },
      conceptEvidence: {
        [question.conceptId]: score
      },
      errorPatterns,
      feedback,
      executionResult
    };
  }

  /**
   * Evaluate Query Implementation task with partial credit:
   * Execution correctness (50%), Result correctness (30%), Required concepts (10%), Structural validity (10%)
   */
  private evaluateQueryImplementation(
    question: Question,
    sqlQuery: string,
    executionResult?: SqlQueryResult | null
  ): EvaluationResult {
    const errorPatterns: string[] = [];

    // 1. Structural validity
    const structuralValidity = sqlQuery.trim().length > 10 ? 1.0 : 0.0;

    // 2. Execution correctness
    const hasError = executionResult?.error !== undefined && executionResult.error !== null;
    const executionCorrectness = (executionResult && !hasError) ? 1.0 : 0.0;
    if (hasError) {
      errorPatterns.push('syntax_error');
    }

    // 3. Result correctness
    let resultCorrectness = 0.0;
    if (executionCorrectness === 1.0 && executionResult && question.expectedQueryResult) {
      resultCorrectness = this.compareResults(executionResult, question.expectedQueryResult);
    }

    // 4. Required concepts used (accepted patterns)
    let requiredConceptsUsed = 1.0;
    if (question.acceptedPatterns && question.acceptedPatterns.length > 0) {
      const matchCount = question.acceptedPatterns.filter(pat =>
        new RegExp(pat, 'i').test(sqlQuery)
      ).length;
      requiredConceptsUsed = matchCount / question.acceptedPatterns.length;
    }

    // Weighted Score
    const score = (executionCorrectness * 0.50) +
                  (resultCorrectness * 0.30) +
                  (requiredConceptsUsed * 0.10) +
                  (structuralValidity * 0.10);

    const correctness: CorrectnessStatus =
      score >= 0.95 ? 'correct' : score >= 0.4 ? 'partially_correct' : 'incorrect';

    const feedback = this.generateFeedback(score, correctness, executionResult, question);

    return {
      score,
      correctness,
      partialCredit: {
        syntaxValidity: structuralValidity,
        successfulExecution: executionCorrectness,
        correctResult: resultCorrectness,
        targetErrorCorrected: requiredConceptsUsed,
        requiredConceptsUsed
      },
      skillEvidence: {
        [question.skillType]: score
      },
      conceptEvidence: {
        [question.conceptId]: score
      },
      errorPatterns,
      feedback,
      executionResult
    };
  }

  /**
   * Helper to compare query results against expected results.
   */
  private compareResults(actual: SqlQueryResult, expected: { columns: string[]; values: any[][] }): number {
    if (!actual.values || actual.values.length !== expected.values.length) {
      return 0.5; // Row count mismatch but query ran
    }

    // Convert values to string representation for comparison
    const actualStr = JSON.stringify(actual.values);
    const expectedStr = JSON.stringify(expected.values);

    if (actualStr === expectedStr) {
      return 1.0;
    }

    // Partial match if rows count matches
    return 0.7;
  }

  private generateFeedback(
    score: number,
    correctness: CorrectnessStatus,
    executionResult: SqlQueryResult | null | undefined,
    question: Question
  ): string {
    if (executionResult?.error) {
      return `SQL Execution Error: ${executionResult.error}. Please check your syntax.`;
    }

    if (correctness === 'correct') {
      return `Excellent work! Your query executed cleanly and returned the exact expected results. ${question.explanation}`;
    }

    if (correctness === 'partially_correct') {
      return `Good progress! Your query ran successfully, but the output dataset or structure needs refinement to match the target. ${question.explanation}`;
    }

    return `Needs another look. ${question.explanation}`;
  }
}

export const evaluator = new EvaluationEngine();
