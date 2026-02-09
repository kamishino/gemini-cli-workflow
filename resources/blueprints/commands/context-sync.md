---
name: context-sync
type: PARTIAL
description: [KamiFlow] Pre-execution context synchronization mandate.
order: 10
---

# 🧠 SYSTEM INSTRUCTION: CONTEXT SYNCHRONIZATION

## 0. MANDATORY CONTEXT LOADING

**CRITICAL:** Before processing any request, you MUST:

1. **Read `{{KAMI_WORKSPACE}}PROJECT_CONTEXT.md`** to grasp current project state and tech stack.
2. **Read `{{KAMI_WORKSPACE}}ROADMAP.md`** to align with strategic pillars.
3. **Analyze Task Scope:** Determine if the current intent impacts core system integrity (CLI core, commands, or mandates) to apply the **Balanced Sync Protocol** (Conditional GEMINI.md update) upon completion.

---

## 1. v2.0 INTELLIGENCE PROTOCOL

**Strictly adhere to the intelligence loading protocol defined in:**
`{{KAMI_RULES_GEMINI}}main-context-intelligence-core.md`

**Golden Rules:**
- `PROJECT_CONTEXT` & `ROADMAP` = High-frequency RAM (Update on every task).
- `GEMINI.md` = System Constitution (Update only on system-level changes).

---

## 2. CROSS-MACHINE CONSISTENCY

Ensure all context updates are saved to git-tracked files to maintain identical AI awareness across all development environments.

---

## 3. CONTEXT SHARDING (G29M) 🧩

**GOAL:** Optimize token overhead by loading only the "Global Brain" and specific "Skill Shards" relevant to the current task.

### 3.1 The Shard Map (SSOT)

| Shard ID | Domain | Included Rules (Pattern) |
| :--- | :--- | :--- |
| **GLOBAL** | Mandatory | \`main-\`, \`flow-factory-\`, \`std-id-\`, \`std-anti-hallucination-\` |
| **#UI** | Design/UX | \`std-ui-\`, \`web-design-guidelines\` |
| **#Sync** | Multi-device | \`flow-sync-\`, \`sync-backend\` docs |
| **#Logic** | Architecture | \`std-blueprint-\`, \`std-atomic-\` |
| **#Rules** | Governance | \`std-markdown-\`, \`std-placeholder-\` |
| **#CLI** | Interface | \`std-command-\`, \`cli-ux-\` |

### 3.2 Sharding Mandate

1. **Global Lock:** ALWAYS keep the **GLOBAL** shard in active memory.
2. **Detection:** During Phase 0.5, analyze task keywords to identify the required **Skill Shard**.
3. **Collapsing:** You are instructed to "Collapse" (ignore full content) of all shards NOT detected.
4. **Expansion:** Load full wisdom tables and specific rules for the **Active Shard**.
