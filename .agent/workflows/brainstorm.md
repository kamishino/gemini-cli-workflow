---
description: Phase 0 Brainstorm — Generate and rate ideas before planning. Use before /develop or /kamiflow.
---

# /brainstorm — Idea Generation Workflow

Transform a vague idea into a clear, rated shortlist ready for `/develop` or `/kamiflow`.

**Intent triggers** — This workflow activates when you say things like:

- "I have an idea for..."
- "What if we..."
- "I'm thinking about building..."
- "Help me think through..."

---

## Phase 1: Clarify

// turbo

1. **Read context** — Load `.memory/context.md` to understand current project state.

2. **Ask 3 clarifying questions** — Probe the problem space before generating ideas:
   - What problem does this solve? Who feels the pain?
   - What does success look like in 30 days?
   - What constraints exist? (time, tech stack, budget, team size)

3. **🛑 STOP & WAIT** for user answers before proceeding.

---

## Phase 2: Diverge

4. **Generate 5-10 diverse ideas** — Include a mix of:
   - 🟢 Safe/obvious approaches
   - 🟡 Lateral/adjacent ideas
   - 🔴 Unconventional/contrarian ideas (at least 2)

   For each idea, provide:
   - **Name** — short label
   - **Description** — 1-2 sentences
   - **Core mechanic** — the key insight that makes it work

---

## Phase 3: Rate

5. **Score each idea** on two axes (1–5):

   | Idea | Feasibility | Impact | Score |
   | :--- | :---------- | :----- | :---- |
   | ...  | /5          | /5     | /10   |
   - **Feasibility** — Can you build it with current stack/time/skills?
   - **Impact** — How much value does it deliver if it works?

---

## Phase 4: Recommend

6. **Top 3 recommendations** — Present with reasoning:
   - 🥇 **Best bet** — highest Score, fits constraints
   - 🥈 **Dark horse** — lower Score but high upside if assumptions hold
   - 🥉 **Quick win** — fastest to validate/ship

7. **Hand off** — Ask user which to pursue, then:
   - Small/obvious → redirect to `/quick-fix`
   - Feature/complex → redirect to `/develop` or `/kamiflow`

---

## Related Workflows

| Workflow     | When to Use                                  |
| :----------- | :------------------------------------------- |
| `/develop`   | After brainstorm — full planning + execution |
| `/kamiflow`  | KamiFlow projects — full Sniper Model        |
| `/quick-fix` | If top idea is small and obvious             |
