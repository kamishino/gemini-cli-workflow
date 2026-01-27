# 🚀 Auto-Pilot & Developer Tools (Dev)

[ 🏠 Home ](../../README.md) | [ 🚀 Start ](../../docs/GETTING_STARTED.md) | [ 📖 Wiki ](README.md) | [ 🆘 SOS ](../../docs/TROUBLESHOOTING.md)

---

Automation tools for high-speed building, archiving, and release management.

<!-- KAMI_COMMAND_LIST_START -->

### 🚀 Auto-Pilot (Automation)

| Command | Goal |
| :--- | :--- |
| `/kamiflow:dev:lazy` | **[KamiFlow] Auto-generate S1-S4 artifacts using Sniper Model with mandatory Diagnostic Gate.** |
| `/kamiflow:dev:superlazy` | **[KamiFlow] Auto-generate S1-S4 artifacts AND execute immediately with mandatory Diagnostic Gate.** |
| `/kamiflow:dev:release` | **[KamiFlow] Smart Release Manager - Analyze git history, context, and automate version bumping.** |
| `/kamiflow:dev:upgrade` | **[KamiFlow] Update KamiFlow to the latest version.** |
| `/kamiflow:dev:archive` | **[KamiFlow] Archive completed task artifacts to archive/ folder.** |
| `/kamiflow:dev:revise` | **[KamiFlow] Emergency Brake - Clarify context, resolve hallucinations, and question logic before implementation.** |

<!-- KAMI_COMMAND_LIST_END -->

---

## /kamiflow:dev:lazy
> **Goal:** Auto-generate S1-S4 artifacts using the Sniper Model with a mandatory Diagnostic Gate.

### 🧠 Logic & Thinking (CoT)
1. **Gate 1:** It forces the Diagnostic Interview.
2. **Gate 2:** It waits for your approval of the IDEA before generating SPEC, BUILD, and HANDOFF.
3. **Benefit:** High speed without sacrificing strategic alignment.

---

## /kamiflow:dev:superlazy
> **Goal:** Auto-generate artifacts AND execute implementation immediately.

### 🧠 Logic & Thinking (CoT)
1. **Full Chain:** It follows the `/lazy` flow but adds an **Autonomous Implementation** phase.
2. **Validator Loop:** It executes code -> validates results -> heals errors automatically.
3. **Atomic Exit:** Upon completion, it syncs docs, commits changes, and archives artifacts silently.

---

## /kamiflow:dev:revise
> **Goal:** Emergency Brake - Clarify context and resolve "hallucinations".

### 🧠 Logic & Thinking (CoT)
1. **Stop:** It is FORBIDDEN from creating files.
2. **Challenge:** It acts as a **Critical Reviewer**, questioning the current logic or user's request.
3. **Alignment:** It forces a "Reality Check" to ensure the project doesn't drift into scope creep or tech debt.
