# Architectural Decisions

> Append-only log of significant decisions. AI reads this to understand project rationale.

<!--
FORMAT:
## [YYYY-MM-DD] — [Decision Title]
**Context:** Why this decision was needed.
**Decision:** What was decided.
**Alternatives:** What was considered but rejected.
**Consequences:** Impact on the project.
-->

## [2026-02-19] — Package renamed to @kamishino/antigravity-kit

**Context:** `antigravity-kit` was already taken on npm.
**Decision:** Scoped the package as `@kamishino/antigravity-kit`.
**Alternatives:** Different name entirely (rejected — less clear).
**Consequences:** Users must install with scoped name. `agk` alias unchanged.

## [2026-02-19] — `agk` as primary CLI alias (not `kf`)

**Context:** Needed a short alias for the CLI. `kf` was considered (KamiFlow).
**Decision:** Used `agk` (Antigravity Kit) to avoid coupling with KamiFlow branding.
**Alternatives:** `kf`, `kami`, `ak` (all rejected — too coupled or too generic).
**Consequences:** Clear separation: `agk` = portable kit, `kf` = KamiFlow CLI.

## [2026-02-19] — `.gemini/rules/` as SSOT for Antigravity guard rails

**Context:** Rules existed in both `.agent/rules/` and `.gemini/rules/`. Antigravity reads
only `.gemini/rules/` via `@` imports in `GEMINI.md`.
**Decision:** All `agk` commands (doctor, status, upgrade) check `.gemini/rules/` first,
`.agent/rules/` as fallback only.
**Alternatives:** Treat both as equal (rejected — creates confusion about which is authoritative).
**Consequences:** Clear SSOT. New projects get rules in `.gemini/rules/` by default.

## [2026-02-19] — Smart default checks both `.agent/` AND `.gemini/rules/`

**Context:** `agk` (no args) smart default only checked `.agent/` — projects with only
`.gemini/rules/` would incorrectly trigger `init` instead of `doctor`.
**Decision:** Check `hasAgent || hasGemini` — either presence means initialized.
**Alternatives:** Check only `.agent/` (rejected — misses Gemini-only setups).
**Consequences:** Correct behavior for all project configurations.

## [2026-02-19] — `/develop` and `/kamiflow` kept as separate workflows

**Context:** Both workflows do the same thing (idea → code) but `/kamiflow` has KamiFlow-
specific dependencies (`.kamiflow/`, ROADMAP.md, kamiflow CLI).
**Decision:** Keep both. `/develop` = portable (agk template). `/kamiflow` = KamiFlow-native.
**Alternatives:** Merge into one (rejected — would break portability).
**Consequences:** Users on this repo use `/kamiflow`. Users on other projects use `/develop`.

## [2026-02-19] — Memory privacy via private git repo (not gitignore)

**Context:** `.memory/` committed to public repo exposes architectural decisions.
**Decision:** Recommended approach is a separate private git repo for `.memory/`.
**Alternatives:** gitignore (breaks cross-PC sync), git-crypt (complex), Dropbox (not git-native).
**Consequences:** `agk memory sync` command planned to automate push/pull.
