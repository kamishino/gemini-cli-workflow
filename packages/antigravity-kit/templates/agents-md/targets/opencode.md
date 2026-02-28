### OpenCode Runtime

- Primary rules file: root `AGENTS.md`.
- Command surface: `.opencode/commands/*.md`.
- Optional extra instructions can be loaded via `opencode.json` `instructions`.

### Operational Notes

- Keep `AGENTS.md` concise, actionable, and project-specific.
- Prefer explicit slash commands for common flows (`/develop`, `/quick-fix`, `/review`).
- Re-generate OpenCode commands from workflow SSOT with `agk init --target opencode`.
