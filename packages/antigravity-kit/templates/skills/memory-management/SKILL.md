---
name: memory-management
description: How to read, write, and maintain the .memory/ persistent context files
---

# Memory Management Skill

This skill teaches you how to use the `.memory/` directory to persist intelligence across sessions.

## The 4 Memory Files

| File                       | Type          | Purpose                                                   |
| :------------------------- | :------------ | :-------------------------------------------------------- |
| `.memory/context.md`       | Overwrite     | Current project state — what's active, recent, and open   |
| `.memory/decisions.md`     | Append-only   | Architectural decisions — why things are the way they are |
| `.memory/patterns.md`      | Append/Update | Code patterns — naming, structure, conventions            |
| `.memory/anti-patterns.md` | Append-only   | Mistakes learned — auto-updated on repeated errors        |

## When to READ Memory

**At the start of every task:**

1. **Always read** `.memory/context.md` — to understand current state
2. **Always read** `.memory/patterns.md` — to maintain code consistency
3. **Read if debugging:** `.memory/anti-patterns.md` — to avoid known pitfalls
4. **Read if deciding:** `.memory/decisions.md` — to understand past rationale

## When to WRITE Memory

### `.memory/context.md` — Overwrite at end of task

Update when completing a task or running `/sync`. Replace the content with:

```markdown
## Active Work

- [What is currently in progress]

## Recent Changes

- [Summary of what was just done]

## Open Questions

- [Any unresolved items]

## Technical Debt

- [Known debt with priority]
```

### `.memory/decisions.md` — Append when making architectural choices

Append a new entry when:

- Choosing between technologies or approaches
- Changing project structure
- Adding/removing dependencies
- Establishing new patterns

Format:

```markdown
## [YYYY-MM-DD] — [Decision Title]

**Context:** Why this decision was needed.
**Decision:** What was decided.
**Alternatives:** What was considered but rejected.
**Consequences:** Impact on the project.
```

### `.memory/patterns.md` — Update when discovering conventions

Update when you notice:

- A naming convention used consistently (e.g., `use*` hooks, `*Service` classes)
- A folder structure pattern (e.g., feature-based, layer-based)
- A coding style (e.g., async/await over promises, error handling patterns)

### `.memory/anti-patterns.md` — Auto-append on repeated errors

Append when the **same category of error** occurs **3 or more times** in a session:

```markdown
- **[Category]:** [Instruction to avoid the error]. (Learned [YYYY-MM-DD])
```

Categories: `Shell`, `Import`, `Syntax`, `Logic`, `Config`, `Test`, `Path`, `Type`

## What NOT to Store

- ❌ Entire file contents (too large, goes stale)
- ❌ Temporary debugging notes
- ❌ Information already in README or docs
- ❌ Sensitive data (API keys, passwords)

## Memory Hygiene

- Keep each file under 200 lines
- If `patterns.md` grows too large, consolidate related entries
- `context.md` should be concise — it's a snapshot, not a journal
- `decisions.md` grows over time — that's expected and desired
