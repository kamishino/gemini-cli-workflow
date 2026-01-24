# 🔍 The ID Protocol: Global Task Identity Management

> **Purpose:** Ensure continuous, conflict-free Task ID generation across active tasks, archived tasks, and multiple sessions.

---

## 1. 🎯 Core Principle

**"The Scout"** - Every ID generation starts with a **global reconnaissance** of the project's task history, including archived tasks.

**The Rule:** `Next ID = MAX(all discovered IDs) + 1`

---

## 2. 📋 ID Format Standard

### 2.1 Canonical Format

```
[ID]-[Phase]-[Type]-[slug].md

Examples:
- 007-S1-IDEA-global-id-tracker.md
- 007-S2-SPEC-global-id-tracker.md
- 007-S3-BUILD-global-id-tracker.md
- 007-S4-HANDOFF-global-id-tracker.md
```

### 2.2 ID Structure

- **ID:** Zero-padded 3-digit number (001, 002, ..., 999)
- **Phase:** S1, S2, S3, S4 (Sniper Model phases)
- **Type:** IDEA, SPEC, BUILD, HANDOFF
- **Slug:** Kebab-case descriptive name

### 2.3 Conflict Suffix Format

If ID collision detected:

```
[ID]-[suffix]-[Phase]-[Type]-[slug].md

Examples:
- 007-1-S1-IDEA-duplicate-task.md  (first duplicate)
- 007-2-S1-IDEA-another-task.md    (second duplicate)
```

---

## 3. 🔍 The Scout Workflow (ID Discovery)

### Step 1: Initialize Scan

Scan **all** task-related directories:

- `tasks/` (active tasks)
- `archive/` (completed tasks, recursively)

**PowerShell Command:**

```powershell
Get-ChildItem -Path tasks, archive -Filter *.md -Recurse | Select-Object Name, FullName
```

### Step 2: Extract IDs from Filenames

**Regex Pattern:** `^(\d{3})`

Apply to each filename to extract the numeric ID portion.

**Examples:**

- `007-S1-IDEA-task.md` → `007` → `7`
- `007-1-S2-SPEC-task.md` → `007` → `7` (ignore suffix)
- `2026-01-25_007_task/007-S3-BUILD-task.md` → `007` → `7`
- `random-file.md` → `null` (skip)

### Step 3: Determine Max ID

```typescript
const extractedIds = files.map((f) => parseIdFromFilename(f.name)).filter((id) => id !== null);

const maxId = extractedIds.length > 0 ? Math.max(...extractedIds) : 0;

const nextId = maxId + 1;
```

**Key Rule:** Gaps are ignored. If IDs 001, 003, 007 exist, next is 008 (not 002 or 004).

### Step 4: Format Next ID

```typescript
const formattedId = String(nextId).padStart(3, "0");
// Example: 8 → "008"
```

---

## 4. ⚔️ Conflict Resolution Protocol

### Scenario: ID Already Exists

**Detection:** Before creating `XXX-S1-IDEA-[slug].md`, check if any file matching `XXX-*` exists.

**Resolution Strategy:**

1. **Check for existing files:**

   ```powershell
   Get-ChildItem -Path tasks -Filter "007-*.md"
   ```

2. **If files found:**
   - Extract all suffixes (none, `-1`, `-2`, etc.)
   - Find highest suffix number
   - Append next suffix to new task

**Example:**

```
Existing: 007-S1-IDEA-old-task.md
New task: 007-1-S1-IDEA-new-task.md

Existing: 007-S1-IDEA-task.md, 007-1-S2-SPEC-other.md
New task: 007-2-S1-IDEA-newest.md
```

### Suffix Extraction Regex

**Pattern:** `^(\d{3})(?:-(\d+))?-`

**Examples:**

- `007-S1-IDEA-task.md` → suffix = `null` (base)
- `007-1-S2-SPEC-task.md` → suffix = `1`
- `007-2-S3-BUILD-task.md` → suffix = `2`

### Next Suffix Calculation

```typescript
const suffixes = files.map((f) => extractSuffix(f.name)).filter((s) => s !== null);

const maxSuffix = suffixes.length > 0 ? Math.max(...suffixes) : -1; // -1 means "no suffix yet, base ID available"

const nextSuffix = maxSuffix >= 0 ? maxSuffix + 1 : null; // null means use base ID (no suffix)
```

---

## 5. 🎨 User Feedback Format

### During ID Generation

Display reconnaissance results to user:

```markdown
## 🔍 Task ID Reconnaissance

**Scanning History:**

- Active tasks: 4 files found in `tasks/`
- Archived tasks: 23 files found in `archive/`
- **Max ID discovered:** 006

**Next Task ID:** 007
**Full Identifier:** 007-S1-IDEA-[your-slug]
```

### If Conflict Detected

```markdown
## ⚠️ ID Conflict Detected

**Existing:** 007-S1-IDEA-old-task.md
**Resolution:** Assigning suffix `-1` to new task
**New Identifier:** 007-1-S1-IDEA-[your-slug]
```

---

## 6. 🔗 Integration Points

### Commands That Use This Protocol

- `.gemini/commands/kamiflow/idea.toml` (Phase 1: Generate ID before creating S1-IDEA)
- `.gemini/commands/kamiflow/lazy.toml` (Phase 1: Generate ID for all S1-S4 artifacts)
- `.gemini/commands/kamiflow/superlazy.toml` (Phase 1: Generate ID before auto-execution)

### How to Invoke

**In TOML prompts, include:**

```toml
## 2. PRE-FLIGHT VALIDATION
3. **ID Logic:** Follow `@.gemini/rules/id-protocol.md`
   - Scan `tasks/` and `archive/` recursively
   - Extract all numeric IDs using regex `^(\d{3})`
   - Calculate: Next ID = MAX(IDs) + 1
   - Format as zero-padded 3-digit string
   - Check for conflicts and apply suffix if needed
```

---

## 7. 🧪 Validation Examples

### Test Case 1: Empty Project

**State:** No files in `tasks/` or `archive/`
**Expected:** Next ID = `001`

### Test Case 2: Sequential IDs

**State:**

- `tasks/001-S1-IDEA-first.md`
- `tasks/002-S2-SPEC-second.md`
- `archive/2026-01-24_003_third/003-S3-BUILD-third.md`

**Expected:** Next ID = `004`

### Test Case 3: Gaps in Sequence

**State:**

- `tasks/001-S1-IDEA-task.md`
- `archive/2026-01-20_005_task/005-S1-IDEA-task.md`
- `archive/2026-01-22_007_task/007-S2-SPEC-task.md`

**Expected:** Next ID = `008` (gaps at 002, 003, 004, 006 are ignored)

### Test Case 4: ID Conflict (Manual Override)

**State:**

- User manually creates `007-S1-IDEA-manual.md`
- AI generates new task with ID `007`

**Resolution:**

- Detect existing `007-S1-IDEA-manual.md`
- Create new task as `007-1-S1-IDEA-ai-generated.md`

### Test Case 5: Multiple Suffixes

**State:**

- `007-S1-IDEA-base.md`
- `007-1-S1-IDEA-first-dup.md`
- `007-2-S2-SPEC-second-dup.md`

**Expected:** Next suffix = `3` → `007-3-S1-IDEA-new.md`

---

## 8. 🛡️ Safety Rules

1. **Always Scan Before Generate:** Never assume the last ID from memory
2. **Read-Only Archive:** Never modify files in `archive/` during ID resolution
3. **Explicit Reporting:** Always show the user what ID was chosen and why
4. **Conflict Preference:** Prefer suffixes over failing (non-blocking)
5. **Case Sensitivity:** Treat filenames as case-insensitive on Windows

---

## 9. 📊 PowerShell Implementation Guide

### Scan and Extract IDs

```powershell
# Get all markdown files from tasks and archive
$files = Get-ChildItem -Path tasks, archive -Filter *.md -Recurse

# Extract numeric IDs
$ids = $files | ForEach-Object {
    if ($_.Name -match '^(\d{3})') {
        [int]$matches[1]
    }
} | Where-Object { $_ -ne $null }

# Find max ID
$maxId = if ($ids.Count -gt 0) { ($ids | Measure-Object -Maximum).Maximum } else { 0 }

# Calculate next ID
$nextId = $maxId + 1
$formattedId = "{0:D3}" -f $nextId

Write-Output "Next ID: $formattedId"
```

### Check for Conflicts

```powershell
# Check if ID 007 already exists
$conflictingFiles = Get-ChildItem -Path tasks -Filter "007-*.md"

if ($conflictingFiles.Count -gt 0) {
    Write-Output "⚠️ Conflict detected"
    # Extract suffixes and calculate next
    # (Implementation in AI logic, not shell)
}
```

---

## 10. 🔄 Workflow Integration

### Typical ID Generation Flow

```
1. User triggers: /kamiflow:idea "Build X"
2. AI reads: @.gemini/rules/id-protocol.md
3. AI executes: PowerShell scan command
4. AI parses: Extract all IDs from filenames
5. AI calculates: maxId + 1
6. AI checks: Conflict detection
7. AI displays: "Next ID: 007"
8. AI proceeds: Create 007-S1-IDEA-build-x.md
```

---

**Last Updated:** 2026-01-25  
**Status:** Active Protocol  
**Dependencies:** Smart Archive System (005)
