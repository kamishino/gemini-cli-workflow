---
description: Project Structure — Tell AI where code, tests, and docs live.
---

# Project Structure

> Define where things live so AI agents don't guess.

## Source Code

- `src/` — Application source code
- `lib/` — Shared libraries and utilities

## Tests

- `test/` or `tests/` — Unit and integration tests
- `__tests__/` — Colocated test files (if using Jest)

## Documentation

- `docs/` — Project documentation
- `README.md` — Project overview

## Configuration

- Root directory — Config files (`tsconfig.json`, `package.json`, etc.)
- `.github/` — CI/CD workflows

## Assets

- `public/` — Static assets (images, fonts, icons)

## AI Agent Files

- `.agent/agents/` — AI agent definitions
- `.agent/workflows/` — Slash-command workflows
- `.agent/skills/` — Installed skills
- `.gemini/rules/` — AI behavior rules
- `.memory/` — Persistent session memory

## Boundaries

- 🚫 Never edit: `node_modules/`, `dist/`, `.git/`, vendor files
- ⚠️ Ask first: Adding new top-level directories
- ✅ Always: Follow existing directory conventions
