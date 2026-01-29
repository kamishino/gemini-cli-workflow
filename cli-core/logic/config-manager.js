const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const os = require('os');

const CONFIG_FILENAME = '.kamirc.json';

class ConfigManager {
  constructor(projectPath = process.cwd()) {
    this.paths = {
      default: path.join(__dirname, '../default-config.json'),
      global: path.join(os.homedir(), '.kami-flow', CONFIG_FILENAME),
      local: path.join(projectPath, CONFIG_FILENAME)
    };
  }

  /**
   * Load a specific JSON file layer
   */
  async loadLayer(filePath) {
    if (await fs.pathExists(filePath)) {
      try {
        return await fs.readJson(filePath);
      } catch (error) {
        console.warn(chalk.yellow(`⚠️ Warning: Failed to read config at ${filePath}: ${error.message}`));
        return {};
      }
    }
    return {};
  }

  /**
   * Load all layers and merge them, tracking the source of each value
   */
  async loadAll() {
    const layers = [
      { name: 'Default', data: await this.loadLayer(this.paths.default) },
      { name: 'Global', data: await this.loadLayer(this.paths.global) },
      { name: 'Local', data: await this.loadLayer(this.paths.local) }
    ];

    const merged = {};
    const metadata = {};

    for (const layer of layers) {
      for (const [key, value] of Object.entries(layer.data)) {
        merged[key] = value;
        metadata[key] = { source: layer.name };
      }
    }

    return { config: merged, metadata };
  }

  /**
   * Get a specific configuration value (winning layer)
   */
  async get(key) {
    const { config } = await this.loadAll();
    return config[key];
  }

  /**
   * Set a configuration value in a specific scope (Global or Local)
   */
  async set(key, value, isGlobal = false) {
    const targetPath = isGlobal ? this.paths.global : this.paths.local;
    
    // Ensure parent directory exists (especially for Global)
    await fs.ensureDir(path.dirname(targetPath));

    const config = await this.loadLayer(targetPath);
    config[key] = value;

    try {
      await fs.writeJson(targetPath, config, { spaces: 2 });
      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Error saving config: ${error.message}`));
      return false;
    }
  }

  /**
   * Delete a configuration key from a specific scope
   */
  async delete(key, isGlobal = false) {
    const targetPath = isGlobal ? this.paths.global : this.paths.local;
    if (!(await fs.pathExists(targetPath))) return true;

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
