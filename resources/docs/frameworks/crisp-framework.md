# 🎯 CRISP Framework: Effective AI Instructions

**Purpose:** Guidelines for crafting instructions that maximize AI coding agent effectiveness.

**Version:** 1.0.0 (v2.39)

---

## Overview

CRISP is a framework for writing AI instructions that minimize hallucination, maximize accuracy, and produce consistent results. It stands for:

| Letter | Meaning | Purpose |
|--------|---------|---------|
| **C** | Context | Ground the AI in project reality |
| **R** | Requirements | Define what needs to be done |
| **I** | Input/Output | Specify data flow and formats |
| **S** | Success Criteria | Define how to verify completion |
| **P** | Prohibitions | Explicit boundaries and constraints |

---

## The CRISP Components

### C - Context (Ground Reality)

**Purpose:** Prevent "session amnesia" and hallucination by anchoring AI to actual project state.

**Good Examples:**
```markdown
✅ "Read PROJECT_CONTEXT.md first, then modify auth.js"
✅ "This is a Node.js CLI using Commander.js and Zod"
✅ "Check package.json for installed dependencies before suggesting imports"
```

**Bad Examples:**
```markdown
❌ "Add authentication" (no context)
❌ "Make it better" (vague)
❌ "Use the standard approach" (undefined standard)
```

**KamiFlow Integration:**
- Lock 1 (Context Anchoring) enforces this
- `{{KAMI_WORKSPACE}}PROJECT_CONTEXT.md` is the canonical source
- Phase 0.5 (Assumption Verification) validates context

---

### R - Requirements (What To Do)

**Purpose:** Clear, atomic requirements that can be verified individually.

**Good Examples:**
```markdown
✅ "Add a --verbose flag that enables debug logging to stderr"
✅ "Create a function `validateEmail(input: string): boolean` that returns true for valid emails"
✅ "Refactor the auth module to use async/await instead of callbacks"
```

**Bad Examples:**
```markdown
❌ "Improve the code" (not specific)
❌ "Add some features" (not defined)
❌ "Make it production-ready" (subjective)
```

**Structure Pattern:**
```
[ACTION] + [TARGET] + [SPECIFICATION]

Examples:
- Add + a CLI flag + called --verbose that logs to stderr
- Create + a validation function + that checks email format
- Refactor + the auth module + to use async/await
```

**KamiFlow Integration:**
- S1-IDEA captures refined requirements
- MoSCoW classification prioritizes them
- User Stories in S2-SPEC add acceptance criteria

---

### I - Input/Output (Data Flow)

**Purpose:** Explicitly define what data goes in, what comes out, and in what format.

**Good Examples:**
```markdown
✅ "Input: CLI args (--config path/to/file.json)"
✅ "Output: JSON object with { success: boolean, data?: T, error?: string }"
✅ "Side effects: Writes to .kamiflow/logs/debug.log"
```

**Bad Examples:**
```markdown
❌ "Takes some arguments" (undefined)
❌ "Returns the result" (what result?)
❌ "Saves the data" (where? format?)
```

**Template:**
```markdown
## I/O Specification

**Input:**
- Type: [primitive | object | file | stream]
- Format: [JSON | Markdown | binary | etc.]
- Source: [CLI arg | stdin | file path | API request]
- Validation: [Zod schema | regex | custom]

**Output:**
- Type: [return value | file | stdout | side effect]
- Format: [specific structure]
- Error handling: [throw | return Error | exit code]

**Side Effects:**
- [File writes, API calls, state mutations]
```

**KamiFlow Integration:**
- S2-SPEC Section 3 (API Signatures) defines this
- Lock 2 (Schema-First) ensures data models exist first

---

### S - Success Criteria (Verification)

**Purpose:** Define objective, verifiable conditions for "done."

**Good Examples:**
```markdown
✅ "Success = all Jest tests pass (npm test exits with code 0)"
✅ "Success = TypeScript compiles with no errors (tsc --noEmit)"
✅ "Success = CLI outputs valid JSON when run with --json flag"
```

**Bad Examples:**
```markdown
❌ "Make sure it works" (how to verify?)
❌ "Should be correct" (subjective)
❌ "Test it thoroughly" (undefined scope)
```

**Verification Types:**

| Type | Command | Pass Condition |
|------|---------|----------------|
| **Unit Tests** | `npm test` | Exit code 0, 0 failures |
| **Type Check** | `tsc --noEmit` | No errors |
| **Lint** | `npm run lint` | 0 errors, 0 warnings |
| **Build** | `npm run build` | Exit code 0 |
| **Integration** | `npm run test:e2e` | All scenarios pass |
| **Manual** | [Specific steps] | [Expected behavior] |

**KamiFlow Integration:**
- Phase 4 Validation Loop uses this
- `verification-before-completion` skill enforces evidence
- S2-SPEC Section 4.5 (Test Specification) defines test cases

---

### P - Prohibitions (Boundaries)

**Purpose:** Explicit constraints to prevent unwanted actions.

**Good Examples:**
```markdown
✅ "Don't modify package.json"
✅ "Don't add new dependencies without asking"
✅ "Don't delete existing tests"
✅ "If blocked, STOP and ask - don't guess"
```

**Bad Examples:**
```markdown
❌ (No prohibitions stated - AI may do anything)
❌ "Be careful" (vague)
❌ "Don't break anything" (undefined)
```

**Common Prohibitions:**

| Category | Prohibition |
|----------|-------------|
| **Files** | Don't modify [specific files] |
| **Dependencies** | Don't add deps without approval |
| **Scope** | Don't refactor unrelated code |
| **Assumptions** | Don't assume files exist - verify first |
| **Guessing** | If uncertain, ask - don't guess |
| **Tests** | Don't delete or weaken existing tests |
| **Comments** | Don't add/remove comments unless asked |

**KamiFlow Integration:**
- `anti-hallucination.md` rule enforces verification
- S2-SPEC Section 7 (Non-Goals) defines scope limits
- Error Recovery Protocol handles blocked states

---

## CRISP in Practice

### Quick Template

```markdown
## Task: [Brief Title]

### Context
- Project: [name/type]
- Tech stack: [languages, frameworks]
- Read first: [files to understand]

### Requirements
1. [Specific action 1]
2. [Specific action 2]

### Input/Output
- Input: [what/format/source]
- Output: [what/format/destination]

### Success Criteria
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] [Specific behavior verified]

### Prohibitions
- Don't [specific constraint]
- If blocked, [specific action]
```

### Example: Real Task

```markdown
## Task: Add --verbose flag to CLI

### Context
- Project: KamiFlow CLI (Node.js)
- Tech stack: Commander.js, Chalk, fs-extra
- Read first: cli-core/bin/kami.js, cli-core/utils/logger.js

### Requirements
1. Add `--verbose` or `-v` global option to Commander program
2. When enabled, set `process.env.KAMI_VERBOSE = 'true'`
3. Logger should check this env var and output debug messages

### Input/Output
- Input: CLI flag `--verbose` or `-v`
- Output: Additional debug logs to stderr
- Side effect: Sets environment variable

### Success Criteria
- [ ] `kami transpile --verbose` shows debug output
- [ ] `kami transpile` (no flag) shows normal output only
- [ ] Existing tests still pass

### Prohibitions
- Don't modify existing log output format
- Don't add new dependencies
- If logger.js structure is unclear, ask first
```

---

## CRISP vs KamiFlow Mapping

| CRISP | KamiFlow Equivalent |
|-------|---------------------|
| **Context** | Lock 1 (Context Anchoring), Phase 0 |
| **Requirements** | S1-IDEA, MoSCoW classification |
| **Input/Output** | S2-SPEC Section 2-3 (Schema, API) |
| **Success** | Phase 4 Validation, TDD skill |
| **Prohibitions** | Non-Goals, Anti-Hallucination rules |

---

## Why CRISP Works

### From AI Agent Perspective

1. **Context prevents hallucination** - AI knows what's real
2. **Requirements enable planning** - Clear scope = accurate estimates
3. **I/O enables verification** - Testable contracts
4. **Success criteria enable completion** - Know when to stop
5. **Prohibitions prevent mistakes** - Guardrails for safety

### Cognitive Load Reduction

```
Without CRISP:
AI must infer → guess → hope → possibly fail → rework

With CRISP:
AI reads → understands → executes → verifies → done
```

### Trust Building

Each CRISP component builds trust:
- **C** → "AI understands my project"
- **R** → "AI knows what I want"
- **I** → "AI handles data correctly"
- **S** → "AI proves it works"
- **P** → "AI respects boundaries"

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | CRISP Fix |
|--------------|---------|-----------|
| "Just do it" | No context or criteria | Add C, R, S |
| "Make it better" | Subjective, unmeasurable | Define R, S explicitly |
| "You know what I mean" | Assumption-based | Add C, I, P |
| "Fix the bug" | No reproduction steps | Add C, I, S |
| "Add tests" | Undefined scope | Add R (which tests?), S |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│                 CRISP CHECKLIST                 │
├─────────────────────────────────────────────────┤
│ C □ Project context stated                      │
│   □ Files to read specified                     │
│   □ Tech stack mentioned                        │
├─────────────────────────────────────────────────┤
│ R □ Actions are specific verbs                  │
│   □ Targets are named (files, functions)        │
│   □ Each requirement is atomic                  │
├─────────────────────────────────────────────────┤
│ I □ Input format defined                        │
│   □ Output format defined                       │
│   □ Side effects listed                         │
├─────────────────────────────────────────────────┤
│ S □ Verification command specified              │
│   □ Pass condition is objective                 │
│   □ Manual checks listed if needed              │
├─────────────────────────────────────────────────┤
│ P □ Files not to modify listed                  │
│   □ "If blocked" action specified               │
│   □ Scope boundaries clear                      │
└─────────────────────────────────────────────────┘
```

---

## Related Resources

- `@.gemini/rules/anti-hallucination.md` - Verification protocols
- `@.gemini/rules/flow-factory-line.md` - Sniper Model workflow
- `resources/blueprints/skills/verification-before-completion/SKILL.md` - Verification skill
- `resources/blueprints/skills/test-driven-development/SKILL.md` - TDD skill


