const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const CONFIG_FILE = '.kamirc.json';

class ConfigManager {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.configPath = path.join(projectPath, CONFIG_FILE);
  }

  /**
   * Load configuration from .kamirc.json
   */
  async load() {
    if (await fs.pathExists(this.configPath)) {
      try {
        return await fs.readJson(this.configPath);
      } catch (error) {
        console.error(chalk.red(`Error reading config: ${error.message}`));
        return {};
      }
    }
    return {};
  }

  /**
   * Save configuration to .kamirc.json
   */
  async save(config) {
    try {
      await fs.writeJson(this.configPath, config, { spaces: 2 });
      return true;
    } catch (error) {
      console.error(chalk.red(`Error saving config: ${error.message}`));
      return false;
    }
  }

  /**
   * Set a specific configuration key
   */
  async set(key, value) {
    const config = await this.load();
    config[key] = value;
    return await this.save(config);
  }

  /**
   * Get a specific configuration key
   */
  async get(key) {
    const config = await this.load();
    return config[key];
  }

  /**
   * Delete a specific configuration key
   */
  async delete(key) {
    const config = await this.load();
    delete config[key];
    return await this.save(config);
  }
}

module.exports = { ConfigManager };
