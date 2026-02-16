# Antigravity Kit

> AI Guard Rails for structured development with [Antigravity](https://antigravity.google/).

Portable rules, workflows, and skills that make AI coding assistants more disciplined — preventing hallucinations, enforcing validation, and following structured development patterns.

## Quick Start

```bash
npx antigravity-kit init
```

This scaffolds into your project:

```
your-project/
├── GEMINI.md                          ← AI system instructions
├── .gemini/
│   ├── rules/
│   │   ├── anti-hallucination.md      ← Prevent AI from inventing things
│   │   ├── error-recovery.md          ← 3-level retry model
│   │   ├── validation-loop.md         ← Syntax → Functional → Traceability
│   │   ├── fast-track.md              ← Bypass for small changes
│   │   └── reflection.md             ← Quality gate before completion
│   └── skills/
│       ├── systematic-debugging/
│       ├── verification-before-completion/
│       └── web-design-guidelines/
└── .agent/
    └── workflows/
        ├── develop.md                 ← Full structured dev workflow
        ├── quick-fix.md               ← Fast track for small fixes
        ├── review.md                  ← Code review with anti-patterns
        ├── sync.md                    ← Session sync + unified commit
        └── release.md                 ← Version bump + changelog
```

## What's Included

### 🛡️ Rules (AI Behavior Guard Rails)

| Rule                   | What It Prevents                                                               |
| :--------------------- | :----------------------------------------------------------------------------- |
| **Anti-Hallucination** | AI inventing files, functions, dependencies, or config options                 |
| **Error Recovery**     | Uncontrolled failures — enforces 3-level retry (self-heal → assist → escalate) |
| **Validation Loop**    | Shipping broken code — enforces syntax → functional → traceability gates       |
| **Fast Track**         | Over-engineering — lets small changes bypass full ceremony                     |
| **Reflection**         | Incomplete work — enforces quality gate before task completion                 |

### 🔄 Workflows (Slash Commands)

| Command      | When to Use                                              |
| :----------- | :------------------------------------------------------- |
| `/develop`   | New features, complex changes — full structured pipeline |
| `/quick-fix` | Typo fixes, config updates, < 50 line changes            |
| `/review`    | Self-review or reviewing changes before merge            |
| `/sync`      | End of session — update docs, unified commit             |
| `/release`   | Version bump, changelog, release commit                  |

### 🎯 Skills

Specialized knowledge modules that Antigravity reads when relevant tasks arise.

## Options

```bash
npx antigravity-kit init           # Interactive scaffolding
npx antigravity-kit init --force   # Overwrite existing files
```

## Customization

After scaffolding, customize for your project:

1. **Edit `GEMINI.md`** — Add project-specific behavioral traits, anti-patterns, and rules
2. **Add rules** — Create new `.gemini/rules/*.md` files for domain-specific guardrails
3. **Add workflows** — Create new `.agent/workflows/*.md` files for custom processes
4. **Add skills** — Create new `.gemini/skills/*/SKILL.md` for specialized knowledge

## Part of KamiFlow

Antigravity Kit is the portable distribution of [KamiFlow](https://github.com/kamishino/gemini-cli-workflow) — an opinionated workflow system for AI-assisted development. While KamiFlow provides a full CLI with 20+ commands, Antigravity Kit gives you just the guard rails — no CLI dependency required.

## License

MIT
