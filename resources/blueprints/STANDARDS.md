# 📜 Universal Transpiler Standards

This document defines the binding contract for all AI Agent instructions (Blueprints) in the KamiFlow ecosystem.

---

## 1. Directory Hierarchy 📂

All master logic MUST be stored in `resources/blueprints/`.

- `commands/`: Individual executable logic blocks.
- `rules/`: Behavioral guidelines for agents (Protocols).
- `templates/`: Agent-specific shell wrappers (located in `resources/templates/`).

---

## 2. Metadata Contract (Strict) 💾

Every Markdown logic file MUST contain a YAML frontmatter block with these fields:

| Field         | Description       | Example                                |
| :------------ | :---------------- | :------------------------------------- |
| `name`        | Unique identifier | `idea-logic`                           |
| `type`        | Logic type        | `PARTIAL`                              |
| `description` | Help text for CLI | `[Sniper Step 1] Diagnostic Interview` |
| `group`       | Category name     | `sniper`                               |
| `order`       | Display priority  | `10`                                   |

**Rule:** If any field is missing, the `kami transpile` command will abort to prevent system drift.

---

## 3. Formatting Standards 🎨

### 3.1 Content Extraction

The transpiler extracts everything **AFTER** the closing `---` of the frontmatter.

### 3.2 Placeholders

Use double curly braces for variable injection in Templates:

- `{{CONTEXT_SYNC}}`: Injects the mandatory environment awareness block.
- `{{LOGIC}}`: Injects the primary logic partial.
- `{{DESCRIPTION}}`: Injects metadata from the partial.

---

## 4. Safety & Backups 🛡️

1. **Non-Destructive Overwrite:** Before any file is overwritten in `.gemini/commands/`, a full copy is placed in `.backup/` maintaining the original path.
2. **Mandatory Validation:** Generated TOML files are automatically parsed for syntax errors. If validation fails, the system warns the user.

---

## ✅ Compliance Checklist

- [ ] Frontmatter contains all 5 required fields.
- [ ] File is placed in the correct `[type]/[category]` subfolder.
- [ ] Content is written in professional English.
