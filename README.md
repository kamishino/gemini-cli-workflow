# 🌊 KamiFlow: The Indie Builder's Template for Gemini CLI

**<!-- KAMI_VERSION_START -->v2.15.2 (Modular Engine)<!-- KAMI_VERSION_END -->**

**KamiFlow** is a rigorous, opinionated "Operating System" for Indie Hackers using Gemini CLI. It transforms the AI from a generic chatbot into a disciplined **Technical Co-Founder**.

> **Philosophy:** "Aesthetics + Utility". Ship fast, break nothing important.

---

## 🚀 Key Features (Showcase)

<!-- KAMI_SHOWCASE_START -->

- 🎯 **Sniper Model:** 3-Step Fused Kernel (Idea -> Spec -> Build) with 3-Layer Locks.
- 💎 **CLI Manager:** Professional NPM utility for global KamiFlow management across projects.
- 🔄 **Universal Update:** Smart update system with mode detection (SUBMODULE/LINKED/STANDALONE).
- 🔧 **Self-Healing Engine:** Automatic detection and repair of broken portals and missing files.
- 🏥 **Smart Doctor:** Interactive health checks with auto-fix capabilities for missing dependencies.
- 🌍 **Global Engine:** 100% English core logic with configurable conversational language.
- 🧠 **Smart Session:** Logic-based requirement analysis and conflict blocking.
- 📦 **Injectable OS:** Git Submodule distribution with Gene Store architecture.
- 🤖 **Validator Loop:** Autonomous execution with self-healing (Execute -> Validate -> Heal).
- 🔍 **Global ID Scout:** Fast cached task ID tracking with reactive re-scan.
- 🔄 **Unified Sync:** Automatic updates for Context, Roadmap, and README Showcase.
- 📦 **Smart Archive:** Automated workspace cleanup with audit trail preservation.
- 🌉 **IDE Bridge:** Seamless context handoff to Windsurf/Cursor/VS Code.
<!-- KAMI_SHOWCASE_END -->

---

## 🚀 Quick Install (Cross-Platform)

Run this single command to install KamiFlow on Windows, MacOS, or Linux (Requires Node.js & Git):

```bash
npx -y github:kamishino/gemini-cli-workflow
```

*This will automatically clone the repo to `~/.kami-flow` and set up the `kami` global command.*

## 📦 Manual Installation (Local)

### Option 0: CLI Manager (Premium - Recommended)

**The absolute fastest way to install globally:**

```powershell
powershell -c "irmo https://raw.githubusercontent.com/kamishino/gemini-cli-workflow/main/install.ps1 | iex"
```

**What it does:**

- ✅ Checks for Node.js and Git
- ✅ Installs the `kami` CLI globally from GitHub
- ✅ No NPM Registry required (Avoids 404 errors)

**See:** [Full CLI Manager Guide](docs/GETTING_STARTED.md#-method-0-cli-manager-detailed)

---

### Option A: Integrate into Existing Project (Multi-Project)

Best for freelancers or studios managing multiple projects.

1.  **Add Submodule:**
    ```bash
    git submodule add https://github.com/kamishino/gemini-cli-workflow.git .kami-flow
    ```

2.  **Wake Up (Auto-Bootstrap):**
    ```bash
    /kamiflow:ops:wake
    ```
    *The system will automatically detect the submodule, create necessary portals (symlinks), and load the project context.*

...

## 🔄 Keeping KamiFlow Updated

KamiFlow includes a smart update system that automatically detects your integration mode and updates accordingly.

### Using the CLI

```bash
# From any KamiFlow project
kami update
```

**What it does:**

- 🔍 Detects integration mode (SUBMODULE/LINKED/STANDALONE)
- 🚀 Runs appropriate update command
- ⚠️ Guards against mode conflicts
- ✅ Verifies successful update

### Using Gemini CLI

```bash
# Inside Gemini CLI
/kamiflow:dev:upgrade
```

**Modes explained:**

- **SUBMODULE:** Runs `git submodule update --remote --merge`
- **LINKED:** Runs `npm install -g gemini-cli-kamiflow`
- **STANDALONE:** Provides manual update instructions

---

## 🛠 The Core Workflow (The Sniper Model)

### Step 1: /kamiflow:core:idea (The Critical Chef)

Diagnostic interview and synthesis into 3 refined solution approaches.

### Step 2: /kamiflow:core:spec (The Specification Architect)

Detailed specification using Schema-First design and Context Anchoring.

### Step 3: /kamiflow:core:build (The Build Architect)

Break down SPEC into executable tasks with Legacy Code awareness.

### Step 4: /kamiflow:core:bridge (The Bridge Builder)

Package context for IDE handoff or run `/kamiflow:dev:superlazy` for auto-execution.

...

## 🤝 IDE Integration (The Bridge)

KamiFlow is designed to work seamlessly alongside your IDE.

1.  **Plan in Terminal:** Use Gemini CLI for strategic planning.
2.  **Code in IDE:** Use `/kamiflow:core:bridge` to get the prompt and execute.
3.  **Sync Back:** After coding, run `/kamiflow:ops:sync` to update AI memory.
---

_Built with ❤️ for the 10x Indie Hacker._
