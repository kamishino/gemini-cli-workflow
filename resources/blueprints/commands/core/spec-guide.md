---
name: spec-guide
type: PARTIAL
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

## 6. Business Logic & Workflows
Sequential steps for technical implementation.

## 7. Non-Goals & Constraints
Explicitly list out-of-scope items.
