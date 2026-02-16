---
description: KamiFlow Quick Fix - Fast Track for small, obvious changes (bypasses full Sniper Model)
---

# KamiFlow Quick Fix Workflow

Streamlined workflow for small, safe changes that don't require the full Sniper Model ceremony. Maps to Fast Track Classification (🟢 ALL 5 = YES).

## When to Use

- Single file affected
- < 50 lines of change
- No API/schema changes
- No security implications
- No cross-module dependencies

Examples: typo fixes, config updates, comment improvements, dependency bumps, simple refactors.

---

## Steps

// turbo

1. Read `.kamiflow/PROJECT_CONTEXT.md` to refresh project context.

2. **Fast Track Validation** — Confirm ALL 5 criteria are met:
   - [ ] Single file affected
   - [ ] < 50 lines of change
   - [ ] No API/schema changes
   - [ ] No security implications
   - [ ] No cross-module dependencies

   **If ANY criteria fails:** Switch to full `/kamiflow` workflow instead.

3. **Lock 3: Reconnaissance** — Even for small changes, verify the target exists:
   - Confirm the file path is real
   - Check for existing functions/patterns before editing
   - Note any side effects

4. **Implement** — Make the change directly.

5. **Quick Validate:**

// turbo 5a. Run lint: `npx eslint --no-warn [changed_file]` (if applicable)

// turbo 5b. Run tests: `npm test` (if test suite exists)

6. **Micro-Commit** — Stage and commit with descriptive message:

   ```
   fix|chore(scope): [description]
   ```

7. **Done** — No reflection phase needed for Quick Fixes.
