---
description: Project Sync - Update memory, review session work, and create unified commit
---
<!-- AGK_WORKFLOW_RENDER: id=sync; target=antigravity; model=default -->

# /sync — Project Sync Workflow

Collect session intelligence, update memory and docs, and create a unified commit.

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

- "Sync the project"
- "Save my progress"
- "Update the docs and commit"
- "Wrap up this session"
- "Create a unified commit for today's work"

## When to Use

- End of session after implementation/validation is complete.
- Before switching machine or context and you need memory continuity.
- When multiple small commits need one clean session-level summary.

---

## Steps

// turbo

1. **Load Memory** — Read `.memory/context.md` to understand current state.

// turbo

2. **Review Session Work** — Identify all changes:

```
git status
git diff --stat
```

3. **Catalog Changes** — List what was done:
   - Files created/modified/deleted
   - Features added or bugs fixed
   - Decisions made and why

4. **Update Memory:**
   - Overwrite `.memory/context.md` with current project state
   - Append new decisions to `.memory/decisions.md`
   - Update `.memory/patterns.md` if new conventions discovered
   - Auto-append to `.memory/anti-patterns.md` if repeated errors occurred

5. **Strategic Reflection** — For each completed item:
   - Value Delivered (1-sentence)
   - Technical Debt (None / Minor / Significant)
   - Lessons Learned
   - Follow-up Tasks (if any)

6. **Unified Commit** — Stage all changes and commit:

   ```
   chore(sync): [session summary]

   Completed:
   - [list of completed items]

   Updated:
   - [docs/memory updated]
   ```

7. **Done** — Session intelligence saved for next time.

---

## Related Workflows

| Workflow      | When to Use                                        |
| ------------- | -------------------------------------------------- |
| `/checkpoint` | Mid-session save before risky operations           |
| `/compact`    | Compress long context before final sync            |
| `/release`    | Perform version bump/tag flow after sync if needed |
| `/wake`       | Restore synced context in a new session            |
