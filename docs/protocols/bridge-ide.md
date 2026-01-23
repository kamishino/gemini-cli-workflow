# 🌉 Protocol: The IDE Bridge
> **Goal:** Seamless context switching between Gemini CLI (Strategy) and External AI Editors (Windsurf, Cursor, VS Code).

## 1. The Separation of Concerns
| Tool | Role | Strengths |
| :--- | :--- | :--- |
| **Gemini CLI** | Technical Co-Founder | Strategy, Architecture, Task Breakdown, Project Memory. |
| **AI Editor** | 10x Engineer | Context-aware Coding, Refactoring, Debugging, High-speed Edit. |

## 2. The Handoff (Gemini -> IDE)
**Trigger:** You have a Task List (`/kamiflow:task`) and are ready to write code.

**Procedure:**
1.  **In Gemini:** Run `/kamiflow:bridge`.
    *   *System Action:* Generates a "Context Package" prompt containing the Essence of Rules, Current Tasks, and Tech Stack.
2.  **In IDE:** Open the Chat/Composer (Cascade/Copilot) and Paste.
3.  **Execute:** Let the IDE implement the code based on the strict prompt.

**Critical Rule for IDE:**
> "Follow the Plan. Do NOT refactor unrelated code. Follow the `manifesto.md` (No files > 300 lines)."

## 3. The Sync Back (IDE -> Gemini)
**Trigger:** You finished a major task or phase.

**Procedure:**
1.  **In IDE:** Commit your changes (using Git).
2.  **Switch to Gemini:** Run `/kamiflow:sync`.
    *   *System Action:* Gemini reads handoff logs, updates `PROJECT_CONTEXT.md` and `docs/ROADMAP.md`.
    *   *Git Amend Logic:* If documentation was updated, Gemini asks: "Amend to last local commit? (Y/N)".
    *   *Safety:* Only amends if commit is local (not pushed). Otherwise creates separate docs commit.
3.  **Cleanup:** Gemini offers to delete processed handoff logs.

### Git Amend Strategy
The sync command uses a smart amend strategy to keep git history clean:

- **If Last Commit is Local:** Offers to amend documentation updates into the feature commit
- **If Last Commit is Pushed:** Creates separate documentation commit (no amend)
- **User Confirmation Required:** Never amends without explicit Y/N confirmation
- **Safety Check:** Uses `git branch -vv` to verify commit is local before amending

**Benefits:**
- Clean, atomic feature commits with included documentation
- No "fixup" commits for documentation updates
- Preserves semantic commit history

## 4. Tips for Hybrid Flow
*   **Split Screen:** Keep Gemini CLI open on one side (for guidance/strategy) and IDE on the other (for coding).
*   **Don't Duplicate:** Don't ask IDE to "Plan". Don't ask Gemini to "Fix Syntax Error". Use the right tool for the job.
