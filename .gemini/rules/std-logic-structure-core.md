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
- **Storage:** Stored in `resources/blueprints/rules/global/guides/` as `[name]-guide.md`.
- **Smart Aliasing:** The Transpiler automatically renames these to `g-[name].md` in the execution environment to save tokens.

---

## 2. 🔍 The Intelligence Gate (MANDATORY)

Every **Core Logic** file MUST include the following instruction to prevent over-simplification:

```markdown
### 🔍 MANDATORY INTELLIGENCE GATE
To ensure high-fidelity execution and prevent over-simplification, you MUST run:
`read_file ./.gemini/rules/g-[name].md`
BEFORE generating any artifacts (IDEA, SPEC, BUILD). 
Detailed protocols and output formats in the Guide are non-negotiable.
```

---

## 3. Directory Structure

- **Core Source:** `resources/blueprints/commands/[category]/[name]-logic.md`
- **Guide Source:** `resources/blueprints/rules/global/guides/[name]-guide.md`
- **Guide Execution:** `.gemini/rules/g-[name].md` (Renamed by Transpiler)

**Note:** The Transpiler treats both as Partials. Only the Core is usually included in the main TOML prompt by default to save tokens.
