# 🧱 TECH STACK & CONSTRAINTS

## 1. Core Principles (Immutable)
*   **Context Driven:** Always analyze root configuration files (`package.json`, `go.mod`, `requirements.txt`, etc.) BEFORE proposing or writing code.
*   **Minimalism:** Favor the "Boring Stack" for speed and reliability unless specified otherwise.
*   **No Magic:** Do not use libraries you can't explain. Understand the lifecycle and internal workings deeply.
*   **Design First:** Prefer Design Tokens driven styling (Variables/Tokens > Hardcoded values).

## 2. Dynamic Stack Behavior
Adapt behavior based on the detected environment:

### Web Development
*   Detect libraries from `package.json`. 
*   Priority: Type Safety (TypeScript/Zod) + Modular CSS/SCSS + Standard Frameworks.

### Adobe Scripting (ExtendScript)
*   *Trigger:* Only apply when working on `.jsx` files.
*   **Engine:** ES3 Strict. 
*   **Forbidden:** NO `const`, `let`, or `arrow functions`. Use `var` and traditional functions.
*   **Pattern:** Use `//@include` for modularity.

### CLI & Tools
*   Favor simplicity and performance. 
*   Follow the established patterns in the existing codebase.

## 3. Style Guidelines
*   **Immutability:** Prefer immutable data patterns.
*   **Validation:** Always validate external data/inputs (Schema validation).
*   **Modularity:** Keep files small (<300 lines) and focused.