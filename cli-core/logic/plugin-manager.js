/**
 * Plugin Manager
 * Handles plugin discovery, installation, lifecycle, and registry operations
 */

const fs = require('fs-extra');
const path = require('upath');
const { promisify } = require('util');
const { exec } = require('child_process');
const logger = require('../utils/logger');
const { validatePluginManifest, validateInstallConfig, checkVersionCompatibility } = require('../schemas/plugin-schema');
const { ConfigManager } = require('./config-manager');

const execAsync = promisify(exec);

class PluginManager {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.pluginsDir = path.join(projectPath, '.kamiflow/plugins');
    this.configManager = new ConfigManager(projectPath);
    this.installedPlugins = new Map();
    this.registryUrl = 'https://registry.kamiflow.dev/plugins'; // Placeholder
  }

  /**
   * Initialize plugin manager
   */
  async init() {
    await fs.ensureDir(this.pluginsDir);
    await this.loadInstalledPlugins();
  }

  /**
   * Load all installed plugins
   */
  async loadInstalledPlugins() {
    const pluginsConfigPath = path.join(this.pluginsDir, 'plugins.json');
    
    if (await fs.pathExists(pluginsConfigPath)) {
      const config = await fs.readJson(pluginsConfigPath);
      
      for (const [name, installConfig] of Object.entries(config.plugins || {})) {
        const validation = validateInstallConfig(installConfig);
        if (validation.valid) {
          this.installedPlugins.set(name, validation.data);
        } else {
          logger.warn(`Invalid plugin config for ${name}: ${validation.errors[0].message}`);
        }
      }
    }
  }

  /**
   * Save installed plugins configuration
   */
  async saveInstalledPlugins() {
    const pluginsConfigPath = path.join(this.pluginsDir, 'plugins.json');
    const config = {
      version: '1.0.0',
      plugins: Object.fromEntries(this.installedPlugins)
    };
    
    await fs.writeJson(pluginsConfigPath, config, { spaces: 2 });
  }

  /**
   * Search for plugins in registry
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async search(query, options = {}) {
    logger.info(`Searching plugins: ${query}`);
    
    // TODO: Implement actual registry API call
    // For now, return mock results
    return [
      {
        name: 'kamiflow-github-integration',
        version: '1.0.0',
        description: 'GitHub issues and PR integration for KamiFlow',
        category: 'integration',
        downloads: 1500,
        rating: 4.5,
        verified: true
      },
      {
        name: 'kamiflow-docker-manager',
        version: '2.1.0',
        description: 'Manage Docker containers from KamiFlow commands',
        category: 'devops',
        downloads: 850,
        rating: 4.2,
        verified: false
      }
    ];
  }

  /**
   * Get plugin details from registry
   * @param {string} pluginName - Plugin name
   * @returns {Promise<Object>} Plugin details
   */
  async getPluginInfo(pluginName) {
    logger.debug(`Fetching plugin info: ${pluginName}`);
    
    // TODO: Implement actual registry API call
    throw new Error('Registry API not yet implemented');
  }

  /**
   * Install a plugin
   * @param {string} identifier - Plugin identifier (name, git URL, or local path)
   * @param {Object} options - Installation options
   * @returns {Promise<Object>} Installation result
   */
  async install(identifier, options = {}) {
    await this.init();
    
    logger.info(`Installing plugin: ${identifier}`);
    
    const { source = 'registry', version = 'latest' } = options;
    
    // Determine source type
    let actualSource = source;
    if (identifier.startsWith('http://') || identifier.startsWith('https://') || identifier.startsWith('git@')) {
      actualSource = 'git';
    } else if (identifier.startsWith('./') || identifier.startsWith('../') || path.isAbsolute(identifier)) {
      actualSource = 'local';
    } else if (identifier.includes('/')) {
      actualSource = 'npm';
    }
    
    let pluginPath;
    let manifest;
    
    switch (actualSource) {
      case 'local':
        pluginPath = path.resolve(this.projectPath, identifier);
        manifest = await this.installFromLocal(pluginPath);
        break;
      
      case 'git':
        manifest = await this.installFromGit(identifier, version);
        pluginPath = path.join(this.pluginsDir, manifest.name);
        break;
      
      case 'npm':
        manifest = await this.installFromNpm(identifier, version);
        pluginPath = path.join(this.pluginsDir, manifest.name);
        break;
      
      case 'registry':
      default:
        manifest = await this.installFromRegistry(identifier, version);
        pluginPath = path.join(this.pluginsDir, manifest.name);
        break;
    }
    
    // Validate manifest
    const validation = validatePluginManifest(manifest);
    if (!validation.valid) {
      throw new Error(`Invalid plugin manifest: ${validation.errors[0].message}`);
    }
    
    // Check version compatibility
    const kamiflowVersion = require('../../package.json').version;
    if (manifest.engines && manifest.engines.kamiflow) {
      if (!checkVersionCompatibility(manifest.engines.kamiflow, kamiflowVersion)) {
        throw new Error(`Plugin requires KamiFlow ${manifest.engines.kamiflow}, but ${kamiflowVersion} is installed`);
      }
    }
    
    // Run post-install hook
    if (manifest.hooks && manifest.hooks.postInstall) {
      await this.runHook(pluginPath, manifest.hooks.postInstall);
    }
    
    // Register plugin
    this.installedPlugins.set(manifest.name, {
      source: actualSource,
      identifier,
      version: manifest.version,
      enabled: true,
      config: {},
      installedAt: new Date().toISOString()
    });
    
    await this.saveInstalledPlugins();
    
    logger.success(`Plugin installed: ${manifest.name}@${manifest.version}`);
    
    return { name: manifest.name, version: manifest.version, path: pluginPath };
  }

  /**
   * Install from local directory
   * @param {string} localPath - Local plugin path
   * @returns {Promise<Object>} Plugin manifest
   */
  async installFromLocal(localPath) {
    const manifestPath = path.join(localPath, 'kamiflow-plugin.json');
    
    if (!await fs.pathExists(manifestPath)) {
      throw new Error(`Plugin manifest not found: ${manifestPath}`);
    }
    
    const manifest = await fs.readJson(manifestPath);
    
    // Create symlink to local plugin
    const targetPath = path.join(this.pluginsDir, manifest.name);
    await fs.ensureDir(path.dirname(targetPath));
    
    if (await fs.pathExists(targetPath)) {
      await fs.remove(targetPath);
    }
    
    await fs.ensureSymlink(localPath, targetPath, 'dir');
    
    return manifest;
  }

  /**
   * Install from git repository
   * @param {string} gitUrl - Git repository URL
   * @param {string} version - Version/branch/tag
   * @returns {Promise<Object>} Plugin manifest
   */
  async installFromGit(gitUrl, version = 'main') {
    const tempDir = path.join(this.pluginsDir, '.tmp', `git-${Date.now()}`);
    await fs.ensureDir(tempDir);
    
    try {
      // Clone repository
      logger.info(`Cloning from ${gitUrl}...`);
      await execAsync(`git clone --depth 1 --branch ${version} ${gitUrl} ${tempDir}`);
      
      // Read manifest
      const manifestPath = path.join(tempDir, 'kamiflow-plugin.json');
      if (!await fs.pathExists(manifestPath)) {
        throw new Error('Plugin manifest not found in repository');
      }
      
      const manifest = await fs.readJson(manifestPath);
      
      // Move to plugins directory
      const targetPath = path.join(this.pluginsDir, manifest.name);
      if (await fs.pathExists(targetPath)) {
        await fs.remove(targetPath);
      }
      
      await fs.move(tempDir, targetPath);
      
      // Install dependencies if package.json exists
      const packageJsonPath = path.join(targetPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        logger.info('Installing plugin dependencies...');
        await execAsync('npm install --production', { cwd: targetPath });
      }
      
      return manifest;
    } finally {
      // Cleanup temp directory
      await fs.remove(tempDir);
    }
  }

  /**
   * Install from npm registry
   * @param {string} packageName - NPM package name
   * @param {string} version - Package version
   * @returns {Promise<Object>} Plugin manifest
   */
  async installFromNpm(packageName, version = 'latest') {
    logger.info(`Installing from npm: ${packageName}@${version}`);
    
    const targetPath = path.join(this.pluginsDir, packageName);
    await fs.ensureDir(targetPath);
    
    // Install package
    await execAsync(`npm install ${packageName}@${version} --prefix ${targetPath} --no-save`);
    
    // Read manifest
    const manifestPath = path.join(targetPath, 'node_modules', packageName, 'kamiflow-plugin.json');
    if (!await fs.pathExists(manifestPath)) {
      throw new Error('Plugin manifest not found in npm package');
    }
    
    return await fs.readJson(manifestPath);
  }

  /**
   * Install from KamiFlow registry
   * @param {string} pluginName - Plugin name
   * @param {string} version - Plugin version
   * @returns {Promise<Object>} Plugin manifest
   */
  async installFromRegistry(pluginName, version = 'latest') {
    // TODO: Implement registry API integration
    throw new Error('KamiFlow registry not yet available. Use --source git or --source local');
  }

  /**
   * Uninstall a plugin
   * @param {string} pluginName - Plugin name
   * @returns {Promise<void>}
   */
  async uninstall(pluginName) {
    await this.init();
    
    if (!this.installedPlugins.has(pluginName)) {
      throw new Error(`Plugin not installed: ${pluginName}`);
    }
    
    const pluginPath = path.join(this.pluginsDir, pluginName);
    const manifestPath = path.join(pluginPath, 'kamiflow-plugin.json');
    
    // Run pre-uninstall hook
    if (await fs.pathExists(manifestPath)) {
      const manifest = await fs.readJson(manifestPath);
      if (manifest.hooks && manifest.hooks.preUninstall) {
        await this.runHook(pluginPath, manifest.hooks.preUninstall);
      }
    }
    
    // Remove plugin directory
    await fs.remove(pluginPath);
    
    // Remove from installed plugins
    this.installedPlugins.delete(pluginName);
    await this.saveInstalledPlugins();
    
    logger.success(`Plugin uninstalled: ${pluginName}`);
  }

  /**
   * List installed plugins
   * @returns {Promise<Array>} List of installed plugins
   */
  async list() {
    await this.init();
    
    const plugins = [];
    
    for (const [name, config] of this.installedPlugins.entries()) {
      const pluginPath = path.join(this.pluginsDir, name);
      const manifestPath = path.join(pluginPath, 'kamiflow-plugin.json');
      
      if (await fs.pathExists(manifestPath)) {
        const manifest = await fs.readJson(manifestPath);
        plugins.push({
          name,
          version: manifest.version,
          description: manifest.description,
          enabled: config.enabled,
          source: config.source,
          installedAt: config.installedAt
        });
      }
    }
    
    return plugins;
  }

  /**
   * Enable a plugin
   * @param {string} pluginName - Plugin name
   */
  async enable(pluginName) {
    await this.init();
    
    if (!this.installedPlugins.has(pluginName)) {
      throw new Error(`Plugin not installed: ${pluginName}`);
    }
    
    const config = this.installedPlugins.get(pluginName);
    config.enabled = true;
    this.installedPlugins.set(pluginName, config);
    
    await this.saveInstalledPlugins();
    logger.success(`Plugin enabled: ${pluginName}`);
  }

  /**
   * Disable a plugin
   * @param {string} pluginName - Plugin name
   */
  async disable(pluginName) {
    await this.init();
    
    if (!this.installedPlugins.has(pluginName)) {
      throw new Error(`Plugin not installed: ${pluginName}`);
    }
    
    const config = this.installedPlugins.get(pluginName);
    config.enabled = false;
    this.installedPlugins.set(pluginName, config);
    
    await this.saveInstalledPlugins();
    logger.warn(`Plugin disabled: ${pluginName}`);
  }

  /**
   * Run a plugin lifecycle hook
   * @param {string} pluginPath - Plugin directory path
   * @param {string} hookScript - Hook script path
   */
  async runHook(pluginPath, hookScript) {
    const scriptPath = path.join(pluginPath, hookScript);
    
    if (!await fs.pathExists(scriptPath)) {
      logger.warn(`Hook script not found: ${hookScript}`);
      return;
    }
    
    logger.debug(`Running hook: ${hookScript}`);
    
    try {
      await execAsync(`node ${scriptPath}`, { cwd: pluginPath });
    } catch (error) {
      logger.error(`Hook failed: ${error.message}`);
      throw error;
    }
  }
}

module.exports = { PluginManager };
