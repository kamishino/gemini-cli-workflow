---
description: Quick Fix - Fast track for small, obvious changes (bypasses full workflow)
---
<!-- AGK_WORKFLOW_RENDER: id=quick-fix; target=antigravity; model=default -->

# /quick-fix — Fast Track Workflow

Streamlined workflow for small, safe changes that don't need full ceremony.

## Runtime Notes

### Runtime Profile: Antigravity

- Primary command surface: `agk` CLI + `.agent/workflows/*.md`.
- Rule surfaces: `GEMINI.md`, `.gemini/rules/`, and project `AGENTS.md`.
- Prefer AGK-native diagnostics (`agk status`, `agk doctor`) for validation guidance.


### Model Profile: Default

- Balance speed and rigor.
- Prefer targeted verification before broad suites.
- Keep outputs clear, concise, and actionable.


**Intent triggers** — This workflow activates when you say things like:

- "Fix this typo in..."
- "Update the config to..."
- "Change the color/text/label..."
- "Bump the dependency version"
- "Add a comment to..."

## When to Use

ALL 5 must be true:

- ✅ Single file affected
- ✅ < 50 lines of change
- ✅ No API/schema changes
- ✅ No security implications
- ✅ No cross-module dependencies

**If ANY fails** → Switch to `/develop` workflow.

---

## Steps

// turbo

1. **Load Memory** — Read `.memory/context.md` and `.memory/patterns.md`.

2. **Verify Fast Track** — Confirm ALL 5 criteria are met:
   - [ ] Single file
   - [ ] < 50 lines
   - [ ] No API/schema changes
   - [ ] No security implications
   - [ ] No cross-module deps

// turbo

3. **Reconnaissance** — Even for small changes, verify:
   - Target file/function exists
   - Check `.memory/patterns.md` for project conventions
   - Note any side effects

4. **Implement** — Make the change directly. No planning artifact needed.

// turbo

5. **Quick Validate:**

// turbo

5a. Run lint on changed files (if applicable).

// turbo

5b. Run tests (if test suite exists).

6. **Micro-Commit** — Stage and commit:

   ```
   fix|chore(scope): description
   ```

7. **Done** — No reflection phase needed for quick fixes.

---

## Related Workflows

| Workflow      | When to Use                                                   |
| ------------- | ------------------------------------------------------------- |
| `/develop`    | Any fast-track criterion fails or change scope grows mid-task |
| `/review`     | Validate a quick fix before merge                             |
| `/sync`       | End-of-session memory update and unified commit               |
| `/checkpoint` | Save context before attempting the quick fix                  |
