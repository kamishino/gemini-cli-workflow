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

    subgraph Construction_Phase [🛠 Construction & Execution]
        IdeMode(IDE Mode: Windsurf/Cursor)
        Code[[Coding...]]
        QualityGate{{"Phase 4: Quality Gate"}}
        LogFile(Signal File: logs/*.md)
    end

    subgraph Autopilot_Phase [🚀 Auto-Pilot Mode]
        Lazy{{"/kamiflow:dev:lazy"}}
        SuperLazy{{"/kamiflow:dev:superlazy"}}
        AutoCode[[Auto-Coding...]]
        AutoLog(Signal File: logs/*_superlazy.md)
    end

    subgraph Seed_Hub [🌱 The Seed Hub (Experiments)]
        Draft[/"/kamiflow:seed:draft"/]
        Analyze[/"/kamiflow:seed:analyze"/]
        Promote[/"/kamiflow:seed:promote"/]
        MindSparks((Mind Sparks))
    end

    subgraph Knowledge_Base [🧠 Brain]
        Rules[(Rules & Protocols)]
        Skills[(Skills Library)]
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

## 🧭 Navigation Note

The **Management Commands** (`/kamiflow:ops:roadmap` and `/kamiflow:ops:save-context`) act as your Compass and Save Button. They can (and should) be invoked at **ANY stage** to:

- Check where you are.
- Update progress.
- Sync context before taking a break.

## ⚡ Quick Command Reference

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
| `/kamiflow:dev:archive` | **[KamiFlow] Archive completed task artifacts to archive/ folder.** |
| `/kamiflow:dev:revise` | **[KamiFlow] Emergency Brake - Clarify context, resolve hallucinations, and question logic before implementation.** |


### 🧠 Management (Operations)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:ops:wake` | **[KamiFlow] Wake up and reload project context to eliminate session amnesia.** |
| `/kamiflow:ops:help` | **[KamiFlow] Interactive help system for commands and Sniper Model phases.** |
| `/kamiflow:ops:save-context` | **[KamiFlow] Sync current state to PROJECT_CONTEXT.md (Manual Memory Save).** |
| `/kamiflow:ops:bootstrap` | **[KamiFlow] Bootstrap KamiFlow as a Git Submodule - create portal symlinks and initialize proxy files.** |


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