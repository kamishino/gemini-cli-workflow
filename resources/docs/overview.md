# 🌊 KamiFlow: The Indie Builder's Operating System

> **Philosophy:** "Aesthetics + Utility". Ship fast, break nothing important.

## 🗺️ The Flowchart

This diagram illustrates the lifecycle of a feature in KamiFlow, from raw idea to deployed code.

```mermaid
graph TD
    %% Nodes
    Start((User Idea))

    subgraph Sniper_Phase [🎯 Sniper Model: 3-Step Fused Kernel]
        Flow[/"/kamiflow:dev:flow"/]
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
    Start --> Flow
    Flow --> Idea
    Flow --> Spec
    Flow --> Build

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
    style Flow fill:#f96,stroke:#333,stroke-width:4px
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

## 🛡️ v2.49+ Enhancements: Discipline & Intelligence

KamiFlow v2.49+ introduces high-priority behavioral locks to ensure the AI remains an **Architect**, not just a coder.

### 1. Clarify Score & Recursive Diagnostic

**What:** AI self-assesses its understanding (0-10) before planning.

**Why:** Prevents "Overconfident Hallucinations" where AI guesses the root cause.

**Threshold:** If Score < 8.0, AI is **FORBIDDEN** from solutioning and MUST ask deeper questions.

**Ambiguity Nodes:** AI lists specific files or logic points it finds unclear, providing a feedback loop for the user.

### 2. Confidence Chain & Hard Gates

**What:** Each phase verifies the "Confidence" of its predecessor.

**Why:** Ensures facts agreed upon in Phase 1 are not lost or ignored during Phase 2 or 3.

**Hard Gate:** `/kamiflow:core:spec` will refuse to run if the parent IDEA has a Clarify Score < 8.0.

### 3. Logic Drift Detection

**What:** Real-time verification of Specs against actual Codebase during implementation planning (Phase 3).

**Why:** Detects when a technical plan becomes "out of sync" with reality (e.g., a function mentioned in Spec was deleted).

**Action:** AI triggers an "Emergency Brake" and suggests `/kamiflow:dev:revise`.

### 4. Unified Flow Orchestration (/flow)

**What:** A single entry point that manages the entire S1-S4 lifecycle.

**Why:** Reduces command fatigue and context fragmentation.

**Hybrid Gates:** Allows the user to toggle between Native Autopilot and IDE Handoff at strategic milestones.

### 5. Knowledge Graph & Project Lineage

**What:** A relational SQLite-based index of Task relationships and Wisdom patterns.

**Why:** Enables AI to "remember" why a change was made 3 months ago by tracing the graph of dependencies.

---

## 📊 v2.49 Impact Summary

| Metric                | v1.x   | v2.49+    | Improvement             |
| --------------------- | ------ | --------- | ----------------------- |
| Hallucination Rate    | ~20%   | <2%       | 90% reduction           |
| Validation Pass Rate  | ~70%   | >95%      | First-attempt success   |
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

| Command                 | Goal                                                                                                                           |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `/kamiflow:dev:flow`    | **[KamiFlow Pilot] Unified Flow Orchestrator - Integrates Idea, Spec, Build, and Execution/Handoff in a single gated stream.** |
| `/kamiflow:core:bridge` | **[KamiFlow] Generate a 'Context Package' prompt for external AI Editors (Windsurf/Cursor).**                                  |
| `/kamiflow:core:idea`   | **[KamiFlow Sniper] Generate refined idea through diagnostic interview and synthesis (Step 1: Two-Phase Interactive).**        |
| `/kamiflow:core:spec`   | **[KamiFlow Sniper] Create detailed specification with Schema-First approach (Step 2: Lock 1 & 2).**                           |
| `/kamiflow:core:build`  | **[KamiFlow Sniper] Generate implementation task list with Legacy Awareness (Step 3: Lock 3).**                                |

### 🚀 Auto-Pilot (Automation)

| Command                     | Goal                                                                                                                               |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `/kamiflow:dev:lazy`        | **[KamiFlow] Auto-generate S1-S4 artifacts using Sniper Model with mandatory Diagnostic Gate.**                                    |
| `/kamiflow:dev:superlazy`   | **[KamiFlow] Auto-generate S1-S4 artifacts AND execute with Strategic Reflection.**                                                |
| `/kamiflow:dev:release`     | **[KamiFlow] Smart Release Manager - Generate notes from ROADMAP, analyze git history, automate version bumping (v2.0 Enhanced).** |
| `/kamiflow:dev:archive`     | **[KamiFlow] Export task value to ROADMAP, then archive artifacts (v2.0 Enhanced - Intelligence Preservation).**                   |
| `/kamiflow:dev:revise`      | **[KamiFlow] Emergency Brake - Clarify context, resolve hallucinations, and question logic before implementation.**                |
| `/kamiflow:dev:saiyan`      | **[KamiFlow] Ultimate Automation - Auto-Select Option B + Auto-Execution.**                                                        |
| `/kamiflow:dev:supersaiyan` | **[KamiFlow] Meta-Automation - Manage cycles of Saiyan execution.**                                                                |

### 🧠 Operations (Management)

| Command                      | Goal                                                                                                                             |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `/kamiflow:ops:sync`         | **[KamiFlow] Harmonized Sync: Read logs + Strategic Roadmap Update.**                                                            |
| `/kamiflow:ops:wake`         | **[KamiFlow] Wake up and reload project context to eliminate session amnesia.**                                                  |
| `/kamiflow:ops:help`         | **[KamiFlow] Interactive help system for commands and Sniper Model phases.**                                                     |
| `/kamiflow:ops:resume`       | **[KamiFlow] Resume workflow from last checkpoint without losing context**                                                       |
| `/kamiflow:ops:roadmap`      | **[KamiFlow] Strategic Roadmap Aggregation Engine (v2.0 Enhanced - Incremental Updates & Cross-Machine Consistency).**           |
| `/kamiflow:ops:save-context` | **[KamiFlow] Export session intelligence to ./.kamiflow/PROJECT_CONTEXT.md for cross-machine context recovery (v2.0 Enhanced).** |
| `/kamiflow:ops:advice`       | **[KamiFlow] Strategic Expert Advisor - Provides context-aware system and UX directions.**                                       |
| `/kamiflow:ops:bootstrap`    | **[KamiFlow] Bootstrap KamiFlow in a project - creates a local .gemini/ configuration from the master template.**                |
| `/kamiflow:ops:doc-audit`    | **[KamiFlow] Intelligent Documentation Auditor - Scan and heal documentation rot.**                                              |
| `/kamiflow:ops:insights`     | **[KamiFlow] Display categorized strategic patterns from the project knowledge base.**                                           |

### 🧩 Agents (Plugin)

| Command                   | Goal                                                                            |
| :------------------------ | :------------------------------------------------------------------------------ |
| `/kamiflow:p-agents:add`  | **[Agent Hub] Safely audit and add a skill to your project agents.**            |
| `/kamiflow:p-agents:scan` | **[Agent Hub] Discover which AI agents are currently present in your project.** |

### 🧩 Market (Plugin)

| Command                          | Goal                                                                                                                                |
| :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| `/kamiflow:p-market:research`    | **[Market Engine] Analyze project context and suggest 3-5 high-value feature requests with ROADMAP integration.**                   |
| `/kamiflow:p-market:inspire`     | **[Market Engine] Suggest one highly innovative but plausible feature that could be a game-changer for the current project stack.** |
| `/kamiflow:p-market:analyze-all` | **[Market Engine] Batch analyze all discovery ideas and auto-promote ready ones to backlog.**                                       |

### 🌱 The Seed Hub (Plugin)

| Command                    | Goal                                                                                |
| :------------------------- | :---------------------------------------------------------------------------------- |
| `/kamiflow:p-seed:draft`   | **[Seed Hub] Seed an idea with an Interactive Terminal Interview.**                 |
| `/kamiflow:p-seed:analyze` | **[Seed Hub] Deeply analyze an idea with Strategic Breakdown and Prepend History.** |
| `/kamiflow:p-seed:promote` | **[Seed Hub] Harvest an idea by moving it to the backlog (The Harvesting phase).**  |

### 🧩 Swarm (Plugin)

| Command                    | Goal                                                                 |
| :------------------------- | :------------------------------------------------------------------- |
| `/kamiflow:p-swarm:run`    | **[Swarm Engine] Dispatch multiple intents to parallel sub-agents.** |
| `/kamiflow:p-swarm:status` | **[Swarm Engine] Check active locks and swarm health.**              |

### 🖥️ Terminal CLI Guide (Flow Suite)

| Command            | Goal                                       |
| :----------------- | :----------------------------------------- |
| `kamiflow init`    | **Initialize a project with KamiFlow.**    |
| `kamiflow doctor`  | **Check project health.**                  |
| `kamiflow sync`    | **Synchronize command documentation.**     |
| `kamiflow archive` | **Archive completed tasks.**               |
| `kamiflow config`  | **Manage persistent project settings.**    |
| `kamiflow upgrade` | **Update KamiFlow to the latest version.** |
| `kamiflow info`    | **Display core location and version.**     |
| `kamiflow resume`  | **Resume workflow from last checkpoint.**  |

<!-- KAMI_COMMAND_LIST_END -->
