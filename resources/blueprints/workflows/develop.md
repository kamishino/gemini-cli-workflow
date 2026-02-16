---
description: Structured Development - Full idea-to-ship workflow with planning gates
---

# Structured Development Workflow

Transform a raw idea into deployed code through a rigorous, phase-based pipeline.

## Phase 0: Context Lock & Fast Track Classification

// turbo

1. **Load Memory** — Read `.memory/context.md` and `.memory/patterns.md` to restore project context.

2. **Fast Track Classification** — Evaluate the request against 5 criteria:
   - Single file affected?
   - < 50 lines of change?
   - No API/schema changes?
   - No security implications?
   - No cross-module dependencies?

   **Decision:**
   - 🟢 ALL 5 = YES → **Use `/quick-fix` workflow instead**
   - 🟡 3-4 = YES → Standard Mode (this workflow)
   - 🔴 0-2 = YES → Critical Mode (mandatory approval at each gate)

---

## Phase 1: Understand (PLANNING Mode)

3. **Diagnostic Interview**
   - Analyze user request for ambiguity.
   - Ask 3-5 probing questions (Root Cause, User Benefit, Tech Constraints).
   - **STOP & WAIT** for user answers before proceeding.

4. **Generate Options**

   **A. Search for precedent:**
   - Scan codebase and docs for similar past work.

   **B. Generate 3 Refined Options:**
   - **Option A (Safe & Fast):** MVP-first, minimal complexity.
   - **Option B (Balanced):** Recommended trade-off. ⭐
   - **Option C (Ambitious):** Full-featured, higher complexity.

5. **🚦 STRATEGIC GATE — MANDATORY STOP**
   - Present the options to the user.
   - **WAIT for user to select an option.**
   - Do NOT proceed until user explicitly approves.

---

## Phase 2: Specify (PLANNING Mode)

**Key Principle:** Schema-First — define data models BEFORE logic.

6. **Schema-First Design** — Define all data models, interfaces, schemas, and type definitions.

7. **Technical Blueprint** — Document:
   - User Stories
   - API Signatures / Function Interfaces
   - Edge Cases and Error Handling
   - Integration Points

---

## Phase 3: Plan (PLANNING Mode)

**Key Principle:** Legacy Awareness — search codebase before making changes.

8. **Reconnaissance** — Search the codebase for existing files, functions, and patterns that relate to the planned changes.

9. **Task Breakdown** — Create atomic, executable task list with:
   - Specific file paths and anchor points
   - TDD strategy (write tests first for high-risk changes)
   - Dependency order

10. **Present the plan to user for approval before executing.**

---

## Phase 4: Execute (EXECUTION Mode)

11. Implement code changes following the plan task by task.

12. For high-risk changes: Write test FIRST, verify it FAILS, then implement.

13. After each major subtask, run available validation:
    - Lint / type check
    - Run tests

---

## Phase 5: Validate (VERIFICATION Mode)

14. **Phase A — Syntax (BLOCKING):** Run lint, type check.

15. **Phase B — Functional (BLOCKING):** Run unit/integration tests.

16. **Phase C — Traceability:** Verify requirements coverage.

17. **Self-Healing:** If errors found, analyze → fix → retry (max 3x). Escalate to user if fails.

---

## Phase 6: Reflect

18. **Pre-Exit Quality Gate:**
    - [ ] Tests pass
    - [ ] No lint errors
    - [ ] Documentation updated
    - [ ] No unaddressed TODOs

19. **Strategic Reflection:**
    - Value Delivered (1-sentence impact)
    - Technical Debt Assessment
    - Lessons Learned

---

## Phase 7: Commit

20. **Update Memory:**
    - Append decisions to `.memory/decisions.md`
    - Update `.memory/context.md` with current state
    - Update `.memory/patterns.md` if new conventions established

21. Stage all changes and create a unified commit:

    ```
    feat|fix|chore(scope): description
    ```

---

## Related Workflows

| Workflow     | When to Use                               |
| ------------ | ----------------------------------------- |
| `/quick-fix` | Small, obvious changes (🟢 Fast Track)    |
| `/review`    | Code review before merge or after changes |
| `/release`   | Version bump and changelog generation     |
| `/sync`      | Update project context and unified commit |
