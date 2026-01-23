---
description: KamiFlow Task Execution Bridge
auto_execution_mode: 1
---

# KamiFlow Execution Bridge

This workflow is the "Receiver" for the Gemini CLI `/kamiflow:bridge` command.

## 1. 📥 Bridge Handshake
1.  **Context Ingestion:** Ask user: *"Please paste the Context Package from Gemini CLI."*
2.  **Task Discovery:** Scan the `/tasks/` directory for the matching ID-TASK-[slug].md mentioned in the package.
3.  **Rule Alignment:** Read `@.windsurf/rules/kamiflow-rules.md`.

## 2. ⚡ Task Implementation Loop
1.  **Implementation:** Write code respecting the 300-line rule.
2.  **Verification:** Mark task as completed `[x]` in the `/tasks/` file.
3.  **Execute Phase 4: Quality Gate:** Run lint, security, and commit checks at the end.

## 3. 🔄 Sync Back Protocol
**CRITICAL:** When the user indicates the session is done or the main task is complete.

1.  **Generate Handoff Log:**
    - Get the current date (YYYY-MM-DD) and current time (HHMM).
    - **CRITICAL:** Replace HHMM with actual hours and minutes (e.g., 2014 for 20:14).
    - Create a file at: `docs/handoff_logs/YYYY-MM-DD_HHMM_[task-slug].md`
    - *(Example: `docs/handoff_logs/2026-01-23_2014_optimized-bridge.md`)*
2.  **Final Message:**
    - "Session Complete. Log created. Please return to Gemini CLI and run `/kamiflow:sync`."