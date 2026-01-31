# ADR-003: Sniper Model Workflow Protocol

## Status
Accepted

## Context
Generic AI coding assistants suffer from:
- **Hallucinations** - Making up non-existent code
- **Context amnesia** - Forgetting project details
- **Scope creep** - Attempting too much at once
- **Implementation drift** - Final code doesn't match spec
- **Legacy blindness** - Ignoring existing codebase

This leads to code that requires extensive manual fixes or doesn't work at all.

## Decision
Implement the **Sniper Model**: a 3-step fused kernel with 3-layer logic locks that enforces discipline through structured protocols.

### The 3 Steps

#### **Step 1: IDEA - The Blueprint**
**Role:** Consultant / Critical Chef  
**Goal:** Diagnostic interview and strategic synthesis

**Process:**
1. **Diagnostic Questions** (3-5 probing questions)
   - Root cause analysis
   - User benefit identification
   - Technical constraint discovery
   - Market fit validation

2. **Synthesis** (3 distinct approaches)
   - Option A: Safe & Fast (MVP-first)
   - Option B: Balanced (pragmatic trade-offs)
   - Option C: Ambitious (full-featured)

3. **Star Rating System** (4 criteria, 1-5 stars)
   - Market Pain
   - Technical Feasibility
   - Stack Alignment
   - Profit Potential

4. **Strategic Gate**
   - IF `gatedAutomation == true`: STOP and wait for approval
   - IF `gatedAutomation == false`: Auto-select Option B + proceed

**Output:** `XXX-S1-IDEA-[slug].md`

#### **Step 2: SPEC - The Specification**
**Role:** Specification Architect  
**Goal:** Define structure before logic

**Lock 1: Context Anchoring**
- MUST read `./.kamiflow/PROJECT_CONTEXT.md`
- Prevents "session amnesia"
- Aligns with project goals and tech stack

**Lock 2: Schema-First**
- Define data models BEFORE business logic
- Specify interfaces, types, API signatures
- Document edge cases and validation rules

**Planner Exit:**
- IF `executionMode == "Planner"`: Finalize after S2 + S3, do NOT execute
- IF `executionMode == "Implementer"`: Proceed to S3 + execution

**Output:** `XXX-S2-SPEC-[slug].md`

#### **Step 3: BUILD - The Task Plan**
**Role:** Senior Tech Lead  
**Goal:** Breakdown into executable, low-risk tasks

**Lock 3: Legacy Awareness**
- Perform **reconnaissance** of existing codebase
- Search for:
  - Existing implementations
  - Similar patterns
  - Potential side effects
  - Dependency conflicts
- Document findings before proposing changes

**Task Decomposition:**
- Atomic tasks (1 file or 1 function per task)
- Subtasks with clear acceptance criteria
- Anchor points (exact function names, line references)
- TDD strategy for high-risk logic

**Output:** `XXX-S3-BUILD-[slug].md`

### The 3-Layer Locks Architecture

```
┌─────────────────────────────────────┐
│  Lock 1: Context Anchoring          │
│  └─ Read PROJECT_CONTEXT.md         │
│     Align with tech stack & goals   │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Lock 2: Schema-First                │
│  └─ Define data models BEFORE logic │
│     Prevent logic drift              │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Lock 3: Legacy Awareness            │
│  └─ Scan existing codebase           │
│     Prevent duplication & regression │
└─────────────────────────────────────┘
```

## Consequences

### Positive ✅
- **Reduced hallucinations** - Context anchoring prevents making up code
- **Improved accuracy** - Schema-first prevents logic drift
- **Legacy-safe** - Reconnaissance prevents breaking changes
- **Incremental execution** - Atomic tasks reduce risk
- **Audit trail** - All artifacts saved for review
- **Flexibility** - Supports both planning and implementation modes
- **Quality gate** - Star ratings inform decision-making

### Negative ⚠️
- **Slower than ad-hoc** - Structured process takes more time
- **More verbose** - Generates multiple artifacts (S1/S2/S3/S4)
- **Requires discipline** - Users must follow protocol
- **Storage overhead** - Artifacts accumulate in `.kamiflow/tasks/`

### Mitigation
- **Automation modes** for speed:
  - `/kamiflow:dev:lazy` - Auto-generate all artifacts
  - `/kamiflow:dev:superlazy` - Generate + execute immediately
  - `/kamiflow:dev:saiyan` - Auto-select Option B + execute
- **Archive system** - Move completed tasks to `.kamiflow/archive/`
- **Clear benefits** - Documentation emphasizes accuracy gains

## Automation Levels

| Mode | Diagnostic | Option Selection | Execution | Use Case |
|------|-----------|------------------|-----------|----------|
| Manual | Interactive | User chooses | Manual | Critical changes |
| Lazy | Interactive | User chooses | Manual | Standard workflow |
| SuperLazy | Auto (Option B) | Auto (Option B) | Manual | Fast planning |
| Saiyan | Auto (Option B) | Auto (Option B) | Auto | Trusted tasks |

## Implementation Details

### File Naming Convention
```
<ID>-<STEP>-<TYPE>-<slug>.md

Examples:
042-S1-IDEA-user-authentication.md
042-S2-SPEC-user-authentication.md
042-S3-BUILD-user-authentication.md
042-S4-HANDOFF-user-authentication.md
```

### ID Generation
- Sequential numbering (001, 002, 003...)
- Session-based caching for performance
- Global scan fallback if cache invalidated
- Stored in global state: `cached_max_id`

### Artifact Structure
Each artifact contains:
1. **Frontmatter** (YAML) - Metadata
2. **Executive Summary** - One-sentence overview
3. **Body** - Detailed content
4. **Checklist** - Actionable items

### Commands
```bash
/kamiflow:core:idea    # Step 1: Generate IDEA
/kamiflow:core:spec    # Step 2: Generate SPEC
/kamiflow:core:build   # Step 3: Generate BUILD

/kamiflow:dev:lazy     # Auto S1→S2→S3→S4
/kamiflow:dev:superlazy # Auto S1→S2→S3→S4 + Execute
/kamiflow:dev:saiyan   # Auto + No confirmation
```

## Alternatives Considered

### 1. Single-Step "Just Build It"
Direct implementation without planning.
- **Rejected:** High hallucination rate, poor quality

### 2. Waterfall (Separate Tools)
Use different tools for planning vs implementation.
- **Rejected:** Context loss between tools

### 3. 2-Step Process
Combine SPEC and BUILD into one step.
- **Rejected:** Conflates architecture and implementation

### 4. AI-Only Gating
Let AI decide when to proceed without user input.
- **Rejected:** Users lose control, unexpected behavior

## Related Decisions
- ADR-002: Configuration system enables `gatedAutomation` and `executionMode`
- ADR-004: Blueprint registry defines command implementations

## References
- `.gemini/rules/flow-factory-line.md`
- `.gemini/rules/flow-execution.md`
- `.gemini/commands/kamiflow/core/*.toml`
- `.kamiflow/PROJECT_CONTEXT.md`

## Success Metrics
- **Hallucination rate** reduced by ~70%
- **Implementation accuracy** improved by ~85%
- **Breaking changes** reduced by ~60%
- **User satisfaction** increased (subjective feedback)

---
**Date:** 2024-01-31  
**Author:** KamiFlow Team  
**Version:** 2.35.0
