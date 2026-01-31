# 🆘 Troubleshooting Guide

Common issues and solutions for KamiFlow.

---

## 🏗️ Installation & Setup

### 🚫 Permission Denied

**Issue:** `EACCES` or `EPERM` when running `kami init` or `npm install -g`.
**Solution:**

1.  **For `kami init`:** Ensure you have write access to the project directory. The command now uses **Template Copy** (Standalone) by default, which avoids most symlink issues.
2.  **For Global Install:** On Linux/WSL, you may need `sudo npm install -g ...` if you are not using a version manager like **NVM**.
3.  **For NVM:** We highly recommend using NVM to manage Node.js versions without needing root permissions. Our `install.sh` now detects and helps you install NVM automatically.

### ❓ Command Not Found

**Issue:** `gemini` or `kami` is not recognized.
**Solution:** Ensure your global npm bin folder is in your system's PATH.

- Run `npm list -g` to see if the package is installed.
- Check path with `echo $env:PATH` (Windows) or `echo $PATH` (Unix).

---

## 🔄 Sync & Import Issues

### ❓ [ERROR] [ImportProcessor] Could not find child token

**Issue:** Metadata or "System Note" lines are confusing the automated sync markers.
**Solution:**

1.  Ensure you are using **Direct Imports** (`@path/to/file`) in `GEMINI.md` instead of the old `<!-- Imported from -->` markers.
2.  If you must use markers, do not place `@` commands inside them.

### ❓ [STARTUP] Phase is already active

**Issue:** Multiple sync/wake operations running simultaneously.
**Solution:** Run `/exit` and restart your Gemini session.

---

## 🛤️ Workflow Logic

### 🔗 Suffix Lineage Issues

**Issue:** Archivist fails to move backlog ideas.
**Solution:** Ensure your Task file ends with `_from-[IdeaID].md`.

- Example: `047-S1-IDEA-feature_from-B9D4.md`.
- This allows the `archive-flow` to automatically harvest the source idea.

### 🔗 Roadmap is "Shallow"

**Issue:** `ROADMAP.md` only shows completed tasks without achievements.
**Solution:** Use `/kamiflow:ops:sync` (v2.21+) or `/kamiflow:ops:roadmap`. These commands use the **Universal Roadmap Engine** to extract value from your task history.

---

## �️ v2.0 Specific Issues

### 🔄 Checkpoint Resume Fails

**Issue:** "Checkpoint corrupt or missing artifacts"

**Solution:**

1. Check `.kamiflow/checkpoints/` directory exists
2. Verify corresponding S1-IDEA file exists in `tasks/`
3. If checkpoint is corrupt, start fresh: `/kamiflow:core:idea`
4. Check checkpoint age - stale checkpoints (>7 days) may have context drift

### 🔄 Validation Loop Stuck

**Issue:** "Validation retry limit reached (3x)"

**Solution:**

1. Read validation report in command output
2. Fix errors manually in affected files
3. Re-run workflow from beginning
4. Or escalate: `/kamiflow:dev:revise [ID]` for clarification

### ⚠️ Phase 0.5 Reports "Hallucination Risk"

**Issue:** "File X referenced but not found"

**Solution:**

1. Create the missing file first, then re-run
2. Or update idea to reference existing files only
3. Verify file paths are correct (absolute vs relative)
4. Re-run `/kamiflow:core:idea` after fixes

### 📝 Reflection Prompt Skipped

**Issue:** No reflection template shown in Phase 4

**Solution:**

1. Check `.gemini/rules/flow-reflection.md` exists
2. Re-run `/kamiflow:ops:bootstrap` to restore protocols
3. Use `/kamiflow:dev:superlazy` (not legacy commands)
4. Verify you're using v2.0 commands, not older versions

### 🔧 Self-Healing Not Working

**Issue:** Errors not auto-fixing despite Level 1 classification

**Solution:**

1. Check error is truly Level 1 (syntax only)
2. Verify `.gemini/rules/error-recovery.md` exists
3. Some errors may be misclassified - review error type
4. Manual fix may be needed for complex syntax issues

### 📍 Wake Command Doesn't Detect Checkpoints

**Issue:** Active checkpoint exists but wake doesn't prompt resume

**Solution:**

1. Check checkpoint file naming: `[ID]-checkpoint-*.json`
2. Verify checkpoint is not marked as complete
3. Check for matching task file in `tasks/` or `archive/`
4. Manually resume: `/kamiflow:ops:resume [ID]`

### 🚨 Validation Blocks with "TOML Syntax Error"

**Issue:** Validation Phase A blocks despite correct TOML

**Solution:**

1. Check for unescaped backslashes in Windows paths
2. Verify string escaping (use `""` for paths with spaces)
3. Look for missing closing brackets `]` or `}`
4. Use TOML validator online to verify syntax
5. Self-healing should fix most common cases automatically

---

## �💬 Still having issues?

Run `kami doctor` to perform a full system health check. If the problem persists, please report a bug.
