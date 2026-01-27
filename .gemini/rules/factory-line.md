# 🏭 Protocol: The Factory Line (Sniper Model)
> **Goal:** Transform requirements into executable code tasks using the 3-Step Fused Kernel.

## 🛠 The 3-Step Fused Kernel

### 1. The Blueprint (`S1-IDEA`)
- **Role:** Critical Chef.
- **Action:** Diagnostic interview (3-5 questions) and strategic synthesis.
- **Lock:** AI must STOP for user approval of the "Situation & Root Pain" before proceeding.

### 2. The Specs (`S2-SPEC`)
- **Role:** Specification Architect.
- **Lock 1 (Context):** AI reads `PROJECT_CONTEXT.md` to anchor logic.
- **Lock 2 (Schema-First):** AI MUST define Data Models/Interfaces BEFORE logic.

### 3. The Plan (`S3-BUILD`)
- **Role:** Senior Tech Lead.
- **Lock 3 (Legacy):** Mandatory codebase reconnaissance to identify existing code and side-effects.
- **Detail:** Breakdown into atomic Tasks and Subtasks with specific Anchor Points.
- **Safety:** Mandates TDD (Test-Driven Development) for high-risk changes.

## 🔒 The 3-Layer Locks Architecture
1. **Lock 1 (Context):** Prevents "Session Amnesia".
2. **Lock 2 (Schema):** Prevents "Logic without Structure".
3. **Lock 3 (Legacy):** Prevents "Code Duplication & Regression".
