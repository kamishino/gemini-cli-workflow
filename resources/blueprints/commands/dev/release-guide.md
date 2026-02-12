---
name: release-guide
type: PARTIAL
description: [KamiFlow] Detailed protocol for Roadmap-Based Semantic Releases.
group: autopilot
order: 31
---

# 📖 Release Guide: Strategic Release Protocol

## 1. Intelligence Sources
- **ROADMAP (Primary):** Strategic achievements, quality metrics, market intelligence.
- **Git History (Secondary):** Semantic analysis of commits since last tag.
- **Lineage:** Match commit IDs to ROADMAP entries for value-driven notes.

## 2. Note Structure
- **Strategic Achievements:** Highlights from ROADMAP.
- **Features & Fixes:** Commits enriched with achievement context.
- **Quality Metrics:** Validation rates, tech debt addressed, auto-heal rate.
- **Market Position:** Competitive advantages built.

## 3. SemVer Recommendation
- **MAJOR:** Breaking changes documented in ROADMAP or commits.
- **MINOR:** New capabilities added (backwards-compatible).
- **PATCH:** Bug fixes, refactors, docs, quality improvements.

## 4. Atomic Polish Execution
1. **Bump:** `npm version [level]`.
2. **Sync:** Propagate version across all system files.
3. **Docs:** Run `kami sync` to refresh Command Documentation.
4. **Commit:** Create unified `chore(release): vX.Y.Z` with generated notes.
5. **Tag:** Create and sign Git Tag.
