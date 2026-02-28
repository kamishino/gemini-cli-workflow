---
description: Release - Smart version bump, changelog generation, and release commit
---
<!-- AGK_WORKFLOW_RENDER: id=release; target=antigravity; model=default -->

# /release — Release Workflow

Analyze git history, generate changelog, bump version, and create release commit.

## Runtime Notes

### Runtime Profile: Antigravity

- Primary command surface: `agk` CLI + `.agent/workflows/*.md`.
- Rule surfaces: `GEMINI.md`, `.gemini/rules/`, and project `AGENTS.md`.
- Prefer AGK-native diagnostics (`agk status`, `agk doctor`) for validation guidance.


### Model Profile: Default

- Balance speed and rigor.
- Prefer targeted verification before broad suites.
- Keep outputs clear, concise, and actionable.


**Intent triggers** — This workflow activates when you say things like:

- "Create a new release"
- "Bump the version"
- "Generate the changelog"
- "Prepare for publishing"
- "Ship it"

## When to Use

- A feature/release commit is already finalized and validated.
- You need a controlled version bump with changelog traceability.
- You want release metadata prepared before tagging/publishing.

---

## Steps

// turbo

1. **Load Memory** — Read `.memory/context.md` and `.memory/decisions.md` for release context.

// turbo

2. **Read `package.json`** to get current version.

// turbo

3. **Analyze git history** — Run `git log --oneline` from last tag to HEAD.

// turbo

4. **Read CHANGELOG.md** (if exists) to identify completed items since last release.

5. **Determine version bump:**

   | Type              | When                                    | Example       |
   | ----------------- | --------------------------------------- | ------------- |
   | **PATCH** (x.x.X) | Bug fixes, docs, refactors              | 1.0.0 → 1.0.1 |
   | **MINOR** (x.X.0) | New features, non-breaking additions    | 1.0.1 → 1.1.0 |
   | **MAJOR** (X.0.0) | Breaking changes, architecture overhaul | 1.1.0 → 2.0.0 |

   Present recommendation and **wait for user confirmation**.

6. **Generate CHANGELOG entry** with sections:
   - ✨ Features
   - 🐛 Bug Fixes
   - 🔧 Maintenance
   - 📝 Documentation
   - ⚠️ Breaking Changes (if any)

7. **Update files:**
   - Prepend new entry to `CHANGELOG.md`
   - Bump version in `package.json`

8. **Release commit:**

   ```
   release: v{NEW_VERSION}
   ```

9. **Present summary to user:**
   - Old version → New version
   - Changelog preview
   - Ask: "Create git tag `v{NEW_VERSION}`?" (user decides)

10. **Update Memory** — Update `.memory/context.md` with new version info.

---

## Related Workflows

| Workflow   | When to Use                                              |
| ---------- | -------------------------------------------------------- |
| `/review`  | Final quality review before release bump                 |
| `/sync`    | Record session intelligence after release prep           |
| `/develop` | Return to implementation when release blockers are found |
