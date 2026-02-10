---
description: KamiFlow Sniper Model - Full idea-to-ship workflow (S1→S4→Validate→Reflect→Sync→Commit)
---

# KamiFlow Sniper Model Workflow

This workflow implements the KamiFlow Sniper Model for AntiGravity IDE — transforming a raw idea into deployed code through a structured pipeline.

## References

Read these KamiFlow rules before executing (they are already loaded as global rules):

- `.gemini/rules/flow-factory-line-core.md` — The Factory Line Protocol (S1→S3)
- `.gemini/rules/flow-execution-core.md` — Execute → Validate → Heal → Report
- `.gemini/rules/flow-validation-core.md` — 3-Phase Validation
- `.gemini/rules/flow-reflection-core.md` — Strategic Reflection + Quality Gate
- `.gemini/rules/flow-checkpoint-core.md` — Checkpoint Protocol
- `.kamiflow/PROJECT_CONTEXT.md` — Project state and active context

---

## Phase 0: Context Lock & Fast Track Classification

// turbo

1. Read `.kamiflow/PROJECT_CONTEXT.md` to refresh project context.

// turbo 2. Read `.kamiflow/ROADMAP.md` to understand current goals.

// turbo 3. Read `.kamirc.json` to check `gatedAutomation` and `executionMode` settings.

4. **Fast Track Classification** — Evaluate the user's request against 5 criteria:
   - Single file affected?
   - < 50 lines of change?
   - No API/schema changes?
   - No security implications?
   - No cross-module dependencies?

   **Decision:**
   - 🟢 ALL 5 = YES → Skip to Phase 3 (S3-BUILD), still apply Lock 3
   - 🟡 3-4 = YES → Standard Mode (full Sniper Model)
   - 🔴 0-2 = YES → Critical Mode (full ceremony + mandatory approval at each gate)

---

## Phase 1: S1-IDEA (PLANNING Mode)

**Role:** Critical Chef / Consultant

5. **Diagnostic Interview** — Ask 3-5 probing questions about the idea, informed by project context. Questions should challenge assumptions, clarify scope, and identify risks.

6. **Strategic Synthesis** — Generate 3 distinct approaches:
   - **Option A:** Conservative / Minimal
   - **Option B:** Balanced / Recommended ⭐
   - **Option C:** Ambitious / Full-featured

   Rate each with star ratings on: Complexity, Risk, Value, Time.

7. **🚦 STRATEGIC GATE — MANDATORY STOP**
   - Present options to the user
   - **WAIT for user to select an option (A/B/C)**
   - Do NOT proceed until user explicitly approves
   - Save as `S1-IDEA` artifact in `.kamiflow/tasks/` with the next available ID

---

## Phase 2: S2-SPEC (PLANNING Mode)

**Role:** Specification Architect
**Key Lock:** Schema-First (Lock 2: define data models BEFORE logic)

8. **Schema-First Design** — Define all data models, interfaces, schemas, and type definitions before any business logic.

9. **Technical Blueprint** — Document:
   - User Stories
   - API Signatures / Function Interfaces
   - Edge Cases and Error Handling
   - Integration Points

10. Save as `S2-SPEC` artifact in `.kamiflow/tasks/`.

---

## Phase 3: S3-BUILD (PLANNING Mode)

**Role:** Senior Tech Lead
**Key Lock:** Legacy Awareness (Lock 3: search codebase before making changes)

11. **Reconnaissance** — Search the codebase for existing files, functions, and patterns that relate to the planned changes. Log findings.

12. **Task Breakdown** — Create atomic, executable task list with:
    - Specific file paths and anchor points (function names, line numbers)
    - TDD strategy (write tests first for high-risk changes)
    - Dependency order

13. Save as `S3-BUILD` artifact in `.kamiflow/tasks/`.

14. **Present the BUILD plan to user for approval before executing.**

---

## Phase 4: Execute (EXECUTION Mode)

15. Implement code changes following the S3-BUILD plan task by task.

16. For high-risk changes: Write test FIRST, verify it FAILS, then implement the fix.

17. After each major subtask, run available validation:
    - TypeScript: `tsc --noEmit`
    - Node.js: `npm run lint` or project-specific scripts
    - Run tests: `npm test` or equivalent

---

## Phase 5: Validate (VERIFICATION Mode)

18. **Phase A — Syntax (BLOCKING):** Run lint, type check, TOML validation.

19. **Phase B — Functional (BLOCKING):** Run unit/integration tests.

20. **Phase C — Traceability:** Verify S2-SPEC requirements coverage (>70%).

21. **Self-Healing:** If errors found, analyze → fix → retry (max 3x). Escalate to user if self-healing fails.

---

## Phase 6: Reflect

22. **Pre-Exit Quality Gate** — Verify ALL pass:
    - [ ] Tests pass
    - [ ] No lint errors
    - [ ] Documentation updated
    - [ ] No unaddressed TODOs
    - [ ] Git status clean

23. **Strategic Reflection** — Document:
    - Value Delivered (1-sentence impact)
    - Technical Debt Assessment (None/Minor/Significant)
    - Lessons Learned
    - Follow-up Tasks

---

## Phase 7: Sync & Unified Commit

24. Update `.kamiflow/ROADMAP.md` with completed items.

25. Update `.kamiflow/PROJECT_CONTEXT.md` with session intelligence.

// turbo 26. Run `npm run sync-all` to build and sync all artifacts.

27. Stage all changes and create a unified commit with a descriptive message following the convention:

    ```
    feat|fix|chore(scope): description

    Task-ID: [NNN]
    ```

28. Archive completed task artifacts to `.kamiflow/archive/`.

---

## Quick Reference: Mode Mapping

| KamiFlow Phase     | AntiGravity Mode | AntiGravity Artifact |
| ------------------ | ---------------- | -------------------- |
| S1-IDEA            | PLANNING         | Implementation Plan  |
| S2-SPEC            | PLANNING         | Implementation Plan  |
| S3-BUILD           | PLANNING         | Task Checklist       |
| Execute            | EXECUTION        | Code Changes         |
| Validate + Reflect | VERIFICATION     | Walkthrough          |
| Sync + Commit      | VERIFICATION     | Git Commit           |
