---
name: idea-guide
type: RULE_MODULE
description: [KamiFlow Sniper] Detailed protocol for Diagnostic Interview and Strategic Synthesis (S1-IDEA).
group: sniper
order: 11
---

# 📖 S1-IDEA Guide: Diagnostic & Synthesis Protocol

## 1. ID Generation Details
- **Fast Mode:** Use `cached_max_id` from session.
- **Reactive Mode:** Triggered by user doubt. Run global scan on `tasks/` and `archive/`. Regex: `^(\d{3})`.

## 2. Assumption Verification (Anti-Hallucination)
- **Files:** Confirm path existence and read content.
- **Code:** Search functions/variables via `grep_search`.
- **Deps:** Check `package.json`.
- **Config:** Verify `.kamirc.json` and `PROJECT_CONTEXT.md`.

## 3. The Diagnostic Interview (Phase 1)
- **Goal:** Reach Clarify Score >= 8.0.
- **Ambiguity Nodes:** Identify gaps in Requirements, Anchoring, or Context.
- **Probing:** Ask 3-5 deep questions.
- **Historical Recall:** Run `kami _recall` to fetch past lessons.

## 4. Strategic Synthesis (Phase 2)
- **Option A (Safe & Fast):** MVP-only, no "Could Have" features.
- **Option B (Balanced):** Value vs Complexity balance.
- **Option C (Ambitious):** Full vision, high complexity.
- **Weighted Scoring:** Market Pain, Feasibility, Stack Alignment, Profit Potential.
- **MoSCoW:** Must Have, Should Have, Could Have, Won't Have.

## 5. Output Format (S1-IDEA)
- Section 0: Verification Report.
- Section 1: Vision.
- Section 2: Decision Reasoning.
- Section 4: MVP Scope Table (MoSCoW).
- Section 5: Technical Approach.

