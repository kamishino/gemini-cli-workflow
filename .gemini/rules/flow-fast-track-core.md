---
name: flow-fast-track-core
type: RULE_MODULE
description: Lightweight task handling criteria and flow
group: global
order: 50
parent_rule: flow-fast-track
is_core: true
---

# ⚡ Fast Track Core

## 1. Automatic Triggers

Activated if task matches ALL 5 criteria:

1. Single file affected.
2. < 50 lines of change.
3. No API/schema changes.
4. No security implications.
5. No cross-module dependencies.

## 2. Execution Flow

`Classification → Lock 3 Verification → Minimal S3-BUILD → Execute & Validate → Fast Track Exit`.

## 3. Escalation Rules

Standard Mode required if: Lock 3 conflicts found, Validation fails 2+, Side effects discovered, or Scope > 50 lines.
