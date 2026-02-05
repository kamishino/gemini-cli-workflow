---
name: std-resource-core
type: RULE
description: Single Source of Truth for system components
group: local
order: 230
---

# 📜 Rule: Resource SSOT (Single Source of Truth)

> **Goal:** Ensure all system components are modified at the source to prevent data loss.

---

## 1. 🛑 NON-NEGOTIABLES
- **NEVER edit generated files:** All files in `./.gemini/commands/` and `{{KAMI_WORKSPACE}}docs/` are auto-generated. Direct edits will be OVERWRITTEN.
- **Source Primary:** Any modification to a command must happen in `./resources/blueprints/`.
- **Docs Primary:** Any modification to Wiki/Docs must happen in `./resources/docs/`.

## 2. 🏗️ ARCHITECTURE FLOW
The "Truth" flows in one direction:
1. **Source:** `./resources/` (Markdown/TOML partials)
2. **Action:** `kami sync` -> `kami transpile`
3. **Target:** `./.gemini/commands/` and `{{KAMI_WORKSPACE}}docs/`

## 3. 🔄 THE SYNC MANDATE
Before considering a feature "Done", you MUST:
1. Update the relevant partial in `./resources/`.
2. Run `npm run sync` (if it affects command tables).
3. Run `kami transpile` (to build the artifacts).
4. Verify the output in the target directory.

## 4. 🧠 AI BEHAVIOR
If a user asks to "Change command X", you must:
1. Locate the partial in `./resources/blueprints/commands/`.
2. Edit that partial.
3. Run the transpile sequence.
