---
name: main-context-intelligence-core
type: RULE_MODULE
description: Core project awareness and Balanced Context Synchronization protocol
group: global
order: 30
parent_rule: main-context-intelligence
is_core: true
---

# 🧠 Context Intelligence Core

## 1. Public-First Architecture
Achieve 60-80% project awareness through git-tracked public files: `PROJECT_CONTEXT.md` and `ROADMAP.md`. Private folders (tasks/, archive/, ideas/) serve as optional enrichment data and are not mandatory for basic operation.

## 2. Balanced Sync Protocol (Conditional Ecosystem Synchronization)

To maintain high context fidelity with minimal management overhead, follow this synchronization logic after every task completion:

### 🟢 A. Standard Sync (Feature/Bug/Refactor)
**Trigger:** Standard tasks that do not modify the core CLI structure, commands, or persona.
**Action:**
1. Update `./.kamiflow/PROJECT_CONTEXT.md` (Active Context & Session State).
2. Update `./.kamiflow/ROADMAP.md` (Strategic Achievements).

### 🔴 B. System Sync (Architecture/Core/System)
**Intent:** Triggered when a task impacts the project's foundational settings, configurators, or organizational structure.

**Examples by Environment:**
- **In KamiFlow Engine (Dogfooding):** Modifications to `cli-core/`, `resources/blueprints/`, or command registries.
- **In Client Applications (Generic):** Modifications to root settings (`package.json`, `.env`), architectural cores (e.g., `src/core/`, `config/`), or major directory reorganization.

**Action:**
1. Perform **Standard Sync** (Context & Roadmap).
2. Execute `kami sync` to trigger `sync-docs.js`, automatically refreshing `GEMINI.md` command lists via Sync Markers.
3. Manually update Persona or System Rules in `GEMINI.md` if they were explicitly modified.

## 3. Session Readiness
All new sessions MUST begin with the `/kamiflow:ops:wake` command to synchronize the AI's internal memory (RAM) with the project's disk-based state.
