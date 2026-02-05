# KamiFlow API Documentation

Complete reference for all KamiFlow commands, configuration options, and programmatic APIs.

---

## Table of Contents
- [CLI Commands](#cli-commands)
- [Gemini CLI Slash Commands](#gemini-cli-slash-commands)
- [Configuration API](#configuration-api)
- [Programmatic API](#programmatic-api)

---

## CLI Commands

### `kamiflow init [path]`

Initialize KamiFlow in a project directory.

**Aliases:** `init`

**Options:**
- `-m, --mode <mode>` - Integration mode: `link`, `submodule`, or `standalone` (default: `link`)
- `-d, --dev` - Enable contributor mode with symbolic links
- `--skip-interview` - Skip interactive questions and use defaults

**Examples:**
```bash
# Initialize in current directory
kamiflow init

# Initialize in specific directory
kamiflow init ./my-project

# Use standalone mode (no symlinks)
kamiflow init -m standalone

# Skip interactive questions
kamiflow init --skip-interview
```

---

### `kamiflow doctor`

Check system health and KamiFlow configuration.

**Aliases:** `doctor`

**Options:**
- `--fix` - Attempt to automatically fix detected issues
- `--auto-fix` - Bypass confirmation prompts during healing

**Checks:**
- Node.js version (>= 16)
- Gemini CLI installation
- Git availability
- Project structure integrity
- Configuration validity

**Examples:**
```bash
# Run health check
kamiflow doctor

# Auto-fix issues
kamiflow doctor --fix --auto-fix
```

---

### `kamiflow update`

Update KamiFlow to the latest version.

**Aliases:** `upgrade`

**Options:**
- `-f, --force` - Force overwrite existing files (Standalone mode)

**Examples:**
```bash
# Standard update
kamiflow update

# Force update (standalone mode)
kamiflow update --force
```

---

### `kamiflow config`

Manage project configuration.

**Aliases:** `config`

#### Subcommands

**`config set <key> <value>`**
Set a configuration value.

Options:
- `-g, --global` - Set globally for current user

Examples:
```bash
# Set local (project) config
kamiflow config set language vietnamese

# Set global (user) config
kamiflow config set --global strategy FAST
```

**`config get <key>`**
Get a configuration value.

Examples:
```bash
kamiflow config get language
kamiflow config get plugins.seed.minFeasibility
```

**`config list`**
List all configuration values with their sources.

**`config sync`**
Synchronize local configuration with latest schema.

---

### `kamiflow validate-flow`

Validate TOML configuration files.

**Aliases:** `validate`

**Options:**
- `-p, --path <path>` - Path to directory or file to validate (default: `.gemini/commands/kamiflow`)

**Examples:**
```bash
# Validate all commands
kamiflow validate

# Validate specific directory
kamiflow validate -p .gemini/commands/kamiflow/core
```

---

### `kamiflow sync`

Synchronize command documentation.

**Aliases:** `sync`

---

### `kamiflow archive [id]`

Archive completed tasks.

**Aliases:** `archive`

**Options:**
- `-f, --force` - Skip confirmation prompt
- `-a, --all` - Archive all completed tasks

**Examples:**
```bash
# Archive specific task
kamiflow archive 042

# Archive all completed tasks
kamiflow archive --all

# Force archive without confirmation
kamiflow archive 042 --force
```

---

### `kamiflow info`

Display KamiFlow core location and version.

**Aliases:** `info`

---

## Gemini CLI Slash Commands

These commands are used within Gemini CLI chat interface.

### Core Flow (Sniper Model)

#### `/kamiflow:core:idea`
Generate refined idea through diagnostic interview.

**Process:**
1. Diagnostic questions (3-5 probing questions)
2. Synthesis into 3 options (A/B/C)
3. Star rating system (4 criteria)
4. User selection or auto-selection

**Output:** `XXX-S1-IDEA-[slug].md`

**Configuration:**
- Respects `gatedAutomation` setting
- Uses `cached_max_id` for ID generation

---

#### `/kamiflow:core:spec`
Create detailed specification with Schema-First approach.

**Locks:**
- **Lock 1:** Context Anchoring (reads `PROJECT_CONTEXT.md`)
- **Lock 2:** Schema-First (defines data models before logic)

**Output:** `XXX-S2-SPEC-[slug].md`

**Configuration:**
- Respects `executionMode` (Planner vs Implementer)

---

#### `/kamiflow:core:build`
Generate implementation task list with Legacy Awareness.

**Locks:**
- **Lock 3:** Legacy Awareness (scans existing codebase)

**Output:** `XXX-S3-BUILD-[slug].md`

**Features:**
- Atomic task breakdown
- Exact anchor points (function names, line numbers)
- TDD strategy for high-risk logic

---

#### `/kamiflow:core:bridge`
Generate context package prompt for external IDEs (Windsurf/Cursor).

**Output:** `XXX-S4-HANDOFF-[slug].md`

---

### Automation Commands

#### `/kamiflow:dev:lazy`
Auto-generate S1-S4 artifacts using Sniper Model.

**Process:**
1. Run `/kamiflow:core:idea` (with diagnostic gate)
2. Wait for user to select option
3. Auto-generate S2 (SPEC)
4. Auto-generate S3 (BUILD)
5. Auto-generate S4 (HANDOFF)

**Output:** All 4 artifacts in `.kamiflow/tasks/`

---

#### `/kamiflow:dev:superlazy`
Auto-generate S1-S4 artifacts AND execute immediately.

**Difference from lazy:**
- Executes S4 (HANDOFF) instructions automatically
- Includes strategic reflection before execution
- Best for trusted, well-defined tasks

---

#### `/kamiflow:dev:saiyan`
Ultimate automation - Auto-select Option B + Auto-execution.

**Process:**
1. Generate diagnostic insights
2. **Automatically** select Option B (Balanced)
3. Generate S2/S3/S4
4. Execute immediately

**Warning:** No confirmation prompts. Use for trusted workflows only.

---

#### `/kamiflow:dev:supersaiyan`
Meta-automation - Manage cycles of Saiyan execution.

**Use case:** Execute multiple related tasks in sequence.

---

#### `/kamiflow:dev:release`
Smart Release Manager - Analyze git history and automate version bumping.

---

#### `/kamiflow:dev:archive`
Archive completed task artifacts to `.kamiflow/archive/`.

---

#### `/kamiflow:dev:revise`
Emergency Brake - Clarify context, resolve hallucinations.

**Use when:**
- AI is hallucinating non-existent code
- Context seems lost
- Logic doesn't align with requirements

---

### Operations Commands

#### `/kamiflow:ops:wake`
Reload project context to eliminate session amnesia.

**Actions:**
- Reads `PROJECT_CONTEXT.md`
- Loads `ROADMAP.md`
- Restores `cached_max_id` from global state
- Re-establishes project memory

**Usage:** Run at start of every session.

---

#### `/kamiflow:ops:help`
Interactive help system for commands and Sniper Model phases.

---

#### `/kamiflow:ops:save-context`
Sync current state to `PROJECT_CONTEXT.md` (manual memory save).

---

#### `/kamiflow:ops:bootstrap`
Bootstrap KamiFlow in a project - creates local `.gemini/` configuration.

---

#### `/kamiflow:ops:doc-audit`
Scan and heal documentation rot (broken links, drift).

---

### Plugin Commands

#### Agent Management

**`/kamiflow:p-agents:add`**
Safely audit and add a skill to project agents.

**`/kamiflow:p-agents:scan`**
Discover active AI agents in the project.

---

#### Market Engine

**`/kamiflow:p-market:research`**
Analyze project context and suggest 3-5 high-value feature requests.

**`/kamiflow:p-market:inspire`**
Out-of-the-box innovation brainstorming for current stack.

---

#### Seed Hub (Idea Sandbox)

**`/kamiflow:p-seed:draft`**
Seed an idea with interactive terminal interview.

**Output:** `.kamiflow/ideas/backlog/[ID]-[slug].md`

**`/kamiflow:p-seed:analyze`**
Deeply analyze an idea with strategic breakdown.

**Features:**
- Multi-dimensional scoring (7 criteria)
- SWOT analysis
- Risk assessment
- Prepends analysis to idea file

**`/kamiflow:p-seed:promote`**
Harvest an idea by moving it from sandbox to active backlog.

**Quality Gate:** Checks `minFeasibility` threshold from config.

---

#### Swarm Engine

**`/kamiflow:p-swarm:run`**
Dispatch multiple intents to parallel sub-agents.

**Features:**
- Concurrency locks per folder
- Prevents race conditions
- Parallel execution

**`/kamiflow:p-swarm:status`**
Check active locks and swarm health.

---

## Configuration API

### Schema

```javascript
{
  // UI Language
  "language": "english" | "vietnamese",
  
  // Execution Strategy
  "strategy": "FAST" | "BALANCED" | "AMBITIOUS",
  
  // Retry Limits
  "maxRetries": 0-10,      // Default: 3
  "maxBackups": 1-20,      // Default: 5
  
  // Automation Control
  "gatedAutomation": boolean,  // Default: true
  "executionMode": "Planner" | "Implementer",  // Default: "Implementer"
  
  // Environment
  "currentEnv": "development" | "production",
  
  // Environment-specific paths
  "environments": {
    "development": {
      "workspaceRoot": "./.kamiflow",
      "outputTargets": ["."]
    },
    "production": {
      "workspaceRoot": "./.kamiflow",
      "outputTargets": ["dist"]
    }
  },
  
  // Plugin Configuration
  "plugins": {
    "seed": {
      "minFeasibility": 0.0-1.0  // Default: 0.7
    }
  }
}
```

### Accessing Configuration

**Via CLI:**
```bash
kamiflow config get language
kamiflow config set strategy FAST
kamiflow config list
```

**Programmatically:**
```javascript
const { ConfigManager } = require('./logic/config-manager');

const config = new ConfigManager();
const value = await config.get('language');
await config.set('strategy', 'BALANCED');
```

---

## Programmatic API

### ConfigManager

```javascript
const { ConfigManager } = require('kamiflow/cli-core/logic/config-manager');

class ConfigManager {
  constructor(projectPath = process.cwd())
  
  async loadAll()                    // Load merged config
  async get(key)                     // Get config value
  async set(key, value, isGlobal)    // Set config value
  async list()                       // List all with sources
  async syncLocalConfig()            // Sync with schema
  async getGlobalState(key)          // Get global state
  async setGlobalState(key, value)   // Set global state
}
```

**Example:**
```javascript
const config = new ConfigManager('/path/to/project');
const lang = await config.get('language');
await config.set('maxRetries', 5, false);
```

---

### Transpiler

```javascript
const { Transpiler } = require('kamiflow/cli-core/logic/transpiler');

class Transpiler {
  constructor(cwd = process.cwd())
  
  async loadPartial(name)                 // Load blueprint partial
  async processParallel(blueprints, batchSize)  // Parallel processing
  async runFromRegistry(registryPath)     // Transpile from registry
}
```

**Example:**
```javascript
const transpiler = new Transpiler();
await transpiler.runFromRegistry('resources/blueprints/registry.md');
```

---

### EnvironmentManager

```javascript
const { EnvironmentManager } = require('kamiflow/cli-core/logic/env-manager');

class EnvironmentManager {
  constructor(projectRoot = process.cwd())
  
  async getEnv()                    // Get current environment
  async getEnvConfig()              // Get environment config
  async getWorkspacePrefix()        // Get workspace prefix
  async getAbsoluteWorkspacePath()  // Get absolute workspace path
  async getOutputTargets()          // Get output target paths
}
```

---

### Utilities

#### Logger
```javascript
const logger = require('kamiflow/cli-core/utils/logger');

logger.header('Title');
logger.info('Information');
logger.success('Success message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message');
logger.hint('Hint text');

const reporter = logger.createReporter('Task Summary');
reporter.push('Task 1', 'SUCCESS', 'Details');
reporter.print();
```

#### Input Sanitization
```javascript
const { sanitizePath, sanitizeShellArg, sanitizeJson } = require('kamiflow/cli-core/utils/sanitize');

const safe = sanitizePath(userInput);
const safeArg = sanitizeShellArg(argument);
const data = sanitizeJson(jsonString);
```

#### Safe Command Execution
```javascript
const { safeExec, commandExists, getCommandVersion } = require('kamiflow/cli-core/utils/safe-exec');

const result = await safeExec('git', ['status']);
const exists = await commandExists('node');
const version = await getCommandVersion('npm');
```

#### i18n
```javascript
const { initI18n, t } = require('kamiflow/cli-core/utils/i18n');

await initI18n();
const message = t('cli.success.complete', { action: 'Build' });
```

---

## Environment Variables

- `KAMI_ENV` - Override environment (`development` | `production`)
- `KAMI_LANG` - Override language (`en` | `vi`)
- `KAMI_DEBUG` - Enable debug logging (`true` | `false`)
- `NODE_ENV` - Fallback for `KAMI_ENV`

**Example:**
```bash
KAMI_ENV=production npm run build
KAMI_DEBUG=true kamiflow doctor
KAMI_LANG=vi kamiflow init
```

---

## Exit Codes

- `0` - Success
- `1` - General error
- Exit on specific errors (validation failure, missing dependencies, etc.)

---

## Further Reading

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [JSDOC_STANDARDS.md](./JSDOC_STANDARDS.md) - Documentation standards
- [ADR Documentation](./adr/) - Architecture decisions
- [README.md](../README.md) - Project overview

---

**Version:** 2.35.0  
**Last Updated:** 2024-01-31

