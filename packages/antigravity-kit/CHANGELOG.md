# Changelog — @kamishino/antigravity-kit

## [v1.5.1] - 2026-02-19

### 🏗️ Internal Quality

- **refactor:** Extract shared helpers to `lib/counts.js` and `lib/frontmatter.js`
  - Eliminated ~280 lines of duplication across `status.js`, `dashboard.js`, `doctor.js`
  - Single source of truth for counting, memory checks, frontmatter parsing
- **test:** 44 tests across 11 suites (all passing)
  - Unit tests: frontmatter parsing, conflict detection, relativeTime, countMdFiles
  - E2E tests: `agk init` scaffolding, `agk upgrade` (dry-run/verbose/memory protection)
  - Doctor tests: health check flow, fix commands, trigger conflict detection
- **ci:** GitHub Actions CI pipeline (`agk-ci.yml`)
  - Tests on Node 18, 20, 22 for PRs and pushes
- **ci:** Auto-publish to npm on tag push (`agk-publish.yml`)
- **docs:** 3 Architecture Decision Records (ADRs)
  - ADR-001: Memory system design (.memory/ flat files)
  - ADR-002: Agent trigger architecture (keyword-based)
  - ADR-003: Template-based upgrade strategy (safe-copy)

## [v1.5.0] - 2026-02-19

### ✨ Features

- **feat(agents):** 6-agent specialist system with keyword auto-triggers
  - `architect.md` — architecture, design, refactor (owns decisions + patterns)
  - `planner.md` — planning, roadmap, breakdown (owns context + decisions)
  - `debugger.md` — bugs, errors, root cause analysis (owns anti-patterns)
  - `reviewer.md` — code review, quality checks (owns anti-patterns)
  - `writer.md` — docs, readme, changelog, jsdoc (owns README + CHANGELOG)
  - `shipper.md` — release, deploy, publish, version (owns CHANGELOG + package.json)
  - Each agent has `owns:` metadata for file ownership and `triggers:` for auto-activation
  - `agk init` scaffolds `.agent/agents/` with all 6 templates
  - `agk upgrade` keeps agent files up-to-date

- **feat(dashboard):** Smart dashboard as `agk` default
  - Running `agk` (no args) shows compact status + actionable next steps
  - Shows workflows, agents, memory freshness, guard rails, hooks, sync status

- **feat(cli):** `agk changelog` — view version history from terminal
  - `agk changelog` (latest), `agk changelog N` (last N), `agk changelog --all`

- **feat(cli):** `agk upgrade --verbose` — per-file status with icons
  - ✨ new, 🔄 updated, 🔒 protected (memory), ⏭ up-to-date

- **feat(cli):** `agk upgrade --dry-run` — preview changes without writing files

- **feat(doctor):** Actionable fix commands — each issue shows `Fix: <command>`

- **feat(doctor):** Agent health check — detects trigger keyword conflicts and ownership overlaps

- **feat(init):** Boxed "Getting Started" welcome banner after initialization

- **feat(status):** Memory freshness indicator — relative time ("3h ago", "yesterday")

- **feat(status):** Agent count in status output

### 📝 Technical Details

**New files:** 4 (`dashboard.js`, `changelog.js`, `writer.md`, `shipper.md`)
**Modified files:** 7 (`index.js`, `init.js`, `upgrade.js`, `status.js`, `doctor.js`, + 4 agent templates)
**Agent count:** 6
**CLI commands:** 16 (added `changelog`)
**Breaking Changes:** None — `agk` default changed from `doctor` to `dashboard` (doctor still available via `agk doctor`)

---

## [v1.4.0] - 2026-02-19

### ✨ Features

- **feat(workflows):** Auto-wake + auto-sync in `/develop` and `/kamiflow`
  - Phase 0 (AUTO-WAKE): reads all `.memory/` files silently, shows SESSION RESTORED banner
  - Phase 7 (AUTO-SYNC): writes memory files + commits automatically, shows SESSION SYNCED banner
  - All steps marked `// turbo` — runs without user intervention

- **feat(workflows):** add `/compact` — context window compression
  - Summarize → persist to `.memory/context.md` → continue fresh

- **feat(workflows):** add `/checkpoint` — mid-session save
  - Snapshot to `.memory/`, optional WIP commit, continues immediately

- **feat(workflows):** add `/eval` — self-assessment quality gate
  - Re-read spec vs implementation → score on 4 dimensions → self-correct or escalate

### 📝 Documentation

- **docs:** Full README rewrite for v1.4.0
  - All 12 workflows documented with when-to-use tables
  - Full `agk` CLI command reference (14 commands)
  - Auto-wake/sync behavior explained
  - Cross-PC memory sync guide

### 📝 Technical Details

**New workflow files:** 3 (`compact.md`, `checkpoint.md`, `eval.md`)  
**Modified workflows:** 2 (`develop.md`, `kamiflow.md` — auto bookends)  
**Breaking Changes:** None  
**Workflow count:** 12

---

## [v1.3.0] - 2026-02-19

### ✨ Features

- **feat(cli):** add `agk memory sync` — cross-PC memory sync via git subtree
  - `agk memory sync setup <url>` — configure private git remote
  - `agk memory sync push` — push `.memory/` to remote
  - `agk memory sync pull` — pull `.memory/` from remote (on new PC)
  - `agk memory sync status` — show remote + last sync time
  - Saves `syncRemote` and `lastSync` to `.agent/config.json`

- **feat(workflows):** add `/brainstorm` workflow — Phase 0 ideation
  - Clarify (3 questions) → Diverge (5-10 ideas) → Rate (Feasibility × Impact) → Recommend (top 3)
  - Hands off to `/develop` or `/kamiflow`

- **feat(workflows):** add `/wake` workflow — cross-PC context restore
  - Reads all 4 `.memory/` files and produces a structured session summary
  - Asks to continue or start new task

- **feat(workflows):** add `/debug` workflow — structured debugging
  - Reproduce → Isolate → Hypothesize (3 ranked causes) → Fix → Document

- **feat(workflows):** add `kamiflow.md` to agk templates
  - KamiFlow Sniper Model now scaffolded by `agk init`
  - Added note: _"Non-KamiFlow projects: use `/develop` instead"_

- **feat(workflows):** cross-reference `develop` ↔ `kamiflow`
  - `develop.md` notes KamiFlow users should prefer `/kamiflow`
  - Both workflows now list all 9 workflows in Related Workflows table

### 🔧 Maintenance

- **fix(lint):** remove unused `execSync` import from `memory-sync.js`
- **fix(lint):** remove unused `desc` destructuring in `memory.js`
- **chore:** update `agk memory` status footer to mention sync commands

### 📝 Technical Details

**New Files:** 4 (`scripts/memory-sync.js`, `templates/workflows/brainstorm.md`, `templates/workflows/wake.md`, `templates/workflows/debug.md`, `templates/workflows/kamiflow.md`)  
**Modified Files:** 3 (`scripts/memory.js`, `bin/index.js`, `.agent/workflows/develop.md`, `.agent/workflows/kamiflow.md`)  
**Breaking Changes:** None  
**Workflow count:** 9 (brainstorm, wake, develop, kamiflow, quick-fix, debug, review, release, sync)

---

## [v1.2.0] - 2026-02-19

### ✨ Features

- **feat(cli):** add `agk` CLI router (`bin/index.js`) as the main entry point
  - Smart default: auto-detects init vs doctor based on `.agent/` presence
  - Full subcommand routing: init, status, doctor, upgrade, hooks, memory, info, ci

- **feat(cli):** add `agk status` — quick project summary table
  - Shows workflows, memory, guard rails, git hooks, last memory update

- **feat(cli):** add `agk upgrade` — update installed files from templates
  - mtime-based diff: only updates outdated files
  - Never overwrites `.memory/` (user data protected)
  - `--force` flag to overwrite everything

- **feat(cli):** add `agk memory` — memory management subcommands
  - `agk memory` / `agk memory status` — file sizes, line counts, last updated
  - `agk memory show` — print all memory file contents
  - `agk memory clear` — reset to templates (with confirmation)

- **feat(cli):** add `agk info` — show install details
  - Package name, version, location, npm link status, Node version
  - SSOT rules location and workflow count

- **feat(ci):** add `agk ci` — generate GitHub Actions health check
  - Creates `.github/workflows/ai-health.yml`
  - Runs `agk doctor` on every push and pull request

- **feat(ux):** add ora spinners to `agk init` scaffold loop

- **feat(dogfood):** add dogfooding detection to `agk doctor`
  - Shows `🐕 Dogfooding mode detected` banner when run inside source repo

- **feat(dev):** add `DEV_SETUP.md` and `npm run link` / `npm run unlink` scripts

### 🔧 Maintenance

- **fix(ssot):** set `.gemini/rules/` as SSOT for Antigravity guard rails
  - All commands now check `.gemini/rules/` first, `.agent/rules/` as fallback
- **chore:** add `ora@5` dependency for spinners
- **chore:** add `templates/ci/` directory

### 📝 Technical Details

**New Files:** 8 (`bin/index.js`, `scripts/status.js`, `scripts/upgrade.js`, `scripts/memory.js`, `scripts/info.js`, `scripts/ci.js`, `templates/ci/ai-health.yml`, `DEV_SETUP.md`)  
**Modified Files:** 3 (`bin/init.js`, `scripts/doctor.js`, `package.json`)  
**Breaking Changes:** None

---

## [v1.1.0] - 2026-02-19

### ✨ Features

- **feat(cli):** add health check command (`npx antigravity-kit doctor`)
  - Validates `.agent/workflows/`, `.memory/`, and guard rails
  - Supports both `.agent/rules/` and `.gemini/rules/` locations
  - Colored output with exit codes: 0 (ok), 1 (warnings), 2 (errors)

- **feat(setup):** add interactive setup wizard (`--interactive` / `-i` flag)
  - Guided checkbox selection for workflows, memory system, guard rails
  - Saves config to `.agent/config.json`
  - Only installs selected components

- **feat(memory):** add memory auto-sync via git hooks
  - Install with `npx antigravity-kit install-hooks`
  - Detects significant file changes on commit
  - Prompts to update `.memory/decisions.md`
  - Non-blocking (never fails a commit)

- **feat(init):** fix init to run without requiring `init` argument
  - `node bin/init.js` now scaffolds directly
  - Use `--help` / `-h` for usage info

### 🔧 Maintenance

- **chore:** rename package to `@kamishino/antigravity-kit` (avoid npm collision)
- **chore:** add `inquirer@^8.2.6` dependency for interactive prompts
- **chore:** add `scripts/` to published package files
- **chore:** add `agk` as bin alias for `antigravity-kit`
- **chore:** refactor `init.js` to fix ESLint errors (nested function declarations)

### 📝 Technical Details

**New Files:** 6 (`bin/doctor.js`, `scripts/doctor.js`, `scripts/init-interactive.js`, `scripts/sync-memory.js`, `scripts/install-hooks.js`, `templates/hooks/pre-commit`)  
**Modified Files:** 2 (`bin/init.js`, `package.json`)  
**Breaking Changes:** None (package rename requires reinstall)

---

## [v1.0.0] - 2026-02-17

### ✨ Features

- Initial release of antigravity-kit
- Scaffold AI guard rails, workflows, skills, and memory system
- Project type detection with skill recommendations
- Templates: GEMINI.md, `.gemini/rules/`, `.gemini/skills/`, `.agent/workflows/`, `.memory/`
