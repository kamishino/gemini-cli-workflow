# Project Context

> Current project state snapshot. Overwritten at the end of each session via `/sync`.

## Active Work

Building `@kamishino/antigravity-kit` — a portable npm package that scaffolds AI guard rails,
workflows, memory system, and skills into any project. Currently at **v1.2.0**.

The package ships an `agk` CLI with 10 commands:
`init`, `status`, `doctor`, `upgrade`, `hooks`, `ci`, `memory`, `info`, `--help`, `--version`

## Recent Changes

- **v1.2.0 released** (2026-02-19) — Full AGK CLI: agk router, status, upgrade, memory, info, ci
- **v1.1.0 released** (2026-02-19) — doctor, init --interactive, git hooks, ora spinners
- **SSOT fixed** — `.gemini/rules/` is now primary for all commands (doctor, status, upgrade)
- **Smart default fixed** — checks both `.agent/` AND `.gemini/rules/` before deciding init vs doctor
- **New workflows** — `/brainstorm` and `/wake` added to `.agent/workflows/` and templates

## Open Questions

- Should `.memory/` be gitignored by default for privacy? (discussed: private repo approach preferred)
- `agk memory sync` command — push/pull memory to private git repo (planned, not yet built)
- Should `/develop` and `/kamiflow` cross-reference each other? (planned, not yet done)
- `kamiflow.md` not yet added to `agk` templates (planned)

## Technical Debt

- `bin/index.js` JSDoc comment was outdated (fixed this session)
- `.memory/` files were empty templates — never written to (fixed this session via /sync)
- `agk upgrade` only checks 5 workflows (templates had 5) — now 7 after brainstorm + wake added
