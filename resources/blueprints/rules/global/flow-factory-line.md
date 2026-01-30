# 🏭 Sniper Model: The Factory Line Protocol (SSOT)

> **Purpose:** Transform raw requirements into executable code tasks via a 3-Step Fused Kernel with 3-Layer Locks.

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