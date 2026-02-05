---
name: flow-reflection-core
type: RULE_MODULE
description: Core strategic reflection and quality gate logic
group: global
order: 90
parent_rule: flow-reflection
is_core: true
---

# 🎯 Reflection Core

## 1. Pre-Exit Quality Gate
**MANDATORY:** All must PASS before proceeding.
- [ ] Tests Pass (Unit/Integration).
- [ ] No Lint Errors.
- [ ] TOML Validation Clean.
- [ ] Documentation Updated.
- [ ] No Unaddressed TODOs.
- [ ] Module Size Limit (< 300 lines).
- [ ] Git Status Clean.

## 2. Strategic Reflection Template
- **Value Delivered:** One-sentence impact.
- **Technical Debt Assessment:** Level (None/Minor/Significant) + Payback plan.
- **Lessons Learned:** Key insights.
- **Follow-up Tasks:** Dependencies/Improvements.
- **Risk Assessment:** Regression risk level.

## 3. Execution Checklist
Step 4.1: Quality Gate → Step 4.2: Reflection → Step 4.3: Lineage → Step 4.4: Commit.