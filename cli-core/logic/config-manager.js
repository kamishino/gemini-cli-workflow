const fs = require("fs-extra");
const path = require("upath");
const os = require("os");
const { z } = require("zod");
const logger = require("../utils/logger");

const CONFIG_FILENAME = ".kamirc.json";

// Define the authoritative schema
const ConfigSchema = z
  .object({
    language: z.string().default("english"),
    strategy: z.enum(["FAST", "BALANCED", "AMBITIOUS"]).default("BALANCED"),
    maxRetries: z.number().min(0).max(10).default(3),
    maxBackups: z.number().min(1).max(20).default(5),
    gatedAutomation: z.boolean().default(true),
    executionMode: z.enum(["Planner", "Implementer"]).default("Implementer"),
    currentEnv: z.string().default("development"),
    environments: z
      .record(
        z.object({
          workspaceRoot: z.string(),
          outputTargets: z.array(z.string()),
        }),
      )
      .default({
        development: { workspaceRoot: "./.kamiflow", outputTargets: ["."] },
        production: { workspaceRoot: "./.kamiflow", outputTargets: ["dist"] },
      }),
    plugins: z
      .object({
        seed: z
          .object({
            minFeasibility: z.number().min(0).max(1).default(0.7),
          })
          .default({ minFeasibility: 0.7 }),
      })
      .default({ seed: { minFeasibility: 0.7 } }),
  })
  .passthrough();

class ConfigManager {
  constructor(projectPath = process.cwd()) {
    this.paths = {
      default: path.join(__dirname, "../default-config.json"),
      global: path.join(os.homedir(), ".kami-flow", CONFIG_FILENAME),
      local: path.join(projectPath, CONFIG_FILENAME),
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
    if (!key.includes(".")) return obj[key];
    return key.split(".").reduce((o, i) => (o ? o[i] : undefined), obj);
  }

  /**
   * Migrate old flat/dotted keys to new structured object
   */
  applyLegacyAdapter(config) {
    const migrated = { ...config };

    // Check for 'seed.minFeasibility' (old format)
    if (config["seed.minFeasibility"] !== undefined) {
      if (!migrated.plugins) migrated.plugins = { seed: {} };
      if (!migrated.plugins.seed) migrated.plugins.seed = {};
      migrated.plugins.seed.minFeasibility = config["seed.minFeasibility"];
      delete migrated["seed.minFeasibility"];
    }

    return migrated;
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const output = { ...target };
    for (const key in source) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        if (key in target && target[key] instanceof Object && !Array.isArray(target[key])) {
          output[key] = this.deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }

  /**
   * Load all layers and merge them with validation
   */
  async loadAll() {
    if (this.cache) return this.cache;

    const layers = [
      { name: "Default", data: await this.loadLayer(this.paths.default) },
      { name: "Global", data: await this.loadLayer(this.paths.global) },
      { name: "Local", data: await this.loadLayer(this.paths.local) },
    ];

    // Cache raw layer data for reuse in list() and other methods
    this.layerCache = {
      default: layers[0].data,
      global: layers[1].data,
      local: layers[2].data,
    };

    let merged = {};
    const metadata = {};

    for (const layer of layers) {
      const adaptedData = this.applyLegacyAdapter(layer.data);
      merged = this.deepMerge(merged, adaptedData);

      // Track metadata for top-level keys
      for (const key of Object.keys(adaptedData)) {
        metadata[key] = { source: layer.name };
      }
    }

    // Validation Loop
    const result = ConfigSchema.safeParse(merged);
    let finalConfig = merged;

    if (!result.success) {
      logger.warn("Configuration validation issues found:");
      result.error.issues.forEach((issue) => {
        logger.hint(`${issue.path.join(".")}: ${issue.message} (Using default)`);
      });
      // Fallback: merge raw input with Zod's default output
      finalConfig = ConfigSchema.parse({}); // Get defaults
      finalConfig = { ...finalConfig, ...result.data }; // Fill with what's valid
    } else {
      finalConfig = result.data;
    }

    this.cache = finalConfig;
    return this.cache;
  }

  /**
   * Get a specific configuration value
   */
  async get(key) {
    const config = await this.loadAll();
    return this.resolveValue(config, key);
  }

  /**
   * Set a nested value in an object using dot notation
   */
  setNestedValue(obj, key, value) {
    const keys = key.split(".");
    const lastKey = keys.pop();
    let current = obj;

    for (const k of keys) {
      if (!(k in current) || typeof current[k] !== "object" || Array.isArray(current[k])) {
        current[k] = {};
      }
      current = current[k];
    }

    // Type coercion for numeric strings
    if (typeof value === "string" && !isNaN(value) && value.trim() !== "") {
      current[lastKey] = parseFloat(value);
    } else {
      current[lastKey] = value;
    }
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

    // Handle dot notation for nested keys
    if (key.includes(".")) {
      this.setNestedValue(config, key, value);
    } else {
      config[key] = value;
    }

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
    const config = await this.loadAll();

    // Reuse cached layer data to avoid re-reading files
    const defaultData = this.layerCache?.default || (await this.loadLayer(this.paths.default));
    const globalData = this.layerCache?.global || (await this.loadLayer(this.paths.global));
    const localData = this.layerCache?.local || (await this.loadLayer(this.paths.local));

    const allKeys = this.getFlattenedKeys(ConfigSchema);

    return allKeys.map((key) => {
      const val = this.resolveValue(config, key);

      let source = "Schema";
      if (this.resolveValue(localData, key) !== undefined) source = "Local";
      else if (this.resolveValue(globalData, key) !== undefined) source = "Global";
      else if (this.resolveValue(defaultData, key) !== undefined) source = "System";

      return {
        Key: key,
        Value: typeof val === "object" ? JSON.stringify(val) : val,
        Source: source,
      };
    });
  }

  /**
   * Helper to flatten Zod schema keys
   */
  getFlattenedKeys(schema, prefix = "") {
    let keys = [];
    const shape = schema instanceof z.ZodObject ? schema.shape : schema;

    for (const key in shape) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const subSchema = shape[key];

      if (subSchema instanceof z.ZodObject) {
        keys = keys.concat(this.getFlattenedKeys(subSchema, fullKey));
      } else if (subSchema instanceof z.ZodDefault && subSchema._def.innerType instanceof z.ZodObject) {
        keys = keys.concat(this.getFlattenedKeys(subSchema._def.innerType, fullKey));
      } else if (subSchema instanceof z.ZodOptional && subSchema._def.innerType instanceof z.ZodObject) {
        keys = keys.concat(this.getFlattenedKeys(subSchema._def.innerType, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  /**
   * Flatten a plain object into dot-notation keys
   */
  flattenObject(obj, prefix = "") {
    return Object.keys(obj).reduce((acc, key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (obj[key] !== null && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        Object.assign(acc, this.flattenObject(obj[key], fullKey));
      } else {
        acc[fullKey] = obj[key];
      }
      return acc;
    }, {});
  }

  /**
   * Deep merge missing keys from source into target
   */
  deepMergeMissing(target, source) {
    const output = { ...target };
    for (const key in source) {
      if (source[key] instanceof Object && !Array.isArray(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = this.deepMergeMissing(target[key], source[key]);
        }
      } else {
        if (!(key in target)) {
          output[key] = source[key];
        }
      }
    }
    return output;
  }

  /**
   * Perform an audit without modifying any files (Dry Run)
   */
  async checkConfigFidelity(localData = null) {
    // Allow passing localData to avoid re-reading
    if (!localData) {
      localData = await this.loadLayer(this.paths.local);
    }
    const schemaKeys = this.getFlattenedKeys(ConfigSchema);
    const localFlat = this.flattenObject(localData);

    const missing = [];
    const orphaned = [];

    schemaKeys.forEach((key) => {
      if (this.resolveValue(localData, key) === undefined) {
        missing.push(key);
      }
    });

    Object.keys(localFlat).forEach((key) => {
      if (key === "$schema") return;
      const parts = key.split(".");
      let currentShape = ConfigSchema.shape;
      let found = true;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const schema = currentShape[part];

        if (!schema) {
          found = false;
          break;
        }

        // Unpack Default/Optional
        let inner = schema;
        while (inner instanceof z.ZodDefault || inner instanceof z.ZodOptional) {
          inner = inner._def.innerType;
        }

        if (i < parts.length - 1) {
          if (inner instanceof z.ZodObject) {
            currentShape = inner.shape;
          } else if (inner instanceof z.ZodRecord) {
            // Record found - all subsequent parts are technically valid dynamic keys
            // unless we want to validate the value schema, but for 'orphaned' check,
            // once we hit a Record, we consider the path 'accounted for'.
            break;
          } else {
            found = false;
            break;
          }
        }
      }
      if (!found) orphaned.push(key);
    });

    return { missing, orphaned };
  }

  /**
   * Synchronize local config with system defaults with intelligent audit
   */
  async syncLocalConfig() {
    const defaultData = await this.loadLayer(this.paths.default);
    const localData = await this.loadLayer(this.paths.local);

    // 1. Identification - pass localData to avoid re-reading
    const { missing, orphaned } = await this.checkConfigFidelity(localData);

    // 2. Execution
    const merged = this.deepMergeMissing(localData, defaultData);
    merged["$schema"] = "./.kamiflow/schemas/kamirc.schema.json";

    await fs.writeJson(this.paths.local, merged, { spaces: 2 });
    this.cache = null;

    return {
      success: true,
      added: missing,
      orphaned: orphaned,
      total: missing.length,
    };
  }

  /**
   * Get global state from update-cache.json
   */
  async getGlobalState(key) {
    const { getCache } = require("../utils/update-cache");
    const cache = await getCache();
    return cache[key];
  }

  /**
   * Update global state in update-cache.json
   */
  async setGlobalState(key, value) {
    const { updateCache } = require("../utils/update-cache");
    const data = {};
    data[key] = value;
    await updateCache(data);
    return true;
  }
}

module.exports = { ConfigManager };
