---
name: std-atomic-rule-core
type: RULE
description: Standard for splitting large rules into atomic modules for Token efficiency
group: local
order: 210
---

# 📜 Rule: Atomic Rule Standardization

> **Goal:** Maintain maximum Token efficiency by modularizing all behavioral rules.

---

## 1. Modularization Threshold
Every rule file exceeding **8KB** or containing significant library/example content MUST be split into a Core and Library module.

## 2. File Structure
Rules must be placed in `resources/blueprints/rules/global/modules/` using the following naming convention:
- **Core:** `[slug]-core.md` (Mandatory mandates, logic, gate rules).
- **Library:** `[slug]-lib.md` (Optional examples, log templates, tool refs).

## 3. Metadata Requirements

### 3.1 Core Module
```yaml
type: "RULE_MODULE"
is_core: true
order: [Original Order]
```

### 3.2 Library Module
```yaml
type: "RULE_MODULE"
is_core: false
dependencies: ["[slug]-core"]
order: [Original Order + 1]
```

## 4. Design Principles
1. **Core First:** The Core module must be sufficient for the AI to operate correctly in 90% of scenarios.
2. **Lazy Loading:** Library modules are only loaded via self-healing or explicit user request.
3. **No Redundancy:** Do not duplicate content between Core and Library.
4. **Token Target:** Core modules should ideally stay below **4KB**.