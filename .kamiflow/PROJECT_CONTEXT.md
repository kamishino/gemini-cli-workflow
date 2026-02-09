# 🧠 MEMORY BANK: KamiFlow Template

## 1. Project Identity

- **Goal:** A rigorous, opinionated "Operating System" template for Indie Hackers using Gemini CLI + AI IDEs with v2.0 enhanced stability and Cascade-inspired architecture.
- **Current Phase:** Template v2.44.4 (Repository Reorganization & Sync Backend)
- **Key Tech:** Gemini CLI (TOML Commands), Node.js CLI, Self-Hosted Sync Backend, Docker, GitHub Actions, Windsurf/Cursor, Markdown Protocols, v2.0 Enhanced Protocols.
- **New Capabilities:** Plugin System, Workspace Sync Backend, Automated CI/CD, Performance Caching, Security Hardening, i18n, Hardened Test Suite, Cascade-inspired S1-S4 Integrated Architecture.
- **Tour Completed:** true

## 2. Active Context (The "Now")

> **INTEGRATOR RULE:** Always update all 4 fields (Phase, Last Action, Focus, Next Step) during `/kamiflow:ops:sync`.

- **Last Completed Action:** Upgraded Sync Backend to Multi-Device Hub with Secure Web Dashboard (Task 136).
- **Current Focus:** Monitoring Sync Hub stability and project metadata consistency.
- **Next Step:** Restart Sync Backend and verify Dashboard access.

## 3. Knowledge Map (Directory Guide)

### Core Architecture

- **Engine:** `cli-core/` - Main CLI logic and transpiler.
  - `logic/` - Core managers (config, env, agent, transpiler, plugin-manager).
  - `utils/` - Utilities (fs-vault, safe-exec, sanitize, i18n, blueprint-cache, plugin-generator).
  - `schemas/` - Zod validation (plugin-schema, kamirc.schema).
  - `locales/` - i18n translations (en.json, vi.json).
  - `tests/` - Jest test suite with fixtures and mocks.
  - `benchmarks/` - Performance monitoring suite.

### User-Facing

- **Blueprints:** `.gemini/` - Portal to cli-core/.gemini (command definitions, rules, skills).
- **IDE Bridge:** `.windsurf/` - Portal to cli-core/.windsurf (workflows, rules).
- **Sync Backend:** `packages/sync-backend/` - Self-hosted sync backend for private workspace data.
  - `src/` - Express API and SQLite database.
  - Docker configs for deployment (Portainer, Docker Compose).

### DevOps & CI/CD

- **GitHub Actions:** `.github/workflows/` - Automated testing, release, Docker builds.
- **Docker:** `Dockerfile` - Multi-stage production container.
- **Release Config:** `.releaserc.json` - Semantic versioning automation.

### Documentation

- **API Reference:** `docs/API.md` - Full JSDoc documentation.
- **Contributing:** `docs/CONTRIBUTING.md` - Development workflow.
- **ADRs:** `docs/adr/` - Architecture Decision Records.
- **Logs:** `docs/handoff_logs/` - Lazy execution logs.

### Plugin System

- **Plugin Template:** `cli-core/templates/plugin-template/` - Scaffolding for new plugins.
- **Blueprints Registry:** `resources/blueprints/` - Plugin registry and standards.


