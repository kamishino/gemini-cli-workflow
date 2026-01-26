# 🤖 Protocol: Automated Execution (The Validator Loop)
> **Goal:** Ensure code quality and Git hygiene during autonomous execution (`/superlazy`).

## 🛠 The Execution Loop

### 1. Execute
AI performs the requested code changes based on the `S3-BUILD` plan.

### 2. Discover
AI automatically searches for project-specific validation tools (e.g., `npm test`, `tsc`, `pytest`, `eslint`).

### 3. Validate
AI runs the detected command and captures the output. 
- **Critical Errors:** Syntax errors, failed tests, type mismatches.
- **Warnings:** Format issues, minor lint warnings.

### 4. Heal (Self-Correction)
If **Critical Errors** are found, the AI:
1. Analyzes the error log.
2. Identifies the root cause.
3. Applies a targeted fix.
4. Restarts the validation (Max 3 attempts).

### 5. Report & Commit
- **Success:** AI commits the code and provides a summary of the healing process.
- **Failure:** If errors persist after 3 attempts, AI stops and notifies the user **without committing**.

### 6. Atomic Exit (Native Mode Only)
If the task is being executed via **Native Executor** (e.g., `/superlazy`), the AI will automatically:
1.  **Silent Sync:** Update `PROJECT_CONTEXT.md`, `docs/ROADMAP.md`, and `README.md` showcase without prompting.
2.  **Unified Commit:** Create a single commit containing both implementation and documentation updates.
3.  **Autonomous Archive:** Move all task artifacts (`tasks/` and `handoff_logs/`) to the `archive/` folder immediately.

## 🧠 Memory Integration
Successful healing patterns are logged to `PROJECT_CONTEXT.md` to prevent repetitive mistakes in future sessions.
