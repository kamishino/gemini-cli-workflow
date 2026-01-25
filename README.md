# 🌊 KamiFlow: The Indie Builder's Template for Gemini CLI

**<!-- KAMI_VERSION_START -->v2.9 (Interactive Sculptor)<!-- KAMI_VERSION_END -->**

**KamiFlow** is a rigorous, opinionated "Operating System" for Indie Hackers using Gemini CLI. It transforms the AI from a generic chatbot into a disciplined **Technical Co-Founder**.

> **Philosophy:** "Aesthetics + Utility". Ship fast, break nothing important.

---

## 🚀 Key Features (Showcase)

<!-- KAMI_SHOWCASE_START -->

- 🎯 **Sniper Model:** 3-Step Fused Kernel (Idea -> Spec -> Build) with 3-Layer Locks.
- 🗿 **Interactive Sculptor:** Self-relocating bootstrapper with clean standalone fallback.
- ⚡ **One-Click Setup:** Smart Windows bootstrapper with automatic portal linking and fallback.
- 🌍 **Global Engine:** 100% English core logic with configurable conversational language.
- 🧠 **Smart Session:** Logic-based requirement analysis and conflict blocking.
- 📦 **Injectable OS:** Git Submodule distribution with automatic Symlink setup.
- 🤖 **Validator Loop:** Autonomous execution with self-healing (Execute -> Validate -> Heal).
- 🔍 **Global ID Scout:** Fast cached task ID tracking with reactive re-scan.
- 🔄 **Unified Sync:** Automatic updates for Context, Roadmap, and README Showcase.
- 📦 **Smart Archive:** Automated workspace cleanup with audit trail preservation.
- 🌉 **IDE Bridge:** Seamless context handoff to Windsurf/Cursor/VS Code.
<!-- KAMI_SHOWCASE_END -->

---

## 🚀 Quick Start (Choose Your Path)

### Option A: One-Click Installer (Windows Only)

**The fastest way to get started on Windows:**

```powershell
git submodule add https://github.com/kamishino/gemini-cli-workflow .kami-flow; .\.kami-flow\start-kamiflow.bat
```

**What it does:**

- ✅ Auto-relocates bootstrapper to project root
- ✅ Checks for Gemini CLI and Git
- ✅ Creates portal network (symlinks or physical copy)
- ✅ Choice between Synchronized Submodule or Clean Standalone copy
- ✅ Launches Gemini CLI automatically

**See:** [Full One-Click Guide](docs/GETTING_STARTED.md#-method-a-one-click-installer-detailed)

---

### Option B: Integrate into Existing Project (Multi-Project)

Use KamiFlow as a **Git Submodule** for auto-updates and clean separation:

```bash
# Add KamiFlow as a submodule
git submodule add https://github.com/YOUR_USERNAME/gemini-cli-workflow.git .kami-flow
git submodule update --init --recursive

# Start Gemini CLI
gemini chat

# Wake and bootstrap
/kamiflow:wake
/kamiflow:bootstrap
/kamiflow:wake
```

**Result:** Portal network activated. KamiFlow operates at root via symbolic links.

---

### Option C: Use as Template (Clone)

Clone KamiFlow directly for a standalone copy:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/gemini-cli-workflow.git my-project
cd my-project

# Start Gemini CLI
gemini chat
/kamiflow:wake
```

**Result:** Full KamiFlow copy ready to customize.

---

### 📚 Need More Help?

- **[Full Integration Guide](docs/GETTING_STARTED.md)** - Detailed step-by-step instructions
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Solutions for common setup issues (Windows Symlinks, etc.)

---

## 🛠 The Core Workflow (The Sniper Model)

### Step 1: /kamiflow:idea (The Critical Chef)

Diagnostic interview and synthesis into 3 refined solution approaches.

### Step 2: /kamiflow:spec (The Specification Architect)

Detailed specification using Schema-First design and Context Anchoring.

### Step 3: /kamiflow:build (The Build Architect)

Break down SPEC into executable tasks with Legacy Code awareness.

### Step 4: /kamiflow:bridge (The Bridge Builder)

Package context for IDE handoff or run `/superlazy` for auto-execution.

---

## 🧠 The "Brain" Structure

- **`.gemini/rules/`**: The Constitution.
  - `manifesto.md`: Non-negotiable mindset (e.g., "No files > 300 lines").
  - `validator-loop.md`: Self-healing protocols.
  - `id-protocol.md`: Global ID tracking rules.
- **`.gemini/commands/kamiflow/`**:
  - `lazy.toml` & `superlazy.toml`: Auto-pilot modes for high-speed building.

---

## 🤝 IDE Integration (The Bridge)

KamiFlow is designed to work seamlessly alongside your IDE.

1.  **Plan in Terminal:** Use Gemini CLI for strategic planning.
2.  **Code in IDE:** Use `/kamiflow:bridge` to get the prompt and execute.
3.  **Sync Back:** After coding, run `/kamiflow:sync` to update AI memory.

---

_Built with ❤️ for the 10x Indie Hacker._
