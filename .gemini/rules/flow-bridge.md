# 🌉 Protocol: The IDE Bridge (Handoff)

> **Purpose:** Seamless context handoff between Gemini CLI (Strategy) and external AI Editors (Windsurf/Cursor).

---

## 1. 🎯 Separation of Concerns
- **Gemini CLI:** The Technical Co-Founder (Strategy, Planning, Memory).
- **AI Editor:** The 10x Engineer (High-speed Editing, Refactoring, Debugging).

---

## 2. 📋 The Handoff Workflow (S4-HANDOFF)

### MANDATORY Contents of Handoff Package:
- [ ] **The Objective:** Clear high-level goal.
- [ ] **Source of Truth:** Links to active S2-SPEC and S3-BUILD.
- [ ] **Technical Constraints:** Rules from `manifesto.md` and `tech-stack.md`.
- [ ] **The Battle Plan:** Full Task & Subtask list with **Anchor Points**.
- [ ] **Documentation Contract:** List of files that MUST be updated (README, ROADMAP, etc.).

### FORBIDDEN Actions:
- Do NOT refactor unrelated code during implementation.
- Do NOT create files > 300 lines.

---

## 3. 🔄 The Sync Back (IDE -> Gemini)
After implementing in the IDE, you MUST run `/kamiflow:ops:sync`.

### AI Integrator Actions:
1. **Log Processing:** Read logs from `docs/handoff_logs/`.
2. **Docs Alignment:** Update `PROJECT_CONTEXT.md` and `ROADMAP.md` status.
3. **Atomic Exit:** Offer to Archive artifacts if the task is finished.

## ✅ Success Criteria
- Zero context loss during the switch from Terminal to IDE.
- Project memory is updated immediately after implementation.