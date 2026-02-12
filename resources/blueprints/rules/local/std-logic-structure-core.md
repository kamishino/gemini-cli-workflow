---
name: std-logic-structure-core
type: RULE
description: Standard for splitting command logic into Core (Lite) and Guide (Full) modules
group: local
order: 250
---

# 📜 Rule: Command Logic Modularization

> **Goal:** Optimize Token efficiency by separating execution missions from detailed protocols.

---

## 1. The Core/Guide Split

Every command logic file exceeding **5KB** MUST be split into two parts:

### 1.1 Core Logic ([name]-logic.md)
- **Mission:** High-level objective.
- **Tools:** Mandatory tool call sequences.
- **Intelligence Gate:** A block requiring the AI to load the Guide if needed.
- **Target Size:** < 3KB.

### 1.2 Guide Logic ([name]-guide.md)
- **Protocols:** Step-by-step instructions.
- **Examples:** Command usage and output formats.
- **Constraints:** Edge cases and specific rules.
- **Storage:** Stored in `resources/blueprints/rules/global/guides/` to ensure portability to `.gemini/rules/`.

---

## 2. 🔍 The Intelligence Gate (Mandatory)

Every **Core Logic** file MUST include the following instruction:

```markdown
### 🔍 INTELLIGENCE GATE
If Clarify Score < 8.0, protocol details are unclear, or you need specific examples, you MUST run:
`read_file {{KAMI_RULES_GEMINI}}[name]-guide.md`
before proceeding to ensure compliance.
```

---

## 3. Directory Structure

- **Core:** `resources/blueprints/commands/[category]/[name]-logic.md`
- **Guide Source:** `resources/blueprints/rules/global/guides/[name]-guide.md`
- **Guide Output:** `.gemini/rules/[name]-guide.md` (Flattened by Transpiler)

**Note:** The Transpiler treats both as Partials. Only the Core is usually included in the main TOML prompt by default to save tokens.
