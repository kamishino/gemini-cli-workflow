# 🧠 MEMORY BANK: KamiFlow Template

## 1. Project Identity

- **Goal:** A rigorous, opinionated "Operating System" template for Indie Hackers using Gemini CLI + AI IDEs with v2.0 enhanced stability and Cascade-inspired architecture.
- **Current Phase:** Template v2.39.0 (Cascade Architecture Integration)
- **Key Tech:** Gemini CLI (TOML Commands), Node.js CLI, React Dashboard, Docker, GitHub Actions, Windsurf/Cursor, Markdown Protocols, v2.0 Enhanced Protocols.
- **New Capabilities:** Plugin System, Web Dashboard, Automated CI/CD, Performance Caching, Security Hardening, i18n, Hardened Test Suite, Cascade-inspired S1-S4 Integrated Architecture.
- **Tour Completed:** true

## 2. Active Context (The "Now")

> **INTEGRATOR RULE:** Always update all 4 fields (Phase, Last Action, Focus, Next Step) during `/kamiflow:ops:sync`.

- **Last Completed Action:** Implemented v2.39 Adaptive Workflow features: Step -1 Fast Track Classification, Bridge Output Modes (full/executor/minimal), and S3-BUILD Task Dependency Graph with DEPENDS/BLOCKS/PARALLEL annotations.
- **Current Focus:** Testing and validation of new adaptive workflow features before v2.39.0 release.
- **Next Step:** Test Fast Track classification on a sample lightweight task, then run `/kamiflow:ops:sync` to align project state.

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
