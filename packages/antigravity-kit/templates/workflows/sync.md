---
description: Project Sync - Review session work and create unified commit
---

# Project Sync Workflow

Collect session intelligence, update documentation, and create a unified commit.

---

## Steps

// turbo

1. Read project documentation to understand current state.

2. **Review session work** — Identify all changes made in this session:
   - Run `git status` and `git diff --stat` to see modified files
   - Identify completed tasks and new artifacts

3. **Update project docs** with:
   - Active context changes
   - New decisions made
   - Technical debt identified
   - Any lessons learned

4. **Strategic Reflection** — For each completed task, document:
   - Value Delivered (1-sentence)
   - Technical Debt (None/Minor/Significant)
   - Lessons Learned

5. **Unified Commit** — Stage all changes and commit with descriptive message:

   ```
   chore(sync): [session summary]

   Completed:
   - [list of completed items]

   Updated:
   - [docs updated]
   ```
