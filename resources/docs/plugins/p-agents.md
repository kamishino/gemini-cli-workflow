# ≡ƒº⌐ Multi-Agent Bridge (/p-agents)

**Position:** Collaboration Plugin / Skill Dispatcher
**Status:** Operational

---

## ≡ƒºÉ What is the Multi-Agent Bridge?

The **Multi-Agent Bridge** is a specialized module designed to synchronize "Intelligence" across multiple AI tools (Cursor, Windsurf, Claude Code, etc.). It allows you to import community-vetted skills (from [skills.sh](https://skills.sh/)) and distribute them safely to your active development environments.

---

## ≡ƒ¢í∩╕Å Safe Audit Protocol

Before any skill is installed, KamiFlow performs a **Safety Audit**:
1.  **Fetch:** Reads the skill's source code directly from GitHub.
2.  **Analyze:** Identifies required permissions and potential system risks.
3.  **Report:** Presents a detailed report to the Boss for approval.

---

## ≡ƒöä The Collaboration Workflow

1.  **≡ƒî▒ Discovery:** Use `/kamiflow:p-agents:scan` to see which agents (IDE folders) are currently active in your project.
2.  **≡ƒôª Acquisition:** Use `/kamiflow:p-agents:add <repo>` to fetch a new skill (e.g., `vercel-labs/skills/web-design-guidelines`).
3.  **≡ƒñ¥ Handshake:** The system updates `docs/universal-agent-rules.md`. Copy this file's content to your IDE's specific rules file (e.g., `.cursorrules`) to finalize the integration.

---

## ≡ƒ¢á Commands

| Command | Action | Goal |
| :--- | :--- | :--- |
| `/kamiflow:p-agents:scan` | **Scout** | Find active agent directories in the project. |
| `/kamiflow:p-agents:add`  | **Install** | Fetch, audit, and install a skill to agents. |
| `/kamiflow:p-agents:list` | **Inventory**| List all installed extension skills. |

---

## ≡ƒôé Universal Rules (SSOT)
The bridge maintains a central source of truth for agent behavior at `docs/universal-agent-rules.md`. This ensures that whether you are using Windsurf or Cursor, the AI follows the same **KamiFlow Manifesto**.
