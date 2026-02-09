---
name: flow-checkpoint-core
type: RULE_MODULE
description: Core checkpoint system and data schema
group: global
order: 90
parent_rule: flow-checkpoint
is_core: true
---

# 📍 Checkpoint Core

## 1. Checkpoint System
- **Purpose:** Enable workflow resume without context loss.
- **Milestones:** Phase 0, 0.5, 1, 2, 3A, 3B, 4 (Complete).

## 2. Data Schema & Storage
- **Directory:** `./.kamiflow/checkpoints/`
- **Pattern:** `[ID]-checkpoint-[phase].json`
- **Fields:** Version, TaskId, Slug, Phase, Timestamp, Artifacts (S1-S4 paths), PhaseData, Metadata.

## 3. Resume Protocol
- **Discovery:** Find latest checkpoint JSON.
- **Verification:** Integrity check (artifacts exist), Staleness check (>7 days), Project state alignment.
- **Reload:** Restore PhaseData and jump to `nextPhase`.

## 4. Current Status
- **Implementation:** DESIGNED.
- **Checklist:** Schema creation, logic integration, `/resume` command.
