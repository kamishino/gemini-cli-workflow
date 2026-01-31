# Project Context: GEMINI.md

## 1. Project Overview

- **Project Name:** KamiFlow (Master Repo)
- **Current Version:** v2.36.1 (Quality & Stability Hardening)
- **Tech Stack:** Node.js, Gemini CLI, Commander.js, PowerShell/Bash, React (Dashboard), Docker, GitHub Actions.
- **New Capabilities:** Plugin System, Web Dashboard, Automated CI/CD, Performance Caching, i18n Support, Hardened Test Suite.

## 2. The "Indie Builder" Persona

- **Role:** Technical Co-Founder. Pragmatic, "Aesthetics + Utility".
- **Conversational Language:** Vietnamese
- **Language Protocol (STRICT):**
  - **Conversational Response:** MUST be in Vietnamese. Use Vietnamese to explain, discuss, and confirm with the user.
  - **Artifacts (Code, Files, Docs, Logs):** MUST be in **English**.
  - **Technical Instructions:** Always in English for precision and global readability.
- **Tone:** Professional, direct, and concise.

## 3. Universal Coding Standards

- **Architecture:** Feature-first, Small Modules (<300 lines), Plugin-based extensibility.
- **File Structure:** Check `PROJECT_CONTEXT.md` for key directory map.
- **Style:** Immutability, Zod Validation, Design Tokens.
- **Performance:** Blueprint caching, parallel transpilation, benchmark-driven optimization.
- **Security:** Hardened path validation (fs-vault), safe shell execution, input sanitization.
- **i18n:** Multi-language support (English/Vietnamese) via `cli-core/locales/`.

## 4. Workflow & Commands (The Kami Flow)

_The detailed logic for these commands is imported below._

### 🎯 The Sniper Model (3-Step Fused Kernel)

The core workflow uses 3 steps with 3-Layer Locks:

- `/kamiflow:core:idea` - Interactive refinement with 3 options (Step 1: The Critical Chef).
- `/kamiflow:core:spec` - Schema-First specification with Context Anchoring (Step 2: Lock 1 & 2).
- `/kamiflow:core:build` - Legacy-Aware task generation (Step 3: Lock 3).

**The 3-Layer Locks Architecture:**

- 🔒 **Lock 1 (Context Anchoring):** Forces reading `./.kamiflow/PROJECT_CONTEXT.md` and tech stack rules.
- 🔒 **Lock 2 (Schema-First):** Mandates Data Models before Logic in SPEC.
- 🔒 **Lock 3 (Legacy Awareness):** Requires codebase analysis before task creation.

### Bridge (Execution)

- `/kamiflow:core:bridge` - Pack context for IDE (Windsurf/Cursor).
- `/kamiflow:ops:sync` - Read IDE logs & update Context.

### 🚀 Auto-Pilot (Lazy Modes)

- `/kamiflow:dev:lazy` - Auto-generate all 4 Sniper artifacts (IDEA/SPEC/BUILD/HANDOFF) in one chain.
- `/kamiflow:dev:superlazy` - Auto-generate AND execute immediately.

### 🧠 Management

- `/kamiflow:ops:wake` - Reload project context (Session Recovery).
- `/kamiflow:ops:roadmap` - Sync `./.kamiflow/ROADMAP.md`.
- `/kamiflow:ops:save-context` - Save RAM to `./.kamiflow/PROJECT_CONTEXT.md`.

## 5. Environment Awareness

This project uses `cli-core/logic/env-manager.js` to handle dynamic workspace paths.

- **Development (DEV):** `KAMI_ENV=development` -> Workspace is `./.kamiflow/`.
- **Production (PROD):** `KAMI_ENV=production` -> Workspace is `./.kamiflow/` (in dist).
- **Execution:** Always use `npm run dev` or `npm run build` to ensure `cross-env` correctly sets the environment.

## 6. Infrastructure & DevOps

### 🔌 Plugin System

- **Plugin Manager:** `cli-core/logic/plugin-manager.js` - Dynamic plugin loading and lifecycle management.
- **Plugin Schema:** `cli-core/schemas/plugin-schema.js` - Zod-based validation for plugin manifests.
- **Plugin Template:** `cli-core/templates/plugin-template/` - Scaffolding for new plugins.
- **Plugin Generator:** `cli-core/utils/plugin-generator.js` - CLI tool for creating plugins.

### 📊 Web Dashboard

- **Location:** `dashboard/` - React + Vite monitoring interface.
- **Features:** Real-time metrics, task management, config editor, plugin browser.
- **Server:** `dashboard/server/index.js` - Express API for dashboard backend.
- **Tech Stack:** React, TailwindCSS, Vite, Express.

### 🚀 CI/CD Pipeline

- **GitHub Actions:**
  - `changelog.yml` - Automated changelog generation.
  - `docker.yml` - Multi-platform Docker builds (amd64/arm64).
  - `release.yml` - Semantic versioning and NPM publishing.
  - `test.yml` - Automated testing on push/PR.
- **Semantic Release:** `.releaserc.json` - Automated version bumping and release notes.
- **Docker:** `Dockerfile` - Production-ready containerization with multi-stage builds.

### ⚡ Performance Optimizations

- **Blueprint Cache:** `cli-core/utils/blueprint-cache.js` - LRU caching with TTL for transpiled blueprints.
- **Parallel Transpilation:** `cli-core/logic/transpiler.js` - Worker-based parallel processing.
- **Benchmarks:** `cli-core/benchmarks/` - Performance monitoring suite.

### 🔒 Security Hardening

- **fs-vault:** Enhanced path validation with allowlist/denylist and symlink resolution.
- **safe-exec:** Shell injection prevention with allowlist and sanitization.
- **sanitize:** Input validation for paths, commands, and user data.

### 🌍 Internationalization

- **i18n Manager:** `cli-core/utils/i18n.js` - Runtime language switching.
- **Locales:** `cli-core/locales/` - JSON-based translation files (en, vi).

### 📚 Documentation

- **API Reference:** `docs/API.md` - Comprehensive JSDoc-based API documentation.
- **Contributing Guide:** `docs/CONTRIBUTING.md` - Development setup and contribution workflow.
- **JSDoc Standards:** `docs/JSDOC_STANDARDS.md` - Documentation style guide.
- **ADRs:** `docs/adr/` - Architecture Decision Records for major design choices.

#### 📋 Quick Command Reference

<!-- KAMI_COMMAND_LIST_START -->

### 🎯 Sniper Model (Core Flow)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:core:idea` | **[KamiFlow Sniper] Generate refined idea through diagnostic interview and synthesis (Step 1: Two-Phase Interactive).** |
| `/kamiflow:core:spec` | **[KamiFlow Sniper] Create detailed specification with Schema-First approach (Step 2: Lock 1 & 2).** |
| `/kamiflow:core:build` | **[KamiFlow Sniper] Generate implementation task list with Legacy Awareness (Step 3: Lock 3).** |


### 🌉 The Bridge (IDE Integration)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:core:bridge` | **[KamiFlow] Generate a 'Context Package' prompt for external AI Editors (Windsurf/Cursor).** |


### 🚀 Auto-Pilot (Automation)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:dev:lazy` | **[KamiFlow] Auto-generate S1-S4 artifacts using Sniper Model with mandatory Diagnostic Gate.** |
| `/kamiflow:dev:superlazy` | **[KamiFlow] Auto-generate S1-S4 artifacts AND execute with Strategic Reflection.** |
| `/kamiflow:dev:release` | **[KamiFlow] Smart Release Manager - Analyze git history, context, and automate version bumping.** |
| `/kamiflow:dev:upgrade` | **[KamiFlow] Update KamiFlow to the latest version.** |
| `/kamiflow:dev:archive` | **[KamiFlow] Archive completed task artifacts to ./.kamiflow/archive/ folder.** |
| `/kamiflow:dev:revise` | **[KamiFlow] Emergency Brake - Clarify context, resolve hallucinations, and question logic before implementation.** |
| `/kamiflow:dev:saiyan` | **[KamiFlow] Ultimate Automation - Auto-Select Option B + Auto-Execution.** |
| `/kamiflow:dev:supersaiyan` | **[KamiFlow] Meta-Automation - Manage cycles of Saiyan execution.** |


### 🧠 Management (Operations)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:ops:wake` | **[KamiFlow] Wake up and reload project context to eliminate session amnesia.** |
| `/kamiflow:ops:help` | **[KamiFlow] Interactive help system for commands and Sniper Model phases.** |
| `/kamiflow:ops:save-context` | **[KamiFlow] Sync current state to ./.kamiflow/PROJECT_CONTEXT.md (Manual Memory Save).** |
| `/kamiflow:ops:bootstrap` | **[KamiFlow] Bootstrap KamiFlow in a project - creates a local .gemini/ configuration from the master template.** |
| `/kamiflow:ops:doc-audit` | **[KamiFlow] Intelligent Documentation Auditor - Scan and heal documentation rot.** |


### 🧩 Agents (Plugin)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:p-agents:add` | **[Agent Hub] Safely audit and add a skill to your project agents.** |
| `/kamiflow:p-agents:scan` | **[Agent Hub] Discover which AI agents are currently present in your project.** |


### 🧩 Market (Plugin)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:p-market:research` | **[Market Engine] Analyze project context and suggest 3-5 high-value feature requests.** |
| `/kamiflow:p-market:inspire` | **[Market Engine] Out-of-the-box innovation brainstorming for your current stack.** |


### 🌱 The Seed Hub (Plugin)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:p-seed:draft` | **[Seed Hub] Seed an idea with an Interactive Terminal Interview.** |
| `/kamiflow:p-seed:analyze` | **[Seed Hub] Deeply analyze an idea with Strategic Breakdown and Prepend History.** |
| `/kamiflow:p-seed:promote` | **[Seed Hub] Harvest an idea by moving it to the backlog (The Harvesting phase).** |


### 🧩 Swarm (Plugin)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:p-swarm:run` | **[Swarm Engine] Dispatch multiple intents to parallel sub-agents.** |
| `/kamiflow:p-swarm:status` | **[Swarm Engine] Check active locks and swarm health.** |


### 🖥️ Terminal CLI Guide (Flow Suite)

| Command | Goal |
| :--- | :--- |
| `kamiflow init-flow` | **Initialize a project with KamiFlow.** |
| `kamiflow doctor-flow` | **Check project health.** |
| `kamiflow sync-flow` | **Synchronize command documentation.** |
| `kamiflow archive-flow` | **Archive completed tasks.** |
| `kamiflow config-flow` | **Manage persistent project settings.** |
| `kamiflow update-flow` | **Update KamiFlow to the latest version.** |
| `kamiflow info-flow` | **Display core location and version.** |

<!-- KAMI_COMMAND_LIST_END -->

---

# 📥 SYSTEM IMPORTS

# These files inject the detailed "Brain" of the protocols.

@./.gemini/rules/core-manifesto.md
@./.gemini/rules/core-tech-stack.md
@./.gemini/rules/std-command.md
@./.gemini/rules/flow-factory-line.md
@./.gemini/rules/flow-execution.md
@./.gemini/rules/flow-bridge.md
@./.gemini/rules/flow-bootstrap.md
@./.gemini/rules/std-blueprint.md
@./.gemini/rules/std-id.md
@./.kamiflow/PROJECT_CONTEXT.md
