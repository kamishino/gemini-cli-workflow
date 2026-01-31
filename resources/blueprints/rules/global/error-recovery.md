---
name: error-recovery
type: RULE
description: Systematic error handling and recovery protocol with 3-level strategy
group: safety
order: 80
---

# 🔧 Protocol: Error Recovery & Resilience

> **Purpose:** Transform errors from workflow killers into learning opportunities through systematic classification and recovery.

---

## 1. Error Classification System

### 3-Level Recovery Model

```
Error Occurs
    ↓
Classify Error → Level 1 | Level 2 | Level 3
    ↓              ↓         ↓         ↓
         Auto-Heal  User-Assist  Escalate
```

---

### Level 1: Self-Healing (Automated)

**Criteria:** Errors that can be fixed automatically without user intervention.

**Examples:**
- Wrong ID detected during reconnaissance
- TOML syntax error (triple-slash escape)
- File not found (typo in path)
- Missing import statement
- Lint style violation (auto-fixable)
- Cache invalidation needed
- Whitespace/formatting errors

**Recovery Action:**
1. Detect error pattern
2. Apply known fix from self-healing library
3. Re-execute operation
4. Log healing action
5. Continue workflow

**Max Retries:** 3 attempts per error

**Success Metric:** >80% of Level 1 errors auto-resolved

---

### Level 2: Guided Recovery (User Assist)

**Criteria:** Errors requiring user decision or clarification.

**Examples:**
- Conflict in Phase 0 (contradictory requirements)
- Validation fails 3 times (unknown cause)
- Legacy code analysis inconclusive
- Ambiguous requirement in specification
- Multiple valid solutions (need user preference)
- Breaking change detected (needs approval)

**Recovery Action:**
1. Present error context clearly
2. Show what was attempted
3. Offer 2-3 options for resolution
4. Wait for user input via `wait_for_user_input`
5. Apply user's choice
6. Continue workflow

**User Interface:**
```
⚠️ USER ASSISTANCE REQUIRED

Error: [Clear description]
Context: [What was being attempted]

Attempted Solutions:
1. [What was tried] → [Result]
2. [What was tried] → [Result]

Options:
A) [Solution option 1]
B) [Solution option 2]
C) Cancel and revise workflow

Which option would you like? (A/B/C)
```

---

### Level 3: Escalation (Manual Intervention)

**Criteria:** Errors requiring workflow restart or fundamental rethinking.

**Examples:**
- Hallucination detected (AI referenced non-existent code)
- Scope creep identified (task grew beyond bounds)
- Technical blocker (external dependency unavailable)
- Breaking architectural change (needs design review)
- Security issue detected (needs audit)
- Resource constraint (time/complexity exceeded)

**Recovery Action:**
1. Log complete error context
2. Generate error report
3. Suggest next steps (revise, pause, pivot)
4. Exit workflow gracefully
5. Preserve all artifacts for debugging

**User Interface:**
```
🚨 WORKFLOW ESCALATION

Critical Issue: [Error type]
Phase: [Where it occurred]
Task ID: [If applicable]

Problem:
[Detailed description of what went wrong]

Root Cause Analysis:
[Why this error occurred]

Recommended Actions:
1. Run: /kamiflow:dev:revise [ID] to reload full context
2. OR: Fix issue manually, then resume at Phase [X]
3. OR: Cancel task and create new refined task

Error Report: See {{KAMI_WORKSPACE}}.kamiflow/errors/[timestamp]-error.md
```

---

## 2. Retry Logic & Strategy

### Standard Retry Pattern

```
Attempt 1: Execute action
  ↓ (if fail)
Analyze Error → Classify Level
  ↓
IF Level 1:
  Attempt 2: Apply self-healing fix → Re-execute
    ↓ (if fail)
  Attempt 3: Try alternative approach → Re-execute
    ↓ (if fail)
  Escalate to Level 2 (User Assist)

IF Level 2:
  Present options → Wait for user → Apply solution
    ↓ (if fail)
  Escalate to Level 3

IF Level 3:
  Log error → Exit gracefully
```

### Retry Configuration

**Max Retries per Level:**
- Level 1: 3 automatic retries
- Level 2: 1 retry after user input
- Level 3: No retry (requires manual fix)

**Retry Delays:**
- Attempt 1→2: Immediate
- Attempt 2→3: 1 second delay
- Attempt 3→Level 2: 2 second delay (give user time to read)

**Backoff Strategy:**
- Linear backoff for fast operations (file read)
- No backoff for user-facing errors (present immediately)

---

## 3. Self-Healing Library

### Common Error Patterns & Fixes

#### Pattern 1: Wrong Task ID

**Error Signature:**
```
File not found: tasks/042-S1-IDEA-feature.md
OR
Max ID mismatch: Expected 041, used 042
```

**Self-Healing Fix:**
1. Trigger reactive scan: `Get-ChildItem -Path tasks, archive -Filter *.md -Recurse`
2. Extract all IDs with regex: `^(\d{3})`
3. Calculate correct MAX_ID
4. Update `cached_max_id` and `next_id`
5. Retry with correct ID

**Success Rate:** ~95% (fails only if file system issues)

---

#### Pattern 2: TOML Triple-Slash Escape

**Error Signature:**
```
TOML parsing error: Invalid escape sequence /// at line XX
```

**Self-Healing Fix:**
1. Read TOML file
2. Regex replace: `///` → `'''` (triple single-quote)
3. Write corrected file
4. Re-run TOML validator
5. If pass → Continue

**Success Rate:** ~100% (this is a known pattern)

---

#### Pattern 3: Missing Import Statement

**Error Signature:**
```
ReferenceError: [Module] is not defined
OR
Cannot find module '[name]'
```

**Self-Healing Fix:**
1. Parse error to identify missing module
2. Check if module in package.json
3. If yes: Add `const Module = require('module')` at top of file
4. Re-run syntax check
5. If pass → Continue

**Success Rate:** ~70% (may fail if module path is complex)

---

#### Pattern 4: File Not Found (Path Typo)

**Error Signature:**
```
ENOENT: no such file or directory, open 'path/to/flie.js'
```

**Self-Healing Fix:**
1. Extract intended path from error
2. List directory: `list_dir("path/to/")`
3. Fuzzy match filename (Levenshtein distance < 3)
4. If match found: Suggest correct path to user (Level 2)
5. If no match: Escalate (Level 3 - hallucination risk)

**Success Rate:** ~60% (depends on how close the typo is)

---

#### Pattern 5: Lint Auto-Fixable Errors

**Error Signature:**
```
ESLint: Missing semicolon at line XX (auto-fixable)
ESLint: Trailing whitespace at line YY (auto-fixable)
```

**Self-Healing Fix:**
1. Run: `npm run lint -- --fix` (if available)
2. OR: Apply specific fix based on rule
3. Re-run lint check
4. If pass → Continue

**Success Rate:** ~90% (most style issues are auto-fixable)

---

### Self-Healing Decision Tree

```
Error Detected
  ↓
Pattern Match
  ├─ Known Pattern (ID, TOML, Import, Lint)?
  │   ↓ YES
  │   Apply Fix → Retry
  │   ↓
  │   Success? → Continue
  │   Fail? → Attempt 2 (alternative approach)
  │
  └─ Unknown Pattern?
      ↓ YES
      Escalate to Level 2 (User Assist)
```

---

## 4. Error Log Format

### For Level 2+ Errors

**File Path:** `{{KAMI_WORKSPACE}}.kamiflow/errors/[YYYY-MM-DD_HHMM]-[error-type].md`

**Template:**
```markdown
# Error Report: [Error Type]

**Timestamp:** [ISO 8601]
**Error Level:** [Level 2 | Level 3]
**Phase:** [0/0.5/1/2/3/4]
**Task ID:** [ID or N/A]
**Command:** [/kamiflow:command invoked]

---

## 📋 Error Details

**Error Message:**
```
[Full error message and stack trace]
```

**Error Type:** [Classification: Syntax, Logic, Hallucination, Validation, etc.]

---

## 🔍 Context

**Current Operation:** [What was being attempted]
**File/Location:** [path/to/file:line]
**Expected Outcome:** [What should have happened]
**Actual Outcome:** [What actually happened]

**Related Artifacts:**
- S1-IDEA: [path or N/A]
- S2-SPEC: [path or N/A]
- S3-BUILD: [path or N/A]

---

## 🔧 Recovery Attempts

### Attempt 1 (Automatic)
- **Action Taken:** [Self-healing fix applied]
- **Result:** [Success/Fail]
- **Log:** [Relevant output]

### Attempt 2 (Automatic)
- **Action Taken:** [Alternative approach]
- **Result:** [Success/Fail]
- **Log:** [Relevant output]

### Attempt 3 (Automatic)
- **Action Taken:** [Last attempt]
- **Result:** [Success/Fail]
- **Log:** [Relevant output]

---

## 👤 User Action Required

**For Level 2 Errors:**
```
Please choose one of the following options:
A) [Option 1 description]
B) [Option 2 description]
C) [Option 3 description]

Recommended: [Which option and why]
```

**For Level 3 Errors:**
```
This error requires manual intervention. Suggested next steps:

1. **Revise Workflow:** Run `/kamiflow:dev:revise [ID]`
   - Reloads full context
   - Asks targeted questions
   - Generates fresh plan

2. **Manual Fix:** 
   - Fix [specific issue]
   - Then resume at Phase [X]

3. **Cancel & Refactor:**
   - Break task into smaller pieces
   - Create Task [next-ID] with refined scope
```

---

## 🧠 Root Cause Analysis

**Why This Happened:**
[Analysis of underlying cause]

**Prevention for Future:**
- [ ] [Action to prevent recurrence]
- [ ] [Documentation update needed]
- [ ] [Tool improvement needed]

---

## 📊 Error Statistics

**This Session:**
- Total Errors: [X]
- Level 1 Auto-Healed: [Y]
- Level 2 User Assisted: [Z]
- Level 3 Escalated: [W]

**Self-Healing Success Rate:** [Y/X * 100]%
```

---

## 5. Integration with Workflows

### Phase 0: Logical Guard

**Errors to Catch:**
- Conflicting requirements
- Tech stack contradictions

**Recovery:** Level 2 (present conflict, ask user to resolve)

---

### Phase 0.5: Assumption Verification

**Errors to Catch:**
- File not found (hallucination risk)
- Function doesn't exist
- Library not installed

**Recovery:**
- File typo: Level 1 (fuzzy match)
- Hallucination: Level 3 (escalate)
- Missing library: Level 2 (suggest install)

---

### Phase 1: Diagnostic Interview

**Errors to Catch:**
- User input timeout
- Ambiguous answers

**Recovery:** Level 2 (ask clarifying follow-up)

---

### Phase 2: Strategic Synthesis

**Errors to Catch:**
- No clear "best" option (all low-rated)
- User selects "none"

**Recovery:** Level 2 (revise options or cancel workflow)

---

### Phase 3A: Artifact Generation

**Errors to Catch:**
- S1/S2/S3 generation fails
- File write permission denied

**Recovery:** Level 3 (file system issue, needs manual fix)

---

### Phase 3B: Validation Loop

**Errors to Catch:**
- Syntax errors (TOML, JS, TS)
- Test failures
- Lint errors

**Recovery:**
- Known patterns: Level 1 (self-heal)
- Unknown failures: Level 2 (show logs, ask for help)
- Repeated failures: Level 3 (escalate)

---

### Phase 4: Strategic Exit

**Errors to Catch:**
- Archive command fails
- Git commit fails
- ROADMAP update fails

**Recovery:**
- File lock: Level 1 (retry after 1s)
- Git conflict: Level 2 (show conflict, ask user)
- Serious git issue: Level 3 (manual intervention)

---

## 6. Error Recovery Commands

### Reactive Scan (for ID errors)

**Command:** Already integrated in `idea-logic.md` (lines 47-71)

**Trigger:** User says "ID is wrong" or error detected

**Action:** Global scan → Update cache → Retry

---

### Revise Workflow (for Level 3 escalation)

**Command:** `/kamiflow:dev:revise [ID]`

**When to Use:**
- Hallucination detected
- Scope creep identified
- Need fresh perspective

**What It Does:**
1. Reads error report from previous session
2. Reloads full `PROJECT_CONTEXT.md`
3. Re-verifies all assumptions (Anti-Hallucination Guard)
4. Asks targeted questions based on error type
5. Generates fresh S1-IDEA with error context included

**Integration:** See next section for `revise-logic.md` updates

---

### Force Archive (for cleanup after errors)

**Command:** `node cli-core/bin/kami.js archive [ID] --force`

**When to Use:**
- Task partially complete but blocked
- Need to clean up before restart
- Abandon failed task

**What It Does:**
- Archives incomplete task artifacts
- Frees up `tasks/` directory
- Preserves history in `archive/`

---

## 7. Error Metrics & Monitoring

### Key Metrics to Track

**Error Rate:**
- Total errors per task: Target < 2
- Level 1 (auto-healed): Should be ~60-70% of errors
- Level 2 (user assist): Should be ~20-30% of errors
- Level 3 (escalated): Should be < 10% of errors

**Self-Healing Success Rate:**
- Target: >80% of Level 1 errors resolved automatically
- Measure: (Successful auto-heals) / (Total Level 1 errors)

**Mean Time to Recovery (MTTR):**
- Level 1: < 30 seconds (automated)
- Level 2: < 5 minutes (user decision)
- Level 3: Variable (manual intervention)

**Error Recurrence:**
- Same error type repeating: Indicates need for better self-healing
- Track error patterns over time
- Update self-healing library with new patterns

---

## 8. Error Prevention Strategies

### Proactive Measures

**Phase 0.5: Assumption Verification**
- Prevents 80% of hallucination errors
- Catches file/function errors early
- Reduces cascading failures

**Lock 3: Legacy Code Awareness**
- Prevents duplicate code
- Catches breaking changes early
- Identifies side-effect risks

**Validation Loop (Phase 3B)**
- Catches syntax errors before commit
- Verifies tests pass
- Ensures requirement alignment

### Reactive Measures

**Self-Healing Library**
- Learn from previous errors
- Add new patterns over time
- Improve success rate

**Error Log Analysis**
- Review error patterns weekly
- Identify recurring issues
- Update protocols accordingly

---

## 9. User Communication Guidelines

### Level 1 Errors (Silent Healing)

**User Message:** Minimal or none

**Example:**
```
✅ Auto-corrected TOML syntax error (triple-slash escape)
Continuing...
```

**Rationale:** Don't interrupt flow for routine fixes

---

### Level 2 Errors (Request Help)

**User Message:** Clear context + options

**Example:**
```
⚠️ Validation failed after 3 attempts

Error: Unit test "calculateTotal" failing
Expected: 150
Actual: 140

Attempted Fixes:
1. Re-ran tests → Still failing
2. Checked function logic → Seems correct
3. Verified test data → Data is valid

Options:
A) Show me the test code and I'll debug it
B) Skip this test and document as known issue
C) Pause workflow so I can investigate manually

Recommended: A (I'll review the test logic with you)
```

---

### Level 3 Errors (Escalate)

**User Message:** Comprehensive report + guidance

**Example:**
```
🚨 WORKFLOW ESCALATION: Hallucination Detected

I attempted to reference function `processUserData()` in file
`src/utils/processor.js`, but verification shows:
- File exists: ✅
- Function exists: ❌ (NOT FOUND in codebase)

This suggests I hallucinated this function. I apologize for the error.

Root Cause: Assumed function existed based on file name, without verification.

Recommended Next Steps:
1. Run: /kamiflow:dev:revise [ID] 
   → I'll reload context and re-verify all assumptions
2. OR: If you know the correct function name, let me know and I'll update

Error Report: .kamiflow/errors/2024-01-30_1530-hallucination.md
```

---

## ✅ Success Criteria

**Error Recovery is effective when:**
1. **80%+ errors** resolved without user intervention (Level 1)
2. **<10% errors** escalate to Level 3
3. **Zero cascading failures** (one error doesn't cause 10 more)
4. **Users trust the system** even when errors occur
5. **Error logs provide actionable guidance**

---

## 🔗 Related Protocols

- `@.gemini/rules/anti-hallucination.md` - Prevention of hallucination errors
- `@.gemini/rules/flow-validation.md` - Validation error handling
- `@.gemini/rules/flow-execution.md` - Self-Healing Library reference
- `/kamiflow:dev:revise` command logic (see revise-logic.md)
