# Dev Setup — @kamishino/antigravity-kit

Guide for developing and testing antigravity-kit locally using npm link.

---

## Overview

This repo is **dogfooding** — `gemini-cli-workflow` both develops and consumes antigravity-kit:

```
gemini-cli-workflow/
├── packages/antigravity-kit/   ← Source (what you develop)
├── .agent/workflows/           ← Consumer (what you use)
├── .memory/                    ← Consumer
└── .gemini/rules/              ← Consumer
```

---

## Setup: Dogfooding (this repo)

Test the kit against itself:

```bash
# Run doctor on this repo
node packages/antigravity-kit/bin/doctor.js

# Run init (skips existing files automatically)
node packages/antigravity-kit/bin/init.js

# Interactive setup
node packages/antigravity-kit/bin/init.js --interactive
```

---

## Setup: Personal Projects (npm link)

### Step 1 — Link the package globally

```bash
cd packages/antigravity-kit
npm link
# or: npm run link
```

### Step 2 — Link in your personal project

```bash
cd /path/to/your-project
npm link @kamishino/antigravity-kit
```

### Step 3 — Use it

```bash
# Now these use your LOCAL version:
npx antigravity-kit doctor
npx antigravity-kit init --interactive
npx antigravity-kit install-hooks
```

### Step 4 — Unlink when done

```bash
# In your personal project
npm unlink @kamishino/antigravity-kit

# In antigravity-kit source
cd packages/antigravity-kit
npm unlink
# or: npm run unlink
```

---

## Development Workflow

```
Edit scripts/doctor.js
    ↓
node packages/antigravity-kit/bin/doctor.js   ← Test in this repo
    ↓
npx antigravity-kit doctor                    ← Test in personal project (via npm link)
    ↓
Commit + bump version
```

---

## Dogfooding Detection

The doctor command auto-detects when it's running inside the source repo:

```
🐕 Dogfooding mode detected (running inside antigravity-kit source)
```

This is informational only — all checks still run normally.

---

## Publishing to npm

When ready to publish:

```bash
cd packages/antigravity-kit
npm publish --access public
```

> **Note:** Requires npm login and access to `@kamishino` scope.

---

## Useful Commands

| Command                                       | Description                         |
| :-------------------------------------------- | :---------------------------------- |
| `node packages/antigravity-kit/bin/doctor.js` | Health check (dogfooding)           |
| `node packages/antigravity-kit/bin/init.js`   | Scaffold (dogfooding)               |
| `npm run link`                                | Link globally for personal projects |
| `npm run unlink`                              | Remove global link                  |
| `npm publish --access public`                 | Publish to npm                      |
