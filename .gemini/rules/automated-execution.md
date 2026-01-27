# 🤖 Protocol: Automated Execution (The Validator Loop)
> **Goal:** Ensure code quality and Git hygiene during autonomous execution (`/superlazy`).

## 🛠 The Execution Loop: Execute → Validate → Heal → Report

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
2. Applies a targeted fix (max 3 attempts).
3. **Tip:** Use triple-single-quotes (`'''`) for TOML prompts to avoid escape issues.

### 5. Atomic Exit (Native Mode Only)
Upon successful validation, the system performs a silent cleanup:
1. **Silent Sync:** Auto-updates `PROJECT_CONTEXT.md`, `ROADMAP.md`, and `README.md`.
2. **Unified Commit:** Stages all code and docs into one logical commit.
3. **Auto-Archive:** Moves task artifacts from `tasks/` to `archive/` immediately.

## 🧠 Memory Integration
Successful healing patterns are logged to the "Active Context" in `PROJECT_CONTEXT.md` to improve AI accuracy in future sessions.
