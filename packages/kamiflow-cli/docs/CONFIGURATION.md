# ⚙️ Configuration Guide

KamiFlow uses a hierarchical configuration system that allows you to customize the behavior of the AI and the CLI for your specific needs.

---

## 🏗️ How it Works (The Hierarchy)

KamiFlow uses a Schema-First approach. All configurations are validated against a formal schema located at `./.kamiflow/schemas/kamirc.schema.json`. This provides:

- **Intellisense:** Auto-completion and hover descriptions in VS Code/Cursor.
- **Validation:** Graceful fallback to default values if you provide an invalid type or value.

### Hierarchy

If a key is defined in multiple layers, the **lowest** level (most specific) wins:

1.  **Local:** `./.kamirc.json` — Specific to the current project.
2.  **Global:** `~/.kami-flow/.kamirc.json` — Specific to your user account across all projects.
3.  **Default:** Built-in system defaults.

---

## 📂 Where to put it

To override a setting, create a file named `.kamirc.json` in either your project root or your home directory (`~/.kami-flow/`).

---

## 📋 Key Reference

| Key                   | Default         | Description                                                                                                 |
| :-------------------- | :-------------- | :---------------------------------------------------------------------------------------------------------- |
| `language`            | `"english"`     | The language the AI will use to talk to you. (e.g., `vietnamese`).                                          |
| `strategy`            | `"BALANCED"`    | Execution strategy for the Sniper Model: `FAST` (speed), `BALANCED` (default), `AMBITIOUS` (full-featured). |
| `maxRetries`          | `3`             | Number of times the AI will attempt to self-heal code errors during implementation.                         |
| `maxBackups`          | `5`             | Maximum number of historical versions to keep in `.kamiflow/.backup/`.                                      |
| `gatedAutomation`     | `true`          | If `true`, the AI MUST stop for user approval at strategic gates (Phase 1/2).                               |
| `executionMode`       | `"Implementer"` | `Planner` stops after specification; `Implementer` completes the full cycle.                                |
| `seed.minFeasibility` | `0.7`           | The minimum feasibility score required to promote an idea to the backlog.                                   |
| `currentEnv`          | `"development"` | Fallback environment if `KAMI_ENV` or `NODE_ENV` is not set.                                                |

---

## 🛠️ Using the CLI

You can manage your configuration directly from the terminal:

- **View all settings:** `kami config ls`
- **Set a local setting:** `kami config set language vietnamese`
- **Set a global setting:** `kami config set strategy FAST --global`
- **Get a setting:** `kami config get language`

---

## 🚀 Advanced: Environment Mapping

The `environments` key allows you to map where KamiFlow looks for the workspace and where it outputs files.

```json
{
  "environments": {
    "development": {
      "workspaceRoot": "./.kamiflow",
      "outputTargets": ["."]
    },
    "production": {
      "workspaceRoot": "./.kamiflow",
      "outputTargets": ["dist"]
    }
  }
}
```

> **Note:** Modification of the `environments` object is recommended for power users only.
