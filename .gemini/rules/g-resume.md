---
name: resume-guide
type: RULE_MODULE
description: [KamiFlow] Detailed protocol for Workflow Checkpoint Recovery.
group: ops
order: 21
---

# 📖 Resume Guide: Checkpoint Recovery Protocol

## 1. Safety Checks
- **Staleness:** > 7 days (Warn), > 30 days (Strong Warn/Restart).
- **Artifact Integrity:** Confirm S1, S2, S3, S4 files exist per `checkpoint.artifacts`.
- **State Divergence:** Compare current `PROJECT_CONTEXT.md` with saved context.

## 2. Context Restoration
- Parse `checkpoint.json` -> Extract `phaseData`.
- Reload artifacts into working memory.
- Restore user selections (Options, Q&A).

## 3. Phase-Specific Resume
- **Phase 1 (Idea):** Reload questions, continue from next unanswered.
- **Phase 2 (Synthesis):** Re-present options from checkpoint.
- **Phase 3A (Generation):** Generate missing S2/S3/S4 artifacts.
- **Phase 3B (Validation):** Trigger Validation Loop (Phase A/B/C).
- **Phase 4 (Exit):** Trigger Quality Gate & Reflection.

## 4. Error Handling
- **Corrupt JSON:** Suggest restart.
- **Modified Artifacts:** Option to merge or discard manual changes.
- **Validation Failure:** Apply Error Recovery Protocol (Level 1/2/3).

