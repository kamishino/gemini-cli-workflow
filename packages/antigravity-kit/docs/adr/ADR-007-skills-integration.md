# ADR-007: Skills Integration via skills.sh

**Status:** Accepted
**Date:** 2026-02-21

## Context

AGK Agents define _who_ handles a task (role), but lack _how_ — deep knowledge about specific technologies (Next.js patterns, Prisma schema design, testing strategies). The skills.sh community already provides 150+ curated skill packages.

## Decision

Adopted a **Hybrid Discovery** strategy to connect Agents with Skills:

1. **Explicit linkage** — Agents declare `skills: ["nextjs-best-practices"]` in frontmatter
2. **Project auto-detect** — `agk init` suggests skills based on detected tech stack (reuses existing `SKILL_CATALOG`)
3. **Implicit fallback** — AI scans `.agent/skills/` directory when no explicit link exists

**CLI commands:**

- `agk skills add <name>` — wraps `npx -y skills add <name>`, installs to `.agent/skills/<name>/`
- `agk skills list` — shows installed skills and Agent→Skill links

## Alternatives Considered

| Option                      | Pros                          | Cons                                 |
| :-------------------------- | :---------------------------- | :----------------------------------- |
| Build custom skill repo     | Full control                  | Massive effort, fragmented ecosystem |
| **Wrap skills.sh (chosen)** | 150+ skills, zero maintenance | Depends on npx and third-party       |
| LLM skill selection         | Smart matching                | Slow, requires API keys              |

## Consequences

- AGK leverages the entire skills.sh ecosystem without reinventing the wheel
- Skills install to `.agent/skills/` which is the standard location for Cursor/Windsurf/Antigravity
- Agent frontmatter `skills` field creates a traceable link between roles and knowledge
- `agk init` auto-suggests skills, reducing friction for new users
