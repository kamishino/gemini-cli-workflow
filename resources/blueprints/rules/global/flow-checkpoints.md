---
name: flow-checkpoints
type: RULE
description: Progress tracking and resume capability for long-running workflows
group: execution
order: 90
---

# 📍 Protocol: Checkpoints & Resume

> **Purpose:** Enable workflow interruption and resumption without losing progress or context.

---

## 1. The Checkpoint System

### Why Checkpoints Matter

**Problem Without Checkpoints:**
- Long workflows (30+ minutes) can be interrupted
- Session timeouts lose all progress
- Context switches require starting over
- No visibility into workflow progress

**Solution With Checkpoints:**
- Save progress at key milestones
- Resume from last successful phase
- Track workflow state across sessions
- Provide progress visibility to user

---

## 2. Checkpoint Locations

### Automatic Checkpoints

**Phase Boundaries (6 checkpoints):**

1. **After Phase 0: Logical Guard Complete**
   - Checkpoint ID: `[ID]-checkpoint-phase0.json`
   - Data: Requirement groups, conflict analysis, project context

2. **After Phase 0.5: Assumption Verification Complete**
   - Checkpoint ID: `[ID]-checkpoint-phase0.5.json`
   - Data: Verified files, functions, dependencies, hallucination risks

3. **After Phase 1: Diagnostic Interview Complete**
   - Checkpoint ID: `[ID]-checkpoint-phase1.json`
   - Data: User questions, user answers, diagnostic insights

4. **After Phase 2: Option Selected, S1-IDEA Created**
   - Checkpoint ID: `[ID]-checkpoint-phase2.json`
   - Data: 3 options with ratings, selected option, S1-IDEA file path

5. **After Phase 3A: S2-S4 Artifacts Generated**
   - Checkpoint ID: `[ID]-checkpoint-phase3a.json`
   - Data: S2-SPEC, S3-BUILD, S4-HANDOFF file paths, task list

6. **After Phase 3B: Validation Passed**
   - Checkpoint ID: `[ID]-checkpoint-phase3b.json`
   - Data: Validation report, gate decision, any warnings

7. **After Phase 4: Task Archived**
   - Checkpoint ID: `[ID]-checkpoint-complete.json`
   - Data: Reflection, commit hash, archive path, completion timestamp

---

## 3. Checkpoint Data Format

### Storage Location

**Directory:** `{{KAMI_WORKSPACE}}.kamiflow/checkpoints/`

**Filename Pattern:** `[ID]-checkpoint-[phase].json`

**Example:** `.kamiflow/checkpoints/042-checkpoint-phase2.json`

---

### Checkpoint Schema

```json
{
  "version": "1.0",
  "taskId": "042",
  "slug": "oauth-integration",
  "phase": "2",
  "phaseName": "Strategic Synthesis",
  "timestamp": "2024-01-30T14:30:00Z",
  "command": "/kamiflow:dev:superlazy",
  "status": "complete",
  
  "artifacts": {
    "s1": "tasks/042-S1-IDEA-oauth-integration.md",
    "s2": null,
    "s3": null,
    "s4": null
  },
  
  "phaseData": {
    "options": [
      {
        "id": "A",
        "name": "Safe & Fast",
        "ratings": {
          "marketPain": 4,
          "technicalFeasibility": 5,
          "stackAlignment": 5,
          "profitPotential": 3
        }
      },
      {
        "id": "B",
        "name": "Balanced",
        "ratings": {
          "marketPain": 5,
          "technicalFeasibility": 4,
          "stackAlignment": 4,
          "profitPotential": 4
        }
      },
      {
        "id": "C",
        "name": "Ambitious",
        "ratings": {
          "marketPain": 5,
          "technicalFeasibility": 2,
          "stackAlignment": 3,
          "profitPotential": 5
        }
      }
    ],
    "selectedOption": "B",
    "selectionReason": "Best balance of feasibility and impact"
  },
  
  "validation": null,
  "reflection": null,
  
  "nextPhase": "3A",
  "nextAction": "Generate S2-SPEC, S3-BUILD, S4-HANDOFF artifacts",
  
  "metadata": {
    "duration": "320s",
    "userInteractions": 2,
    "errorsEncountered": 0
  }
}
```

---

### Phase-Specific Data

**Phase 0 Data:**
```json
"phaseData": {
  "requirementGroups": [
    {"category": "FEATURE", "requirements": ["Add OAuth2", "Support Google/GitHub"]},
    {"category": "REFACTOR", "requirements": ["Extract auth logic"]}
  ],
  "conflictsDetected": false,
  "projectContext": {
    "goal": "Enterprise-grade SaaS platform",
    "techStack": "Node.js, Express, PostgreSQL"
  }
}
```

**Phase 0.5 Data:**
```json
"phaseData": {
  "filesVerified": [
    "cli-core/utils/auth.js",
    "cli-core/config/oauth.json"
  ],
  "functionsVerified": [
    {"name": "validateToken", "location": "auth.js:42"}
  ],
  "dependenciesVerified": [
    {"name": "passport", "version": "0.6.0"}
  ],
  "hallucinationRisks": "None",
  "status": "CLEAR_TO_PROCEED"
}
```

**Phase 1 Data:**
```json
"phaseData": {
  "questions": [
    "Why OAuth2 now? What changed?",
    "Which providers are most important?",
    "What's the migration path for existing users?"
  ],
  "answers": [
    "Enterprise clients require SSO",
    "Google and GitHub are priorities",
    "Existing users can link accounts"
  ],
  "diagnosticInsights": [
    "Enterprise SSO is blocking sales deals",
    "Security compliance requirement",
    "Must maintain backward compatibility"
  ]
}
```

**Phase 3A Data:**
```json
"phaseData": {
  "spec": {
    "userStories": 5,
    "dataModels": 3,
    "apiEndpoints": 8
  },
  "build": {
    "totalTasks": 15,
    "phases": 4,
    "tddRequired": true
  },
  "handoff": {
    "constraints": ["No files >300 lines", "OAuth 2.0 spec compliance"],
    "documentation": ["README.md", "API.md"]
  }
}
```

**Phase 3B Data:**
```json
"phaseData": {
  "validationReport": {
    "phaseA": "PASS",
    "phaseB": "PASS",
    "phaseC": "PASS_WITH_NOTES",
    "warnings": ["2 acceptance criteria deferred to Task 043"]
  },
  "gateDecision": "PASS",
  "retryCount": 0
}
```

**Phase 4 Data:**
```json
"phaseData": {
  "reflection": {
    "valueDelivered": "OAuth2 authentication reduces signup friction by 80%",
    "techDebt": "Minor",
    "lessonsLearned": ["Lock 3 prevented duplicate code", "TDD caught edge cases early"],
    "followupTasks": ["043"]
  },
  "archivePath": "archive/2024-01-30_042_oauth-integration/",
  "commitHash": "a7f3d9c",
  "roadmapUpdated": true
}
```

---

## 4. Resume Protocol

### Resume Command (Future Implementation)

**Command:** `/kamiflow:ops:resume [ID]`

**Purpose:** Continue workflow from last successful checkpoint

---

### Resume Workflow

```
User runs: /kamiflow:ops:resume 042
  ↓
Step 1: Find Latest Checkpoint
  - Search: .kamiflow/checkpoints/042-checkpoint-*.json
  - Sort by timestamp
  - Load most recent checkpoint
  ↓
Step 2: Display Progress Summary
  ```
  📍 RESUME WORKFLOW

  Task ID: 042
  Slug: oauth-integration
  Last Checkpoint: Phase 2 (Strategic Synthesis)
  Completed At: 2024-01-30 14:30:00
  
  ✅ Phases Complete:
  - Phase 0: Logical Guard
  - Phase 0.5: Assumption Verification
  - Phase 1: Diagnostic Interview
  - Phase 2: Strategic Synthesis (Option B selected)
  
  📋 Next Action:
  Generate S2-SPEC, S3-BUILD, S4-HANDOFF artifacts
  
  Resume from Phase 3A? (Y/N)
  ```
  ↓
Step 3: User Confirmation
  - If Y → Load checkpoint data and continue
  - If N → Offer to restart or cancel
  ↓
Step 4: Reload Context
  - Read checkpoint JSON
  - Load all artifacts from checkpoint.artifacts
  - Restore phaseData to memory
  - Re-read PROJECT_CONTEXT.md for freshness
  ↓
Step 5: Continue Workflow
  - Jump to checkpoint.nextPhase
  - Execute checkpoint.nextAction
  - Create new checkpoints as workflow progresses
```

---

### Resume Safety Checks

**Before Resuming:**

1. **Staleness Check:**
   - If checkpoint > 7 days old → Warn user
   - Suggest: "Context may be stale. Re-verify PROJECT_CONTEXT.md?"

2. **Artifact Integrity Check:**
   - Verify all checkpoint.artifacts files still exist
   - If missing → ERROR: "Cannot resume, artifacts deleted"

3. **Project State Check:**
   - Read current PROJECT_CONTEXT.md
   - Compare to checkpoint.phaseData.projectContext
   - If diverged → Warn: "Project has changed since checkpoint"

4. **Dependency Check:**
   - If checkpoint.artifacts.s1 exists → Verify it's not been modified
   - If modified → Warn: "S1-IDEA changed, resume may be inconsistent"

---

## 5. Checkpoint Management

### Automatic Cleanup

**Retention Policy:**
- **Active task checkpoints:** Keep all until task archived
- **Completed task checkpoints:** Keep final checkpoint only
- **Failed/abandoned checkpoints:** Keep for 30 days, then delete

**Cleanup Trigger:**
- After Phase 4 (task archived)
- Action: Delete all intermediate checkpoints (phase0-phase3b)
- Keep: Only `[ID]-checkpoint-complete.json` for history

---

### Manual Checkpoint Operations

**List Checkpoints:**
```bash
ls .kamiflow/checkpoints/042-*.json
```

**Read Checkpoint:**
```bash
cat .kamiflow/checkpoints/042-checkpoint-phase2.json | jq
```

**Delete Checkpoint (advanced users only):**
```bash
rm .kamiflow/checkpoints/042-checkpoint-phase1.json
```

---

## 6. Progress Visibility

### Progress Indicators

**During Workflow Execution:**

```
🚀 KamiFlow SuperLazy Progress

Phase 0: Logical Guard         ✅ Complete (45s)
Phase 0.5: Verification         ✅ Complete (30s)
Phase 1: Diagnostic Interview   ✅ Complete (180s)
Phase 2: Strategic Synthesis    🔄 In Progress...
  └─ Generating options          ✅
  └─ Calculating ratings         ✅
  └─ Waiting for user choice     ⏸️  <-- YOU ARE HERE

Phase 3A: Artifact Generation   ⏳ Pending
Phase 3B: Validation Loop       ⏳ Pending
Phase 4: Strategic Exit         ⏳ Pending

Elapsed Time: 4m 15s
Estimated Remaining: 8-12 minutes
```

**After Checkpoint Saved:**
```
✅ Checkpoint saved: Phase 2 complete
📍 Resume anytime with: /kamiflow:ops:resume 042
```

---

## 7. Integration with Existing Workflows

### In `/kamiflow:dev:superlazy`

**Add checkpoint calls after each phase:**

```markdown
### PHASE 1: DIAGNOSTIC INTERVIEW (MANDATORY)
1. Act as The Consultant
2. Ask 3-5 probing questions
3. **CRITICAL:** STOP and use wait_for_user_input
4. **CHECKPOINT:** Save Phase 1 data to checkpoint file  ← NEW

### PHASE 2: STRATEGIC SYNTHESIS (THE GATE)
1. Generate S1-IDEA with 3 options
2. **THE GATE:** STOP and wait for Boss's choice
3. **CHECKPOINT:** Save Phase 2 data to checkpoint file  ← NEW
```

---

### In `/kamiflow:dev:lazy`

**Same checkpoint integration:**
- After Phase 1: Save questions, answers
- After Phase 2: Save selected option
- Continue with checkpoints through Phase 4

---

### In `/kamiflow:core:idea` (individual command)

**Optional checkpoint:**
- After generating S1-IDEA → Save checkpoint
- Allows: Later continue with `/kamiflow:core:spec <checkpoint>`

---

## 8. Error Recovery Integration

### Checkpoints + Error Recovery

**When Error Occurs:**

1. **Last known good checkpoint** is already saved
2. **Error recovery** can reference checkpoint data
3. **Resume** picks up from last good state (not from error point)

**Example:**

```
Error during Phase 3A (artifact generation)
  ↓
Phase 2 checkpoint exists (option selected, S1 created)
  ↓
Error recovery escalates (Level 3)
  ↓
User runs: /kamiflow:dev:revise 042
  ↓
Revise loads Phase 2 checkpoint data
  ↓
Fresh S1-IDEA generated with error context
  ↓
Continue from Phase 3A with corrections
```

**Benefit:** Don't lose Phase 1-2 work when Phase 3 fails

---

## 9. Performance Considerations

### Checkpoint Overhead

**Write Time:**
- JSON serialization: ~10ms per checkpoint
- File write: ~50ms
- **Total:** < 100ms per checkpoint (negligible)

**Storage:**
- Average checkpoint: 5-15 KB
- 7 checkpoints per task: ~50 KB total
- 100 tasks/year: ~5 MB/year
- **Verdict:** Storage impact minimal

**Read Time (Resume):**
- File read: ~50ms
- JSON parse: ~10ms
- **Total:** < 100ms (instant resume)

---

### Optimization

**Lazy Writing:**
- Only write checkpoint if phase succeeded
- Skip checkpoint if phase failed (use previous)

**Compression:**
- For long-term storage (>30 days), gzip checkpoints
- Reduces storage by ~70%

**Caching:**
- Keep current checkpoint in memory
- Avoid re-reading for progress display

---

## 10. Future Enhancements

### Planned Features

**Multi-Session Support:**
- Share checkpoints across different IDE sessions
- Cloud backup of checkpoints (optional)

**Checkpoint Diff:**
- Show what changed between checkpoints
- Useful for debugging workflow issues

**Checkpoint Analytics:**
- Track phase durations over time
- Identify bottlenecks in workflow

**Smart Resume:**
- Auto-resume interrupted workflows on restart
- "Looks like you have an incomplete task. Resume?"

---

## 11. Current Limitations

**v1.0 Limitations:**
- Manual resume only (no auto-resume)
- No checkpoint merging (can't combine parallel workflows)
- No rollback (can't go back to earlier checkpoint)
- No checkpoint validation (assumes data integrity)

**Workarounds:**
- Manual resume via proposed `/kamiflow:ops:resume` command
- Checkpoint cleanup via file system operations
- Validation via JSON schema (future enhancement)

---

## 12. Implementation Status

**Current State:** ✅ DESIGNED (not yet implemented in code)

**Implementation Checklist:**
- [ ] Create checkpoint schema (JSON)
- [ ] Add checkpoint saving logic to superlazy-logic.md
- [ ] Create `/kamiflow:ops:resume` command
- [ ] Add progress indicators to CLI output
- [ ] Implement automatic cleanup
- [ ] Add checkpoint validation
- [ ] Write tests for checkpoint save/load

**Estimated Effort:** 2-3 days development + testing

---

## ✅ Success Criteria

**Checkpoints are effective when:**
1. **Workflow interruption** doesn't lose progress (resume works)
2. **Progress visibility** keeps user informed (< 10% "how long?" questions)
3. **Resume success rate** > 95% (checkpoints valid and restorable)
4. **Overhead** < 1% of total workflow time
5. **User satisfaction** with ability to pause/resume

---

## 🔗 Related Protocols

- `@.gemini/rules/error-recovery.md` - Checkpoint usage in error scenarios
- `@.gemini/rules/flow-execution.md` - Strategic Atomic Exit (final checkpoint)
- `/kamiflow:ops:resume` command (to be implemented)
- `/kamiflow:dev:superlazy` logic (checkpoint integration points)
