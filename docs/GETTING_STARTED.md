# 🚀 Getting Started with KamiFlow

**Welcome to KamiFlow v2.7** - The rigorous, opinionated "Operating System" for Indie Hackers using Gemini CLI.

This guide will walk you through two integration methods to get KamiFlow running in your project.

---

## 🎯 Choose Your Integration Method

### Method A: Git Submodule (Recommended)

**Best for:** Developers who want auto-updates and single-source-of-truth core logic.

**Pros:**

- ✅ Automatic updates via `git submodule update`
- ✅ Zero file duplication
- ✅ Clean separation between core logic and project-specific context
- ✅ Multiple projects can share the same KamiFlow core

**Cons:**

- ⚠️ Requires understanding of Git submodules
- ⚠️ Needs symbolic link support (Windows Developer Mode or Admin)

---

### Method B: Git Clone (Template Mode)

**Best for:** Quick-starters who want a standalone copy to customize freely.

**Pros:**

- ✅ Simple setup (just clone and go)
- ✅ Full control over all files
- ✅ No submodule complexity

**Cons:**

- ⚠️ Manual updates required
- ⚠️ File duplication if used across multiple projects

---

## 📦 Method A: Git Submodule Integration

### Step 1: Add KamiFlow as a Submodule

Navigate to your project root and run:

```bash
git submodule add https://github.com/YOUR_USERNAME/gemini-cli-workflow.git .kami-flow
git submodule update --init --recursive
```

**What this does:**

- Downloads KamiFlow core into `.kami-flow/` directory
- Keeps it as a separate Git repository
- Your main project stays clean

**Verification:**

```bash
ls .kami-flow
# Should show: .gemini/, .windsurf/, docs/, GEMINI.md, etc.
```

---

### Step 2: Wake Up the AI

Start Gemini CLI and let the AI detect the submodule:

```bash
gemini chat
```

Then run:

```
/kamiflow:wake
```

**Expected Output:**

```markdown
## 🌊 KamiFlow Submodule Detected

KamiFlow submodule detected in `.kami-flow/` directory.

**Current Status:**

- ✅ Submodule: `.kami-flow/` found
- ❌ Portal Network: Not configured
- ❌ Proxy Files: Not initialized

**To activate KamiFlow, run:**
```

/kamiflow:bootstrap

```

Then run `/kamiflow:wake` again to load context.
```

---

### Step 3: Bootstrap the Portal Network

The AI detected the submodule but needs to activate it. Run:

```
/kamiflow:bootstrap
```

**What this does:**

- Creates symbolic links (portals) from `.kami-flow/` to your project root
- Initializes proxy files (`GEMINI.md`, `PROJECT_CONTEXT.md`)
- Configures `.geminiignore` to prevent "double vision"

**Portals Created:**

```
.gemini/         → .kami-flow/.gemini/
.windsurf/       → .kami-flow/.windsurf/
docs/protocols/  → .kami-flow/docs/protocols/
docs/overview.md → .kami-flow/docs/overview.md
```

**Expected Output:**

```markdown
## 🔗 Portal Network Activated

**Success!** KamiFlow has been activated for this project.

### 📊 Bootstrap Summary

**Portal Network (Linked to Core):**

- ✅ `.gemini/` → `.kami-flow/.gemini/`
- ✅ `.windsurf/` → `.kami-flow/.windsurf/`
- ✅ `docs/protocols/` → `.kami-flow/docs/protocols/`
- ✅ `docs/overview.md` → `.kami-flow/docs/overview.md`

**Project-Specific Files (Seeded from Templates):**

- ✅ `GEMINI.md` (proxy with import directive)
- ✅ `PROJECT_CONTEXT.md` (project context)
- ✅ `docs/roadmap.md` (project roadmap)

**Next Steps:**

1. Run `/kamiflow:wake` to load context
2. Run `/kamiflow:idea "Your first feature"` to begin
```

---

### Step 4: Reload Context

Now that the portal network is active, reload the AI's context:

```
/kamiflow:wake
```

**Expected Output:**

```markdown
## 🌅 Project Context Reloaded

**Time:** [Current timestamp]
**Session Status:** ✅ Awake & Ready

**MAX ID Found:** 000
**Next Task ID:** 001
```

**✅ Setup Complete!** You're ready to use KamiFlow.

---

## 🎨 Method B: Git Clone (Template Mode)

### Step 1: Clone the Repository

Clone KamiFlow directly into your project directory:

```bash
# Option 1: Clone into current directory
git clone https://github.com/YOUR_USERNAME/gemini-cli-workflow.git .

# Option 2: Clone into a new directory
git clone https://github.com/YOUR_USERNAME/gemini-cli-workflow.git my-project
cd my-project
```

---

### Step 2: Detach from Original Git History (Optional)

If you want to use this as a fresh template:

```bash
# Remove original Git history
rm -rf .git

# Initialize your own Git repo
git init
git add -A
git commit -m "chore: initialize project from KamiFlow template"
```

---

### Step 3: Wake Up the AI

Start Gemini CLI:

```bash
gemini chat
```

Run:

```
/kamiflow:wake
```

**Expected Output:**

```markdown
## 🌅 Project Context Reloaded

**Session Status:** ✅ Awake & Ready
```

**✅ Setup Complete!** You're ready to use KamiFlow.

---

## 🧪 Verify Your Setup

Run the following checks to ensure everything is working:

### Check 1: Verify Portal Network (Submodule Only)

```bash
# Windows PowerShell
Get-Item .gemini | Select-Object LinkType, Target

# Expected Output:
# LinkType        Target
# --------        ------
# SymbolicLink    {.kami-flow\.gemini}
```

---

### Check 2: Verify Core Files

```bash
ls .gemini/commands/kamiflow
# Should show: idea.toml, spec.toml, build.toml, etc.
```

---

### Check 3: Test a Command

In Gemini CLI, run:

```
/kamiflow:idea "Test feature"
```

**Expected Behavior:**

- AI asks diagnostic questions
- AI generates 3 refined options
- AI waits for your choice before creating the S1-IDEA file

---

## 🔄 Updating KamiFlow

### For Submodule Users

To pull the latest KamiFlow updates:

```bash
cd .kami-flow
git pull origin main
cd ..
git add .kami-flow
git commit -m "chore: update KamiFlow core"
```

**Effect:** All symlinked files automatically update. Your `PROJECT_CONTEXT.md` and `tasks/` remain untouched.

---

### For Clone Users

Manually merge updates from the original repository or re-clone into a new project.

---

## 🎯 Next Steps

Now that KamiFlow is set up, try the core workflow:

### Step 1: Generate an Idea

```
/kamiflow:idea "Your feature description"
```

### Step 2: Create Specification

```
/kamiflow:spec tasks/001-S1-IDEA-your-feature.md
```

### Step 3: Generate Build Plan

```
/kamiflow:build tasks/001-S2-SPEC-your-feature.md
```

### Step 4: Execute in IDE

```
/kamiflow:bridge tasks/001-S3-BUILD-your-feature.md
```

---

## ⚠️ Troubleshooting

Encountering issues? Check the **[Troubleshooting Guide](TROUBLESHOOTING.md)** for solutions to common setup problems:

- Windows "Access Denied" for symbolic links
- Git submodule errors
- Import path issues

---

## 📚 Learn More

- **[KamiFlow Overview](overview.md)** - System architecture and philosophy
- **[Bootstrap Protocol](../.gemini/rules/bootstrap-protocol.md)** - Technical details on the portal network
- **[Manifesto](../.gemini/rules/manifesto.md)** - Core values and non-negotiables

---

**Built with ❤️ for the 10x Indie Hacker.**
