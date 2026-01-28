# 🏗️ KamiFlow Plugin Blueprint

This document defines the technical standards for creating expansion modules (Plugins) in the KamiFlow ecosystem.

---

## 📂 1. Directory Structure

Plugins MUST be stored in a dedicated sub-folder within `.gemini/commands/kamiflow/`.

```text
.gemini/commands/kamiflow/
└── [plugin-name]/
    ├── [command-1].toml
    ├── [command-2].toml
    └── [command-3].toml
```

---

## 📜 2. Command Definition Standards

Each command MUST be a single `.toml` file.

### 2.1 File Header
- **description:** Clear and concise action summary.
- **group:** Use the plugin name (e.g., "seed", "deploy", "ux").
- **order:** Numeric value to control display order in `/help`.

### 2.2 The Instruction (Prompt)
The `prompt` field is the "Brain" of the command. Use triple quotes `'''` for multi-line instructions.
- **Role Definition:** Assign a specific persona to the AI.
- **Step-by-Step Logic:** Clearly define the input checks and actions.
- **Output Format:** Specify how the AI should respond.

### 2.3 Execution Steps
Use `[[steps]]` to define tools the AI should call (e.g., `run_shell_command`, `read_file`, `write_file`).

---

## 🏷️ 3. Naming Conventions

### 3.1 Namespace
Follow the pattern: `/kamiflow:[plugin-name]:[action]`
- Correct: `/kamiflow:seed:draft`
- Incorrect: `/kamiflow:core:seed-draft`

### 3.2 File Names
Use kebab-case for filenames: `analyze-idea.toml`, `cloud-deploy.toml`.

---

## 📖 4. Documentation

Every Plugin MUST provide a user-facing guide at `docs/plugins/[plugin-name].md` covering:
- **Philosophy:** Why this plugin exists.
- **Workflow:** How to use the commands together.
- **Command Reference:** A table of available commands and their goals.

---

## ✅ 5. Validation

After creating a Plugin, always run:
1. `kamiflow validate-flow`: Check TOML syntax.
2. `kamiflow sync-flow`: Update global documentation.
