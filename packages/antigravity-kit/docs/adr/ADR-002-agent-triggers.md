# ADR-002: Agent Trigger Architecture

**Status:** Accepted
**Date:** 2026-02-19

## Context

AGK agents need to activate based on user intent. How should agents be selected?

## Decision

Keyword-based triggers defined in YAML frontmatter. No runtime — agents are markdown prompts that AI tools read and follow.

```yaml
---
name: debugger
triggers: [bug, error, crash, failing]
owns:
  - .memory/anti-patterns.md
---
```

## Alternatives Considered

| Option                    | Pros                            | Cons                             |
| :------------------------ | :------------------------------ | :------------------------------- |
| Keyword triggers (chosen) | Simple, transparent, no runtime | No guarantee AI follows protocol |
| Runtime agent dispatch    | Guaranteed routing              | Requires custom runtime, complex |
| Slash commands per agent  | Explicit activation             | User must remember commands      |
| LLM-based routing         | Smart intent matching           | Black box, unpredictable         |

## Consequences

- Agents are just markdown files — portable across any AI IDE
- `owns:` field provides file ownership hints but no enforcement
- `agk doctor` detects trigger conflicts but can't prevent them at runtime
- AI compliance depends on prompt quality, not infrastructure
