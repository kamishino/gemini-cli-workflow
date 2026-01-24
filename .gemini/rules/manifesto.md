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

## 3. 🚀 EXECUTION (How We Act)

- **Ship It:** Imperfect & Live > Perfect & Local.
- **Scope Police:** Ruthlessly cut "Nice-to-haves". Focus on the "Painkiller".
- **Invariants:** Identify the 1 thing that must NEVER break, and protect it at all costs.
- **ID Protocol:** Follow `@.gemini/rules/id-protocol.md` for task identity. Always scan `tasks/` and `archive/` to find MAX ID before generating.
- **Validator Loop:** Follow `@.gemini/rules/validator-loop.md` for automated execution. Execute → Validate → Heal (max 3x) → Report.
