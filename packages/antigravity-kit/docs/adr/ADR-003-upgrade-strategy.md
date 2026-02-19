# ADR-003: Template-Based Upgrade Strategy

**Status:** Accepted
**Date:** 2026-02-19

## Context

AGK ships workflows, agents, and guard rails as template files. When AGK updates, how should user-installed files be updated without losing customizations?

## Decision

`agk upgrade` uses a **safe-copy** strategy:

1. **New files** — copied directly (✨ new)
2. **Unchanged files** — overwritten with latest (🔄 updated)
3. **Memory files** — never touched (🔒 protected)
4. **User-modified files** — overwritten but user warned (⚠️)

Supports `--verbose` (per-file status), `--dry-run` (preview), `--force` (overwrite all).

## Alternatives Considered

| Option                          | Pros                     | Cons                               |
| :------------------------------ | :----------------------- | :--------------------------------- |
| Safe-copy (chosen)              | Simple, predictable      | May overwrite user changes         |
| Git merge / 3-way diff          | Preserves user edits     | Complex, requires version tracking |
| Separate user/ and system/ dirs | Clean separation         | Double the files, confusing        |
| Lock file tracking              | Precise change detection | Additional state to manage         |

## Consequences

- `agk upgrade` is idempotent — safe to run repeatedly
- Memory files (`/memory/`) are always protected
- User must use git to recover overwritten customizations
- `--dry-run` mitigates accidental overwrites
