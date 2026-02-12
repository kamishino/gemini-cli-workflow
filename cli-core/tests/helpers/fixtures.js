/**
 * Test Fixtures and Mock Data Generators
 */

const path = require("upath");
const os = require("os");

/**
 * Generate mock configuration data
 */
function mockConfig(overrides = {}) {
  return {
    language: "english",
    strategy: "BALANCED",
    maxRetries: 3,
    maxBackups: 5,
    gatedAutomation: true,
    executionMode: "Implementer",
    currentEnv: "development",
    environments: {
      development: {
        workspaceRoot: "./.kamiflow",
        outputTargets: ["."],
      },
      production: {
        workspaceRoot: "./.kamiflow",
        outputTargets: ["dist"],
      },
    },
    plugins: {
      seed: {
        minFeasibility: 0.7,
      },
    },
    ...overrides,
  };
}

/**
 * Generate mock project paths
 */
function mockProjectPaths(projectRoot = "/test/project") {
  return {
    projectRoot,
    defaultConfig: path.join(__dirname, "../../default-config.json"),
    globalConfig: path.join(os.homedir(), ".kami-flow", ".kamirc.json"),
    localConfig: path.join(projectRoot, ".kamirc.json"),
    workspaceRoot: path.join(projectRoot, ".kamiflow"),
    geminiDir: path.join(projectRoot, ".gemini"),
    commandsDir: path.join(projectRoot, ".gemini/commands/kamiflow"),
  };
}

/**
 * Generate mock blueprint data
 */
function mockBlueprint(overrides = {}) {
  return {
    name: "test-command",
    type: "command",
    description: "Test command description",
    group: "core",
    order: 10,
    content: "# Test Blueprint\n\nThis is test content.",
    ...overrides,
  };
}

/**
 * Generate mock registry data
 */
function mockRegistry() {
  return `# Agent Registry

## Core Flow
### Test Command
- **Target:** .gemini/commands/kamiflow/core/test.toml
- **Shell:** gemini-shell.md
- **Partials:**
  - resources/blueprints/commands/context-sync.md
  - resources/blueprints/commands/core/test-logic.md
`;
}

/**
 * Generate mock TOML content
 */
function mockToml(options = {}) {
  const { description = "Test command", group = "core", order = 10 } = options;
  return `description = "${description}"
group = "${group}"
order = ${order}
prompt = '''
# Test Command Prompt
This is a test prompt.
'''
`;
}

/**
 * Generate mock environment variables
 */
function mockEnvVars(overrides = {}) {
  return {
    KAMI_ENV: "test",
    NODE_ENV: "test",
    KAMI_DEBUG: "false",
    ...overrides,
  };
}

/**
 * Create temporary test directory structure
 */
function createTestStructure() {
  return {
    ".kamiflow": {
      "PROJECT_CONTEXT.md": "# Test Context",
      "ROADMAP.md": "# Test Roadmap",
      tasks: {},
      archive: {},
      ideas: {},
    },
    ".gemini": {
      commands: {
        kamiflow: {
          core: {},
          dev: {},
          ops: {},
        },
      },
      rules: {},
      skills: {},
    },
    resources: {
      blueprints: {
        commands: {},
        rules: {},
      },
      templates: {},
    },
  };
}

module.exports = {
  mockConfig,
  mockProjectPaths,
  mockBlueprint,
  mockRegistry,
  mockToml,
  mockEnvVars,
  createTestStructure,
};
