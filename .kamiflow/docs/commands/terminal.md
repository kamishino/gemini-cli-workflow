# 🖥️ Terminal CLI Guide (Flow Suite)

[ 🏠 Home ](../../README.md) | [ 🚀 Start ](../../docs/GETTING_STARTED.md) | [ 📖 Wiki ](README.md) | [ 🆘 SOS ](../../docs/TROUBLESHOOTING.md)

---

The **`kamiflow`** (alias **`kami`**) command is used for machine-level operations, project initialization, and configuration management.

<!-- KAMI_COMMAND_LIST_START -->

### 🖥️ Terminal CLI Guide (Flow Suite)

| Command | Goal |
| :--- | :--- |
| `kamiflow init-flow` | **Initialize a project with KamiFlow.** |
| `kamiflow doctor-flow` | **Check project health.** |
| `kamiflow sync-flow` | **Synchronize command documentation.** |
| `kamiflow archive-flow` | **Archive completed tasks.** |
| `kamiflow config-flow` | **Manage persistent project settings.** |
| `kamiflow update-flow` | **Update KamiFlow to the latest version.** |
| `kamiflow info-flow` | **Display core location and version.** |
| `kamiflow resume-flow` | **Resume workflow from last checkpoint.** |

<!-- KAMI_COMMAND_LIST_END -->

---

## kamiflow init-flow `Alias: init`
> **Goal:** Initialize a project with the KamiFlow ecosystem.

### 📋 Options for Speed
- `--skip-interview`: Skip all onboarding questions and use default templates.
- **Note:** This command now performs a **Template Copy**, creating a standalone `.gemini/` configuration folder in your project.

### 🚀 Fast Track
```bash
kami init --skip-interview
```

---

## kamiflow doctor-flow `Alias: doctor`
> **Goal:** Check project health and configuration.

### 📋 Options for Speed
- `--fix`: Automatically attempt to fix detected issues (e.g., missing symlinks, broken portals).

### 🚀 Fast Track
```bash
kami doctor --fix
```

---

## kamiflow sync-flow `Alias: sync`
> **Goal:** Synchronize command documentation across all Wiki files.

### 🧠 Thinking Process
1. **Discovery:** Scans all TOML files in `.gemini/commands/kamiflow/`.
2. **Classification:** Groups commands by their metadata (Sniper, Bridge, Ops, Dev).
3. **Injection:** Updates Markdown tables in `README.md`, `GEMINI.md`, and the `./.kamiflow/docs/commands/` Wiki.

### 🚀 Fast Track
```bash
kami sync
```

---

## kamiflow archive-flow `Alias: archive`
> **Goal:** Clean up your `tasks/` directory by moving completed files to the archive.

### 📋 Options for Speed
- `[id]`: The Task ID to archive (e.g., `001`).
- `-a, --all`: Archive ALL completed tasks found.
- `-f, --force`: Skip confirmation prompt (Use with caution).

### 🧠 Thinking Process
1. **Scan:** Finds files matching the ID or all files.
2. **Interactive:** If no flags are passed, presents a checkbox menu.
3. **Autonomous:** If flags are passed, executes immediately.

### 🚀 Fast Track
```bash
kami archive 056 --force
```

---

## kamiflow config-flow `Alias: config`
> **Goal:** Manage configuration settings across three layers: Defaults, Global, and Local.

### 📂 Hierarchy
1. **Local:** Project-specific settings (`.kamirc.json` in root).
2. **Global:** User-wide settings (`~/.kami-flow/.kamirc.json`).
3. **Defaults:** System-wide fallback settings (Hardcoded in core).

### 📋 Options for Speed
- `set <key> <value> [--global]`: Save a setting. Use `--global` (or `-g`) to apply across all projects.
- `get <key>`: Retrieve the active setting value.
- `list` (or `ls`): Show a table of all settings, their values, and which layer they are loaded from (**Default**, **Global**, or **Local**).

### 🚀 Fast Track
```bash
# Set preferred language for all future projects
kami config set language vietnamese --global

# Override feasibility threshold for the current project only
kami config set seed.minFeasibility 0.8
```

---

## kamiflow update-flow `Alias: upgrade`
> **Goal:** Update KamiFlow core to the latest version.

### 🚀 Fast Track
```bash
kami upgrade
```
