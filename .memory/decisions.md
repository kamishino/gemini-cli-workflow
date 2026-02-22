# Architectural Decisions

> Append-only log of significant decisions. AI reads this to understand project rationale.

<!--
FORMAT:
## [YYYY-MM-DD] — [Decision Title]
**Context:** Why this decision was needed.
**Decision:** What was decided.
**Alternatives:** What was considered but rejected.
**Consequences:** Impact on the project.
-->

## [2026-02-19] — Package renamed to @kamishino/antigravity-kit

**Context:** `antigravity-kit` was already taken on npm.
**Decision:** Scoped the package as `@kamishino/antigravity-kit`.
**Alternatives:** Different name entirely (rejected — less clear).
**Consequences:** Users must install with scoped name. `agk` alias unchanged.

## [2026-02-19] — `agk` as primary CLI alias (not `kf`)

**Context:** Needed a short alias for the CLI. `kf` was considered (KamiFlow).
**Decision:** Used `agk` (Antigravity Kit) to avoid coupling with KamiFlow branding.
**Alternatives:** `kf`, `kami`, `ak` (all rejected — too coupled or too generic).
**Consequences:** Clear separation: `agk` = portable kit, `kf` = KamiFlow CLI.

## [2026-02-19] — `.gemini/rules/` as SSOT for Antigravity guard rails

**Context:** Rules existed in both `.agent/rules/` and `.gemini/rules/`.
**Decision:** All `agk` commands check `.gemini/rules/` first, `.agent/rules/` as fallback.
**Consequences:** Clear SSOT. New projects get rules in `.gemini/rules/` by default.

## [2026-02-19] — `/develop` and `/kamiflow` kept as separate workflows

**Context:** Both do the same thing but `/kamiflow` has KamiFlow-specific deps.
**Decision:** Keep both. `/develop` = portable. `/kamiflow` = KamiFlow-native.
**Consequences:** Cross-project portability maintained.

## [2026-02-19] — Memory privacy via private git repo

**Context:** `.memory/` in public repos exposes decisions.
**Decision:** Recommended private git repo approach.
**Consequences:** `agk memory sync` and `agk brain` implemented.

## [2026-02-20] — Centralized Brain with symlink/junction strategy

**Context:** Developers lose memory across machines.
**Decision:** `agk brain` uses a centralized git repo + symlinks (Unix) / junctions (Windows).
**Alternatives:** Cloud API (rejected — needs keys), git subtree (rejected — complex).
**Consequences:** Memory survives across PCs via standard `git push/pull`.

## [2026-02-20] — Agent scoring engine (keyword-based, not LLM)

**Context:** Users don't know which agent to use.
**Decision:** `agk suggest` uses deterministic keyword scoring against agent triggers.
**Alternatives:** LLM classification (rejected — slow, costly, non-deterministic).
**Consequences:** Fast, debuggable agent suggestion without API keys.

## [2026-02-20] — Scaffold generator for agents/workflows/rules

**Context:** Creating agents requires knowing YAML frontmatter format.
**Decision:** `agk scaffold` generates boilerplate with correct structure.
**Consequences:** Consistent structure + `/scaffold` workflow chains CLI with AI content injection.

## [2026-02-21] — Agent Auto-Dispatch via GEMINI.md registry

**Context:** Agents exist but require explicit `@mention` to activate.
**Decision:** `agk agents` injects a registry table into GEMINI.md with trigger keywords. AI reads this and silently adopts agent roles based on message keywords.
**Consequences:** Zero-friction agent activation. `agk init` auto-runs `agk agents`.

## [2026-02-21] — Skills integration via skills.sh (hybrid discovery)

**Context:** Agents lack deep tech knowledge.
**Decision:** `agk skills add` wraps `npx skills add` from skills.sh. Agents declare `skills: []` in frontmatter. `agk init` auto-suggests skills from project detection.
**Alternatives:** Custom skill repo (rejected — massive effort), LLM selection (rejected — slow).
**Consequences:** 150+ community skills available, zero maintenance.

## [2026-02-22] — Golden examples in workflow templates

**Context:** Addy Osmani's AI evals article showed "goldens" anchor AI output quality.
**Decision:** Added collapsible `<details>` golden examples to `/develop` Phase 1 (options format), Phase 2 (blueprint), Phase 3 (task.md).
**Alternatives:** Inline examples without collapsible tags (rejected — clutters workflow).
**Consequences:** AI produces more consistent output anchored to proven formats.

## [2026-02-22] — Test-before-done enforcement across all workflows

**Context:** Addy Osmani's workflow article emphasized tight test-run-fix loops.
**Decision:** Added auto-detect test command table to `validation-loop.md`, explicit test commands to `/develop` Phase 5, and test commands section to GEMINI.md.
**Alternatives:** Manual test running (rejected — too easy to skip).
**Consequences:** AI must run tests before marking any task complete.

## [2026-02-22] — Parallel agent management deferred

**Context:** Addy's "agents need a manager" article describes running 10+ agents in parallel.
**Decision:** Deferred. Antigravity IDE is single-session. Solo dev = review bottleneck.
**Alternatives:** Brief Generator + Git Worktrees (feasible but not needed yet).
**Consequences:** AGK stays focused on sequential orchestration (Sniper Model).

## [2026-02-22] — find-skills install fixed with vercel-labs repo URL

**Context:** `npx -y skills add find-skills` failed — not a standalone npm package.
**Decision:** Use `npx -y skills add https://github.com/vercel-labs/skills --skill find-skills -y`.
**Consequences:** find-skills installs correctly during `agk init`.
