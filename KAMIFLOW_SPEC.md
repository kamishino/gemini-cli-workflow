# KamiFlow — Methodology Specification

> **Version:** 1.0  
> **Status:** Living Document  
> **Author:** Toan H. ([@kamishino](https://github.com/kamishino))  
> **Philosophy:** "Aesthetics + Utility — build software that is beautiful, functional, and minimal."

---

## What is KamiFlow?

KamiFlow is an **AI-first development methodology** for building software with purpose and precision. It was created by an indie builder for their own workflow and evolved into a universal framework for teams who want to harness AI without losing control over quality and intent.

**KamiFlow is not a tool.** It is a set of principles, processes, and mental models. Tools (like AGK for Gemini/Antigravity, or adapters for Cursor/Claude/etc.) are implementations of this spec.

---

## Core Philosophy

| Principle                     | Meaning                                                                    |
| :---------------------------- | :------------------------------------------------------------------------- |
| **Aesthetics + Utility**      | Every artifact — code, doc, prompt — must be both beautiful and functional |
| **Structure over Speed**      | A slow process with intention beats a fast one without direction           |
| **Bias for Action**           | Don't ask permission for obvious fixes. Ship, then refine                  |
| **Simplicity**                | If you can do it in 1 file, don't make 3                                   |
| **AI as Partner, not Oracle** | AI executes your intent; you are the architect                             |

---

## The 3 Locks (Anti-Hallucination Protocol)

These locks prevent AI drift and ensure work is grounded in reality.

### 🔒 Lock 1 — Context Lock

**When:** Start of every session.  
**Action:** Read project memory (context, decisions, patterns) before doing anything.  
**Why:** AI must know where the project is before it can move it forward.

### 🔒 Lock 2 — Schema Lock

**When:** Creating any specification (S2-SPEC).  
**Action:** Define data models and interfaces **before** writing logic.  
**Why:** "Structure governs behavior." Logic built on undefined structure becomes debt.

### 🔒 Lock 3 — Legacy Lock

**When:** Creating any build plan (S3-BUILD).  
**Action:** Search the codebase for existing files and functions before writing new ones.  
**Why:** Duplication is the root of most technical debt in AI-assisted coding.

---

## The Sniper Model (Core Flow)

The primary workflow: transform a raw idea into deployed code through a gated pipeline.

```
S1-IDEA → S2-SPEC → S3-BUILD → EXECUTE → VALIDATE → REFLECT → SYNC
```

### Phase 0: Context Restore (AUTO)

Runs silently at the start of every session. No user input needed.

- Read all memory files
- Show session banner with last task, completed items, and next up
- Fast-track classification: is this a quick fix or full ceremony?

### Phase 1: S1-IDEA (Understand)

**Goal:** Turn ambiguity into a clear, scored set of options.

- **Diagnostic Interview** — 3-5 socratic questions to understand root cause
- **3 Options** — Safe / Balanced⭐ / Ambitious
- **MoSCoW Classification** — Must / Should / Could / Won't Have per option
- **Scoring Matrix** — Market Pain × Feasibility × Stack Alignment
- 🚦 **GATE:** User selects option. No execution without approval.

### Phase 2: S2-SPEC (Specify)

**Goal:** Lock the contract before writing code.

- **Schema-First** — all data models defined before any logic
- **Technical Blueprint** — user stories, API signatures, edge cases, integration points
- 🚦 **GATE:** Spec approved before build plan starts.

### Phase 3: S3-BUILD (Plan)

**Goal:** Create an atomic, executable task list with no ambiguity.

- **Reconnaissance** — search codebase for existing patterns (Legacy Lock)
- **Code Health Pre-Check** — assess target files for AI-readiness before editing
- **Task Breakdown** — specific file paths, anchor points, dependency order
- 🚦 **GATE:** Build plan approved before execution begins.

### Phase 4: Execute

**Goal:** Implement exactly what S3-BUILD specifies. No scope creep.

- Follow task checklist atomically (`[ ]` → `[/]` → `[x]`)
- TDD for high-risk changes: write test first, verify fail, then implement
- Per-subtask validation after each item

### Phase 5: Validate

**Goal:** Prove the implementation is correct, not just running.

| Phase                     | Gate     | What                                       |
| :------------------------ | :------- | :----------------------------------------- |
| **Phase A: Syntax**       | BLOCKING | Lint, type check, compile                  |
| **Phase B: Functional**   | BLOCKING | Unit/integration tests pass                |
| **Phase C: Traceability** | WARNING  | >70% of S2-SPEC requirements covered       |
| **Phase D: Self-Review**  | WARNING  | Fresh-context re-read of all changed files |

**Self-Healing:** If failure → fix → retry (max 3x). Only escalate to human after 3 fails.

### Phase 6: Reflect

**Goal:** Capture learnings before closing the loop.

Quality Gate Checklist (all must pass):

- [ ] Tests pass
- [ ] No lint errors
- [ ] Test coverage maintained or improved
- [ ] Documentation updated
- [ ] No unaddressed TODOs
- [ ] Module size reasonable (< 300 lines)
- [ ] No dead code
- [ ] Code explanation provided and acknowledged by developer

**Explain Your Code:** Before any commit, AI produces:

- What changed (file-by-file)
- How it works (plain English)
- Why this approach (design rationale)
- Edge cases handled

🛑 **DEVELOPER MUST ACKNOWLEDGE** before commit proceeds.

### Phase 7: Sync (AUTO)

Runs automatically after session completes. No permission needed.

- Update context memory with session intelligence
- Log architectural decisions made
- Commit all changes with conventional commit message

---

## The Anti-Debt Mechanisms

Inspired by Addy Osmani's "The 80% Problem" and CodeScene research.

### 1. Fresh-Context Self-Review

Before committing, AI re-reads all changed files with a "reviewer" mindset — checking for abstraction bloat, dead code, assumption errors, and overcomplexity. If issues found → fix and re-validate.

### 2. Dead Code Sweep

Before every commit, systematically remove: commented-out blocks (>3 lines), unused imports, orphaned functions and variables.

### 3. Explain Your Code Gate

Developer must explicitly acknowledge they understand the AI-generated code. This prevents "rubber-stamp" reviews and comprehension debt.

### 4. Code Health Pre-Check

Before editing a file, assess it for AI-readiness:

- File > 300 lines → refactor first
- Multiple responsibilities → split first
- Deep nesting (>3 levels) → simplify first
- High coupling → extra test coverage required

### 5. Coverage Gate

Test coverage cannot decrease after AI-generated changes. New functions must have corresponding tests.

---

## The Memory System

KamiFlow maintains a persistent memory layer that survives across sessions and machines.

```
.memory/
├── context.md        ← Current project state (active work, recent changes)
├── decisions.md      ← Log of all architectural decisions (why, what, alternatives)
├── patterns.md       ← Established conventions and project-specific patterns
└── anti-patterns.md  ← Recurring mistakes to actively avoid
```

**Session Amnesia Prevention:** Memory is restored at the start of every session (Phase 0, Context Lock). This eliminates the AI "forgetting" what was built.

---

## The Agent System

KamiFlow supports **specialist AI agents** that automatically activate based on keywords in the developer's message — no explicit `@mention` needed.

Each agent has:

- A clear **identity** (name, role, expertise)
- A set of **trigger keywords** (e.g., `"bug"`, `"error"` → Debugger Agent)
- Defined **file ownership** (what the agent is responsible for)
- **Behavioral rules** specific to its domain

Example agents: Architect, Debugger, Planner, Reviewer, Tester, Shipper, Security Auditor.

**Agent Auto-Dispatch:** The registry table in the AI system prompt maps keywords to agent files. When triggers match, the AI silently adopts that agent's identity, rules, and behaviors.

---

## AI Behavior Protocol

### The Shu-Ha-Ri Model

| Level             | Mode          | AI Behavior                                 |
| :---------------- | :------------ | :------------------------------------------ |
| **SHU** (Mentor)  | Strict        | Follow standards exactly. No improvisation. |
| **HA** (Partner)  | Collaborative | Discuss trade-offs. Suggest alternatives.   |
| **RI** (Executor) | Autonomous    | High-speed execution. Minimal ceremony.     |

### Non-Negotiables (Always enforced)

- **No Silent Failures** — every async action shows progress
- **No Giant Files** — >300 lines is forbidden; split immediately
- **No Magic** — don't use code you cannot explain
- **Backup First** — never overwrite without a `.bak` or using git
- **Platform Aware** — use correct shell syntax for the OS (PowerShell on Windows ≠ bash)

### Self-Correction Protocol

1. **Track** — maintain error counters per error type each session
2. **Threshold** — if same error type occurs 3+ times → update the AI constitution
3. **Notify** — inform developer of the constitutional update
4. **Prevent** — pattern is now actively avoided in future sessions

---

## Workflow Taxonomy

KamiFlow workflows are slash-command triggered processes:

| Category       | Commands                           | Purpose                                  |
| :------------- | :--------------------------------- | :--------------------------------------- |
| **Core Flow**  | `/develop`, `/kamiflow`            | Full Sniper Model execution              |
| **Quick**      | `/quick-fix`, `/brainstorm`        | Fast track for small changes or ideation |
| **Quality**    | `/review`, `/debug`, `/eval`       | Code review, debugging, self-assessment  |
| **Operations** | `/sync`, `/release`, `/research`   | Memory sync, versioning, exploration     |
| **Session**    | `/wake`, `/checkpoint`, `/compact` | Context management                       |

---

## Tool Adapters (Implementations)

KamiFlow methodology can be adapted to any AI coding tool:

| Tool                     | Adapter                                | Status                      |
| :----------------------- | :------------------------------------- | :-------------------------- |
| Antigravity (Gemini CLI) | **AGK** (`@kamishino/antigravity-kit`) | ✅ Reference Implementation |
| Cursor                   | `CURSOR.md` rules                      | 🔜 Planned                  |
| Claude Code              | `CLAUDE.md` rules                      | 🔜 Planned                  |
| Windsurf                 | `WINDSURF.md` rules                    | 🔜 Planned                  |

### What an adapter must implement:

1. **Memory files** (`.memory/` or equivalent)
2. **Context restore** at session start
3. **Slash command routing** for core workflows
4. **Quality gates** enforced before commit
5. **Agent registry** for auto-dispatch

---

## File Structure Convention

```
<project>/
├── .agent/
│   ├── agents/          ← Agent definition files
│   ├── workflows/       ← Slash command workflow files
│   ├── skills/          ← Installed capability extensions
│   └── hooks/           ← Git hook scripts
├── .gemini/rules/       ← AI guard rails (Antigravity-specific)
├── .memory/             ← Session intelligence (tool-agnostic)
│   ├── context.md
│   ├── decisions.md
│   ├── patterns.md
│   └── anti-patterns.md
├── AGENTS.md            ← Open standard agent registry
└── GEMINI.md            ← AI system instructions (Antigravity-specific)
```

---

## Glossary

| Term                     | Definition                                                                        |
| :----------------------- | :-------------------------------------------------------------------------------- |
| **Sniper Model**         | The core 7-phase workflow: S1→S2→S3→Execute→Validate→Reflect→Sync                 |
| **Gate**                 | A mandatory stop requiring human approval before proceeding                       |
| **Comprehension Debt**   | When developers accept AI code without understanding it                           |
| **Rubber-stamp Review**  | Approving AI changes without actually reviewing them                              |
| **Fast Track**           | Bypassing full Sniper Model for small, low-risk changes                           |
| **Turbo Step**           | A workflow step that can auto-run without user approval                           |
| **AGK**                  | Antigravity Kit — the reference implementation of KamiFlow for Gemini/Antigravity |
| **Session Intelligence** | Knowledge captured during a work session and stored in `.memory/`                 |

---

_KamiFlow — build with purpose, ship with confidence._
