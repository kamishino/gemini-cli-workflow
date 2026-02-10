# 🌊 KamiFlow MCP Server

> **Portable AI Workflow System for Any Agent**

[![MCP](https://img.shields.io/badge/MCP-Compatible-green)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

The **KamiFlow MCP Server** brings the structured Sniper Model workflow to any AI agent that supports the Model Context Protocol (MCP). Works seamlessly with Claude Desktop, Cursor, Windsurf, VS Code Copilot, and any MCP-compatible client.

---

## ✨ Features

### 🎯 Sniper Model Tools
- **`kamiflow_idea_create`** - Generate refined ideas with diagnostic interview
- **`kamiflow_spec_create`** - Create detailed specifications (Schema-First)
- **`kamiflow_build_create`** - Generate implementation plans (Legacy-Aware)
- **`kamiflow_bridge_export`** - Export context to external IDEs

### 🚀 Automation Tools
- **`kamiflow_saiyan_execute`** - "God Mode" autonomous execution
- **`kamiflow_task_archive`** - Archive completed work

### 🧠 Operations Tools
- **`kamiflow_context_load`** - Load project state (eliminate session amnesia)
- **`kamiflow_context_sync`** - Sync after external work
- **`kamiflow_context_save`** - Save session intelligence
- **`kamiflow_roadmap_update`** - View/update strategic roadmap

### 📚 Context Resources
- **`kamiflow://project-context`** - Live project state
- **`kamiflow://roadmap`** - Strategic roadmap
- **`kamiflow://tasks/active`** - Active tasks
- **`kamiflow://archive`** - Completed task history

---

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g kamiflow-mcp-server

# Or use with npx (no install)
npx kamiflow-mcp-server
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kamiflow": {
      "command": "kamiflow-mcp-server",
      "env": {
        "KAMIFLOW_PROJECT_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

### Cursor Configuration

Add to Cursor settings (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "kamiflow": {
      "command": "npx",
      "args": ["kamiflow-mcp-server"],
      "env": {
        "KAMIFLOW_PROJECT_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

---

## 📖 Usage Examples

### 1. Create a New Feature (Sniper Model)

```
User: I want to add a user authentication system

Claude: [Uses kamiflow_idea_create]
✅ S1-IDEA created: 001-S1-IDEA-user-authentication.md

Claude: I've created the IDEA document. Next, I'll create the specification...
[Uses kamiflow_spec_create with ideaId: "001"]
✅ S2-SPEC created: 001-S2-SPEC-user-authentication.md

Claude: Now I'll create the implementation plan...
[Uses kamiflow_build_create with specId: "001"]
✅ S3-BUILD created: 001-S3-BUILD-user-authentication.md

Claude: Perfect! You now have a complete Sniper Model workflow:
- S1-IDEA: Strategic vision and approach
- S2-SPEC: Technical specification with data models
- S3-BUILD: Atomic task list with anchor points
```

### 2. Load Project Context

```
User: What's the current state of this project?

Claude: [Uses kamiflow_context_load]
✅ KamiFlow Context Loaded!

📍 Project Root: /home/user/my-project
🗂️  Workspace: /home/user/my-project/.kamiflow

📚 PROJECT CONTEXT
- Tech Stack: TypeScript, Node.js, Express
- Current Focus: API development
- Active Tasks: 3

🗺️ ROADMAP OVERVIEW
- Authentication system (in progress)
- Database migration (planned)
- API documentation (completed)
```

### 3. Export to IDE

```
User: Send this to Cursor for implementation

Claude: [Uses kamiflow_bridge_export with targetIDE: "cursor"]
✅ Context Package generated for cursor!

[Generates complete context package with S1, S2, S3 artifacts]

Copy this into Cursor's chat to give it full strategic context...
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         MCP Clients                     │
│  (Claude, Cursor, Windsurf, etc.)      │
└────────────────┬────────────────────────┘
                 │ MCP Protocol
                 ▼
┌─────────────────────────────────────────┐
│      KamiFlow MCP Server                │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │   Tools     │  │    Resources    │  │
│  │  - idea     │  │  - context      │  │
│  │  - spec     │  │  - roadmap      │  │
│  │  - build    │  │  - tasks        │  │
│  │  - wake     │  │  - archive      │  │
│  │  - ...      │  │                 │  │
│  └─────────────┘  └─────────────────┘  │
└────────────────┬────────────────────────┘
                 │
                 ▼ File System
        ┌─────────────────┐
        │   .kamiflow/    │
        │  - tasks/       │
        │  - archive/     │
        │  - ROADMAP.md   │
        │  - PROJECT_     │
        │    CONTEXT.md   │
        └─────────────────┘
```

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KAMIFLOW_PROJECT_ROOT` | Path to KamiFlow project | Auto-detected |
| `KAMI_DEBUG` | Enable debug logging | `false` |

---

## 📝 Tool Reference

### Core Sniper Model

#### `kamiflow_idea_create`
Generate a refined idea through diagnostic interview and synthesis.

**Parameters:**
- `rawIdea` (string, required): The feature request or idea
- `fromIdeaId` (string, optional): ID of existing idea to refine

**Returns:** S1-IDEA file with 3 approach options and MoSCoW prioritization

---

#### `kamiflow_spec_create`
Create detailed specification with Schema-First approach (Lock 2).

**Parameters:**
- `ideaId` (string, required): Task ID of the S1-IDEA file
- `ideaFile` (string, required): Filename of the S1-IDEA file

**Returns:** S2-SPEC file with user stories, data models, API signatures

---

#### `kamiflow_build_create`
Generate implementation task list with Legacy Awareness (Lock 3).

**Parameters:**
- `specId` (string, required): Task ID of the S2-SPEC file
- `specFile` (string, required): Filename of the S2-SPEC file

**Returns:** S3-BUILD file with atomic tasks and execution plan

---

#### `kamiflow_bridge_export`
Export context package for external IDEs.

**Parameters:**
- `buildId` (string, required): Task ID of the S3-BUILD file
- `buildFile` (string, required): Filename of the S3-BUILD file
- `targetIDE` (enum, optional): `cursor`, `windsurf`, `copilot`, `generic`

**Returns:** Complete context package for IDE handoff

---

### Operations

#### `kamiflow_context_load`
Load project context and eliminate session amnesia.

**Parameters:**
- `refresh` (boolean, optional): Force reload from disk

**Returns:** Project context summary including tech stack, active tasks, roadmap

---

#### `kamiflow_context_save`
Save session intelligence to PROJECT_CONTEXT.md.

**Parameters:**
- `sessionNotes` (string, optional): Notes from this session
- `keyLearnings` (string, optional): Key learnings or decisions
- `techStackUpdates` (string, optional): Tech stack changes

**Returns:** Confirmation of saved context

---

## 📚 Resources

### `kamiflow://project-context`
Current project state from PROJECT_CONTEXT.md

**Format:** JSON with metadata, content, lastModified

### `kamiflow://roadmap`
Strategic roadmap from ROADMAP.md

**Format:** JSON with sections (Backlog, Active, Completed)

### `kamiflow://tasks/active`
Active S1/S2/S3 task files

**Format:** JSON array of task objects with id, phase, title, status

### `kamiflow://archive`
Completed task history

**Format:** JSON array of archived task objects

---

## 🤝 Integration Examples

### With Cursor

1. Configure MCP in Cursor settings
2. Ask Cursor to "Create a new feature using Kami Flow"
3. Cursor will invoke the Sniper Model tools
4. Review generated S1/S2/S3 files
5. Use `kamiflow_bridge_export` to send to Cursor for implementation

### With Claude Desktop

1. Add to Claude Desktop config
2. Claude automatically discovers available tools
3. Ask Claude to help plan a feature
4. Claude will use diagnostic interview, then generate IDEA/SPEC/BUILD

### With Windsurf

1. Configure MCP in Windsurf settings
2. Use natural language: "Plan this feature with Kami Flow"
3. Windsurf invokes appropriate tools
4. Review artifacts in `.kamiflow/tasks/`

---

## 🔒 The 3-Layer Locks

KamiFlow implements three safety locks to prevent hallucination:

1. **Lock 1 - Context Anchoring:** Always reads PROJECT_CONTEXT.md before planning
2. **Lock 2 - Schema-First:** Defines data models before business logic
3. **Lock 3 - Legacy Awareness:** Searches codebase before making changes

These locks are enforced automatically by all KamiFlow tools.

---

## 🛣️ Roadmap

### Phase 1: Core Sniper Model ✅
- [x] IDEA, SPEC, BUILD tools
- [x] Context resources
- [x] Bridge export

### Phase 2: Operations ✅
- [x] Wake, Sync, Save Context
- [x] Roadmap management

### Phase 3: Automation ✅
- [x] Saiyan mode
- [x] Archive management

### Phase 4: Future Enhancements
- [ ] SuperLazy mode (auto-execution)
- [ ] Plugin system support
- [ ] Advanced validation
- [ ] Multi-project support

---

## 🤝 Contributing

This package is part of the KamiFlow monorepo.

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Development
pnpm run dev
```

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Credits

Built with:
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Zod](https://github.com/colinhacks/zod) for schema validation
- Original Kami Flow system for Gemini CLI

---

## 💬 Support

- GitHub Issues: [anomalyco/opencode](https://github.com/anomalyco/opencode)
- Documentation: See Kami Flow docs in `/resources/docs`

---

**Made with ❤️ for Indie Builders**

*"Aesthetics + Utility. Ship fast, break nothing important."*
