# 🧠 Management & Operations (Ops)

[ 🏠 Home ](../../README.md) | [ 🚀 Start ](../../docs/GETTING_STARTED.md) | [ 📖 Wiki ](README.md) | [ 🆘 SOS ](../../docs/TROUBLESHOOTING.md)

---

These commands manage the project's health, memory, and onboarding. They keep the AI "awake" and the documentation in sync.

<!-- KAMI_COMMAND_LIST_START -->

### 🧠 Management (Operations)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:ops:wake` | **[KamiFlow] Wake up and reload project context to eliminate session amnesia.** |
| `/kamiflow:ops:help` | **[KamiFlow] Interactive help system for commands and Sniper Model phases.** |
| `/kamiflow:ops:save-context` | **[KamiFlow] Sync current state to PROJECT_CONTEXT.md (Manual Memory Save).** |
| `/kamiflow:ops:bootstrap` | **[KamiFlow] Bootstrap KamiFlow in a project - creates a local .gemini/ configuration from the master template.** |

<!-- KAMI_COMMAND_LIST_END -->

---

## /kamiflow:ops:wake
> **Goal:** Reload project context and eliminate "Session Amnesia".

### 🧠 Logic & Thinking (CoT)
1. **Self-Healing:** AI checks if the "Portal Network" (Symlinks) is intact. If broken, it attempts auto-bootstrap.
2. **Context Loading:** It reads `GEMINI.md`, `PROJECT_CONTEXT.md`, and `ROADMAP.md` to restore the project's "short-term memory".
3. **ID Scouting:** It scans the archive to find the next available Task ID.

### 🛠️ Practical Usage
Run this at the start of every session:
```bash
/kamiflow:ops:wake
```

---

## /kamiflow:ops:sync
> **Goal:** Synchronize project context after an external IDE session.

### 🧠 Logic & Thinking (CoT)
1. **Log Processing:** AI reads the handoff logs from `docs/handoff_logs/`.
2. **Docs Alignment:** It automatically updates `ROADMAP.md` and `PROJECT_CONTEXT.md` based on what was completed in the IDE.
3. **Memory Update:** It ensures the AI is aware of the new files and logic created outside the CLI.

### 🛠️ Practical Usage
```bash
/kamiflow:ops:sync
```

---

## /kamiflow:ops:help
> **Goal:** Interactive mentor system for commands and Sniper Model phases.

### 🧠 Logic & Thinking (CoT)
1. **Context Check:** AI looks at where you are in the project.
2. **Recommendation:** It suggests the most logical next command (e.g., "You have a Spec, you should run /build").
3. **Guidance:** It provides detailed documentation for any keyword.

### 🛠️ Practical Usage
```bash
/kamiflow:ops:help build
```

---

## /kamiflow:ops:bootstrap
> **Goal:** Initialize KamiFlow in a new project using the Template Copy method.

### 🧠 Logic & Thinking (CoT)
1. **Pre-Flight:** Checks if `.gemini/` already exists.
2. **Template Copy:** Executes `kami init` to copy the master configuration template into your project's root.
3. **Independence:** The copied configuration is **standalone**. You can edit rules and commands without affecting the global core.

### 🛠️ Practical Usage
```bash
/kamiflow:ops:bootstrap
# Or simply run:
kami init
```

---

## /kamiflow:ops:doc-audit
> **Goal:** Intelligent Documentation Auditor - Scan and heal documentation rot.

### 🧠 Logic & Thinking (CoT)
1. **Deep Scan:** Parses all Markdown files to find dead links and broken references.
2. **Drift Detection:** Compares `README.md` badges and Command Tables against the actual Codebase state.
3. **Healing:** Offers to run `kami sync` and other fixers to restore consistency.

### 🛠️ Practical Usage
```bash
kami doc-audit
```
