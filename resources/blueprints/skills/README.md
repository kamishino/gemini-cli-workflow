# 🧩 KamiFlow Skills Directory

> **SSOT:** This directory is the Single Source of Truth for all KamiFlow skills. Skills defined here are synced to `.gemini/skills/` during transpile.

---

## 📁 Directory Structure

```text
resources/skills/
├── README.md                    # This file
├── kamiflow-sniper-assist/     # Sniper Model workflow assistant
│   ├── SKILL.md                # Required: Skill definition
│   ├── references/             # Optional: Static documentation
│   └── assets/                 # Optional: Templates
└── [skill-name]/               # Additional skills
    └── SKILL.md
```

---

## 🔧 Skill Anatomy (Gemini CLI Native Format)

Each skill MUST have a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: skill-name
description: Use this skill when [trigger]. It helps with [purpose].
---

# Skill Title

## Workflow

1. First step...
2. Second step...

## References

- Link to relevant docs
```

### Required Fields

| Field         | Description                                                |
| ------------- | ---------------------------------------------------------- |
| `name`        | Unique identifier (must match directory name)              |
| `description` | When Gemini should activate this skill (trigger condition) |

### Optional Directories

| Directory     | Purpose                                 |
| ------------- | --------------------------------------- |
| `scripts/`    | Executable scripts the skill can run    |
| `references/` | Static documentation for context        |
| `assets/`     | Templates, examples, or other resources |

---

## 🔄 Sync Process

Skills are synced to `.gemini/skills/` via the transpile pipeline:

```bash
# Sync skills only
kami skills

# Full transpile (includes skills)
kami transpile
```

**Flow:**

```text
resources/skills/[skill-name]/  →  .gemini/skills/[skill-name]/
         (source)                        (generated)
```

---

## 📋 Available Skills

| Skill                    | Description                            | Status     |
| ------------------------ | -------------------------------------- | ---------- |
| `kamiflow-sniper-assist` | Guide through IDEA→SPEC→BUILD workflow | ✅ Active  |
| `kamiflow-tdd`           | Enforce TDD patterns in specifications | 🚧 Planned |
| `kamiflow-validation`    | Run 3-phase validation loop            | 🚧 Planned |

---

## 🛠️ Creating a New Skill

### Option 1: Use Gemini CLI (Recommended)

```bash
# In Gemini CLI session
> create a new skill called 'my-skill'
```

Then move the generated skill from `.gemini/skills/` to `resources/skills/`.

### Option 2: Manual Creation

1. Create directory: `resources/skills/my-skill/`
2. Create `SKILL.md` with required frontmatter
3. Add optional `references/`, `scripts/`, `assets/` directories
4. Run `kami skills` to deploy

---

## ⚠️ Important Rules

1. **NEVER edit `.gemini/skills/` directly** - changes will be overwritten
2. **Always edit source in `resources/skills/`**
3. **Run `kami skills`** after any changes
4. **Skill name must match directory name**

---

## 🔗 References

- [Gemini CLI Skills Documentation](https://geminicli.com/docs/cli/skills/)
- [Creating Agent Skills Guide](https://geminicli.com/docs/cli/creating-skills)
- [KamiFlow SSOT Rules](../blueprints/rules/local/std-resource-core.md)
