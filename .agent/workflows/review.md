---
description: KamiFlow Review - Structured code review with anti-pattern detection and health validation
---

# KamiFlow Code Review Workflow

Examines recent changes for quality, anti-patterns, and project health alignment.

## When to Use

- After implementing a feature (self-review)
- After receiving changes from another agent or developer
- Before merging a branch
- Periodic code health checks

---

## Steps

// turbo

1. Read `.kamiflow/PROJECT_CONTEXT.md` to understand current state.

// turbo 2. Get changes to review:

```bash
git diff --stat HEAD~1
git diff HEAD~1
```

Or specify a range: `git diff <base>..<head>`

3. **Anti-Pattern Scan** — Check each changed file against the Constitution anti-patterns:
   - [ ] No Unix commands on Windows (use PowerShell equivalents)
   - [ ] No hardcoded absolute paths
   - [ ] No Markdown numbering drift
   - [ ] No hallucinated file/function references
   - [ ] Error handling present (try/catch for async, null checks)
   - [ ] No duplicate logic (check for existing patterns in codebase)

4. **Architecture Review:**
   - Does the change follow existing patterns in the codebase?
   - Are new functions/modules properly exported?
   - Are new files placed in the correct directory?
   - Is naming consistent with project conventions?

// turbo 5. **Health Check** — Run project doctor:

```bash
node cli-core/bin/kami.js doctor
```

// turbo 6. **Test Suite:**

```bash
cd cli-core && npx jest --verbose
```

7. **Generate Review Summary:**

   ```markdown
   ## Code Review Summary

   **Files reviewed:** [count]
   **Overall verdict:** ✅ PASS / ⚠️ NEEDS CHANGES / ❌ FAIL

   ### Findings

   - 🟢 [What's good]
   - 🟡 [Suggestions / minor issues]
   - 🔴 [Must-fix issues]

   ### Action Items

   - [ ] [Required fix 1]
   - [ ] [Required fix 2]
   ```

8. Present review to user and wait for acknowledgment.
