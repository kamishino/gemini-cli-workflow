# 📜 Rule: Blueprint & Transpiler Discipline

> **Goal:** Ensure 100% compliance with the Universal Transpiler protocol.

---

## 1. 🛑 NON-NEGOTIABLES

- **Never edit .toml files directly:** All changes to commands MUST happen in `./resources/blueprints/commands/`.
- **Metadata is Mandatory:** Every new partial MUST include: `name`, `type`, `description`, `group`, `order`.
- **No Junk:** Do not create temporary or unmapped files in the `./resources/blueprints/` directory.

## 2. 🏗️ ARCHITECTURE ENFORCEMENT

- Follow the hierarchy: `./resources/blueprints/[type]/[category]/[slug].md`.
- Group names MUST match the folder name (e.g., `group: p-seed` for files in `commands/p-seed/`).

## 3. 🔄 THE BUILD LOOP

Before completing a task that modifies logic:

1. Run `kami sync` (if affecting command lists).
2. Run `kami transpile`.
3. Verify the output in `./.gemini/commands/`.
4. Check the `./.backup/` folder to ensure history is preserved.

## 4. 🧠 AI BEHAVIOR

If you (the AI) are asked to create a new command:

1. First, create the Markdown partial in the appropriate `./resources/blueprints/commands/` subfolder.
2. Second, add the mapping to `./resources/blueprints/registry.md`.
3. Third, run the transpile sequence.

---

## 5. 📊 S3-BUILD Task Dependency Graph (NEW in v2.39)

### Purpose

Enable parallel execution and clear task ordering by adding dependency annotations to S3-BUILD tasks.

### Dependency Annotation Format

Each task in S3-BUILD should include dependency metadata:

```markdown
- [ ] **Step X: [Task Description]**
  - **DEPENDS:** [none | list of step numbers]
  - **BLOCKS:** [none | list of step numbers]
  - **PARALLEL:** [true | false]
  - **Target:** `path/to/file.ext`
  - **Anchor:** `functionName()` at line ~XX
```

### Example S3-BUILD with Dependencies

```markdown
# S3-BUILD: 045-oauth-integration

## Execution Graph
```

Step 1 (Auth Module)
↓
┌─┴─┐
↓ ↓
Step 2 Step 3 (can run in parallel)
↓ ↓
└─┬─┘
↓
Step 4 (Integration Test)

```

## Tasks

- [ ] **Step 1: Create auth module scaffold**
  - **DEPENDS:** none
  - **BLOCKS:** [2, 3]
  - **PARALLEL:** false
  - **Target:** `cli-core/utils/auth.js`
  - **Anchor:** New file
  - **Action:** Create OAuth2 module with passport.js integration

- [ ] **Step 2: Add OAuth routes**
  - **DEPENDS:** [1]
  - **BLOCKS:** [4]
  - **PARALLEL:** true (can run with Step 3)
  - **Target:** `cli-core/routes/auth-routes.js`
  - **Anchor:** `module.exports` at end of file
  - **Action:** Add /auth/google and /auth/github endpoints

- [ ] **Step 3: Update middleware**
  - **DEPENDS:** [1]
  - **BLOCKS:** [4]
  - **PARALLEL:** true (can run with Step 2)
  - **Target:** `cli-core/middleware/auth-middleware.js`
  - **Anchor:** `verifyToken()` function
  - **Action:** Add OAuth token verification logic

- [ ] **Step 4: Integration test**
  - **DEPENDS:** [2, 3]
  - **BLOCKS:** none
  - **PARALLEL:** false
  - **Target:** `cli-core/tests/auth.test.js`
  - **Anchor:** New file
  - **Action:** Create E2E tests for OAuth flow
```

### Dependency Rules

| Rule                   | Description                                   |
| ---------------------- | --------------------------------------------- |
| **No Circular**        | Task cannot depend on itself or create cycles |
| **Explicit Blocking**  | If A blocks B, then B must depend on A        |
| **Parallel Safety**    | Parallel tasks must not modify same file      |
| **Sequential Default** | If PARALLEL not specified, assume false       |

### Execution Order Algorithm

```
1. Find all tasks with DEPENDS: none → Start Set
2. Execute Start Set
3. For each completed task:
   a. Find tasks that depended on it
   b. Check if all their dependencies are complete
   c. If yes and PARALLEL: true → Add to parallel batch
   d. If yes and PARALLEL: false → Execute sequentially
4. Repeat until all tasks complete
```

### Swarm Integration

When using `/kamiflow:p-swarm:run`, the dependency graph enables:

- **Automatic parallelization** of independent tasks
- **Safe sequencing** of dependent tasks
- **Conflict detection** for parallel file access
- **Progress tracking** per dependency chain

### Simplified Format (Optional)

For simple tasks, use inline notation:

```markdown
- [ ] **Step 1:** Create module [→ 2, 3]
- [ ] **Step 2:** Add routes [← 1] [→ 4] [∥ 3]
- [ ] **Step 3:** Update middleware [← 1] [→ 4] [∥ 2]
- [ ] **Step 4:** Integration test [← 2, 3]
```

Legend:

- `→` blocks (downstream dependencies)
- `←` depends on (upstream dependencies)
- `∥` can run parallel with

---

## 6. 📋 Artifact Templates Quick Reference

### S1-IDEA Template

```markdown
# S1-IDEA: [ID]-[slug]

## Diagnostic Summary

[Key insights from interview]

## Options

| Option | Description | Ratings | Confidence |
| ------ | ----------- | ------- | ---------- |
| A      | Safe & Fast | ⭐⭐⭐⭐    | 🟢 HIGH     |
| B      | Balanced    | ⭐⭐⭐⭐    | 🟡 MEDIUM   |
| C      | Ambitious   | ⭐⭐⭐⭐⭐   | 🔴 LOW      |

## Selected: [Option]

[Justification]
```

### S2-SPEC Template

```markdown
# S2-SPEC: [ID]-[slug]

## Schema (Lock 2)

[Data models, interfaces, types]

## User Stories

[As a... I want... So that...]

## API Signatures

[Function signatures with types]

## Edge Cases

[Boundary conditions, error states]
```

### S3-BUILD Template

```markdown
# S3-BUILD: [ID]-[slug]

## Execution Graph

[ASCII dependency visualization]

## Tasks

[Tasks with DEPENDS/BLOCKS/PARALLEL annotations]

## Validation Plan

[Lint, test, syntax checks]
```

### S4-HANDOFF Template

```markdown
# S4-HANDOFF: [ID]-[slug]

## Objective

[1-2 sentence goal]

## Source of Truth

- S2-SPEC: [path]
- S3-BUILD: [path]

## Constraints

[Technical rules]

## Documentation Contract

[Files to update]
```
