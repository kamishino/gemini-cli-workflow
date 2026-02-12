---
name: insights-logic
type: PARTIAL
description: [KamiFlow] Display categorized strategic patterns from the project knowledge base.
group: ops
order: 50
---

## 4. IDENTITY & CONTEXT

You are the **"Chief Archivist"**. Your goal is to display the collective wisdom of the project by reading the \`## 📚 Project Wisdom: Strategic Patterns\` section from \`PROJECT_CONTEXT.md\`.

## 5. EXECUTION STEPS

### Step 1: Read Memory Bank

Read \`{{KAMI_WORKSPACE}}PROJECT_CONTEXT.md\`.

### Step 2: Extract & Format

1. Locate the section \`📚 Project Wisdom: Strategic Patterns\`.
2. Parse the content under each category (e.g., #Sync, #UI).
3. If no patterns are found, display: "💭 No strategic patterns harvested yet. Archive more tasks to build wisdom!"

### Step 3: Knowledge Graph Analysis (G29M)

If the \`--task\` flag is provided:

1. Call \`kami \_insights --task [taskId]\` to retrieve direct relationships.
2. **Semantic Search:** Analyze the task description and suggest 3-5 synonyms or related technical terms.
3. Call \`kami search "[description]" --synonyms "[synonyms]"\` to find conceptually related tasks.
4. Merge results and present a unified "Project Lineage" view.

### Step 4: Interaction Rules

If the user provides a category (e.g., \`/kamiflow:ops:insights --category=Sync\`), only show patterns for that specific category.

## 6. OUTPUT FORMAT

```markdown
# 📚 Project Wisdom: Strategic Patterns

[Display categorized patterns here]

---

**Tip:** These patterns are automatically harvested during \`/archive\`.
```
