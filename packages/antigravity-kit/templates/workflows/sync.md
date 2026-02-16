---
description: Project Sync - Update memory, review session work, and create unified commit
---

# /sync — Project Sync Workflow

Collect session intelligence, update memory and docs, and create a unified commit.

**Intent triggers** — This workflow activates when you say things like:

- "Sync the project"
- "Save my progress"
- "Update the docs and commit"
- "Wrap up this session"
- "Create a unified commit for today's work"

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
