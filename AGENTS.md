# AGENTS.md

> Agent-facing engineering guide for `gemini-cli-workflow`.
> Updated: 2026-02-28.
> Focus: build/lint/test commands (especially single-test runs) and code-style conventions.

## 1) Repository Snapshot

- Monorepo manager: `pnpm` workspace (`pnpm-workspace.yaml`).
- Default runtime: Node.js `>=16`; `packages/sync-backend` requires Node.js `>=18`.
- Primary package: `packages/kamiflow-cli` (CLI, transpiler, Jest tests).
- Secondary package: `packages/antigravity-kit` (AGK CLI, `node:test` suite).
- Secondary package: `packages/sync-backend` (Express + SQLite backend).
- Source-of-truth prompt/rule content: `resources/blueprints/**`.
- Generated/transpiled outputs include `.gemini/**` and `dist/**`.

## 2) Important Paths

- `package.json` (root): workspace entry scripts (`build`, `lint`, `test`, `sync`).
- `packages/kamiflow-cli/package.json`: main CLI scripts.
- `packages/kamiflow-cli/jest.config.js`: active Jest config for CLI package.
- `packages/antigravity-kit/package.json`: AGK scripts (`node --test test/*.test.js`).
- `packages/sync-backend/package.json`: backend scripts (`start`, `dev`, `migrate`, `test`).
- `resources/blueprints/STANDARDS.md`: blueprint metadata and formatting contract.
- `.gemini/rules/*.md`: AI workflow and behavior constraints.
- `.agent/agents/*.md`: installed specialist agent definitions.

## 3) Build, Lint, and Test Commands

### 3.1 Root commands (run from repository root)

```bash
pnpm install
pnpm dev
pnpm build
pnpm sync
pnpm transpile
pnpm lint
pnpm lint:fix
pnpm test
pnpm test:coverage
```

- `pnpm test` and `pnpm test:coverage` currently target `gemini-cli-kamiflow`.
- Root lint uses `eslint . --ext .js,.ts`.
- Some legacy docs mention `cli-core/`; current package path is `packages/kamiflow-cli/`.

### 3.2 Package-specific commands

```bash
# Main CLI package (kamiflow-cli)
pnpm --filter gemini-cli-kamiflow run dev
pnpm --filter gemini-cli-kamiflow run build
pnpm --filter gemini-cli-kamiflow run test
pnpm --filter gemini-cli-kamiflow run test:watch
pnpm --filter gemini-cli-kamiflow run test:coverage
pnpm --filter gemini-cli-kamiflow run test:verbose

# Antigravity Kit
pnpm --filter @kamishino/antigravity-kit run build
pnpm --filter @kamishino/antigravity-kit run test

# Sync backend
pnpm --filter @kamiflow/sync-backend run dev
pnpm --filter @kamiflow/sync-backend run start
pnpm --filter @kamiflow/sync-backend run migrate
pnpm --filter @kamiflow/sync-backend run test
```

### 3.3 Single-test quick reference (high priority)

```bash
# Jest (kamiflow-cli): run one test file
pnpm --filter gemini-cli-kamiflow run test -- tests/logic/config-manager.test.js

# Jest (kamiflow-cli): run one named test
pnpm --filter gemini-cli-kamiflow run test -- tests/logic/config-manager.test.js -t "should merge configurations from all layers"

# Node test runner (antigravity-kit): run one file
pnpm --filter @kamishino/antigravity-kit exec node --test test/suite.test.js

# Node test runner (antigravity-kit): run one named test
pnpm --filter @kamishino/antigravity-kit exec node --test --test-name-pattern="detects Next.js" test/suite.test.js

# Jest (sync-backend): run one file pattern (adapt filename as needed)
pnpm --filter @kamiflow/sync-backend run test -- src/database.test.js

# Lint one file quickly
pnpm exec eslint packages/kamiflow-cli/logic/transpiler.js
```

## 4) Code Style Guidelines

### 4.1 Language, modules, imports

- Use CommonJS (`require`, `module.exports`) across source packages.
- Keep imports at top of file unless lazy loading is intentional.
- Group imports as external dependencies first, then internal relative modules.
- In `packages/kamiflow-cli`, prefer `upath` for cross-platform path handling.
- In `packages/antigravity-kit` and `packages/sync-backend`, built-in `path` is standard.
- Reuse existing helpers before creating new ones (`logger`, `sanitize`, `safe-exec`).

### 4.2 Formatting and structure

- Indentation: 2 spaces.
- Quotes: double quotes.
- Semicolons: required by existing style.
- Use trailing commas in multiline arrays/objects/function calls.
- Prefer guard clauses and early returns over deep nesting.
- Keep scope tight; avoid unrelated refactors in focused changes.

### 4.3 Types, validation, contracts

- Codebase is JavaScript-first; use JSDoc for type intent.
- Add JSDoc to public functions/classes and non-obvious logic.
- Use `zod` schemas for config/user/plugin input validation where appropriate.
- Validate all external input (CLI args, env vars, JSON files, HTTP payloads).
- Follow existing schema/sanitizer patterns in `logic/`, `utils/`, and `schemas/`.

### 4.4 Naming conventions

- Files: `kebab-case.js`.
- Variables/functions: `camelCase`.
- Classes: `PascalCase`.
- Constants: `UPPER_SNAKE_CASE`.
- Environment variables: uppercase (`KAMI_ENV`, `KAMI_DEBUG`, `API_KEY`).
- Test files: `*.test.js` under `tests/` or `test/` depending on package.

### 4.5 Error handling and logging

- In `kamiflow-cli`, prefer `packages/kamiflow-cli/utils/logger.js` over raw console output.
- Error messages should be actionable (`what failed` plus `next step`).
- Throw `Error` for unrecoverable failures.
- For expected operational failures, return `false` or `{ success: false, ... }`.
- Do not silently swallow errors unless there is an explicit safe fallback.
- Keep `process.exit(...)` in CLI entrypoints/command layers, not deep utilities.

### 4.6 Testing conventions

- Add or update tests for every behavior change, especially bug fixes.
- Jest packages use `describe`/`it` with explicit `should ...` naming.
- AGK package uses `node:test` plus `assert`.
- Prefer deterministic tests (mock fs/process/network boundaries).
- Reuse helpers in `packages/kamiflow-cli/tests/helpers/*` when applicable.
- Run targeted tests first, then broader suite before finalizing.

## 5) Generated Files and Safe Editing

- Prefer editing source files, not generated outputs.
- For command/rule changes, edit `resources/blueprints/**` first.
- Re-transpile after blueprint/template changes (`pnpm transpile` or `pnpm build`).
- Do not hand-edit `dist/**` unless task explicitly targets release artifacts.
- Avoid editing `node_modules/`, `.git/`, and machine-local cache/state directories.

## 6) Cursor/Copilot Rule Check

- Checked: `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`.
- Result: no Cursor-specific or Copilot-specific instruction files found.
- Therefore, use this file plus `.gemini/rules/**` and local package conventions.

## 7) Installed Specialist Agents

- Installed in `.agent/agents/`: architect, database-expert, debugger, devops-engineer,
  documentation-writer, mobile-developer, planner, python-developer, reviewer,
  security-auditor, shipper, tester, writer.

## 8) Maintenance Notes

- Running `agk agents` may overwrite `AGENTS.md` with a generated registry-only file.
- If that happens, restore this operational guide content.
- Keep command examples aligned with `package.json` scripts when updating this file.
- If package scripts change, update this file in the same PR.
