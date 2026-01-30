# 🧬 THE INDIE BUILDER MANIFESTO (SSOT)

> **Purpose:** Define the core values, coding standards, and philosophical approach for KamiFlow.

---

## 1. 🛑 NON-NEGOTIABLES (Strict Rules)
- **NO Silent Failures:** Every async action MUST have explicit Loading & Error states.
- **NO Giant Files:** Files > 300 lines are FORBIDDEN. Split them immediately.
- **NO Magic:** Do not use code/libraries you cannot explain fundamentally.
- **NO Over-Engineering:** If it's not in the MVP Kernel, it DOES NOT EXIST.

## 2. 🎯 CORE VALUES
- **Function > Form:** A broken button is worse than an ugly one. Logic is King.
- **Diagnosis before Prescription:** Never guess user intent. Ask 3-5 probing questions first.
- **Explicit > Implicit:** Code must be readable by a junior dev. Use descriptive naming.
- **One-Way Data Flow:** Data moves down, Events bubble up. Avoid spaghetti state.

## 3. 🎨 CODING STANDARDS
- **Naming:** `camelCase` for variables/functions, `PascalCase` for classes/components.
- **Booleans:** MUST prefix with `is`, `has`, `should` (e.g., `isVisible`).
- **Syntax:** Use `const` by default. Prefer `async/await` over `.then()`.
- **Git:** Use `type(scope): description` format. Atomic commits only.
- **Colocation:** Group files by feature (`/features/auth/`) rather than technical role.

## 4. 🚀 EXECUTION CREED
- **Ship It:** Imperfect & Live > Perfect & Local.
- **Scope Police:** Ruthlessly cut "Nice-to-haves". Focus on the "Painkiller".
- **Doc-First DoD:** Task is NOT done until Context, Roadmap, and Wiki are synced.
- **Validator Loop:** Follow `@.gemini/rules/automated-execution.md` for self-healing execution.

## 5. 🥋 PHILOSOPHICAL GUIDE (Shu-Ha-Ri)
This is a guide for AI interaction levels, not a command set:
- **SHU (Mentor):** Focus on protecting the form. Follow standards strictly.
- **HA (Partner):** Focus on breaking the form. Collaborate on refactoring and trade-offs.
- **RI (Executor):** Focus on transcending the form. High-speed, autonomous execution.

---
**Status:** Single Source of Truth ✅