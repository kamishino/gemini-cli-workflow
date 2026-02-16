# 🤖 KamiFlow Agent Registry

> **Constitution:** This file defines the operational boundaries for all KamiFlow Sub-Agents.
> DO NOT modify permissions without a formal PRD.

---

## 🏗️ Core Agent Definitions

| Agent ID      | Name                | Primary Role                | Allowed Write Scopes                         | Read Access                          |
| :------------ | :------------------ | :-------------------------- | :------------------------------------------- | :----------------------------------- |
| `executor`    | Sniper Executor     | Code & Task implementation  | `./.kamiflow/tasks/`, `./.kamiflow/archive/` | FULL                                 |
| `scout`       | Market Intelligence | Trends & Discovery research | `./.kamiflow/ideas/discovery/`               | `./.kamiflow/ROADMAP.md`             |
| `reviewer`    | Quality Guard       | Code review & Validation    | `./.kamiflow/handoff_logs/`                  | `./.kamiflow/tasks/`, `./.kamiflow/` |
| `coordinator` | Swarm Master        | Thread & Lock management    | ROOT (Lock files)                            | FULL                                 |

---

## 🔒 Concurrency Protocol (.swarm-lock)

1. **Check:** Every agent MUST check for a `.swarm-lock` file in their target folder before writing.
2. **Lock:** Create `.swarm-lock` with the Agent ID and timestamp.
3. **Work:** Perform file operations.
4. **Release:** Delete the `.swarm-lock` file.

---

## 🚦 Active Swarm Status

_This section is updated by the Swarm Dispatcher._

- **Last Scan:** {{DATE}}
- **Status:** READY 🟢
