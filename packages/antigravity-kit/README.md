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
│   ├── agents/                    # 7 specialist AI agents
│   │   ├── architect.md
│   │   ├── debugger.md
│   │   ├── documentation-writer.md
│   │   ├── planner.md
│   │   ├── reviewer.md
│   │   ├── shipper.md
│   │   └── writer.md
│   ├── workflows/                 # 13 slash-command workflows
│   │   ├── develop.md             # Full idea-to-ship pipeline
│   │   ├── scaffold.md            # AI boilerplate generator
│   │   ├── quick-fix.md           # Fast track for small changes
│   │   └── ... (10 more)
│   └── skills/                    # Installed skills from skills.sh
│       └── nextjs-best-practices/
│           └── SKILL.md
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
agk ci                 # generate GitHub Actions health check
agk scaffold agent <n> # generate agent boilerplate
agk scaffold workflow <n>  # generate workflow boilerplate
agk agents             # register agents in GEMINI.md for Auto-Dispatch
agk skills add <name>  # install skills from skills.sh
agk skills list        # list installed skills
agk suggest <query>    # find the best agent for a task
agk suggest            # suggest agent from git diff
agk diff               # detect modified/missing templates
agk brain              # Second Brain dashboard
agk brain setup <path> # configure central memory repo
agk brain link         # link project memory to brain
agk brain sync         # commit and push brain to GitHub
agk memory             # memory status
agk memory show        # print all memory files
agk memory sync        # push .memory/ to private git repo
agk info               # show install location + version
```

---

## 13 Workflows

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
| `/scaffold` | Generate boilerplate for agents, workflows, or rules           |

---

## 7 AI Agents + Auto-Dispatch

AGK ships 7 specialist AI agents that automatically activate based on keywords in your message:

| Agent                    | Triggers (examples)                       |
| :----------------------- | :---------------------------------------- |
| **Architect**            | `architecture`, `design`, `refactor`      |
| **Debugger**             | `bug`, `error`, `crash`, `fix`            |
| **Documentation Writer** | `readme`, `docs`, `changelog`, `adr`      |
| **Planner**              | `plan`, `roadmap`, `sprint`, `backlog`    |
| **Reviewer**             | `review`, `PR`, `code quality`, `SOLID`   |
| **Shipper**              | `release`, `deploy`, `publish`, `version` |
| **Writer**               | `docs`, `tutorial`, `guide`, `jsdoc`      |

Run `agk agents` to register all agents in `GEMINI.md`. Auto-Dispatch means the AI will adopt the right agent role without `@mention`.

---

## Skills (from skills.sh)

Install community skills to give your agents deep knowledge:

```bash
# Install a skill
agk skills add nextjs-best-practices

# List installed skills
agk skills list

# Link skills to agents (in agent frontmatter)
skills: ["nextjs-best-practices"]
```

Browse 150+ skills at [skills.sh](https://skills.sh/).

---

## Second Brain (Cross-PC Memory)

Centralize `.memory/` from all your projects into one git repo:

```bash
# One-time setup
agk brain setup ~/second-brain

# Link current project
agk brain link

# Dashboard: see all linked projects
agk brain

# Sync to GitHub
agk brain sync
```

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
