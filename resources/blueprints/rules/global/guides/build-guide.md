---
name: build-guide
type: RULE_MODULE
description: [KamiFlow Sniper] Detailed protocol for Legacy-Aware Implementation Planning (S3-BUILD).
group: sniper
order: 31
---

# 📖 S3-BUILD Guide: Battle Plan Protocol

## 1. Lock 3: Legacy Code Awareness
**MANDATORY:** Before planning, you MUST:
- **Search:** Find related files and functions.
- **Analyze:** Identify what could break (Side-effects).
- **Score Risk:** 0-30 scale based on complexity and blast radius.
- **Strategy:** Sequential (Critical Path) vs Parallel tasks.

## 2. Task Generation Rules
- **Anchor Points:** Mention specific functions or variables.
- **Verification:** Include `grep` or `node --check` commands for each task.
- **Atomic:** Each task produces a verifiable change.
- **Junior-Friendly:** Clear, step-by-step instructions.

---

## 3. 📄 S3-BUILD MANDATORY TEMPLATE
Copy and fill in this exact template. DO NOT omit any section.

```markdown
# 🔨 BUILD PLAN: [Feature Name]

**ID:** [ID]
**Type:** BUILD
**Slug:** [slug]
**Parent:** [ID]-S2-SPEC-[slug].md
**Status:** IN-PROGRESS

---

## 📋 Legacy Code Analysis (Lock 3)

### 🔍 Reconnaissance Report
- **Files Analyzed:** [List specific files you read]
- **Key Discovery:** [Crucial logic points found]
- **Side-Effect Risk:** [Low/Medium/High] - [Why?]

### 🧪 TDD Requirement
- **Status:** [Required / Not Required]
- **Reason:** [Brief explanation]

---

## 🎯 RISK & STRATEGY

### Risk Score: [X/30] ([LOW/MEDIUM/HIGH])
- **Data Loss Risk:** [0-10]
- **Breaking Changes:** [0-10]
- **Blast Radius:** [0-10]

### ⚡ Execution Strategy
- **Critical Path:** [Phase X -> Phase Y]
- **Parallel Tracks:** [List tasks that can be executed independently]

---

## 🔨 Implementation Task List

### Phase 1: Foundation 🧱
- [ ] **Task 1.1: [Name]**
  - **Goal:** [Objective]
  - **Files:** `path/to/file.ts`
  - **Anchor:** `functionName()` at line ~XX
  - **Action:** [Specific code change]
  - **Verify:** `node --check path/to/file.ts`

### Phase 2: Core Logic 🧠
- [ ] **Task 2.1: [Name]**
  ...

### Phase 4: Quality Gate & Validation ✨ (MANDATORY)
- [ ] **Task 4.0: Execute Validation Loop**
  - **Protocol:** Follow flow-validation-core.md
- [ ] **Task 4.1: Run Lint & Style Check**
- [ ] **Task 4.2: Stage Changes (Unified Commit Prep)**
  - **Action:** `git add .`
```
