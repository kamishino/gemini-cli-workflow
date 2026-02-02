---
name: std-fast-track
type: RULE
description: Lightweight task handling protocol for 🟢 Fast Track classification
group: execution
order: 15
---

# ⚡ Standard: Fast Track Protocol

> **Purpose:** Enable rapid execution of lightweight tasks without sacrificing quality or traceability.

---

## 1. When to Use Fast Track

### Automatic Triggers

Fast Track is automatically activated when:

1. **User explicitly requests:** "quick fix", "small change", "just update X"
2. **Task matches ALL 5 criteria** from Step -1 Classification
3. **`executionMode: "FastTrack"`** is set in `.kamirc.json`

### Manual Override

User can force modes:
- `/kamiflow:core:idea --fast` → Force Fast Track
- `/kamiflow:core:idea --full` → Force Full Ceremony

---

## 2. Fast Track Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│  FAST TRACK FLOW (🟢 Mode)                                  │
│                                                             │
│  1. Classification Check (5 criteria)        [< 10 sec]    │
│     └── All YES? → Continue                                 │
│     └── Any NO? → Escalate to Standard Mode                │
│                                                             │
│  2. Lock 3 Verification (Legacy Awareness)   [< 30 sec]    │
│     └── grep_search for existing code                       │
│     └── Check for side effects                              │
│     └── If conflicts → Escalate to Standard Mode           │
│                                                             │
│  3. Minimal S3-BUILD Generation              [< 20 sec]    │
│     └── Single task with anchor point                       │
│     └── No S1-IDEA, no S2-SPEC                             │
│                                                             │
│  4. Execute & Validate                       [Variable]    │
│     └── Apply change                                        │
│     └── Run validation (lint, syntax)                       │
│     └── Self-heal if needed                                 │
│                                                             │
│  5. Fast Track Exit                          [< 10 sec]    │
│     └── Log to fast-track-log.json                          │
│     └── Optional: Update PROJECT_CONTEXT.md                │
│     └── No full reflection (just 1-line summary)           │
│                                                             │
│  TOTAL TIME TARGET: < 2 minutes                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Fast Track Artifacts

### Required Artifacts (Minimal)

| Artifact | Required? | Purpose |
|----------|-----------|---------|
| S1-IDEA | ❌ Skip | Not needed for simple tasks |
| S2-SPEC | ❌ Skip | Not needed for simple tasks |
| S3-BUILD | ✅ Minimal | Single task, anchor point only |
| S4-HANDOFF | ❌ Skip | Direct execution, no IDE handoff |
| Checkpoint | ❌ Skip | Too short to need resume |
| Log Entry | ✅ Required | Traceability in fast-track-log.json |

### Fast Track S3-BUILD Template

```markdown
# 🟢 FAST TRACK: [ID]-S3-BUILD-[slug].md

**Mode:** 🟢 Fast Track
**Classification Score:** 5/5 criteria met
**Timestamp:** [ISO 8601]

---

## Target

- **File:** `[path/to/target/file.ext]`
- **Function/Area:** `[functionName()]` or `[class/component]`
- **Line Range:** ~[start]-[end] (estimated)

---

## Task

- [ ] **[Action Verb]:** [Specific change description]
  - **Anchor:** `[exact code to find]`
  - **Change:** [What to modify/add/remove]
  - **Verify:** [Command or manual check]

---

## Lock 3 Verification

- **Search Performed:** `grep_search("[pattern]", "[path]")`
- **Existing Code Found:** [Yes/No - details]
- **Side Effects:** [None / List any]
- **Conflicts:** ❌ None

---

## Validation Plan

1. [ ] Syntax check: `node --check [file]`
2. [ ] Lint: `npm run lint -- [file]`
3. [ ] Test (if exists): `npm test -- [related test]`
```

---

## 4. Fast Track Logging

### Log File Location

**Path:** `.kamiflow/fast-track-log.json`

### Log Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "version": { "type": "string", "const": "1.0" },
    "entries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string", "description": "Task ID (3-digit)" },
          "timestamp": { "type": "string", "format": "date-time" },
          "classification": { "enum": ["fast_track", "escalated_to_standard"] },
          "criteria_met": { "type": "integer", "minimum": 0, "maximum": 5 },
          "file": { "type": "string", "description": "Primary file affected" },
          "lines_changed": { "type": "integer" },
          "reason": { "type": "string", "description": "Why fast track was appropriate" },
          "duration_seconds": { "type": "integer" },
          "validation_passed": { "type": "boolean" },
          "escalation_reason": { "type": "string", "description": "If escalated, why" }
        },
        "required": ["id", "timestamp", "classification", "criteria_met"]
      }
    }
  }
}
```

### Example Log Entry

```json
{
  "version": "1.0",
  "entries": [
    {
      "id": "043",
      "timestamp": "2026-02-02T10:30:00Z",
      "classification": "fast_track",
      "criteria_met": 5,
      "file": "cli-core/utils/helper.js",
      "lines_changed": 12,
      "reason": "Add utility function for string formatting",
      "duration_seconds": 45,
      "validation_passed": true
    },
    {
      "id": "044",
      "timestamp": "2026-02-02T11:15:00Z",
      "classification": "escalated_to_standard",
      "criteria_met": 3,
      "file": "cli-core/logic/transpiler.js",
      "reason": "Initial assessment was fast track, but Lock 3 found cross-module dependency",
      "escalation_reason": "Imports utils/cache.js which has side effects"
    }
  ]
}
```

---

## 5. Escalation Protocol

### When to Escalate

Fast Track → Standard Mode if:

1. **Lock 3 finds conflicts** during verification
2. **Validation fails 2+ times** with different errors
3. **User requests** more thorough analysis
4. **Side effects discovered** during implementation
5. **Change grows beyond** initial scope (> 50 lines)

### Escalation Procedure

```
ESCALATION DETECTED
  ↓
1. Log escalation reason to fast-track-log.json
2. Inform user: "⚠️ Escalating to Standard Mode: [reason]"
3. Generate full S1-IDEA from existing context
4. Continue with Phase 0 (Logical Guard)
5. Preserve any work done (don't restart from scratch)
```

---

## 6. Fast Track Metrics

### Track These KPIs

| Metric | Target | Description |
|--------|--------|-------------|
| Fast Track Rate | > 40% | % of tasks that qualify for fast track |
| Escalation Rate | < 20% | % of fast track tasks that escalate |
| Avg Duration | < 2 min | Time from start to completion |
| First-Try Success | > 90% | Validation passes on first attempt |

### Weekly Review

At weekly `/kamiflow:ops:error-report`:
- Review fast track log
- Identify patterns in escalations
- Adjust criteria if needed

---

## 7. Integration with Other Protocols

### With Error Recovery

- Fast Track uses **Level 1 self-healing only**
- Any Level 2+ error → Escalate to Standard Mode
- No complex error recovery in fast track

### With Validation Loop

- Fast Track runs **abbreviated validation**
- Syntax check: Always
- Lint: Always
- Full test suite: Only if explicitly requested

### With Checkpoints

- **No checkpoints** in Fast Track (too short)
- If interrupted, restart from beginning
- Log entry provides minimal recovery info

---

## 8. Configuration

### .kamirc.json Settings

```json
{
  "fastTrack": {
    "enabled": true,
    "maxLines": 50,
    "autoClassify": true,
    "requireLock3": true,
    "logPath": ".kamiflow/fast-track-log.json"
  }
}
```

### Disable Fast Track

Set `fastTrack.enabled: false` to always use full ceremony.

---

## ✅ Success Criteria

**Fast Track is effective when:**

1. **40%+ of tasks** qualify for fast track classification
2. **< 20% escalation rate** (classification is accurate)
3. **< 2 minute average** completion time
4. **Zero regression bugs** from fast track changes
5. **Full traceability** maintained via log file

---

## 🔗 Related Protocols

- `@.gemini/rules/flow-factory-line.md` - Step -1 Classification
- `@.gemini/rules/flow-execution.md` - Validation Loop
- `@.gemini/rules/error-recovery.md` - Level 1 Self-Healing
- `@.gemini/rules/flow-validation.md` - Abbreviated Validation
