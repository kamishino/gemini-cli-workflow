# 🔧 Troubleshooting Guide

This guide addresses common issues encountered during KamiFlow setup and operation.

---

## 🚨 Command & Syntax Errors

### Issue: "Command Not Found" or "Invalid Syntax"
Since v2.15, KamiFlow uses a **Modular Structure**. If you try to run `/kamiflow:idea`, it will fail.

**Solution:**
Ensure you use the full path with the `:` separator:
- ✅ `/kamiflow:core:idea`
- ✅ `/kamiflow:ops:sync`
- ❌ `/kamiflow:core/idea` (Don't use slash)
- ❌ `/kamiflow:idea` (Missing folder)

### Issue: AI is "Hallucinating" or Forgetting Rules
This usually happens when starting a new session without loading context.

**Solution:**
Always run the recovery command first:
```bash
/kamiflow:ops:wake
```

---

## 🔗 Windows Symbolic Link Issues

### Issue: "A required privilege is not held by the client"
Windows requires special permissions to create the "Portal Network" (Symlinks).

**Solution 1: Enable Developer Mode (Recommended)**
1. Open **Settings** > **Privacy & Security** > **For developers**.
2. Toggle **Developer Mode** to **ON**.
3. Restart your terminal and run `kami init` or `/kamiflow:ops:bootstrap`.

**Solution 2: Run as Administrator**
Right-click your terminal (PowerShell/CMD) and select **"Run as Administrator"** before running setup commands.

**Solution 3: Use Standalone/Copy Mode**
If you cannot use symlinks, choose "Standalone" during `kami init` to copy files physically.

---

## 🧠 AI Context & Memory

### Issue: Duplicate Task IDs
If the AI suggests `005` but you already have `005` in your archive.

**Solution:**
Trigger a **Reactive Scan** by saying:
> "ID sai rồi, scan lại archive đi" (or "ID is wrong, rescan archive")

The AI will re-scan the entire history and update its cache.

### Issue: `PROJECT_CONTEXT.md` is out of sync
If the AI doesn't remember what you just did in the IDE.

**Solution:**
Always run the sync command after an IDE session:
```bash
/kamiflow:ops:sync
```

---

## 💻 PowerShell Execution Policy

### Issue: "Scripts are disabled on this system"
**Solution:**
Run this in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🆘 Still Having Issues?

### Debug Checklist
- [ ] Confirmed `.gemini/commands/kamiflow` is accessible (Run `ls .gemini`).
- [ ] Ran `/kamiflow:ops:wake` successfully.
- [ ] Using the `:` separator for all commands.
- [ ] Version is up to date (Run `kami update`).

---

**Built with ❤️ for the 10x Indie Hacker.**