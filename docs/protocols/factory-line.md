# 🏭 Protocol: The Factory Line (KamiFlow Sniper)
> **Goal:** Transform abstract requirements into executable code tasks using the Sniper Model.

## 🛠 The 3-Step Fused Kernel

### 1. The Blueprint (`S1-IDEA`)
- **Role:** Critical Chef.
- **Goal:** Diagnostic interview and refined idea synthesis.
- **Output:** An approved IDEA file with chosen approach and MVP scope.
- **Command:** `/kamiflow:idea`

### 2. The Specs (`S2-SPEC`)
- **Role:** Specification Architect.
- **Goal:** Detail user stories, data schemas (Schema-First), and API signatures.
- **Output:** A detailed SPEC file with Lock 1 & 2 verification.
- **Command:** `/kamiflow:spec`

### 3. The Plan (`S3-BUILD`)
- **Role:** Build Architect.
- **Goal:** Break down the SPEC into atomic, legacy-aware coding tasks.
- **Output:** A checklist of small, testable tasks (< 300 lines each) with Lock 3 verification.
- **Command:** `/kamiflow:build`

## 🔒 The 3-Layer Locks
- **Lock 1 (Context):** Forces reading `PROJECT_CONTEXT.md` before spec.
- **Lock 2 (Schema):** Mandates Data Models BEFORE Logic.
- **Lock 3 (Legacy):** Requires codebase analysis before task creation.