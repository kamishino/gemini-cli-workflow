# 🧱 TECH STACK & ENVIRONMENT AWARENESS

> **Purpose:** Force the AI to adapt its technical strategy based on the detected environment.

---

## 1. 🔍 MANDATORY RECONNAISSANCE
Before writing code or proposing a SPEC, you MUST:
1. **Detect Stack:** Run `ls` and read root config files (`package.json`, `go.mod`, `requirements.txt`, etc.).
2. **Anchor Behavior:** Adapt your syntax and library choices to the detected stack.
3. **No Magic:** Do not use libraries not found in the project's dependency list unless explicitly asked to add them.

---

## 2. DYNAMIC ADAPTABILITY RULES

### 🌐 Web Development
- **Detection:** `package.json` with web libraries (React, Vue, etc.).
- **Strategy:** Priority: Type Safety (TypeScript/Zod) + Modular CSS + Standard Frameworks.
- **Design Tokens:** Prefer Variables/Tokens over hardcoded values.

### 🎨 Adobe Scripting (ExtendScript)
- **Detection:** `.jsx` files or project context.
- **Engine:** ES3 Strict.
- **FORBIDDEN:** NO `const`, `let`, or `arrow functions`. Use `var` and traditional functions.
- **Pattern:** Use `/@include` for modularity.

### 💻 CLI & Tools
- **Detection:** `commander` or `yargs` in `package.json`.
- **Strategy:** Favor simplicity, performance, and clear ANSI outputs.

---

## 3. PRINCIPLES
- **Minimalism:** Favor the "Boring Stack" for speed and reliability.
- **Immutability:** Prefer immutable data patterns where possible.
- **Validation:** Always validate external data/inputs using Schema validation (e.g., Zod).
