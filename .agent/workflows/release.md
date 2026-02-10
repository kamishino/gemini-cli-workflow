---
description: KamiFlow Release - Smart version bump, changelog generation, and release commit
---

# KamiFlow Release Workflow

Generates release notes from ROADMAP, analyzes git history, and automates version bumping.

## References

- `.gemini/commands/kamiflow/dev/release.toml` — Original release command logic
- `.kamiflow/ROADMAP.md` — Source of completed items
- `package.json` — Version source of truth

---

## Steps

// turbo

1. Read `.kamiflow/ROADMAP.md` to identify completed items since last release.

// turbo 2. Read `package.json` to get current version.

// turbo 3. Run `git log --oneline` from last tag to HEAD to analyze recent commits.

4. **Determine version bump type:**
   - **PATCH** (x.x.X): Bug fixes, documentation, refactors
   - **MINOR** (x.X.0): New features, new commands, non-breaking additions
   - **MAJOR** (X.0.0): Breaking changes, architecture overhauls

5. **Generate CHANGELOG entry** with sections:
   - ✨ Features
   - 🐛 Bug Fixes
   - 🔧 Maintenance
   - 📝 Documentation
   - ⚠️ Breaking Changes (if any)

6. Update `CHANGELOG.md` with the new entry (prepend at top).

7. Bump version in `package.json` (root) and `cli-core/package.json` if it exists.

// turbo 8. Run `npm run sync-all` to rebuild with new version.

9. Stage all changes and commit:

   ```
   release: v{NEW_VERSION}
   ```

10. **Present release summary to user** with:
    - Old version → New version
    - Changelog preview
    - Ask if they want to create a git tag: `git tag v{NEW_VERSION}`
