# Archived Components

This directory contains deprecated or obsolete components that are no longer actively maintained.

---

## Contents

### `dashboard/` (Deprecated v2.39)

**Status:** Deprecated as of v2.39, will be removed in v3.0

**Reason:**
- Terminal-first architecture makes web dashboard unnecessary
- Limited value - most KamiFlow users work in CLI/IDE, not browser
- Maintenance burden - separate React app requires independent updates
- Docker impact - increases image size for unused feature

**Migration:** See `dashboard/DEPRECATED.md` for CLI alternatives

| Dashboard Feature | CLI Alternative |
|-------------------|-----------------|
| Task list | `kami list-tasks` |
| Roadmap view | `kami roadmap` |
| Project status | `kami doctor` |

---

### `.backup/`

**Status:** Empty backup directory from legacy operations

**Reason:** No longer used by any active systems

**Action:** Removed (was empty)

---

## Important Notes

- ⚠️ **Do not add new items to this directory**
- ⚠️ **Use proper deprecation workflow for future components**
- ⚠️ **These files may be completely removed in future versions**

---

*Last updated: 2026-02-03*
