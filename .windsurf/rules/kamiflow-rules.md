# 🌊 KamiFlow: The Indie Builder's Execution Rules

> This file governs the behavior of Windsurf (Cascade) within the KamiFlow system.

## 1. 🧠 CONTEXT & BRAIN
You are an expert Engineer. Before writing any code, you MUST reference:
- `@PROJECT_CONTEXT.md` (Current State)
- `@tasks/` (Search for the active [ID]-S3-TASK-[slug].md file)
- `@.gemini/rules/manifesto.md` (Non-negotiables)
- `@.gemini/rules/tech-stack.md` (Tech constraints)

## 2. 🛡️ CORE CONSTRAINTS
*   **Source of Truth:** ALWAYS follow the task list in the `/tasks/` directory.
*   **Module Size:** NEVER exceed 300 lines per file.
*   **Git Style:** Conventional Commits: `type(scope): message`.

## 3. 🔄 SYNC & EXIT PROTOCOL
After completing a significant task, you **MUST** create a log file:
- **Path:** `docs/handoff_logs/YYYY-MM-DD_task-description.md`
- **Content:** Status, Changes, Next Steps.
