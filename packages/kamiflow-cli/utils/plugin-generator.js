/**
 * Plugin Generator
 * Creates new KamiFlow plugin projects from templates
 */

const fs = require("fs-extra");
const path = require("upath");
const logger = require("./logger");

class PluginGenerator {
  constructor() {
    this.templateDir = path.join(__dirname, "../templates/plugin-template");
  }

  /**
   * Generate a new plugin project
   * @param {Object} options - Plugin generation options
   * @returns {Promise<string>} Generated plugin path
   */
  async generate(options) {
    const {
      name,
      description = "A KamiFlow plugin",
      author = "Your Name",
      license = "MIT",
      category = "utility",
      outputDir = process.cwd(),
      capabilities = {
        commands: true,
        rules: false,
        hooks: false,
        config: true,
      },
      homepage = "",
      repository = "",
    } = options;

    if (!name) {
      throw new Error("Plugin name is required");
    }

    // Validate plugin name
    if (!/^[a-z0-9-]+$/.test(name)) {
      throw new Error(
        "Plugin name must contain only lowercase letters, numbers, and hyphens",
      );
    }

    const pluginDir = path.join(outputDir, name);

    // Check if directory already exists
    if (await fs.pathExists(pluginDir)) {
      throw new Error(`Directory already exists: ${pluginDir}`);
    }

    logger.info(`Generating plugin: ${name}`);

    // Create plugin directory structure
    await fs.ensureDir(pluginDir);
    await fs.ensureDir(path.join(pluginDir, "scripts"));
    await fs.ensureDir(path.join(pluginDir, "commands"));
    await fs.ensureDir(path.join(pluginDir, "rules"));
    await fs.ensureDir(path.join(pluginDir, "tests"));

    // Prepare template variables
    const className = this.toPascalCase(name);
    const variables = {
      PLUGIN_NAME: name,
      PLUGIN_DESCRIPTION: description,
      AUTHOR_NAME: author,
      LICENSE: license,
      CATEGORY: category,
      PLUGIN_CLASS_NAME: className,
      HAS_COMMANDS: capabilities.commands.toString(),
      HAS_RULES: capabilities.rules.toString(),
      HAS_HOOKS: capabilities.hooks.toString(),
      HAS_CONFIG: capabilities.config.toString(),
      HOMEPAGE_URL: homepage || `https://github.com/${author}/${name}`,
      REPOSITORY_URL: repository || `https://github.com/${author}/${name}.git`,
    };

    // Copy and process template files
    const templateFiles = [
      "kamiflow-plugin.json",
      "index.js",
      "README.md",
      "package.json",
      "scripts/post-install.js",
    ];

    for (const file of templateFiles) {
      const sourcePath = path.join(this.templateDir, file);
      const targetPath = path.join(pluginDir, file);

      if (await fs.pathExists(sourcePath)) {
        let content = await fs.readFile(sourcePath, "utf8");

        // Replace template variables
        for (const [key, value] of Object.entries(variables)) {
          const regex = new RegExp(`{{${key}}}`, "g");
          content = content.replace(regex, value);
        }

        await fs.outputFile(targetPath, content);
      }
    }

    // Create empty test file
    await fs.writeFile(
      path.join(pluginDir, "tests", `${name}.test.js`),
      this.generateTestTemplate(name, className),
    );

    // Create .gitignore
    await fs.writeFile(
      path.join(pluginDir, ".gitignore"),
      `node_modules/\n.DS_Store\n*.log\ncoverage/\n.env\n`,
    );

    logger.success(`Plugin generated at: ${pluginDir}`);
    logger.info("Next steps:");
    logger.info(`  cd ${name}`);
    logger.info("  npm install");
    logger.info("  kamiflow plugin install --source local .");

    return pluginDir;
  }

  /**
   * Convert string to PascalCase
   * @param {string} str - String to convert
   * @returns {string} PascalCase string
   */
  toPascalCase(str) {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }

  /**
   * Generate test template
   * @param {string} pluginName - Plugin name
   * @param {string} className - Plugin class name
   * @returns {string} Test template
   */
  generateTestTemplate(pluginName, className) {
    return `/**
 * Tests for ${pluginName}
 */

const ${className} = require('../index');

describe('${className}', () => {
  let plugin;
  let mockKamiflow;

  beforeEach(() => {
    mockKamiflow = {
      config: {
        get: jest.fn(),
        set: jest.fn()
      },
      commands: {
        register: jest.fn()
      },
      hooks: {
        on: jest.fn()
      }
    };

    plugin = new ${className}(mockKamiflow);
  });

  describe('initialization', () => {
    it('should initialize with correct name and version', () => {
      expect(plugin.name).toBe('${pluginName}');
      expect(plugin.version).toBe('1.0.0');
    });

    it('should initialize successfully', async () => {
      await expect(plugin.initialize()).resolves.not.toThrow();
    });
  });

  describe('configuration', () => {
    it('should get plugin configuration', () => {
      mockKamiflow.config.get.mockReturnValue({ option: 'value' });
      const config = plugin.getConfig();
      expect(config).toEqual({ option: 'value' });
    });

    it('should update plugin configuration', async () => {
      await plugin.updateConfig({ option: 'new-value' });
      expect(mockKamiflow.config.set).toHaveBeenCalledWith(
        'plugins.${pluginName}',
        { option: 'new-value' }
      );
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', async () => {
      await expect(plugin.cleanup()).resolves.not.toThrow();
    });
  });
});
`;
  }

  /**
   * List available plugin categories
   * @returns {Array<string>} Categories
   */
  static getCategories() {
    return [
      "workflow",
      "integration",
      "utility",
      "analysis",
      "automation",
      "devops",
      "testing",
      "documentation",
      "other",
    ];
  }
}

module.exports = { PluginGenerator };
