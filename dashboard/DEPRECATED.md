# ⚠️ DEPRECATED

**Status:** This dashboard is deprecated as of v2.39.

## Why Deprecated?

1. **Architecture Mismatch:** KamiFlow is terminal-first; web dashboard adds unnecessary complexity
2. **Limited Value:** Most KamiFlow users work in CLI/IDE, not browser
3. **Maintenance Burden:** Separate React app requires independent updates
4. **Docker Impact:** Increases image size for unused feature

## Alternatives

- **Terminal UI:** Consider `blessed` or `ink` for TUI dashboards
- **IDE Integration:** Use VS Code/Windsurf extensions for visualization
- **CLI Commands:** `kami status`, `kami roadmap` provide similar info

## Migration

If you were using the dashboard, use these CLI alternatives:

| Dashboard Feature | CLI Alternative |
|-------------------|-----------------|
| Task list | `kami list-tasks` |
| Roadmap view | `kami roadmap` |
| Project status | `kami doctor` |

## Removal Timeline

- **v2.39:** Marked as deprecated
- **v3.0:** Will be removed from repository

---

*Last updated: 2026-02-02*
