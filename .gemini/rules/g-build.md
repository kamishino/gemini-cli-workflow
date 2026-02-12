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

## 2. Reconnaissance Report Format
Summarize findings: Files Analyzed, Key Discoveries, Side-Effect Risk, TDD Requirement.

## 3. Implementation Task List Structure
- **Phase 1: Foundation:** Scaffold, DB changes, config.
- **Phase 2: Core Logic:** Main functionality.
- **Phase 3: Integration:** Wiring components, UI, APIs.
- **Phase 4: Quality Gate:** Validation Loop (Task 4.0).

## 4. Task Generation Rules
- **Anchor Points:** Mention specific functions or variables.
- **Verification:** Include `grep` or `node --check` commands for each task.
- **Atomic:** Each task produces a verifiable change.
- **Junior-Friendly:** Clear, step-by-step instructions.

## 5. Skills Integration
Reference existing skills (e.g., `kamiflow-tdd`) in task descriptions to accelerate work.

## 6. Quality Gate Protocol (Task 4.0)
- **Phase A (Syntax):** Lint, Type Check, TOML.
- **Phase B (Functional):** Tests, Smoke Test.
- **Phase C (Traceability):** S2-SPEC coverage check.

