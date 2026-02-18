# Changelog — @kamishino/antigravity-kit

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
