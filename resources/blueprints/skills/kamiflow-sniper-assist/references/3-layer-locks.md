# 🔒 The 3-Layer Locks Architecture

> Quick reference for the Sniper Model's constraint system.

## Lock 1: Context Anchoring

**When:** Before SPEC phase
**Action:** Read `PROJECT_CONTEXT.md`
**Purpose:** Prevent session amnesia, ensure alignment with project state

## Lock 2: Schema-First

**When:** During SPEC phase
**Action:** Define data models BEFORE business logic
**Purpose:** Prevent logic drift, ensure structural foundation

## Lock 3: Legacy Awareness

**When:** Before BUILD phase
**Action:** Scan existing codebase for related code
**Purpose:** Prevent duplication, identify side-effects, enable safe refactoring
