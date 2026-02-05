---
name: std-anti-hallucination-lib
type: RULE_MODULE
description: Templates and references for anti-hallucination verification
group: safety
order: 151
parent_rule: std-anti-hallucination
is_core: false
dependencies: ["std-anti-hallucination-core"]
---

# 📚 Anti-Hallucination Library

## 1. Verification Report Format
**Sections:** Verified Files, Verified Functions/Variables, Verified Dependencies, Verified Configuration, Assumptions Made (with risk/mitigation), Hallucination Risks Identified.

## 2. Tools Reference
- **Files:** `read_file`, `list_dir`, `find_by_name`.
- **Code:** `grep_search`, `code_search`.
- **Execution:** `node --check` (syntax), `npm list` (deps).

## 3. Error Messages
- **Hallucination Risk Detected:** List missing items, actions taken, and offer options (Proceed modified / Wait for user / Create missing).
- **Verification Success:** Confirm counts of verified items and clear status.

## 4. Success Criteria
- 100% detection of ghost references before planning.
- < 5% false positives.
- > 80% reduction in cascading errors.
