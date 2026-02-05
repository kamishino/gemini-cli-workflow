---
name: std-id-core
type: RULE_MODULE
description: Global Task ID generation protocol and format
group: global
order: 130
parent_rule: std-id
is_core: true
---

# 🔍 ID Core Protocol

## 1. Canonical Format
`[ID]-[Phase]-[Type]-[slug].md`
- **ID:** 3-digit zero-padded number.
- **Suffix:** `-[ID]-[suffix]-...` if collision detected.

## 2. Discovery Protocol (The Scout)
- **Rule:** `Next ID = MAX(all discovered IDs) + 1`.
- **Scan:** tasks/ and archive/ recursively.
- **Regex:** `^(\d{3})` for IDs, `^(\d{3})(?:-(\d+))?-` for suffixes.

## 3. Session-Based Caching
- Scan once during `/wake`.
- Store `cached_max_id` in RAM.
- Reactive Scan: Only if user requests correction.