# Project Context

> Current project state snapshot. Overwritten at the end of each session via `/sync`.

## Active Work

Building `@kamishino/antigravity-kit` — a portable npm package that scaffolds AI guard rails,
workflows, agents, skills, memory system, and Second Brain into any project. Currently at **v1.9.0**.

The package ships an `agk` CLI with 20+ commands:
`init`, `status`, `doctor`, `upgrade`, `hooks`, `ci`, `memory`, `scaffold`, `agents`, `skills`,
`suggest`, `diff`, `brain`, `changelog`, `info`, `help`, `--version`

## Recent Changes

- **v1.9.0** (2026-02-21) — Skills integration (`agk skills add/list` from skills.sh), hybrid discovery, README major update
- **v1.8.0** (2026-02-21) — Agent Auto-Dispatch (`agk agents`), zero-config agent setup in `agk init`
- **v1.7.0** (2026-02-20) — `agk scaffold` boilerplate generator, `/scaffold` workflow, Documentation Writer agent, ADR 4-6
- **v1.6.0** (2026-02-20) — `agk brain` (Second Brain), `agk suggest`, `agk diff`, `agk memory stats`

## Architecture

- 7 agents: architect, debugger, documentation-writer, planner, reviewer, shipper, writer
- 13 workflows: develop, scaffold, quick-fix, brainstorm, debug, review, sync, release, wake, compact, checkpoint, eval, kamiflow
- 5 rules: anti-hallucination, validation-loop, reflection, error-recovery, fast-track
- 7 ADRs: memory-system, agent-triggers, upgrade-strategy, centralized-brain, agent-runtime, scaffold-generator, skills-integration

## Open Questions

- `agk brain pull` — needs E2E testing on a real second PC
- `agk skills add` — verify npx skills.sh compatibility on all platforms
- Should `agk agents` auto-run after `agk scaffold agent`?
