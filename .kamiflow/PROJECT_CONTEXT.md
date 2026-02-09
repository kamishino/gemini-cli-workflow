# 🧠 MEMORY BANK: KamiFlow Template

## 1. Project Identity

- **Goal:** A rigorous, opinionated "Operating System" template for Indie Hackers using Gemini CLI + AI IDEs with v2.0 enhanced stability and Cascade-inspired architecture.
- **Current Phase:** Template v2.45.0 (Sync Hub & Intelligence Engine v2.0)
- **Key Tech:** Gemini CLI (TOML Commands), Node.js CLI, Self-Hosted Sync Backend, Docker, GitHub Actions, Windsurf/Cursor, Markdown Protocols, v2.0 Enhanced Protocols.
- **New Capabilities:** Plugin System, Workspace Sync Backend, Automated CI/CD, Performance Caching, Security Hardening, i18n, Hardened Test Suite, Cascade-inspired S1-S4 Integrated Architecture.
- **Tour Completed:** true

## 2. Active Context (The "Now")

> **INTEGRATOR RULE:** Always update all 4 fields (Phase, Last Action, Focus, Next Step) during `/kamiflow:ops:sync`.

- **Last Completed Action:** Implemented Strategic Insight Engine (Task 137) with automated wisdom harvesting.
- **Current Focus:** Finalizing v2.45.0 milestones and preparing for automated documentation sync.
- **Next Step:** Initiate Phase 1 (Idea) for Live Doc Sync (YW4U).

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

## ?? Project Wisdom: Strategic Patterns

### #CLI
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 110 | Alias-First UX | **Alias-First UX:** In a CLI, users often prefer Aliases over original commands. Prioritizing Aliases not only keeps the interface cleaner but also directly guides users on the most efficient usage. | Task 110 |
| 111 | Prefix Strategy for Maintenance | **Prefix Strategy for Maintenance:** Using the `_` prefix combined with hidden commands in Commander.js is an effective strategy for maintaining AI support tools without complicating the end-user experience. | Task 111 |

### #General
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 106 | Data is Steel Evidence | **Data is Steel Evidence:** Optimization without measurement is often just a "feeling". By saving 770 tokens, we have freed up space for approximately 150-200 lines of project code in the AI Context Window. | Task 106 |
| 109 | Regex-Proof Documentation | **Regex-Proof Documentation:** When building automated string replacement systems (like a Transpiler), there must always be an escape mechanism for the documentation itself. Using spaces like `{{ TOKEN }}` is a simple yet highly effective solution to "trick" Regex while remaining AI-readable. | Task 109 |
| 137 | Value Delivered | **Value Delivered:** KamiFlow now has a "Permanent Memory" that improves with every task. | Task 137 |

### #Logic
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 131 | Logic | **Logic:** Stricter MoSCoW rules prevent scope creep in MVP options. | Task 131 |
| 137 | Logic | **Logic:** Using single-quoted heredocs in PowerShell avoids accidental `${}` interpolation. | Task 137 |
| 137 | Pattern | **Pattern:** Category headers in Markdown can be easily parsed using simple split/regex logic without a heavy DB. | Task 137 |

### #Rules
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 105 | Modularization is the Key to Lean | **Modularization is the Key to Lean:** Combining everything into a single file dilutes the context. Separating Mandatory (Core) and Optional (Library) rules is the most optimal strategy for Token Efficiency. | Task 105 |
| 105 | Transpiler needs more flexibility | **Transpiler needs more flexibility:** Upgrading `transpiler.js` to search for files recursively helps organize blueprints more neatly without breaking the Gemini CLI output structure. | Task 105 |
| 107 | Dynamic Verification vs Hardcoding | **Dynamic Verification vs Hardcoding:** Using hardcoded file lists in `sync-docs.js` is a maintenance trap. Switching to search logic based on the `-core.md` suffix helps the system self-adapt when file structures change. | Task 107 |
| 108 | Naming is Architecture | **Naming is Architecture:** Naming conventions are not just for readability but also reflect the layered structure of the system. Separating `main-`, `flow-`, and `std-` helps the AI understand the role of each rule from its name. | Task 108 |

### #Sync
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 131 | Sync | **Sync:** Historical checks ensure we don't repeat the same diagnostic questions twice. | Task 131 |

### #UI
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 137 | Aesthetics | **Aesthetics:** Keeping the Knowledge Base in `PROJECT_CONTEXT.md` makes it a living document for both AI and Humans. | Task 137 |
