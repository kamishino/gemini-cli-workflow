# 🧠 MEMORY BANK: KamiFlow Template

## 1. Project Identity

- **Goal:** A rigorous, opinionated "Operating System" template for Indie Hackers using Gemini CLI + AI IDEs.
- **Current Phase:** Template v2.33.0 (Modular Engine)
- **Key Tech:** Gemini CLI (TOML Commands), Node.js CLI, Windsurf/Cursor, Markdown Protocols.
- **Tour Completed:** true

## 2. Active Context (The "Now")

> **INTEGRATOR RULE:** Always update all 4 fields (Phase, Last Action, Focus, Next Step) during `/kamiflow:ops:sync`.

- **Last Completed Action:** Implemented Existence-Aware Seeding (Task 094) - Refactored Installer and Updater to protect user project context (GEMINI.md, ROADMAP.md, etc.) during updates. Automatically cleans up redundant .kamirc.example.json when the real configuration exists.
- **Current Focus:** Final stabilization and public release preparation.
- **Next Step:** Official public rollout and community onboarding.

## 3. Knowledge Map (Directory Guide)

- **Overview:** `docs/overview.md` (Start here)
- **Tasks:** `tasks/` (Centralized Artifacts: Briefs, PRDs, Tasks, Handoffs)
- **Blueprints:** `.gemini/` (Portal to cli-core/.gemini)
- **Engine:** `cli-core/` (Hidden Core Architecture)
- **IDE Bridge:** `.windsurf/` (Portal to cli-core/.windsurf)
- **Logs:** `docs/handoff_logs/` (Lazy logs tagged with `_lazy`/`_superlazy`)
