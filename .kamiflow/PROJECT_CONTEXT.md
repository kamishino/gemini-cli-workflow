# 🧠 MEMORY BANK: KamiFlow Template

## 1. Project Identity

- **Goal:** A rigorous, opinionated "Operating System" template for Indie Hackers using Gemini CLI + AI IDEs with v2.0 enhanced stability and Cascade-inspired architecture.
- **Current Phase:** Template v2.55.0 (Knowledge Intelligence Milestone)
- **Key Tech:** Gemini CLI (TOML Commands), Node.js CLI, Self-Hosted Sync Backend, Docker, GitHub Actions, Windsurf/Cursor, Markdown Protocols, v2.0 Enhanced Protocols.
- **New Capabilities:** Plugin System, Workspace Sync Backend, Automated CI/CD, Performance Caching, Security Hardening, i18n, Hardened Test Suite, Cascade-inspired S1-S4 Integrated Architecture.
- **Tour Completed:** true

## 2. Active Context (The "Now")

> **INTEGRATOR RULE:** Always update all 4 fields (Phase, Last Action, Focus, Next Step) during /kamiflow:ops:sync.

- **Last Completed Action:** Cu?ng ch? d?c Guide (MANDATORY Gate) trong c�c file logic (Task 165), d?m b?o artifacts lu�n d?y d? chi ti?t.
- **Current Focus:** Performance optimization and automated documentation synchronization.
- **Next Step:** Initiate Phase 1 (Idea) for Live Doc Sync (YW4U).

## 3. Knowledge Map (Directory Guide)

### 🏗️ Architecture & Logic Map

- **🧠 Intelligence:** Logic governing ideas, insights, and transpilation.
  - idea-manager.js, insight-manager.js, transpiler.js
- **🛡️ Core Manager:** System-level settings, environment, and credentials.
  - config-manager.js, env-manager.js, credential-manager.js, conflict-resolver.js, layered-resolver.js
- **🔄 Sync Engine:** Logic for multi-device synchronization.
  - sync-manager.js, sync-client.js, sync-daemon.js, sync-setup.js
- **🔧 Operations:** Maintenance, health checks, and archiving.
  - doctor.js, archivist.js, doc-auditor.js, updater.js, installer.js, git-manager.js, file-watcher.js, workspace-index.js, healer.js
- **🧩 Extension System:** Plugin management and swarm execution.
  - plugin-manager.js, agent-manager.js, skill-sync.js, swarm-dispatcher.js, saiyan.js, supersaiyan.js

### 📁 Directory Guide

- **Engine:** cli-core/ - Main CLI logic.
- **Blueprints:** .gemini/ - Portal to core rules/commands.
- **IDE Bridge:** .windsurf/ - IDE workflows.
- **Sync Backend:** packages/sync-backend/ - SQLite Sync Hub.

## 4. Session Intelligence (v2.0)

- **PowerShell Syntax:** Always use single-quoted heredocs (@') to avoid accidental interpolation.
- **Path Anchoring:** Always anchor paths with ./ to prevent drift.
- **Atomic Commits:** Prefer Unified Commit protocol (/ops:sync) over manual git commits.

## 📚 Project Wisdom: Strategic Patterns

### #Logic
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 150 | Native SQLite Performance | **Native SQLite Performance:** Leveraging the built-in node:sqlite module in Node.js 22 provides 10x faster indexing and enables advanced FTS5 features (BM25 ranking, synonyms) while remaining 100% offline and dependency-free. | Task 150 |
| 152 | Global Resource Fallback | **Global Resource Fallback:** For features that depend on non-code assets (templates, icons), implementing a search logic that falls back from Project Local to Global Core ensures portability across different project presets without duplicating files. | Task 152 |
| 154 | Self-Healing Knowledge Architecture | **Self-Healing Knowledge Architecture:** Using file checksums (SHA256) to track moved or renamed artifacts allows the Knowledge Graph to repair itself automatically during system health checks, preventing "Information Rot" and preserving project lineage. | Task 154 |
| 155 | Hybrid Memory Fusion | **Hybrid Memory Fusion:** Combining SQLite FTS5 (BM25) with recursive graph traversal in JavaScript enables "Agentic Recall" that connects semantically distant but relationally close tasks, ensuring architectural consistency over time. | Task 155 |
| 156 | Fact-Check Gate Discipline | **Fact-Check Gate Discipline:** Enforcing a manual confirmation step (Fact-Check Gate) after Phase 1 regardless of confidence score prevents "AI Logic Drift". Requiring a logic explanation (Assumed Answers) ensures transparency and human-in-the-loop validation. | Task 156 |
| 157 | Autonomous Chronicler & Conflict Guard | **Autonomous Chronicler:** An event-driven documentation engine that auto-updates project memory and Wiki files based on user actions. **Conflict Guard** uses Git status to prevent data loss by deferring updates to 'Knowledge Fragments' if files are being edited. | Task 157 |
| 158 | Stylized CLI UX & Visual Width | **Stylized CLI UX:** Implementing "Memory Cards" with box-drawing and color-coding improves information parsing. **Visual Width Handling:** Calculating visual width (not just string length) is essential for perfect box alignment when using Emojis and Unicode characters in the terminal. | Task 158 |

### #UI
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 151 | Hybrid Knowledge UX | **Hybrid Knowledge UX:** Combining Mermaid (for instant terminal context) with Interactive HTML (for deep project-wide exploration) provides the perfect balance between focus and scale, minimizing AI token costs while maximizing insight. | Task 151 |

---
**Tip:** Historical patterns are preserved in `.kamiflow/WISDOM_ARCHIVE.md`.






