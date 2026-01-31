/**
 * {{PLUGIN_NAME}} - KamiFlow Plugin
 * {{PLUGIN_DESCRIPTION}}
 */

class {{PLUGIN_CLASS_NAME}} {
  constructor(kamiflow) {
    this.kamiflow = kamiflow;
    this.name = '{{PLUGIN_NAME}}';
    this.version = '1.0.0';
  }

  /**
   * Initialize plugin
   * Called when plugin is loaded
   */
  async initialize() {
    console.log(`[${this.name}] Initializing...`);
    
    // Register commands
    if (this.kamiflow.commands) {
      this.registerCommands();
    }
    
    // Register hooks
    if (this.kamiflow.hooks) {
      this.registerHooks();
    }
    
    console.log(`[${this.name}] Initialized successfully`);
  }

  /**
   * Register plugin commands
   */
  registerCommands() {
    // Example command registration
    // this.kamiflow.commands.register('my-command', async (args) => {
    //   console.log('Command executed with args:', args);
    // });
  }

  /**
   * Register plugin hooks
   */
  registerHooks() {
    // Example hook registration
    // this.kamiflow.hooks.on('before:transpile', async (context) => {
    //   console.log('Before transpile hook triggered');
    // });
  }

  /**
   * Cleanup plugin resources
   * Called when plugin is unloaded
   */
  async cleanup() {
    console.log(`[${this.name}] Cleaning up...`);
    // Perform cleanup operations
  }

  /**
   * Get plugin configuration
   * @returns {Object} Plugin configuration
   */
  getConfig() {
    return this.kamiflow.config.get(`plugins.${this.name}`) || {};
  }

  /**
   * Update plugin configuration
   * @param {Object} config - Configuration updates
   */
  async updateConfig(config) {
    await this.kamiflow.config.set(`plugins.${this.name}`, config);
  }
}

module.exports = {{PLUGIN_CLASS_NAME}};
