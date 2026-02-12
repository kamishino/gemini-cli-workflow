const fs = require("fs-extra");
const path = require("upath");
const logger = require("../utils/logger");

/**
 * LayeredResolver - Implements Local > Global > Defaults hierarchy
 * for commands, rules, and skills.
 *
 * Layer Priority:
 * 1. LOCAL   → .kamiflow/agents/.gemini/  (project-specific overrides)
 * 2. GLOBAL  → dist/.gemini/              (installed KamiFlow)
 * 3. DEFAULT → resources/blueprints/      (source blueprints)
 */
class LayeredResolver {
  constructor(projectRoot, cliRoot = null) {
    this.projectRoot = projectRoot;
    this.cliRoot = cliRoot || path.resolve(__dirname, "../../");

    // Layer paths
    this.layers = {
      local: path.join(projectRoot, ".kamiflow/agents/.gemini"),
      global: path.join(this.cliRoot, "dist/.gemini"),
      default: path.join(this.cliRoot, "resources/blueprints"),
    };
  }

  /**
   * Check if a local override exists for a given relative path
   * @param {string} relativePath - Path relative to .gemini/ (e.g., "commands/kamiflow/core/idea.toml")
   * @returns {Promise<string|null>} Full path to local override or null
   */
  async getLocalOverride(relativePath) {
    const localPath = path.join(this.layers.local, relativePath);
    if (await fs.pathExists(localPath)) {
      return localPath;
    }
    return null;
  }

  /**
   * Resolve a file path using layer priority
   * @param {string} relativePath - Path relative to .gemini/
   * @returns {Promise<{path: string, source: string}|null>}
   */
  async resolve(relativePath) {
    // 1. Check LOCAL first
    const localPath = path.join(this.layers.local, relativePath);
    if (await fs.pathExists(localPath)) {
      return { path: localPath, source: "local" };
    }

    // 2. Check GLOBAL
    const globalPath = path.join(this.layers.global, relativePath);
    if (await fs.pathExists(globalPath)) {
      return { path: globalPath, source: "global" };
    }

    return null;
  }

  /**
   * Resolve multiple files in a directory, applying layer priority per-file
   * @param {string} relativeDir - Directory relative to .gemini/ (e.g., "commands/kamiflow/core")
   * @param {string} extension - File extension filter (e.g., ".toml")
   * @returns {Promise<Array<{relativePath: string, absolutePath: string, source: string}>>}
   */
  async resolveDirectory(relativeDir, extension = null) {
    const results = new Map(); // relativePath -> {absolutePath, source}

    // Scan GLOBAL first (lower priority)
    const globalDir = path.join(this.layers.global, relativeDir);
    if (await fs.pathExists(globalDir)) {
      const files = await this.walkDir(globalDir, extension);
      for (const file of files) {
        const relativePath = path.join(relativeDir, file);
        results.set(relativePath, {
          absolutePath: path.join(globalDir, file),
          source: "global",
        });
      }
    }

    // Scan LOCAL (higher priority - overwrites global)
    const localDir = path.join(this.layers.local, relativeDir);
    if (await fs.pathExists(localDir)) {
      const files = await this.walkDir(localDir, extension);
      for (const file of files) {
        const relativePath = path.join(relativeDir, file);
        results.set(relativePath, {
          absolutePath: path.join(localDir, file),
          source: "local",
        });
      }
    }

    return Array.from(results.entries()).map(([relativePath, data]) => ({
      relativePath,
      ...data,
    }));
  }

  /**
   * Walk a directory recursively and return relative file paths
   */
  async walkDir(dir, extension = null) {
    const results = [];

    const walk = async (currentDir, prefix = "") => {
      const items = await fs.readdir(currentDir);
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relativePath = prefix ? path.join(prefix, item) : item;
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          await walk(fullPath, relativePath);
        } else if (!extension || item.endsWith(extension)) {
          results.push(relativePath);
        }
      }
    };

    await walk(dir);
    return results;
  }

  /**
   * Sync files from layers to final .gemini/ output
   * @param {string} category - "commands", "rules", or "skills"
   * @returns {Promise<{synced: number, overrides: number}>}
   */
  async syncCategory(category) {
    const outputDir = path.join(this.projectRoot, ".gemini", category);
    const stats = { synced: 0, overrides: 0 };

    const files = await this.resolveDirectory(category);

    for (const file of files) {
      const destPath = path.join(
        this.projectRoot,
        ".gemini",
        file.relativePath,
      );
      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(file.absolutePath, destPath);

      stats.synced++;
      if (file.source === "local") {
        stats.overrides++;
        logger.hint(`Override: ${file.relativePath} (from local)`);
      }
    }

    return stats;
  }

  /**
   * Initialize the local override structure
   */
  async initLocalStructure() {
    const dirs = [
      path.join(this.layers.local, "commands"),
      path.join(this.layers.local, "rules"),
      path.join(this.layers.local, "skills"),
    ];

    for (const dir of dirs) {
      await fs.ensureDir(dir);
      const gitkeep = path.join(dir, ".gitkeep");
      if (!(await fs.pathExists(gitkeep))) {
        await fs.writeFile(gitkeep, "");
      }
    }

    // Create README for local overrides
    const readmePath = path.join(this.layers.local, "README.md");
    if (!(await fs.pathExists(readmePath))) {
      const readme = `# Local Agent Overrides

This folder contains project-specific overrides for AI agent configurations.

## Structure

\`\`\`
.kamiflow/agents/
├── .gemini/           # Overrides for Gemini CLI
│   ├── commands/      # Custom command definitions
│   ├── rules/         # Custom behavioral rules
│   └── skills/        # Custom skills
├── .claude/           # Future: Claude overrides
└── .codex/            # Future: Codex overrides
\`\`\`

## How It Works

Files placed here override the global KamiFlow defaults:

1. **LOCAL** (.kamiflow/agents/.gemini/) → Highest priority
2. **GLOBAL** (installed KamiFlow) → Default
3. **DEFAULT** (built-in) → Fallback

## Usage

To override a command:

\`\`\`bash
# Copy the original
cp .gemini/commands/kamiflow/core/idea.toml .kamiflow/agents/.gemini/commands/kamiflow/core/

# Edit your local version
# Then sync to apply
kami sync
\`\`\`

## Note

This folder is gitignored by default. To track your overrides in version control,
remove \`.kamiflow/agents/\` from your \`.gitignore\`.
`;
      await fs.writeFile(readmePath, readme);
    }

    logger.hint(
      "Created local override structure at .kamiflow/agents/.gemini/",
    );
  }

  /**
   * Check for override conflicts (for kami doctor)
   * @returns {Promise<Array<{file: string, localMtime: Date, globalMtime: Date}>>}
   */
  async checkOverrideHealth() {
    const issues = [];
    const categories = ["commands", "rules", "skills"];

    for (const category of categories) {
      const localDir = path.join(this.layers.local, category);
      if (!(await fs.pathExists(localDir))) continue;

      const localFiles = await this.walkDir(localDir);
      for (const file of localFiles) {
        if (file === ".gitkeep") continue;

        const localPath = path.join(localDir, file);
        const globalPath = path.join(this.layers.global, category, file);

        if (await fs.pathExists(globalPath)) {
          const localStat = await fs.stat(localPath);
          const globalStat = await fs.stat(globalPath);

          // Warn if global is newer than local (upstream updated)
          if (globalStat.mtime > localStat.mtime) {
            issues.push({
              file: path.join(category, file),
              localMtime: localStat.mtime,
              globalMtime: globalStat.mtime,
              message: "Global version is newer than local override",
            });
          }
        }
      }
    }

    return issues;
  }
}

module.exports = { LayeredResolver };
