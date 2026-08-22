# Adaptive Learning Intelligence System
## Learner-State Data Model & Adaptive Scoring Algorithm — MVP Specification

**Version:** 1.0  
**Status:** MVP Design Baseline  
**Primary Demo Domain:** SQL Interview Preparation  
**AI Constraint:** Free-tier AI only; AI usage must be selective and non-critical to core application functionality.

---

# 1. Product Thesis

The system should not merely measure whether a learner gets an answer right.

It should measure what the learner can:

1. **Recognize**
2. **Reason about**
3. **Diagnose**
4. **Correct**
5. **Implement independently**

The adaptive engine uses evidence from these dimensions to continuously update the learner's knowledge state and decide:

- what concept to teach next,
- what type of activity to present,
- what difficulty to use,
- whether remediation is required,
- whether a misconception has been resolved,
- and whether the learner is ready to advance.

Core loop:

```text
Understand learner
      ↓
Assess
      ↓
Analyze evidence
      ↓
Update learner state
      ↓
Identify gaps / misconceptions
      ↓
Select intervention
      ↓
Teach / practice
      ↓
Assess again
      ↓
Repeat
```

---

# 2. Core Design Principle

## Separate "what the learner knows" from "what the learner can do"

A learner may recognize a SQL concept but still be unable to implement it.

Example:

```text
Recognition       88%
Reasoning         76%
Diagnosis         61%
Correction        52%
Implementation    39%
```

The system should conclude:

> The learner understands the concept better than they can implement it.

This is more useful than reporting a single generic score such as `SQL = 63%`.

---

# 3. Assessment Skill Dimensions

## 3.1 Recognition

Can the learner identify the correct answer or concept?

Example:

> Which JOIN returns all records from the left table?

Typical format:

- MCQ
- matching
- simple concept identification

---

## 3.2 Reasoning

Can the learner understand what a concept or query actually does?

Example:

> What output will this SQL query produce?

Typical format:

- predict query output
- explain query behavior
- conceptual scenario

---

## 3.3 Diagnosis

Can the learner identify what is wrong?

Example:

```sql
SELECT department, COUNT(*)
FROM employees
WHERE COUNT(*) > 5
GROUP BY department;
```

Question:

> What is wrong with this query?

---

## 3.4 Correction

Can the learner fix an existing implementation?

Example:

> Fix the broken SQL query.

This tests whether the learner can translate their diagnosis into an actual correction.

---

## 3.5 Implementation

Can the learner independently construct a solution?

Example:

> Write a query to find the top 3 highest-paid employees in each department.

This is the strongest evidence of practical mastery.

---

# 4. Learner Profile

Top-level learner state:

```json
{
  "learnerId": "user_001",
  "learningGoal": "sql_interview",
  "targetLevel": "advanced",
  "createdAt": "...",
  "lastActiveAt": "...",

  "overallMastery": 0.64,

  "currentConcept": "joins",

  "recommendedActivity": "query_correction",

  "overallProgress": {
    "conceptsStarted": 4,
    "conceptsMastered": 1,
    "assessmentsCompleted": 18,
    "questionsAttempted": 18
  }
}
```

For the MVP, avoid collecting unnecessary personal information.

Only store information required to personalize learning.

---

# 5. Concept Mastery Model

Every learning concept has its own mastery state.

Example:

```json
{
  "conceptId": "joins",
  "conceptName": "SQL Joins",

  "mastery": 0.63,

  "skills": {
    "recognition": 0.82,
    "reasoning": 0.71,
    "diagnosis": 0.58,
    "correction": 0.49,
    "implementation": 0.42
  },

  "confidence": 0.61,

  "attempts": 12,

  "correctAttempts": 8,

  "averageTimeSeconds": 74,

  "hintUsageRate": 0.33,

  "recentPerformance": [
    0.4,
    0.6,
    0.8,
    0.6
  ],

  "errorPatterns": [
    "incorrect_join_condition",
    "wrong_join_type"
  ],

  "status": "developing",

  "lastAssessedAt": "..."
}
```

---

# 6. Unknown vs Weak

A critical rule:

> Lack of evidence must not be treated as failure.

If the learner has never attempted implementation questions for Window Functions:

```text
implementation = null
```

NOT:

```text
implementation = 0
```

Example:

```json
{
  "recognition": 0.72,
  "reasoning": 0.64,
  "diagnosis": null,
  "correction": null,
  "implementation": null
}
```

The system must distinguish:

- **Unknown:** no evidence yet
- **Weak:** evidence shows poor performance

---

# 7. Question Data Model

Every question should contain enough metadata for the deterministic adaptive engine to operate without asking the AI to infer basic information.

```json
{
  "questionId": "join_007",

  "conceptId": "joins",

  "skillType": "correction",

  "difficulty": 2,

  "questionType": "query_correction",

  "prompt": "Fix the following query...",

  "starterCode": "SELECT ...",

  "expectedAnswer": "...",

  "acceptedAnswers": [],

  "errorPatterns": [
    "incorrect_join_condition"
  ],

  "prerequisites": [
    "select",
    "filtering"
  ]
}
```

---

# 8. Recommended Question Types

The MVP should support five assessment types:

1. **MCQ / Recognition**
2. **Predict Output / Reasoning**
3. **Spot the Error / Diagnosis**
4. **Fix the Query / Correction**
5. **Write the Query / Implementation**

Progression:

```text
Recognition
    ↓
Reasoning
    ↓
Diagnosis
    ↓
Correction
    ↓
Independent Implementation
```

The system does not need to force this sequence every time. The adaptive engine selects the appropriate activity based on the learner state.

---

# 9. Assessment Result Model

Every attempt generates an assessment record.

```json
{
  "attemptId": "attempt_102",

  "learnerId": "user_001",

  "questionId": "join_007",

  "conceptId": "joins",

  "skillType": "correction",

  "difficulty": 2,

  "answerStatus": "incorrect",

  "score": 0.4,

  "timeSeconds": 96,

  "hintsUsed": 1,

  "confidence": 2,

  "errorPatterns": [
    "incorrect_join_condition"
  ],

  "attemptNumber": 2,

  "timestamp": "..."
}
```

---

# 10. Partial Credit

Implementation and correction questions should not always be binary.

Recommended MVP scale:

```text
Fully correct       = 1.00
Mostly correct      = 0.75
Partially correct   = 0.50
Fundamentally wrong = 0.00
```

Example:

Expected:

```sql
SELECT department, AVG(salary)
FROM employees
GROUP BY department;
```

Learner submits:

```sql
SELECT department, SUM(salary)
FROM employees
GROUP BY department;
```

The learner demonstrated understanding of:

- SELECT
- GROUP BY
- aggregation

but used the wrong aggregation.

The answer should not count as fully correct, but the evidence should still be retained.

---

# 11. Attempt Score

Define:

- `C` = correctness / partial correctness, 0–1
- `H` = hint factor
- `T` = time factor

Recommended:

```text
Attempt Score = C × H × T
```

## Hint factor

```text
0 hints  → 1.00
1 hint   → 0.85
2 hints  → 0.70
3+ hints → 0.55
```

## Time factor

Let:

```text
timeRatio = actualTime / expectedTime
```

Then:

```text
ratio <= 1.0  → 1.00
ratio <= 1.5  → 0.95
ratio <= 2.0  → 0.85
otherwise     → 0.75
```

Time should have limited influence. A learner should not be heavily penalized for thinking carefully.

---

# 12. Skill Score Update

Use an Exponential Moving Average (EMA).

```text
New Skill Score =
(1 - α) × Old Skill Score
+
α × Current Assessment Score
```

Recommended MVP value:

```text
α = 0.30
```

Example:

```text
Old implementation mastery = 0.50
New assessment score        = 0.80

New =
0.70 × 0.50 +
0.30 × 0.80

= 0.59
```

Result:

```text
50% → 59%
```

One successful question should not suddenly make a learner an expert.

---

# 13. Why EMA?

EMA naturally makes recent evidence more important than old evidence.

This prevents the system from permanently treating a learner as weak because of old mistakes.

It also avoids overreacting to a single unusually good or bad attempt.

---

# 14. Concept Mastery Formula

Recommended weights:

| Skill | Weight |
|---|---:|
| Recognition | 15% |
| Reasoning | 20% |
| Diagnosis | 20% |
| Correction | 20% |
| Implementation | 25% |

Formula:

```text
Mastery =
0.15 × Recognition
+ 0.20 × Reasoning
+ 0.20 × Diagnosis
+ 0.20 × Correction
+ 0.25 × Implementation
```

However, only known skill dimensions should be included.

For example, if Diagnosis and Implementation are `null`:

```text
Mastery =
Σ(weight × knownSkill)
-----------------------
Σ(weight for knownSkill)
```

This prevents missing evidence from becoming a false weakness.

---

# 15. Mastery States

Recommended thresholds:

```text
0.00 – 0.29 → Not Started / Critical Gap
0.30 – 0.49 → Needs Foundation
0.50 – 0.69 → Developing
0.70 – 0.84 → Proficient
0.85 – 1.00 → Mastered
```

## Mastery safeguards

A learner cannot be marked `Mastered` merely through recognition.

Required:

```text
Mastery >= 0.85
AND
Implementation >= 0.70
AND
at least 2 different skill types assessed
AND
no severe unresolved misconception
```

This makes "Mastered" meaningful.

---

# 16. Error / Misconception Model

Track recurring mistakes separately from general scores.

```json
{
  "errorId": "err_021",

  "conceptId": "joins",

  "errorType": "incorrect_join_condition",

  "occurrences": 4,

  "recentOccurrences": 2,

  "lastSeen": "...",

  "resolved": false,

  "severity": 0.72
}
```

Example SQL error types:

```text
wrong_join_type
incorrect_join_condition
missing_group_by
where_vs_having
incorrect_window_partition
incorrect_order_by
aggregation_misuse
syntax_error
```

---

# 17. Error Severity

Recommended formula:

```text
Severity =
0.5 × recurrence
+
0.3 × recency
+
0.2 × difficulty
```

All factors are normalized to 0–1.

Interpretation:

- repeated errors matter more,
- recent errors matter more,
- errors on more difficult tasks carry somewhat more weight.

High severity means the misconception should influence adaptive planning.

---

# 18. Repeated Error Rule

If the same misconception occurs at least twice:

```text
Same misconception ≥ 2 times
        ↓
Trigger remediation
```

Example:

```text
WHERE vs HAVING
      ↓
Repeated twice
      ↓
Stop normal progression
      ↓
Targeted explanation
      ↓
Micro exercise
      ↓
Verification question
      ↓
Resume learning path
```

This is a key adaptive behavior.

---

# 19. Misconception Recovery

Do not mark a misconception as resolved after one correct answer.

Example:

```text
WHERE vs HAVING
```

Learner makes repeated mistakes.

After one successful attempt:

```text
severity: 0.80 → 0.55
```

Require two successful attempts across different questions.

Then:

```text
resolved = true
```

This reduces false confidence.

---

# 20. Confidence Model

If confidence tracking is enabled in the MVP:

```text
confidence = userConfidence / 5
```

Compare correctness and confidence.

| Correctness | Confidence | Interpretation |
|---|---|---|
| Correct | High | Strong knowledge |
| Correct | Low | Fragile knowledge |
| Wrong | Low | Knowledge gap |
| Wrong | High | Potential misconception |

This is useful but can remain a lightweight feature.

---

# 21. Learning State

Maintain a compact recommendation state:

```json
{
  "currentConcept": "joins",

  "currentSkill": "implementation",

  "recommendedActivity": "query_correction",

  "recommendedDifficulty": 2,

  "reason": "Implementation mastery is below 0.60",

  "priority": 0.84
}
```

The `reason` field should be exposed to the UI where appropriate.

Example:

> Recommended because you can identify JOIN types but have struggled to implement JOIN conditions.

This makes the adaptive engine explainable.

---

# 22. Adaptive Activity Selection

After each assessment, evaluate the learner state.

## Rule 1 — Critical concept gap

```text
IF concept mastery < 0.30
→ Explanation + simple recognition
```

## Rule 2 — Recognition gap

```text
IF recognition < 0.60
→ Conceptual / MCQ questions
```

## Rule 3 — Reasoning gap

```text
IF reasoning < 0.60
→ Predict-output / scenario questions
```

## Rule 4 — Diagnosis gap

```text
IF diagnosis < 0.60
→ Spot-the-error exercises
```

## Rule 5 — Correction gap

```text
IF correction < 0.60
→ Edit / fix the query
```

## Rule 6 — Implementation gap

```text
IF implementation < 0.60
→ Write query from scratch
```

## Rule 7 — Strong mastery

```text
IF mastery >= 0.70
AND major skills are reasonably strong
→ Increase difficulty
```

## Rule 8 — Mastered

```text
IF mastery >= 0.85
AND implementation >= 0.70
AND prerequisites are satisfied
AND no severe misconception exists
→ Advance to dependent concept
```

---

# 23. Concept Priority Algorithm

Do not simply choose the concept with the lowest score.

Prerequisites matter.

Recommended:

```text
Priority =
0.40 × Knowledge Gap
+
0.25 × Error Severity
+
0.20 × Prerequisite Readiness
+
0.15 × Recency
```

Where:

```text
Knowledge Gap = 1 - mastery
```

Each factor is normalized to 0–1.

---

# 24. Example Concept Prioritization

Suppose:

### JOIN

```text
Mastery             = 0.48
Error severity      = 0.80
Prerequisite ready  = 1.00
Recent struggle     = 0.90
```

Then:

```text
Gap = 1 - 0.48 = 0.52

Priority =
0.40(0.52)
+ 0.25(0.80)
+ 0.20(1.00)
+ 0.15(0.90)

= 0.743
```

High priority.

### Window Functions

```text
Mastery             = 0.18
Error severity      = 0.30
Prerequisite ready  = 0.40
Recent struggle     = 0.20
```

Then:

```text
Gap = 0.82

Priority =
0.40(0.82)
+ 0.25(0.30)
+ 0.20(0.40)
+ 0.15(0.20)

= 0.513
```

Despite Window Functions having lower mastery, JOINs should be addressed first because the learner is more ready to benefit from JOIN remediation and is actively struggling there.

---

# 25. Difficulty Adaptation

MVP difficulty levels:

```text
1 = Foundation
2 = Intermediate
3 = Advanced
```

Use a short rolling window rather than changing difficulty after every question.

Recommended 3-question window.

Example:

```text
0.90
0.80
0.90
```

→ Increase difficulty.

Example:

```text
0.90
0.30
0.80
```

→ Keep current difficulty.

Basic rule:

```text
3-question average >= 0.85
→ difficulty + 1

3-question average between 0.50 and 0.85
→ difficulty unchanged

3-question average < 0.50
→ difficulty - 1
```

Clamp difficulty to:

```text
1 ≤ difficulty ≤ 3
```

---

# 26. Full Adaptive Loop

```text
                QUESTION
                   │
                   ▼
            Evaluate Answer
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   Correctness    Time       Errors
        │          │          │
        └──────────┼──────────┘
                   ▼
             Update Skill
                   │
                   ▼
            Update Mastery
                   │
                   ▼
        Update Misconceptions
                   │
                   ▼
       ┌───────────────────────┐
       │ Critical misconception│
       │ detected?             │
       └───────────┬───────────┘
                   │
             YES   │   NO
              ↓   │    ↓
        Remediation│ Determine
                   │ weakest skill
                   │
                   └──────┬───────
                          ▼
                Select next activity
                          │
                          ▼
                  Adjust difficulty
                          │
                          ▼
                    Next question
```

---

# 27. Gemini / AI Responsibilities

The AI should be **selective**.

## Deterministic engine handles

- MCQ evaluation
- Exact answer matching
- SQL syntax validation
- SQL execution where available
- Query result comparison
- Basic error classification
- Partial scoring rules
- Mastery calculation
- Error severity
- Progress tracking
- Difficulty selection
- Activity selection
- Concept prioritization

## Gemini handles

- Personalized explanations
- Misconception explanations
- Contextual hints
- Rephrasing explanations
- Optional conversational tutoring
- New content generation only when useful

The core product must not depend on Gemini being available.

---

# 28. AI Context Payload

Do not send the complete learner history to Gemini.

Send a compact state snapshot.

Example:

```json
{
  "concept": "joins",
  "skill": "implementation",

  "mastery": 0.48,

  "skillScores": {
    "recognition": 0.82,
    "reasoning": 0.71,
    "diagnosis": 0.58,
    "correction": 0.49,
    "implementation": 0.42
  },

  "recentError": "incorrect_join_condition",

  "errorOccurrences": 3,

  "attempts": 8,

  "recommendedAction": "targeted_remediation"
}
```

Gemini should then perform a focused task such as:

> Explain the specific misconception at the learner's current level without introducing unrelated concepts.

This minimizes token usage.

---

# 29. AI Failure Strategy

The application must remain functional if the AI API fails or hits a free-tier limit.

The system should still support:

- quizzes,
- query evaluation,
- scoring,
- mastery updates,
- misconception tracking,
- adaptive selection,
- progress visualization,
- next-question selection.

Only AI-dependent enhancements should degrade:

- personalized explanations,
- AI hints,
- conversational tutoring.

Show a graceful fallback instead of breaking the learning flow.

---

# 30. MVP SQL Knowledge Scope

Recommended initial concepts:

1. SELECT & WHERE
2. GROUP BY & Aggregations
3. JOINs
4. Subqueries
5. CTEs
6. Window Functions

Recommended assessment coverage:

```text
Each concept should ideally have:
- Recognition questions
- Reasoning questions
- Diagnosis questions
- Correction questions
- Implementation questions
```

The MVP does not need hundreds of questions.

A smaller, carefully tagged question bank is preferable to large AI-generated content.

---

# 31. Recommended Architecture

```text
                         USER
                           │
                           ▼
                    Assessment UI
                           │
                           ▼
                  Evaluation Engine
                           │
             ┌─────────────┴─────────────┐
             │                           │
      Deterministic Logic           Gemini AI
             │                           │
             └─────────────┬─────────────┘
                           ▼
                     Learner Model
                           │
                           ▼
                    Adaptive Planner
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
          Concept       Activity      Difficulty
          Priority       Type          Level
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                     Next Activity
```

---

# 32. Core Design Philosophy

The MVP should be:

### Deterministic where possible

Use code for predictable logic.

### AI-assisted where valuable

Use Gemini where language understanding or personalization adds genuine value.

### Explainable

Every recommendation should have a reason.

### Adaptive

The next activity should depend on previous evidence.

### Progressive

Move from recognition toward independent implementation.

### Resilient

The application should remain functional without AI.

### Cost-conscious

Avoid unnecessary AI calls and large prompts.

---

# 33. What We Are Explicitly NOT Building Yet

Do not add these to the MVP unless required later:

- ML-based mastery prediction
- complex multi-agent architecture
- dynamically generated entire courses
- huge content libraries
- video generation
- voice tutoring
- advanced spaced-repetition algorithms
- social learning
- leaderboards
- elaborate gamification
- cloud-scale analytics
- unnecessary AI calls for deterministic operations

These can be future extensions.

---

# 34. MVP Definition of "Adaptive"

A learner path is considered genuinely adaptive if:

1. Two learners with different diagnostic results receive different next activities.
2. A learner's next activity changes after a demonstrated misconception.
3. Difficulty changes based on performance.
4. The system distinguishes recognition from implementation.
5. Repeated mistakes trigger targeted remediation.
6. Mastery changes as new evidence arrives.
7. The system can explain why a particular activity was selected.

If these seven behaviors work reliably, the MVP fulfills the core intelligence requirement.

---

# 35. One-Sentence Judge Explanation

> **Every learner interaction produces evidence about recognition, reasoning, diagnosis, correction, and implementation; that evidence updates a live concept-level learner model and misconception profile, which our adaptive engine uses to select the next concept, activity type, and difficulty.**

---

# 36. Future Evolution

Once the MVP is validated, the model could later evolve toward:

```text
MVP
Rule-based adaptation
      ↓
More learner data
      ↓
Personalized weighting
      ↓
Spaced repetition
      ↓
Retention modeling
      ↓
Predictive mastery
      ↓
ML-based adaptive planning
```

But none of these are required for the initial challenge implementation.

---

# 37. Final MVP Intelligence Stack

```text
                 ADAPTIVE LEARNING SYSTEM
                          │
                          ▼
                   Learner Evidence
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
      Correctness      Behavior        Errors
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                   Skill Scores
                          │
                          ▼
                  Concept Mastery
                          │
                          ▼
              Misconception Profile
                          │
                          ▼
                Concept Prioritization
                          │
                          ▼
                 Activity Selection
                          │
                          ▼
                  Difficulty Selection
                          │
                          ▼
                    NEXT ACTIVITY
                          │
                          └──────→ repeat
```

**This document is the baseline specification for the learner-state and adaptive intelligence layer. UI, question-bank design, knowledge graph design, and implementation should build against these contracts rather than redefining them.**
