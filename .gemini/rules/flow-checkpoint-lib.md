---
name: flow-checkpoint-lib
type: RULE_MODULE
description: Checkpoint management and visibility library
group: global
order: 91
parent_rule: flow-checkpoint
is_core: false
dependencies: ["flow-checkpoint-core"]
---

# 📚 Checkpoint Library

## 1. Management & Cleanup

- **Retention:** Active (All), Completed (Final only), Failed (30 days).
- **Cleanup:** Delete intermediate checkpoints after Phase 4 archive.

## 2. Progress Visibility

- **Indicators:** Phase status (Complete/In Progress/Pending), Elapsed time, Estimated remaining.
- **Notifications:** "Checkpoint saved: Phase X complete. Resume with /resume [ID]".

## 3. Performance & Optimization

- **Overhead:** < 100ms per save/load.
- **Optimization:** Lazy writing (only on success), Gzip compression for old checkpoints, Memory caching.

## 4. Future Enhancements

- Multi-session support, Checkpoint Diff, Analytics, Smart Auto-resume.
