---
name: std-anti-hallucination-core
type: RULE_MODULE
description: Core verification protocol to prevent AI hallucinations
group: safety
order: 150
parent_rule: std-anti-hallucination
is_core: true
---

# 🛡️ Anti-Hallucination Core

## 1. Hallucination Patterns
- **Type 1: Ghost Files** (references non-existent files).
- **Type 2: Phantom Functions** (invents signatures/anchors).
- **Type 3: Phantom Deps** (assumes uninstalled libraries).
- **Type 4: Phantom Config** (invents options/env vars).

## 2. Phase 0.5: Assumption Verification
**Trigger:** BEFORE Phase 1 (Idea) or Step 3 (Build).
- **Step 1: File Verification** - Use `list_dir` and `read_file` to confirm existence.
- **Step 2: Function Verification** - Use `grep_search` to confirm anchors.
- **Step 3: Dependency Verification** - Check `package.json`.
- **Step 4: Config Verification** - Check `.kamirc.json` or `PROJECT_CONTEXT.md`.

## 3. Continuous Verification
- **Pre-Edit Checklist:** Verify file, read content, identify anchor, confirm via grep.
- **S3-BUILD Template:** Each task must include Pre-Task Verification steps.

## 4. Detection & Self-Correction
- **Red Flags:** Line numbers without reading, referencing without `read_file`, citing unverified libraries.
- **Protocol:** PAUSE → Identify Assumption → Run Verification Tool → Correct or Report.
