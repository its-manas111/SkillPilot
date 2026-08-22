import { KnowledgeGraphManager, knowledgeGraph } from '../knowledgeGraph/knowledgeGraph';
import { QuestionBankManager, questionBank } from '../questionBank/questions';
import { LearnerState, AdaptiveRecommendation } from '../learnerState/types';
import { Question } from '../questionBank/types';
import { SkillType } from '../knowledgeGraph/types';

export class AdaptivePlanner {
  private kg: KnowledgeGraphManager;
  private qb: QuestionBankManager;

  constructor(kg: KnowledgeGraphManager = knowledgeGraph, qb: QuestionBankManager = questionBank) {
    this.kg = kg;
    this.qb = qb;
  }

  /**
   * Main recommendation engine: Selects the next best learning activity and provides a truthful, explainable reason.
   */
  public planNextActivity(state: LearnerState): { question: Question; recommendation: AdaptiveRecommendation } {
    const candidateQuestions = this.qb.getAllQuestions();
    let bestQuestion: Question | null = null;
    let highestScore = -Infinity;
    let bestBreakdown = { skillRelevance: 0, misconceptionRelevance: 0, difficultyFit: 0, freshness: 0 };

    for (const q of candidateQuestions) {
      // 1. Check prerequisite readiness
      const prereqsMet = this.kg.isPrerequisitesMet(q.conceptId, state.conceptMastery, 0.4);
      if (!prereqsMet) {
        continue; // Skip questions whose prerequisites are not yet baseline-mastered
      }

      // Calculate Priority Components
      const skillRelevance = this.calculateSkillRelevance(q, state);
      const misconceptionRelevance = this.calculateMisconceptionRelevance(q, state);
      const difficultyFit = this.calculateDifficultyFit(q, state);
      const freshness = this.calculateFreshness(q, state);

      // Total Priority Formula: 0.40 * Skill + 0.25 * Misconception + 0.20 * Difficulty + 0.15 * Freshness
      const totalScore = (0.40 * skillRelevance) +
                         (0.25 * misconceptionRelevance) +
                         (0.20 * difficultyFit) +
                         (0.15 * freshness);

      if (totalScore > highestScore) {
        highestScore = totalScore;
        bestQuestion = q;
        bestBreakdown = { skillRelevance, misconceptionRelevance, difficultyFit, freshness };
      }
    }

    // Fallback if no ideal question matches candidate filters
    if (!bestQuestion) {
      bestQuestion = candidateQuestions[0];
    }

    // Generate truthful, human-understandable reason based on actual state metrics
    const recommendation = this.generateRecommendation(bestQuestion, state, bestBreakdown);

    return { question: bestQuestion, recommendation };
  }

  private calculateSkillRelevance(q: Question, state: LearnerState): number {
    const conceptSkillProfile = state.skillMastery[q.conceptId];
    const skillScore = conceptSkillProfile ? (conceptSkillProfile[q.skillType] ?? 0.1) : 0.1;
    // Lower current skill score = higher learning priority
    return 1.0 - skillScore;
  }

  private calculateMisconceptionRelevance(q: Question, state: LearnerState): number {
    if (!q.errorPatterns || q.errorPatterns.length === 0) return 0.2;

    const activeMisconceptions = Object.values(state.misconceptions).filter(m => m.remediationStatus === 'active');
    const matches = q.errorPatterns.some(errId =>
      activeMisconceptions.some(m => m.misconceptionId === errId)
    );

    return matches ? 1.0 : 0.1;
  }

  private calculateDifficultyFit(q: Question, state: LearnerState): number {
    const targetDiff = state.difficultyState;
    const diffDelta = Math.abs(q.difficulty - targetDiff);

    if (diffDelta === 0) return 1.0;
    if (diffDelta === 1) return 0.5;
    return 0.1;
  }

  private calculateFreshness(q: Question, state: LearnerState): number {
    const recentIndex = state.recentQuestionIds.indexOf(q.questionId);
    if (recentIndex === -1) return 1.0; // Never seen recently

    // The further back in recent history, the higher the freshness
    return Math.min(1.0, (recentIndex + 1) / state.recentQuestionIds.length);
  }

  /**
   * Generates a truthful explanation for the learner explaining why this recommendation was selected.
   */
  private generateRecommendation(
    q: Question,
    state: LearnerState,
    breakdown: { skillRelevance: number; misconceptionRelevance: number; difficultyFit: number; freshness: number }
  ): AdaptiveRecommendation {
    const concept = this.kg.getConcept(q.conceptId);
    const conceptName = concept?.name ?? q.conceptId;
    const skillProfile = state.skillMastery[q.conceptId];

    let reason = '';

    if (breakdown.misconceptionRelevance > 0.8) {
      reason = `Targeted Remediation: Your recent attempts revealed recurring errors with ${conceptName} (${q.skillType}).`;
    } else if (skillProfile && skillProfile.recognition > 0.6 && (skillProfile.correction < 0.4 || skillProfile.implementation < 0.4)) {
      reason = `Skill Advancement: You demonstrate strong recognition of ${conceptName}, but your ${q.skillType} ability requires further practice.`;
    } else if (breakdown.skillRelevance > 0.7) {
      reason = `Foundational Focus: ${conceptName} (${q.skillType}) is your highest priority area for improvement right now.`;
    } else {
      reason = `Adaptive Practice: Recommended next activity in ${conceptName} to match your current proficiency level.`;
    }

    const skillVal = skillProfile ? (skillProfile[q.skillType] ?? 0.2) : 0.2;
    const skillStatus = skillVal > 0.75 ? 'Proficient' : skillVal > 0.45 ? 'Developing' : 'Needs Practice';

    return {
      conceptId: q.conceptId,
      conceptName,
      skillType: q.skillType,
      questionType: q.questionType,
      difficulty: q.difficulty,
      questionId: q.questionId,
      reason,
      evidenceSummary: {
        skillName: `${q.skillType.charAt(0).toUpperCase() + q.skillType.slice(1)}`,
        skillStatus
      }
    };
  }

  /**
   * Generate initial diagnostic baseline test set.
   */
  public generateDiagnosticQuestions(): Question[] {
    // Select one baseline question per core concept
    const baselineConcepts = ['select_where', 'aggregation', 'group_by', 'inner_join', 'subqueries'];
    const questions: Question[] = [];

    baselineConcepts.forEach(cid => {
      const qs = this.qb.getQuestionsByConcept(cid);
      if (qs.length > 0) {
        questions.push(qs[0]);
      }
    });

    return questions;
  }
}

export const adaptivePlanner = new AdaptivePlanner();
