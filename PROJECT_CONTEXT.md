# 🧠 MEMORY BANK: KamiFlow Template

> **SYSTEM NOTE:** This file is the "Short-term Memory" (RAM) of the project.
> **RULE:** Update this file at the end of every session using `/kamiflow:save-context`.
> **INTEGRATOR RULE (ID Caching):** After running `/wake`, maintain `cached_max_id` in session memory for fast ID generation. Only re-scan when user requests correction.

## 1. Project Identity

- **Goal:** A rigorous, opinionated "Operating System" template for Indie Hackers using Gemini CLI + AI IDEs.
- **Current Phase:** Template v2.7 (Onboarding Excellence)
- **Key Tech:** Gemini CLI (TOML Commands), Windsurf/Cursor, Markdown Protocols.

## 2. Active Context (The "Now")

> **INTEGRATOR RULE:** Always update all 4 fields (Phase, Last Action, Focus, Next Step) during `/sync`.

- **Last Completed Action:** Implemented Onboarding Excellence & Integration Guide (Task 013).
- **Current Focus:** Final verification of the integrated KamiFlow v2.7 ecosystem.
- **Next Step:** Perform a clean-room test of the Submodule bootstrapping on a fresh environment.

## 3. Knowledge Map (Directory Guide)

- **Overview:** `docs/KAMIFLOW_OVERVIEW.md` (Start here)
- **Tasks:** `tasks/` (Centralized Artifacts: Briefs, PRDs, Tasks, Handoffs)
- **Commands:** `.gemini/commands/kamiflow/*.toml` (Including lazy and superlazy modes)
- **Rules:** `.gemini/rules/`
- **Skills:** `.gemini/skills/`
- **IDE Bridge:** `.windsurf/`
- **Logs:** `docs/handoff_logs/` (Lazy logs tagged with `_lazy`/`_superlazy`)
