# 🎯 Sniper Model Commands (Core)

[ 🏠 Home ](../../README.md) | [ 🚀 Start ](../../docs/GETTING_STARTED.md) | [ 📖 Wiki ](README.md) | [ 🆘 SOS ](../../docs/TROUBLESHOOTING.md)

---

These commands form the backbone of the **Sniper Model**, KamiFlow's rigorous 3-step workflow for high-fidelity software engineering.

📖 **[Sniper Model Rules](../../.gemini/rules/factory-line.md)**, KamiFlow's rigorous 3-step workflow for high-fidelity software engineering.

<!-- KAMI_COMMAND_LIST_START -->

### 🎯 Sniper Model (Core Flow)

| Command                 | Goal                                                                                                                           |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `/kamiflow:dev:flow`    | **[KamiFlow Pilot] Unified Flow Orchestrator - Integrates Idea, Spec, Build, and Execution/Handoff in a single gated stream.** |
| `/kamiflow:core:bridge` | **[KamiFlow] Generate a 'Context Package' prompt for external AI Editors (Windsurf/Cursor).**                                  |
| `/kamiflow:core:idea`   | **[KamiFlow Sniper] Generate refined idea through diagnostic interview and synthesis (Step 1: Two-Phase Interactive).**        |
| `/kamiflow:core:spec`   | **[KamiFlow Sniper] Create detailed specification with Schema-First approach (Step 2: Lock 1 & 2).**                           |
| `/kamiflow:core:build`  | **[KamiFlow Sniper] Generate implementation task list with Legacy Awareness (Step 3: Lock 3).**                                |

<!-- KAMI_COMMAND_LIST_END -->

---

## /kamiflow:core:idea

> **Goal:** Generate a refined idea through recursive diagnostic interview and strategic synthesis.

### 🧠 Logic & Thinking (CoT)

1. **Recursive Diagnosis:** AI acts as a **Consultant**. It calculates a **Clarify Score (0-10)** based on its understanding.
2. **Confidence Threshold:** If the score is **< 8.0**, AI is blocked from proposing options and MUST ask deeper probing questions to identify Ambiguity Nodes.
3. **Synthesis:** Once threshold is met, AI acts as a **Critical Chef**, processing answers into 3 distinct approaches (A/B/C).
4. **The Gate:** pick an option to anchor the technical plan on a solid foundation.

### 🛠️ Practical Usage

```bash
/kamiflow:core:idea "Create a login system with JWT"
```

---

## /kamiflow:core:spec

> **Goal:** Create a detailed, logic-first specification based on an approved IDEA.

### 🧠 Logic & Thinking (CoT)

1. **Hard Gate:** AI verifies the parent IDEA's Clarify Score. It will refuse to run if the score is < 8.0.
2. **Lock 1 (Context):** AI reads `{{KAMI_WORKSPACE}}PROJECT_CONTEXT.md` to ensure alignment with tech stack.
3. **Lock 2 (Schema-First):** AI MUST define Data Models/Interfaces BEFORE any logic is written.
4. **Trade-offs:** Instead of open questions, it presents **Implementation Trade-offs** for the user to decide the best path.

### 🛠️ Practical Usage

```bash
/kamiflow:core:spec tasks/001-S1-IDEA-login-system.md
```

---

## /kamiflow:core:build

> **Goal:** Generate an implementation task list with Legacy Code awareness and Drift Detection.

### 🧠 Logic & Thinking (CoT)

1. **Lock 3 (Legacy Awareness):** AI performs **Reconnaissance**. It searches the codebase to see what already exists.
2. **Drift Detection:** AI explicitly verifies if the code facts match the SPEC. If reality contradicts the plan, it triggers an "Emergency Brake" and suggests `/revise`.
3. **Breakdown:** It transforms the SPEC into atomic **Tasks and Subtasks** with specific **Anchor Points**.
4. **Safety:** High-risk changes automatically mandate a **TDD (Test-Driven Development)** strategy.

### 🛠️ Practical Usage

```bash
/kamiflow:core:build tasks/001-S2-SPEC-login-system.md
```

---

## /kamiflow:core:bridge

> **Goal:** Package the technical context for an external IDE AI Agent (Cascade/Cursor).

### 🧠 Logic & Thinking (CoT)

1. **Bundle:** AI gathers S1, S2, and S3 artifacts into a single "Prompt Package".
2. **Docs Contract:** It explicitly lists which documentation files (README, ROADMAP) must be updated by the IDE.
3. **Handover:** It creates an `S4-HANDOFF` file. You copy this into your IDE to ensure the external AI has 100% of the strategic context.

### 🛠️ Practical Usage

```bash
/kamiflow:core:bridge tasks/001-S3-BUILD-login-system.md
```
