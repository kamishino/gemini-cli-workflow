# Changelog — @kamishino/antigravity-kit

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
