# ADR-004: Centralized Memory via AGK Brain

**Status:** Accepted
**Date:** 2026-02-20

## Context

Developers working across multiple machines (home PC, work laptop) lose project memory (`.memory/`) because it lives inside each project's `.gitignore`. We needed a way to sync memory across devices without polluting the project's own git history.

## Decision

Introduced `agk brain` — a centralized git repository that holds `.memory/` directories for all linked projects.

**Mechanism:**

1. `agk brain setup <path>` — registers a local directory as the central brain and runs `git init`.
2. `agk brain link` — moves `.memory/` into `<brain>/<project-name>/`, creates a **symlink** (Unix) or **junction** (Windows) back, and adds `.memory/` to `.gitignore`.
3. `agk brain sync` — auto-commits and pushes the brain repo to a private remote.
4. `agk brain` (status) — dashboard showing all linked projects, line counts, and git status.

**Global config** stored at `~/.agk-config.json` (overridable via `AGK_CONFIG_PATH` env var for testing).

## Alternatives Considered

| Option                        | Pros                                    | Cons                                            |
| :---------------------------- | :-------------------------------------- | :---------------------------------------------- |
| Git subtree per project       | No extra repo                           | Complex merge conflicts, per-project setup      |
| Cloud API (S3/Firebase)       | Real-time sync                          | Requires accounts, API keys, network dependency |
| **Centralized repo (chosen)** | Simple git, works offline, full control | Requires manual `git remote add` once           |

## Consequences

- Memory survives across machines via standard `git push/pull`
- `agk status` shows `🧠 linked to Brain` badge when memory is symlinked
- `Mem Sync` row shows `managed by AGK Brain` instead of warning about missing config
- Junctions on Windows do not require admin privileges
