# 🎭 AI Execution Modes

KamiFlow supports two distinct modes of operation for AI Agents. These modes define the "Finish Line" for any given task.

---

## 🏗️ 1. Planner Mode

In **Planner** mode, Gemini acts as your **Architect and Strategist**. 

- **Goal:** Transform a raw idea into a high-fidelity technical blueprint.
- **Output:** S1-IDEA, S2-SPEC, and S3-BUILD artifacts.
- **Exit Point:** After generating the implementation task list, the session ends.
- **Use Case:** Best when you want to review the plan first and perform the actual coding in a specialized AI Editor like **Windsurf** or **Cursor**.

---

## 🛠️ 2. Implementer Mode (Default)

In **Implementer** mode, Gemini acts as your **Senior Engineer**.

- **Goal:** Complete the entire cycle from idea to verified code.
- **Output:** All planning artifacts PLUS the actual code changes and verification reports.
- **Exit Point:** After the code is written, validated, and the task is archived.
- **Use Case:** Best for self-contained logic changes, unit testing, and automation tasks where Gemini can handle the full lifecycle.

---

## 🔒 Gated Automation

Regardless of the mode, your safety is guaranteed by the `gatedAutomation` setting in `.kamirc.json`.

- **`gatedAutomation: true` (Safe):** The AI will stop at the **Strategic Gate** (Phase 1) and wait for your explicit approval of the plan before proceeding.
- **`gatedAutomation: false` (Fast):** The AI will automatically select the best approach (Option B) and proceed without stopping, provided the task is not flagged as **High-Risk**.

> **⚠️ Note:** High-Risk tasks (core logic, bulk edits) ALWAYS require a mandatory **TDD (Test-First)** protocol, ensuring the stability of your codebase.
