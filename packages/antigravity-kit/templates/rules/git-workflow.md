---
description: Git Workflow — Branch naming, commit format, and PR requirements for AI agents.
---

# Git Workflow

> Rules for how AI agents interact with git.

## Branch Naming

- `feat/<description>` — New features
- `fix/<description>` — Bug fixes
- `refactor/<description>` — Code restructuring
- `docs/<description>` — Documentation changes
- `chore/<description>` — Maintenance tasks

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

**Examples:**

```
feat(auth): add OAuth2 login flow
fix(api): handle null response from /users endpoint
test(cart): add coverage for discount calculation
```

## Rules

- ✅ Always: Write descriptive commit messages (not "fix bug" or "update")
- ✅ Always: One logical change per commit
- ⚠️ Ask first: Force pushing, rebasing shared branches
- ⚠️ Ask first: Squashing commits on feature branches
- 🚫 Never: Commit secrets, API keys, or credentials
- 🚫 Never: Commit directly to `main` without review (in team projects)
- 🚫 Never: Commit generated files (`dist/`, `build/`, `.next/`)

## PR Requirements

- Title follows commit message format
- Description explains what and why (not how)
- All tests pass before merge
- At least one approval (in team projects)
