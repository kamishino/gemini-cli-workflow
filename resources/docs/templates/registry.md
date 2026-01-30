# ≡ƒñû KamiFlow Agent Registry

> **Constitution:** This file defines the operational boundaries for all KamiFlow Sub-Agents. 
> DO NOT modify permissions without a formal PRD.

---

## ≡ƒÅù∩╕Å Core Agent Definitions

| Agent ID | Name | Primary Role | Allowed Write Scopes | Read Access |
| :--- | :--- | :--- | :--- | :--- |
| `executor` | Sniper Executor | Code & Task implementation | `tasks/`, `cli-core/`, `archive/` | FULL |
| `scout` | Market Intelligence | Trends & Discovery research | `ideas/discovery/` | ROADMAP, CONTEXT |
| `reviewer` | Quality Guard | Code review & Validation | `docs/handoff_logs/` | TASKS, SRC |
| `coordinator`| Swarm Master | Thread & Lock management | ROOT (Lock files) | FULL |

---

## ≡ƒöÆ Concurrency Protocol (.swarm-lock)

1. **Check:** Every agent MUST check for a `.swarm-lock` file in their target folder before writing.
2. **Lock:** Create `.swarm-lock` with the Agent ID and timestamp.
3. **Work:** Perform file operations.
4. **Release:** Delete the `.swarm-lock` file.

---

## ≡ƒÜª Active Swarm Status
*This section is updated by the Swarm Dispatcher.*

- **Last Scan:** {{DATE}}
- **Status:** READY ≡ƒƒó
