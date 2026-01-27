# 🌉 Protocol: The IDE Bridge
> **Goal:** Seamless context handoff between Gemini CLI (Strategy) and AI Editors (Windsurf/Cursor).

## 1. Separation of Concerns
- **Gemini CLI:** The Technical Co-Founder (Strategy, Memory, Planning).
- **AI Editor:** The 10x Engineer (Implementation, Debugging, Refactoring).

## 2. The Handoff (Gemini -> IDE)
Run `/kamiflow:core:bridge` to generate an `S4-HANDOFF` package.
- **Content:** Objective, Technical Constraints, and the full BUILD Task List.
- **Documentation Contract:** Strict list of files to be updated by the IDE AI.

## 3. The Sync Back (IDE -> Gemini)
Run `/kamiflow:ops:sync` after the IDE session.
- **Action:** AI reads logs, updates `PROJECT_CONTEXT.md` and `ROADMAP.md`.
- **Git Sync:** Offers to Amend or create a Unified Commit to keep history clean.
