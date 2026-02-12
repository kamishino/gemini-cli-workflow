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

### 3.1 Scoring Rubric (Clarify Score)
- **10/10 (Perfect Knowledge):** You have physically read the target files, verified the line numbers, and confirmed no external dependencies are missing.
- **9.0-9.9 (Strong Concept):** You know *what* to do and *where*, but haven't verified every single line. **Max score for memory-based tasks.**
- **< 8.0 (Ambiguous):** Missing critical context. Questions required.

### 3.2 Protocol
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

---

## 5. 📄 S1-IDEA MANDATORY TEMPLATE

Copy and fill in this exact template. DO NOT omit any section.

```markdown
# 💡 IDEA: [Feature Name]

**ID:** [ID]
**Type:** [FEATURE|REFACTOR|CHORE|DOCS]
**Slug:** [slug]
**Status:** APPROVED
**Clarify Score:** [X.X]/10
**Chosen Option:** [Option A/B/C]
**From Idea:** [Original ID if applicable]

---

## 0. PRE-FLIGHT VERIFICATION 🔍

[Insert the full Assumption Verification Report here]

## 1. The Vision & Strategic Context 👁️

[Deep narrative explanation. Do not use bullet points if a paragraph tells the story better. Explain NOT JUST "what", but "why this, why now, and what's the future". Make it inspiring.]

## 2. Diagnostic Context 🧠

> **From the interview:** [Quote key user insights/requirements]

- **Diagnostic Insights:** [Summary of what we learned]
- **Decision Reasoning:** [Why we chose this specific approach over others]

## 3. Core Problem 🚩

[List the pain points this feature solves]

## 4. Key Features (MVP Scope) 🎯

| Feature     | MoSCoW      | Notes           |
| :---------- | :---------- | :-------------- |
| [Feature 1] | Must Have   | [Why critical]  |
| [Feature 2] | Should Have | [Why important] |

## 5. Technical Approach 🏗️

[High-level technical strategy]

## 6. Success Criteria ✅

- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## 7. Estimated Timeline ⏳

[X days/weeks]

## 8. Next Step 🚀

Run `/kamiflow:core:spec ./.kamiflow/tasks/[ID]-S1-IDEA-[slug].md` to create detailed specification.
```
