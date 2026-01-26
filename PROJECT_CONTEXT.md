# 🧠 MEMORY BANK: KamiFlow Template

> **SYSTEM NOTE:** This file is the "Short-term Memory" (RAM) of the project.
> **RULE:** Update this file at the end of every session using `/kamiflow:save-context`.
> **INTEGRATOR RULE (ID Caching):** After running `/wake`, maintain `cached_max_id` in session memory for fast ID generation. Only re-scan when user requests correction.

## 1. Project Identity

- **Goal:** A rigorous, opinionated "Operating System" template for Indie Hackers using Gemini CLI + AI IDEs.
- **Current Phase:** Template v2.15.3.2.1 (Modular Engine)
- **Key Tech:** Gemini CLI (TOML Commands), Node.js CLI, Windsurf/Cursor, Markdown Protocols.

## 2. Active Context (The "Now")

> **INTEGRATOR RULE:** Always update all 4 fields (Phase, Last Action, Focus, Next Step) during `/sync`.

- **Last Completed Action:** Refactored Onboarding Documentation (GETTING_STARTED & TROUBLESHOOTING) (Task 017).
- **Current Focus:** Final verification of v2.15.1 stability.
- **Next Step:** Official Release.

## 3. Knowledge Map (Directory Guide)

- **Overview:** `docs/overview.md` (Start here)
- **Tasks:** `tasks/` (Centralized Artifacts: Briefs, PRDs, Tasks, Handoffs)
- **Commands:** `.gemini/commands/kamiflow/` (Modular: `core/`, `ops/`, `dev/`)
- **Rules:** `.gemini/rules/`
- **Skills:** `.gemini/skills/`
- **IDE Bridge:** `.windsurf/`
- **Logs:** `docs/handoff_logs/` (Lazy logs tagged with `_lazy`/`_superlazy`)
