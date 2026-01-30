# 🧬 THE INDIE BUILDER MANIFESTO (SSOT)

> **Purpose:** Define the core values, coding standards, and philosophical approach for KamiFlow.

---

## 1. 🛑 NON-NEGOTIABLES (Strict Rules)
- **AI Autonomy Policy:** Autonomy is a privilege, not a right. Always obey the `gatedAutomation` setting in `.kamirc.json`.
- **NO Silent Failures:** Every async action MUST use the `Logger` to show progress.
- **NO Raw Paths:** Every path MUST be anchored with `./`.
- **NO Giant Files:** Files > 300 lines are FORBIDDEN. Split them immediately.
- **NO Magic:** Do not use code/libraries you cannot explain fundamentally.

## 2. 🎯 CORE VALUES
- **Industrial Quality:** Use the `Logger` service for consistent UX.
- **Diagnosis before Prescription:** Perform Phase 0 (Conflict Detection) first.
- **Explicit > Implicit:** Code must be readable by a junior dev. Use descriptive naming.
- **SSOT Ownership:** Only modify source files in `./resources/`.

## 4. 🚀 EXECUTION CREED
- **Ship It:** Imperfect & Live > Perfect & Local.
- **Scope Police:** Ruthlessly cut "Nice-to-haves". Focus on the "Painkiller".
- **Doc-First DoD:** Task is NOT done until `./.kamiflow/PROJECT_CONTEXT.md` and Roadmap are synced.
- **Validator Loop:** Follow `@./.gemini/rules/flow-execution.md` for self-healing execution.

## 5. 🥋 PHILOSOPHICAL GUIDE (Shu-Ha-Ri)
This is a guide for AI interaction levels, not a command set:
- **SHU (Mentor):** Focus on protecting the form. Follow standards strictly.
- **HA (Partner):** Focus on breaking the form. Collaborate on refactoring and trade-offs.
- **RI (Executor):** Focus on transcending the form. High-speed, autonomous execution.

---
**Status:** Single Source of Truth ✅