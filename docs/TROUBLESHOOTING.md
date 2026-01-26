# 🔧 Troubleshooting Guide

This guide addresses common issues encountered during KamiFlow setup and operation.

---

## 🚨 Windows Symbolic Link Issues

### Issue: "Access Denied" or "A required privilege is not held by the client"

**Error Message:**

```
New-Item: A required privilege is not held by the client.
```

This occurs when running `/kamiflow:ops:bootstrap` without proper permissions.

---

### Solution 1: Run as Administrator (Quick Fix)

**Steps:**

1. Close your current terminal
2. Right-click on **PowerShell** or **Windows Terminal**
3. Select **"Run as Administrator"**
4. Navigate back to your project directory
5. Start Gemini CLI again:
   ```bash
   gemini chat
   ```
6. Run:
   ```
   /kamiflow:ops:bootstrap
   ```

**Verification:**

```powershell
Get-Item .gemini | Select-Object LinkType, Target
# Should show: SymbolicLink    {.kami-flow\.gemini}
```

---

### Solution 2: Enable Developer Mode (Permanent Fix)

**Why this is better:**

- No need to run as Administrator every time
- Permanently grants symbolic link creation permission to your user account

**Steps:**

1. Open **Settings** (Windows Key + I)
2. Navigate to **Update & Security**
3. Click **For developers** (left sidebar)
4. Toggle **Developer Mode** to **ON**
5. Restart your terminal
6. Run `/kamiflow:ops:bootstrap` again (no admin needed)

**Windows 11 Path:**
`Settings > Privacy & Security > For developers > Developer Mode`

---

### Solution 3: Enable via Group Policy (Enterprise/Pro)

For users on Windows Pro/Enterprise who can't use Developer Mode:

1. Press **Windows Key + R**
2. Type: `gpedit.msc` and press Enter
3. Navigate to:
   ```
   Computer Configuration
   → Windows Settings
   → Security Settings
   → Local Policies
   → User Rights Assignment
   ```
4. Double-click **"Create symbolic links"**
5. Click **"Add User or Group"**
6. Add your username
7. Click **OK** and restart your computer

---

## 🔗 Git Submodule Issues

### Issue: Submodule appears empty after clone

**Symptom:**

```bash
ls .kami-flow
# Shows nothing or only .git folder
```

**Solution:**
Initialize and update the submodule:

```bash
git submodule update --init --recursive
```

---

### Issue: "fatal: No url found for submodule path"

**Cause:** The submodule was added but not committed.

**Solution:**

```bash
git add .gitmodules .kami-flow
git commit -m "chore: add KamiFlow submodule"
```

---

### Issue: Submodule points to wrong commit

**Symptom:** Outdated files in `.kami-flow/`

**Solution:**
Update the submodule to latest:

```bash
cd .kami-flow
git checkout main
git pull origin main
cd ..
git add .kami-flow
git commit -m "chore: update KamiFlow to latest"
```

---

## 📁 File Structure Issues

### Issue: AI can't find `.gemini/commands/`

**Symptoms:**

- `/kamiflow:idea` command not recognized
- Gemini CLI says "No such command"

**Possible Causes:**

1. Symlink not created (Submodule users)
2. `.gemini/` folder missing (Clone users)

**Solution for Submodule Users:**

```bash
# Check if symlink exists
ls -la .gemini

# If missing, run bootstrap again
gemini chat
/kamiflow:ops:bootstrap
```

**Solution for Clone Users:**

```bash
# Verify .gemini folder exists
ls .gemini/commands/kamiflow

# If missing, you may have cloned incorrectly
# Re-clone the repository
```

---

### Issue: "Double Vision" - AI reads rules twice

**Symptom:** AI logs show duplicate rule loading or conflicting instructions.

**Cause:** `.geminiignore` doesn't exclude `.kami-flow/`

**Solution:**
Add this to `.geminiignore` at project root:

```
# Ignore submodule (accessed via symlinks)
.kami-flow/
```

**Verification:**

```bash
cat .geminiignore | grep "kami-flow"
# Should output: .kami-flow/
```

---

## 🧠 AI Context Issues

### Issue: AI doesn't remember project context

**Symptom:** AI asks basic questions every session.

**Cause:** `PROJECT_CONTEXT.md` is empty or outdated.

**Solution:**
After completing work, always run:

```
/kamiflow:ops:sync```

This updates `PROJECT_CONTEXT.md` with the latest state.

**Manual Fix:**
Edit `PROJECT_CONTEXT.md` directly to add:

- Project goal
- Current phase
- Last completed action
- Tech stack

---

### Issue: AI uses wrong conversational language

**Symptom:** AI speaks English when you want Vietnamese (or vice versa).

**Cause:** `GEMINI.md` has incorrect language token.

**Solution:**
Edit `GEMINI.md` line 14:

```markdown
# Change this line:

- **Conversational Language:** Vietnamese

# Or:

- **Conversational Language:** English
```

Restart Gemini CLI for changes to take effect.

---

## 🔢 ID Tracking Issues

### Issue: AI generates duplicate task IDs

**Symptom:**

```
AI creates: 005-S1-IDEA-feature.md
But you already have: 005-S2-SPEC-other.md
```

**Cause:** Cached ID is stale.

**Solution:**
Trigger a reactive scan by telling the AI (in your conversational language):

```
"This ID is wrong"
"Check the ID again"
"Rescan the archive"
```

The AI will re-scan `tasks/` and `archive/` to find the correct MAX_ID.

---

### Issue: AI skips IDs (e.g., jumps from 003 to 007)

**This is normal behavior.**

**Explanation:** The Global ID Protocol scans for the MAX ID, not sequential IDs. Gaps are allowed and intentional (e.g., if you deleted tasks or archived them with different IDs).

**No action needed.**

---

## 🔄 Sync Issues

### Issue: `/kamiflow:sync` fails

**Symptom:** Command doesn't update `PROJECT_CONTEXT.md` or handoff logs.

**Possible Causes:**

1. No handoff log exists in `docs/handoff_logs/`
2. Gemini CLI lost session memory

**Solution:**

1. Check if handoff log exists:
   ```bash
   ls docs/handoff_logs
   ```
2. If missing, manually create a summary
3. Re-run `/kamiflow:sync`

---

## 💻 PowerShell Execution Policy

### Issue: "Scripts are disabled on this system"

**Error Message:**

```
File cannot be loaded because running scripts is disabled on this system.
```

**Cause:** PowerShell execution policy is too restrictive.

**Solution:**
Run PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Verification:**

```powershell
Get-ExecutionPolicy
# Should output: RemoteSigned
```

---

## 🎨 IDE Integration Issues

### Issue: Windsurf/Cursor doesn't recognize `/kamiflow-execute`

**Cause:** `.windsurf/` symlink or folder missing.

**Solution for Submodule Users:**
Ensure bootstrap created the symlink:

```bash
ls -la .windsurf
# Should show: SymbolicLink → .kami-flow\.windsurf
```

If missing, run:

```
/kamiflow:ops:bootstrap
```

**Solution for Clone Users:**
Verify `.windsurf/` folder exists:

```bash
ls .windsurf/workflows
# Should show: kamiflow-execute.md
```

---

## 📝 Command Not Working

/kamiflow:core:idea

**Possible Causes:**

1. Gemini CLI not started in project directory
2. `GEMINI.md` not at project root
3. `.gemini/commands/kamiflow/` not accessible

**Solution:**

1. Verify you're in the correct directory:
   ```bash
   pwd
   # Should be your project root
   ```
2. Check `GEMINI.md` exists:
   ```bash
   ls GEMINI.md
   ```
3. Restart Gemini CLI:
   ```bash
   gemini chat
   /kamiflow:ops:wake
   ```

---

## 🆘 Still Having Issues?

### Debug Checklist

Run through this checklist:

- [ ] Confirmed `.kami-flow/` exists (Submodule) or `.gemini/` exists (Clone)
- [ ] Verified symbolic links are created (Windows: `Get-Item .gemini`)
- [ ] Checked `GEMINI.md` exists at project root
- [ ] Ran `/kamiflow:ops:wake` successfully
- [ ] Developer Mode is enabled (Windows Submodule users)
- [ ] `.geminiignore` includes `.kami-flow/`
- [ ] Restarted Gemini CLI after changes

---

### Get Help

If none of the above solutions work:

1. **Check Bootstrap Protocol:** Read the technical details at `.gemini/rules/bootstrap-protocol.md`
2. **Review Logs:** Check `docs/handoff_logs/` for error messages from previous sessions
3. **Start Fresh:** Remove `.gemini/`, `.windsurf/`, `GEMINI.md` and re-run `/kamiflow:ops:bootstrap`

---

## 🔙 Back to Setup

Return to the **[Getting Started Guide](GETTING_STARTED.md)** if you need to revisit the integration steps.

---

**Built with ❤️ for the 10x Indie Hacker.**
