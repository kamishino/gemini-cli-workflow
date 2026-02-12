---
name: flow-bridge-core
type: RULE
description: Seamless context handoff between Terminal and IDE
group: global
order: 60
---

# 🌉 IDE Bridge Protocol (Compressed)

## 1. Output Modes
- **Full:** All S1-S4 artifacts. For complex tasks.
- **Executor:** S3-BUILD + constraints only. For clear specs.
- **Minimal:** Task + Anchor + Verify only. For Fast Track.

## 2. Mandatory Contents (Full)
- **Objective:** High-level goal.
- **SSOT:** Links to S2-SPEC & S3-BUILD.
- **Battle Plan:** Task list with Anchor Points.
- **Contract:** Required file updates (ROADMAP, Context).

## 3. Sync Back
After IDE implementation, run `/kamiflow:ops:sync`.
- Process handoff logs.
- Update `PROJECT_CONTEXT.md` & `ROADMAP.md`.
- Offer Atomic Exit (Archive).

## 4. Constraints
- Max file size: 300 lines.
- Follow existing code style.
- Update tests if modifying logic.
