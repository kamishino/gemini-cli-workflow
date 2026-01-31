---
name: anti-hallucination
type: RULE
description: Explicit verification protocol to prevent AI hallucinations and ensure accuracy
group: safety
order: 70
---

# 🛡️ Protocol: Anti-Hallucination Guards

> **Purpose:** Prevent AI from referencing non-existent files, inventing API signatures, or making unfounded assumptions.

---

## 1. The Hallucination Problem

### Common AI Hallucination Patterns

**Type 1: Ghost Files**
- AI references files that don't exist
- AI claims to have read files it never accessed
- AI assumes file structure without verification

**Type 2: Phantom Functions**
- AI invents function signatures
- AI assumes API methods exist without checking
- AI creates anchor points to non-existent code

**Type 3: Dependency Assumptions**
- AI assumes libraries are installed
- AI uses features from wrong library versions
- AI imports non-existent modules

**Type 4: Configuration Hallucinations**
- AI invents configuration options
- AI assumes environment variables exist
- AI creates references to undefined constants

**Impact:** Cascading errors, broken implementations, user frustration, wasted time.

---

## 2. Phase 0.5: Assumption Verification (NEW)

### When to Execute

**Trigger Point:** BEFORE Phase 1 Diagnostic Interview

**Applies To:**
- `/kamiflow:core:idea` - Before generating diagnostic questions
- `/kamiflow:dev:lazy` - Before automated artifact generation
- `/kamiflow:dev:superlazy` - Before full automation pipeline
- `/kamiflow:core:build` - Before creating S3-BUILD tasks

### The Verification Protocol

**Step 1: File Path Verification**

For EVERY file you plan to reference in your response:

1. **List Directory:**
   ```bash
   # Use find_by_name or list_dir tool
   find_by_name(SearchDirectory: "path/to/dir", Pattern: "*.js")
   ```

2. **Confirm Existence:**
   - File appears in results → ✅ VERIFIED
   - File missing → ⚠️ ASSUMPTION (document why you think it should exist)

3. **Read for Verification:**
   ```bash
   # Use read_file tool to verify content
   read_file(file_path: "path/to/file.js")
   ```

4. **Log Verification:**
   - Add to verification report: `✅ path/to/file.js (exists, read)`

**Rule:** NEVER reference a file without first verifying its existence.

---

**Step 2: Function/Variable Verification**

For EVERY function or variable you mention as an anchor point:

1. **Search Codebase:**
   ```bash
   # Use grep_search tool
   grep_search(SearchPath: "src/", Query: "function functionName", MatchPerLine: true)
   ```

2. **Confirm Signature:**
   - Function found → Extract line number and signature
   - Function missing → STOP and report hallucination risk

3. **Verify Context:**
   - Read surrounding code to ensure function does what you think
   - Check parameters and return type

4. **Log Verification:**
   - Add to report: `✅ functionName() @ file.js:42 - signature: functionName(param1, param2): return`

**Rule:** NEVER invent function signatures. If unsure, search first.

---

**Step 3: Dependency Verification**

For EVERY library you claim to use:

1. **Check package.json:**
   ```bash
   read_file(file_path: "package.json")
   # OR
   read_file(file_path: "cli-core/package.json")
   ```

2. **Verify Presence:**
   - Library in dependencies → ✅ VERIFIED
   - Library in devDependencies → ✅ VERIFIED (note: dev only)
   - Library missing → ⚠️ ASSUMPTION (suggest installation)

3. **Check Version Compatibility:**
   - Note version: `"library": "^3.2.0"`
   - Verify features exist in that version (if critical)

4. **Log Verification:**
   - Add to report: `✅ axios@1.6.0 (installed in dependencies)`

**Rule:** NEVER assume library availability. Always verify package.json.

---

**Step 4: Configuration Verification**

For EVERY config option, environment variable, or constant:

1. **Check Configuration Files:**
   ```bash
   # Look in common config locations
   read_file(".kamirc.json")
   read_file("cli-core/.kamirc.json")
   read_file(".env") # if applicable
   ```

2. **Verify Option Exists:**
   - Option found → ✅ VERIFIED (note current value)
   - Option missing → ⚠️ ASSUMPTION (document expected default)

3. **Log Verification:**
   - Add to report: `✅ gatedAutomation: true (from .kamirc.json)`

**Rule:** NEVER invent configuration options. Check actual config files.

---

### Verification Report Format

**Template:**
```markdown
# 🔍 ASSUMPTION VERIFICATION REPORT

**Task:** [ID or description]
**Verified At:** [Timestamp]
**Phase:** 0.5 (Pre-Diagnostic)

---

## ✅ Files Verified

- `path/to/file1.js` (exists, read, 150 lines)
- `path/to/file2.ts` (exists, read, 230 lines)
- `config/.kamirc.json` (exists, read)

**Total:** [X files verified]

---

## ✅ Functions/Variables Verified

- `functionName()` @ file1.js:42
  - Signature: `functionName(param1: string, param2: number): boolean`
  - Purpose: Validates user input
- `CONSTANT_VALUE` @ config.js:10
  - Value: `"production"`

**Total:** [X functions verified]

---

## ✅ Dependencies Verified

- `axios@1.6.0` (dependencies)
- `express@4.18.2` (dependencies)
- `jest@29.5.0` (devDependencies)

**Total:** [X libraries verified]

---

## ✅ Configuration Verified

- `gatedAutomation: true` (from .kamirc.json)
- `executionMode: "Implementer"` (from .kamirc.json)
- `language: "english"` (from .kamirc.json)

**Total:** [X config options verified]

---

## ⚠️ Assumptions Made

[If none, write "None - all references verified"]

OR

1. **Assumption:** File `utils/helper.js` should exist based on imports in other files
   - **Justification:** Multiple files import from this path
   - **Risk:** Medium - will verify during implementation
   - **Mitigation:** Create file if missing during S3-BUILD

2. **Assumption:** Function `validateInput()` exists but couldn't locate
   - **Justification:** Mentioned in S2-SPEC from previous task
   - **Risk:** High - could be hallucination
   - **Mitigation:** Search more thoroughly before using as anchor point

---

## 🚫 Hallucination Risks Identified

[If none, write "None detected"]

OR

1. **Risk:** Reference to `config/database.js` but file doesn't exist
   - **Action:** Removed from plan, will not reference
2. **Risk:** Assumed `lodash` library but not in package.json
   - **Action:** Use native JS instead or suggest installation

---

## 🎯 Verification Status

**Overall:** ✅ CLEAR TO PROCEED | ⚠️ PROCEED WITH CAUTION | 🚫 BLOCKED

**Next Action:**
- If CLEAR: Proceed to Phase 1 Diagnostic Interview
- If CAUTION: Document assumptions clearly, verify during implementation
- If BLOCKED: Fix hallucination risks, re-verify, then proceed
```

---

## 3. Continuous Verification (During Implementation)

### Before Every Code Edit

**Pre-Edit Checklist:**
```markdown
Before editing [filename]:
1. [ ] Verify file exists with read_file tool
2. [ ] Read current content to understand structure
3. [ ] Identify exact anchor point (function, class, line range)
4. [ ] Confirm anchor point exists with grep_search
5. [ ] Plan edit to fit existing code style
```

**Example:**
```markdown
Planning to edit: src/utils/validator.js

Verification:
1. ✅ File exists (confirmed with read_file)
2. ✅ Read lines 1-100 (file has 85 lines total)
3. ✅ Anchor point: function validateInput() at line 42
4. ✅ Grep search confirms: "function validateInput(data) {" at line 42
5. ✅ Will add new validation logic inside this function
```

---

### During S3-BUILD Task Generation

**Enhanced Subtask Template:**

```markdown
- [ ] **Step X: [Action] at [Anchor Point]**
  - **Target File:** `path/to/file.ts`
  - **Pre-Task Verification:**
    - Run: `grep -n "anchorFunction" path/to/file.ts`
    - Expected: Line ~XX, signature: `anchorFunction(params): return`
    - Status: [VERIFIED | NOT FOUND]
  - **Action:** [Specific code change]
  - **If Not Found:** STOP immediately and report hallucination risk to user
  - **Post-Edit Verification:**
    - Run: `node --check path/to/file.ts` (syntax check)
    - Expected: Exit code 0 (no errors)
```

**Example in Practice:**
```markdown
- [ ] **Step 3: Add email validation to input sanitizer**
  - **Target File:** `cli-core/utils/input-sanitizer.js`
  - **Pre-Task Verification:**
    - Run: `grep -n "sanitizeInput" cli-core/utils/input-sanitizer.js`
    - Expected: Line ~15, signature: `function sanitizeInput(input, type)`
    - Status: VERIFIED (found at line 17)
  - **Action:** Add email regex validation before existing checks
  - **Code to Add:**
    ```javascript
    if (type === 'email' && !emailRegex.test(input)) {
      throw new Error('Invalid email format');
    }
    ```
  - **Post-Edit Verification:**
    - Run: `node --check cli-core/utils/input-sanitizer.js`
    - Expected: Exit code 0
```

---

## 4. Hallucination Detection Triggers

### Red Flags That Indicate Potential Hallucination

**Immediate Red Flags:**
- You reference a file but haven't called `read_file` on it
- You mention a function but haven't called `grep_search` for it
- You cite a library but haven't checked `package.json`
- You use a config option but haven't verified the config file
- You provide line numbers without having read the file

**Suspicious Patterns:**
- Overly specific details about code you haven't seen
- Confident statements about file structure without verification
- Anchor points that are "probably at line X"
- References to "typical" or "standard" implementations
- Assumptions based on "other projects" or "common patterns"

### Self-Correction Protocol

**When Red Flag Detected:**
```
1. PAUSE immediately
2. Identify what you're assuming
3. Run verification tool (read_file, grep_search, etc.)
4. If verified → Continue
5. If not found → REMOVE from plan, document assumption
6. If critical → Report to user and request guidance
```

---

## 5. Integration with Existing Workflows

### Phase 0.5 in Different Commands

**In `/kamiflow:core:idea`:**
- Execute Phase 0.5 AFTER Phase 0 (Logical Guard)
- BEFORE Phase 1 (Diagnostic Interview)
- Verify any files mentioned in raw idea input

**In `/kamiflow:dev:lazy`:**
- Execute Phase 0.5 AFTER Phase 0 (Logical Guard)
- BEFORE Phase 1 (Diagnostic Interview)
- Comprehensive verification since automation follows

**In `/kamiflow:dev:superlazy`:**
- Execute Phase 0.5 AFTER Phase 0 (Logical Guard)
- BEFORE Phase 1 (Diagnostic Interview)
- Most critical since full automation - verify extensively

**In `/kamiflow:core:build`:**
- Execute Phase 0.5 AFTER reading S2-SPEC
- BEFORE generating S3-BUILD task list
- Verify all files/functions mentioned in SPEC

---

## 6. Verification Tools Reference

### Available Tools for Verification

**File Operations:**
- `read_file(file_path)` - Read and verify file content
- `list_dir(DirectoryPath)` - List directory contents
- `find_by_name(SearchDirectory, Pattern)` - Find files by pattern

**Code Search:**
- `grep_search(SearchPath, Query, MatchPerLine)` - Search for text in files
- `code_search(search_folder_absolute_uri, search_term)` - Semantic code search

**Execution:**
- `run_command(CommandLine, Cwd)` - Run shell commands for verification
  - Example: `node --check file.js` (syntax check)
  - Example: `npm list <package>` (verify dependency installed)

### Verification Best Practices

1. **Batch Verification:**
   - Verify all files in one list_dir call when possible
   - Use grep_search with broad pattern, then narrow down

2. **Cache Verification Results:**
   - Don't re-verify the same file multiple times
   - Remember verification results within same session

3. **Fail Fast:**
   - If critical file missing, STOP immediately
   - Don't proceed with assumptions on critical paths

4. **Document Everything:**
   - Log all verification attempts
   - Note what was found vs. assumed
   - Provide clear hallucination risk assessment

---

## 7. Error Messages & User Guidance

### When Hallucination Risk Detected

**User-Facing Message:**
```
🚫 HALLUCINATION RISK DETECTED

I attempted to reference the following, but verification failed:
- File: path/to/missing-file.js (NOT FOUND)
- Function: nonExistentFunction() (NOT FOUND in codebase)

Actions Taken:
1. Removed references from plan
2. Searched alternative locations (none found)

Recommended Actions:
1. If file should exist: Please provide correct path
2. If function is new: I'll create it in implementation
3. If assumption was wrong: I'll proceed without it

Would you like me to:
A) Proceed with modified plan (excluding missing items)
B) Wait for you to provide correct references
C) Create the missing items as part of this task
```

### When Verification Succeeds

**User-Facing Message:**
```
✅ ASSUMPTION VERIFICATION COMPLETE

Verified:
- 8 files (all exist and readable)
- 12 functions/variables (all anchor points confirmed)
- 5 dependencies (all installed)
- 3 config options (all valid)

Assumptions: None

Hallucination Risk: None detected

Status: CLEAR TO PROCEED with Phase 1 Diagnostic Interview
```

---

## 8. Success Criteria

**Anti-Hallucination Guards are effective when:**

1. **Detection Rate:** 100% of non-existent references caught before Phase 1
2. **False Positives:** < 5% (verification doesn't flag valid references)
3. **User Trust:** Users report increased confidence in AI accuracy
4. **Error Reduction:** Cascading errors due to hallucinations drop by >80%
5. **Efficiency:** Verification adds < 30 seconds to workflow

---

## 9. Future Enhancements

**Planned Improvements:**
- Automated caching of verification results across sessions
- Fuzzy matching for "almost correct" file paths
- AI learning from previous hallucination corrections
- Integration with IDE LSP for real-time verification

**Current Limitations:**
- Manual verification (AI must explicitly call tools)
- No cross-session verification cache
- Relies on AI discipline to execute Phase 0.5

---

## ✅ Quick Reference Checklist

**Before generating any plan or task list:**

```markdown
## 🛡️ Anti-Hallucination Pre-Flight

- [ ] Phase 0.5: Assumption Verification executed
- [ ] All referenced files verified with read_file
- [ ] All anchor functions verified with grep_search
- [ ] All dependencies verified in package.json
- [ ] All config options verified in config files
- [ ] Verification report generated
- [ ] Hallucination risks: None OR documented with mitigation
- [ ] Status: CLEAR TO PROCEED

If ANY item fails: STOP and fix before continuing.
```

---

## 🔗 Related Protocols

- `@.gemini/rules/flow-factory-line.md` - Lock 3: Legacy Awareness (reconnaissance)
- `@.gemini/rules/error-recovery.md` - Handling hallucination-related errors
- `@.gemini/rules/flow-validation.md` - Validation catches hallucination consequences
