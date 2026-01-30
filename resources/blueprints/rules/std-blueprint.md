# 📜 Rule: Blueprint & Transpiler Discipline

> **Goal:** Ensure 100% compliance with the Universal Transpiler protocol.

---

## 1. 🛑 NON-NEGOTIABLES
- **Never edit .toml files directly:** All changes to commands MUST happen in `./resources/blueprints/commands/`.
- **Metadata is Mandatory:** Every new partial MUST include: `name`, `type`, `description`, `group`, `order`.
- **No Junk:** Do not create temporary or unmapped files in the `./resources/blueprints/` directory.

## 2. 🏗️ ARCHITECTURE ENFORCEMENT
- Follow the hierarchy: `./resources/blueprints/[type]/[category]/[slug].md`.
- Group names MUST match the folder name (e.g., `group: p-seed` for files in `commands/p-seed/`).

## 3. 🔄 THE BUILD LOOP
Before completing a task that modifies logic:
1. Run `kami sync` (if affecting command lists).
2. Run `kami transpile`.
3. Verify the output in `./.gemini/commands/`.
4. Check the `./.backup/` folder to ensure history is preserved.

## 4. 🧠 AI BEHAVIOR
If you (the AI) are asked to create a new command:
1. First, create the Markdown partial in the appropriate `./resources/blueprints/commands/` subfolder.
2. Second, add the mapping to `./resources/blueprints/registry.md`.
3. Third, run the transpile sequence.
