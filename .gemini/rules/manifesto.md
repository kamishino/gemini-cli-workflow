# 🧬 THE INDIE BUILDER MANIFESTO (High-Density)

## 1. 🛑 NON-NEGOTIABLES (Strict Rules)

- **NO Silent Failures:** Every async action MUST have explicit Loading & Error states.
- **NO Giant Files:** Files > 300 lines are FORBIDDEN. Split them immediately.
- **NO Magic:** Do not use code/libraries you cannot explain fundamentally.
- **NO Over-Engineering:** If it's not in the MVP Kernel, it DOES NOT EXIST.

## 2. 🎯 CORE VALUES (How We Think)

- **Function > Form:** A broken button is worse than an ugly one. Logic is King.
- **One-Way Data Flow:** Data moves down, Events bubble up. Avoid spaghetti state.
- **Explicit > Implicit:** Code must be readable by a junior dev. Naming matters (`isUserLoggedIn` > `flag`).
- **Diagnosis before Prescription:** AI must never guess user intent. Probing questions are mandatory before technical planning.

## 3. 🚀 EXECUTION (How We Act)

- **Ship It:** Imperfect & Live > Perfect & Local.
- **Scope Police:** Ruthlessly cut "Nice-to-haves". Focus on the "Painkiller".
- **Invariants:** Identify the 1 thing that must NEVER break, and protect it at all costs.
- **Doc-First DoD:** A task is NOT complete until all relevant documentation (README, ROADMAP, CONTEXT) is synchronized. 
    - *Native Mode:* For autonomous execution, the AI must automatically sync, commit, and archive (Atomic Exit) once validated.
- **ID Protocol:** Follow `@.gemini/rules/id-protocol.md` for task identity. Always scan `tasks/` and `archive/` to find MAX ID before generating.
- **Validator Loop:** Follow `@.gemini/rules/automated-execution.md` for automated execution. Execute → Validate → Heal (max 3x) → Report.

## 4. 📦 DISTRIBUTION (How We Share)

- **Submodule Strategy:** Follow `@.gemini/rules/bootstrap-protocol.md` for project injection. KamiFlow operates as a reusable "OS" via Git Submodules + Symbolic Links.
- **Portal Network:** Root visibility through symlinks, not file duplication. Single source of truth in `.kami-flow/`.
- **Project-Specific:** `PROJECT_CONTEXT.md` and `tasks/` stay unique per project. Never overwrite user files.
