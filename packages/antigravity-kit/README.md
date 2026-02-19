# 🛡️ @kamishino/antigravity-kit

> AI Guard Rails for [Antigravity](https://antigravity.dev) — portable rules, workflows, and persistent memory for structured development.

**Zero config. One command. Runs anywhere.**

```bash
npx @kamishino/antigravity-kit init
# or
agk init
```

---

## What You Get

```
your-project/
├── GEMINI.md                      # AI system prompt (loads all rules)
├── .gemini/
│   └── rules/                     # 5 AI behavior guard rails
│       ├── anti-hallucination.md
│       ├── validation-loop.md
│       ├── reflection.md
│       ├── error-recovery.md
│       └── fast-track.md
├── .agent/
│   └── workflows/                 # 12 slash-command workflows
│       ├── develop.md             # Full idea-to-ship pipeline
│       ├── kamiflow.md            # KamiFlow Sniper Model
│       ├── quick-fix.md           # Fast track for small changes
│       ├── brainstorm.md          # Phase 0 ideation
│       ├── debug.md               # Structured debugging
│       ├── review.md              # Code review
│       ├── sync.md                # Session commit
│       ├── release.md             # Version bump + changelog
│       ├── wake.md                # Cross-PC context restore
│       ├── compact.md             # Context window compression
│       ├── checkpoint.md          # Mid-session save
│       └── eval.md                # Self-assessment quality gate
└── .memory/                       # Persistent context (4 files)
    ├── context.md                 # Current project state
    ├── decisions.md               # Append-only decision log
    ├── patterns.md                # Code conventions
    └── anti-patterns.md           # Mistakes to avoid
```

---

## `agk` CLI

After installing globally (`npm i -g @kamishino/antigravity-kit`), use the `agk` shorthand:

```bash
agk                    # smart default: init or doctor
agk init               # scaffold AI guard rails
agk init -i            # interactive setup wizard
agk status             # quick project overview
agk doctor             # full health check
agk upgrade            # update workflows + rules from templates
agk hooks              # install git hooks (memory auto-sync)
agk ci                 # generate GitHub Actions health check workflow
agk info               # show install location, version, node info
agk memory             # memory status (sizes, line counts, dates)
agk memory show        # print all memory file contents
agk memory clear       # reset memory to empty templates
agk memory sync        # push .memory/ to private git repo
agk memory sync setup <url>  # configure private remote
agk memory sync pull   # pull .memory/ from remote (new PC)
```

---

## 12 Workflows

Slash commands for [Antigravity IDE](https://antigravity.dev). All workflows auto-load session context at start and auto-save at end.

### Daily Workflow

| Command       | Use When                                               |
| :------------ | :----------------------------------------------------- |
| `/develop`    | Building a new feature (auto-wake → build → auto-sync) |
| `/quick-fix`  | Small obvious change, < 50 lines, 1 file               |
| `/brainstorm` | Have a vague idea, need to clarify before planning     |
| `/debug`      | Something is broken, need to find root cause           |

### Session Management

| Command       | Use When                                              |
| :------------ | :---------------------------------------------------- |
| `/wake`       | New PC, new session — restore context from `.memory/` |
| `/checkpoint` | Before a risky change, mid-session save               |
| `/compact`    | Session getting long, context window filling up       |
| `/eval`       | Before shipping — self-assessment quality gate        |

### Release + Collaboration

| Command    | Use When                                        |
| :--------- | :---------------------------------------------- |
| `/review`  | Before merging — structured code review         |
| `/sync`    | End of session — update memory + unified commit |
| `/release` | Shipping — version bump, changelog, tag         |

### Advanced

| Command     | Use When                                                       |
| :---------- | :------------------------------------------------------------- |
| `/kamiflow` | KamiFlow projects — full Sniper Model with ROADMAP integration |

---

## Auto-Wake + Auto-Sync

Every workflow (`/develop`, `/kamiflow`) automatically:

**On start (Phase 0 — AUTO-WAKE):**

```
→ reads all 4 .memory/ files silently
→ shows SESSION RESTORED banner with last task, done, in-progress, next
```

**On end (Phase 7 — AUTO-SYNC):**

```
→ writes .memory/context.md with current state
→ appends decisions to .memory/decisions.md
→ stages and commits everything
→ shows SESSION SYNCED banner
```

No need to remember `/wake` or `/sync` — they run automatically.

---

## Cross-PC Memory Sync

Keep `.memory/` private and synced across machines using a private git repo:

```bash
# One-time setup
agk memory sync setup git@github.com:you/my-project-memory.git

# After each session (push)
agk memory sync

# On a new PC (pull)
agk memory sync pull
```

Uses `git subtree` — no separate clone needed.

---

## Persistent Memory

| File               | Type          | Purpose                                         |
| :----------------- | :------------ | :---------------------------------------------- |
| `context.md`       | Overwrite     | Current project state (active work, next steps) |
| `decisions.md`     | Append-only   | Why things are the way they are                 |
| `patterns.md`      | Append/Update | Naming, structure, established conventions      |
| `anti-patterns.md` | Auto-append   | Mistakes learned from repeated errors           |

Memory is **git-friendly** — commit it, share it with your team, `git pull` on another machine.

---

## Guard Rails (5 Rules)

| Rule                   | What It Prevents                                          |
| :--------------------- | :-------------------------------------------------------- |
| **Anti-Hallucination** | Ghost files, phantom functions, invented dependencies     |
| **Validation Loop**    | Unverified code — enforces lint → test → traceability     |
| **Reflection**         | Shipping without quality gate — forces pre-exit checklist |
| **Error Recovery**     | Infinite loops — 3-level retry with escalation            |
| **Fast Track**         | Over-engineering small changes                            |

---

## Installation

### Global CLI (recommended)

```bash
npm install -g @kamishino/antigravity-kit
agk init
```

### One-off (npx)

```bash
npx @kamishino/antigravity-kit init
```

### Interactive setup

```bash
agk init -i   # choose which components to scaffold
```

---

## Philosophy

| Principle           | What                                            |
| :------------------ | :---------------------------------------------- |
| **Zero Friction**   | One command, no config, no API keys             |
| **Git-Native**      | Everything is markdown — commit, share, diff    |
| **AI-Agnostic**     | Works with any AI that reads markdown           |
| **Memory-First**    | AI that forgets is AI that repeats mistakes     |
| **Auto by Default** | Wake and sync happen automatically, no ceremony |

---

## License

MIT © [kamishino](https://github.com/kamishino)

---

_Built for developers who want AI that codes with discipline, not chaos._ 🛡️
