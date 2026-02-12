---
name: wake-guide
type: RULE_MODULE
description: [KamiFlow] Detailed protocol for Project Wake and Onboarding.
group: ops
order: 11
---

# 📖 Wake Guide: Context Restoration Protocol

## 1. Case A: Normal Wake (Existing Project)
- **Priority 1: Public-First Loading:** Read `PROJECT_CONTEXT.md`, `ROADMAP.md`, `GEMINI.md`. Initialize ID Cache.
- **Priority 2: Private Enrichment:** Scan `checkpoints/` for active JSON files. Filter completed/archived tasks.
- **Status Report:** Provide concise summary of Project, Phase, Goals, and Session State.

## 2. Case B: Intelligent Onboarding (New Project)
- **Stage 1: Language Harmony:** Confirm Tiếng Việt vs English.
- **Stage 2: Identity:** Confirm Project Name.
- **Stage 3: Architect Suggestion:** Propose clear Goal and Tech Stack based on Name.
- **Stage 4: Commit & Init:** Update public files, set state `hasUsedKamiFlow: true`.
- **Stage 5: v2.0 Overview:** Introduce Anti-Hallucination, Validation, and Checkpoints.

## 3. Post-Setup Training
- If NEW user: Present Quick Start Guide and offer `/tour`.
- If EXPERIENCED: Welcome back and highlight v2.0 changes.

