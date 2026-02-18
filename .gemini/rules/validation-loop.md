---
name: validation-loop
type: RULE
description: 3-phase validation loop for code quality assurance
group: global
order: 80
---

# 🔍 Validation Loop

## 1. The 3-Phase Model

- **Phase A: Syntax (BLOCKING)** — Lint, compile, type check. Must pass to continue.
- **Phase B: Functional (BLOCKING)** — Unit / integration / smoke tests. Must pass to continue.
- **Phase C: Traceability (WARNING)** — Verify changes match original requirements (>70% coverage).

## 2. Gate Logic

`START → Phase A (Pass) → Phase B (Pass) → Phase C (≥70%) → Exit`.

- **RETRY:** Max 3x with self-healing attempt.
- **BLOCK:** Escalate to user if retries exhausted.

## 3. Gate Status

- **PASS:** Proceed to next step.
- **PASS WITH NOTES:** Document deferred criteria, proceed with caution.
- **BLOCK:** Log error, STOP workflow, notify user.

## 4. Self-Correcting Learning Loop

1. **Track:** Maintain session-based error counters (`error_syntax`, `error_import_missing`, etc.).
2. **Threshold:** If `count(error_type) > 3` → Append to `.memory/anti-patterns.md`.
3. **Format:** `- **[Category]:** [Instruction to avoid the error]. (Learned [YYYY-MM-DD])`
4. **Notify:** "🧠 I have updated `.memory/anti-patterns.md` to avoid this error in the future."
