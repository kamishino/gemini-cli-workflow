# Changelog — @kamishino/antigravity-kit

## [v2.11.0] - 2026-02-28

### ✨ Features

#### Agent-Aware AGENTS.md Rendering (SSOT)

- Added `agk agents render` to generate target/model-aware `AGENTS.md` from template fragments.
- New AGENTS templates under `templates/agents-md/` with:
  - shared base instructions,
  - target overlays (`antigravity`, `opencode`, `hybrid`),
  - model overlays (`default`, `codex`).
- Added new renderer library: `lib/agents-md.js`.

#### Safe Registry Updates

- `agk agents` now updates `GEMINI.md` registry and refreshes AGENTS content non-destructively.
- If `AGENTS.md` is user-managed (no AGK markers), AGK now writes `AGENTS.generated.md` instead of overwriting user rules.
- Added `--target` and `--model-profile` support to agent rendering/registration flow.

### 🔧 Improvements

- `agk init` now wires AGENTS profile rendering for OpenCode-only and hybrid targets.
- CLI help and docs updated to reflect new `agk agents render` behavior.
- Stats hints now point users to `agk agents render` when `AGENTS.md` is missing.

### 🧪 Tests

- Added E2E coverage for:
  - OpenCode/hybrid AGENTS profile rendering,
  - preserving custom `AGENTS.md`,
  - force-replacing managed `AGENTS.md`.

### ⚠️ Breaking Changes

- None.

## [v2.9.0] - 2026-02-22

### ✨ Features

#### Golden Examples in Workflows

- `/develop` Phase 1: Golden for 3-options format (Safe/Balanced/Ambitious)
- `/develop` Phase 2: Golden for Technical Blueprint (user stories, API, edge cases)
- `/develop` Phase 3: Golden for task.md checklist format
- Collapsible `<details>` tags so they don't clutter the workflow

#### Test-Before-Done Enforcement

- `validation-loop.md`: Auto-detect test command table (Node/Jest/Vitest/Python/Go/Rust)
- `/develop` Phase 5: Explicit test-run-fix loop with retry
- GEMINI.md: Test commands section with 15/15 mandate

#### New Rule Templates (6/6 Addy Osmani Spec Areas)

- `project-structure.md`: Where source, tests, docs, config live + boundaries
- `git-workflow.md`: Branch naming, conventional commits, PR rules

### 🐛 Fixes

- `init.js`: Fixed find-skills install using full vercel-labs repo URL

## [v2.8.0] - 2026-02-22

### ✨ Features

#### `agk stats` — Project Intelligence Dashboard

- Visual bar charts for agents, workflows, skills, suites, rules, memory.
- Status indicators for GEMINI.md, AGENTS.md, Second Brain link.
- Smart suggestions based on what's missing.

#### Agent Memory System

- `lib/agent-memory.js` — per-agent learning in `.memory/agents/<name>.md`.
- APIs: `readMemory`, `appendLesson`, `listAgentsWithMemory`, `initAllMemory`.
- Sections: Patterns Learned, Common Issues, Preferences.

#### Workflow Chaining

- `lib/workflow-chain.js` — session handoff via `.memory/session.md`.
- `/brainstorm` can auto-feed selected idea into `/develop`.
- APIs: `writeSession`, `readSession`, `clearSession`, `hasSessionFor`.

### 🔧 Improvements

- Enhanced `/brainstorm` workflow with 3 thinking modes, 3-axis scoring, kill switch, and pre-mortem.

## [v2.7.0] - 2026-02-22

### ✨ Features

- `agk suite remove <name>` — cleanly uninstalls a suite, removes unique agents/workflows, preserves shared components.
- `agk doctor` now checks suite health: validates installed suites, detects missing agents/workflows, suggests suites for unmatched projects.

### 🧪 Tests

- 8 new unit tests for project-analyzer and suite lifecycle (15 total tests passing).

## [v2.6.0] - 2026-02-22

### ✨ Features

#### Smart Suite Suggestions Engine

- `agk suggest suite` — deep project analysis with confidence scores and evidence:
  - Scans `package.json` / `pyproject.toml` dependencies (weight: 3x).
  - Detects config files (`next.config.js`, `Dockerfile`, etc.) (weight: 2x).
  - Analyzes directory structure (`src/app`, `prisma/`, `bin/`) (weight: 1x).
  - Multi-suite recommendations — installs complementary suites (e.g., Fullstack + DevOps).
  - Subset dedup — skips React when Fullstack is recommended.
- `agk init` now uses the analyzer for smarter auto-detection.

## [v2.5.0] - 2026-02-22

### ✨ Features

#### 3 New Suites + Specialized Agents (7 suites, 13 agents, 18 workflows total)

- **Mobile Suite**: Mobile Developer agent + `/deploy-mobile` workflow (React Native, Flutter, Expo).
- **Python Suite**: Python Developer agent + `/pytest` workflow (FastAPI, Django, type hints).
- **DevOps Suite**: DevOps Engineer agent + `/deploy` workflow (Docker, K8s, CI/CD).

Each suite bundles specialized agents, skills, workflows, and rules together.

### 📝 Documentation

- Complete README rewrite reflecting all v2.0–v2.5 features.

## [v2.4.0] - 2026-02-22

### ✨ Features

#### Suite Discovery & Export

- `agk suite find <query>` — Search for community suites across built-in templates, npm, and GitHub.
- `agk suite create <name>` — Export the current project into a shareable `suite.json` manifest:
  - Auto-scans agents, skills, workflows, and rules.
  - Detects dependencies (Next.js, Prisma, Express, etc.) for smart detectors.
  - Ready to share with team or publish to GitHub.

## [v2.3.1] - 2026-02-22

### 🔧 Improvements

- `agk init` now auto-detects and installs the best-matching suite for your project.
- Suite scoring: each suite's detectors are matched against detected tech stack, highest score wins.
- Falls back to individual skill discovery only if no suite matches.

## [v2.3.0] - 2026-02-22

### ✨ Features

#### Suite System — Bundled Development Environments

A suite packages agents, skills, workflows, and rules into a single installable unit for a specific tech stack.

- `agk suite available` — Browse 4 built-in suites (React, Fullstack, Backend API, CLI Tool).
- `agk suite add <name>` — One command installs all agents, skills, workflows, and rules for your stack.
- `agk suite list` — Track which suites are installed.

#### Built-in Suites

| Suite           | Agents                                                | Skills                           | Workflows                                |
| :-------------- | :---------------------------------------------------- | :------------------------------- | :--------------------------------------- |
| **React**       | architect, tester, reviewer                           | nextjs, testing                  | develop, test, review                    |
| **Fullstack**   | architect, database-expert, tester, reviewer, shipper | nextjs, database, testing        | develop, test, review, release           |
| **Backend API** | architect, database-expert, security-auditor, tester  | database, security, testing, api | develop, test, review, debug             |
| **CLI Tool**    | architect, tester, documentation-writer, shipper      | testing, nodejs                  | develop, test, review, release, scaffold |

## [v2.2.0] - 2026-02-22

### ✨ Features

#### AGENTS.md — Open Standard Support

- `agk agents` now auto-generates `AGENTS.md` following the [open standard](https://agents.md).
- This file is readable by Copilot, Codex, Jules, Cursor, and other AI tools — making AGK agents cross-IDE portable.

#### Agent Marketplace

- `agk agents find <query>` — Search community agent templates across npm, GitHub, Claude Code Templates, and skills.sh.
- `agk agents list` — View installed agents with descriptions and linked skills.

## [v2.1.0] - 2026-02-22

### ✨ Features

#### Smart Init — Dynamic Skill Discovery

- `agk init` now searches skills.sh **dynamically** for each detected tech in your project.
- Auto-installs top 5 matching skills. Falls back to static `SKILL_CATALOG` if offline.
- `find-skills` meta-skill auto-installed — AI can now discover and install new skills autonomously.

#### Expanded `agk skills` CLI

- `agk skills find <query>` — Search skills.sh by keyword.
- `agk skills check` — Check installed skills for updates.
- `agk skills update` — Update all installed skills.

### 🔧 Improvements

- `agk help` updated with all skills subcommands.
- `agk brain pull` added to help text.

## [v2.0.0] - 2026-02-22

### ✨ Features

#### 3 New Specialist Agents (10 total)

- **Security Auditor**: OWASP Top 10, secret detection, vulnerability scanning, auth review.
- **Database Expert**: Schema-first design, query optimization, migration safety, Prisma support.
- **Tester**: TDD workflow (Red → Green → Refactor), mocking strategies, coverage analysis.

#### 2 New Workflows (15 total)

- **`/research`**: Structured exploration before coding — compare options, create analysis tables, record decisions.
- **`/test`**: TDD workflow — write failing tests, implement, refactor, coverage report.

#### `agk brain pull`

- Clone brain repo from remote on a new PC, auto-re-link `.memory/` junction.
- If brain exists locally, just `git pull --rebase` for latest changes.

#### Smart Memory Sync

- `agk memory sync` now detects if `.memory/` is a symlink/junction to brain repo.
- Automatically redirects to `agk brain sync` — no more running the wrong sync workflow.

### 🔧 Improvements

- `agk help` is now a valid command (was "Unknown command" before).
- Help text includes all commands: `agents`, `skills add/list`, `brain pull`.
- Updated `.memory/` files from v1.2.0 state to current v2.0.0.

## [v1.9.0] - 2026-02-21

### ✨ Features

#### `agk skills` — Community Skills Integration

- **`agk skills add <name>`**: Install skills from [skills.sh](https://skills.sh/) — wraps `npx skills add` under the hood.
- **`agk skills list`**: Show installed skills with descriptions and Agent→Skill links.
- Agents can now declare `skills: ["nextjs-best-practices"]` in frontmatter for explicit linkage.
- `agk init` now suggests `agk skills add` (not `npx skills add`) for detected tech stacks.

### 📝 Documentation

- **README.md**: Major update — added Agents + Auto-Dispatch, Skills, Second Brain, Scaffold sections. Updated file tree and CLI command reference.
- **ADR-007**: Documents hybrid skill discovery strategy (explicit + auto-detect + fallback).

## [v1.8.0] - 2026-02-21

### ✨ Features

#### Agent Auto-Dispatch (`agk agents`)

- New CLI command: `agk agents` scans `.agent/agents/*.md`, reads YAML frontmatter, and injects an **Agent Registry** table into `GEMINI.md`.
- AI assistants now automatically adopt the correct agent role based on trigger keywords in the user's message — no `@mention` required.
- `GEMINI.md` template updated with Auto-Dispatch instructions and `<!-- AGK_AGENT_REGISTRY -->` markers.

#### Zero-Config Agent Setup

- `agk init` now automatically runs `agk agents` after scaffolding, so GEMINI.md ships with a fully populated Agent Registry out of the box.

### 🔧 Improvements

- Updated npm scripts in `package.json` with `agk:*` shortcuts for all major CLI commands.

## [v1.7.0] - 2026-02-20

### ✨ Features

#### `agk scaffold` — Boilerplate Generator

- **`agk scaffold agent <name> [desc]`**: Generate a new agent with YAML frontmatter, identity, rules, and behavior sections.
- **`agk scaffold workflow <name> [desc]`**: Generate a new workflow with step structure.
- **`agk scaffold rule <name> [desc]`**: Generate a new rule with Good/Bad examples.
- Automatically slugifies names (e.g. `"Database Expert"` → `database-expert.md`).
- Prevents accidental overwrites of existing files.

#### `/scaffold` Workflow — AI-Powered Generation

- New workflow shipped in AGK templates: run `/scaffold` in your IDE chat to have AI generate AND fill in the boilerplate automatically.
- Chains `agk scaffold` CLI with AI content injection using project context from `.memory/`.

#### Documentation Writer Agent

- New agent template: `documentation-writer.md` — specialist in creating/updating README, CHANGELOG, ADRs, and all project docs.
- Triggers: `readme`, `docs`, `documentation`, `changelog`, `adr`, `guide`, `tutorial`, `api-docs`.

### 📝 Documentation

- **ADR-004**: Centralized Brain architecture (symlink + git repo strategy)
- **ADR-005**: Agent Runtime scoring engine (keyword matching vs LLM classification)
- **ADR-006**: Scaffold Generator design (CLI boilerplate + /scaffold workflow)

### 🐛 Bug Fixes

- **hooks:** Fixed `agk hooks` ENOENT error — added missing `sync-memory.js` template and corrected file path in `install-hooks.js`.

## [v1.6.0] - 2026-02-20

### 🚀 Major Features

#### 1. AGK Second Brain (`agk brain`)

A powerful new centralized memory management system for multi-device workflows (Option 3).

- **`agk brain setup <path>`**: Initialize a central git repository for all project memories.
- **`agk brain link`**: Move current project's `.memory/` to the brain and create a tracked symlink/junction.
- **`agk brain` (status)**: A unified dashboard showing all linked projects, file sizes, and sync status.
- **`agk brain sync`**: Auto-commit and push all brain changes to your private cloud repository.

#### 2. Agent Intelligence (`agk suggest`)

An intelligent agent recommendation engine based on context.

- Run `agk suggest "my query"` to find the best agent based on keywords, descriptions, and file ownership.
- Run `agk suggest` with no arguments to automatically analyze `git diff` and recommend agents for your uncommitted changes.

#### 3. Template Drift Detection (`agk diff`)

Monitor modifications to your installed AGK templates.

- **`agk diff`**: Compares your local `.agent/`, `.gemini/` and `.memory/` templates against the AGK bundles via MD5 hashing.
- Highlights files that are **identical**, **modified**, **missing**, or **custom**.
- Supports `--json` output for CI/CD integration.

#### 4. Memory Analytics (`agk memory stats`)

Deep insights into your `.memory/` usage.

- Shows total words, line counts, and last modified dates for all memory files.
- Displays staleness warnings if memory context hasn't been updated recently.
- Detects stray or extra files outside the standard memory specification.

### 🐛 Bug Fixes

- **hooks:** Fixed `agk hooks` throwing an ENOENT error due to an unreferenced `sync-memory.js` template.
- **dashboard:** `agk status` now intelligently detects `.memory/` symlinks and renders a `🧠 linked to Brain` badge without throwing remote config errors.
- **core:** Improved regex safety in agent trigger keyword matching.

## [v1.5.1] - 2026-02-19

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
