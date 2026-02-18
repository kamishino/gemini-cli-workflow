---
name: fast-track
type: RULE
description: Lightweight task handling for small, obvious changes
group: global
order: 50
---

# ⚡ Fast Track

## 1. Automatic Triggers

Activated if task matches ALL 5 criteria:

1. Single file affected.
2. < 50 lines of change.
3. No API or schema changes.
4. No security implications.
5. No cross-module dependencies.

## 2. Execution Flow

`Classification → Codebase Verification → Minimal Plan → Execute & Validate → Exit`.

## 3. Escalation Rules

Switch to standard workflow if:

- Codebase conflicts found during verification.
- Validation fails 2+ times.
- Side effects discovered during implementation.
- Scope grows beyond 50 lines.
