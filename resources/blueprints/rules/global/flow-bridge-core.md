---
name: flow-bridge-core
type: RULE
description: Seamless context handoff between Terminal and IDE
group: global
order: 60
---

# 🌉 Protocol: The IDE Bridge (Handoff)

> **Purpose:** Seamless context handoff between Gemini CLI (Strategy) and external AI Editors (Windsurf/Cursor).

---

## 1. 🎯 Separation of Concerns

- **Gemini CLI:** The Technical Co-Founder (Strategy, Planning, Memory).
- **AI Editor:** The 10x Engineer (High-speed Editing, Refactoring, Debugging).

---

## 2. 🔀 Bridge Output Modes (NEW in v2.39)

### Mode Selection

The bridge command now supports three output modes:

```text
/kamiflow:core:bridge --mode=[full|executor|minimal]
```

| Mode             | Use Case                        | Contents                    |
| ---------------- | ------------------------------- | --------------------------- |
| `full` (default) | Complex tasks, new contributors | All S1-S4 artifacts         |
| `executor`       | Experienced team, clear specs   | S3-BUILD + constraints only |
| `minimal`        | Fast track tasks, quick fixes   | Single task + target file   |

---

### Mode: Full (Default)

**Command:** `/kamiflow:core:bridge` or `/kamiflow:core:bridge --mode=full`

**Output Contains:**

- Complete S1-IDEA with diagnostic history
- Full S2-SPEC with schemas and user stories
- Complete S3-BUILD with all tasks and subtasks
- S4-HANDOFF with documentation contract
- All technical constraints and rules

**Best For:**

- Onboarding new team members
- Complex multi-phase features
- Tasks requiring deep context

---

### Mode: Executor

**Command:** `/kamiflow:core:bridge --mode=executor`

**Output Contains:**

```markdown
# 🌉 EXECUTOR BRIDGE: [ID]-[slug]

**Mode:** Executor (Compact)
**Generated:** [timestamp]

---

## Objective

[1-2 sentence goal]

## S3-BUILD Tasks

[Full task list with anchor points - copied from S3-BUILD]

## Constraints

- Max file size: 300 lines
- Follow existing code style
- Update tests if modifying logic

## Target Files

- `path/to/main/file.ext` (primary)
- `path/to/related/file.ext` (secondary)

## Validation

- [ ] `npm run lint`
- [ ] `npm test`

---

**Skip Reason:** Full S1/S2 context not needed for execution.
**Full Context:** Available via `/kamiflow:ops:wake` if needed.
```

**Omitted:**

- Diagnostic interview Q&A
- Option ratings (A/B/C)
- Full SPEC schemas (only referenced)
- Documentation contract (implicit)

**Best For:**

- Experienced developers
- Well-defined tasks
- Reducing token usage in IDE

---

### Mode: Minimal

**Command:** `/kamiflow:core:bridge --mode=minimal`

**Output Contains:**

```markdown
# ⚡ MINIMAL BRIDGE: [ID]-[slug]

**File:** `path/to/target.ext`
**Action:** [Single sentence: what to do]
**Anchor:** `functionName()` at line ~XX
**Verify:** `npm test -- [test file]`
```

**Best For:**

- 🟢 Fast Track tasks
- Single-file changes
- Quick handoffs

---

## 3. 📋 The Handoff Workflow (S4-HANDOFF)

### MANDATORY Contents of Handoff Package (Full Mode)

- [ ] **The Objective:** Clear high-level goal.
- [ ] **Source of Truth:** Links to active S2-SPEC and S3-BUILD.
- [ ] **Technical Constraints:** Rules from `{{KAMI_RULES_GEMINI}}main-manifesto-core.md` and `{{KAMI_RULES_GEMINI}}main-tech-stack-core.md`.
- [ ] **The Battle Plan:** Full Task & Subtask list with **Anchor Points**.
- [ ] **Documentation Contract:** List of files that MUST be updated (README, ROADMAP, etc.).

### FORBIDDEN Actions

- Do NOT refactor unrelated code during implementation.
- Do NOT create files > 300 lines.

---

## 4. 🔄 The Sync Back (IDE -> Gemini)

After implementing in the IDE, you MUST run `/kamiflow:ops:sync`.

### AI Integrator Actions

1. **Log Processing:** Read logs from `{{KAMI_WORKSPACE}}handoff_logs/`.
2. **Docs Alignment:** Update `{{KAMI_WORKSPACE}}PROJECT_CONTEXT.md` and `{{KAMI_WORKSPACE}}ROADMAP.md` status.
3. **Atomic Exit:** Offer to Archive artifacts if the task is finished.

---

## 5. 🔧 Bridge Configuration

### .kamirc.json Settings

```json
{
  "bridge": {
    "defaultMode": "full",
    "autoDetectMode": true,
    "includeConstraints": true,
    "includeValidation": true
  }
}
```

### Auto-Detect Mode

When `autoDetectMode: true`, the bridge automatically selects:

- **minimal** → If task is 🟢 Fast Track classified
- **executor** → If task is 🟡 Standard and user is experienced
- **full** → If task is 🔴 Critical or user is new

---

## ✅ Success Criteria

- Zero context loss during the switch from Terminal to IDE.
- Project memory is updated immediately after implementation.
- Bridge mode reduces token usage by 40-70% in executor/minimal modes.

---

## 🔗 Related Protocols

- `{{KAMI_RULES_GEMINI}}flow-fast-track-core.md` - Minimal mode integration
- `{{KAMI_RULES_GEMINI}}flow-factory-line-core.md` - Task classification
- `@.windsurf/workflows/kamiflow-execute.md` - IDE receiver
