---
name: flow-factory-line-core
type: RULE
description: Sniper Model factory line protocol
group: global
order: 50
---

# 🏭 Sniper Model Protocol (Compressed)

## 1. Fast Track (< 10s Decision)
**Trigger:** Single file, < 50 lines, no schema change, no security risk, no dependencies.
**Flow:** `Recon (Lock 3)` -> `Minimal S3-BUILD` -> `Execute`.

## 2. Standard Workflow
- **Phase 0 (Guard):** Read `PROJECT_CONTEXT.md`. Stop if conflicts exist.
- **Phase 1 (Idea):** 3-5 Questions -> 3 Options (A/B/C) -> Strategic Gate.
- **Phase 2 (Spec):** Lock 1 (Context) + Lock 2 (Schema-First).
- **Phase 3 (Build):** Lock 3 (Legacy Recon). Define Anchors. TDD if High-Risk.

## 3. The 3-Layer Locks
1. **Lock 1 (Context):** Read memory to align goals.
2. **Lock 2 (Schema):** Data structures BEFORE logic.
3. **Lock 3 (Legacy):** Scan existing code to prevent regression.

## 4. Forbidden
- Skipping Diagnostic Gate.
- Writing logic before Schema (Lock 2).
- Assuming file exists without Lock 3.
