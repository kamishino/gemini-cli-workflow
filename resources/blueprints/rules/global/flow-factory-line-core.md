---
name: flow-factory-line-core
type: RULE
description: Sniper Model factory line protocol
group: global
order: 50
---

# 🏭 Sniper Model: The Factory Line Protocol (SSOT)

> **Purpose:** Transform raw requirements into executable code tasks via a 3-Step Fused Kernel with 3-Layer Locks.

---

## ⚡ Step -1: Fast Track Classification (NEW in v2.39)

**Goal:** Reduce ceremony for lightweight tasks while preserving rigor for complex ones.

### Quick Classification (< 10 seconds)

**Evaluate these 5 criteria:**

| #   | Criterion                     | Fast Track? |
| --- | ----------------------------- | ----------- |
| 1   | Single file affected?         | ✅ Yes       |
| 2   | < 50 lines of change?         | ✅ Yes       |
| 3   | No API/schema changes?        | ✅ Yes       |
| 4   | No security implications?     | ✅ Yes       |
| 5   | No cross-module dependencies? | ✅ Yes       |

### Classification Decision

```
IF ALL 5 criteria = YES:
  → 🟢 FAST TRACK MODE
  → Skip Phase 0, 0.5, 1, 2
  → Jump directly to Step 3 (S3-BUILD)
  → Still apply Lock 3 (Legacy Awareness)
  → Still validate before commit

ELSE IF 3-4 criteria = YES:
  → 🟡 STANDARD MODE
  → Execute full Sniper Model
  → Can skip diagnostic interview if requirements are crystal clear

ELSE (0-2 criteria = YES):
  → 🔴 CRITICAL MODE
  → Full ceremony required
  → Extended validation
  → Mandatory user approval at each gate
```

### Fast Track Artifact (Minimal S3-BUILD)

When in Fast Track mode, generate only:

```markdown
# 🟢 FAST TRACK: [ID]-S3-BUILD-[slug].md

**Classification:** 🟢 Fast Track (all 5 criteria met)
**Target File:** `path/to/file.ext`
**Estimated Lines:** ~XX

---

## Task

- [ ] **Action:** [What to do]
  - **Anchor Point:** `functionName()` at line ~XX
  - **Change:** [Specific change description]
  - **Verification:** [How to verify it works]

---

**Lock 3 Applied:** ✅ Searched codebase, no conflicts found.
**Skip Reason:** Single-file, non-breaking change.
```

### Fast Track Logging

Even in fast track, log the decision:

```json
// .kamiflow/fast-track-log.json
{
  "entries": [
    {
      "id": "043",
      "timestamp": "2026-02-02T10:30:00Z",
      "classification": "fast_track",
      "criteria_met": 5,
      "file": "cli-core/utils/helper.js",
      "lines_changed": 12,
      "reason": "Simple utility function addition"
    }
  ]
}
```

---

## 🎯 Step 0: Logical Guard (Pre-Flight)

**Goal:** Prevent contradictions and align with current state.

### MANDATORY Actions:

- [ ] **Context Anchoring:** Read `{{KAMI_WORKSPACE}}PROJECT_CONTEXT.md` to refresh memory.
- [ ] **Configuration Awareness:** Read `./.kamirc.json` to identify `gatedAutomation` and `executionMode`.
- [ ] **Conflict Detection:** Check for contradictions (e.g., "Fast" vs "High Complexity").
- [ ] **STOP:** If conflicts exist, alert the user and resolve before proceeding.

## 1. 🎯 Step 1: The Blueprint (S1-IDEA)

**Role:** Critical Chef / Consultant.
**Goal:** Diagnostic interview and strategic synthesis.

### MANDATORY Actions:

- [ ] **Diagnosis:** Ask 3-5 probing questions informed by Phase 0.
- [ ] **Synthesis:** Generate 3 distinct approaches (A/B/C) with **Star Ratings**.
- [ ] **The Strategic Gate:**
  - IF `gatedAutomation == true`, you MUST STOP and wait for user approval.
  - IF `gatedAutomation == false`, perform a "Strategic Reflection" and auto-select Option B.

---

## 2. 📋 Step 2: The Specs (S2-SPEC)

**Role:** Specification Architect.
**Goal:** Define structure before logic.

### MANDATORY Actions:

- [ ] **Lock 1 (Context Anchoring):** Read `PROJECT_CONTEXT.md` to prevent "Session Amnesia".
- [ ] **Lock 2 (Schema-First):** Define Data Models, Interfaces, or Schemas BEFORE any business logic.
- [ ] **Planner Exit:** IF `executionMode == "Planner"`, finalize after creating S2-SPEC and S3-BUILD. Do NOT execute code.
- [ ] **Outcome:** Produce a technical blueprint (User Stories, API Signatures, Edge Cases).

---

## 3. 🔨 Step 3: The Plan (S3-BUILD)

**Role:** Senior Tech Lead.
**Goal:** Breakdown into executable, low-risk tasks.

### MANDATORY Actions:

- [ ] **Lock 3 (Legacy Awareness):** Perform **Reconnaissance**. Search codebase for existing code and side-effects.
- [ ] **Granularity:** Divide work into atomic **Tasks and Subtasks**.
- [ ] **Anchor Points:** Specify exact function names, variables, or line descriptions for the IDE Agent.
- [ ] **TDD Strategy:** Mandate "Write Tests First" if modifying core utilities or high-risk logic.

---

## 🔒 The 3-Layer Locks Architecture

1. **Lock 1 (Context):** Force-read memory to align with project goals.
2. **Lock 2 (Schema):** Prevent logic drift by anchoring to data structures.
3. **Lock 3 (Legacy):** Prevent duplication and regression by scanning existing code.

## ⛔ FORBIDDEN Actions

- NEVER skip the Diagnostic Gate, even in `/kamiflow:dev:lazy` mode.
- NEVER write logic before defining the Schema (Lock 2).
- NEVER assume a file exists without searching (Lock 3).

## ✅ Success Criteria

- The plan is so detailed that a Junior AI can execute it with zero hallucinations.
- All artifacts are saved in the `tasks/` directory with correct IDs.
