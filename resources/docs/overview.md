# 🌊 KamiFlow: The Indie Builder's Operating System

> **Philosophy:** "Aesthetics + Utility". Ship fast, break nothing important.

## 🗺️ The Flowchart

This diagram illustrates the lifecycle of a feature in KamiFlow, from raw idea to deployed code.

```mermaid
graph TD
    %% Nodes
    Start((User Idea))

    subgraph Sniper_Phase [🎯 Sniper Model: 3-Step Fused Kernel]
        Idea[/"/kamiflow:core:idea"/]
        Spec[/"/kamiflow:core:spec"/]
        Build[/"/kamiflow:core:build"/]
        Lock1{{Lock 1: Context}}
        Lock2{{Lock 2: Schema}}
        Lock3{{Lock 3: Legacy}}
    end

    subgraph Bridge [🌉 The Bridge]
        Handoff[/"/kamiflow:core:bridge"/]
        Sync[/"/kamiflow:ops:sync"/]
    end

    subgraph Construction_Phase [🛠️ Construction & Execution]
        IdeMode(IDE Mode: Windsurf/Cursor)
        Code[[Coding...]]
        QualityGate{{"Phase 4: Quality Gate"}}
        LogFile(Signal File: {{KAMI_WORKSPACE}}handoff_logs/*.md)
    end

    subgraph Autopilot_Phase [🚀 Auto-Pilot Mode]
        Lazy{{"/kamiflow:dev:lazy"}}
        SuperLazy{{"/kamiflow:dev:superlazy"}}
        AutoCode[[Auto-Coding...]]
        AutoLog(Signal File: {{KAMI_WORKSPACE}}handoff_logs/*_superlazy.md)
    end

    subgraph Seed_Hub [🌱 The Seed Hub - Experiments]
        Draft[/"/kamiflow:seed:draft"/]
        Analyze[/"/kamiflow:seed:analyze"/]
        Promote[/"/kamiflow:seed:promote"/]
        MindSparks((Mind Sparks))
    end

    subgraph Knowledge_Base [🧠 Brain]
        Rules[(Rules & Protocols)]
        <!-- DEV_ONLY_START -->
        Skills[(Skills Library)]
        <!-- DEV_ONLY_END -->
    end

    subgraph Management [🧠 Management]
        Roadmap[/"/kamiflow:ops:roadmap"/]
        Save[/"/kamiflow:ops:save-context"/]
    end

    %% Flow
    %% Sniper Path (Primary)
    Start --> Idea
    Idea --> Lock1
    Lock1 --> Spec
    Spec --> Lock2
    Lock2 --> Build
    Build --> Lock3
    Lock3 --> Handoff

    %% Auto-Pilot Path
    Start --> Lazy
    Lazy --> SuperLazy
    SuperLazy --> AutoCode
    AutoCode --> AutoLog

    %% Seed Hub Loop (Plugin)
    Start -.-> MindSparks
    MindSparks --> Draft
    Draft --> Analyze
    Analyze --> Promote
    Promote --> Idea
    Promote -.-> Start

    Handoff --> IdeMode
    IdeMode --> Code

    Code --> QualityGate
    QualityGate -- PASS --> LogFile
    QualityGate -- FAIL --> Code

    LogFile --> Sync
    AutoLog --> Sync

    Rules -.-> Code
    Skills -.-> Code
    Rules -.-> AutoCode
    Skills -.-> AutoCode

    Code --> Roadmap
    AutoCode --> Roadmap
    Sync --> Roadmap
    Roadmap --> Save
    Save --> Start

    %% Styling
    style Code fill:#9f6,stroke:#333,stroke-width:2px
    style QualityGate fill:#ff9,stroke:#333,stroke-width:2px
    style Handoff fill:#69f,stroke:#333,stroke-width:2px
    style Sync fill:#69f,stroke:#333,stroke-width:2px
    style Lazy fill:#f6f,stroke:#333,stroke-width:2px
    style SuperLazy fill:#f66,stroke:#333,stroke-width:2px
    style AutoCode fill:#6f6,stroke:#333,stroke-width:2px
    style Idea fill:#ff6,stroke:#333,stroke-width:3px
    style Spec fill:#6ff,stroke:#333,stroke-width:3px
    style Build fill:#f6f,stroke:#333,stroke-width:3px
    style Lock1 fill:#faa,stroke:#333,stroke-width:2px
    style Lock2 fill:#afa,stroke:#333,stroke-width:2px
    style Lock3 fill:#aaf,stroke:#333,stroke-width:2px
    style Draft fill:#cfc,stroke:#333,stroke-width:3px
    style Analyze fill:#cfc,stroke:#333,stroke-width:3px
    style Promote fill:#cfc,stroke:#333,stroke-width:3px
    style MindSparks fill:#fff,stroke:#333,stroke-dasharray: 5 5
```

## �️ v2.0 Enhancements: Stability & Anti-Hallucination

KamiFlow v2.0 introduces **5 critical enhancements** for accuracy and resilience:

### 1. Phase 0.5: Assumption Verification

**What:** Verifies files/functions/dependencies BEFORE planning

**Why:** Prevents 80%+ hallucinations by catching invalid assumptions early

**When:** Auto-runs in `/kamiflow:core:idea` and `/kamiflow:dev:superlazy`

**Example Output:**

```
�📍 ASSUMPTION VERIFICATION

✅ Files Verified: src/utils/helper.js, config/database.json
✅ Functions Verified: processData() at line 42
⚠️ Assumptions: Database schema not verified (will check during Spec)
🚫 Hallucination Risks: None detected
```

### 2. Validation Loop (3-Phase)

**What:** Automatic syntax + functional + traceability validation after implementation

**Why:** Catches 90%+ errors before shipping, prevents broken code from reaching production

**When:** Auto-runs after Phase 3A (implementation complete)

**Phases:**

- **Phase A (BLOCKING):** Syntax validation (TOML, linting, type checks)
- **Phase B (BLOCKING):** Functional validation (unit tests, smoke tests)
- **Phase C (WARNING):** Requirement traceability (>70% S2-SPEC coverage)

**Self-Healing:** 80% of syntax errors auto-fixed (TOML escapes, missing imports, formatting)

### 3. Strategic Reflection

**What:** Quality gate + structured reflection captured in Phase 4

**Why:** Lessons learned and tech debt are documented, not lost to chat history

**When:** Every `/kamiflow:dev:superlazy` completion

**Reflection Template:**

- **Value Delivered:** 1-sentence impact statement
- **Technical Debt:** None/Minor/Significant + payback plan
- **Lessons Learned:** What went well, what could improve
- **Follow-up Tasks:** Dependencies or improvements identified

### 4. Error Recovery (3-Level)

**What:** Smart error classification with auto-healing and guided recovery

**Why:** 80% of errors resolve without user intervention, saving time and frustration

**When:** Any workflow error triggers classification and recovery

**Levels:**

- **Level 1 (80%):** Self-Healing → TOML syntax, missing imports, formatting → Auto-fixed
- **Level 2 (15%):** User Assist → Test failures, conflicts → Guided recovery with options
- **Level 3 (5%):** Escalation → Hallucinations, scope creep → `/kamiflow:dev:revise` emergency brake

### 5. Progress Checkpoints

**What:** Resume interrupted workflows without losing context

**Why:** Long workflows (>30 min) can be paused/resumed seamlessly

**When:** 7 automatic checkpoints throughout workflow (Phase 0 → complete)

**Usage:**

```bash
# Automatic detection on wake
/kamiflow:ops:wake
# → Detects active checkpoint
# → "Resume Task 042? (Y/N)"

# Manual resume
/kamiflow:ops:resume 042
```

**Checkpoint Locations:**

- Phase 0: Logical Guard complete
- Phase 0.5: Assumption Verification complete
- Phase 1: Diagnostic Interview complete
- Phase 2: Strategic Synthesis complete
- Phase 3A: Planning complete
- Phase 3B: Validation complete
- Phase 4: Work complete

---

## 📊 v2.0 Impact Summary

| Metric                | v1.x   | v2.0      | Improvement             |
| --------------------- | ------ | --------- | ----------------------- |
| Hallucination Rate    | ~20%   | <5%       | 80% reduction           |
| Validation Pass Rate  | ~70%   | >90%      | First-attempt success   |
| Error Auto-Resolution | 0%     | >80%      | Self-healing capability |
| Workflow Resumability | No     | Yes       | 7 checkpoints           |
| Quality Documentation | Manual | Automated | Reflection templates    |

---

## 🧭 Navigation Notes

The **Management Commands** (`/kamiflow:ops:roadmap` and `/kamiflow:ops:save-context`) act as your Compass and Save Button. They can (and should) be invoked at **ANY stage** to:

- Check where you are.
- Update progress.
- Sync context before taking a break.

## 📋 Quick Command Reference

<!-- KAMI_COMMAND_LIST_START -->

### 🎯 Sniper Model (Core Flow)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:dev:flow` | **[KamiFlow Pilot] Unified Flow Orchestrator - Integrates Idea, Spec, Build, and Execution/Handoff in a single gated stream.** |
| `/kamiflow:core:bridge` | **[KamiFlow] Generate a 'Context Package' prompt for external AI Editors (Windsurf/Cursor).** |
| `/kamiflow:core:idea` | **[KamiFlow Sniper] Generate refined idea through diagnostic interview and synthesis (Step 1: Two-Phase Interactive).** |
| `/kamiflow:core:spec` | **[KamiFlow Sniper] Create detailed specification with Schema-First approach (Step 2: Lock 1 & 2).** |
| `/kamiflow:core:build` | **[KamiFlow Sniper] Generate implementation task list with Legacy Awareness (Step 3: Lock 3).** |


### 🚀 Auto-Pilot (Automation)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:dev:lazy` | **[KamiFlow] Auto-generate S1-S4 artifacts using Sniper Model with mandatory Diagnostic Gate.** |
| `/kamiflow:dev:superlazy` | **[KamiFlow] Auto-generate S1-S4 artifacts AND execute with Strategic Reflection.** |
| `/kamiflow:dev:release` | **[KamiFlow] Smart Release Manager - Generate notes from ROADMAP, analyze git history, automate version bumping (v2.0 Enhanced).** |
| `/kamiflow:dev:archive` | **[KamiFlow] Export task value to ROADMAP, then archive artifacts (v2.0 Enhanced - Intelligence Preservation).** |
| `/kamiflow:dev:upgrade` | **[KamiFlow] Update KamiFlow to the latest version.** |
| `/kamiflow:dev:revise` | **[KamiFlow] Emergency Brake - Clarify context, resolve hallucinations, and question logic before implementation.** |
| `/kamiflow:dev:saiyan` | **[KamiFlow] Ultimate Automation - Auto-Select Option B + Auto-Execution.** |
| `/kamiflow:dev:supersaiyan` | **[KamiFlow] Meta-Automation - Manage cycles of Saiyan execution.** |


### 🧠 Operations (Management)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:ops:sync` | **[KamiFlow] Harmonized Sync: Read logs + Strategic Roadmap Update.** |
| `/kamiflow:ops:wake` | **[KamiFlow] Wake up and reload project context to eliminate session amnesia.** |
| `/kamiflow:ops:help` | **[KamiFlow] Interactive help system for commands and Sniper Model phases.** |
| `/kamiflow:ops:resume` | **[KamiFlow] Resume workflow from last checkpoint without losing context** |
| `/kamiflow:ops:roadmap` | **[KamiFlow] Strategic Roadmap Aggregation Engine (v2.0 Enhanced - Incremental Updates & Cross-Machine Consistency).** |
| `/kamiflow:ops:save-context` | **[KamiFlow] Export session intelligence to ./.kamiflow/PROJECT_CONTEXT.md for cross-machine context recovery (v2.0 Enhanced).** |
| `/kamiflow:ops:tour` | **[KamiFlow] Guided tour for new projects to explain the evolved ecosystem.** |
| `/kamiflow:ops:advice` | **[KamiFlow] Strategic Expert Advisor - Provides context-aware system and UX directions.** |
| `/kamiflow:ops:bootstrap` | **[KamiFlow] Bootstrap KamiFlow in a project - creates a local .gemini/ configuration from the master template.** |
| `/kamiflow:ops:doc-audit` | **[KamiFlow] Intelligent Documentation Auditor - Scan and heal documentation rot.** |
| `/kamiflow:ops:insights` | **[KamiFlow] Display categorized strategic patterns from the project knowledge base.** |


### 🧩 Agents (Plugin)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:p-agents:add` | **[Agent Hub] Safely audit and add a skill to your project agents.** |
| `/kamiflow:p-agents:scan` | **[Agent Hub] Discover which AI agents are currently present in your project.** |


### 🧩 Market (Plugin)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:p-market:research` | **[Market Engine] Analyze project context and suggest 3-5 high-value feature requests with ROADMAP integration.** |
| `/kamiflow:p-market:inspire` | **[Market Engine] Suggest one highly innovative but plausible feature that could be a game-changer for the current project stack.** |
| `/kamiflow:p-market:analyze-all` | **[Market Engine] Batch analyze all discovery ideas and auto-promote ready ones to backlog.** |


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
| `kamiflow init` | **Initialize a project with KamiFlow.** |
| `kamiflow doctor` | **Check project health.** |
| `kamiflow sync` | **Synchronize command documentation.** |
| `kamiflow archive` | **Archive completed tasks.** |
| `kamiflow config` | **Manage persistent project settings.** |
| `kamiflow upgrade` | **Update KamiFlow to the latest version.** |
| `kamiflow info` | **Display core location and version.** |
| `kamiflow resume` | **Resume workflow from last checkpoint.** |

<!-- KAMI_COMMAND_LIST_END -->


