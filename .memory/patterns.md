# Code Patterns & Conventions

> Discovered patterns in this codebase. AI reads this to maintain consistency.

<!--
FORMAT:
## [Category]
- **Pattern:** Description
- **Example:** `path/to/file.ext` or code snippet
- **When to use:** Context for applying this pattern
-->

## Project Structure

- **Pattern:** Each `agk` command has a script in `scripts/` and is routed via `bin/index.js`
- **Example:** `scripts/status.js` → `case "status"` in `bin/index.js`
- **When to use:** Adding any new `agk` command

- **Pattern:** Templates mirror the target directory structure
- **Example:** `templates/workflows/develop.md` → `.agent/workflows/develop.md`
- **When to use:** Adding new scaffolded files

- **Pattern:** Scripts export `async function run(projectDir)` + `module.exports = { run }`
- **Example:** `scripts/doctor.js`, `scripts/status.js`, `scripts/upgrade.js`
- **When to use:** Every new script — enables both CLI routing and direct invocation

## Naming Conventions

- **Pattern:** Commands use kebab-case for multi-word (e.g. `install-hooks`, `sync-memory`)
- **Pattern:** Scripts named after their command (e.g. `agk memory` → `scripts/memory.js`)
- **Pattern:** Workflow files named after their slash command (e.g. `/brainstorm` → `brainstorm.md`)

## Tech Stack

- **Runtime:** Node.js v22.x
- **Package:** `@kamishino/antigravity-kit` v1.2.0
- **Key deps:** `chalk` (colors), `ora@5` (spinners), `fs-extra` (file ops), `inquirer@8` (prompts)
- **Shell:** PowerShell on Windows — use `;` not `&&`, no Unix syntax
- **Git:** Conventional commits (`feat|fix|chore(scope): description`)
- **Tags:** `antigravity-kit/vX.Y.Z` format for monorepo tagging

## SSOT Rules

- **`.gemini/rules/`** — Primary location for Antigravity guard rails (SSOT)
- **`.agent/rules/`** — Fallback only (non-Gemini AI setups)
- **`.agent/workflows/`** — Slash command workflows for Antigravity IDE
- **`.memory/`** — Session context, decisions, patterns, anti-patterns
- **`.kamiflow/`** — KamiFlow-specific context (this repo only, not portable)

## Workflow Design

- **Pattern:** Workflows use `// turbo` annotation for auto-runnable steps
- **Pattern:** Each workflow ends with a "Related Workflows" table
- **Pattern:** Phases labeled with AntiGravity mode (PLANNING / EXECUTION / VERIFICATION)
- **Pattern:** Strategic gates use `🛑 STOP & WAIT` to force user approval
