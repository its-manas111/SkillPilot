import { describe, it, expect } from 'vitest';
import { knowledgeGraph } from '../knowledgeGraph/knowledgeGraph';
import { questionBank } from '../questionBank/questions';
import { evaluator } from '../evaluator/evaluator';
import { learnerStateEngine } from '../learnerState/learnerStateEngine';
import { adaptivePlanner } from '../planner/adaptivePlanner';

describe('SkillPilot Engine Verification Suite', () => {
  it('Phase 1 — Knowledge Graph: correctly evaluates prerequisite graph', () => {
    const concepts = knowledgeGraph.getAllConcepts();
    expect(concepts.length).toBeGreaterThanOrEqual(10);

    const groupById = 'group_by';
    const prereqs = knowledgeGraph.getPrerequisites(groupById);
    expect(prereqs.map(p => p.conceptId)).toContain('aggregation');

    const isMet = knowledgeGraph.isPrerequisitesMet('group_by', { 'aggregation': 0.8 });
    expect(isMet).toBe(true);

    const isNotMet = knowledgeGraph.isPrerequisitesMet('group_by', { 'aggregation': 0.2 });
    expect(isNotMet).toBe(false);
  });

  it('Phase 2 — Question Bank: verifies question items across 5 skill types', () => {
    const questions = questionBank.getAllQuestions();
    expect(questions.length).toBeGreaterThanOrEqual(10);

    const skills = new Set(questions.map(q => q.skillType));
    expect(skills.has('recognition')).toBe(true);
    expect(skills.has('reasoning')).toBe(true);
    expect(skills.has('diagnosis')).toBe(true);
    expect(skills.has('correction')).toBe(true);
    expect(skills.has('implementation')).toBe(true);
  });

  it('Phase 3 — Evaluation Engine: scores multiple choice correctly', () => {
    const mcqQuestion = questionBank.getQuestion('q_sel_rec_1');
    expect(mcqQuestion).toBeDefined();

    if (mcqQuestion) {
      const correctEval = evaluator.evaluate(mcqQuestion, 'opt_where');
      expect(correctEval.score).toBe(1.0);
      expect(correctEval.correctness).toBe('correct');

      const wrongEval = evaluator.evaluate(mcqQuestion, 'opt_select');
      expect(wrongEval.score).toBe(0.0);
      expect(wrongEval.correctness).toBe('incorrect');
    }
  });

  it('Phase 4 — Learner State: supports multi-user state switching and identity isolation', () => {
    const userAState = learnerStateEngine.setUser('user_alpha');
    expect(userAState.learnerId).toBe('user_alpha');

    // User Alpha completes an attempt
    const q = questionBank.getQuestion('q_sel_rec_1')!;
    const evalRes = evaluator.evaluate(q, 'opt_where');
    learnerStateEngine.recordAttempt(q.questionId, q.conceptId, q.skillType, q.difficulty, 'opt_where', evalRes);

    expect(learnerStateEngine.getState().learningHistory.length).toBeGreaterThan(0);

    // Switch to User Beta
    const userBState = learnerStateEngine.setUser('user_beta');
    expect(userBState.learnerId).toBe('user_beta');
    expect(userBState.learningHistory.length).toBe(0); // Isolated fresh state

    // Switch back to User Alpha
    const userAStateReloaded = learnerStateEngine.setUser('user_alpha');
    expect(userAStateReloaded.learningHistory.length).toBeGreaterThan(0); // State preserved
  });

  it('Phase 5 — Adaptive Planner: provides truthful recommendation', () => {
    const state = learnerStateEngine.setUser('test_user');
    state.isOnboarded = true;

    const { recommendation } = adaptivePlanner.planNextActivity(state);
    expect(recommendation).toBeDefined();
    expect(recommendation.reason).toBeTruthy();
    expect(recommendation.reason.length).toBeGreaterThan(10);
  });
});
