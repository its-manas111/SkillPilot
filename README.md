# SkillPilot — AI-Powered Adaptive Learning Intelligence System

> **Authoritative Implementation for SQL Interview Preparation & Skill Mastery**

SkillPilot is an AI-powered adaptive learning system designed around a closed-loop intelligence engine. Instead of providing static quizzes or generic scores, SkillPilot evaluates a learner across **5 independent cognitive skill dimensions** (*Recognition, Reasoning, Diagnosis, Correction, Implementation*) and uses structured evidence to continuously recommend the next optimal learning activity.

---

## 🌟 Core Product Loop

```text
Learner Response
      ↓
Deterministic Evaluation & Partial Credit
      ↓
Structured Evidence & Misconception Matching
      ↓
Learner State Update (EMA Mastery + 5 Skill Profiles)
      ↓
Adaptive Planner Priority Recommendation
      ↓
Next Best Learning Activity + Explainable Reason
```

---

## 🚀 Key Features

1. **5 Cognitive Skill Dimensions**:
   - **Recognition**: Identify SQL keywords, clauses, and concepts.
   - **Reasoning**: Predict query outputs and logical behavior.
   - **Diagnosis**: Spot syntax, grouping, or join condition errors.
   - **Correction**: Fix broken SQL queries in an interactive editor.
   - **Implementation**: Write complete SQL queries independently from scratch.

2. **Knowledge Graph & Prerequisite Engine**:
   - Structured graph nodes for `SELECT/WHERE`, `Aggregation`, `GROUP BY`, `HAVING`, `INNER JOIN`, `LEFT JOIN`, `Join Conditions`, `Subqueries`, `CTEs`, `Window Functions`, `ROW_NUMBER/RANK`, and `PARTITION BY`.
   - Prerequisite readiness gating prevents pushing learners into advanced concepts prematurely.

3. **Deterministic Evaluation Engine & Partial Credit**:
   - Evaluates SQL queries safely using `sql.js` (SQLite WASM) against real relational datasets.
   - **Partial Credit Weighting**:
     - *Query Correction*: Syntax (20%), Execution (20%), Output result (40%), Target error corrected (20%).
     - *Implementation*: Execution (50%), Result (30%), Required concepts (10%), Structure (10%).
   - Automatic misconception detection (e.g. `incorrect_join_condition`, `missing_group_by`, `where_vs_having`).

4. **Explainable Adaptive Planner**:
   - Priority formula: `0.40 * Skill Relevance + 0.25 * Misconception Relevance + 0.20 * Difficulty Fit + 0.15 * Freshness`.
   - Generates truthful human-readable reasons explaining *why* an activity was recommended.

5. **SQL Editor & Schema Explorer**:
   - Interactive monospaced code editor with line numbers, query preview, schema viewer, and sample dataset inspection.
   - Security guardrails blocking destructive DDL/DML queries (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`).

6. **Gemini AI Learning Tutor Integration**:
   - Optional enhancement for contextual hints and deep conceptual explanations.
   - Graceful offline fallback ensuring 100% functionality even when offline or unconfigured.

7. **Developer Debug Drawer**:
   - Real-time overlay displaying active learner state, 5-skill radar profiles, priority scores, and graph mastery values.

---

## 🛠️ Project Architecture

```text
src/
├── engine/
│   ├── knowledgeGraph/     # Concepts, prerequisite dependencies, relationships
│   ├── questionBank/       # Curated 45+ questions across 5 skill types
│   ├── evaluator/          # Scoring, partial credit, misconception matcher
│   ├── learnerState/       # EMA mastery updates, 5 skill profiles, persistence
│   ├── planner/            # Priority recommendation algorithm & diagnostic generator
│   └── sql/                # In-browser SQLite execution & security guardrails
├── components/
│   ├── editor/             # SqlEditor & SchemaViewer components
│   └── Navbar.tsx          # Top navigation header
├── views/
│   ├── OnboardingView.tsx  # Target goal selection & framework intro
│   ├── DiagnosticView.tsx  # Initial baseline assessment
│   ├── DashboardView.tsx   # Next Best Activity card, Knowledge Snapshot, 5-Skill Profile
│   ├── PracticeView.tsx    # Interactive question execution
│   ├── FeedbackView.tsx    # Partial credit breakdown & Gemini explanations
│   ├── ProgressView.tsx    # Detailed analytics & attempt history log
│   └── DebugDrawer.tsx     # Adaptive intelligence debugger overlay
├── services/
│   └── gemini.ts           # Gemini API integration layer
├── App.tsx                 # Main application workflow coordinator
└── main.tsx                # Entry point
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+ and npm

### Installation
```bash
# Clone or navigate to the repository
cd d:/SkillPilot

# Install dependencies
npm install

# Run dev server
npm run dev

# Run unit tests
npm test

# Build production bundle
npm run build
```

---

## 🔒 Security & Privacy
- Zero credentials committed.
- In-browser SQLite WASM execution ensures no external database or infrastructure access.
- Prohibits destructive SQL execution.
