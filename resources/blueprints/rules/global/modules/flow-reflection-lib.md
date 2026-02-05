---
name: flow-reflection-lib
type: RULE_MODULE
description: Examples and implementation details for reflection
group: global
order: 61
parent_rule: flow-reflection
is_core: false
dependencies: ["flow-reflection-core"]
---

# 📚 Reflection Library

## 1. Value Delivered Examples
- "Users can now authenticate via OAuth2, reducing friction by 80%."
- "Blueprint caching reduces transpiler load time from 2.5s to 0.3s."

## 2. Lineage Management Details
- **Archive:** `node cli-core/bin/kami.js archive [ID] --force`.
- **Roadmap Sync:** Replace `{{ACHIEVEMENTS}}` and `{{GROWTH_LEVERS}}`.
- **Context Sync:** Update PROJECT_CONTEXT.md Active Context.

## 3. Commit Protocol
- **Format:** `<type>(<scope>): <subject> (Task <ID>)`.
- **Body:** Reflection summary (Value, Debt, Follow-up).

## 4. Automation Ideas
- Auto-reflection from git diff.
- Debt assessment from TODO comments.
- Quality metrics from test results.
