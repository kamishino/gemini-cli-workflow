---
name: flow-validation-core
type: RULE_MODULE
description: Core 3-phase validation loop protocol
group: global
order: 80
parent_rule: flow-validation
is_core: true
---

# 🔍 Validation Core

## 1. The 3-Phase Model

- **Phase A: Syntax (BLOCKING)** - TOML, TS, JS check + Lint.
- **Phase B: Functional (BLOCKING)** - Unit/Integration/Smoke tests.
- **Phase C: Traceability (WARNING)** - S2-SPEC coverage (>70%), S3-BUILD completion.

## 2. Gate Logic

`START → Phase A (Pass) → Phase B (Pass) → Phase C (>=70%) → Strategic Exit`.

- **RETRY:** Max 3x with self-healing.
- **BLOCK:** Escalate to user.

## 3. Gate Status

- **PASS:** Proceed to reflection.
- **PASS WITH NOTES:** Document deferred criteria.
- **BLOCK:** Log error, STOP workflow.

## 4. Self-Correcting Mechanism (The Learning Loop)

### Logic

1. **Track:** Maintain session-based error counters (e.g., `error_powershell_syntax`, `error_import_missing`).
2. **Threshold:** IF `count(error_type) > 3`:
   - **Action:** Update `GEMINI.md` AND `resources/templates/GEMINI.md`.
   - **Method:** Append to `## 🛑 Anti-Patterns`.
   - **Content:** "- **[Type]:** [Instruction to avoid error] (Learned [Date])"
3. **Notify:** "🧠 I have updated my Constitution and Templates to avoid this error in the future."
