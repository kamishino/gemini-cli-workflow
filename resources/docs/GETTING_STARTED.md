# 🚀 Getting Started with KamiFlow

Welcome to **KamiFlow**, the professional "Operating System" for Indie Builders using Gemini CLI and AI IDEs. This guide will walk you through the full lifecycle of a feature, from a raw spark to a stable release.

---

## 🏗️ 1. Installation

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

## 🌱 2. Exploration: The Seed Hub

Don't jump into code immediately. Use the **Seed Hub** to nurture your ideas.

1.  **Sow a Seed:** Run `/kamiflow:p-seed:draft "Your Idea"` to start an interactive terminal interview.
2.  **Cultivate:** Run `/kamiflow:p-seed:analyze` to get multi-dimensional feedback from 3 AI Personas (Critic, Engineer, User).
3.  **Harvest:** Run `/kamiflow:p-seed:promote` to move your ripened idea to the project **Backlog**.

---

## 🎯 3. Construction: The Sniper Model

When you're ready to build, use the 3-Step Fused Kernel to ensure accuracy.

1.  **Step 1 (Idea):** Run `/kamiflow:core:idea <path-to-backlog-file>`. This identifies the root cause and sets the strategic direction.
2.  **Step 2 (Spec):** Run `/kamiflow:core:spec <path-to-idea-file>`. This defines the Data Models and API signatures before any logic is written.
3.  **Step 3 (Build):** Run `/kamiflow:core:build <path-to-spec-file>`. This creates a detailed, low-risk task list with Anchor Points.

---

## 🛡️ 3.5. v2.0 Enhanced Workflow (What's New?)

The Sniper Model now includes **automatic safety checks** at every phase:

### Phase 0.5: Assumption Verification (NEW)

Before planning, KamiFlow verifies:

- ✅ All referenced files exist
- ✅ Functions/variables are real (grep search)
- ✅ Dependencies are in package.json
- ✅ Config options are valid

**You'll see:**

```
📍 ASSUMPTION VERIFICATION REPORT
✅ All assumptions verified
🚫 No hallucination risks detected
```

### Phase 3B: Validation Loop (NEW)

After implementation, automatic validation:

- **Syntax:** TOML/JS/TS checks
- **Functional:** Run tests
- **Traceability:** Check S2-SPEC coverage

**Self-Healing Example:**

```
⚠️ TOML Syntax Error: Unescaped backslash
🔧 Auto-corrected: Changed \ to \\
✅ Validation PASSED (after auto-heal)
```

### Phase 4: Strategic Reflection (NEW)

You'll be asked:

- What value did this deliver?
- Any technical debt created?
- What did you learn?
- Any follow-up tasks?

**Benefit:** Insights captured, not lost!

### Error Recovery (NEW)

If errors occur:

- **80% auto-heal** (missing imports, syntax)
- **15% guided recovery** (test failures with options)
- **5% escalate** to `/kamiflow:dev:revise`

### Resume Capability (NEW)

Workflow interrupted? No problem:

```bash
/kamiflow:ops:wake
# → Detects checkpoint
# → Resume from where you left off
```

---

## 🌉 4. Execution: The IDE Bridge

KamiFlow is designed to work seamlessly with **Windsurf** or **Cursor**.

1.  **Bridge:** Run `/kamiflow:core:bridge`. Copy the context package provided.
2.  **Execute:** Paste the package into your AI IDE. Follow the `kamiflow-execute` workflow.
3.  **Sync:** Return to Gemini CLI and run `/kamiflow:ops:sync` to read the IDE logs and update your **Strategic Roadmap**.

---

## 🚀 5. Release: The Finish Line

Once your feature is validated, it's time to ship.

1.  **Release:** Run `/kamiflow:dev:release` (or `kami release patch`). The AI will analyze your task history, bump the version, sync docs, update the Roadmap, and generate a unified commit.
2.  **Archive:** Run `/kamiflow:dev:archive` (or `kami archive [ID] --force`) to clean up your workspace and preserve the audit trail.

---

## 📍 Next Steps

- Read the [Overview](overview.md) for a deep dive into the architecture.
- Check the [Command Wiki](commands/README.md) for full reference.
- Run `kami doctor` if you encounter any system issues.


