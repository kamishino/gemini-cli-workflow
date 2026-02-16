# 🧠 Knowledge Graph & Project Lineage

[ 🏠 Home ](../../../README.md) | [ 📖 Wiki ](../commands/README.md) | [ 🧭 Overview ](../overview.md)

---

## 🧭 What is the Knowledge Graph?

The **Knowledge Graph (KG)** is KamiFlow's relational brain. Unlike standard text search, the KG understands how different parts of your project are connected. It maps the relationships between **Tasks**, **Insights**, **Rules**, and **Logic Anchors**.

### Why it matters

- **Context Recovery:** When you start a new task, the AI can "look back" at related tasks from months ago to avoid repeating mistakes.
- **Dependency Tracking:** Understand what might break if you change a core utility.
- **Wisdom Harvesting:** Links "Strategic Patterns" directly to the implementation task that birthed them.

---

## 🛠️ How it works

### 1. Automatic Extraction

Every time you run `/kamiflow:dev:archive` or `kami archive`, the system scans your Handoff and Reflection files for cross-references using the regex pattern: `/\bTask\s+(\d{3})\b/gi`.

### 2. Persistent Storage

Relationships are stored in a relational SQLite table within `{{KAMI_WORKSPACE}}.index/workspace.db`.

- **Source:** The current task.
- **Target:** The referenced task.
- **Type:** The nature of the link (`references`, `blocks`, `depends`).

### 3. Bidirectional Linking

If Task A references Task B, the graph automatically creates a link from Task B back to Task A, ensuring you can navigate your history in both directions.

---

## 🔍 Querying the Graph

You can interact with the graph using the internal insights command:

```bash
# View all tasks related to Task 102
node packages/kamiflow-cli/bin/kami.js _insights --task 102
```

### Expected Output

```text
🔄 Knowledge Graph: Related to Task 102
   → [Task 094] (references)
   → [Task 095] (references)
   → [Task 101] (references)
```

---

## 🚀 Future: Semantic Similarity

We are working on integrating **Vector-like search** into the KG, allowing the AI to find "semantically related" tasks even if they don't explicitly mention each other by ID.
