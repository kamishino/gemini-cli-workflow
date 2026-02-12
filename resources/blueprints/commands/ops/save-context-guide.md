---
name: save-context-guide
type: PARTIAL
description: [KamiFlow] Detailed protocol for Session Context Preservation (PROJECT_CONTEXT.md).
group: ops
order: 31
---

# 📖 Save Context Guide: Intelligence Export Protocol

## 1. State Analysis
Extract text-based summaries for:
- **Last Action:** Value-driven completion statement.
- **Focus:** Current active task description.
- **Next Step:** Specific, actionable next command.
- **Metrics:** Validation rates and error patterns.

## 2. Private Folder Enrichment
- **tasks/:** Scan IDs, titles, and status.
- **ideas/:** Count discovery/backlog/draft files.
- **checkpoints/:** Identify paused workflows and resume commands.
- **logs/:** Extract quality metrics from handoff logs.

## 3. Session State Sections
- **Active Work:** Current in-progress task list.
- **Discovery Pipeline:** Count and topics.
- **Checkpoints:** IDs and resume instructions.
- **Quality Snapshot:** Pass rates and common pitfalls.
- **Follow-Up Queue:** Ordered next actions.
- **Tech Debt:** Categorized inventory.

## 4. Cross-Machine Validation
- **No Absolute Paths:** Use relative paths or text descriptions only.
- **Plain Text:** Ensure git-trackability.
- **Self-Contained:** Context must make sense without private folder access.
