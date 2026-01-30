# ≡ƒÜÇ Getting Started with KamiFlow

Welcome to **KamiFlow**, the professional "Operating System" for Indie Builders using Gemini CLI and AI IDEs. This guide will walk you through the full lifecycle of a feature, from a raw spark to a stable release.

---

## ≡ƒÅù∩╕Å 1. Installation

**Windows (PowerShell):**
```powershell
powershell -c "irmo https://raw.githubusercontent.com/kamishino/gemini-cli-workflow/main/install.ps1 | iex"
```

**MacOS / Linux / WSL (Bash):**
```bash
curl -sSL https://raw.githubusercontent.com/kamishino/gemini-cli-workflow/main/install.sh | bash
```

**Smart Assistant:** The installer will automatically check for Node.js. If missing, it can install **NVM** and setup the environment for you in a single run.

Once installed, initialize your project:
```bash
kamiflow init
```
This creates a local `.gemini/` configuration folder in your project, giving you full control over your rules and commands.

---

## ≡ƒî▒ 2. Exploration: The Seed Hub
Don't jump into code immediately. Use the **Seed Hub** to nurture your ideas.

1.  **Sow a Seed:** Run `/kamiflow:p-seed:draft "Your Idea"` to start an interactive terminal interview.
2.  **Cultivate:** Run `/kamiflow:p-seed:analyze` to get multi-dimensional feedback from 3 AI Personas (Critic, Engineer, User).
3.  **Harvest:** Run `/kamiflow:p-seed:promote` to move your ripened idea to the project **Backlog**.

---

## ≡ƒÄ» 3. Construction: The Sniper Model
When you're ready to build, use the 3-Step Fused Kernel to ensure accuracy.

1.  **Step 1 (Idea):** Run `/kamiflow:core:idea <path-to-backlog-file>`. This identifies the root cause and sets the strategic direction.
2.  **Step 2 (Spec):** Run `/kamiflow:core:spec <path-to-idea-file>`. This defines the Data Models and API signatures before any logic is written.
3.  **Step 3 (Build):** Run `/kamiflow:core:build <path-to-spec-file>`. This creates a detailed, low-risk task list with Anchor Points.

---

## ≡ƒîë 4. Execution: The IDE Bridge
KamiFlow is designed to work seamlessly with **Windsurf** or **Cursor**.

1.  **Bridge:** Run `/kamiflow:core:bridge`. Copy the context package provided.
2.  **Execute:** Paste the package into your AI IDE. Follow the `kamiflow-execute` workflow.
3.  **Sync:** Return to Gemini CLI and run `/kamiflow:ops:sync` to read the IDE logs and update your **Strategic Roadmap**.

---

## ≡ƒôª 5. Release: The Finish Line
Once your feature is validated, it's time to ship.

1.  **Release:** Run `/kamiflow:dev:release` (or `kami release patch`). The AI will analyze your task history, bump the version, sync docs, update the Roadmap, and generate a unified commit.
2.  **Archive:** Run `/kamiflow:dev:archive` (or `kami archive 001 --force`) to clean up your workspace and preserve the audit trail.

---

## ≡ƒº¡ Next Steps
- Read the [Overview](overview.md) for a deep dive into the architecture.
- Check the [Command Wiki](commands/README.md) for full reference.
- Run `kami doctor` if you encounter any system issues.
