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

<!-- KAMI_COMMAND_LIST_END -->

---

## kamiflow init-flow `Alias: init`
> **Goal:** Initialize a project with the KamiFlow ecosystem.

### ⚡ Options for Speed
- `-m, --mode <mode>`: Integration mode: `link` (default), `submodule`, or `standalone`.
- `--skip-interview`: Skip all onboarding questions and use default templates.

### 🚀 Fast Track
```bash
kami init --skip-interview
```

---

## kamiflow doctor-flow `Alias: doctor`
> **Goal:** Check project health and configuration.

### ⚡ Options for Speed
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
3. **Injection:** Updates Markdown tables in `README.md`, `GEMINI.md`, and the `docs/commands/` Wiki.

### 🚀 Fast Track
```bash
kami sync
```

---

## kamiflow archive-flow `Alias: archive`
> **Goal:** Clean up your `tasks/` directory by moving completed files to the archive.

### 🧠 Thinking Process
1. **Scan:** Finds all files starting with an ID (e.g., `001-`).
2. **Interactive:** Presents a checkbox menu for you to select which tasks to move.

### 🚀 Fast Track
```bash
kami archive
```

---

## kamiflow config-flow `Alias: config`
> **Goal:** Manage persistent project settings in `.kamirc.json`.

### ⚡ Options for Speed
- `set <key> <value>`: Save a setting.
- `get <key>`: Retrieve a setting.
- `list` (or `ls`): Show all settings.

### 🚀 Fast Track
```bash
kami config set language vietnamese
```

---

## kamiflow update-flow `Alias: upgrade`
> **Goal:** Update KamiFlow core to the latest version.

### 🚀 Fast Track
```bash
kami upgrade
```