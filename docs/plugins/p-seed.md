# 🌱 The Seed Hub (Experiments)

**Position:** Exploration Plugin / Feedback Loop
**Status:** Operational

---

## 🧐 What is The Seed Hub?

The **Seed Hub** is a safe, non-judgmental "Mind Explorer" space designed to capture **Mind Sparks** (raw ideas) before they enter the formal production line of KamiFlow. 

It is a **Feedback Loop** that can operate independently or as a feeder for the Core Sniper Model.

---

## 🔄 The Natural Workflow

The lifecycle of an idea in the Seed Hub follows a natural growth process:

1.  **🌱 Sowing (Draft):** Use `/kamiflow:p-seed:draft` to quickly capture a "What if...?" or "Why not...?" moment.
2.  **🌿 Cultivating (Analyze):** Use `/kamiflow:p-seed:analyze` to invite AI Personas (Steve Jobs, Pragmatic Engineer, Simple User) to critique and expand your idea.
3.  **🍎 Harvesting (Promote):** When an idea matures, use `/kamiflow:p-seed:promote` to move it to the `backlog/` or trigger a formal `/kamiflow:core:idea`.

---

## 🧠 Brainstorming Techniques

The Seed Hub encourages using structured creative techniques:

### 🎭 Rolestorming
Ask the AI to analyze your idea through specific lenses:
- **The Optimist:** What's the best possible outcome?
- **The Cynic:** Why will this fail on day one?
- **The Visionary:** How does this look 10 years from now?

### 🔄 Round-Robin Brainstorming
A technique where ideas are passed around to build upon each other without criticism in the early stage.

---

## 🛠 Commands

| Command | Action | Goal |
| :--- | :--- | :--- |
| `/kamiflow:p-seed:draft` | **Sow a Seed** | Quick capture of a raw concept. |
| `/kamiflow:p-seed:analyze`| **Cultivate** | Multi-persona feedback loop. |
| `/kamiflow:p-seed:promote`| **Harvest** | Move to backlog or formal production. |

---

## 📂 Storage Structure
- `ideas/draft/`: Your wild, unrefined thoughts.
- `ideas/backlog/`: Curated ideas ready for implementation.

> **Note:** The `ideas/` folder is git-ignored by default but accessible to Gemini for deep analysis.
