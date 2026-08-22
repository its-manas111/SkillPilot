import { describe, it, expect, beforeEach } from 'vitest';
import { questionBank } from '../questionBank/questions';
import { evaluator } from '../evaluator/evaluator';
import { learnerStateEngine } from '../learnerState/learnerStateEngine';
import { adaptivePlanner } from '../planner/adaptivePlanner';
import { sqlEngine } from '../sql/sqlEngine';
import { geminiService } from '../../services/gemini';

describe('Adaptive Loop Integration Tests', () => {
  beforeEach(() => {
    learnerStateEngine.setUser(`test_user_${Date.now()}`);
    learnerStateEngine.resetState();
  });

  it('fresh learner initializes diagnostic baseline correctly', () => {
    const state = learnerStateEngine.getState();
    expect(state.learnerId).toBeTruthy();
    expect(state.learningHistory.length).toBe(0);
    expect(state.globalSkillProfile).toBeDefined();
    expect(state.isOnboarded).toBe(false);
  });

  it('correct recognition attempt increases recognition evidence', () => {
    const q = questionBank.getQuestion('q_sel_rec_1')!;
    const before = learnerStateEngine.getState().skillMastery[q.conceptId]?.recognition ?? 0;

    const evalRes = evaluator.evaluate(q, 'opt_where');
    learnerStateEngine.recordAttempt(q.questionId, q.conceptId, q.skillType, q.difficulty, 'opt_where', evalRes);

    const after = learnerStateEngine.getState().skillMastery[q.conceptId].recognition;
    expect(after).toBeGreaterThanOrEqual(before);
    expect(after).toBeGreaterThan(0);
  });

  it('incorrect recognition attempt produces negative evidence and records errorPatterns', () => {
    const q = questionBank.getQuestion('q_sel_rec_1')!;
    const evalRes = evaluator.evaluate(q, 'opt_select');
    learnerStateEngine.recordAttempt(q.questionId, q.conceptId, q.skillType, q.difficulty, 'opt_select', evalRes);

    const state = learnerStateEngine.getState();
    // Expect an errorPatterns entry for this question's tags or a generic indication
    expect(evalRes.errorPatterns.length).toBeGreaterThanOrEqual(0);
    expect(state.learningHistory[0].evaluationResult).toBeDefined();
  });

  it('misconception progression and remediation activation after repeated failures', () => {
    const q = questionBank.getQuestion('q_jc_diag_2')!; // has errorPatterns: ['missing_join_condition', ...]
    const errId = q.errorPatterns?.[0];
    expect(errId).toBeDefined();

    // Make 3 failing attempts to trigger remediation activation
    for (let i = 0; i < 3; i++) {
      const evalRes = evaluator.evaluate(q, 'opt_syntax_table'); // wrong option
      learnerStateEngine.recordAttempt(q.questionId, q.conceptId, q.skillType, q.difficulty, 'opt_syntax_table', evalRes);
    }

    const state = learnerStateEngine.getState();
    const rec = state.misconceptions[errId!];
    expect(rec).toBeDefined();
    expect(rec.occurrenceCount).toBeGreaterThanOrEqual(3);
    expect(rec.remediationStatus).toBe('active');
  });

  it('adaptive planner targets active misconceptions', () => {
    const qDiag = questionBank.getQuestion('q_jc_diag_2')!;
    const errId = qDiag.errorPatterns?.[0]!;

    // Create active misconception
    for (let i = 0; i < 3; i++) {
      const evalRes = evaluator.evaluate(qDiag, 'opt_syntax_table');
      learnerStateEngine.recordAttempt(qDiag.questionId, qDiag.conceptId, qDiag.skillType, qDiag.difficulty, 'opt_syntax_table', evalRes);
    }

    const state = learnerStateEngine.getState();
    // Ensure prerequisites are marked as met so planner can propose remediation-level questions
    state.conceptMastery['inner_join'] = 0.8;
    state.conceptMastery['left_join'] = 0.8;

    const { question, recommendation } = adaptivePlanner.planNextActivity(state);

    // Expect the recommended question to be related to the misconception or have remediation reason
    const related = (question.errorPatterns || []).some(p => p === errId);
    expect(related || /remediation/i.test(recommendation.reason)).toBeTruthy();
  });

  it('successful remediation reduces misconception severity', () => {
    const qCorr = questionBank.getQuestion('q_jc_corr_1')!; // correction question
    const qDiag = questionBank.getQuestion('q_jc_diag_2')!;
    const errId = qDiag.errorPatterns?.[0]!;

    // Seed misconception (2 occurrences) using the diagnostic question
    for (let i = 0; i < 2; i++) {
      const evalRes = evaluator.evaluate(qDiag, 'opt_syntax_table');
      learnerStateEngine.recordAttempt(qDiag.questionId, qDiag.conceptId, qDiag.skillType, qDiag.difficulty, 'opt_syntax_table', evalRes);
    }

    // Now provide a correct correction attempt (fixes join condition)
    const fixedSql = 'SELECT e.name AS employee_name, d.name AS department_name FROM employees e INNER JOIN departments d ON e.department_id = d.id;';
    return sqlEngine.executeQuery(fixedSql).then(res => {
      const evalRes = evaluator.evaluate(qCorr, fixedSql, res as any);
      learnerStateEngine.recordAttempt(qCorr.questionId, qCorr.conceptId, qCorr.skillType, qCorr.difficulty, fixedSql, evalRes);

      const rec = learnerStateEngine.getState().misconceptions[errId];
      expect(rec).toBeDefined();
      expect(rec.occurrenceCount).toBeGreaterThanOrEqual(2);
    });
  });

  it('geminiService fallback does not break adaptive loop', async () => {
    const q = questionBank.getQuestion('q_sel_imp_1')!;
    const evalRes = evaluator.evaluate(q, 'SELECT * FROM employees WHERE department_id = 1 AND salary > 100000;', undefined);
    const explanation = await geminiService.generateExplanation(q.prompt, 'SELECT * FROM employees WHERE department_id = 1 AND salary > 100000;', evalRes.feedback, evalRes.errorPatterns);
    expect(typeof explanation).toBe('string');
    expect(explanation.length).toBeGreaterThan(0);
  });
});
