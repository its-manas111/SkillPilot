import { SkillType } from '../knowledgeGraph/types';
import { LearnerState, SkillProfile, MisconceptionRecord, AttemptRecord } from './types';
import { EvaluationResult } from '../evaluator/types';

const LOCAL_STORAGE_KEY = 'skillpilot_learner_state_v1';
const EMA_ALPHA = 0.35; // Learning rate giving 35% weight to recent evidence

const DEFAULT_SKILL_PROFILE: SkillProfile = {
  recognition: 0.20,
  reasoning: 0.15,
  diagnosis: 0.10,
  correction: 0.10,
  implementation: 0.05,
};

export class LearnerStateEngine {
  private state: LearnerState;

  constructor() {
    this.state = this.loadState();
  }

  /**
   * Load state from LocalStorage or initialize default state.
   */
  public loadState(): LearnerState {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {
      console.warn('Failed to read learner state from localStorage:', e);
    }
    return this.createDefaultState();
  }

  /**
   * Save current state to LocalStorage.
   */
  public saveState(): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.warn('Failed to save learner state to localStorage:', e);
    }
  }

  public createDefaultState(): LearnerState {
    return {
      learnerId: 'learner_default',
      conceptMastery: {},
      skillMastery: {},
      globalSkillProfile: { ...DEFAULT_SKILL_PROFILE },
      confidence: 0.5,
      misconceptions: {},
      recentAttempts: [],
      recentQuestionIds: [],
      difficultyState: 1,
      learningHistory: [],
      recommendation: null,
      lastUpdated: new Date().toISOString(),
      isOnboarded: false,
    };
  }

  public getState(): LearnerState {
    return this.state;
  }

  public resetState(): LearnerState {
    this.state = this.createDefaultState();
    this.saveState();
    return this.state;
  }

  /**
   * Process a new question attempt and update learner state deterministically.
   */
  public recordAttempt(
    questionId: string,
    conceptId: string,
    skillType: SkillType,
    difficulty: number,
    userAnswer: string,
    evalResult: EvaluationResult
  ): LearnerState {
    const attempt: AttemptRecord = {
      attemptId: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      questionId,
      conceptId,
      skillType,
      difficulty,
      userAnswer,
      evaluationResult: evalResult
    };

    // 1. Append attempt history
    this.state.learningHistory.push(attempt);
    this.state.recentAttempts = [attempt, ...this.state.recentAttempts.slice(0, 9)];

    // 2. Track question freshness (keep last 15 questions)
    this.state.recentQuestionIds = Array.from(new Set([questionId, ...this.state.recentQuestionIds])).slice(0, 15);

    // 3. Update Skill Mastery using EMA
    this.updateSkillMastery(conceptId, skillType, evalResult.score);

    // 4. Process Misconceptions
    this.processMisconceptions(conceptId, evalResult.errorPatterns);

    // 5. Update overall Concept Mastery
    this.updateConceptMastery(conceptId);

    // 6. Update global aggregate skill profile
    this.updateGlobalSkillProfile();

    // 7. Adapt difficulty state based on recent performance
    this.adaptDifficulty();

    this.state.lastUpdated = new Date().toISOString();
    this.saveState();
    return this.state;
  }

  /**
   * Update specific skill dimension for a concept using Exponential Moving Average (EMA).
   */
  private updateSkillMastery(conceptId: string, skillType: SkillType, currentEvidence: number): void {
    if (!this.state.skillMastery[conceptId]) {
      this.state.skillMastery[conceptId] = { ...DEFAULT_SKILL_PROFILE };
    }

    const currentProfile = this.state.skillMastery[conceptId];
    const prevScore = currentProfile[skillType] ?? 0.1;

    // EMA Update Formula: newScore = alpha * evidence + (1 - alpha) * prevScore
    const newScore = (EMA_ALPHA * currentEvidence) + ((1 - EMA_ALPHA) * prevScore);
    currentProfile[skillType] = Math.min(1.0, Math.max(0.0, parseFloat(newScore.toFixed(3))));
  }

  /**
   * Process detected error patterns and manage misconception remediation lifecycle.
   */
  private processMisconceptions(conceptId: string, errorPatterns: string[]): void {
    const now = new Date().toISOString();

    errorPatterns.forEach(errId => {
      if (!errId) return;

      const existing = this.state.misconceptions[errId];
      if (existing) {
        const count = existing.occurrenceCount + 1;
        this.state.misconceptions[errId] = {
          ...existing,
          occurrenceCount: count,
          lastOccurrence: now,
          // If 3+ occurrences, set remediation to active
          remediationStatus: count >= 3 ? 'active' : existing.remediationStatus
        };
      } else {
        this.state.misconceptions[errId] = {
          misconceptionId: errId,
          conceptId,
          occurrenceCount: 1,
          lastOccurrence: now,
          severity: errId.includes('join') || errId.includes('where_vs_having') ? 'critical' : 'moderate',
          remediationStatus: 'active'
        };
      }
    });
  }

  /**
   * Calculate aggregated mastery for a concept from its 5 skill dimensions.
   */
  private updateConceptMastery(conceptId: string): void {
    const profile = this.state.skillMastery[conceptId];
    if (!profile) return;

    // Weighted composite score emphasizing higher cognitive levels (Correction & Implementation)
    const weights: Record<SkillType, number> = {
      recognition: 0.10,
      reasoning: 0.15,
      diagnosis: 0.20,
      correction: 0.25,
      implementation: 0.30
    };

    let totalWeight = 0;
    let weightedSum = 0;

    (Object.keys(weights) as SkillType[]).forEach(st => {
      const val = profile[st] ?? 0;
      weightedSum += val * weights[st];
      totalWeight += weights[st];
    });

    const compositeMastery = weightedSum / totalWeight;
    this.state.conceptMastery[conceptId] = parseFloat(compositeMastery.toFixed(3));
  }

  /**
   * Calculate global aggregated 5-skill radar profile across all active concepts.
   */
  private updateGlobalSkillProfile(): void {
    const conceptIds = Object.keys(this.state.skillMastery);
    if (conceptIds.length === 0) return;

    const skillSums: SkillProfile = {
      recognition: 0,
      reasoning: 0,
      diagnosis: 0,
      correction: 0,
      implementation: 0
    };

    conceptIds.forEach(cid => {
      const p = this.state.skillMastery[cid];
      (Object.keys(skillSums) as SkillType[]).forEach(st => {
        skillSums[st] += p[st] ?? 0;
      });
    });

    const count = conceptIds.length;
    (Object.keys(skillSums) as SkillType[]).forEach(st => {
      this.state.globalSkillProfile[st] = parseFloat((skillSums[st] / count).toFixed(3));
    });
  }

  /**
   * Adapt difficulty state based on recent 3 attempt scores.
   */
  private adaptDifficulty(): void {
    const recent = this.state.recentAttempts.slice(0, 3);
    if (recent.length < 3) return;

    const avgScore = recent.reduce((sum, a) => sum + a.evaluationResult.score, 0) / 3;

    if (avgScore >= 0.85 && this.state.difficultyState < 3) {
      this.state.difficultyState = (this.state.difficultyState + 1) as 1 | 2 | 3;
    } else if (avgScore < 0.40 && this.state.difficultyState > 1) {
      this.state.difficultyState = (this.state.difficultyState - 1) as 1 | 2 | 3;
    }
  }

  public setOnboarded(onboarded: boolean): void {
    this.state.isOnboarded = onboarded;
    this.saveState();
  }
}

export const learnerStateEngine = new LearnerStateEngine();
