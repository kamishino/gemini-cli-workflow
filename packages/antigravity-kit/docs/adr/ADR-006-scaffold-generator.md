# ADR-006: Scaffold Generator for Agents, Workflows, and Rules

**Status:** Accepted
**Date:** 2026-02-20

## Context

Creating a new agent, workflow, or rule requires knowing the correct YAML frontmatter format, directory structure, and file naming conventions. This is error-prone for new users and tedious for experienced ones.

## Decision

Introduced `agk scaffold <type> <name> [description]` — a CLI boilerplate generator.

**Supported types:**

- `agent` → creates `.agent/agents/<slug>.md` with `name`, `description`, `triggers`, `owns` frontmatter
- `workflow` → creates `.agent/workflows/<slug>.md` with `description` frontmatter and step structure
- `rule` → creates `.gemini/rules/<slug>.md` with heading, description, and Good/Bad examples

**Design choices:**

- **Slugification:** `"Database Expert"` → `database-expert.md` (lowercase, spaces to hyphens, special chars removed)
- **No-overwrite guard:** refuses to create if file already exists
- **Directory auto-creation:** `fs.ensureDir()` creates missing directories
- **Companion workflow:** `/scaffold` workflow in templates lets AI run the CLI + auto-fill the content intelligently

## Alternatives Considered

| Option                        | Pros                                | Cons                                       |
| :---------------------------- | :---------------------------------- | :----------------------------------------- |
| **CLI generator (chosen)**    | Fast, no AI required, deterministic | Output is a skeleton, needs manual filling |
| Interactive wizard (inquirer) | Guided experience                   | Slower, heavier dependency                 |
| Copy from existing agent      | No new code                         | Error-prone, no standardization            |

## Consequences

- New agents/workflows/rules follow a consistent structure
- The `/scaffold` workflow chains CLI generation with AI content injection for a fully automated experience
- Template ships via `agk init` / `agk upgrade` — available in all AGK projects
- 7 E2E tests validate slugification, overwrite protection, and correct file placement
