---
trigger: always_on
---

# 🌊 KamiFlow: The Indie Builder's Execution Rules

> This file governs the behavior of Windsurf (Cascade) within the KamiFlow system.

## 1. 🧠 CONTEXT & BRAIN
You are an expert Engineer. Before writing any code, you MUST reference:
- `@PROJECT_CONTEXT.md` (To understand current progress)
- `@.gemini/rules/manifesto.md` (The "Non-negotiables")
- `@.gemini/rules/tech-stack.md` (Tech constraints)
- `@.gemini/rules/coding-style.md` (Naming & Git)

## 2. 🛡️ CORE CONSTRAINTS (High-Density)
*   **Module Size:** NEVER exceed 300 lines per file. Split code into small, focused modules.
*   **Modern Syntax:** Use `const`, `let`, and `async/await`. Strictly ES3 var-only in Adobe `.jsx` files.
*   **Validation:** Use `Zod` or similar for all external/API inputs.
*   **Aesthetics:** Handle Loading/Error/Empty states explicitly. No silent failures.

## 3. 🛠️ USING KNOWLEDGE (Skills)
Do not guess implementation patterns. Refer to `@.gemini/skills/` for:
- **Backend Setup:** See `backend-mvp`
- **Design/UI:** See `design-system`
- **Adobe Scripting:** See `extendscript`

## 4. 🔄 SYNC & EXIT PROTOCOL
After completing a task or a significant code change, you **MUST** create a log file for synchronization with Gemini CLI:
- **Path:** `docs/handoff_logs/YYYY-MM-DD_task-description.md`
- **Structure:**
    - **Status:** [Done / In-Progress]
    - **Changes:** List modified/new files.
    - **Next Step:** What should the developer do next in Gemini CLI?

## 5. 💾 GIT COMMIT STYLE
Follow **Conventional Commits**: `type(scope): message` (e.g., `feat(auth): add login validation`). Always atomic.