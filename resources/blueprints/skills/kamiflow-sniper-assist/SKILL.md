---
name: kamiflow-sniper-assist
description: Use this skill when the user wants to create a new feature, implement a task, or build something new. It guides through the KamiFlow Sniper Model workflow (IDEA → SPEC → BUILD) with 3-Layer Locks for context anchoring, schema-first design, and legacy awareness.
---

# 🎯 KamiFlow Sniper Model Assistant

This skill guides you through the 3-step Sniper Model workflow for turning ideas into executable implementation plans.

## When to Activate

- User says: "create feature", "new task", "implement", "build"
- User provides a feature request or requirement
- User wants structured planning before coding

## Workflow Overview

```
Phase 0   → Phase 0.5 → Phase 1  → Phase 2  → Phase 3
Pre-Flight  Assumption   IDEA       SPEC       BUILD
Check       Verification Interview  Design     Plan
```

---

## Phase 0: Pre-Flight Check

**MANDATORY:** Before any planning, load context:

1. Read `.kamiflow/PROJECT_CONTEXT.md` for current project state
2. Read `.kamiflow/ROADMAP.md` for strategic alignment
3. Check for conflicts with existing tasks in `.kamiflow/tasks/`

**If context files missing:** Warn user and suggest `/kamiflow:ops:save-context`

---

## Phase 0.5: Assumption Verification (Anti-Hallucination)

**CRITICAL:** Verify before you plan:

| Check | Tool | Action if Failed |
|-------|------|------------------|
| File paths exist | `find_by_name` | Report hallucination risk |
| Functions exist | `grep_search` | Confirm signature before referencing |
| Dependencies installed | Read `package.json` | Add to task list if missing |
| Config options valid | Read `.kamirc.json` | Use defaults if invalid |

**Output:** Verification Report (PASS/WARN/FAIL for each check)

---

## Phase 1: IDEA (Diagnostic Interview)

**Role:** Consultant → Critical Chef

### Step 1.1: Diagnostic Interview
Ask clarifying questions:
- What is the core problem being solved?
- Who is the target user?
- What does success look like?
- What constraints exist (time, tech, resources)?

### Step 1.2: Strategic Synthesis
Generate **3 options** with star ratings:

| Option | Approach | Effort | Risk | Rating |
|--------|----------|--------|------|--------|
| A | [Description] | [Low/Med/High] | [Low/Med/High] | ⭐⭐⭐ |
| B | [Description] | [Low/Med/High] | [Low/Med/High] | ⭐⭐ |
| C | [Description] | [Low/Med/High] | [Low/Med/High] | ⭐ |

### Step 1.3: Strategic Gate
Ask user: "Which option do you want to proceed with? (A/B/C)"

**Output:** `.kamiflow/tasks/[ID]-S1-IDEA-[slug].md`

---

## Phase 2: SPEC (Schema-First Design)

**Role:** Specification Architect

### 🔒 Lock 1: Context Anchoring
Re-read `PROJECT_CONTEXT.md` to ensure alignment.

### 🔒 Lock 2: Schema-First
**MANDATORY:** Define data models BEFORE business logic.

### Step 2.1: User Stories
Define 3-5 concrete user stories with acceptance criteria.

### Step 2.2: Data Models (Lock 2)
```typescript
// Define interfaces, types, schemas FIRST
interface FeatureName {
  // ...
}
```

### Step 2.3: API Signatures
Define function signatures, endpoints, or component props.

### Step 2.4: Test Specification (TDD Mandate)
| Test ID | Scenario | Input | Expected | Priority |
|---------|----------|-------|----------|----------|
| TC-1 | Happy path | [Valid input] | [Success] | P0 |
| TC-2 | Edge case | [Boundary] | [Handled] | P1 |
| TC-3 | Error case | [Invalid] | [Error msg] | P1 |

### Step 2.5: Edge Cases
List at least 3 things that could go wrong.

**Output:** `.kamiflow/tasks/[ID]-S2-SPEC-[slug].md`

---

## Phase 3: BUILD (Implementation Plan)

**Role:** Senior Tech Lead

### 🔒 Lock 3: Legacy Code Awareness (Reconnaissance)

**MANDATORY:** Before generating tasks:

1. **Search** for related files, functions, schemas
2. **Analyze** side-effects and dependencies
3. **Score** risk (0-30 scale)
4. **Determine** execution strategy (sequential vs parallel)

### Reconnaissance Report Format
```markdown
- **Files Analyzed:** [List]
- **Key Discovery:** [What you found]
- **Side-Effect Risk:** [Low/Medium/High]
- **TDD Required:** [Yes/No] - [Reason]
```

### Task List Format

```markdown
### Phase 1: Foundation 🧱

- [ ] **Task 1.1: [Name]**
  - **Goal:** [Objective]
  - **Files:** `path/to/file.ts`
  - **Verification:** `grep -n "anchor" path/to/file.ts`
  - **Expected:** Line ~XX, signature: `function()`
  - **Action:** [Specific code change]
  - **If Not Found:** STOP and report hallucination risk
```

### Quality Gate (Task 4.0)
Always include validation tasks:
- Syntax validation (lint, type check)
- Functional testing
- Requirement traceability (S2-SPEC criteria check)

**Output:** `.kamiflow/tasks/[ID]-S3-BUILD-[slug].md`

---

## Handoff

After BUILD is complete, guide user to:
```
/kamiflow:core:bridge .kamiflow/tasks/[ID]-S3-BUILD-[slug].md
```

This generates the IDE-ready execution prompt.

---

## References

- `.gemini/rules/flow-factory-line.md` - Factory Line Protocol
- `.gemini/rules/std-std-anti-hallucination-core.md` - Verification Protocol
- `.gemini/rules/flow-validation-core.md` - Validation Loop
- `.kamiflow/PROJECT_CONTEXT.md` - Current Project State


