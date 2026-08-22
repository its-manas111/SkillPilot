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

    // Test prerequisite readiness filter
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

  it('Phase 3 — Evaluation Engine: computes partial credit for query correction', () => {
    const corrQuestion = questionBank.getQuestion('q_jc_corr_1');
    expect(corrQuestion).toBeDefined();

    if (corrQuestion) {
      // Partial credit test (syntax valid + execution successful, but wrong result)
      const res = evaluator.evaluate(corrQuestion, 'SELECT * FROM employees e JOIN departments d ON e.id = d.id;', {
        columns: ['employee_name', 'department_name'],
        values: [['Alice Chen', 'Engineering']] // Partial mismatch
      });

      expect(res.score).toBeGreaterThan(0.0);
      expect(res.score).toBeLessThan(1.0);
      expect(res.correctness).toBe('partially_correct');
      expect(res.errorPatterns).toContain('incorrect_join_condition');
    }
  });

  it('Phase 4 & 5 — Learner State & Adaptive Planner: updates state and provides truthful recommendation', () => {
    const state = learnerStateEngine.resetState();
    state.isOnboarded = true;

    // Simulate an attempt on a join question
    const q = questionBank.getQuestion('q_jc_corr_1')!;
    const evalRes = evaluator.evaluate(q, 'SELECT * FROM employees;');

    const updatedState = learnerStateEngine.recordAttempt(
      q.questionId,
      q.conceptId,
      q.skillType,
      q.difficulty,
      'SELECT * FROM employees;',
      evalRes
    );

    expect(updatedState.learningHistory.length).toBe(1);
    expect(updatedState.skillMastery[q.conceptId]).toBeDefined();

    // Verify Adaptive Planner picks next best question and generates truthful recommendation reason
    const { recommendation } = adaptivePlanner.planNextActivity(updatedState);
    expect(recommendation).toBeDefined();
    expect(recommendation.reason).toBeTruthy();
    expect(recommendation.reason.length).toBeGreaterThan(10);
  });
});
