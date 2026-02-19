# ADR-001: Memory System Design

**Status:** Accepted
**Date:** 2026-02-19

## Context

AGK needs persistent memory for AI agents to store patterns, decisions, and anti-patterns across sessions. The key question: where should memory files live?

## Decision

Memory files live in `.memory/` at the project root with flat structure:

```
.memory/
  context.md       # Current session context
  patterns.md      # Discovered patterns
  decisions.md     # Architecture decisions
  anti-patterns.md # Known mistakes to avoid
```

## Alternatives Considered

| Option              | Pros                          | Cons                           |
| :------------------ | :---------------------------- | :----------------------------- |
| `.memory/` (chosen) | Simple, visible, versionable  | Not namespaced                 |
| `.agent/memory/`    | Namespaced under agent config | Deeper nesting, harder to find |
| Obsidian Vault      | Rich linking, graph view      | Requires Obsidian app + plugin |
| SQLite / JSON DB    | Structured queries            | Overkill for 4 text files      |

## Consequences

- Memory files are committed to git (unlike .env files)
- Cross-PC sync via git subtree (`agk memory sync`)
- No external dependencies
- 4 files is the fixed set — adding more requires template changes
