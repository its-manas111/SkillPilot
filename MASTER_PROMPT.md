# SkillPilot — Master Engineering Prompt

> **Authoritative implementation contract for the SkillPilot MVP**
>
> Domain for MVP: **SQL**
>
> Core implementation order:
>
> **Knowledge Graph → Question Bank → Evaluation Engine → Learner State → Adaptive Planner → SQL Editor → UI → Gemini → Polish**

---

## 1. Mission

Build **SkillPilot**, an AI-powered Adaptive Learning Intelligence System.

SkillPilot should understand a learner's evolving knowledge state and use that state to determine the learner's next best learning activity.

This is **not** a generic quiz application.

This is **not** a static SQL course.

This is **not** simply an AI chatbot.

The core product loop is:

```text
Learner Response
      ↓
Evaluation
      ↓
Structured Evidence
      ↓
Learner State Update
      ↓
Adaptive Decision
      ↓
Next Learning Activity
```

The MVP must make this loop real, deterministic where possible, explainable, and visible to the learner.

---

# 2. Source-of-Truth Hierarchy

Use the following authority order:

1. Functional correctness
2. `adaptive_learning_learner_state_spec.md`
3. `sql_knowledge_graph_question_bank_spec.md`
4. This `MASTER_PROMPT.md`
5. Security, accessibility, performance, and testing requirements
6. Stitch visual design
7. Developer convenience

### Important

- **Stitch MCP is the visual source of truth.**
- The Markdown specifications are the intelligence/data-model source of truth.
- The application code is the implementation.
- Never modify the adaptive-learning architecture merely to make a UI shortcut possible.

If Stitch and a functional requirement conflict, preserve the Stitch visual language where possible while implementing the required behavior correctly.

---

# 3. Required Specifications

Before implementation, read completely:

```text
docs/adaptive_learning_learner_state_spec.md
docs/sql_knowledge_graph_question_bank_spec.md
docs/MASTER_PROMPT.md
```

Do not rely on filenames alone. Understand the actual schemas, formulas, relationships, and rules.

---

# 4. Stitch MCP — Design Context Bridge

A Stitch MCP server is available as the design-context bridge.

Configured endpoint:

```text
https://stitch.googleapis.com/mcp
```

The MCP credential must remain in the agent/development MCP configuration or approved secret-management mechanism.

## Security requirement

Never:

- hardcode the Stitch API key
- print the Stitch API key
- commit the Stitch API key
- put the Stitch API key into source code
- put the Stitch API key into README files
- put the Stitch API key into browser/client code
- reproduce the API key in project documentation

If a credential has been exposed, rotate it.

---

# 5. Role of Stitch

Treat Stitch as the **visual design source of truth**.

Stitch controls:

- visual design
- layout
- typography
- spacing
- colors
- visual hierarchy
- component appearance
- navigation appearance
- responsive design intent
- interaction presentation
- visual states
- SQL editor presentation

Stitch does **not** control:

- learner-state architecture
- scoring algorithms
- adaptive algorithms
- knowledge graph
- question-bank schema
- misconception logic
- SQL evaluation rules
- persistence architecture
- security architecture
- AI decision boundaries

---

# 6. Stitch MCP Inspection Workflow

Before implementing UI:

1. Connect to Stitch MCP.
2. Inspect the current SkillPilot design context.
3. Identify available screens.
4. Identify reusable components.
5. Identify design tokens.
6. Identify responsive variants.
7. Identify interaction states.
8. Identify missing states required by the functional specification.

At minimum, inspect designs for:

- Welcome / onboarding
- Goal setup
- Diagnostic assessment
- Dashboard
- Assessment
- Recognition
- Reasoning
- Diagnosis
- Query correction
- Query implementation
- SQL results
- Feedback
- Adaptive recommendation
- Concept learning
- Learning path
- Progress
- Concept progress
- Session summary
- Settings
- Mobile/responsive layouts
- Loading states
- Empty states
- Error states

Do not immediately implement the UI after inspection.

First create an internal mapping:

```text
Stitch Screen
    ↓
Application Route
    ↓
Page Component
    ↓
Reusable Components
    ↓
Learner-State Data
    ↓
Engine Dependencies
    ↓
User Interactions
    ↓
Responsive Behavior
```

---

# 7. Required Implementation Sequence

The following order is mandatory:

## Phase 1
**Knowledge Graph**

## Phase 2
**Question Bank**

## Phase 3
**Evaluation Engine**

## Phase 4
**Learner State**

## Phase 5
**Adaptive Planner**

## Phase 6
**SQL Editor**

## Phase 7
**UI**

## Phase 8
**Gemini**

## Phase 9
**Polish**

Do not build the entire UI first.

The application must be intelligence-first, not dashboard-first.

---

# 8. Phase 0 — Repository Audit

Before changing code:

1. Inspect the repository.
2. Identify the framework.
3. Identify the build system.
4. Inspect dependencies.
5. Read the specifications.
6. Inspect Stitch through MCP.
7. Identify reusable components.
8. Inspect existing tests.
9. Inspect deployment configuration.
10. Inspect environment configuration.

Do not unnecessarily rewrite an existing project.

Produce an implementation plan before making major changes.

---

# 9. Phase 1 — Knowledge Graph

Implement the SQL knowledge graph according to:

```text
docs/sql_knowledge_graph_question_bank_spec.md
```

The MVP should support at least:

- SELECT
- WHERE / Filtering
- Aggregation
- GROUP BY
- HAVING
- JOINs
- INNER JOIN
- LEFT JOIN
- JOIN Conditions
- Subqueries
- CTEs
- Window Functions
- ROW_NUMBER
- RANK
- PARTITION BY
- ORDER BY

Represent concepts as structured data.

Each concept should contain, where applicable:

```text
conceptId
name
description
type
prerequisites
children
supportedSkills
difficultyRange
commonErrors
```

Concept relationships must live in data.

Do not hardcode relationships inside UI components.

The architecture must allow additional SQL concepts without rewriting the adaptive engine.

---

# 10. Phase 2 — Question Bank

Create a curated SQL question bank.

Target:

**40–60 high-quality MVP questions.**

Quality is more important than quantity.

Each question should contain, where applicable:

```text
questionId
conceptId
skillType
questionType
difficulty
prompt
context
schema
starterCode
expectedAnswer
expectedResult
acceptedPatterns
errorPatterns
prerequisites
hints
explanation
tags
expectedTimeSeconds
```

## Skill types

Support:

```text
recognition
reasoning
diagnosis
correction
implementation
```

## Question types

Support:

```text
mcq
predict_output
spot_error
query_correction
write_query
```

---

# 11. Cognitive Progression

A major product principle is to evaluate different forms of understanding.

For example, for JOINs:

```text
Recognition
    ↓
Can identify JOIN types

Reasoning
    ↓
Can predict JOIN behavior/output

Diagnosis
    ↓
Can identify why a JOIN is wrong

Correction
    ↓
Can fix a broken JOIN

Implementation
    ↓
Can write the JOIN independently
```

Do not collapse these into a single mastery score.

A learner can have strong conceptual understanding and weak implementation ability.

That distinction is central to SkillPilot.

---

# 12. Phase 3 — Evaluation Engine

Build a dedicated evaluation engine.

The UI must never contain evaluation logic.

Use a structure similar to:

```text
evaluateAnswer(question, answer)
```

Return structured evidence such as:

```json
{
  "score": 0,
  "correctness": "incorrect",
  "partialCredit": 0,
  "skillEvidence": {},
  "conceptEvidence": {},
  "errorPatterns": [],
  "feedback": "",
  "executionResult": null
}
```

Support evaluation for:

### MCQ
Exact/normalized answer.

### Predict Output
Normalized result comparison.

### Spot Error
Error-pattern classification.

### Query Correction
Evaluate:

- syntax
- execution
- result
- target error correction

### Query Implementation
Evaluate:

- execution
- expected result
- required concepts
- structural validity

---

# 13. Partial Credit

Do not reduce all SQL tasks to correct/incorrect.

For query correction:

```text
Syntax validity          20%
Successful execution     20%
Correct result           40%
Target error corrected   20%
```

For implementation:

```text
Execution correctness    50%
Result correctness       30%
Required concepts        10%
Structural validity      10%
```

Keep weights centralized.

Do not scatter magic numbers throughout the codebase.

---

# 14. Phase 4 — Learner State

Implement learner state exactly according to:

```text
docs/adaptive_learning_learner_state_spec.md
```

At minimum maintain:

```text
learnerId
conceptMastery
skillMastery
confidence
misconceptions
recentAttempts
recentQuestionIds
difficultyState
learningHistory
recommendation
lastUpdated
```

Learner state must be calculated from actual attempts.

Do not hardcode dashboard mastery values.

---

# 15. Five Skill Dimensions

Track independently:

```text
Recognition
Reasoning
Diagnosis
Correction
Implementation
```

Example:

```text
JOINs

Recognition       82%
Reasoning         71%
Diagnosis         55%
Correction        40%
Implementation    32%
```

The UI should make this distinction visible.

Key insight:

> Knowing SQL is not the same as being able to implement SQL.

---

# 16. Mastery Updates

Use the mastery update approach specified in:

```text
adaptive_learning_learner_state_spec.md
```

Where applicable, use an EMA-style update:

```text
newMastery =
    alpha × currentEvidence
    +
    (1 - alpha) × previousMastery
```

Recent evidence should matter.

Different skill evidence must update the appropriate skill dimension.

Do not use simplistic:

```text
correct / total
```

as the sole mastery model.

---

# 17. Misconception Engine

Implement the error catalog from the question-bank specification.

At minimum support patterns such as:

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

Track:

```text
occurrenceCount
lastOccurrence
concept
severity
remediationStatus
```

---

# 18. Repeated Misconception Logic

Use progressive evidence.

### First occurrence

Record evidence.

### Second occurrence

Increase priority.

### Third occurrence

Trigger targeted remediation.

Do not permanently classify a learner from a single mistake.

Use supportive language.

Prefer:

> Needs another look

instead of:

> Failed

---

# 19. Phase 5 — Adaptive Planner

Build a dedicated adaptive planner.

The planner determines:

```text
concept
skill
questionType
difficulty
question
recommendationReason
```

Use:

- skill weakness
- concept weakness
- misconceptions
- prerequisite readiness
- recent performance
- question freshness
- difficulty fit

Recommended priority model:

```text
Question Priority =
    0.40 × Skill Relevance
  + 0.25 × Misconception Relevance
  + 0.20 × Difficulty Fit
  + 0.15 × Freshness
```

Keep the algorithm explainable.

Do not create a black-box recommendation system for the MVP.

---

# 20. Adaptive Recommendation

Every recommendation must have a truthful reason derived from actual learner state.

Example:

> Practice JOIN correction

Reason:

> You recognize JOIN types well, but your last two attempts contained JOIN-condition errors.

Another example:

> Try Window Functions — Foundation

Reason:

> Your prerequisites are strong enough to begin, but you have not demonstrated Window Function implementation yet.

Do not hardcode recommendations independently of learner state.

---

# 21. Difficulty Adaptation

Difficulty levels:

```text
1 = Foundation
2 = Intermediate
3 = Advanced
```

Rules:

Strong recent performance:

→ gradually increase difficulty.

Weak recent performance:

→ decrease or maintain difficulty.

Repeated misconception:

→ maintain/reduce difficulty and target remediation.

Consistent success:

→ move toward implementation.

Never make a large difficulty jump after one successful attempt.

---

# 22. Question Freshness

Avoid immediately repeating the same question.

Track:

```text
recentQuestionIds
```

When remediation is needed:

```text
same concept
+
same skill
+
different question
```

Example:

```text
Incorrect JOIN condition
        ↓
JOIN correction
        ↓
Different JOIN diagnosis
        ↓
JOIN implementation
```

---

# 23. Phase 6 — SQL Editor

Implement a professional SQL learning environment.

Support:

- syntax highlighting
- monospaced font
- line numbers where appropriate
- indentation
- keyboard interaction
- Run Query
- Reset
- Submit
- result preview
- schema explorer

Desktop:

```text
SQL Editor + Schema Panel
```

Mobile:

```text
SQL Editor
+
Collapsible Schema Drawer
```

The editor should feel appropriate for technical interview preparation.

---

# 24. Safe SQL Execution

If practical for the existing stack, use a local/in-browser SQL engine such as SQLite/WASM.

Use predefined datasets.

Never execute learner queries against:

- production systems
- external databases
- application infrastructure
- filesystem
- secrets

Only allow safe read-oriented operations.

Allow:

```text
SELECT
WITH
```

Block:

```text
INSERT
UPDATE
DELETE
DROP
ALTER
TRUNCATE
```

and other destructive operations.

Implement:

- timeout
- row limits
- controlled schemas
- safe error handling

If reliable SQL execution cannot be implemented in the current stack, use deterministic evaluation where appropriate and clearly distinguish it from actual execution.

Never fake query execution.

---

# 25. Phase 7 — UI

Only after the intelligence core is functioning should the primary UI implementation begin.

For each major page:

1. Inspect the corresponding Stitch design.
2. Identify reusable components.
3. Identify responsive behavior.
4. Map design elements to real learner-state data.
5. Connect the page to actual engine outputs.
6. Implement loading, empty, success, partial, and error states.

Do not create static mockups.

Every learner-facing metric must come from actual application state.

---

# 26. Required User Flow

Implement:

```text
Onboarding
    ↓
Goal Setup
    ↓
Diagnostic
    ↓
Learner State Initialization
    ↓
Dashboard
    ↓
Adaptive Recommendation
    ↓
Practice
    ↓
Evaluation
    ↓
Feedback
    ↓
Learner State Update
    ↓
New Recommendation
    ↓
Progress
```

The UI must make the adaptive loop understandable.

---

# 27. Dashboard

Primary hierarchy:

1. What should I do next?
2. Why?
3. What do I know?
4. Where am I struggling?
5. Am I improving?

Primary card:

```text
Your next best activity
```

Example:

```text
Fix JOIN conditions

Skill:
Correction

Difficulty:
Intermediate

Estimated time:
5 min

Reason:
You recognize JOIN types well, but your recent
corrections show repeated JOIN-condition errors.

CTA:
Continue
```

This recommendation must be dynamically generated.

---

# 28. Knowledge Snapshot

Show major SQL concepts:

```text
SELECT & WHERE
Aggregation
JOINs
Subqueries
CTEs
Window Functions
```

Statuses:

```text
Not Assessed
Needs Foundation
Developing
Proficient
Mastered
```

Use actual learner-state values.

---

# 29. Skill Profile

Display:

```text
Recognition
Reasoning
Diagnosis
Correction
Implementation
```

Make "knowing vs doing" visually obvious.

Example insight:

> Your conceptual understanding is ahead of your implementation ability.

Generate this from actual state where practical.

---

# 30. Practice Screens

Implement all five:

1. Recognition
2. Reasoning
3. Diagnosis
4. Correction
5. Implementation

Each should reflect its specific cognitive objective.

They may share reusable components but should not all feel like identical quiz screens.

---

# 31. Query Correction

This is a core feature.

Display:

- broken SQL
- schema
- editor
- Run Query
- Reset
- Submit

The learner must actually modify the query.

Evaluation must identify the specific error where possible.

---

# 32. Query Implementation

Allow learners to write SQL from scratch.

Example:

> Find the top 3 highest-paid employees in each department.

Show:

- schema
- blank SQL editor
- Run Query
- Submit

Results should appear after execution.

Evaluation should determine:

- execution correctness
- result correctness
- required concept usage
- structural validity

---

# 33. Feedback

Feedback states:

```text
Correct
Partially Correct
Incorrect
```

Show:

- what was correct
- what needs improvement
- why
- corrected query where appropriate
- next recommended action

Keep deterministic feedback concise.

AI should enhance it rather than become a mandatory dependency.

---

# 34. Adaptive Recommendation Screen

Show:

```text
Here's what we recommend next
```

Example:

```text
Practice JOIN correction

Reason:
Your recent attempts show strong JOIN recognition
but repeated JOIN-condition errors.

Evidence:

Recognition       Strong
Diagnosis         Developing
Correction        Needs Practice

CTA:
Practice This
```

This screen should explicitly demonstrate adaptation.

---

# 35. Progress

Display:

- overall mastery
- concept mastery
- skill mastery
- trends
- misconceptions
- history

Example:

```text
JOINs
48%
Developing
↑

Recognition       82%
Reasoning         71%
Diagnosis         58%
Correction        49%
Implementation    32%
```

All values must be derived from learner state.

---

# 36. Phase 8 — Gemini

Gemini is an enhancement layer.

Gemini must **not** control:

- scoring
- mastery
- question selection
- prerequisite logic
- misconception IDs
- deterministic SQL evaluation

Gemini may provide:

- hints
- concise explanations
- contextual remediation
- natural-language feedback

Use Gemini only when useful.

Do not call Gemini for every interaction.

Prioritize AI calls for:

- incorrect answers
- partial answers
- explicit learner requests
- remediation

---

# 37. Gemini Failure Mode

The application must remain fully usable when Gemini is unavailable.

Show:

> AI explanations are temporarily unavailable.

Then use deterministic question-bank feedback.

Learners must still be able to:

- practice
- submit
- receive scores
- update mastery
- receive recommendations

---

# 38. Gemini Security

Never expose Gemini API keys in browser code.

Never commit API keys.

Use environment variables/server-side proxy as appropriate.

Maintain:

```text
.env.example
```

Never put actual credentials in:

- source code
- README
- tests
- prompts
- Git history

Treat Gemini output as untrusted content.

---

# 39. Phase 9 — Polish

Only after the adaptive system and core UI are functional:

Use Stitch MCP again to compare the implementation with the latest design.

Perform visual QA for:

- spacing
- typography
- colors
- component consistency
- responsiveness
- SQL editor usability
- feedback hierarchy
- empty states
- loading states
- error states

Then optimize:

- accessibility
- performance
- animations
- transitions
- micro-interactions

Do not allow polish to destabilize the intelligence engine.

---

# 40. Accessibility

Follow WCAG 2.2 AA principles.

Ensure:

- semantic HTML
- keyboard navigation
- visible focus states
- sufficient contrast
- accessible labels
- screen-reader-friendly status updates
- accessible SQL editor controls
- accessible error messages
- touch-friendly controls
- reduced-motion support

Never rely on color alone.

---

# 41. Responsive Design

Use Stitch responsive designs where available.

### Desktop

Sidebar + content.

### Tablet

Collapsed/adaptive sidebar.

### Mobile

Compact navigation.

Assessment flow:

```text
Question
   ↓
Editor
   ↓
Schema Drawer
   ↓
Results
   ↓
Submit
```

Do not simply shrink desktop screens.

---

# 42. Security

Validate all user-controlled input.

Never trust:

- learner answers
- SQL
- question IDs
- persisted state
- AI responses

Block destructive SQL.

Do not expose secrets.

Sanitize dynamic output.

Avoid unsafe HTML rendering.

Do not expose internal stack traces.

---

# 43. Performance

Keep the MVP lightweight.

Avoid:

- unnecessary dependencies
- unnecessary AI calls
- unnecessary network requests
- expensive render calculations
- large bundles
- unnecessary rerenders

Lazy-load heavy functionality where appropriate.

SQL evaluation must not freeze the UI.

---

# 44. Persistence

For MVP, local persistence is acceptable.

Persist:

- learner state
- attempts
- misconceptions
- mastery
- recommendation
- history
- recent question IDs

Use a repository abstraction.

Do not couple adaptive logic directly to `localStorage`.

Future backend replacement should be possible without rewriting the intelligence engine.

---

# 45. Testing

Test independently:

### Knowledge Graph

- concept validity
- prerequisites
- relationships

### Question Bank

- schema validation
- concept coverage
- question-type coverage
- malformed questions

### Evaluation

- correct answers
- incorrect answers
- partial credit
- SQL error patterns
- edge cases

### Learner State

- mastery updates
- skill updates
- confidence
- misconceptions
- history

### Adaptive Planner

- weak-skill targeting
- misconception targeting
- difficulty adaptation
- freshness
- prerequisite handling

### Persistence

- save
- load
- corrupted state handling

### SQL

- valid query
- invalid query
- blocked destructive query
- timeout
- row limit

### UI

- critical user flows
- accessibility
- responsive behavior

---

# 46. Mandatory Adaptive Scenario

The following end-to-end scenario must work:

```text
Fresh learner
      ↓
Diagnostic
      ↓
Learner demonstrates:
JOIN recognition = strong
JOIN correction = weak
      ↓
Dashboard recommends:
JOIN correction
      ↓
Learner submits incorrect JOIN condition
      ↓
Evaluator detects:
incorrect_join_condition
      ↓
Misconception occurrence increases
      ↓
Correction skill state updates
      ↓
Adaptive planner selects remediation
      ↓
Different JOIN question appears
      ↓
Learner succeeds
      ↓
Learner state improves
      ↓
Recommendation changes
```

There must be no hardcoded transition between these steps.

The system must actually use learner state.

---

# 47. Debug Mode

Create an optional developer/debug view.

Show:

- current learner state
- concept mastery
- skill mastery
- active misconceptions
- recent attempts
- last evaluation
- adaptive recommendation
- recommendation reason
- selected question

This exists to validate the intelligence engine.

Do not expose it prominently to normal learners.

---

# 48. No Fake Learner Data

Seed data may be used for:

- knowledge graph
- question bank
- initial content

Learner state must come from actual interaction.

Do not hardcode:

```text
JOIN mastery = 48%
```

or:

```text
recommended question = X
```

unless explicitly running a clearly separated demo mode.

---

# 49. Future Extensibility

SQL is the only MVP domain.

Do not implement other domains now.

Design the domain layer so future domains can be added:

```text
SQL
Python
Data Structures
Statistics
Other technical skills
```

Future domains should primarily require new:

- knowledge graphs
- question banks
- evaluation rules
- error catalogs

The adaptive engine should remain reusable.

---

# 50. Documentation

Maintain `README.md`.

Include:

- SkillPilot overview
- architecture
- adaptive-learning architecture
- knowledge graph
- question bank
- evaluation engine
- learner state
- adaptive planner
- SQL execution
- Gemini integration
- Stitch MCP workflow
- setup
- environment variables
- testing
- deployment
- security
- limitations
- future roadmap

Never document secrets.

---

# 51. Final QA Checklist

## Functionality

- [ ] onboarding
- [ ] diagnostic
- [ ] all five skill types
- [ ] SQL correction
- [ ] SQL implementation
- [ ] evaluation
- [ ] learner-state update
- [ ] misconception tracking
- [ ] adaptive recommendation
- [ ] progress
- [ ] persistence

## Adaptive Intelligence

- [ ] recommendations are state-driven
- [ ] skill weaknesses affect recommendations
- [ ] misconceptions affect recommendations
- [ ] difficulty adapts
- [ ] question freshness works
- [ ] remediation works
- [ ] recommendation explanations are truthful

## Stitch / UI

- [ ] Stitch design faithfully implemented
- [ ] design tokens consistent
- [ ] reusable components
- [ ] desktop
- [ ] tablet
- [ ] mobile
- [ ] loading states
- [ ] empty states
- [ ] error states
- [ ] feedback states

## Accessibility

- [ ] keyboard navigation
- [ ] focus states
- [ ] contrast
- [ ] labels
- [ ] semantic hierarchy
- [ ] color-independent status

## Security

- [ ] no exposed secrets
- [ ] no destructive SQL
- [ ] SQL input validation
- [ ] AI output treated safely
- [ ] errors sanitized

## Performance

- [ ] production build succeeds
- [ ] no obvious console errors
- [ ] minimal AI calls
- [ ] responsive SQL execution
- [ ] no unnecessary dependencies

## Testing

- [ ] unit tests
- [ ] adaptive engine tests
- [ ] critical UI tests
- [ ] edge cases

---

# 52. Hackathon Demo

The application must support a polished 3–5 minute demonstration.

Recommended narrative:

1. Show learner dashboard.
2. Show current learner state.
3. Highlight:
   > Strong conceptual understanding, weaker implementation.
4. Show:
   > Your next best activity: Fix JOIN conditions
5. Enter correction task.
6. Learner makes an incorrect JOIN condition.
7. Evaluation identifies:
   `incorrect_join_condition`
8. Feedback explains the issue.
9. Learner state updates.
10. System recommends targeted remediation.
11. A different question tests the same underlying weakness.
12. Learner succeeds.
13. Learner state improves.
14. Recommendation changes.

The judge should clearly understand:

> **This is not a static quiz.**
>
> **This is an adaptive learning system.**

---

# 53. Implementation Priority

## P0 — Must Work

1. Knowledge Graph
2. Question Bank
3. Evaluation Engine
4. Learner State
5. Adaptive Planner
6. Diagnostic
7. Query Correction
8. Query Implementation
9. Feedback
10. Dashboard recommendation

## P1

11. Progress
12. Misconception visualization
13. SQL execution improvements
14. Gemini hints/explanations
15. Responsive polish

## P2

16. Advanced animation
17. Extra analytics
18. Additional micro-interactions

Never sacrifice P0 intelligence for visual polish.

---

# 54. Engineering Principles

## Principle 1 — Adaptation

Every meaningful learner action should produce structured evidence.

That evidence should influence what happens next.

## Principle 2 — Explainability

The learner should understand:

> What should I practice next?

and:

> Why?

## Principle 3 — AI Boundaries

AI enhances learning.

AI does not control the core learning engine.

## Principle 4 — Design

Stitch defines the visual language.

The implementation must faithfully translate the design into functional UI.

## Principle 5 — Architecture

Build:

```text
Knowledge Graph
→ Question Bank
→ Evaluation Engine
→ Learner State
→ Adaptive Planner
→ SQL Editor
→ UI
→ Gemini
→ Polish
```

Do not skip ahead.

## Principle 6 — Real Functionality

Never fake:

- query execution
- mastery
- recommendations
- evaluation
- learner progress

If something cannot be implemented reliably, explicitly mark it unavailable or use a deterministic fallback.

## Principle 7 — Hackathon Impact

The strongest demonstration is not:

> Look at our beautiful dashboard.

It is:

> Watch the system learn from the learner and change what it recommends.

---

# 55. Agent Operating Instructions

When starting work on SkillPilot:

1. Read this file completely.
2. Read all referenced specification files.
3. Inspect the repository.
4. Inspect Stitch MCP design context.
5. Create an implementation plan.
6. Identify conflicts before coding.
7. Implement in the prescribed sequence.
8. Test each major phase.
9. Keep intelligence logic separate from presentation.
10. Keep deterministic logic separate from Gemini.
11. Never expose credentials.
12. Never fake functionality.
13. Re-check Stitch before final UI polish.
14. Run the full QA checklist before declaring the MVP complete.

When uncertain, prefer:

```text
Correctness
→ Explainability
→ Security
→ Accessibility
→ Maintainability
→ Performance
→ Visual polish
```

The final product must demonstrate a genuine adaptive learning loop rather than merely presenting the appearance of one.
