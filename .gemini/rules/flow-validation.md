---
name: flow-validation
type: RULE
description: Validation Loop protocol for code quality assurance and hallucination prevention
group: execution
order: 50
---

# 🔍 Protocol: The Validation Loop

> **Purpose:** Ensure code quality, prevent regressions, and catch hallucinations before they ship.

---

## 1. The 3-Phase Validation Model

### Phase A: Syntax Validation (BLOCKING)

**Purpose:** Catch syntax errors, type mismatches, and structural issues.

**Validation Steps:**
1. **TOML Files** (if modified):
   - Tool: Built-in TOML validator or `toml-validator`
   - Command: `node cli-core/validators/toml-validator.js <files>`
   - Exit Requirement: Code 0, zero errors

2. **TypeScript Files** (if present):
   - Tool: TypeScript compiler
   - Command: `tsc --noEmit`
   - Exit Requirement: No type errors

3. **JavaScript Files**:
   - Tool: Node.js syntax checker
   - Command: `node --check <file>`
   - Exit Requirement: Valid syntax

4. **Linting** (if configured):
   - Tool: ESLint or project-specific linter
   - Command: `npm run lint` (if script exists)
   - Exit Requirement: No critical errors (warnings acceptable)

**Output Format:**
```
✅ Syntax Validation PASS
- TOML: 3 files validated, 0 errors
- JavaScript: 5 files checked, valid syntax
- Linting: 0 errors, 2 warnings (acceptable)
```

**Failure Handling:**
- If ANY Phase A validation fails → **BLOCK** (proceed to retry logic)
- Log exact error location (file, line, column)
- Suggest fix based on error type

---

### Phase B: Functional Validation (BLOCKING)

**Purpose:** Verify that code actually works as intended.

**Validation Steps:**
1. **Unit Tests** (if TDD applied):
   - Tool: Jest, Mocha, or project test runner
   - Command: `npm test` or `npm run test:unit`
   - Exit Requirement: All tests pass

2. **Integration Tests** (if configured):
   - Tool: Project-specific integration test suite
   - Command: `npm run test:integration`
   - Exit Requirement: All critical tests pass

3. **Smoke Tests** (manual checklist for UI/UX):
   - [ ] Application starts without errors
   - [ ] New feature is accessible
   - [ ] No obvious visual bugs
   - [ ] Console shows no errors

**Output Format:**
```
✅ Functional Validation PASS
- Unit Tests: 12/12 passed
- Integration Tests: 5/5 passed
- Smoke Test: Manual verification complete
```

**Failure Handling:**
- If unit tests fail → **BLOCK** (proceed to retry logic)
- If integration tests fail → **WARNING** (document but may proceed)
- If smoke test fails → **BLOCK** (requires fix)

---

### Phase C: Requirement Traceability (WARNING)

**Purpose:** Ensure implementation matches specification.

**Validation Steps:**
1. **Load S2-SPEC Acceptance Criteria**:
   - Read: `./.kamiflow/tasks/[ID]-S2-SPEC-[slug].md`
   - Extract: All "Acceptance Criteria" from User Stories

2. **Cross-Check S3-BUILD Task Completion**:
   - Read: `./.kamiflow/tasks/[ID]-S3-BUILD-[slug].md`
   - Verify: All tasks marked `[x]` (completed)

3. **Deviation Analysis**:
   - Compare: What was planned vs. what was built
   - Document: Any scope changes or cuts
   - Justify: Why deviations occurred

**Output Format:**
```
⚠️ Requirement Traceability CHECK
- Acceptance Criteria: 8/10 met (2 deferred to future task)
- Task Completion: 15/15 tasks complete
- Deviations:
  * Feature X simplified due to time constraint
  * Feature Y deferred to Task [next-ID]
- Justification: Documented in reflection
```

**Failure Handling:**
- If < 70% criteria met → **WARNING** (proceed but document)
- If tasks incomplete → **BLOCK** (must complete or defer explicitly)

---

## 2. Gate Logic & Decision Tree

```
START: Validation Loop
  ↓
Phase A: Syntax Validation
  ↓
  ├─ PASS → Proceed to Phase B
  └─ FAIL → RETRY (apply Self-Healing, max 3x)
         └─ Still FAIL → BLOCK (escalate to user)
  ↓
Phase B: Functional Validation
  ↓
  ├─ PASS → Proceed to Phase C
  └─ FAIL → RETRY (fix and re-test, max 3x)
         └─ Still FAIL → BLOCK (escalate to user)
  ↓
Phase C: Requirement Traceability
  ↓
  ├─ >= 70% met → PASS WITH NOTES
  └─ < 70% met → WARNING (document deviations)
  ↓
Gate Decision:
  ├─ All PASS or PASS WITH NOTES → Proceed to Phase 4 (Strategic Exit)
  └─ Any BLOCK → STOP, log error, request user intervention
```

---

## 3. Retry Logic & Self-Healing

### Retry Strategy

**Max Attempts:** 3 retries per validation phase

**Retry Pattern:**
1. **Attempt 1:** Execute validation
2. **Attempt 2:** Apply self-healing fix + retry
3. **Attempt 3:** Alternative approach + retry
4. **Escalate:** If still failing, BLOCK and request user help

### Self-Healing Library (Phase A)

**Common Syntax Errors:**

1. **TOML Triple-Slash Escape**:
   - Error: `Invalid escape sequence /`
   - Fix: Replace `/` with `'''` (triple single-quote)
   - Location: TOML prompt fields

2. **Missing Imports**:
   - Error: `ReferenceError: X is not defined`
   - Fix: Add `const X = require('module')` at top of file
   - Location: JavaScript files

3. **Prototype Method Deletion**:
   - Error: `Class method not found`
   - Fix: Check for accidental deletion during replace operation
   - Location: Class definitions

4. **Path Separator Issues**:
   - Error: `ENOENT: no such file or directory`
   - Fix: Use `upath` for cross-platform paths
   - Location: File system operations

**Self-Healing Process:**
1. Parse error message
2. Match error pattern to known fix
3. Apply fix automatically
4. Re-run validation
5. If success → Log healing action, continue
6. If fail → Try next attempt

---

## 4. Validation Report Format

### Standard Report Template

```markdown
# 🔍 Validation Report: Task [ID]

**Timestamp:** [ISO 8601]
**Task:** [ID]-[slug]
**Validator:** KamiFlow Validation Loop

---

## Phase A: Syntax Validation
**Status:** ✅ PASS | ❌ FAIL | 🔄 RETRY

### Results
- TOML Files: [X files, Y errors]
- JavaScript: [X files, Y errors]
- TypeScript: [X files, Y errors]
- Linting: [X errors, Y warnings]

### Self-Healing Applied
- [None] OR [List of automatic fixes applied]

---

## Phase B: Functional Validation
**Status:** ✅ PASS | ❌ FAIL | 🔄 RETRY

### Results
- Unit Tests: [X/Y passed]
- Integration Tests: [X/Y passed]
- Smoke Test: [PASS/FAIL]

### Failed Tests (if any)
- [Test name]: [Reason]
- [Test name]: [Reason]

---

## Phase C: Requirement Traceability
**Status:** ✅ PASS | ⚠️ WARNING

### Coverage
- Acceptance Criteria: [X/Y met] ([Z]%)
- Task Completion: [X/Y complete]

### Deviations
- [Deviation 1]: [Justification]
- [Deviation 2]: [Justification]

---

## 🎯 Final Decision
**GATE STATUS:** [PASS | PASS WITH NOTES | BLOCK]

**Next Action:**
- PASS → Proceed to Phase 4 (Strategic Exit)
- BLOCK → Review error logs, request user intervention
```

---

## 5. Integration Points

### Called By
- `/kamiflow:dev:superlazy` (Phase 3B)
- `/kamiflow:dev:lazy` (after build execution)
- `/kamiflow:core:build` (Phase 4 gate)

### Dependencies
- `@.gemini/rules/flow-execution.md` (Self-Healing Library)
- `cli-core/validators/toml-validator.js` (TOML syntax check)
- `package.json` scripts (test, lint)

### Outputs
- Validation report (console or file)
- Gate decision (PASS/BLOCK/WARNING)
- Self-healing log (if applied)

---

## 6. Performance Considerations

**Optimization:**
- Cache validation results per file (avoid re-validating unchanged files)
- Run syntax checks in parallel
- Skip expensive tests if syntax fails early

**Timeout:**
- Phase A: 30 seconds max
- Phase B: 5 minutes max (tests can be slow)
- Phase C: 10 seconds max (file reading only)

**Total Max Duration:** 6 minutes per validation loop

---

## 7. Error Messages & User Guidance

### When BLOCK Occurs

**User-Facing Message:**
```
❌ Validation BLOCKED

Phase A Syntax Validation failed after 3 attempts.

Error Details:
- File: path/to/file.js:42
- Error: SyntaxError: Unexpected token '}'
- Context: function calculateTotal() {
              return sum }  / ← Missing opening brace

Suggested Fix:
1. Review the error location in path/to/file.js
2. Add missing opening brace before 'return sum'
3. Re-run validation manually: npm run lint

Need Help?
- Run: /kamiflow:dev:revise [ID] to reload context
- Or: Fix manually and re-run validation
```

### When PASS WITH NOTES

**User-Facing Message:**
```
⚠️ Validation PASSED with notes

Phase C: 2 acceptance criteria deferred to future task.

Deferred Items:
- Feature X: Advanced filtering (deferred to Task 105)
- Feature Y: Export to PDF (deferred to Task 106)

This is acceptable. Proceeding to Phase 4.
```

---

## 8. Validation Checklist (Quick Reference)

**Before calling Validation Loop, ensure:**
- [ ] All code changes are saved
- [ ] Git working directory is clean (or changes are staged)
- [ ] Test files exist (if TDD was required)
- [ ] S2-SPEC and S3-BUILD files are accessible

**During Validation Loop:**
- [ ] Phase A passes (syntax clean)
- [ ] Phase B passes (tests green)
- [ ] Phase C completes (traceability documented)
- [ ] Validation report generated

**After Validation Loop:**
- [ ] If PASS → Proceed to Phase 4
- [ ] If BLOCK → Review logs and fix errors
- [ ] If WARNING → Document deviations in reflection

---

## ✅ Success Criteria

**Validation Loop is successful when:**
1. All syntax errors are caught before code ships
2. Failed tests are identified and fixed (or deferred)
3. Scope deviations are documented and justified
4. Self-healing reduces manual intervention to < 20% of cases
5. BLOCK rate is < 10% (90% of tasks pass validation)

---

## 🔗 Related Protocols

- `@.gemini/rules/flow-execution.md` - Self-Healing Library
- `@.gemini/rules/flow-reflection.md` - Phase 4 Strategic Exit
- `@.gemini/rules/error-recovery.md` - Error handling strategies
