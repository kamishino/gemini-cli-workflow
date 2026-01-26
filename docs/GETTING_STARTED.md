# 🚀 Getting Started with KamiFlow

**Welcome to KamiFlow v2.10** - The rigorous, opinionated "Operating System" for Indie Hackers using Gemini CLI.

This guide will walk you through four integration methods to get KamiFlow running in your project.

---

## 🎯 Choose Your Integration Method

### Method 0: CLI Manager (Premium - Recommended)

**The absolute fastest way to get started:**

```powershell
# Run this one-liner in your terminal (PowerShell)
powershell -c "irmo https://raw.githubusercontent.com/kamishino/gemini-cli-workflow/main/install.ps1 | iex"
```

**What this does:**
1. Verifies you have Node.js and Git installed.
2. Automatically runs `npm install -g` using the direct GitHub URL.
3. Performs a handshake by running `kami --version`.

**Setup:**
1. Open your project directory.
2. Run `kami init`.
3. Follow the interactive prompts.

**See detailed walkthrough:** [Method 0 Guide](#-method-0-cli-manager-detailed)

---

### Method A: One-Click Installer (Windows Only)

**Best for:** Windows users who want zero-friction setup with automatic environment detection.

**Pros:**

- ✅ Automatic dependency checks (Gemini CLI, Git)
- ✅ Smart Git repository initialization
- ✅ Automatic symlink creation with fallback
- ✅ Handles permissions gracefully (Embed Mode)
- ✅ No manual commands needed

**Cons:**

- ⚠️ Windows-only (Batch script)
- ⚠️ Embed Mode requires manual updates

**Setup:**

1. Download or clone KamiFlow
2. Double-click `start-kamiflow.bat`
3. Follow the interactive prompts
4. Done! 🎉

**What it does:**

- Checks for Gemini CLI and Git (provides install links if missing)
- Offers to initialize Git repository if needed
- Creates portal network via symlinks (or physical copy if permissions fail)
- Launches Gemini CLI automatically

**See detailed walkthrough:** [Method A Guide](#-method-a-one-click-installer-detailed)

**Note:** For professional use, Method 0 (CLI Manager) is recommended over this batch script.

---

### Method B: Git Submodule (Recommended for Multi-Project)

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

### Method C: Git Clone (Template Mode)

**Best for:** Quick-starters who want a standalone copy to customize freely.

**Pros:**

- ✅ Simple setup (just clone and go)
- ✅ Full control over all files
- ✅ No submodule complexity

**Cons:**

- ⚠️ Manual updates required
- ⚠️ File duplication if used across multiple projects

---

## 💎 Method 0: CLI Manager (Detailed)

### Prerequisites

**Required:**

- Node.js 16+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Internet connection

**Optional but Recommended:**

- Git
- Gemini CLI (CLI Manager can guide installation)

---

### Step 1: Install CLI Manager Globally

**The Zero-Friction One-Liner (Recommended):**

```powershell
# Run this in your terminal (PowerShell)
powershell -c "irmo https://raw.githubusercontent.com/kamishino/gemini-cli-workflow/main/install.ps1 | iex"
```

**Alternative: Local Installation (Development)**

```bash
# Clone KamiFlow repository
git clone https://github.com/kamishino/gemini-cli-workflow.git
cd gemini-cli-workflow

# Install dependencies
npm install

# Link globally
npm link
```

**Verify Installation:**

```bash
kami --version
# or
gemini-cli-kamiflow --version
```

---

### Step 2: Check System Health

Before initializing projects, verify your environment:

```bash
kami doctor
```

**Expected Output:**

```
🏽 KamiFlow System Doctor

Node.js: v18.17.0
  ✓ Node.js version is compatible

Gemini CLI: installed
  ✓ Gemini CLI found

Git: git version 2.42.0
  ✓ Git found

Symlink Support: enabled
  ✓ Can create symbolic links

Current Directory: C:\Users\...
  ⚠️  No KamiFlow portals found
  → Run: gemini-cli-kamiflow init

✓ All systems operational!
```

**If issues detected:**

- Missing dependencies show install links
- Symlink issues suggest Developer Mode or STANDALONE mode
- All checks must pass for optimal experience

---

### Step 3: Initialize a Project

Navigate to your project directory and run:

```bash
cd your-project
kami init
```

**Interactive Setup:**

```
? Project name: my-awesome-app
? Select integration mode:
  > 🔗 Linked (Recommended - Auto-updates from global core)
    📦 Standalone (Clean copy - Manual updates)
```

**What happens:**

1. **Linked Mode:**
   - Creates symlinks: `.gemini/`, `.windsurf/`, `docs/protocols/`, `docs/overview.md`
   - Links point to global installation
   - Updates propagate automatically

2. **Standalone Mode:**
   - Physical file copies
   - Complete independence
   - Manual updates required

**Files Created:**

- `GEMINI.md` (proxy or full copy)
- `PROJECT_CONTEXT.md` (from template)
- `docs/roadmap.md` (from template)
- `.geminiignore` (smart ignore rules)

---

### Step 4: Start Working

After initialization:

```bash
gemini chat
```

Then in Gemini CLI:

```
/kamiflow:ops:wake
/kamiflow:idea "Your first feature"
```

---

### Advanced Usage

**Initialize with Options:**

```bash
# Specify integration mode
kami init --mode standalone

# Skip interactive prompts
kami init --skip-interview

# Initialize in different directory
kami init ../other-project
```

**Get Core Information:**

```bash
kami info
```

**Output:**

```
📦 KamiFlow Core Information:

Version: 2.10.0
Location: C:\Users\...\AppData\Roaming\npm\node_modules\gemini-cli-kamiflow
Bin: C:\Users\...\AppData\Roaming\npm\kami.js
```

---

### Troubleshooting

**Issue: Command not found**

```bash
# Verify global installation
npm list -g gemini-cli-kamiflow

# Check PATH includes npm global bin
echo %PATH%  # Windows
echo $PATH   # Unix

# Reinstall if needed
npm uninstall -g gemini-cli-kamiflow
npm install -g gemini-cli-kamiflow
```

**Issue: Symlink permission denied**

- Run `kami doctor` to check symlink support
- Enable Developer Mode (Windows Settings → For Developers)
- Or use STANDALONE mode: `kami init --mode standalone`

**Issue: Missing dependencies**

- Run `kami doctor` for detailed diagnostics
- Install missing tools (Gemini CLI, Git)
- Re-run `kami init` after fixes

---

## 🚀 Method A: One-Click Installer (Detailed)

### Prerequisites

**Required:**

- Windows OS
- Internet connection (for dependency downloads if needed)

**Optional but Recommended:**

- Administrator privileges OR Developer Mode enabled
- Git for Windows
- Gemini CLI

**Note:** The script will guide you through installing missing dependencies.

---

### Step 1: Get KamiFlow

**Option 1: The One-Line Integration (Fastest)**

Copy and paste this into your terminal (PowerShell) to add KamiFlow and start the setup automatically:

```powershell
git submodule add https://github.com/kamishino/gemini-cli-workflow .kami-flow; .\.kami-flow\start-kamiflow.bat
```

**Option 2: Download ZIP**

```bash
# Download from GitHub and extract
# Navigate to the extracted folder
```

**Option 3: Git Clone**

```bash
git clone https://github.com/kamishino/gemini-cli-workflow.git
cd gemini-cli-workflow
```

---

### Step 2: Run the Installer

Double-click `start-kamiflow.bat` or run from terminal:

```cmd
.\start-kamiflow.bat
```

---

### Step 3: Follow Interactive Setup

The script will guide you through:

**1. Environment Check**

```
[✓] Gemini CLI: Found
[✓] Git: Found
```

If missing, you'll see install instructions with direct links.

**2. Git Repository Setup**

```
[?] Initialize Git repository? (Y/N):
```

Choose `Y` if this is a new project.

**3. Submodule Setup (Optional)**

```
[?] Add KamiFlow as submodule? (Y/N):
```

- Choose `Y` for auto-updates (multi-project recommended)
- Choose `N` if using as standalone template

**4. Portal Network Creation**

The script attempts to create symlinks:

**Success Path:**

```
[✓] Created .gemini/ portal
[✓] Created .windsurf/ portal
[✓] Created docs/protocols/ portal
[✓] Created docs/overview.md portal
```

**Permission Denied Path:**

```
[✗] Symlink creation failed (Permission Denied)
[?] Switch to Embed Mode (Copying files physically)? (Y/N):
```

Choose `Y` for Embed Mode (physical copy, no admin needed).

---

### Step 4: Start Working

After setup, Gemini CLI launches automatically. Run:

```
/kamiflow:ops:wake
```

Then start building:

```
/kamiflow:idea "Your first feature"
```

---

### Troubleshooting: Symlink Permissions

If you see permission errors:

**Option 1: Enable Developer Mode (Permanent Fix)**

1. Open Windows Settings
2. Go to: Update & Security → For Developers
3. Enable "Developer Mode"
4. Restart terminal and run script again

**Option 2: Run as Administrator (One-Time Fix)**

1. Right-click Command Prompt or PowerShell
2. Select "Run as Administrator"
3. Navigate to project folder
4. Run `.\start-kamiflow.bat` again

**Option 3: Use Embed Mode (No Permissions Needed)**

- Choose `Y` when prompted for Embed Mode
- Files are copied physically (no symlinks)
- Trade-off: Manual updates required

---

## 📦 Method B: Git Submodule Integration

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
/kamiflow:ops:wake
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

/kamiflow:ops:bootstrap

```

Then run `/kamiflow:ops:wake` again to load context.
```

---

### Step 3: Bootstrap the Portal Network

The AI detected the submodule but needs to activate it. Run:

```
/kamiflow:ops:bootstrap
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

1. Run `/kamiflow:ops:wake` to load context
2. Run `/kamiflow:idea "Your first feature"` to begin
```

---

### Step 4: Reload Context

2.  **Wake Up (Auto-Bootstrap):**
    ```bash
    /kamiflow:ops:wake
    ```
    *The system will automatically detect the submodule, create necessary portals (symlinks), and load the project context.*

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

## 🎨 Method C: Git Clone (Template Mode)

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
/kamiflow:ops:wake
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
/kamiflow:core:idea "Your feature description"
```

### Step 2: Create Specification

```
/kamiflow:core:spec tasks/001-S1-IDEA-your-feature.md
```

### Step 3: Generate Build Plan

```
/kamiflow:core:build tasks/001-S2-SPEC-your-feature.md
```

### Step 4: Execute in IDE

```
/kamiflow:core:bridge tasks/001-S3-BUILD-your-feature.md
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
