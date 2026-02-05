# 🧩 Multi-Agent Bridge (/p-agents)

**Position:** Collaboration Plugin / Skill Dispatcher
**Status:** Operational (v2.39+)

---

## 🔍 What is the Multi-Agent Bridge?

The **Multi-Agent Bridge** synchronizes "Intelligence" across multiple AI tools (Cursor, Windsurf, Claude Code, Gemini CLI, etc.). It supports **two skill systems**:

1. **Gemini CLI Native Skills** - Built-in skill system with `/skills` commands
2. **Community Skills** - External skills from GitHub repositories

---

## 🎯 Skill Discovery Tiers

KamiFlow searches for skills in this order:

| Tier             | Location            | Description                                       |
| ---------------- | ------------------- | ------------------------------------------------- |
| **1. Workspace** | `.gemini/skills/`   | Project-specific skills                           |
| **2. User**      | `~/.gemini/skills/` | User-wide skills                                  |
| **3. Community** | GitHub repos        | External skills (skills.sh, awesome-agent-skills) |

---

## 🚀 Gemini CLI Native Skills (Recommended)

### Quick Commands

```bash
# List available skills
gemini /skills

# Enable a skill for current session
gemini /skills enable <skill-name>

# Disable a skill
gemini /skills disable <skill-name>
```

### KamiFlow Skill Sync (SSOT)

Skills source lives in `resources/blueprints/skills/` and syncs to `.gemini/skills/`:

```bash
# Sync skills from source to .gemini/skills/
kami sync-skills

# Or during full transpile
kami transpile
```

### Creating Custom Skills

1. Create skill folder: `resources/blueprints/skills/<skill-name>/`
2. Add `SKILL.md` with skill definition
3. Run `kami transpile` to sync

See: [Gemini CLI Skills Docs](https://googlegemini.github.io/gemini-cli/docs/cli/skills/)

---

## 🌐 Community Skills (GitHub)

### Installation Methods

**Method A: Gemini CLI Native (Recommended)**
```bash
# Install from GitHub
gemini /skills install <github-url>

# Example
gemini /skills install vercel-labs/agent-skills/skills/react-best-practices
```

**Method B: KamiFlow Add Command**
```bash
# Fetch, audit, and install
/kamiflow:p-agents:add vercel-labs/agent-skills/skills/react-best-practices
```

### 🛡️ Safe Audit Protocol

Before any external skill is installed, KamiFlow performs a **Safety Audit**:
1. **Fetch:** Reads the skill's source code directly from GitHub
2. **Analyze:** Identifies required permissions and potential system risks
3. **Report:** Presents a detailed report for approval

---

## 🔄 The Collaboration Workflow

1. **🌱 Discovery:** Use `/kamiflow:p-agents:scan` to see active agents
2. **� Browse:** Check `resources/blueprints/skills/CATALOG.md` for recommended skills
3. **🚀 Install:** Use Gemini CLI `/skills` or `/kamiflow:p-agents:add`
4. **🔄 Sync:** Run `kami sync-skills` to distribute to all agents

---

## 🛠️ Commands

| Command | Action | Goal |
| :--- | :--- | :--- |
| `/kamiflow:p-agents:scan` | **Scout** | Find active agent directories in the project |
| `/kamiflow:p-agents:add`  | **Install** | Fetch, audit, and install a skill to agents |
| `/kamiflow:p-agents:list` | **Inventory** | List all installed extension skills |

### Terminal Commands

| Command            | Goal                                                                 |
| :----------------- | :------------------------------------------------------------------- |
| `kami sync-skills` | Sync skills from `resources/blueprints/skills/` to `.gemini/skills/` |

---

## 📁 Skill Sources (SSOT)

| Path                                     | Purpose                                      |
| ---------------------------------------- | -------------------------------------------- |
| `resources/blueprints/skills/`           | Source of truth for custom skills            |
| `.gemini/skills/`                        | Generated skills (synced by transpiler)      |
| `resources/blueprints/skills/CATALOG.md` | Curated list of recommended community skills |

---

## 🔗 Related Resources

- [Gemini CLI Skills Documentation](https://googlegemini.github.io/gemini-cli/docs/cli/skills/)
- [Awesome Agent Skills](https://github.com/VoltAgent/awesome-agent-skills) - 200+ curated skills
- [skills.sh](https://skills.sh/) - Community skill registry


