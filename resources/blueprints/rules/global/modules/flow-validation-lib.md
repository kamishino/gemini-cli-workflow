---
name: flow-validation-lib
type: RULE_MODULE
description: Validation patterns, reports and self-healing library
group: global
order: 51
parent_rule: flow-validation
is_core: false
dependencies: ["flow-validation-core"]
---

# 📚 Validation Library

## 1. Self-Healing Patterns (Phase A)
- **TOML Escape:** Replace `///` with `'''`.
- **Missing Import:** Add `require('module')` if in package.json.
- **Prototype Deletion:** Restore accidentally deleted methods.
- **Path Separators:** Use `upath` for cross-platform stability.

## 2. Validation Report Template
- **Phase A/B/C Status.**
- **Self-Healing Log.**
- **Failed Tests List.**
- **Traceability Coverage %.**

## 3. Error Messages
- **BLOCK:** "Phase A failed after 3 attempts. Error details: ... Suggested fix: ...".
- **WARNING:** "Phase C: X criteria deferred to Task ID...".
