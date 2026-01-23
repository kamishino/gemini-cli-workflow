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
    MVP --> Brief
    Brief --> PRD
    PRD --> Tasks
    Tasks --> Handoff
    
    Handoff --> Mode
    Mode --> GeminiMode
    Mode --> IdeMode
    
    GeminiMode --> Code
    IdeMode --> Code
    
    Code --> QualityGate
    QualityGate -- PASS --> LogFile
    QualityGate -- FAIL --> Code
    
    LogFile --> Sync
    
    Rules -.-> Code
    Skills -.-> Code
    
    Code --> Roadmap
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
```

## 🧭 Navigation Note
The **Management Commands** (`/kamiflow:update-roadmap` and `/kamiflow:save-context`) act as your Compass and Save Button. They can (and should) be invoked at **ANY stage** to:
*   Check where you are.
*   Update progress.
*   Sync context before taking a break.

## ⚡ Quick Command Reference

| Phase | Command | Role | Goal |
| :--- | :--- | :--- | :--- |
| **Strategy** | `/kamiflow:input` | Idea Collector | Capture raw thoughts. |
| | `/kamiflow:cook` | Critical Chef | Refine idea through technical debate. |
| | `/kamiflow:mvp` | Scope Slasher | Define Kernel & Cut List. |
| **Factory** | `/kamiflow:brief` | Architect | Define modules & boundaries. |
| | `/kamiflow:prd` | Product Manager | User stories & Zod schemas. |
| | `/kamiflow:task` | Lead Dev | Atomic task checklist + Quality Gate. |
| **Bridge** | `/kamiflow:bridge` | Bridge Builder | **Pack context for IDE.** |
| | `/kamiflow:sync` | Integrator | **Read IDE logs & Update Context.** |
| **Build** | `/kamiflow:shu` | Mentor | Explain *WHY* before coding. |
| | `/kamiflow:ha` | Partner | Collaborative optimization. |
| | `/kamiflow:ri` | 10x Engineer | Just code. No chatter. |
| **Manage** | `/kamiflow:wake` | Memory Keeper | **Reload project context (Session Recovery).** |
| | `/kamiflow:roadmap` | Planner | Sync status to `ROADMAP.md`. |
| | `/kamiflow:save-context` | Memory Keeper | Save RAM to `PROJECT_CONTEXT.md`. |
