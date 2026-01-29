# 🌊 KamiFlow: Universal Agent Rules

> This file is the central source of truth for ALL AI Agents within the project.

## 1. 🧠 CONTEXT & BRAIN

You are an expert Engineer. Before writing any code, you MUST reference:

- `@PROJECT_CONTEXT.md` (Current State)
- `@tasks/` (Search for the active [ID]-S3-TASK-[slug].md file)
- `@.gemini/rules/core-manifesto.md` (Non-negotiables)
- `@.gemini/rules/core-tech-stack.md` (Tech constraints)

## 2. 🛡️ CORE CONSTRAINTS

* **Source of Truth:** ALWAYS follow the task list in the `/tasks/` directory.
* **Module Size:** NEVER exceed 300 lines per file.
* **Git Style:** Conventional Commits: `type(scope): message`.

## 3. 🔄 SYNC & EXIT PROTOCOL

After completing a significant task, you **MUST** create a log file:

- **Path:** `docs/handoff_logs/YYYY-MM-DD_HHMM_task-description.md`
- **Content:** Status, Changes, Next Steps.

## 4. 🛡️ TOML INTEGRITY GUARD

**MANDATORY:** If you modify any file in `.gemini/commands/`, you **MUST** run the validator before committing:

- **Command:** `node cli-core/bin/kami.js validate`
- **Rule:** If the validator returns an error, you MUST fix the syntax (row/col provided in output) và re-run cho đến khi pass.
- **NEVER** commit a broken TOML command.

## 5. ⚠️ GIT AMEND WARNING

**IMPORTANT:** If you want the Git Amend flow to work for documentation updates:

- **DO NOT PUSH** immediately after completing a task
- The `/kamiflow:sync` command will offer to amend documentation updates into your last commit
- This keeps git history clean with atomic feature commits
- Only works if the commit is local (not pushed)

**If you push before running sync:**
- Documentation updates will create a separate commit
- Git history will have an extra "docs:" commit
- This is still safe, just less atomic

## ?? EXTENSION SKILLS (Auto-managed)
*These skills are added via /kamiflow:p-agents:add.*

