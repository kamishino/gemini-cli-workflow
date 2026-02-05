---
name: std-placeholder-core
type: RULE
description: Standardized infrastructure placeholders for environment agility
group: local
order: 220
---

# 📜 Rule: Infrastructure Placeholder Standard (Dogfooding)

> **Goal:** Ensure all KamiFlow blueprints are environment-agnostic by using standardized tokens.

---

## 1. 🛑 NON-NEGOTIABLES
- **NO Anchored Paths:** Never use hardcoded strings like `./.gemini/rules/` or `./.kamiflow/` inside Blueprints.
- **Token Usage:** Always use the approved infrastructure tokens.
- **Transparency:** Use tokens that clearly identify the target infrastructure (Gemini vs KamiFlow).

## 2. 🧩 TOKEN MAPPING

| Physical Path | Standard Token | Use Case |
| :--- | :--- | :--- |
| `./.gemini/rules/` | `./.gemini/rules/` | Rules, Cross-references, AI directives. |
| `./.kamiflow/` | `./.kamiflow/` | Tasks, Archives, Roadmap, Context files. |

## 3. 🏗️ EXAMPLES

### ❌ WRONG (Anchored Path)
`Follow instructions in @./.gemini/rules/std-id-core.md`
`Update file at ./.kamiflow/PROJECT_CONTEXT.md`

### ✅ CORRECT (Standard Tokens)
`Follow instructions in ./.gemini/rules/std-id-core.md`
`Update file at ./.kamiflow/PROJECT_CONTEXT.md`

---

## 4. 🛡️ SOFT-STRICT ENFORCEMENT
While this rule is "Soft Strict" (AI makes mistakes), consistently ignoring it will lead to path corruption and build failures. If you see a raw anchored path, proactively refactor it to use the appropriate Token.

---
**Status:** Dogfooding Active ✅


