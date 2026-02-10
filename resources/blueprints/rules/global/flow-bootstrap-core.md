---
name: flow-bootstrap-core
type: RULE
description: Portal network initialization protocol
group: global
order: 40
---

# 🔗 The Bootstrap Protocol: Portal Network Initialization

> **Purpose:** Initialize KamiFlow as an injectable "OS" via Git Submodules or Global Link.

---

## 1. 🎯 Core Principle: The Portal Network

KamiFlow core lives in `.kami-flow/` (or global storage) but operates at the root level through **Symbolic Links (Portals)**. This maintains a single source of truth while keeping project-specific files unique.

---

## 2. 📋 Minimalist Distribution Architecture (v2.16.5+)

### MANDATORY Portals

1. `./.gemini/` → Link to `core/.gemini/` (Commands, Rules, Skills).
2. `./.windsurf/` → Link to `core/.windsurf/` (IDE Workflows).

### FORBIDDEN Duplication

- Do NOT link documentation or overview files to project root. These are now accessed through the `./.gemini/` portal by the AI.

---

## 3. 🛠 Setup Workflow (init)

### Step 1: Create Symbolic Links

Execute PowerShell commands to connect the core to project root:

- `./.gemini/` (Directory Link)
- `./.windsurf/` (Directory Link)

### Step 2: Initialize Project-Specific Files

If missing, seed from `./resources/templates/` via Gemini AI:

1. **GEMINI.md:** The project manifest and persona.
2. **{{KAMI_WORKSPACE}}PROJECT_CONTEXT.md:** The project memory (RAM).
3. **{{KAMI_WORKSPACE}}ROADMAP.md:** The strategic progress tracker.

### Step 3: Configure Smart Ignore

MANDATORY: Add `{{KAMI_WORKSPACE}}` to `.geminiignore` to prevent "Double Vision" (AI reading rules from both link and submodule).

---

## ⚠️ Safety Rules

- **Permission Check:** Windows requires Developer Mode or Admin rights for symlinks.
- **SSOT:** Never modify files inside the `.gemini/` portal from a project repo; all core changes must happen in the KamiFlow source repo.
- **Integrity:** Use `kami doctor` to verify portal health.

## ✅ Success Criteria

- Repo root is clean (only 2 hidden folders and 3 proxy files).
- AI has 100% access to core commands and rules via portals.
