# ADR-001: Factory Architecture with Blueprint Transpilation

## Status

Accepted

## Context

KamiFlow needs to generate multiple TOML command files for Gemini CLI from reusable logic components. Maintaining 29+ command files with duplicated code leads to:

- Inconsistent behavior across commands
- High maintenance overhead
- Difficult-to-track bugs
- No single source of truth

## Decision

Implement a **factory architecture** where:

1. **Source blueprints** (Markdown) define command logic in `resources/blueprints/`
2. **Registry file** (`registry.md`) maps blueprints to output targets
3. **Transpiler** assembles blueprints into TOML commands
4. **Multi-environment** support (development vs production paths)

### Architecture Flow

```
resources/blueprints/
├── commands/
│   ├── context-sync.md (shared partial)
│   ├── core/idea-logic.md
│   └── dev/lazy-logic.md
├── templates/gemini-shell.md
└── registry.md

      ↓ Transpiler

.gemini/commands/kamiflow/
├── core/idea.toml
└── dev/lazy.toml
```

### Key Components

- **Transpiler class** (`cli-core/logic/transpiler.js`)
- **Environment Manager** (handles dev/prod paths)
- **Placeholder system** (`{{KAMI_WORKSPACE}}`, `{{KAMI_RULES_GEMINI}}`)
- **Validation** (metadata checks, TOML validation)

## Consequences

### Positive ✅

- **DRY principle** enforced - shared logic in partials
- **Scalability** - easy to add new commands
- **Version control** - blueprints are source of truth
- **Testing** - can test blueprint assembly independently
- **Documentation** - blueprints serve as living documentation
- **Hot reload** - dev mode uses source blueprints directly

### Negative ⚠️

- **Build step required** for production
- **Learning curve** for contributors (must understand transpiler)
- **Debugging complexity** (errors may occur in assembly)
- **Cache invalidation** must be handled correctly

### Mitigation

- Comprehensive error messages with file paths
- `npm run dev` for automatic transpilation during development
- Cache system with file modification time tracking
- Validation before write to catch errors early

## Alternatives Considered

### 1. Manual TOML Duplication

Keep 29 individual TOML files with copy-pasted logic.

- **Rejected:** Maintenance nightmare, inconsistency prone

### 2. Template Strings in JavaScript

Generate TOML from JS template literals.

- **Rejected:** Mixing logic and templates, hard to read/edit

### 3. YAML with Includes

Use YAML with custom include directives.

- **Rejected:** Gemini CLI requires TOML format

## Implementation Notes

### Registry Format

```markdown
### Command Name

- **Target:** .gemini/commands/path/to/output.toml
- **Shell:** gemini-shell.md
- **Partials:**
  - resources/blueprints/commands/context-sync.md
  - resources/blueprints/commands/core/logic.md
```

### Metadata Requirements

Every blueprint must define:

- `name` - Command identifier
- `type` - Command type (command, skill, rule)
- `description` - User-facing description
- `group` - Organization category
- `order` - Sort order

### Build Commands

```bash
npm run dev        # Development (uses ./.kamiflow/)
npm run build      # Production (outputs to dist/)
npm run transpile  # Manual transpilation
```

## Related Decisions

- ADR-002: 3-Layer Configuration Cascade
- ADR-004: Blueprint Registry System

## References

- `cli-core/logic/transpiler.js`
- `resources/blueprints/registry.md`
- `cli-core/logic/env-manager.js`

---

**Date:** 2024-01-31  
**Author:** KamiFlow Team  
**Version:** 2.35.0
