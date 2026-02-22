# Code Patterns & Conventions

> Discovered patterns in this codebase. AI reads this to maintain consistency.

## Project Structure

- **Pattern:** Each `agk` command has a script in `scripts/` and is routed via `bin/index.js`
- **Example:** `scripts/status.js` → `case "status"` in `bin/index.js`
- **When to use:** Adding any new `agk` command

- **Pattern:** Templates mirror the target directory structure
- **Example:** `templates/workflows/develop.md` → `.agent/workflows/develop.md`
- **When to use:** Adding new scaffolded files

- **Pattern:** Scripts export `async function run(projectDir)` + `module.exports = { run }`
- **Example:** `scripts/doctor.js`, `scripts/scaffold.js`, `scripts/agents.js`
- **When to use:** Every new script — enables both CLI routing and direct invocation

- **Pattern:** Agent templates in `templates/agents/` must also ship in `templates/GEMINI.md` registry
- **Example:** After adding `documentation-writer.md` to `templates/agents/`, run `agk agents`
- **When to use:** Adding a new default agent to AGK

## Naming Conventions

- **Pattern:** Commands use kebab-case for multi-word (e.g. `install-hooks`, `memory-sync`)
- **Pattern:** Scripts named after their command (e.g. `agk scaffold` → `scripts/scaffold.js`)
- **Pattern:** Agent files use slugified names (e.g. `"Documentation Writer"` → `documentation-writer.md`)
- **Pattern:** Workflow files named after their slash command (e.g. `/develop` → `develop.md`)

## Agent Frontmatter Schema

```yaml
---
name: Agent Name
description: One-line description
triggers: ["keyword1", "keyword2"]
owns: ["src/**", "*.config.*"]
skills: ["nextjs-best-practices"]
---
```

## Tech Stack

- **Runtime:** Node.js v22.x
- **Package:** `@kamishino/antigravity-kit` v1.9.0
- **Key deps:** `chalk@4` (colors), `ora@5` (spinners), `fs-extra@11` (file ops), `inquirer@8` (prompts)
- **Shell:** PowerShell on Windows — use `;` not `&&`, no Unix syntax
- **Git:** Conventional commits (`feat|fix|chore|docs(scope): description`)
- **Tags:** `antigravity-kit/vX.Y.Z` format for monorepo tagging

## SSOT Rules

- **`.gemini/rules/`** — Primary location for guard rails (SSOT)
- **`.agent/agents/`** — Specialist AI agents with Auto-Dispatch
- **`.agent/workflows/`** — Slash command workflows
- **`.agent/skills/`** — Installed skills from skills.sh
- **`.memory/`** — Session context, decisions, patterns, anti-patterns
- **`GEMINI.md`** — System instructions with Agent Registry table

## Workflow Design

- **Pattern:** Workflows use `// turbo` annotation for auto-runnable steps
- **Pattern:** Each workflow ends with a "Related Workflows" table
- **Pattern:** Phases labeled with AntiGravity mode (PLANNING / EXECUTION / VERIFICATION)
