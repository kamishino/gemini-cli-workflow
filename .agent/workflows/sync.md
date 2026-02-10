---
description: KamiFlow Sync - Update project context, roadmap, and create unified commit
---

# KamiFlow Sync Workflow

Harmonized sync: collect session intelligence, update project docs, and unified commit.

## References

- `.gemini/commands/kamiflow/ops/sync.toml` — Original sync command logic
- `.gemini/rules/flow-reflection-core.md` — Reflection protocol

---

## Steps

// turbo

1. Read `.kamiflow/PROJECT_CONTEXT.md` to understand current state.

// turbo 2. Read `.kamiflow/ROADMAP.md` for current goals.

3. **Review session work** — Identify all changes made in this session:
   - Run `git status` and `git diff --stat` to see modified files
   - Identify completed tasks and new artifacts

4. **Update PROJECT_CONTEXT.md** with:
   - Active context changes
   - New decisions made
   - Technical debt identified
   - Any anti-patterns learned

5. **Update ROADMAP.md** with:
   - Move completed items to Done section
   - Add any new follow-up tasks discovered
   - Update progress on in-progress items

6. **Strategic Reflection** — For each completed task, document:
   - Value Delivered (1-sentence)
   - Technical Debt (None/Minor/Significant)
   - Lessons Learned

// turbo 7. Run `npm run sync-all` to rebuild.

8. **Unified Commit** — Stage all changes and commit with descriptive message:

   ```
   chore(sync): [session summary]

   Completed:
   - [list of completed items]

   Updated:
   - PROJECT_CONTEXT.md
   - ROADMAP.md
   ```

9. **Archive** completed task artifacts from `.kamiflow/tasks/` to `.kamiflow/archive/`.
