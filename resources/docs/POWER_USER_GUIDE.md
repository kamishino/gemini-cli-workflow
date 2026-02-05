# 📋 KamiFlow Power User Guide

> **Warning:** This guide covers advanced features. With great power comes great responsibility.

## ⚡ The Saiyan Automation Suite (v2.24+)

KamiFlow v2.24 introduces "God Mode" automation levels, allowing the AI to take over the decision-making loop for trusted tasks.

### 1. `/dev:saiyan` (The Executor)

**Concept:** A high-speed, autonomous execution mode for single tasks.
**Behavior:**

- **Auto-Selection:** Automatically chooses **Option B (Balanced)** during the Idea Phase.
- **Auto-Approval:** Bypasses manual confirmation for Specs and Build Plans.
- **Auto-Healing:** Retries up to 3 times if validation fails.
- **Auto-Cleanup:** Archives the task immediately upon success.

**Usage:**

```bash
/dev:saiyan "Fix the bug in the login form"
```

### 2. `/dev:supersaiyan` (The Orchestrator)

**Concept:** A meta-loop that manages cycles of development.
**Behavior:**

- **Cycle:** Executes a batch of 3 tasks sequentially.
- **Source:** Can pull from `ideas/backlog` (FIFO) or generate new ideas via Market Research.

**Usage:**

```bash
/dev:supersaiyan
# Then select Source: Backlog or Research
```

---

## ⚛️ Atomic Workflows

### Atomic Release Polish

When you run `/release` (or `npm version`), KamiFlow performs a "Polish Pass" before the final commit:

1.  **Sync Docs:** Updates `{{KAMI_WORKSPACE}}docs/commands/*.md`.
2.  **Sync Roadmap:** Updates `{{KAMI_WORKSPACE}}ROADMAP.md` with recent achievements.
3.  **Unified Commit:** Amends all changes into a single `chore(release)` commit.

### Archive Automation

You can now archive tasks non-interactively:

```bash
kami archive 056 --force
```

This is used internally by the Saiyan modes to keep the workspace clean without interrupting the flow.

---

## 🔄 Checkpoint Management (v2.0)

### What Are Checkpoints?

Auto-saved workflow state at 7 key phases:

- Phase 0 (Logical Guard)
- Phase 0.5 (Assumption Verification)
- Phase 1 (Diagnostic Interview)
- Phase 2 (Strategic Synthesis)
- Phase 3A (Planning Complete)
- Phase 3B (Validation Complete)
- Phase 4 (Complete)

### When to Use

- Long-running workflows (>30 min)
- Interrupted sessions (computer restart, network issues)
- Switching between tasks

### How to Resume

**Automatic (on wake):**

```bash
/kamiflow:ops:wake
# → "Task 042 paused at Phase 2. Resume? (Y/N)"
```

**Manual:**

```bash
/kamiflow:ops:resume 042
```

### Checkpoint Retention

- **Active:** Kept until workflow completes
- **Completed:** Kept for 30 days
- **Storage:** `.kamiflow/checkpoints/[ID]-checkpoint-[phase].json` (in your project workspace)

### Advanced: Checkpoint Inspection

```bash
# List all checkpoints
ls .kamiflow/checkpoints/

# View checkpoint details
cat .kamiflow/checkpoints/042-checkpoint-phase2.json
```

---

## 🧠 Memory Management (Advanced)

### Session Recovery

Run `/kamiflow:ops:wake` at the start of every session to reload the `{{KAMI_WORKSPACE}}PROJECT_CONTEXT.md` and `cached_max_id`. This prevents ID collisions and hallucinations.

### Manual Sync

If the AI seems confused, force a sync:

```bash
kami sync
```

This updates all documentation markers based on the current CLI configuration.


