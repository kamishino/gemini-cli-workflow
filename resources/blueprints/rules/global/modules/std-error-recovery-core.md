---
name: std-error-recovery-core
type: RULE_MODULE
description: Core classification and retry logic for error recovery
group: global
order: 140
parent_rule: std-error-recovery
is_core: true
---

# 🔧 Protocol: Error Recovery Core

## 1. Error Classification System

### 3-Level Recovery Model
- **Level 1: Self-Healing (Automated)** - Fixed without user intervention.
- **Level 2: Guided Recovery (User Assist)** - Requires user decision.
- **Level 3: Escalation (Manual Intervention)** - Requires workflow restart/rethinking.

## 2. Retry Logic & Strategy

### Standard Retry Pattern
`Attempt 1 → Analyze → IF Level 1 (Retry 3x) → IF Fail (Level 2) → IF Fail (Level 3)`

### Retry Configuration
- **Max Retries:** Level 1 (3x), Level 2 (1x), Level 3 (0).
- **Strategy:** Linear backoff for fast operations; no backoff for user-facing errors.

## 3. Integration with Workflows
- **Phase 0:** Catch conflicts (Level 2).
- **Phase 0.5:** Catch path/dependency issues (Level 1/2).
- **Phase 3B:** Catch syntax/test failures (Level 1/2).
- **Phase 4:** Catch git/archive issues (Level 1/2).

## 4. User Communication
- **Level 1:** Silent or minimal notification.
- **Level 2:** Clear context + 2-3 options + `wait_for_user_input`.
- **Level 3:** Comprehensive report + guidance for `/kamiflow:dev:revise`.
