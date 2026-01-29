# 🌱 Seed Hub Plugin (p-seed)

The Seed Hub is an incubator for raw ideas. It ensures quality control through a structured evaluation process.

## 🔄 Workflow

1.  **Draft:** /kamiflow:p-seed:draft
    - Start an interview.
    - Generates a file with a unique **Hash ID** (e.g., X9R2) in ideas/draft/.
2.  **Analyze:** /kamiflow:p-seed:analyze <file>
    - AI evaluates Feasibility, Risk, and Value.
    - Scores are saved to the file's frontmatter.
3.  **Refine:** Edit the file manually or using /kamiflow:p-seed:analyze again.
4.  **Promote:** /kamiflow:p-seed:promote <file>
    - Checks if Feasibility >= 0.7.
    - Moves file to ideas/backlog/.

## 🛡️ Quality Gate
By default, ideas must score above **0.7** in Feasibility to be promoted. Use --force to bypass.
