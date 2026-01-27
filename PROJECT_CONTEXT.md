# 🧠 MEMORY BANK: KamiFlow Template

> **SYSTEM NOTE:** This file is the "Short-term Memory" (RAM) of the project.
> **RULE:** Update this file at the end of every session using `/kamiflow:ops:save-context`.
> **INTEGRATOR RULE (ID Caching):** After running `/kamiflow:ops:wake`, maintain `cached_max_id` in session memory for fast ID generation. Only re-scan when user requests correction.

## 1. Project Identity

- **Goal:** A rigorous, opinionated "Operating System" template for Indie Hackers using Gemini CLI + AI IDEs.
- **Current Phase:** Template v2.17.3 (Modular Engine)
- **Key Tech:** Gemini CLI (TOML Commands), Node.js CLI, Windsurf/Cursor, Markdown Protocols.
- **Tour Completed:** true

## 2. Active Context (The "Now")

> **INTEGRATOR RULE:** Always update all 4 fields (Phase, Last Action, Focus, Next Step) during `/kamiflow:ops:sync`.

- **Last Completed Action:** Finalized total system audit and verified Hidden Core Architecture (Task 035).
- **Current Focus:** Maintaining the "Aesthetics + Utility" standard after the major v3.0 refactor.
- **Next Step:** Official Release v2.17.1 and preparation for public rollout.

## 3. Knowledge Map (Directory Guide)

- **Overview:** `docs/overview.md` (Start here)
- **Tasks:** `tasks/` (Centralized Artifacts: Briefs, PRDs, Tasks, Handoffs)
- **Blueprints:** `.gemini/` (Portal to cli-core/.gemini)
- **Engine:** `cli-core/` (Hidden Core Architecture)
- **IDE Bridge:** `.windsurf/` (Portal to cli-core/.windsurf)
- **Logs:** `docs/handoff_logs/` (Lazy logs tagged with `_lazy`/`_superlazy`)
