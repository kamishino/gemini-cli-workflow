---
name: std-id-lib
type: RULE_MODULE
description: ID generation test cases and technical implementation
group: global
order: 131
parent_rule: std-id
is_core: false
dependencies: ["std-id-core"]
---

# 📚 ID Library

## 1. PowerShell Implementation
```powershell
$files = Get-ChildItem -Path tasks, archive -Filter *.md -Recurse
$ids = $files | ForEach-Object { if ($_.Name -match '^(\d{3})') { [int]$matches[1] } }
$maxId = if ($ids.Count -gt 0) { ($ids | Measure-Object -Maximum).Maximum } else { 0 }
```

## 2. Test Cases
- **Case 1 (Empty):** Next ID = 001.
- **Case 2 (Sequential):** 001, 002 → 003.
- **Case 3 (Gaps):** 001, 005, 007 → 008.
- **Case 4 (Collision):** 007 existing → 007-1.

## 3. Feedback Format
- **Cached:** "Task ID (Cached) - Next: 011".
- **Reactive:** "Task ID Reconnaissance (Reactive) - Scanned tasks/archive - Next: 013".
