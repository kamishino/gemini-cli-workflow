# 🏗️ KamiFlow Plugin Blueprint

This document defines the technical standards for creating expansion modules (Plugins) in the KamiFlow ecosystem.

---

## 📁 1. Directory Structure

Plugins MUST be stored in a dedicated sub-folder with a `p-` prefix within `.gemini/commands/kamiflow/`.

```text
.gemini/commands/kamiflow/
├── p-[plugin-name]/
    └── [command-1].toml
    └── [command-2].toml
    ├── [command-3].toml
```

---

## 📜 2. Command Definition Standards

Each command MUST be a single `.toml` file.

### 2.1 File Header

- **description:** Clear and concise action summary.
- **group:** Use the plugin folder name (e.g., "p-seed").
- **order:** Numeric value to control display order in `/help`.

### 2.2 The Instruction (Prompt)

The `prompt` field is the "Brain" of the command. We use **Prompt-Only Execution**—all logic and tool-call instructions should be described inside the prompt. Use triple quotes `'''` for multi-line instructions.

---

## 🏷️ 3. Naming Conventions

### 3.1 Namespace

Follow the pattern: `/kamiflow:p-[plugin-name]:[action]`

- Correct: `/kamiflow:p-seed:draft`
- Incorrect: `/kamiflow:seed:draft`

### 3.2 File Names

Use kebab-case for filenames: `analyze-idea.toml`, `cloud-deploy.toml`.

---

## 📖 4. Documentation

Every Plugin MUST provide a user-facing guide at `{{KAMI_WORKSPACE}}docs/plugins/[plugin-name].md` covering:

- **Philosophy:** Why this plugin exists.
- **Workflow:** How to use the commands together.
- **Command Reference:** A table of available commands and their goals.

---

## 💬 5. Validation & Cleanup

After creating or updating a Plugin, always run:

1. `kamiflow validate`: Check TOML syntax for errors.
2. `kamiflow sync`: Update global documentation tables.
3. `/kamiflow:ops:sync`: **(CRITICAL)** Run this after any "Super Lazy" or "Saiyan" session to synchronize project memory and roadmap.
