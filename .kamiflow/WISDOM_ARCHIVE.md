# 📚 PROJECT WISDOM ARCHIVE

This file contains historical strategic patterns and legacy knowledge harvested from completed tasks.

---

## #CLI
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 110 | Alias-First UX | **Alias-First UX:** In a CLI, users often prefer Aliases over original commands. Prioritizing Aliases not only keeps the interface cleaner but also directly guides users on the most efficient usage. | Task 110 |
| 111 | Prefix Strategy for Maintenance | **Prefix Strategy for Maintenance:** Using the _ prefix combined with hidden commands in Commander.js is an effective strategy for maintaining AI support tools without complicating the end-user experience. | Task 111 |
| 145 | Hybrid Gate Orchestration | **Hybrid Gate Orchestration:** Instead of fragmented commands, a unified 'Flow' command using state-based gates allows the user to switch between Autopilot and Manual modes at strategic milestones, reducing cognitive load. | Task 145 |
| 148 | Vertical Feed UX for CLI | **Vertical Feed UX for CLI:** While Markdown tables look professional, they are prone to horizontal truncation in terminal environments. Using nested vertical lists ensures 100% information density and readability across all screen sizes. | Task 148 |

## #General
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 106 | Data is Steel Evidence | **Data is Steel Evidence:** Optimization without measurement is often just a "feeling". By saving 770 tokens, we have freed up space for approximately 150-200 lines of project code in the AI Context Window. | Task 106 |
| 109 | Regex-Proof Documentation | **Regex-Proof Documentation:** When building automated string replacement systems (like a Transpiler), there must always be an escape mechanism for the documentation itself. Using spaces like {{ TOKEN }} is a simple yet highly effective solution to "trick" Regex while remaining AI-readable. | Task 109 |
| 137 | Value Delivered | **Value Delivered:** KamiFlow now has a "Permanent Memory" that improves with every task. | Task 137 |

## #Logic
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 131 | Logic | **Logic:** Stricter MoSCoW rules prevent scope creep in MVP options. | Task 131 |
| 137 | Logic | **Logic:** Using single-quoted heredocs in PowerShell avoids accidental interpolation. | Task 137 |
| 137 | Pattern | **Pattern:** Category headers in Markdown can be easily parsed using simple split/regex logic without a heavy DB. | Task 137 |
| 141 | Logic | **Logic:** Relational indexing in SQLite enables graph-like queries and relationship tracking without a dedicated graph database, preserving SSOT. | Task 141 |
| 143 | Recursive Diagnostic Discipline | **Recursive Diagnostic Discipline:** Forcing an AI to self-assess its understanding (Clarify Score) before designing a solution prevents "Overconfident Hallucination". Listing Ambiguity Nodes provides a clear feedback loop for the user. | Task 143 |
| 144 | Cross-Phase Logic Anchoring | **Cross-Phase Logic Anchoring:** Logic should not be stateless between phases. By enforcing Score checks at S2 and Drift Detection at S3, the system ensures that the implementation plan remains anchored to the original facts agreed upon in Phase 1. | Task 144 |
| 146 | Manifest-Driven Preset Architecture | **Manifest-Driven Preset Architecture:** Managing project features through a central JSON manifest allows for safe, filtered installations and upgrades without hardcoding complex logic, improving maintainability. | Task 146 |
| 149 | State-Driven Orchestration | **State-Driven Orchestration:** Moving workflow state management from Prompt-based (probabilistic) to Code-based (deterministic) using a WorkflowEngine ensures project portability and 100% adherence to discipline gates like Clarify Score. | Task 149 |

## #Rules
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 105 | Modularization is the Key to Lean | **Modularization is the Key to Lean:** Combining everything into a single file dilutes the context. Separating Mandatory (Core) and Optional (Library) rules is the most optimal strategy for Token Efficiency. | Task 105 |
| 105 | Transpiler needs more flexibility | **Transpiler needs more flexibility:** Upgrading transpiler.js to search for files recursively helps organize blueprints more neatly without breaking the Gemini CLI output structure. | Task 105 |
| 107 | Dynamic Verification vs Hardcoding | **Dynamic Verification vs Hardcoding:** Using hardcoded file lists in sync-docs.js is a maintenance trap. Switching to search logic based on the -core.md suffix helps the system self-adapt when file structures change. | Task 107 |
| 108 | Naming is Architecture | **Naming is Architecture:** Naming conventions are not just for readability but also reflect the layered structure of the system. Separating main-, flow-, and std- helps the AI understand the role of each rule from its name. | Task 108 |
| 142 | Constitutional Behavior Lock | **Constitutional Behavior Lock:** Technical rules (rules/) are often ignored by LLMs in favor of training data. Injecting strict prohibitions into the System Constitution (GEMINI.md) creates a high-priority behavioral lock that overrides default habits. | Task 142 |

## #Sync
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 131 | Sync | **Sync:** Historical checks ensure we don't repeat the same diagnostic questions twice. | Task 131 |

## #UI
| ID | Pattern | Wisdom | Source |
| :--- | :--- | :--- | :--- |
| 137 | Aesthetics | **Aesthetics:** Keeping the Knowledge Base in PROJECT_CONTEXT.md makes it a living document for both AI and Humans. | Task 137 |
