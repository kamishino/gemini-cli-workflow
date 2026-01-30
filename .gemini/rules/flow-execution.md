# 🤖 Protocol: Automated Execution (The Validator Loop)
> **Goal:** Ensure code quality and Git hygiene during autonomous execution (`/superlazy`).

## 🛠 The Execution Loop: Execute → Validate → Heal → Report

### 0. Risk Assessment (The Guard)
Before writing any implementation code, assess the risk level:
- **High-Risk Criteria:** Logic modifications, bulk edits, or core utility refactoring.
- **TDD Mandate:** If High-Risk, you MUST create a `.test.js` (or equivalent) FIRST.
- **Fail Verification:** Run the test and ensure it FAILS before implementing the fix.

### 1. Execute
AI performs the requested code changes based on the `S3-BUILD` plan.

### 2. Discovery
AI automatically searches for project-specific validation tools:
- **TypeScript:** `tsconfig.json` → `tsc --noEmit`.
- **Node.js:** `package.json` ["lint"] → `npm run lint`.
- **Python:** `pytest.ini` or `tests/` → `pytest`.
- **Fallback:** Basic syntax check (`node --check` or `python -m py_compile`).

### 3. Validate
AI runs the detected command and captures output.
- **CRITICAL (Blocker):** Syntax errors, failed tests, type mismatches, TOML errors.
- **WARNING (Pass with note):** Style violations, missing comments, unused variables.

### 4. Heal (Self-Correction)
If **CRITICAL** errors are found, the AI:
1. Analyzes the error log (line numbers, error type).
2. Applies a targeted fix using the **Self-Healing Library**:
    - **Regex Fix:** Check for double-escaped slashes (e.g., `///`).
    - **Prototype Fix:** Ensure class methods weren't accidentally deleted during a `replace` call.
    - **Import Fix:** Verify all `require()` statements are present for new logic.
3. **Tip:** Use triple-single-quotes (`'''`) for TOML prompts.

### 5. Strategic Atomic Exit (Native Mode Only)
Upon successful validation, the system performs a high-value cleanup:
1. **Strategic Sync:** Update roadmap using `./.kamiflow/ROADMAP.md`.
2. **Lineage Cleanup:** Identify and archive source idea from `./.kamiflow/ideas/backlog/`.
3. **Unified Commit:** Stage all code and docs.
4. **Auto-Archive:** Move tasks to `./.kamiflow/archive/`.

## 🧠 Memory Integration
Successful healing patterns are logged to the "Active Context" in `PROJECT_CONTEXT.md` to improve AI accuracy in future sessions.
