# SQL Knowledge Graph + Question-Bank Design
## Adaptive Learning Intelligence System — MVP Specification

**Version:** 1.0  
**Status:** MVP Design Baseline  
**Domain:** SQL Interview Preparation  
**Purpose:** Define the SQL knowledge graph, concept dependencies, question-bank schema, assessment taxonomy, evaluation rules, misconception mapping, and content-selection metadata used by the adaptive learning engine.

---

# 1. Purpose

The SQL layer is the first concrete learning domain for the Adaptive Learning Intelligence System.

It should provide enough structured knowledge and assessment evidence for the adaptive engine to determine:

- what the learner knows,
- what they can recognize,
- what they can reason about,
- what errors they can diagnose,
- what errors they can correct,
- what they can implement independently,
- which misconceptions are recurring,
- which concept should be taught next,
- which activity type should be selected,
- and what difficulty should be used.

The SQL content layer should be **structured and deterministic wherever possible**.

AI should not be responsible for understanding the entire curriculum or deciding basic learning dependencies.

---

# 2. Design Principles

## 2.1 Concepts are not lessons

A concept is a node in the knowledge graph.

A lesson or activity is an experience designed to improve mastery of one or more concepts.

Example:

```text
Concept:
JOINs

Activities:
- identify JOIN type
- predict JOIN output
- spot JOIN error
- fix JOIN condition
- write JOIN query
```

---

## 2.2 Skills are separate from concepts

A learner may know the concept but lack implementation ability.

Therefore:

```text
Concept = WHAT is being learned
Skill = HOW the learner demonstrates knowledge
```

---

## 2.3 Prerequisites matter

The lowest mastery concept is not automatically the next concept.

Example:

```text
JOINs
   ↓
Subqueries
   ↓
CTEs

JOINs
   ↓
Window Functions
```

The learner should not be pushed into advanced concepts before prerequisite readiness is sufficient.

---

## 2.4 Questions should produce diagnostic evidence

Every question must be designed to answer at least one useful learner-state question.

Bad:

> What is a JOIN?

Better:

> Given these two tables, which JOIN produces this output?

Best:

> Fix the JOIN condition in the following query and explain why the original condition was incorrect.

---

## 2.5 The question bank is curated for MVP

Do not dynamically generate the entire curriculum with AI.

The MVP should use a smaller, carefully tagged question bank.

Benefits:

- predictable evaluation,
- lower AI usage,
- faster response,
- easier debugging,
- reliable adaptive behavior,
- reproducible demos.

---

# 3. SQL Knowledge Graph

The MVP knowledge graph contains six primary concepts:

```text
SQL Fundamentals
│
├── SELECT & WHERE
│
├── GROUP BY & Aggregations
│
├── JOINs
│
├── Subqueries
│
├── CTEs
│
└── Window Functions
```

However, internally these should be represented as smaller concept nodes.

---

# 4. Knowledge Graph Node Types

Use four node categories.

## 4.1 Foundation

Basic concepts required by many other concepts.

Examples:

```text
SELECT
FROM
WHERE
ORDER BY
```

---

## 4.2 Core Concept

A meaningful SQL capability.

Examples:

```text
GROUP BY
JOINs
Subqueries
CTEs
Window Functions
```

---

## 4.3 Skill / Technique

Specific techniques within a concept.

Examples:

```text
INNER JOIN
LEFT JOIN
HAVING
ROW_NUMBER
PARTITION BY
```

---

## 4.4 Advanced Application

Complex combinations of concepts.

Examples:

```text
Top-N per group
Deduplication
Running totals
Multi-table analytical queries
```

Advanced application nodes can be added after the core MVP.

---

# 5. Proposed SQL Knowledge Graph

```text
SQL Fundamentals
│
├── SELECT
│   ├── FROM
│   ├── WHERE
│   ├── ORDER BY
│   └── LIMIT
│
├── Aggregation
│   ├── Aggregate Functions
│   ├── GROUP BY
│   └── HAVING
│
├── JOINs
│   ├── JOIN Condition
│   ├── INNER JOIN
│   ├── LEFT JOIN
│   └── Multi-table JOIN
│
├── Subqueries
│   ├── Scalar Subquery
│   ├── IN Subquery
│   └── Correlated Subquery
│
├── CTEs
│   ├── WITH Clause
│   ├── Single CTE
│   └── Multiple CTEs
│
└── Window Functions
    ├── OVER
    ├── PARTITION BY
    ├── Window ORDER BY
    ├── ROW_NUMBER
    ├── RANK
    └── Running Aggregations
```

---

# 6. Knowledge Graph Dependencies

Recommended prerequisite relationships:

```text
SELECT
  ↓
Filtering
  ↓
Aggregation
  ↓
HAVING
```

```text
SELECT
  +
Filtering
  ↓
JOINs
```

```text
SELECT
  +
Filtering
  +
Aggregation
  ↓
Subqueries
```

```text
SELECT
  +
Filtering
  +
Aggregation
  ↓
CTEs
```

```text
Aggregation
  +
JOINs
  +
ORDER BY
  ↓
Window Functions
```

This is a logical dependency model, not a rigid course sequence.

The adaptive engine can revisit prerequisites when evidence indicates a gap.

---

# 7. Knowledge Graph Node Schema

Each node should follow a common schema.

```json
{
  "conceptId": "window_functions",
  "name": "Window Functions",

  "type": "core",

  "description": "Perform calculations across related rows without collapsing them.",

  "parentConcept": "advanced_sql",

  "prerequisites": [
    "select",
    "aggregation",
    "order_by"
  ],

  "recommendedSkillOrder": [
    "recognition",
    "reasoning",
    "diagnosis",
    "correction",
    "implementation"
  ],

  "difficultyRange": [2, 3],

  "status": "active"
}
```

---

# 8. Prerequisite Readiness

For each concept, calculate prerequisite readiness.

Example:

```text
Window Functions prerequisites:

SELECT        0.90
Aggregation  0.78
ORDER BY      0.82
JOINs         0.70
```

A simple MVP formula:

```text
Prerequisite Readiness =
average(prerequisite mastery)
```

Example:

```text
(0.90 + 0.78 + 0.82 + 0.70) / 4
= 0.80
```

If no prerequisites exist:

```text
Prerequisite Readiness = 1.0
```

---

# 9. Readiness Threshold

Recommended:

```text
Prerequisite readiness >= 0.70
```

means the learner is generally ready to attempt the dependent concept.

Below 0.70:

- continue prerequisite remediation,
- or introduce the new concept only with scaffolding.

Do not block learning absolutely. This threshold should guide the adaptive planner rather than create an inflexible curriculum.

---

# 10. Question-Bank Taxonomy

Each question belongs to:

```text
Concept
+
Skill Type
+
Question Type
+
Difficulty
+
Expected Error Patterns
+
Prerequisites
```

The five primary skill types are:

```text
recognition
reasoning
diagnosis
correction
implementation
```

---

# 11. Question Types

## Type A — MCQ

Tests recognition.

Example:

> Which clause filters aggregated groups?

Expected:

```text
HAVING
```

---

## Type B — Predict Output

Tests reasoning.

Example:

```sql
SELECT department, COUNT(*)
FROM employees
GROUP BY department;
```

Ask:

> What does this query return?

---

## Type C — Spot the Error

Tests diagnosis.

Example:

```sql
SELECT department, COUNT(*)
FROM employees
WHERE COUNT(*) > 5
GROUP BY department;
```

Expected diagnosis:

```text
where_vs_having
```

---

## Type D — Fix the Query

Tests correction.

The learner edits an existing query.

Expected output is evaluated structurally and/or through execution.

---

## Type E — Write the Query

Tests independent implementation.

Example:

> Find the highest-paid employee in each department.

This should carry the greatest weight in mastery.

---

# 12. Question Schema

Recommended complete schema:

```json
{
  "questionId": "having_003",

  "conceptId": "having",

  "skillType": "diagnosis",

  "questionType": "spot_error",

  "difficulty": 2,

  "title": "Find the SQL error",

  "prompt": "Identify the problem in the following query.",

  "context": {
    "tables": [
      "employees"
    ]
  },

  "starterCode": "SELECT department, COUNT(*) FROM employees WHERE COUNT(*) > 5 GROUP BY department;",

  "expectedAnswer": "Use HAVING instead of WHERE for the aggregate condition.",

  "acceptedAnswers": [],

  "errorPatterns": [
    "where_vs_having"
  ],

  "prerequisites": [
    "select",
    "aggregation",
    "group_by"
  ],

  "expectedTimeSeconds": 60,

  "hints": [
    "Ask yourself whether the condition is applied before or after aggregation."
  ],

  "explanation": "WHERE filters rows before aggregation. HAVING filters grouped results after aggregation.",

  "tags": [
    "aggregation",
    "having",
    "common_mistake"
  ]
}
```

---

# 13. Evaluation Strategy by Question Type

Different question types require different evaluation methods.

| Question Type | Primary Evaluation |
|---|---|
| MCQ | Exact answer |
| Predict Output | Expected output |
| Spot Error | Error classification |
| Fix Query | Syntax + execution + structural checks |
| Write Query | Execution + expected result + structural checks |

AI should not be the default evaluator.

---

# 14. MCQ Evaluation

Simple deterministic evaluation:

```text
selectedAnswer == correctAnswer
```

Output:

```text
score = 1.0
```

or:

```text
score = 0.0
```

Partial credit is unnecessary.

---

# 15. Predict Output Evaluation

For deterministic datasets:

1. Execute learner query.
2. Execute expected query/result.
3. Normalize results.
4. Compare.

Normalization should account for:

- row ordering where order is not semantically required,
- whitespace,
- casing where appropriate,
- numeric formatting.

Do not normalize away meaningful SQL differences when order or formatting is explicitly part of the task.

---

# 16. Spot Error Evaluation

The question defines expected error patterns.

Example:

```json
{
  "errorPatterns": [
    "where_vs_having"
  ]
}
```

Learner response can be classified as:

```text
Correct diagnosis
Partial diagnosis
Incorrect diagnosis
No diagnosis
```

For the MVP:

```text
Correct      = 1.00
Partial      = 0.50
Incorrect    = 0.00
```

If free-tier AI is used to interpret a natural-language diagnosis, keep the prompt tightly scoped.

---

# 17. Fix Query Evaluation

Use multiple signals:

```text
Syntax valid?
      ↓
Query executes?
      ↓
Expected result?
      ↓
Required concept used?
      ↓
Known error removed?
```

Suggested scoring:

```text
Syntax valid             0.20
Executes successfully    0.20
Correct result            0.40
Target error corrected    0.20
```

Total:

```text
1.00
```

This allows partial credit.

---

# 18. Write Query Evaluation

For independent implementation:

```text
Execution correctness    0.50
Result correctness       0.30
Required concepts        0.10
Structural validity      0.10
```

The exact weights can be tuned during testing.

Execution and result correctness should dominate.

---

# 19. Structural Validation

Structural checks can identify useful evidence even when the result is wrong.

Example:

Task:

> Find average salary by department.

Learner query:

```sql
SELECT department, SUM(salary)
FROM employees
GROUP BY department;
```

Structural analysis can detect:

```text
✓ SELECT
✓ GROUP BY
✓ Aggregate function
✗ Expected AVG, found SUM
```

This should generate an error pattern such as:

```text
aggregation_misuse
```

---

# 20. Accepted Answers

Avoid requiring one exact SQL string.

Equivalent SQL can have different formatting or valid construction.

Store:

```json
{
  "acceptedPatterns": [
    "AVG(salary)",
    "GROUP BY department"
  ]
}
```

Where practical, prefer **result-based validation**.

Use structural rules only when the learning objective specifically requires a technique.

Example:

If the question explicitly teaches `ROW_NUMBER`, a valid answer should demonstrate `ROW_NUMBER` rather than simply producing the same output using another technique.

---

# 21. Error Pattern Catalog

Create a reusable error dictionary.

Recommended initial catalog:

```text
syntax_error

wrong_join_type
incorrect_join_condition
missing_join_condition

where_vs_having
missing_group_by
incorrect_group_by

aggregation_misuse
wrong_aggregate_function

incorrect_subquery_logic
subquery_scope_error

cte_reference_error
cte_structure_error

window_partition_error
window_order_error
wrong_window_function

incorrect_filtering
wrong_comparison_operator

null_handling_error

duplicate_rows
unexpected_row_multiplication

incorrect_sorting
missing_order_by
```

This catalog should expand as real learner behavior reveals new misconceptions.

---

# 22. Error Metadata

Each error pattern should have metadata:

```json
{
  "errorType": "where_vs_having",

  "name": "WHERE vs HAVING confusion",

  "conceptId": "having",

  "relatedConcepts": [
    "where",
    "group_by",
    "aggregation"
  ],

  "severity": "high",

  "remediationType": "conceptual_explanation_plus_practice",

  "recommendedSkill": "diagnosis",

  "commonCause": "Confusing row-level filtering with group-level filtering."
}
```

This allows the adaptive engine to select remediation without requiring AI.

---

# 23. Question Difficulty

Use three levels for MVP:

```text
1 = Foundation
2 = Intermediate
3 = Advanced
```

## Difficulty 1

- one concept,
- simple tables,
- obvious objective,
- low cognitive load.

Example:

> Which JOIN returns all left-table rows?

---

## Difficulty 2

- two related concepts,
- moderate reasoning,
- simple errors,
- small query modifications.

Example:

> Fix a LEFT JOIN with an incorrect condition.

---

## Difficulty 3

- multiple concepts,
- ambiguous-looking distractors,
- multi-step reasoning,
- implementation from scratch.

Example:

> Find the top 3 products by revenue in each category using a window function.

---

# 24. Difficulty Metadata

```json
{
  "difficulty": 3,

  "cognitiveLoad": "high",

  "conceptCount": 3,

  "requiresIndependentConstruction": true,

  "commonErrors": [
    "window_partition_error",
    "window_order_error"
  ]
}
```

This provides additional signals for future refinement without requiring an ML model.

---

# 25. Question Selection

The adaptive engine should not randomly select questions.

Selection process:

```text
1. Select target concept
        ↓
2. Select weakest relevant skill
        ↓
3. Determine required activity type
        ↓
4. Determine appropriate difficulty
        ↓
5. Filter questions by prerequisites
        ↓
6. Exclude recently attempted questions
        ↓
7. Prefer questions targeting active misconceptions
        ↓
8. Select question
```

---

# 26. Question Selection Priority

Within the eligible question pool:

```text
Question Priority =
0.40 × Skill Relevance
+
0.25 × Misconception Relevance
+
0.20 × Difficulty Fit
+
0.15 × Freshness
```

Where:

### Skill Relevance

How directly the question tests the learner's weakest skill.

### Misconception Relevance

Whether the question targets an unresolved error.

### Difficulty Fit

How closely its difficulty matches the learner's current level.

### Freshness

Prefer questions not recently attempted.

---

# 27. Avoid Repetition

Maintain:

```json
{
  "recentQuestionIds": [
    "join_001",
    "join_004",
    "join_007"
  ]
}
```

Avoid immediately repeating the same question.

However, repeated exposure to the **same concept** is desirable.

The goal is:

```text
Different question
Same underlying skill/misconception
```

This tests whether learning transferred rather than whether the learner memorized an answer.

---

# 28. Question Variants

For important concepts, create multiple variants.

Example:

```text
JOIN condition
├── join_004
├── join_009
├── join_014
└── join_022
```

They may test the same misconception using different table names or scenarios.

This is especially important for remediation verification.

---

# 29. Remediation Question Pattern

When a misconception is detected:

```text
Misconception
     ↓
Short explanation
     ↓
Guided example
     ↓
Easy verification
     ↓
Different verification
     ↓
Return to normal progression
```

Example:

```text
WHERE vs HAVING
     ↓
Explain row vs group filtering
     ↓
Show one example
     ↓
Fix simple query
     ↓
Predict output of different query
     ↓
Resume JOIN / aggregation path
```

---

# 30. Question-Bank Coverage Matrix

Every core concept should eventually have coverage across all five skill dimensions.

Example:

| Concept | Recognition | Reasoning | Diagnosis | Correction | Implementation |
|---|---:|---:|---:|---:|---:|
| SELECT / WHERE | ✓ | ✓ | ✓ | ✓ | ✓ |
| GROUP BY | ✓ | ✓ | ✓ | ✓ | ✓ |
| JOINs | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subqueries | ✓ | ✓ | ✓ | ✓ | ✓ |
| CTEs | ✓ | ✓ | ✓ | ✓ | ✓ |
| Window Functions | ✓ | ✓ | ✓ | ✓ | ✓ |

The initial question bank does not need equal quantities everywhere, but every concept should have a path toward implementation.

---

# 31. Recommended Initial Question Count

For a functional MVP:

```text
6 major concepts
×
5 skill types
×
3 questions
=
90 questions
```

However, 90 manually authored questions may be unnecessary for the first build.

A practical initial target:

```text
5–8 questions per major concept
+
additional questions for common misconceptions
```

Approximately:

```text
40–60 high-quality questions
```

This is preferable to hundreds of weak questions.

---

# 32. Suggested MVP Distribution

Example:

```text
SELECT / WHERE          7
GROUP BY / Aggregation  8
JOINs                  12
Subqueries              7
CTEs                    6
Window Functions       12
                       ---
                       52
```

JOINs and Window Functions get more questions because they offer richer diagnosis and implementation opportunities.

---

# 33. Diagnostic Assessment

The initial diagnostic should not attempt to test every question.

Instead, sample strategically.

Example:

```text
Question 1 → SELECT recognition
Question 2 → Filtering reasoning
Question 3 → GROUP BY reasoning
Question 4 → JOIN recognition
Question 5 → JOIN diagnosis
Question 6 → Subquery implementation
Question 7 → Window function recognition
Question 8 → Window function implementation
```

The diagnostic provides enough initial evidence to build the first learner model.

---

# 34. Diagnostic Design Rule

The diagnostic should identify **which skill dimension is weak**, not merely which concept is weak.

Example:

```text
JOIN recognition       = 90%
JOIN diagnosis         = 65%
JOIN correction        = 48%
JOIN implementation    = 30%
```

This should lead to:

> JOIN implementation practice

rather than:

> Learn JOINs from the beginning.

---

# 35. Knowledge Graph + Question Bank Relationship

The relationship should be:

```text
Knowledge Graph
      │
      ├── Concept
      │
      ├── Prerequisites
      │
      └── Skills
             │
             ▼
        Question Bank
             │
             ├── Questions
             ├── Difficulty
             ├── Error Patterns
             └── Evaluation Rules
             │
             ▼
        Assessment Engine
             │
             ▼
        Learner State
             │
             ▼
        Adaptive Planner
             │
             └──────→ selects next question
```

The question bank should never define the curriculum independently.

The knowledge graph defines the learning structure.

The question bank provides evidence about learner state.

---

# 36. AI Usage in the SQL Content Layer

AI should not be required for:

- choosing a concept,
- selecting a prerequisite,
- determining question difficulty,
- calculating mastery,
- scoring deterministic questions,
- detecting known SQL error patterns,
- selecting the next question.

AI can be used for:

- explaining why an answer is wrong,
- interpreting free-text explanations,
- generating a personalized hint,
- explaining a misconception,
- optionally generating question variants after the curated bank is exhausted.

---

# 37. AI Prompt Strategy

When AI is needed, provide a compact context:

```json
{
  "concept": "joins",
  "skill": "correction",
  "learnerMastery": 0.48,
  "errorPattern": "incorrect_join_condition",
  "attempts": 3,
  "difficulty": 2,
  "requestedAction": "explain_misconception"
}
```

The AI should receive a narrow instruction such as:

> Explain the learner's specific JOIN-condition misconception using one concise example. Do not introduce unrelated SQL concepts.

This keeps prompts small and predictable.

---

# 38. SQL Execution Sandbox

For implementation questions, query execution is highly valuable.

MVP requirements:

- isolated execution environment,
- predefined datasets,
- read-only SQL,
- query timeout,
- limited result size,
- no destructive operations,
- no access to arbitrary external databases.

Allowed statements should ideally be restricted to:

```text
SELECT
WITH
```

and required query constructs.

Do not allow:

```text
DROP
DELETE
UPDATE
INSERT
ALTER
CREATE
```

unless the sandbox explicitly requires them later.

---

# 39. Security Rules for Query Evaluation

Never execute learner SQL against production data.

Use:

```text
Static sample database
+
Isolated execution
+
Read-only permissions
+
Timeout
+
Resource limits
```

A learner should never be able to:

- access application secrets,
- access the host filesystem,
- access external networks,
- access production databases,
- execute destructive operations.

---

# 40. Example Concept Object

```json
{
  "conceptId": "joins",
  "name": "SQL Joins",

  "type": "core",

  "description": "Combine rows from multiple tables using related columns.",

  "prerequisites": [
    "select",
    "filtering"
  ],

  "children": [
    "inner_join",
    "left_join",
    "join_condition"
  ],

  "skills": [
    "recognition",
    "reasoning",
    "diagnosis",
    "correction",
    "implementation"
  ],

  "difficultyRange": [1, 3],

  "commonErrors": [
    "wrong_join_type",
    "incorrect_join_condition",
    "missing_join_condition",
    "duplicate_rows"
  ]
}
```

---

# 41. Example Question Objects

## Recognition

```json
{
  "questionId": "join_rec_001",
  "conceptId": "joins",
  "skillType": "recognition",
  "questionType": "mcq",
  "difficulty": 1,
  "prompt": "Which JOIN returns all rows from the left table?",
  "options": [
    "INNER JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "CROSS JOIN"
  ],
  "correctAnswer": "LEFT JOIN"
}
```

## Diagnosis

```json
{
  "questionId": "having_diag_001",
  "conceptId": "having",
  "skillType": "diagnosis",
  "questionType": "spot_error",
  "difficulty": 2,
  "errorPatterns": [
    "where_vs_having"
  ]
}
```

## Correction

```json
{
  "questionId": "join_fix_001",
  "conceptId": "join_condition",
  "skillType": "correction",
  "questionType": "query_correction",
  "difficulty": 2,
  "errorPatterns": [
    "incorrect_join_condition"
  ]
}
```

## Implementation

```json
{
  "questionId": "window_impl_001",
  "conceptId": "window_functions",
  "skillType": "implementation",
  "questionType": "write_query",
  "difficulty": 3,
  "requiredConcepts": [
    "row_number",
    "partition_by",
    "order_by"
  ]
}
```

---

# 42. Data Flow During an Assessment

```text
Question selected
      ↓
Question metadata loaded
      ↓
Learner submits answer
      ↓
Evaluation engine
      ↓
Score + evidence
      ↓
Error classification
      ↓
Assessment record
      ↓
Learner skill update
      ↓
Concept mastery update
      ↓
Misconception update
      ↓
Adaptive planner
      ↓
Next question
```

---

# 43. Example Adaptive Scenario

Initial state:

```text
JOIN Recognition       0.85
JOIN Reasoning         0.72
JOIN Diagnosis         0.55
JOIN Correction        0.40
JOIN Implementation    0.32
```

System selects:

```text
Fix the Query
```

Learner submits an incorrect JOIN condition.

Detected:

```text
incorrect_join_condition
```

Occurrence count:

```text
1 → 2
```

Because the same misconception has now occurred twice:

```text
Trigger remediation
```

System presents:

```text
Short explanation
+
simple example
+
spot-the-error question
```

Learner succeeds.

Then:

```text
JOIN Diagnosis    0.55 → 0.66
JOIN Correction   0.40 → 0.52
```

The system now selects another correction problem instead of immediately moving to Window Functions.

After two successful correction questions:

```text
Correction > 0.70
```

The planner moves toward:

```text
Implementation
```

The learner then writes a JOIN from scratch.

This is the adaptive loop we want the demo to visibly demonstrate.

---

# 44. MVP Completion Criteria

The SQL content system is considered ready when:

- every core concept exists in the graph,
- prerequisite relationships are defined,
- every core concept has tagged questions,
- every major skill type is represented,
- questions have difficulty metadata,
- questions have evaluation rules,
- common misconceptions are tagged,
- implementation questions can be evaluated,
- the adaptive planner can select questions from metadata,
- repeated misconceptions can trigger remediation,
- equivalent valid SQL can receive credit where appropriate.

---

# 45. What We Are Not Building Yet

Do not add these to the MVP:

- hundreds of SQL topics,
- AI-generated curriculum,
- arbitrary user SQL execution against real databases,
- unrestricted SQL execution,
- ML-generated difficulty,
- ML-generated prerequisite graphs,
- automatic curriculum discovery,
- voice-based SQL teaching,
- competitive leaderboards,
- social question sharing.

The first objective is a **small but demonstrably intelligent adaptive learning loop**.

---

# 46. Recommended Build Order

The implementation should proceed in this order:

```text
1. Knowledge graph JSON
        ↓
2. Question bank JSON
        ↓
3. Deterministic question evaluator
        ↓
4. Learner-state engine
        ↓
5. Adaptive planner
        ↓
6. SQL execution sandbox
        ↓
7. Gemini explanation layer
        ↓
8. UI
        ↓
9. End-to-end adaptive demo
```

The UI should consume the existing learner state and planner decisions rather than embedding adaptive logic inside individual components.

---

# 47. Final Architecture

```text
                  SQL KNOWLEDGE GRAPH
                          │
                          │
             Concepts + Prerequisites
                          │
                          ▼
                   QUESTION BANK
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
      Recognition     Diagnosis       Implementation
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                  EVALUATION ENGINE
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
       Correctness      Errors       Behavior
            │             │             │
            └─────────────┼─────────────┘
                          ▼
                    LEARNER STATE
                          │
                          ▼
                 ADAPTIVE PLANNER
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
       Concept         Activity        Difficulty
       Priority          Type             Level
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                    NEXT QUESTION
                          │
                          └──────────→ repeat
```

---

# 48. Design Contract

The SQL layer must follow this contract:

> **The knowledge graph defines what can be learned and how concepts depend on each other. The question bank defines how evidence of learning is collected. The evaluation engine converts responses into structured evidence. The learner-state engine converts evidence into mastery and misconception signals. The adaptive planner converts those signals into the next learning activity.**

This separation is important because it keeps the system:

- testable,
- explainable,
- inexpensive,
- maintainable,
- and extensible to other learning domains later.

---

# 49. Future Domain Extension

The architecture should eventually allow:

```text
Adaptive Learning Engine
          │
     ┌────┼────┐
     │    │    │
    SQL Python Math
     │    │    │
   Graph Graph Graph
     │    │    │
   Bank  Bank  Bank
```

The learner-state and adaptive algorithms remain largely unchanged.

Only the domain-specific:

- knowledge graph,
- question bank,
- evaluator,
- misconception catalog

need to change.

This makes SQL the **first content domain**, not a permanent limitation of the platform.
