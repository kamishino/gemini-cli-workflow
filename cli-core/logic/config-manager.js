const fs = require('fs-extra');
const path = require('upath');
const os = require('os');
const { z } = require('zod');
const logger = require('../utils/logger');

const CONFIG_FILENAME = '.kamirc.json';

// Define the authoritative schema
const ConfigSchema = z.object({
  language: z.string().default("english"),
  strategy: z.enum(["FAST", "BALANCED", "AMBITIOUS"]).default("BALANCED"),
  maxRetries: z.number().min(0).max(10).default(3),
  maxBackups: z.number().min(1).max(20).default(5),
  gatedAutomation: z.boolean().default(true),
  executionMode: z.enum(["Planner", "Implementer"]).default("Implementer"),
  currentEnv: z.string().default("development"),
  environments: z.record(z.object({
    workspaceRoot: z.string(),
    outputTargets: z.array(z.string())
  })).default({
    development: { workspaceRoot: "./.kamiflow", outputTargets: ["."] },
    production: { workspaceRoot: "./.kamiflow", outputTargets: ["dist"] }
  }),
  plugins: z.object({
    seed: z.object({
      minFeasibility: z.number().min(0).max(1).default(0.7)
    }).default({ minFeasibility: 0.7 })
  }).default({ seed: { minFeasibility: 0.7 } })
}).passthrough();

class ConfigManager {
  constructor(projectPath = process.cwd()) {
    this.paths = {
      default: path.join(__dirname, '../default-config.json'),
      global: path.join(os.homedir(), '.kami-flow', CONFIG_FILENAME),
      local: path.join(projectPath, CONFIG_FILENAME)
    };
    this.cache = null;
  }

  /**
   * Load a specific JSON file layer
   */
  async loadLayer(filePath) {
    if (await fs.pathExists(filePath)) {
      try {
        return await fs.readJson(filePath);
      } catch (error) {
        logger.warn(`Failed to read config at ${filePath}: ${error.message}`);
        return {};
      }
    }
    return {};
  }

  /**
   * Adaptive key resolution (supports 'plugins.seed.minFeasibility' or 'language')
   */
  resolveValue(obj, key) {
    if (!key.includes('.')) return obj[key];
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
  }

  /**
   * Migrate old flat/dotted keys to new structured object
   */
  applyLegacyAdapter(config) {
    const migrated = { ...config };
    
    // Check for 'seed.minFeasibility' (old format)
    if (config['seed.minFeasibility'] !== undefined) {
      if (!migrated.plugins) migrated.plugins = { seed: {} };
      if (!migrated.plugins.seed) migrated.plugins.seed = {};
      migrated.plugins.seed.minFeasibility = config['seed.minFeasibility'];
      delete migrated['seed.minFeasibility'];
    }

    return migrated;
  }

  /**
   * Load all layers and merge them with validation
   */
  async loadAll() {
    if (this.cache) return this.cache;

    const layers = [
      { name: 'Default', data: await this.loadLayer(this.paths.default) },
      { name: 'Global', data: await this.loadLayer(this.paths.global) },
      { name: 'Local', data: await this.loadLayer(this.paths.local) }
    ];

    let merged = {};
    const metadata = {};

    for (const layer of layers) {
      const adaptedData = this.applyLegacyAdapter(layer.data);
      for (const [key, value] of Object.entries(adaptedData)) {
        merged[key] = value;
        metadata[key] = { source: layer.name };
      }
    }

    // Validation Loop
    const result = ConfigSchema.safeParse(merged);
    let finalConfig = merged;

    if (!result.success) {
      logger.warn("Configuration validation issues found:");
      result.error.issues.forEach(issue => {
        logger.hint(`${issue.path.join('.')}: ${issue.message} (Using default)`);
      });
      // Fallback: merge raw input with Zod's default output
      finalConfig = ConfigSchema.parse({}); // Get defaults
      finalConfig = { ...finalConfig, ...result.data }; // Fill with what's valid
    } else {
      finalConfig = result.data;
    }

    this.cache = { config: finalConfig, metadata };
    return this.cache;
  }

  /**
   * Get a specific configuration value
   */
  async get(key) {
    const { config } = await this.loadAll();
    return this.resolveValue(config, key);
  }

  /**
   * Set a configuration value in a specific scope (Global or Local)
   */
  async set(key, value, isGlobal = false) {
    const targetPath = isGlobal ? this.paths.global : this.paths.local;
    
    // Invalidate cache
    this.cache = null;

    // Ensure parent directory exists (especially for Global)
    await fs.ensureDir(path.dirname(targetPath));

    const config = await this.loadLayer(targetPath);
    config[key] = value;

    try {
      await fs.writeJson(targetPath, config, { spaces: 2 });
      return true;
    } catch (error) {
      logger.error(`Error saving config: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete a configuration key from a specific scope
   */
  async delete(key, isGlobal = false) {
    const targetPath = isGlobal ? this.paths.global : this.paths.local;
    if (!(await fs.pathExists(targetPath))) return true;

    // Invalidate cache
    this.cache = null;

    const config = await this.loadLayer(targetPath);
    delete config[key];
    
    await fs.writeJson(targetPath, config, { spaces: 2 });
    return true;
  }

  /**
   * List all configurations with their active sources
   */
  async list() {
    const { config, metadata } = await this.loadAll();
    return Object.keys(config).map(key => ({
      Key: key,
      Value: config[key],
      Source: metadata[key].source
    }));
  }
}

module.exports = { ConfigManager };
