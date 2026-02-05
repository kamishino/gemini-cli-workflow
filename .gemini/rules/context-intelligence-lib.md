---
name: context-intelligence-lib
type: RULE_MODULE
description: Private folder enrichment and validation details
group: global
order: 86
parent_rule: context-intelligence-v2
is_core: false
dependencies: ["context-intelligence-core"]
---

# 📚 Context Intelligence Library

## 1. Private Enrichment (Optional)
- **tasks/:** Enrich active work understanding.
- **ideas/:** Verify discovery pipeline counts.
- **checkpoints/:** Verify paused workflows for resume.
- **archive/:** Verify achievements against ROADMAP.

## 2. Context Quality Validation
- **Timestamps:** Warn if PROJECT_CONTEXT > 7 days old.
- **Missing Data:** Warn if Session State or Quality Metrics sections are absent.
- **Action:** Suggest `/kamiflow:ops:save-context` if stale.

## 3. Cross-Machine Consistency
Ensures same AI awareness on all PCs via git-tracked public files. No DB required.
