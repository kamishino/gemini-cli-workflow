# ≡ƒåÿ Troubleshooting Guide

Common issues and solutions for KamiFlow.

---

## ≡ƒÅù∩╕Å Installation & Setup

### Γ¥î Permission Denied
**Issue:** `EACCES` or `EPERM` when running `kami init` or `npm install -g`.
**Solution:** 
1.  **For `kami init`:** Ensure you have write access to the project directory. The command now uses **Template Copy** (Standalone) by default, which avoids most symlink issues.
2.  **For Global Install:** On Linux/WSL, you may need `sudo npm install -g ...` if you are not using a version manager like **NVM**.
3.  **For NVM:** We highly recommend using NVM to manage Node.js versions without needing root permissions. Our `install.sh` now detects and helps you install NVM automatically.

### Γ£û∩╕Å Command Not Found
**Issue:** `gemini` or `kami` is not recognized.
**Solution:** Ensure your global npm bin folder is in your system's PATH. 
- Run `npm list -g` to see if the package is installed.
- Check path with `echo $env:PATH` (Windows) or `echo $PATH` (Unix).

---

## ≡ƒöä Sync & Import Issues

### Γ£û∩╕Å [ERROR] [ImportProcessor] Could not find child token
**Issue:** Metadata or "System Note" lines are confusing the automated sync markers.
**Solution:**
1.  Ensure you are using **Direct Imports** (`@path/to/file`) in `GEMINI.md` instead of the old `<!-- Imported from -->` markers.
2.  If you must use markers, do not place `@` commands inside them.

### Γ£û∩╕Å [STARTUP] Phase is already active
**Issue:** Multiple sync/wake operations running simultaneously.
**Solution:** Run `/exit` and restart your Gemini session.

---

## ≡ƒö¿ Workflow Logic

### Γ¥ô Suffix Lineage Issues
**Issue:** Archivist fails to move backlog ideas.
**Solution:** Ensure your Task file ends with `_from-[IdeaID].md`. 
- Example: `047-S1-IDEA-feature_from-B9D4.md`.
- This allows the `archive-flow` to automatically harvest the source idea.

### Γ¥ô Roadmap is "Shallow"
**Issue:** `ROADMAP.md` only shows completed tasks without achievements.
**Solution:** Use `/kamiflow:ops:sync` (v2.21+) or `/kamiflow:ops:roadmap`. These commands use the **Universal Roadmap Engine** to extract value from your task history.

---

## Γ£à Still having issues?
Run `kami doctor` to perform a full system health check. If the problem persists, please report a bug.
