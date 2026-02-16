# 🛡️ Antigravity Kit

> AI Guard Rails for [Antigravity](https://antigravity.dev) — portable rules, workflows, and persistent memory for structured development.

**Zero config. Zero dependencies. One command.**

```bash
npx antigravity-kit init
```

---

## What You Get

```
your-project/
├── GEMINI.md                      # AI system instructions
├── .gemini/
│   ├── rules/                     # 5 AI behavior rules
│   │   ├── anti-hallucination.md
│   │   ├── validation-loop.md
│   │   ├── reflection.md
│   │   ├── error-recovery.md
│   │   └── fast-track.md
│   └── skills/                    # Core skills
│       ├── memory-management/
│       ├── systematic-debugging/
│       ├── verification-before-completion/
│       └── web-design-guidelines/
├── .agent/
│   └── workflows/                 # 5 development workflows
│       ├── develop.md
│       ├── quick-fix.md
│       ├── review.md
│       ├── sync.md
│       └── release.md
└── .memory/                       # Persistent context (4 files)
    ├── context.md
    ├── decisions.md
    ├── patterns.md
    └── anti-patterns.md
```

---

## Features

### 🧠 Persistent Memory

AI remembers across sessions — no more repeating context.

| File               | Type          | Purpose                               |
| :----------------- | :------------ | :------------------------------------ |
| `context.md`       | Overwrite     | Current project state                 |
| `decisions.md`     | Append-only   | Why things are the way they are       |
| `patterns.md`      | Append/Update | Naming, structure, conventions        |
| `anti-patterns.md` | Auto-append   | Mistakes learned from repeated errors |

Memory is **git-friendly** — commit it, share it with your team, clone it to another machine.

### 🔄 5 Workflows

Type these as slash commands in Antigravity:

| Command      | Purpose                                        |
| :----------- | :--------------------------------------------- |
| `/develop`   | Full idea-to-ship pipeline with planning gates |
| `/quick-fix` | Fast track for small, obvious changes          |
| `/review`    | Code review with anti-pattern detection        |
| `/sync`      | Update docs, memory, and unified commit        |
| `/release`   | Version bump and changelog generation          |

**Intent triggers** — You can also say things naturally:

- _"Build a new login page"_ → triggers `/develop`
- _"Fix the typo in header"_ → triggers `/quick-fix`
- _"Review my changes"_ → triggers `/review`
- _"Ship it"_ → triggers `/release`

### 🛡️ 5 Guard Rails

| Rule                   | What It Prevents                                          |
| :--------------------- | :-------------------------------------------------------- |
| **Anti-Hallucination** | Ghost files, phantom functions, invented dependencies     |
| **Validation Loop**    | Unverified code — enforces lint → test → traceability     |
| **Reflection**         | Shipping without quality gate — forces pre-exit checklist |
| **Error Recovery**     | Infinite loops — 3-level retry model with escalation      |
| **Fast Track**         | Over-engineering — bypasses ceremony for small changes    |

### 🔍 Smart Project Detection

After scaffolding, the CLI detects your tech stack and recommends relevant skills:

```
🔍 Detected: TypeScript + Next.js + Tailwind CSS

💡 Recommended skills (install via skills.sh):
   npx skills add anthropics/courses/typescript-advanced-types
   npx skills add anthropics/courses/next-best-practices
   npx skills add anthropics/courses/tailwind-design-system
```

Supports 16+ project types: TypeScript, Python, Go, Rust, Next.js, Vite, Nuxt, Vue, Angular, Docker, GitHub Actions, Jest, Vitest, Prisma, Supabase, Tailwind CSS.

---

## Installation

### Quick Start

```bash
npx antigravity-kit init
```

### Options

```bash
# Standard install
npx antigravity-kit init

# Overwrite existing files
npx antigravity-kit init --force

# Include optional NeuralMemory (graph-based AI memory)
npx antigravity-kit init --with-neuralmemory
```

### With NeuralMemory (Optional)

For projects that need graph-based semantic memory powered by Neo4j + Gemini:

```bash
npx antigravity-kit init --with-neuralmemory
```

This adds:

- `.neuralmemory/mcp-config.json` — MCP server config template
- `.neuralmemory/README.md` — Setup instructions
- `.env` — API key placeholders (fill in later)

> **Note:** NeuralMemory is optional. The project works perfectly with just `.memory/` (zero dependencies). NeuralMemory adds graph-based search and semantic memory on top.

---

## How It Works

### Memory Lifecycle

```
Session Start                      Session End
     │                                  │
     ▼                                  ▼
Read .memory/context.md         Write .memory/context.md
Read .memory/patterns.md        Append .memory/decisions.md
Read .memory/anti-patterns.md   Update .memory/patterns.md
     │                          Auto-append anti-patterns.md
     ▼                                  │
  [ Do Work ]  ──────────────────►  [ Commit ]
```

### Workflow Pipeline (`/develop`)

```
Context Lock → Diagnostic Interview → Options (A/B/C)
    → Schema-First Spec → Legacy-Aware Plan
    → Execute → Validate (lint/test) → Reflect
    → Update Memory → Commit
```

### Self-Learning Loop

```
Error occurs → AI retries (max 3x) → If pattern repeats:
    → Auto-appended to .memory/anti-patterns.md
    → AI avoids same mistake in future sessions
```

---

## Philosophy

| Principle         | What                                        |
| :---------------- | :------------------------------------------ |
| **Zero Friction** | One command, no config, no API keys         |
| **Git-Native**    | Everything is markdown, commit & share      |
| **AI-Agnostic**   | Works with any AI that reads markdown       |
| **Memory-First**  | AI that forgets is AI that repeats mistakes |
| **Opinionated**   | Best practices baked in, not suggested      |

---

## Comparison

|                        | antigravity-kit              | Raw AI | Other frameworks |
| :--------------------- | :--------------------------- | :----- | :--------------- |
| Memory across sessions | ✅ `.memory/`                | ❌     | Varies           |
| Guard rails            | ✅ 5 rules                   | ❌     | Some             |
| Self-learning          | ✅ Anti-patterns auto-update | ❌     | ❌               |
| Setup time             | 30 seconds                   | 0      | 10-30 min        |
| Dependencies           | Zero                         | —      | Python/Neo4j/MCP |
| Cost                   | Free                         | —      | API calls        |

---

## License

MIT © [KamiFlow](https://github.com/kamishino)

---

_Built for developers who want AI that codes with discipline, not chaos._ 🛡️
