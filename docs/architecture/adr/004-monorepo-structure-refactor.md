# ADR 004: Monorepo Structure Refactor

**Date:** 2026-02-17  
**Status:** Accepted  
**Context:** Project Structure Refactor (Option B)

---

## Context

The gemini-cli-workflow project had grown organically with `cli-core/` at the root level and a bloated `resources/` directory containing mixed concerns (docs, architecture, schemas, agents, templates). This structure created several issues:

1. Non-standard monorepo layout (cli-core not in packages/)
2. Unclear separation of concerns
3. Publishing complexity
4. Path coupling (100+ hardcoded references)
5. Root directory clutter

---

## Decision

We restructured the project to follow **standard monorepo conventions (Option B - Balanced Refactor)**:

### Directory Reorganization

```
Before                          After
───────────────────────────────────────────────────────────
cli-core/                    → packages/kamiflow-cli/
resources/docs/              → packages/kamiflow-cli/docs/
resources/architecture/      → docs/architecture/
resources/schemas/           → packages/kamiflow-cli/schemas/
resources/agents/            → .windsurf/agents/
resources/meta/              → docs/
resources/templates/         → resources/blueprints/templates/ (merged)
install.sh, install.ps1      → .github/scripts/
Dockerfile                   → packages/kamiflow-cli/
BENCHMARK_RESULTS.md         → packages/kamiflow-cli/
```

### Workspace Configuration

- Simplified `pnpm-workspace.yaml` to use `packages/*` pattern
- Updated all path references (26 files, 100+ occurrences)
- Fixed CI/CD workflows (.github/workflows/\*)
- Updated build configs (jest, eslint, semantic-release)

---

## Consequences

### Positive

✅ **Standard Structure** — Recognized by all monorepo tools  
✅ **Clear Separation** — CLI, blueprints, and docs are logically separated  
✅ **Better DX** — Easier for contributors to navigate  
✅ **Independent Publishing** — Each package can publish separately  
✅ **Cleaner Root** — Install scripts and Docker moved to appropriate locations

### Negative

⚠️ **One-Time Migration Cost** — 100+ path references needed updates  
⚠️ **Potential Git History Impact** — git mv preserves history, but some tools may not follow

### Neutral

🔵 **No Breaking Changes** — All path updates are internal  
🔵 **Build Verified** — All tests passing (82/82)  
🔵 **CI Updated** — GitHub Actions workflows updated

---

## Implementation

**Files Changed:** 26 files (+149/-146 lines)  
**Commits:**

- `a9fb364` - refactor: restructure project for standard monorepo layout
- `02eb7e1` - chore: code review cleanup

**Verification:**

- ✅ `pnpm install` — workspace valid
- ✅ `pnpm test` — all tests pass
- ✅ `pnpm run build` — build succeeds

---

## References

- [Implementation Plan](file:///C:/Users/toanh/.gemini/antigravity/brain/7d4e73be-88b4-410c-a1af-e283418c1757/implementation_plan.md)
- [Walkthrough](file:///C:/Users/toanh/.gemini/antigravity/brain/7d4e73be-88b4-410c-a1af-e283418c1757/walkthrough.md)
- [Code Review](file:///C:/Users/toanh/.gemini/antigravity/brain/7d4e73be-88b4-410c-a1af-e283418c1757/code_review.md)
