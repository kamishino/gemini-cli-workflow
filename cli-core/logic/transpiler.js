const fs = require("fs-extra");
const path = require("upath");
const logger = require("../utils/logger");
const { backupFile, safeWrite } = require("../utils/fs-vault");
const { validateTomlFile } = require("../validators/toml-validator");
const { EnvironmentManager } = require("./env-manager");
const { BlueprintCache } = require("../utils/blueprint-cache");

class Transpiler {
  constructor(cwd = process.cwd()) {
    this.envManager = new EnvironmentManager(cwd);
    this.projectRoot = this.envManager.projectRoot;

    this.blueprintDir = path.join(this.projectRoot, "resources/blueprints");
    this.templatesDir = path.join(this.projectRoot, "resources/templates");
    this.rulesDir = path.join(this.blueprintDir, "rules");

    this.targets = [];
    this.workspacePrefix = "./";
    this.isInitialized = false;

    // Initialize blueprint cache for performance
    this.cache = new BlueprintCache({ maxAge: 5 * 60 * 1000, maxSize: 50 });
  }

  /**
   * Initialize environment configuration
   */
  async init() {
    if (this.isInitialized) return;
    this.targets = await this.envManager.getOutputTargets();
    this.workspacePrefix = await this.envManager.getWorkspacePrefix();
    this.isInitialized = true;
  }

  /**
   * Sanitize content by fixing invalid path patterns
   */
  sanitizeContent(content) {
    if (!content) return content;

    // Fix "/./.kamiflow/" -> "./.kamiflow/"
    let sanitized = content.replace(/\/(\.\/\.kamiflow\/)/g, "$1");

    // Fix doubled-up rules path (e.g. .gemini/rules/.gemini/rules/ -> .gemini/rules/)
    // This happens when documentation strings containing anchored paths are interpreted as imports
    sanitized = sanitized.replace(/(\.gemini\/rules\/){2,}/g, ".gemini/rules/");

    // Fix double slashes (excluding protocol double slashes)
    sanitized = sanitized.replace(/([^:])\/{2,}/g, "$1/");

    return sanitized;
  }

  /**
   * Load a partial file by name (with caching)
   */
  async loadPartial(name) {
    await this.init();

    const findFile = (dir, fileName) => {
      if (!fs.existsSync(dir)) return null;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          const found = findFile(fullPath, fileName);
          if (found) return found;
        } else if (item === fileName) {
          return fullPath;
        }
      }
      return null;
    };

    const filePath = findFile(this.blueprintDir, `${name}.md`);
    if (!filePath) {
      throw new Error(`Partial not found: ${name}`);
    }

    // Check cache first
    const cached = await this.cache.get(filePath);
    if (cached) {
      logger.debug(`Cache hit: ${name}.md`);
      return cached;
    }

    logger.debug(`Cache miss: ${name}.md`);
    let content = await fs.readFile(filePath, "utf8");

    content = content.replace(/{{KAMI_WORKSPACE}}/g, this.workspacePrefix);
    content = content.replace(/{{KAMI_RULES_GEMINI}}/g, "./.gemini/rules/");
    content = this.sanitizeContent(content);

    const metadata = {};
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (fmMatch) {
      const fm = fmMatch[1];
      const lines = fm.split("\n");
      lines.forEach((l) => {
        const [k, ...v] = l.split(":");
        if (k && v.length > 0) metadata[k.trim()] = v.join(":").trim();
      });
    }

    if (name !== "context-sync") {
      const required = ["name", "type", "description", "group", "order"];
      const missing = required.filter((f) => !metadata[f]);
      if (missing.length > 0) {
        throw new Error(
          `CRITICAL: Metadata missing in ${path.relative(this.projectRoot, filePath)}: ${missing.join(", ")}`,
        );
      }
    }

    const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
    const result = { body, metadata };

    // Cache the processed result
    await this.cache.set(filePath, result);

    return result;
  }

  /**
   * Process blueprints in parallel batches for improved performance
   * @param {Array} blueprints - Array of blueprint definitions
   * @param {number} batchSize - Number of concurrent operations (default: 5)
   * @returns {Promise<Array>} Results array
   */
  async processParallel(blueprints, batchSize = 5) {
    const results = [];
    const chunks = [];

    // Split into batches
    for (let i = 0; i < blueprints.length; i += batchSize) {
      chunks.push(blueprints.slice(i, i + batchSize));
    }

    // Process each batch in parallel
    for (const chunk of chunks) {
      const batchResults = await Promise.all(
        chunk.map(async (blueprint) => {
          try {
            await this.processBlueprint(blueprint);
            return { blueprint: blueprint.name, success: true };
          } catch (error) {
            logger.error(
              `Failed to process ${blueprint.name}: ${error.message}`,
            );
            return {
              blueprint: blueprint.name,
              success: false,
              error: error.message,
            };
          }
        }),
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Assemble a template with its required partials and metadata
   */
  async assemble(templateName, partialNames) {
    const templatePath = path.join(this.templatesDir, templateName);
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    let result = await fs.readFile(templatePath, "utf8");
    let firstMetadata = {};

    for (const partialName of partialNames) {
      const { body, metadata } = await this.loadPartial(partialName);

      if (
        partialName !== "context-sync" &&
        Object.keys(firstMetadata).length === 0
      ) {
        firstMetadata = metadata;
      }

      const upperName = partialName.toUpperCase();
      const ph = upperName.replace(/-/g, "_");
      const regex = new RegExp(`{{${ph}}}`, "g");
      result = result.replace(regex, body);

      if (partialName.includes("-logic")) {
        result = result.replace(/{{LOGIC}}/g, body);
      }
    }

    result = result.replace(
      /{{DESCRIPTION}}/g,
      firstMetadata.description || "",
    );
    result = result.replace(/{{GROUP}}/g, firstMetadata.group || "");
    result = result.replace(/{{ORDER}}/g, firstMetadata.order || "10");

    return result;
  }

  /**
   * Run the transpilation based on a registry
   */
  async runFromRegistry(registryPath) {
    await this.init();
    const env = await this.envManager.getEnv();

    logger.header(`Starting Universal Transpilation`);
    logger.info(`Mode: ${env} | Workspace: ${this.workspacePrefix}`);

    if (!(await fs.pathExists(registryPath))) {
      logger.warn(`No registry found at ${registryPath}. Skipping.`);
      return;
    }

    const registryContent = await fs.readFile(registryPath, "utf8");
    const targets = this.parseRegistry(registryContent);
    const reporter = logger.createReporter("Command Transpilation");

    const buildTarget = async (target) => {
      try {
        const assembledContent = await this.assemble(
          target.shell,
          target.partials,
        );

        for (const outputRoot of this.targets) {
          const absoluteTargetPath = path.resolve(
            outputRoot,
            target.targetPath,
          );
          const displayPath = path.relative(
            this.projectRoot,
            absoluteTargetPath,
          );

          await backupFile(absoluteTargetPath);
          const success = await safeWrite(absoluteTargetPath, assembledContent);

          if (success && absoluteTargetPath.endsWith(".toml")) {
            const validation = validateTomlFile(absoluteTargetPath);
            if (!validation.valid) {
              reporter.push(
                target.name,
                "ERROR",
                `TOML Invalid: ${displayPath}`,
              );
            } else {
              reporter.push(target.name, "SUCCESS", displayPath);
            }
          }
        }
      } catch (error) {
        reporter.push(target.name, "ERROR", error.message);
      }
    };

    // Parallel build
    await Promise.all(targets.map((t) => buildTarget(t)));
    reporter.print();

    await this.transpileRules();
    await this.syncDocumentation();
    await this.syncSkills();
    await this.assembleProjectTemplate();

    logger.success("Build sequence complete.");
  }

  /**
   * Sync skills from resources/skills/ to .gemini/skills/
   */
  async syncSkills() {
    await this.init();
    const sourceSkills = path.join(
      this.projectRoot,
      "resources/blueprints/skills",
    );

    if (!(await fs.pathExists(sourceSkills))) {
      logger.debug("No skills directory found at resources/skills/. Skipping.");
      return;
    }

    logger.info("Syncing Skills...");
    const reporter = logger.createReporter("Skill Sync");

    const entries = await fs.readdir(sourceSkills, { withFileTypes: true });
    const skillDirs = entries.filter((e) => e.isDirectory());

    for (const dir of skillDirs) {
      const skillName = dir.name;
      const sourcePath = path.join(sourceSkills, skillName);
      const skillMdPath = path.join(sourcePath, "SKILL.md");

      if (!(await fs.pathExists(skillMdPath))) {
        reporter.push(skillName, "SKIPPED", "No SKILL.md");
        continue;
      }

      for (const outputRoot of this.targets) {
        const targetPath = path.join(outputRoot, ".gemini/skills", skillName);
        await fs.copy(sourcePath, targetPath, { overwrite: true });
        reporter.push(
          skillName,
          "SUCCESS",
          path.relative(this.projectRoot, targetPath),
        );
      }
    }

    reporter.print();
  }

  /**
   * Synchronize documentation
   * Controlled by transpile.includeDocs in .kamirc.json (default: false for clients)
   */
  async syncDocumentation() {
    await this.init();

    // Check if docs sync is enabled in config
    const configPath = path.join(this.projectRoot, ".kamirc.json");
    let includeDocs = false; // Default: skip docs for client projects
    if (await fs.pathExists(configPath)) {
      try {
        const config = await fs.readJson(configPath);
        includeDocs = config.transpile?.includeDocs ?? false;
      } catch (e) {
        // If config is invalid, default to false
      }
    }

    if (!includeDocs) {
      logger.debug(
        "Skipping documentation sync (transpile.includeDocs is false)",
      );
      return;
    }

    const env = await this.envManager.getEnv();
    const isProd = env === "production";
    const sourceDocs = path.join(this.projectRoot, "resources/docs");

    if (!(await fs.pathExists(sourceDocs))) return;

    logger.info(`Syncing Dynamic Documentation (${env})...`);
    const reporter = logger.createReporter("Documentation Sync");

    const walkAndSync = async (dir, relativePath = "") => {
      const items = await fs.readdir(dir);
      const tasks = items.map(async (item) => {
        const fullPath = path.join(dir, item);
        const relItemPath = path.join(relativePath, item);

        if ((await fs.stat(fullPath)).isDirectory()) {
          await walkAndSync(fullPath, relItemPath);
        } else if (item.endsWith(".md")) {
          let content = await fs.readFile(fullPath, "utf8");

          content = content.replace(/{{WORKSPACE}}/g, this.workspacePrefix);

          const blueprintPath = isProd
            ? "None (Pre-transpiled)"
            : "./resources/blueprints/";
          const blueprintDesc = isProd ? "N/A" : "SSOT Logic & Templates";
          content = content.replace(/{{BLUEPRINT_PATH}}/g, blueprintPath);
          content = content.replace(/{{BLUEPRINT_DESC}}/g, blueprintDesc);

          if (isProd) {
            content = content.replace(
              /\s*<!-- DEV_ONLY_START -->[\s\S]*?<!-- DEV_ONLY_END -->\s*/g,
              "\n",
            );
          }

          content = this.sanitizeContent(content);

          for (const outputRoot of this.targets) {
            const targetPath = path.join(
              outputRoot,
              ".kamiflow/docs",
              relItemPath,
            );
            const success = await safeWrite(targetPath, content);
            if (success) reporter.push(relItemPath, "SUCCESS");
            else reporter.push(relItemPath, "ERROR");
          }
        }
      });
      await Promise.all(tasks);
    };

    await walkAndSync(sourceDocs);
    reporter.print();
  }

  /**
   * Assemble project template
   */
  async assembleProjectTemplate() {
    const env = await this.envManager.getEnv();
    if (env !== "production") return;

    logger.info("Assembling Project Template for Distribution...");
    const reporter = logger.createReporter("Template Assembly");

    for (const outputRoot of this.targets) {
      const kamiflowDir = path.join(outputRoot, ".kamiflow");
      const subDirs = [
        "archive",
        "ideas",
        "tasks",
        "handoff_logs",
        "schemas",
        ".backup",
      ];

      const dirTasks = subDirs.map(async (sub) => {
        const fullPath = path.join(kamiflowDir, sub);
        await fs.ensureDir(fullPath);
        await fs.writeFile(path.join(fullPath, ".gitkeep"), "");
      });
      await Promise.all(dirTasks);

      // Copy Schema
      const schemaSrc = path.join(
        this.projectRoot,
        "resources/schemas/kamirc.schema.json",
      );
      const schemaDest = path.join(kamiflowDir, "schemas/kamirc.schema.json");
      if (await fs.pathExists(schemaSrc)) {
        await fs.copy(schemaSrc, schemaDest);
        reporter.push("Config Schema", "SUCCESS");
      }

      const templateMappings = [
        { src: "context.md", dest: ".kamiflow/PROJECT_CONTEXT.md" },
        { src: "roadmap.md", dest: ".kamiflow/ROADMAP.md" },
        { src: "gemini.md", dest: "GEMINI.md" },
        { src: "kamirc.example.json", dest: ".kamirc.example.json" },
      ];

      const templateTasks = templateMappings.map(async (map) => {
        const srcPath = path.join(this.templatesDir, map.src);
        const destPath = path.join(outputRoot, map.dest);
        if (await fs.pathExists(srcPath)) {
          if (map.src === "kamirc.example.json") {
            // Surgical Clean: Remove sensitive environments from example
            const config = await fs.readJson(srcPath);
            delete config.environments;
            await fs.writeJson(destPath, config, { spaces: 2 });
            reporter.push(map.dest, "SUCCESS", "Seeded (Surgical Clean)");
          } else if (map.src.endsWith(".md")) {
            // Process markdown files with placeholder replacement
            let content = await fs.readFile(srcPath, "utf8");
            content = content.replace(
              /{{KAMI_WORKSPACE}}/g,
              this.workspacePrefix,
            );
            content = content.replace(
              /{{KAMI_RULES_GEMINI}}/g,
              "./.gemini/rules/",
            );
            content = this.sanitizeContent(content);
            await fs.outputFile(destPath, content);
            reporter.push(
              map.dest,
              "SUCCESS",
              "Seeded (Placeholders Resolved)",
            );
          } else {
            await fs.copy(srcPath, destPath);
            reporter.push(map.dest, "SUCCESS", "Seeded");
          }
        }
      });
      await Promise.all(templateTasks);

      const gitIgnoreContent = `.kamiflow/archive/
.kamiflow/ideas/
.kamiflow/tasks/
.kamiflow/handoff_logs/
.kamiflow/.backup/
.kamiflow/docs/assets/
.kamiflow/agents/
.kamiflow/.index/
.kamiflow/.sync/
.gemini/tmp/
.gemini/cache/
.backup/
`;
      const geminiIgnoreContent = `!.kamiflow/archive/
!.kamiflow/ideas/
!.kamiflow/tasks/
!.kamiflow/handoff_logs/
!.kamiflow/docs/
!.kamiflow/agents/
`;

      await fs.writeFile(path.join(outputRoot, ".gitignore"), gitIgnoreContent);
      await fs.writeFile(
        path.join(outputRoot, ".geminiignore"),
        geminiIgnoreContent,
      );
      reporter.push("Ignore Files", "SUCCESS", "Generated");
    }
    reporter.print();
  }

  async transpileRules() {
    const env = await this.envManager.getEnv();
    const isProd = env === "production";
    const reporter = logger.createReporter("Rule Transpilation");

    const sources = ["global"];
    if (!isProd) sources.push("local");

    for (const sourceFolder of sources) {
      const sourcePath = path.join(this.rulesDir, sourceFolder);
      if (!(await fs.pathExists(sourcePath))) continue;

      const getFiles = async (dir) => {
        const subdirs = await fs.readdir(dir);
        const files = await Promise.all(
          subdirs.map(async (subdir) => {
            const res = path.resolve(dir, subdir);
            return (await fs.stat(res)).isDirectory() ? getFiles(res) : res;
          }),
        );
        return files.flat();
      };

      const allFiles = await getFiles(sourcePath);
      const rules = allFiles
        .filter((f) => f.endsWith(".md"))
        .map((f) => path.relative(sourcePath, f));

      const ruleTasks = rules.map(async (rule) => {
        let content = await fs.readFile(path.join(sourcePath, rule), "utf8");

        // Inject placeholders
        content = content.replace(/{{KAMI_WORKSPACE}}/g, this.workspacePrefix);
        content = content.replace(/{{KAMI_RULES_GEMINI}}/g, "./.gemini/rules/");
        content = this.sanitizeContent(content);

        for (const outputRoot of this.targets) {
          // Flatten rules in output: .gemini/rules/filename.md
          const targetName = path.basename(rule);
          const targetPath = path.join(outputRoot, ".gemini/rules", targetName);
          const success = await safeWrite(targetPath, content);
          if (success) reporter.push(targetName, "SUCCESS");
          else reporter.push(targetName, "ERROR");
        }
      });
      await Promise.all(ruleTasks);
    }
    reporter.print();
  }

  /**
   * Parse Registry MD into JSON structure
   */
  parseRegistry(content) {
    const targets = [];
    const lines = content.split("\n");
    let currentTarget = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes("**Target:**")) {
        if (currentTarget) targets.push(currentTarget);
        currentTarget = {
          name: "Anonymous Target",
          targetPath: line.split("**Target:**")[1]?.trim(),
          partials: [],
        };
        for (let j = i - 1; j >= 0 && j > i - 5; j--) {
          if (lines[j].startsWith("## ") || lines[j].startsWith("### ")) {
            currentTarget.name = lines[j].replace(/^#+\s+/, "").trim();
            break;
          }
        }
      } else if (currentTarget && line.includes("**Shell:**")) {
        currentTarget.shell = line.split("**Shell:**")[1]?.trim();
      } else if (currentTarget && line.startsWith("- ")) {
        const pPath = line.substring(2).trim();
        if (pPath.endsWith(".md")) {
          currentTarget.partials.push(path.basename(pPath, ".md"));
        }
      }
    }
    if (currentTarget) targets.push(currentTarget);
    return targets;
  }
}

module.exports = { Transpiler };
