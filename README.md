# 🌊 KamiFlow: The Indie Builder's Template for Gemini CLI

**KamiFlow** is a rigorous, opinionated "Operating System" for Indie Hackers using Gemini CLI. It transforms the AI from a generic chatbot into a disciplined **Technical Co-Founder**.

> **Philosophy:** "Aesthetics + Utility". Ship fast, break nothing important.

---

## 🚀 Quick Start

1.  **Installation:**
    Copy the `.gemini/`, `docs/`, `GEMINI.md`, and `PROJECT_CONTEXT.md` files into your new project root.

2.  **Initialization:**
    Run `gemini chat` in your terminal. The AI will automatically load the KamiFlow context.

3.  **Start Building:**
    Type `/kamiflow:input I have an idea for...`

---

## 🛠 The Workflow (KamiFlow)

### 1. Strategy Phase (The Filter)
*   `/kamiflow:input` - **Capture:** Dump your raw idea.
*   `/kamiflow:verify` - **Validate:** Is it a "Painkiller" or a "Vitamin"? (3-Point Check).
*   `/kamiflow:mvp` - **Strategy:** Define the "Kernel" and cut the rest.

### 2. Factory Phase (The Blueprint)
*   `/kamiflow:brief` - **Architect:** Define technical boundaries.
*   `/kamiflow:prd` - **Product Manager:** Define user stories & schema.
*   `/kamiflow:task` - **Lead Dev:** Generate atomic task checklist.

### 3. Execution Phase (The Bridge)
*   `/kamiflow:bridge` - **Handoff:** Generate a context package for Windsurf/Cursor.
*   `/kamiflow:sync` - **Sync Back:** Read execution logs from IDE and update project memory.
*   *(Optional Native Modes):* `/kamiflow:shu` (Learn), `/kamiflow:ha` (Refactor), `/kamiflow:ri` (Code).

### 4. Management (The Brain)
*   `/kamiflow:update-roadmap` - Keep `docs/ROADMAP.md` alive.
*   `/kamiflow:save-context` - Save state to `PROJECT_CONTEXT.md`.

---

## 🧠 The "Brain" Structure

*   **`.gemini/rules/`**: The Constitution.
    *   `manifesto.md`: Non-negotiable mindset (e.g., "No files > 300 lines").
    *   `tech-stack.md`: Dynamic stack detection.
    *   `coding-style.md`: Naming & Git conventions.
*   **`.gemini/skills/`**: The Knowledge Base.
    *   Golden snippets for Backend, Design System, Adobe Scripting, etc.
*   **`.windsurf/rules/`**:
    *   `kamiflow-rules.md`: Auto-config for Windsurf IDE to respect KamiFlow.

---

## 🤝 IDE Integration (The Bridge)

KamiFlow is designed to work *with* your IDE, not replace it.

1.  **Plan in Terminal:** Use Gemini CLI to strategize and plan.
2.  **Code in IDE:** Use `/kamiflow:bridge` to get a prompt, paste it into Windsurf/Cursor.
3.  **Sync Back:** After coding, Windsurf generates a log. Run `/kamiflow:sync` in terminal to update Gemini.

---

*Built with ❤️ for the 10x Indie Hacker.*
