# 🌊 KamiFlow: The Indie Builder's Operating System

> **Philosophy:** "Aesthetics + Utility". Ship fast, break nothing important.

## 🗺️ The Flowchart

This diagram illustrates the lifecycle of a feature in KamiFlow, from raw idea to deployed code.

```mermaid
graph TD
    %% Nodes
    Start((User Idea))

    subgraph Strategy_Phase [🚀 Phase 1: Strategy]
        Input[/"/kamiflow:input"/]
        Cook{{"/kamiflow:cook"}}
        MVP[/"/kamiflow:mvp"/]
        Trash(Backlog/Trash)
    end

    subgraph Sniper_Phase [🎯 Sniper Model: 3-Step Fused Kernel]
        Idea[/"/kamiflow:idea"/]
        Spec[/"/kamiflow:spec"/]
        Build[/"/kamiflow:build"/]
        Lock1{{Lock 1: Context}}
        Lock2{{Lock 2: Schema}}
        Lock3{{Lock 3: Legacy}}
    end

    subgraph Factory_Phase [🏭 Phase 2: Factory Line]
        Brief[/"/kamiflow:brief"/]
        PRD[/"/kamiflow:prd"/]
        Tasks[/"/kamiflow:task"/]
    end

    subgraph Bridge [🌉 The Bridge]
        Handoff[/"/kamiflow:bridge"/]
        Sync[/"/kamiflow:sync"/]
    end

    subgraph Construction_Phase [🛠 Phase 3: Construction]
        Mode{Select Tool}
        GeminiMode(Gemini Mode: Shu/Ha/Ri)
        IdeMode(IDE Mode: Windsurf/Cursor)
        Code[[Coding...]]
        QualityGate{{"Phase 4: Quality Gate"}}
        LogFile(Signal File: logs/*.md)
    end

    subgraph Autopilot_Phase [🚀 Auto-Pilot Mode]
        Lazy{{"/kamiflow:lazy"}}
        SuperLazy{{"/kamiflow:superlazy"}}
        AutoCode[[Auto-Coding...]]
        AutoLog(Signal File: logs/*_superlazy.md)
    end

    subgraph Knowledge_Base [🧠 Brain]
        Rules[(Rules & Manifesto)]
        Skills[(Skills Library)]
    end

    subgraph Management [🧠 Management]
        Roadmap[/"/kamiflow:update-roadmap"/]
        Save[/"/kamiflow:save-context"/]
    end

    %% Flow
    Start --> Input
    Input --> Cook
    Cook -- NO GO --> Trash
    Cook -- GO --> MVP

    %% Sniper Path (NEW)
    Start --> Idea
    Idea --> Lock1
    Lock1 --> Spec
    Spec --> Lock2
    Lock2 --> Build
    Build --> Lock3
    Lock3 --> Handoff

    %% Traditional Path (Legacy)
    MVP --> Brief
    Brief --> PRD
    PRD --> Tasks
    Tasks --> Handoff

    %% Auto-Pilot Path
    MVP --> Lazy
    Lazy --> SuperLazy
    SuperLazy --> AutoCode
    AutoCode --> AutoLog

    Handoff --> Mode
    Mode --> GeminiMode
    Mode --> IdeMode

    GeminiMode --> Code
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
    Save --> Mode

    %% Styling
    style Cook fill:#f96,stroke:#333,stroke-width:2px
    style Trash fill:#ccc,stroke:#333,stroke-dasharray: 5 5
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
```

## 🧭 Navigation Note

The **Management Commands** (`/kamiflow:update-roadmap` and `/kamiflow:save-context`) act as your Compass and Save Button. They can (and should) be invoked at **ANY stage** to:

- Check where you are.
- Update progress.
- Sync context before taking a break.

## ⚡ Quick Command Reference

| Phase          | Command                  | Role               | Goal                                                 |
| :------------- | :----------------------- | :----------------- | :--------------------------------------------------- |
| **🎯 Sniper**  | `/kamiflow:idea`         | Critical Chef      | **Interactive refinement with 3 options (S1).**      |
|                | `/kamiflow:spec`         | Spec Architect     | **Schema-First specification with Lock 1 & 2 (S2).** |
|                | `/kamiflow:build`        | Build Architect    | **Legacy-Aware task generation with Lock 3 (S3).**   |
| **Strategy**   | `/kamiflow:input`        | Idea Collector     | Capture raw thoughts.                                |
|                | `/kamiflow:cook`         | Critical Chef      | Refine idea through technical debate.                |
|                | `/kamiflow:mvp`          | Scope Slasher      | Define Kernel & Cut List.                            |
| **Factory**    | `/kamiflow:brief`        | Architect          | Define modules & boundaries.                         |
|                | `/kamiflow:prd`          | Product Manager    | User stories & Zod schemas.                          |
|                | `/kamiflow:task`         | Lead Dev           | Atomic task checklist + Quality Gate.                |
| **Bridge**     | `/kamiflow:bridge`       | Bridge Builder     | **Pack context for IDE.**                            |
|                | `/kamiflow:sync`         | Integrator         | **Read IDE logs & Update Context.**                  |
| **Build**      | `/kamiflow:shu`          | Mentor             | Explain _WHY_ before coding.                         |
|                | `/kamiflow:ha`           | Partner            | Collaborative optimization.                          |
|                | `/kamiflow:ri`           | 10x Engineer       | Just code. No chatter.                               |
| **Auto-Pilot** | `/kamiflow:lazy`         | One-Man Band       | **Generate S1-S4 artifacts in one chain.**           |
|                | `/kamiflow:superlazy`    | Autonomous Builder | **Generate S1-S4 AND execute immediately.**          |
| **Manage**     | `/kamiflow:wake`         | Memory Keeper      | **Reload project context (Session Recovery).**       |
|                | `/kamiflow:roadmap`      | Planner            | Sync status to `ROADMAP.md`.                         |
|                | `/kamiflow:save-context` | Memory Keeper      | Save RAM to `PROJECT_CONTEXT.md`.                    |
