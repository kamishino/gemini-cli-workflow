---
name: spec-guide
type: RULE_MODULE
description: [KamiFlow Sniper] Detailed protocol for Schema-First Specification (S2-SPEC).
group: sniper
order: 21
---

# 📖 S2-SPEC Guide: Schema-First Design Protocol

## 1. User Stories

Define 3-5 User Stories. Format: `As a [User], I want [Action] so that [Benefit]`. Include Acceptance Criteria.

## 2. Data Models (Lock 2 - MANDATORY)

Define Interfaces, Types, or Database schemas BEFORE any logic.

- Rule: Logic without Schema is forbidden.

## 3. API & Interfaces

- Function signatures with Types.
- Component props.
- Endpoint definitions.

## 4. Risk Assessment (Critical Mode Only)

Trigger: Task is 🔴 Critical or low star rating.

- Risk Matrix: Probability x Impact.
- Mitigation & Rollback plans.

## 5. Test Specification (TDD Mandate)

- TC-1: Happy Path.
- TC-2: Edge Case.
- TC-3: Error Case.
- Assertion Strategy: How to prove it works.

---

## 6. 📄 S2-SPEC MANDATORY TEMPLATE

Copy and fill in this exact template. DO NOT omit any section.

````markdown
# 🏭 SPECIFICATION: [Feature Name]

**ID:** [ID]
**Type:** SPEC
**Slug:** [slug]
**Parent:** [ID]-S1-IDEA-[slug].md
**Status:** DRAFT

---

## 📌 Context Anchoring (Lock 1)

- **Project Goal:** [From PROJECT_CONTEXT.md]
- **Core Painkiller:** [The #1 problem this SPEC solves]

## 1. User Stories 👤

- **Story:** As a [User], I want [Action] so that [Benefit].
  - _Acceptance:_ [Criteria 1]
  - _Acceptance:_ [Criteria 2]

## 2. Data Models & Schema (Lock 2 - MANDATORY FIRST) 💾

```typescript
/ Define interfaces, types, or schemas here
```
````

## 3. API Signatures & Interfaces 🔌

- **Function/Endpoint:** `name(params): return`
- **Component:** `PascalCase(props)`

## 4. Business Logic & Workflows 🧠

1. [Step 1]
2. [Step 2]

## 4.5 Test Specification (TDD Mandate) 🧪

### Test Cases

- **TC-1:** [Scenario] -> [Expected Outcome]
- **TC-2:** [Edge Case] -> [Expected Error/Behavior]

### Assertion Strategy

- [e.g., Unit tests for helper functions using Jest]

## 5. UI/UX Specifications 🎨

- **Aesthetic Goal:** [Consistent with "Aesthetics + Utility"]
- **Key Elements:** [Components to build]

## 6. Integration Points 🔗

- [Module A]
- [Module B]

## 7. Non-Goals & Constraints ⛔

- [What we are NOT building]
- [Constraint X]

## 8. Implementation Trade-offs ⚖️

- **Trade-off 1:** [Option A vs Option B] -> [Chosen path]

```

```
