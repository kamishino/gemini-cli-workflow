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
1.  **Log Generation:** Create log in `docs/handoff_logs/`.
2.  **Final Message:** "Please return to Gemini CLI and run `/kamiflow:sync`."