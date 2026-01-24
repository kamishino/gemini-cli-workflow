# 🔗 The Bootstrap Protocol: Submodule-Based Distribution

> **Purpose:** Enable KamiFlow to operate as an injectable "Operating System" via Git Submodules, maintaining project-agnostic reusability while providing full context to Gemini CLI and IDEs.

---

## 1. 🎯 Core Principle

**"The Portal Network"** - KamiFlow lives in `.kami-flow/` as a submodule but operates at the root level through symbolic links (portals), creating a seamless integration without file duplication.

**The Rule:** `Root visibility via symbolic links + Proxy files for navigation`

---

## 2. 📋 Distribution Architecture

### 2.1 The Submodule Structure

```
project-root/
├── .kami-flow/              # Git Submodule (KamiFlow core)
│   ├── .gemini/             # Commands, rules, skills
│   ├── .windsurf/           # IDE workflows
│   ├── docs/
│   │   ├── protocols/       # Protocol documentation
│   │   ├── overview.md      # System overview
│   │   └── templates/       # File templates
│   │       ├── context.md   # PROJECT_CONTEXT template
│   │       └── roadmap.md   # Roadmap template
│   └── GEMINI.md            # Source manifest
│
├── .gemini/                 # → Symlink to .kami-flow/.gemini
├── .windsurf/               # → Symlink to .kami-flow/.windsurf
├── docs/
│   ├── protocols/           # → Symlink to .kami-flow/docs/protocols
│   ├── overview.md          # → Symlink to .kami-flow/docs/overview.md
│   └── roadmap.md           # Seeded from template
│
├── GEMINI.md                # Proxy file (import directive)
├── PROJECT_CONTEXT.md       # Seeded from template
├── tasks/                   # Project-specific tasks
└── archive/                 # Project-specific archive
```

### 2.2 Why Symlinks?

**Benefits:**

- **Zero Duplication:** Single source of truth in `.kami-flow/`
- **Auto-Update:** `git submodule update` refreshes all linked content
- **Project-Specific:** `PROJECT_CONTEXT.md` and `tasks/` remain unique per project
- **AI Visibility:** Gemini CLI sees `.gemini/` at root, accesses full command set

**Alternative (File Copy) Rejected:**

- Requires manual sync after updates
- Risk of drift between projects
- Clutters project with duplicated files

---

## 3. 🔍 The Portal Network (Symlink Mapping)

### Portal 1: Core Commands & Rules

**Source:** `.kami-flow/.gemini/`  
**Target:** `.gemini/` (at root)  
**Type:** Directory Symlink

**PowerShell Command:**

```powershell
New-Item -ItemType SymbolicLink -Path ".gemini" -Target ".kami-flow\.gemini"
```

**Contents Exposed:**

- `commands/kamiflow/*.toml` (All workflow commands)
- `rules/*.md` (Manifesto, ID Protocol, Validator Loop, Bootstrap Protocol)
- `skills/*.md` (Reusable skills)

---

### Portal 2: IDE Integration

**Source:** `.kami-flow/.windsurf/`  
**Target:** `.windsurf/` (at root)  
**Type:** Directory Symlink

**PowerShell Command:**

```powershell
New-Item -ItemType SymbolicLink -Path ".windsurf" -Target ".kami-flow\.windsurf"
```

**Contents Exposed:**

- `rules/kamiflow-rules.md` (Windsurf-specific execution rules)
- `workflows/*.md` (IDE workflows like `/kamiflow-execute`)

---

### Portal 3: Documentation

**Source:** `.kami-flow/docs/protocols/`  
**Target:** `docs/protocols/` (at root)  
**Type:** Directory Symlink

**PowerShell Command:**

```powershell
# Create docs/ directory if it doesn't exist
if (!(Test-Path "docs")) { New-Item -ItemType Directory -Path "docs" }

# Create symlink
New-Item -ItemType SymbolicLink -Path "docs\protocols" -Target ".kami-flow\docs\protocols"
```

**Contents Exposed:**

- Protocol documentation (lean-validation, factory-line, etc.)

**Note:** The `overview.md` file is linked separately as a file-level symlink.

---

## 4. 📝 Proxy Files (Navigation Layer)

### 4.1 Root `GEMINI.md` (Proxy)

**Purpose:** Redirect Gemini CLI to read from submodule while allowing project-specific overrides.

**Template:**

```markdown
<!-- Imported from: .kami-flow/GEMINI.md -->
<!--
  This file is a PROXY. The actual system instructions are in the submodule.
  To customize AI behavior for THIS project only, add rules below this comment.
-->

# Project-Specific Customizations (Optional)

<!-- Add project-specific instructions here if needed -->
```

**Behavior:**

- Gemini CLI reads this file first
- Import directive tells AI to also load `.kami-flow/GEMINI.md`
- Project-specific rules can be added without modifying submodule

---

### 4.2 Root `PROJECT_CONTEXT.md` (Seeded)

**Purpose:** Project-specific context, seeded from template but fully independent.

**Source Template:** `.kami-flow/docs/templates/context.md`

**Bootstrap Behavior:**

1. Check if `PROJECT_CONTEXT.md` exists at root
2. If NO: Copy template from `.kami-flow/docs/templates/context.md`
3. Prompt user for:
   - Project Name
   - Project Goal
   - Key Tech Stack
4. Fill in template with user input
5. Create file at root

**Result:**

- Each project has its own context
- Template provides structure
- No link to submodule (fully independent)

---

## 5. ⚔️ Path Correction Protocol

### 5.1 The Problem: Relative Imports

**Before Bootstrap:**

```markdown
<!-- In .kami-flow/GEMINI.md -->

- Reference: `@.gemini/rules/manifesto.md`
```

**After Bootstrap (Root context):**

- AI is at root, sees symlink `.gemini/` → `.kami-flow/.gemini/`
- Path `@.gemini/rules/manifesto.md` resolves correctly via symlink

**No correction needed for symlinked directories!** ✅

---

### 5.2 Proxy File Imports (Correction Needed)

**Scenario:** Root `GEMINI.md` imports from submodule.

**Pattern to Detect:**

```regex
<!-- Imported from: (?!\.kami-flow/)(.+?) -->
```

**Correction Rule:**

```typescript
// If import path doesn't start with .kami-flow/, prepend it
if (!importPath.startsWith(".kami-flow/")) {
  correctedPath = `.kami-flow/${importPath}`;
}
```

**Example:**

```markdown
<!-- Before -->
<!-- Imported from: GEMINI.md -->

<!-- After -->
<!-- Imported from: .kami-flow/GEMINI.md -->
```

---

## 6. 🛡️ Safety Rules

### 6.1 Symlink Creation Safety

**Rule 1: Never Overwrite**

- Check if target exists before creating symlink
- If exists: Prompt user for action (Skip, Overwrite, Rename)

**Rule 2: Permission Check**

- Windows requires Admin privileges or Developer Mode for symlinks
- Detect permission failure
- Provide clear error message with solution

**Rule 3: Integrity Verification**

- After creating symlink, verify it resolves correctly
- Test: `Test-Path .gemini` should return `True`
- Report broken symlinks immediately

---

### 6.2 Proxy File Safety

**Rule 1: Preserve Existing Content**

- If `GEMINI.md` exists at root and is NOT a proxy, warn user
- Never overwrite without explicit confirmation

**Rule 2: Template Validation**

- Check if `.kami-flow/docs/templates/context.md` exists
- If missing, use embedded fallback template

**Rule 3: User Input Validation**

- Project name: Non-empty, alphanumeric + hyphens
- Tech stack: Optional but encouraged

---

## 7. 🎨 User Feedback Format

### 7.1 Health Check (via `/wake`)

**Condition:** `.kami-flow/` exists, `.gemini/` doesn't

```markdown
## 🌊 KamiFlow Submodule Detected

[Speak in {{CONVERSATIONAL_LANGUAGE}}]

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

### 7.2 Bootstrap Execution

```markdown
## 🔗 Portal Network Initialization

[Speak in {{CONVERSATIONAL_LANGUAGE}}]

**Step 1: Create Symbolic Links**

- 🔗 Create `.gemini/` → `.kami-flow/.gemini/` ✅
- 🔗 Create `.windsurf/` → `.kami-flow/.windsurf/` ✅
- 🔗 Create `docs/protocols/` → `.kami-flow/docs/protocols/` ✅

**Step 2: Initialize Proxy Files**

- 📝 Create `GEMINI.md` (proxy) ✅
- 📝 Create `PROJECT_CONTEXT.md` ✅

**Step 3: Configure Smart Ignore**

- 📝 Update `.geminiignore` ✅

---

✨ **Complete!** KamiFlow has been activated.

**Next Steps:**

1. Run `/kamiflow:wake` to load context
2. Run `/kamiflow:idea "Your first feature"` to begin
```

---

## 8. 🔗 Integration Points

### Commands That Use This Protocol

- `.gemini/commands/kamiflow/wake.toml` (Health Check)
- `.gemini/commands/kamiflow/bootstrap.toml` (Setup Engine)

### How to Invoke

**Health Check (Automatic):**

```toml
# In wake.toml, add pre-flight check:
## 2. PRE-FLIGHT VALIDATION
1. **Submodule Check:**
   - If `.kami-flow/` exists AND `.gemini/` doesn't exist:
     - Display "Submodule Detected" message
     - Suggest running `/kamiflow:bootstrap`
     - STOP (don't proceed with normal wake)
```

**Manual Bootstrap:**

```toml
# User runs:
/kamiflow:bootstrap

# AI executes:
1. Create Portal Links
2. Initialize Proxy Files
3. Configure Smart Ignore
4. Verify integrity
5. Display completion message
```

---

## 9. 🧪 Validation Examples

### Test Case 1: Fresh Submodule

**State:**

- `.kami-flow/` exists (Git submodule added)
- `.gemini/` doesn't exist
- `GEMINI.md` doesn't exist

**Expected:**

1. `/wake` detects submodule, suggests bootstrap
2. User runs `/bootstrap`
3. Symlinks created
4. Proxy files initialized
5. Context seeded
6. `/wake` succeeds on retry

---

### Test Case 2: Existing Root Files

**State:**

- `.kami-flow/` exists
- `.gemini/` exists at root (manual copy)
- `GEMINI.md` exists with custom content

**Expected:**

1. `/bootstrap` detects existing `.gemini/`
2. Prompts: "Skip, Overwrite, or Rename?"
3. User chooses "Skip"
4. Symlink creation skipped
5. Proxy file creation proceeds with caution

---

### Test Case 3: Permission Denied

**State:**

- User doesn't have symlink permissions
- Windows Developer Mode not enabled

**Expected:**

1. `/bootstrap` attempts symlink creation
2. PowerShell returns permission error
3. AI detects error
4. Displays clear message:

   ```
   ⚠️ Permission Denied

   Windows requires special permissions to create symlinks.

   **Solutions:**
   1. Run as Administrator (right-click > Run as Admin)
   2. Enable Developer Mode:
      Settings > Update & Security > For Developers > Developer Mode

   After fixing, run `/kamiflow:bootstrap` again.
   ```

---

## 10. 📊 PowerShell Implementation Guide

### Check Submodule Existence

```powershell
# Check if .kami-flow/ exists
if (Test-Path ".kami-flow") {
    Write-Output "Submodule detected"
} else {
    Write-Output "No submodule found"
}
```

### Create Directory Symlink

```powershell
# Create .gemini symlink
try {
    New-Item -ItemType SymbolicLink -Path ".gemini" -Target ".kami-flow\.gemini" -ErrorAction Stop
    Write-Output "✅ Created .gemini/ portal"
} catch {
    Write-Output "❌ Failed: $($_.Exception.Message)"
}
```

### Verify Symlink Integrity

```powershell
# Test if symlink resolves
if ((Test-Path ".gemini") -and (Get-Item ".gemini").LinkType -eq "SymbolicLink") {
    Write-Output "✅ Symlink valid"
} else {
    Write-Output "❌ Symlink broken or missing"
}
```

### Create Proxy File

```powershell
# Create root GEMINI.md
$proxyContent = @"
<!-- Imported from: .kami-flow/GEMINI.md -->
<!--
  This file is a PROXY. The actual system instructions are in the submodule.
  To customize AI behavior for THIS project only, add rules below this comment.
-->

# Project-Specific Customizations (Optional)

<!-- Add project-specific instructions here if needed -->
"@

Set-Content -Path "GEMINI.md" -Value $proxyContent
Write-Output "✅ Created GEMINI.md proxy"
```

---

## 11. 🔄 Smart Ignore Configuration

### Prevent "Double Vision"

**Problem:** If `.geminiignore` doesn't exclude `.kami-flow/`, Gemini CLI might read rules twice (once from root symlink, once from submodule).

**Solution:** Add `.kami-flow/` to `.geminiignore`.

**Implementation:**

```powershell
# Append to .geminiignore at root
$ignoreEntry = "`n# Ignore submodule (accessed via symlinks)`n.kami-flow/`n"

if (Test-Path ".geminiignore") {
    # Check if already ignored
    $content = Get-Content ".geminiignore" -Raw
    if ($content -notlike "*\.kami-flow/*") {
        Add-Content -Path ".geminiignore" -Value $ignoreEntry
        Write-Output "✅ Updated .geminiignore"
    }
} else {
    # Create .geminiignore
    Set-Content -Path ".geminiignore" -Value $ignoreEntry
    Write-Output "✅ Created .geminiignore"
}
```

---

## 12. 🚀 Update Workflow

### When KamiFlow Core Updates

**User Action:**

```bash
cd project-root/.kami-flow
git pull origin main
cd ..
```

**Result:**

- Symlinks automatically reflect updates
- No re-bootstrap needed
- Project-specific files (`PROJECT_CONTEXT.md`, `tasks/`) unaffected

**Verification:**

```bash
/kamiflow:wake
# Should show updated version if KamiFlow changed
```

---

**Last Updated:** 2026-01-25  
**Status:** Active Protocol  
**Dependencies:** Git Submodules, PowerShell (win32)
