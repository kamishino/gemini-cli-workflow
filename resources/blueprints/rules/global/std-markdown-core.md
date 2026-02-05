---
name: std-markdown-core
type: RULE
description: Markdown hygiene and placeholder standards
group: global
order: 120
---

# 📜 Rule: Markdown Hygiene & Placeholder Standards

> **Goal:** Prevent syntax corruption and ensure reliable path injection during transpilation.

---

## 1. 🛑 NON-NEGOTIABLES
- **Quad-Backticks:** Use ` ` ` ` (four backticks) for code blocks inside Markdown files that contain nested code blocks (e.g., blueprints).
- **No Leading Slashes:** NEVER use a leading slash before `{{KAMI_WORKSPACE}}`. Correct: `{{KAMI_WORKSPACE}}tasks/`.
- **Anchored Paths:** ALL file references must start with `./` to assist AI root detection.

## 2. 🧩 PLACEHOLDER REGISTRY
Only use approved placeholders:

| Placeholder | Purpose | Transpiled Result |
| :--- | :--- | :--- |
| `{{ KAMI_WORKSPACE }}` | Core folder path | `./.kamiflow/` |
| `{{ KAMI_RULES_GEMINI }}` | Behavioral rules path | `./.gemini/rules/` |
| `{{ PROJECT_NAME }}`| Project identity | (From config) |
| `{{ DATE }}` | Timestamping | (Current Date) |

## 3. 🏗️ PATH ANCHORING (SSOT)
All AI interactions MUST use anchored paths:
- **Good:** `./.kamiflow/PROJECT_CONTEXT.md`
- **Bad:** `.kamiflow/PROJECT_CONTEXT.md`
- **Bad:** `PROJECT_CONTEXT.md`

## 4. 🛡️ SELF-HEALING REGEX
If you see `/./.kamiflow/` in generated files, it is a CORRUPTION.
- **Cause:** Double prefixing.
- **Fix:** The Transpiler `sanitizeContent()` should be updated, or fix the source partial to remove the leading slash.

## 5. 🧠 AI BEHAVIOR
When writing documentation or blueprints:
1. Double-check backtick counts.
2. Ensure every `@` reference is anchored with `./`.
