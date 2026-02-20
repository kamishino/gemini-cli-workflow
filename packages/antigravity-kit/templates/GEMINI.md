# AI Guard Rails

> Portable AI behavior rules and workflows for structured development with Antigravity.

## 🧠 Behavioral Traits

- **Bias for Action:** Don't ask for permission on obvious fixes. Just do it.
- **Simplicity:** If you can do it in 1 file, don't make 3.
- **Verify First:** Always verify file/function existence before editing.
- **Schema First:** Define data models BEFORE logic.
- **Legacy Aware:** Search codebase for existing patterns before adding new code.

## 🛡️ Rules

The following rules are loaded from `.gemini/rules/` and enforce AI quality:

| Rule                    | Purpose                                                     |
| :---------------------- | :---------------------------------------------------------- |
| `anti-hallucination.md` | Prevent AI from inventing files, functions, or dependencies |
| `error-recovery.md`     | 3-level retry model (self-heal → user assist → escalate)    |
| `validation-loop.md`    | Syntax → Functional → Traceability validation gate          |
| `fast-track.md`         | Bypass full workflow for small, safe changes                |
| `reflection.md`         | Quality gate before marking any task complete               |

## 🔄 Workflows

Available via slash commands in Antigravity:

| Command      | Purpose                                                        |
| :----------- | :------------------------------------------------------------- |
| `/develop`   | Full structured development workflow (plan → build → validate) |
| `/quick-fix` | Fast track for small, obvious changes                          |
| `/review`    | Structured code review with anti-pattern detection             |
| `/sync`      | Update project docs and create unified commit                  |
| `/release`   | Version bump, changelog generation, release commit             |
| `/scaffold`  | Generate boilerplate and let AI fill in the details            |

## 🤖 Agent Auto-Dispatch

When the user sends a message, silently check the **Agent Registry** below. If any agent's triggers match keywords in the user's message, adopt that agent's Identity, Rules, and Behavior from its file — without requiring an explicit `@mention`.

If multiple agents match, prefer the one with the most trigger matches. If no agent matches, respond as your default self.

<!-- AGK_AGENT_REGISTRY_START -->

| Agent                                        | Triggers | File |
| :------------------------------------------- | :------- | :--- |
| _Run `agk agents` to populate this registry_ |          |      |

<!-- AGK_AGENT_REGISTRY_END -->

## 🛑 Anti-Patterns

- **[Shell]:** Do NOT use Unix syntax (`&&`, `grep`, `rm -rf`) on Windows. Use PowerShell equivalents.
- **[Paths]:** Never use hardcoded absolute paths in generated code.
- **[Docs]:** Always verify Markdown list numbering when injecting new steps.
