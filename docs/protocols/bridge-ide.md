# 🌉 Protocol: The IDE Bridge
> **Goal:** Seamless context switching between Gemini CLI (Strategy) and External AI Editors (Windsurf, Cursor, VS Code).

## 1. The Separation of Concerns
| Tool | Role | Strengths |
| :--- | :--- | :--- |
| **Gemini CLI** | Technical Co-Founder | Strategy, Architecture, Task Breakdown, Project Memory. |
| **AI Editor** | 10x Engineer | Context-aware Coding, Refactoring, Debugging, High-speed Edit. |

## 2. The Handoff (Gemini -> IDE)
**Trigger:** You have a Build Plan (`S3-BUILD`) and are ready to write code.

**Procedure:**
1.  **In Gemini:** Run `/kamiflow:core:bridge`.
    *   *System Action:* Generates an `S4-HANDOFF` context package file in `/tasks/`.
    *   *Mandatory:* The AI must include a `## 📚 Documentation Contract` listing specific files and sections to be updated (README, ROADMAP, etc.).
2.  **In IDE:** Paste the handoff prompt into the AI Chat/Composer.
3.  **Execute:** Let the IDE implement the code and documentation based on the strict prompt.

**Critical Rule for IDE:**
> "Follow the Plan. Do NOT refactor unrelated code. Follow the `manifesto.md` (No files > 300 lines)."

## 3. The Sync Back (IDE -> Gemini)
**Trigger:** You finished a major task or phase.

**Procedure:**
1.  **In IDE:** Commit your changes (using Git).
2.  **Switch to Gemini:** Run `/kamiflow:ops:sync`.
    *   *System Action:* Reads handoff logs, updates `PROJECT_CONTEXT.md` and `docs/ROADMAP.md`.
    *   *Smart Git Sync:* Detects if the tree is dirty or if the last commit is local. Offers to **Amend** or create a **Unified Commit**.
3.  **Archive:** Offers to move artifacts to the `archive/` folder to clean the workspace using `/kamiflow:dev:archive`.