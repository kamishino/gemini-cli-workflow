---
description: Structured Development - Full idea-to-ship workflow with planning gates
---

# /develop — Structured Development Workflow

Transform a raw idea into deployed code through a rigorous, phase-based pipeline.

> **KamiFlow users:** Use `/kamiflow` instead — it's the KamiFlow-native version of this workflow
> with MoSCoW scoring, weighted matrix, and `.kamiflow/` integration.

**Intent triggers** — This workflow activates when you say things like:

- "Build a new feature for..."
- "Add [component] to the project"
- "I want to implement..."
- "Create a new module/page/API for..."

---

## 🔁 Phase 0: AUTO-WAKE — Session Context Restore

// turbo

> **This phase runs AUTOMATICALLY. Do not skip it.**

1. **Read all memory files** (silent, no user prompt needed):
   - `.memory/context.md` — current project state
   - `.memory/decisions.md` — last 5 decisions
   - `.memory/patterns.md` — established conventions
   - `.memory/anti-patterns.md` — mistakes to avoid

2. **Show session banner:**

   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔁 SESSION RESTORED
   📍 Last task:   [from context.md]
   ✅ Done:        [completed items]
   🔄 In progress: [started but not finished]
   ⏭  Next up:     [planned next]
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

3. **Fast Track Check** — Evaluate against 5 criteria:

   | #   | Criteria                      | ✅/❌ |
   | --- | ----------------------------- | ----- |
   | 1   | Single file affected?         |       |
   | 2   | < 50 lines of change?         |       |
   | 3   | No API/schema changes?        |       |
   | 4   | No security implications?     |       |
   | 5   | No cross-module dependencies? |       |
   - 🟢 ALL 5 = YES → **Redirect to `/quick-fix`**
   - 🟡 3-4 = YES → Standard Mode (continue)
   - 🔴 0-2 = YES → Critical Mode (extra approval gates)

---

## Phase 1: Understand — _PLANNING mode_

3. **Diagnostic Interview (Socratic Dialogue)**
   - Analyze user request for ambiguity.
   - Ask 3-5 probing questions:
     - What is the root cause / motivation?
     - Who benefits and how?
     - What technical constraints exist?
     - Are there similar patterns already in the codebase?
   - **🛑 STOP & WAIT** for user answers before proceeding.

4. **Generate 3 Options**
   - Search codebase and `.memory/decisions.md` for precedent.
   - Present:
     - **Option A (Safe):** MVP-first, minimal risk.
     - **Option B (Balanced):** Recommended trade-off. ⭐
     - **Option C (Ambitious):** Full-featured, higher complexity.

5. **🚦 STRATEGIC GATE — MANDATORY STOP**
   - Present options to user.
   - **WAIT for user to select (A/B/C)** before proceeding.
   - Create an `implementation_plan.md` artifact with the chosen approach.

---

## Phase 2: Specify — _PLANNING mode_

**Principle:** Schema-First — define data models BEFORE logic.

6. **Schema-First Design** — Define all data models, interfaces, types, and schemas first.

7. **Technical Blueprint** — Document in `implementation_plan.md`:
   - User Stories
   - API Signatures / Function Interfaces
   - Edge Cases & Error Handling
   - Integration Points

---

## Phase 3: Plan — _PLANNING mode_

**Principle:** Legacy Awareness — search codebase before making changes.

// turbo

8. **Reconnaissance** — Search codebase for existing files, functions, and patterns that relate to planned changes. Check `.memory/patterns.md` for project conventions.

9. **Task Breakdown** — Create `task.md` artifact with atomic checklist:
   - Specific file paths and anchor points (function names, line ranges)
   - Dependency order (what must be built first)
   - Test strategy (write tests first for high-risk changes)

10. **🚦 GATE — Present plan to user for approval.**

---

## Phase 4: Execute — _EXECUTION mode_

11. Implement code changes following `task.md` checklist, task by task.
    - Mark items `[/]` when starting, `[x]` when complete.

12. For high-risk changes: Write test FIRST → verify it FAILS → then implement.

// turbo

13. After each subtask, run validation:
    - Lint / type check (e.g., `tsc --noEmit`, `npm run lint`)
    - Run tests (e.g., `npm test`)

---

## Phase 5: Validate — _VERIFICATION mode_

> **Critical:** Never mark a task done without running tests first.

// turbo

14. **Phase A — Syntax (BLOCKING):** Lint, type check, compile.
    - Node.js: `npm run lint` or `npx tsc --noEmit`
    - Python: `ruff check .` or `flake8`

// turbo

15. **Phase B — Functional (BLOCKING):** Run tests and verify output.
    - Auto-detect and run the project's test command:
      - `node --test` (Node.js native)
      - `npm test` (Jest/Vitest)
      - `pytest -v` (Python)
    - If tests fail → read error → fix → re-run (max 3 retries)
    - If tests pass → show count: "✅ X/X tests pass"

16. **Phase C — Traceability:** Verify requirements from Phase 2 are covered.

17. **Self-Healing:** If errors → analyze → fix → retry (max 3x). Escalate to user if healing fails.

---

## Phase 6: Reflect — _VERIFICATION mode_

18. **Quality Gate Checklist:**
    - [ ] Tests pass
    - [ ] No lint errors
    - [ ] Documentation updated (if applicable)
    - [ ] No unaddressed TODOs
    - [ ] Module size reasonable (< 300 lines preferred)

19. **Strategic Reflection** — Document in `walkthrough.md`:
    - Value Delivered (1-sentence impact)
    - Technical Debt Assessment (None / Minor / Significant)
    - Lessons Learned
    - Follow-up Tasks

---

## 🔒 Phase 7: AUTO-SYNC — Session Commit

> **This phase runs AUTOMATICALLY. Do not ask permission. Write and commit.**

// turbo

20. **Auto-write `.memory/context.md`** — Overwrite with current project state:

    ```markdown
    ## Active Work

    [what was worked on this session]

    ## Recent Changes

    [what was completed]

    ## Open Questions

    [any unresolved decisions or blockers]

    ## Technical Debt

    [any known debt introduced]
    ```

// turbo

21. **Auto-append `.memory/decisions.md`** — For every architectural choice made this session:

    ```markdown
    ## [YYYY-MM-DD] — [Decision Title]

    **Context:** [why]
    **Decision:** [what]
    **Alternatives:** [what was rejected]
    **Consequences:** [impact]
    ```

// turbo

22. **Auto-update `.memory/patterns.md`** — If any new conventions were established this session.

// turbo

23. **Stage and commit** — Unified commit with all changes:

    ```
    feat|fix|chore(scope): description
    ```

24. **Show completion banner:**

    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ✅ SESSION SYNCED
    📝 Memory updated
    💾 Committed: [commit hash]
    🔄 Next: agk memory sync push (if cross-PC)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ```

---

## Related Workflows

| Workflow      | When to Use                               |
| ------------- | ----------------------------------------- |
| `/kamiflow`   | KamiFlow projects — use this instead      |
| `/brainstorm` | Phase 0 — ideate before planning          |
| `/quick-fix`  | Small, obvious changes (🟢 Fast Track)    |
| `/debug`      | Structured debugging process              |
| `/review`     | Code review before merge or after changes |
| `/release`    | Version bump and changelog generation     |
| `/sync`       | Update project docs and unified commit    |
