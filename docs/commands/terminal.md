# 🖥️ Terminal CLI Guide (Flow Suite)

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

<!-- KAMI_COMMAND_LIST_END -->

---

## kamiflow init-flow
> **Goal:** Initialize a project with the KamiFlow ecosystem.

### 🧠 Thinking Process
1. **Config Detection:** It looks for `.kamirc.json` to skip repetitive setup questions.
2. **Mode Choice:** It helps you choose between **Link** (best for updates), **Submodule** (best for teams), or **Standalone**.
3. **Portal Creation:** It sets up the symlinks needed for the AI to "see" the core logic.

---

## kamiflow config-flow
> **Goal:** Manage persistent project settings.

### 🧠 Thinking Process
1. **Persistence:** Saves settings like `language` or `project_name` to `.kamirc.json`.
2. **AI Synergy:** The Gemini-CLI reads these settings via `/ops:wake` to provide a personalized experience.

### 🛠️ Example
```bash
kamiflow config-flow set language vietnamese
```

---

## kamiflow archive-flow
> **Goal:** Clean up your `tasks/` directory by moving completed files to the archive.

### 🧠 Thinking Process
1. **Scan:** Finds all files starting with an ID (e.g., `001-`).
2. **Grouping:** Groups them by task.
3. **Interactive:** Presents a checkbox menu for you to select which tasks to move.
