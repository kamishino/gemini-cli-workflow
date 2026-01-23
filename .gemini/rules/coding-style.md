# 🎨 CODING STYLE & CONVENTIONS

## 1. 🔤 NAMING (Semantic & Consistent)
*   **Variables/Functions:** `camelCase`. Must be descriptive (`getUserById` > `getData`).
*   **Booleans:** MUST prefix with `is`, `has`, `should` (e.g., `isVisible`, `hasToken`).
*   **Classes/Components:** `PascalCase`.
*   **Constants:** `UPPER_SNAKE_CASE` (Global constants only).
*   **Files:**
    *   UI Components: `PascalCase.tsx`
    *   Logic/Utilities/Hooks: `kebab-case.ts`

## 2. 📝 SYNTAX PREFERENCES
*   **Modern JS:** Use `const` by default. Use `let` only for reassignment. NO `var` (except Adobe ES3 context).
*   **Async:** Prefer `async/await` over `.then()`. Always wrap in `try/catch`.
*   **Functions:** Use Arrow Functions `const fn = () => {}` for local logic and callbacks.
*   **Equality:** Always use strict `===` and `!==`.
*   **Cleanliness:** No commented-out code. No `console.log` in production-ready tasks.

## 3. 💾 GIT CONVENTIONS
*   **Format:** `type(scope): description` (Lower-case, no period at end).
*   **Types:**
    *   `feat`: New feature.
    *   `fix`: Bug fix.
    *   `docs`: Documentation changes.
    *   `refactor`: Code restructuring (no logic change).
    *   `chore`: Tooling/Config/Cleanup.
*   **Atomic:** One logical change per commit.

## 4. 📂 STRUCTURE (Colocation)
*   **Feature-First:** Group files by feature (`/features/auth/`) rather than technical role (`/components/`).
*   **Encapsulation:** Keep private helpers inside the feature folder. Only expose public API via `index.ts`.
