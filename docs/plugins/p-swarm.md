# 🐝 Sub-Agent Swarm (/p-swarm)

**Position:** Performance Multiplier / Concurrency Engine
**Status:** Operational (v2.22.0)

---

## 🧐 What is the Swarm?

The **Sub-Agent Swarm** allows KamiFlow to break free from sequential "Waterfall" execution. It enables the AI to spawn specialized sub-agents that handle different domains simultaneously (e.g., Implementing code while researching market gaps).

---

## 🔒 The Concurrency Protocol

To prevent data corruption, KamiFlow uses the **.swarm-lock** protocol:
1.  An agent **acquires** a lock before writing to a directory (e.g., `tasks/`).
2.  Other agents **read** the lock and wait or redirect their efforts.
3.  The lock is **released** once the task is complete.

---

## 🤖 Agent Registry

Managed at `docs/agents/registry.md`, this file defines the "Constitution" of your AI workforce:
- **Executor:** Handles implementation and logic.
- **Scout:** Handles discovery and trend research.
- **Reviewer:** Handles quality gates and handoff logs.

---

## 🛠 Commands

| Command | Action | Goal |
| :--- | :--- | :--- |
| `/kamiflow:p-swarm:run` | **Dispatch** | Split a multi-intent request into parallel threads. |
| `/kamiflow:p-swarm:status` | **Monitor** | Check which agents are currently active and where. |
| `kami swarm-unlock <folder>`| **Reset** | Manually remove a stuck lock file (use with caution). |

---

## 🚀 Speed Gains
By using Swarm mode, the time from "Idea to Verified Discovery" can be reduced by up to 40% because strategic scouting happens in the background of your active development.
