---
name: flow-fast-track-lib
type: RULE_MODULE
description: Fast Track logging and templates
group: global
order: 61
parent_rule: flow-fast-track
is_core: false
dependencies: ["flow-fast-track-core"]
---

# 📚 Fast Track Library

## 1. Minimal S3-BUILD Template
- **Target:** File, Function, Line Range.
- **Task:** Action, Anchor, Change, Verify.
- **Lock 3 Verification status.**
- **Abbreviated Validation Plan.**

## 2. Fast Track Logging
**Path:** `./.kamiflow/fast-track-log.json`
**Entry:** ID, timestamp, classification, criteria_met, file, duration, validation_passed.

## 3. Configuration
- **.kamirc.json:** `fastTrack.enabled`, `maxLines` (50), `logPath`.
- **Manual Toggle:** `/kamiflow:core:idea --fast`.
