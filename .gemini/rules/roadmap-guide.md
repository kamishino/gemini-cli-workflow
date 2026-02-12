---
name: roadmap-guide
type: RULE_MODULE
description: [KamiFlow] Detailed protocol for Strategic Roadmap Aggregation.
group: ops
order: 31
---

# 📖 Roadmap Guide: Aggregation Protocol

## 1. Intelligence Extraction
- **From PROJECT_CONTEXT:** Extract "Session State" (Active work, discoveries, metrics, follow-up).
- **From Archive (Optional):** Read handoff logs for undocumented achievements.
- **From Discovery:** Count pending ideas in discovery/backlog.

## 2. Placeholder Content
- **{{ACHIEVEMENTS}}:** Append new entries. Group by version. Keep ~20 visible.
- **{{GROWTH_LEVERS}}:** Propose 3 ideas based on gaps and tech stack capabilities.
- **{{METRICS}}:** Update validation pass rate, hallucination count, and debt score.

## 3. Cross-Machine Consistency
- **Rule:** Never require private folders for basic updates.
- **Incremental:** Append new data, never discard history.
- **Format:** Plain text only for git-trackability.

## 4. Error Recovery
- **Missing File:** Run `kami roadmap` to generate initial structure.
- **Generator Fail:** Create basic sections (Achievements, Focus, Levers) manually.

