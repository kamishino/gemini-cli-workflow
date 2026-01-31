const path = require("upath");
const { ConfigManager } = require("./config-manager");

class EnvironmentManager {
  constructor(projectRoot = process.cwd()) {
    // Force absolute path (upath handles normalization)
    const absoluteRoot = path.resolve(projectRoot);

    // If called from inside cli-core, the project root is one level up
    if (absoluteRoot.endsWith("cli-core") || absoluteRoot.endsWith("cli-core" + path.sep)) {
      this.projectRoot = path.dirname(absoluteRoot);
    } else {
      this.projectRoot = absoluteRoot;
    }
    this.configManager = new ConfigManager(this.projectRoot);
  }

  /**
   * Get the current active environment
   * Priority: KAMI_ENV > NODE_ENV > config.currentEnv > 'development'
   */
  async getEnv() {
    const envVar = process.env.KAMI_ENV || process.env.NODE_ENV;
    if (envVar === "prod" || envVar === "production") return "production";
    if (envVar === "dev" || envVar === "development") return "development";

    const configEnv = await this.configManager.get("currentEnv");
    return configEnv || "development";
  }

  /**
   * Get the configuration object for the current environment
   */
  async getEnvConfig() {
    const env = await this.getEnv();
    const environments = await this.configManager.get("environments");
    return environments[env] || environments["development"];
  }

  /**
   * Get the workspace prefix for template injection
   * Enforces Canonical format: "./.../"
   */
  async getWorkspacePrefix() {
    const config = await this.getEnvConfig();
    let prefix = config.workspaceRoot;

    // Ensure it starts with "./" for absolute project root anchoring
    if (!prefix.startsWith("./")) {
      if (prefix.startsWith("/")) {
        prefix = "." + prefix;
      } else {
        prefix = "./" + prefix;
      }
    }

    // Ensure it ends with a slash
    if (!prefix.endsWith("/")) {
      prefix += "/";
    }
    return prefix;
  }

  /**
   * Get the absolute path to the workspace directory
   */
  async getAbsoluteWorkspacePath() {
    const config = await this.getEnvConfig();
    return path.resolve(this.projectRoot, config.workspaceRoot);
  }

  /**
   * Get absolute paths where artifacts should be saved
   */
  async getOutputTargets() {
    const config = await this.getEnvConfig();
    return config.outputTargets.map((target) => path.resolve(this.projectRoot, target));
  }
}

module.exports = { EnvironmentManager };
