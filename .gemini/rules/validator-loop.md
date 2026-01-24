# 🔄 The Validator Loop Protocol

> **Purpose:** Ensure code quality by implementing a self-healing "Execute → Validate → Heal" loop in automated workflows.

---

## 1. 🎯 Core Principle

**"Function > Form"** - Critical logic errors MUST be fixed before commit. Warnings are acceptable if they don't break functionality.

**The Loop:** Execute → Validate → Heal (max 3 attempts) → Report

---

## 2. 🔍 Validation Command Auto-Discovery

Before running the loop, detect which validation tools are available in the project:

### Detection Logic (Priority Order)

1. **TypeScript Projects:**
   - Check for `tsconfig.json` → Run `tsc --noEmit`
   - Check for `package.json` with `"lint"` script → Run `npm run lint`

2. **JavaScript Projects:**
   - Check for `package.json` with `"lint"` script → Run `npm run lint`
   - Check for `.eslintrc.*` → Run `npx eslint .`
   - Fallback: `node --check [modified files]`

3. **Python Projects:**
   - Check for `requirements.txt` or `pyproject.toml` → Run `python -m py_compile [modified files]`
   - Check for `pytest.ini` or `tests/` → Run `pytest`
   - Check for `.flake8` or `setup.cfg` → Run `flake8 [modified files]`

4. **No Tools Found:**
   - Use syntax-only validation:
     - JS/TS: `node --check [file]`
     - Python: `python -m py_compile [file]`
   - Display warning: "⚠️ No linter/test setup detected. Using basic syntax check only."

---

## 3. 🔄 The Execution Loop

### Step 1: Execute

AI performs requested code changes (implements tasks from BUILD file).

### Step 2: Discovery

Scan project for validation tools using the auto-discovery logic above.

### Step 3: Validate

```powershell
# Example commands
npm run lint
tsc --noEmit
pytest
python -m py_compile src/*.py
```

Capture:

- Exit code
- `stdout` and `stderr`

### Step 4: Analyze Criticality

Parse the validation output:

**CRITICAL Issues (Block commit):**

- Syntax errors
- Missing imports/modules
- Type errors (in TypeScript)
- Failed unit tests
- Breaking logic errors

**WARNING Issues (Allow commit with note):**

- Missing semicolons (if not enforced as error)
- Unused variables (if not enforced as error)
- JSDoc/comment warnings
- Code style violations (indentation, etc.)

**Decision Matrix:**

```
Exit Code 0 → SUCCESS (proceed to commit)
Exit Code ≠ 0 + Only Warnings → PROCEED (commit with warning note)
Exit Code ≠ 0 + Any CRITICAL → HEAL (attempt fix)
```

### Step 5: Heal (Self-Correction)

**Max 3 attempts per execution session.**

For each healing attempt:

1. **Parse Error Log:**
   - Extract file path, line number, error message
   - Identify error type (syntax, import, type, logic)

2. **Apply Fix:**
   - Read the problematic file
   - Analyze the error context
   - Generate a targeted fix (don't refactor unrelated code)
   - Apply edit using `edit` or `multi_edit` tool

3. **Return to Step 3 (Validate)**
   - Re-run the same validation command
   - If still fails, increment attempt counter

**Healing Guidelines:**

- Focus on the specific error, not general improvements
- Don't add features or refactor during healing
- If unsure, prefer minimal changes
- Log each fix attempt for transparency

### Step 6: Final Decision

After max 3 attempts:

**If PASSED:**

- Proceed to git commit
- Include "Healing Summary" in commit message if fixes were applied
- Log to Memory Bank (see Section 4)

**If FAILED:**

- Display error report to user
- DO NOT commit broken code
- Suggest manual intervention
- Log to Memory Bank for future learning

---

## 4. 📝 Memory Bank Integration

After each execution session (success or failure), log learnings to `PROJECT_CONTEXT.md`:

### What to Log

**For Successful Healing:**

```markdown
## 2. Active Context (The "Now")

- **Common Error Pattern:** [e.g., "Missing closing bracket in arrow functions"]
- **Typical Fix:** [e.g., "Check last line of function for bracket mismatch"]
- **Frequency:** [e.g., "Encountered 3 times"]
```

**For Failed Healing:**

```markdown
## 2. Active Context (The "Now")

- **Unresolved Error:** [Error description]
- **Attempted Fixes:** [Brief summary of what was tried]
- **Recommendation:** [e.g., "Review import paths manually"]
```

### Logging Rules

- Only log unique error patterns (don't duplicate)
- Update frequency counter if pattern already exists
- Keep entries concise (1-2 lines max)
- Append to "Active Context" section

---

## 5. 📊 Transparency Report Format

Display this to the user after execution:

```markdown
## 🔄 Validator Loop Summary

**Validation Tool:** [e.g., "tsc --noEmit"]
**Total Attempts:** [e.g., 2]

### Attempt History

- **Attempt 1:** ❌ FAILED
  - Error: Syntax error in `src/utils.ts:45` - Missing closing bracket
  - Action: Added closing bracket at line 45
- **Attempt 2:** ✅ PASSED
  - All checks passed

**Final Status:** ✅ Code validated and committed
**Memory Bank:** Updated with "Missing bracket" pattern
```

---

## 6. ⚠️ Safety Rules

1. **Hard Cap:** Max 3 healing attempts per session
2. **No Silent Commits:** Never commit without validation (unless no tools available)
3. **User Transparency:** Always show the attempt history
4. **Scope Limit:** Only heal errors in files modified during this session
5. **Fallback:** If tools fail to run, ask user for guidance

---

## 7. 🔗 Integration Points

This protocol is used by:

- `.gemini/commands/kamiflow/superlazy.toml` (Auto-execution mode)
- Future commands that implement code changes

**When to Skip:**

- Read-only operations (documentation updates)
- Planning phases (IDEA/SPEC generation)
- Archive/sync operations

---

## 8. 🎓 Criticality Analysis Examples

### CRITICAL ❌

```
Error: Cannot find module './utils'
Error: Unexpected token '}'
Error: ReferenceError: foo is not defined
Test Suite Failed: 2/10 tests failing
```

### WARNING ⚠️

```
Warning: Unused variable 'temp'
Warning: Missing JSDoc comment
Warning: Line exceeds 80 characters
Warning: Prefer const over let
```

---

**Last Updated:** 2026-01-25  
**Status:** Active Protocol
