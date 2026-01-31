# 🧠 MEMORY BANK: KamiFlow Template

## 1. Project Identity

- **Goal:** A rigorous, opinionated "Operating System" template for Indie Hackers using Gemini CLI + AI IDEs.
- **Current Phase:** Template v2.36.0 (Enterprise-Grade Infrastructure)
- **Key Tech:** Gemini CLI (TOML Commands), Node.js CLI, React Dashboard, Docker, GitHub Actions, Windsurf/Cursor, Markdown Protocols.
- **New Capabilities:** Plugin System, Web Dashboard, Automated CI/CD, Performance Caching, Security Hardening, i18n.
- **Tour Completed:** true

## 2. Active Context (The "Now")

> **INTEGRATOR RULE:** Always update all 4 fields (Phase, Last Action, Focus, Next Step) during `/kamiflow:ops:sync`.

- **Last Completed Action:** Infrastructure Modernization (v2.36.0) - Implemented plugin architecture, React dashboard, CI/CD pipeline (semantic-release, Docker), performance optimizations (blueprint caching, parallel transpilation), security hardening (fs-vault, safe-exec, sanitize), i18n support, comprehensive testing suite, and full API documentation.
- **Current Focus:** Plugin ecosystem development and dashboard enhancement for real-time collaboration.
- **Next Step:** Build official plugins for popular frameworks, enhance dashboard with timeline visualization, prepare for community plugin marketplace.

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
- **Dashboard:** `dashboard/` - React monitoring interface.
  - `src/` - React components and pages.
  - `server/` - Express API backend.

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
