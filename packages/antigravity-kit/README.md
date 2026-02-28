# 🛡️ @kamishino/antigravity-kit

> AI Guard Rails for [Antigravity](https://antigravity.dev) — a complete development platform with agents, skills, suites, workflows, and persistent memory.

**Zero config. One command. 13 agents. 7 suites. 18 workflows.**

```bash
npx @kamishino/antigravity-kit init
# or
agk init
```

---

## What You Get

```
your-project/
├── GEMINI.md                      # AI system prompt (Auto-Dispatch)
├── AGENTS.md                      # Open standard (cross-IDE portable)
├── .gemini/
│   └── rules/                     # 5 AI behavior guard rails
├── .agent/
│   ├── agents/                    # 13 specialist AI agents
│   │   ├── architect.md           ├── mobile-developer.md
│   │   ├── database-expert.md     ├── python-developer.md
│   │   ├── debugger.md            ├── devops-engineer.md
│   │   ├── documentation-writer.md├── reviewer.md
│   │   ├── planner.md             ├── security-auditor.md
│   │   ├── shipper.md             ├── tester.md
│   │   └── writer.md
│   ├── workflows/                 # 18 slash-command workflows
│   ├── skills/                    # Installed skills from skills.sh
│   └── suites.json                # Installed suite tracking
├── .opencode/
│   └── commands/                  # Optional OpenCode slash commands
└── .memory/                       # Persistent context (4 files)
    ├── context.md                 ├── patterns.md
    ├── decisions.md               └── anti-patterns.md
```

---

## `agk` CLI

```bash
# Setup
agk init               # Smart Init: detect → suite → skills → agents
agk init --target opencode # OpenCode-only: scaffold .opencode/commands
agk init --target all  # AGK defaults + OpenCode command adapters
agk init -i            # interactive setup wizard
agk upgrade            # update templates from AGK

# Suites (bundled dev environments)
agk suite available    # browse 7 built-in suites
agk suite add react    # install suite: agents + skills + workflows
agk suite find <q>     # search community suites
agk suite create <n>   # export project as shareable suite
agk suite list         # list installed suites

# Agents
agk agents             # register agents + refresh AGENTS registry
agk agents render      # render target/model-aware AGENTS.md
agk agents find <q>    # search community agent templates
agk agents list        # list installed agents with details

# Skills
agk skills add <name>  # install from skills.sh
agk skills find <q>    # search skills by keyword
agk skills list        # list installed skills
agk skills check       # check for updates
agk skills update      # update all skills

# Memory & Brain
agk brain              # Second Brain dashboard
agk brain setup <path> # configure central memory repo
agk brain link         # link project to brain
agk brain sync         # commit and push brain
agk brain pull         # pull brain on a new machine
agk memory sync        # smart sync (redirects to brain if linked)

# Dev Tools
agk scaffold agent <n> # generate agent boilerplate
agk scaffold workflow <n>  # generate workflow boilerplate
agk status             # quick project overview
agk doctor             # full health check
agk suggest <query>    # find best agent for a task
agk info               # show version + location
```

OpenCode command adapters are generated from `templates/workflows/` (single SSOT), so workflow logic stays in one place.
Use `agk agents render --target opencode --model-profile codex --force` to switch AGENTS.md profile intentionally.
Workflow templates are rendered from `resources/blueprints/workflows/` with safe overwrite mode by default.
Set `AGK_FORCE_WORKFLOW_SYNC=1` when running build to force migration overwrite for legacy workflow files.
Use `npm run lint:workflows` inside `packages/antigravity-kit` to validate workflow registry and structure before build.

---

## 7 Suites

One command installs all agents, skills, workflows, and rules for your stack:

| Suite           | Agents                                          | Workflows                                | For                    |
| :-------------- | :---------------------------------------------- | :--------------------------------------- | :--------------------- |
| **React**       | architect, tester, reviewer                     | develop, test, review                    | Next.js / React        |
| **Fullstack**   | architect, db-expert, tester, reviewer, shipper | develop, test, review, release           | Full-stack web         |
| **Backend API** | architect, db-expert, security, tester          | develop, test, review, debug             | API servers            |
| **CLI Tool**    | architect, tester, doc-writer, shipper          | develop, test, review, release, scaffold | CLI apps               |
| **Mobile**      | mobile-dev, tester, reviewer                    | develop, test, review, deploy-mobile     | React Native / Flutter |
| **Python**      | python-dev, architect, tester, security         | develop, pytest, review, debug           | FastAPI / Django       |
| **DevOps**      | devops-eng, architect, security                 | deploy, review, debug                    | Docker / CI/CD         |

```bash
agk suite add fullstack  # install everything for full-stack dev
```

---

## 13 AI Agents + Auto-Dispatch

Agents automatically activate based on keywords — no `@mention` needed:

| Agent                    | Triggers (examples)                                |
| :----------------------- | :------------------------------------------------- |
| **Architect**            | `architecture`, `design`, `refactor`, `pattern`    |
| **Database Expert**      | `database`, `schema`, `migration`, `SQL`, `Prisma` |
| **Debugger**             | `bug`, `error`, `crash`, `fix`, `trace`            |
| **DevOps Engineer**      | `devops`, `deploy`, `docker`, `k8s`, `CI/CD`       |
| **Documentation Writer** | `readme`, `docs`, `changelog`, `ADR`               |
| **Mobile Developer**     | `mobile`, `react native`, `flutter`, `expo`        |
| **Planner**              | `plan`, `roadmap`, `sprint`, `backlog`             |
| **Python Developer**     | `python`, `pip`, `pytest`, `django`, `fastapi`     |
| **Reviewer**             | `review`, `PR`, `code quality`, `SOLID`            |
| **Security Auditor**     | `security`, `vulnerability`, `OWASP`, `XSS`        |
| **Shipper**              | `release`, `deploy`, `publish`, `version`          |
| **Tester**               | `test`, `TDD`, `coverage`, `mock`, `jest`          |
| **Writer**               | `docs`, `tutorial`, `guide`, `jsdoc`               |

---

## 18 Workflows

| Command          | Use When                       |
| :--------------- | :----------------------------- |
| `/develop`       | Building a new feature         |
| `/quick-fix`     | Small obvious change           |
| `/brainstorm`    | Clarify ideas before planning  |
| `/debug`         | Find root cause of a bug       |
| `/test`          | TDD: Red → Green → Refactor    |
| `/pytest`        | Python testing with fixtures   |
| `/research`      | Explore options before coding  |
| `/review`        | Structured code review         |
| `/release`       | Version bump + changelog       |
| `/deploy`        | Production deployment          |
| `/deploy-mobile` | App store deployment           |
| `/scaffold`      | Generate boilerplate           |
| `/wake`          | Restore context on new session |
| `/checkpoint`    | Mid-session save               |
| `/compact`       | Compress long sessions         |
| `/eval`          | Pre-ship quality gate          |
| `/sync`          | Update memory + unified commit |
| `/kamiflow`      | KamiFlow Sniper Model          |

---

## Skills (from skills.sh)

```bash
agk skills add nextjs-best-practices   # install
agk skills find react                  # search
agk skills check                       # check updates
agk skills update                      # update all
```

Browse 150+ skills at [skills.sh](https://skills.sh/).

---

## Second Brain (Cross-PC Memory)

```bash
agk brain setup ~/second-brain   # one-time setup
agk brain link                   # link project
agk brain sync                   # sync to GitHub
agk brain pull                   # pull on new machine
```

---

## Guard Rails (5 Rules)

| Rule                   | What It Prevents               |
| :--------------------- | :----------------------------- |
| **Anti-Hallucination** | Ghost files, phantom functions |
| **Validation Loop**    | Unverified code                |
| **Reflection**         | Shipping without quality gate  |
| **Error Recovery**     | Infinite loops                 |
| **Fast Track**         | Over-engineering small changes |

---

## AGENTS.md (Open Standard)

AGK renders `AGENTS.md` from SSOT templates via `agk agents render` and keeps agent registry sections fresh via `agk agents`.
The output follows the [open standard](https://agents.md) so configuration is readable by Copilot, Codex, Jules, Cursor, and other AI tools.

---

## Installation

```bash
# Global (recommended)
npm install -g @kamishino/antigravity-kit
agk init

# One-off
npx @kamishino/antigravity-kit init

# Interactive
agk init -i
```

---

## Philosophy

| Principle         | What                                         |
| :---------------- | :------------------------------------------- |
| **Zero Friction** | One command, no config, no API keys          |
| **Git-Native**    | Everything is markdown — commit, share, diff |
| **AI-Agnostic**   | Works with any AI that reads markdown        |
| **Memory-First**  | AI that forgets is AI that repeats mistakes  |
| **Suite-Ready**   | One command installs your entire dev stack   |

---

## License

MIT © [kamishino](https://github.com/kamishino)

---

_Built for developers who want AI that codes with discipline, not chaos._ 🛡️
