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
| `/kamiflow:ops:tour` | **[KamiFlow] Guided tour for new projects to explain the Sniper Model.** |
| `/kamiflow:ops:sync` | **[KamiFlow] Read IDE logs and perform Strategic Roadmap Sync.** |
| `/kamiflow:ops:save-context` | **[KamiFlow] Sync current state to PROJECT_CONTEXT.md (Manual Memory Save).** |
| `/kamiflow:ops:bootstrap` | **[KamiFlow] Bootstrap KamiFlow as a Git Submodule - create portal symlinks and initialize proxy files.** |

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
