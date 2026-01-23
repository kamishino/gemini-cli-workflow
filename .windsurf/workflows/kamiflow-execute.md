---
description: KamiFlow Task Execution Bridge
auto_execution_mode: 1
---

# KamiFlow Execution Bridge

This workflow is the "Receiver" for the Gemini CLI `/kamiflow:bridge` command. It guides the AI to execute tasks and sync back status.

## 1. 📥 Bridge Handshake (Initial Setup)
1.  **Context Ingestion:**
    - If the user has pasted a "Windsurf Handoff Package", parse it immediately.
    - If not, ask: *"Please paste the Context Package from Gemini CLI (run `/kamiflow:bridge`)."*
2.  **Rule Alignment:**
    - Read `@.windsurf/rules/kamiflow-rules.md` to load the project's brain.
    - Read `@.gemini/rules/manifesto.md` for non-negotiables.
3.  **Task Identification:**
    - Identify which task file (`docs/tasks/*.md` or provided text) is the focus.

## 2. ⚡ Task Implementation Loop
**Protocol:** Atomic execution with user confirmation.

1.  **Select Sub-task:** Pick the next unchecked item `[ ]`.
2.  **Implementation:**
    - Write code (Respecting "No Giant Files" rule).
    - **Validation:** Run related tests (if any).
3.  **Verification:**
    - Mark task as completed `[x]`.
    - **Git Commit:** Create an atomic commit.
      - Format: `type(scope): message`
      - Example: `feat(auth): implement login validation`
4.  **Loop:** Ask user: *"Proceed to next sub-task?"*

## 3. 🔄 Sync Back Protocol (The Exit)
**CRITICAL:** When the user indicates the session is done or the main task is complete.

1.  **Generate Handoff Log:**
    - Create a file at: `docs/handoff_logs/YYYY-MM-DD_[task-slug].md`
    - Content Template:
      ```markdown
      # Handoff Log: [Task Name]
      - **Status:** [Completed / In-Progress]
      - **Files Modified:**
        - [List files]
      - **Next Actions:** [What should Gemini CLI do next?]
      ```
2.  **Final Message:**
    - "Session Complete. Log created. Please return to Gemini CLI and run `/kamiflow:sync`."

## 4. Error Handling
- If context is missing: Stop and ask for it.
- If code > 300 lines: Stop and propose a split.
- If tests fail: Do not commit. Fix first.
