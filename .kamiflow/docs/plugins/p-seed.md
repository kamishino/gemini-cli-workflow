# 🌱 Seed Hub Plugin (p-seed)

**Position:** Strategy Plugin / Idea Incubator
**Status:** Operational (v2.26.0)

---

## 🔍 What is the Seed Hub?

The **Seed Hub** is a specialized incubator for raw ideas. It ensures quality control through a structured evaluation process (The Smart Incubator), preventing "Garbage In, Garbage Out" in your development backlog.

---

## 🔄 The Sowing Workflow

1.  **🌱 Draft:** Run `/kamiflow:p-seed:draft`. Start a diagnostic interview to capture the "Why". A unique **Hash ID** (e.g., `X9R2`) is assigned.
2.  **📈 Analyze:** Run `/kamiflow:p-seed:analyze <file>`. AI evaluates the idea's **Feasibility**, **Risk**, and **Value**. Scores are saved to the file's frontmatter.
3.  **📝Â Refine:** Based on AI feedback, refine the content. Repeat the analysis until the **Feasibility Score >= 0.7**.
4.  **🚀 Promote:** Run `/kamiflow:p-seed:promote <file>`. Moves the "Ripe" idea to `ideas/backlog/`, ready for the Core Sniper Flow.

---

## 🛠️ Commands

| Command | Action | Goal |
| :--- | :--- | :--- |
| `/kamiflow:p-seed:draft` | **Sow** | Start an interview and create a draft with Hash ID. |
| `/kamiflow:p-seed:analyze`| **Incubate**| Score feasibility and provide strategic feedback. |
| `/kamiflow:p-seed:promote`| **Harvest** | Move quality ideas to the backlog (Quality Gate: 0.7). |

---

## 🛡️ The Quality Gate
By default, ideas must score above **0.7** in Feasibility to be promoted. This threshold can be adjusted in your configuration. To bypass the gate, use the `--force` flag.

---

## 📁 Storage Structure
- `ideas/draft/`: Initial sparks and unpolished concepts.
- `ideas/backlog/`: High-quality, verified ideas ready for implementation.
