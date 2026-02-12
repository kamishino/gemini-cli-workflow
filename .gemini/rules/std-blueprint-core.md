---
name: std-blueprint-core
type: RULE
description: Universal transpiler discipline and task dependency standards
group: local
order: 200
---

# 📜 Blueprint & Transpiler Discipline (Compressed)

## 1. Non-Negotiables
- **No Direct Edits:** Modify `resources/blueprints/commands/` ONLY.
- **Metadata:** Mandatory: `name`, `type`, `description`, `group`, `order`.
- **Sync Loop:** `kami sync` -> `kami transpile` -> Verify.

## 2. Dependency Graph (S3-BUILD)
Annotate tasks with:
- **DEPENDS:** [none | IDs] (upstream)
- **BLOCKS:** [none | IDs] (downstream)
- **PARALLEL:** [true | false] (safety first)

## 3. Inline Notation
`- [ ] Step 1: Create [→ 2, 3]`
`- [ ] Step 2: Add routes [← 1] [→ 4] [∥ 3]`

## 4. Templates
- **S1-IDEA:** Diagnostic, Options (A/B/C), Selection.
- **S2-SPEC:** Schema (Lock 2), Stories, API, Edge Cases.
- **S3-BUILD:** Graph, Tasks (DEPENDS/PARALLEL), Validation.
- **S4-HANDOFF:** Objective, SSOT Links, Constraints, Contract.
