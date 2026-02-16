---
description: Code Review - Structured review with anti-pattern detection
---

# Code Review Workflow

Examines recent changes for quality, anti-patterns, and project health.

## When to Use

- After implementing a feature (self-review)
- After receiving changes from another agent or developer
- Before merging a branch
- Periodic code health checks

---

## Steps

// turbo

1. **Load Memory** — Read `.memory/context.md`, `.memory/patterns.md`, and `.memory/anti-patterns.md`.

// turbo 2. Get changes to review:

```bash
git diff --stat HEAD~1
git diff HEAD~1
```

Or specify a range: `git diff <base>..<head>`

3. **Anti-Pattern Scan** — Check each changed file for:
   - [ ] No hardcoded absolute paths
   - [ ] No hallucinated file/function references
   - [ ] Error handling present (try/catch for async, null checks)
   - [ ] No duplicate logic (check for existing patterns in codebase)
   - [ ] Platform-compatible commands (PowerShell on Windows, etc.)

4. **Architecture Review:**
   - Does the change follow existing patterns in the codebase?
   - Are new functions/modules properly exported?
   - Are new files placed in the correct directory?
   - Is naming consistent with project conventions?

// turbo 5. **Run Tests:**

```bash
npm test
```

6. **Generate Review Summary:**

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

7. Present review to user and wait for acknowledgment.
