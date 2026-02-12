---
name: superlazy-guide
type: RULE_MODULE
description: [KamiFlow] Detailed protocol for Autonomous Execution and Strategic Exit.
group: autopilot
order: 21
---

# 📖 SuperLazy Guide: Autonomous Builder Protocol

## 1. Parallel Execution (Phase 3.1)
- **Batching:** Perform up to 3 parallel tool calls (replace/write_file) for independent tasks.
- **Conflict Guard:** Tasks targeting the same file area MUST be sequential.
- **Dependency Check:** Only start tasks marked `PARALLEL: true` if dependencies are met.

## 2. Validation Loop (Phase 3B)
- **Phase A (Syntax):** TOML, JS/TS, Lint. Retry max 3x with self-healing.
- **Phase B (Functional):** Unit/Integration/Smoke tests.
- **Phase C (Traceability):** SPEC coverage > 70%.

## 3. Strategic Exit (Phase 4)
- **Quality Gate:** Pass all tests, no lint errors, docs updated, module size < 300 lines.
- **Reflection:** Document Value, Tech Debt, Lessons, and Risk.
- **Lineage:** Archive task, update ROADMAP.md and PROJECT_CONTEXT.md.

## 4. Unified Commit & Release
- **Format:** `<type>(<scope>): <subject> (Task <ID>)`.
- **Release:** Offer to trigger `/release` upon success.

## 5. Mandatory Gates
- Gate 1: After Phase 1 Interview.
- Gate 2: After Phase 2 Option selection.
- Gate 3: After Phase 3.0 Plan confirmation.

