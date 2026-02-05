---
name: std-error-recovery-lib
type: RULE_MODULE
description: Pattern library and log formats for error recovery
group: global
order: 141
parent_rule: std-error-recovery
is_core: false
dependencies: ["std-error-recovery-core"]
---

# 📚 Error Recovery Library

## 1. Self-Healing Patterns

### Pattern 1: Wrong Task ID
- **Trigger:** File not found or ID mismatch.
- **Fix:** Global scan → Update cache → Retry.

### Pattern 2: TOML Syntax
- **Trigger:** Invalid escape sequence `///`.
- **Fix:** Replace `///` with `'''` → Validate → Continue.

### Pattern 3: Missing Import
- **Trigger:** ReferenceError.
- **Fix:** Add `const Module = require('module')` → Validate.

### Pattern 4: Path Typo
- **Trigger:** ENOENT.
- **Fix:** Fuzzy match filename (dist < 3) → Suggest fix.

## 2. Error Log Format (Level 2+)
**Path:** `{{KAMI_WORKSPACE}}errors/[timestamp]-[type].md`
**Sections:** Details, Context (Operation/File/Expected), Recovery Attempts, User Action Required, Root Cause.

## 3. Metrics & Monitoring
- **Track:** Error Rate (Target < 2/task), Auto-Heal Rate (>80%), MTTR.
- **Prevention:** Phase 0.5 verification and Lock 3 awareness.