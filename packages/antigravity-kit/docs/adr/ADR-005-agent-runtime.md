# ADR-005: Agent Runtime and Suggestion Engine

**Status:** Accepted
**Date:** 2026-02-20

## Context

AGK ships multiple specialist agents (architect, debugger, reviewer, etc.), but users don't always know which agent to call for a given task. We needed a way to recommend the right agent based on context.

## Decision

Introduced `agk suggest` — a scoring engine that matches user intent against agent metadata.

**Scoring algorithm** (in `lib/agent-runtime.js`):

- **Exact trigger match** → +10 points (highest weight)
- **Partial trigger match** → +5 points
- **Description keyword match** → +3 points
- **Agent name match** → +2 points
- **File ownership overlap** (via `owns` glob patterns) → +4 points per match

**Two input modes:**

1. `agk suggest "query text"` — scores agents against the query words
2. `agk suggest` (no args) — runs `git diff --name-only`, extracts changed files, and scores agents by file ownership

## Alternatives Considered

| Option                       | Pros                                | Cons                           |
| :--------------------------- | :---------------------------------- | :----------------------------- |
| **Keyword scoring (chosen)** | Fast, no external deps, transparent | May miss semantic meaning      |
| LLM-based classification     | Understands nuance                  | Requires API key, slow, costly |
| Manual agent selection only  | Simple                              | Poor discoverability           |

## Consequences

- Users discover agents they didn't know existed
- `triggers` and `owns` in agent frontmatter become functionally meaningful (not just metadata)
- Scoring is deterministic and debuggable — no black-box AI calls
- Future: scores could be used for automatic agent dispatch in a swarm system
