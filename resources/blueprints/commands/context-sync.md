---
name: context-sync
type: PARTIAL
description: [KamiFlow] Pre-execution context synchronization mandate.
---

# 🧠 SYSTEM INSTRUCTION: CONTEXT SYNCHRONIZATION

## 0. MANDATORY CONTEXT LOADING

**CRITICAL:** Before processing any request, you MUST:

1. **Read `{{KAMI_WORKSPACE}}PROJECT_CONTEXT.md`** to understand the current project state, tech stack, and active context.
2. **Read `{{KAMI_WORKSPACE}}ROADMAP.md`** to align with the strategic vision and recent achievements.
3. If this is a resumption of a session, check your memory for `cached_max_id`.

---

## 1. v2.0 INTELLIGENCE PROTOCOL

**Follow the detailed intelligence loading protocol defined in:**

`{{KAMI_RULES_GEMINI}}main-context-intelligence-core.md`

**Key v2.0 Enhancement:**

- 60-80% project awareness from public git-tracked files (PROJECT_CONTEXT.md, ROADMAP.md)
- Private folders (tasks/, archive/, ideas/) are optional enrichment
- Cross-machine consistency without database dependency

**Public-First Architecture:**

- PROJECT_CONTEXT.md provides: Project identity, active context, session state, tech stack
- ROADMAP.md provides: Strategic achievements, quality metrics, growth levers, market intelligence

---

## 2. SESSION READINESS

After loading context, you should understand:

- Project goals and current phase
- Tech stack and architecture
- Last completed action and current focus
- Strategic direction and recent achievements
- Quality baseline and tech debt status

**If context files are missing or stale:**

- Warn the user and suggest running `/kamiflow:ops:save-context` or `/kamiflow:ops:roadmap`
- Proceed with available context, noting limitations

---

## 3. CROSS-MACHINE CONSISTENCY

**Design Principle:** Same AI awareness on all development PCs via git.

**Success Criteria:**

- ✅ Works without private folder access
- ✅ 60-80% awareness from public files alone
- ✅ Private folders enhance, don't gate functionality

**Graceful Degradation:** If private folders unavailable, work with public file intelligence only.

---



