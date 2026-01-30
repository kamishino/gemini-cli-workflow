const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { backupFile, safeWrite } = require('../utils/fs-vault');
const { validateTomlFile } = require('../validators/toml-validator');
const { EnvironmentManager } = require('./env-manager');

class Transpiler {
  constructor(cwd = process.cwd()) {
    // Force absolute path to avoid CWD-dependent behavior
    const absoluteCwd = path.resolve(cwd);

    // If called from inside cli-core, the project root is one level up (Master Repo)
    if (absoluteCwd.endsWith('cli-core') || absoluteCwd.endsWith('cli-core' + path.sep)) {
      this.projectRoot = path.dirname(absoluteCwd);
    } else {
      this.projectRoot = absoluteCwd;
    }

    this.blueprintDir = path.join(this.projectRoot, 'resources/blueprints');
    this.templatesDir = path.join(this.projectRoot, 'resources/templates');
    this.rulesDir = path.join(this.blueprintDir, 'rules');
    
    this.envManager = new EnvironmentManager(this.projectRoot);
    this.targets = [];
    this.workspacePrefix = './';
    this.isInitialized = false;
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
    // This specifically targets the common mistake of adding a leading slash before {{WORKSPACE}}
    let sanitized = content.replace(/\/(\.\/\.kamiflow\/)/g, '$1');
    
    // Fix double slashes (excluding protocol double slashes like https://)
    sanitized = sanitized.replace(/([^:])\/{2,}/g, '$1/');
    
    return sanitized;
  }

  /**
   * Load a partial file by name (searches subfolders recursively)
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
      throw new Error(`Partial not found: ${name} in ${this.blueprintDir}`);
    }
    let content = await fs.readFile(filePath, 'utf8');
    
    // INJECT WORKSPACE PATH
    content = content.replace(/{{WORKSPACE}}/g, this.workspacePrefix);

    // SELF-HEALING: Sanitize paths (e.g., /./.kamiflow -> ./.kamiflow)
    content = this.sanitizeContent(content);

    // Extract metadata from YAML frontmatter
    const metadata = {};
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    
    if (fmMatch) {
      const fm = fmMatch[1];
      const lines = fm.split('\n');
      lines.forEach(l => {
        const [k, ...v] = l.split(':');
        if (k && v.length > 0) metadata[k.trim()] = v.join(':').trim();
      });
    }

    // MANDATORY METADATA VALIDATION
    if (name !== 'context-sync') {
      const required = ['name', 'type', 'description', 'group', 'order'];
      const missing = required.filter(f => !metadata[f]);
      if (missing.length > 0) {
        throw new Error(`CRITICAL: Metadata missing in ${path.relative(this.projectRoot, filePath)}: ${missing.join(', ')}`);
      }
    }

    const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
    return { body, metadata };
  }

  /**
   * Assemble a template with its required partials and metadata
   */
  async assemble(templateName, partialNames) {
    const templatePath = path.join(this.templatesDir, templateName);
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    
    let result = await fs.readFile(templatePath, 'utf8');
    let firstMetadata = {};
    
    for (const partialName of partialNames) {
      const { body, metadata } = await this.loadPartial(partialName);
      
      if (partialName !== 'context-sync' && Object.keys(firstMetadata).length === 0) {
        firstMetadata = metadata;
      }

      const upperName = partialName.toUpperCase();
      const ph = upperName.replace(/-/g, '_');
      const regex = new RegExp(`{{${ph}}}`, 'g');
      result = result.replace(regex, body);
      
      if (partialName.includes('-logic')) {
        result = result.replace(/{{LOGIC}}/g, body);
      }
    }

    result = result.replace(/{{DESCRIPTION}}/g, firstMetadata.description || '');
    result = result.replace(/{{GROUP}}/g, firstMetadata.group || '');
    result = result.replace(/{{ORDER}}/g, firstMetadata.order || '10');

    return result;
  }

  /**
   * Run the transpilation based on a registry
   */
  async runFromRegistry(registryPath) {
    await this.init();
    const env = await this.envManager.getEnv();
    console.log(chalk.cyan("\n🔨 Starting Universal Transpilation..."));
    console.log(chalk.gray(`📡 Mode: ${env} | Workspace: ${this.workspacePrefix}`));
    
    if (!(await fs.pathExists(registryPath))) {
      console.log(chalk.yellow(`⚠️  No registry found at ${registryPath}. Skipping.`));
      return;
    }

    const registryContent = await fs.readFile(registryPath, 'utf8');
    const targets = this.parseRegistry(registryContent);

    for (const target of targets) {
      console.log(chalk.white(`\n📦 Building: ${chalk.bold(target.name)}`));
      
      try {
        const assembledContent = await this.assemble(target.shell, target.partials);
        
        for (const outputRoot of this.targets) {
          const absoluteTargetPath = path.resolve(outputRoot, target.targetPath);
          const displayPath = path.relative(this.projectRoot, absoluteTargetPath);

          await backupFile(absoluteTargetPath);
          const success = await safeWrite(absoluteTargetPath, assembledContent);
          
          if (success && absoluteTargetPath.endsWith('.toml')) {
            const validation = validateTomlFile(absoluteTargetPath);
            if (!validation.valid) {
              console.log(chalk.red(`❌ TOML Validation FAILED for ${displayPath}`));
            } else {
              console.log(chalk.green(`✅ ${displayPath} built and validated.`));
            }
          }
        }
      } catch (error) {
        console.error(chalk.red(`💥 Failed to build ${target.name}: ${error.message}`));
      }
    }

    // TRANSPILE RULES
    await this.transpileRules();

    // SYNC DOCUMENTATION
    await this.syncDocumentation();

    // ASSEMBLE PROJECT TEMPLATE (PROD ONLY)
    await this.assembleProjectTemplate();

    console.log(chalk.cyan("\n✨ Transpilation complete."));
  }

  /**
   * Synchronize documentation from resources/docs to target workspaces
   */
  async syncDocumentation() {
    await this.init();
    const env = await this.envManager.getEnv();
    const isProd = env === 'production';
    const sourceDocs = path.join(this.projectRoot, 'resources/docs');

    if (!(await fs.pathExists(sourceDocs))) return;

    console.log(chalk.cyan(`\n📚 Syncing Dynamic Documentation (${env})...`));

    const walkAndSync = async (dir, relativePath = '') => {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relItemPath = path.join(relativePath, item);
        
        if ((await fs.stat(fullPath)).isDirectory()) {
          await walkAndSync(fullPath, relItemPath);
        } else if (item.endsWith('.md')) {
          let content = await fs.readFile(fullPath, 'utf8');

          // 1. Placeholder Injection
          content = content.replace(/{{WORKSPACE}}/g, this.workspacePrefix);
          
          // BLUEPRINT placeholders
          const blueprintPath = isProd ? 'None (Pre-transpiled)' : './resources/blueprints/';
          const blueprintDesc = isProd ? 'N/A' : 'SSOT Logic & Templates';
          content = content.replace(/{{BLUEPRINT_PATH}}/g, blueprintPath);
          content = content.replace(/{{BLUEPRINT_DESC}}/g, blueprintDesc);

          // 2. Production Stripping (Dev-only markers)
          if (isProd) {
            content = content.replace(/\s*<!-- DEV_ONLY_START -->[\s\S]*?<!-- DEV_ONLY_END -->\s*/g, '\n');
          }

          // 3. Self-Healing paths
          content = this.sanitizeContent(content);

          // 4. Write to all targets
          for (const outputRoot of this.targets) {
            const targetPath = path.join(outputRoot, '.kamiflow/docs', relItemPath);
            await safeWrite(targetPath, content);
          }
        }
      }
    };

    await walkAndSync(sourceDocs);
    console.log(chalk.green('   ✅ Documentation synchronized and anchored.'));
  }

  /**
   * Assemble the project template for distribution
   */
  async assembleProjectTemplate() {
    const env = await this.envManager.getEnv();
    if (env !== 'production') return;

    console.log(chalk.cyan("\n🏗️  Assembling Project Template for Distribution..."));

    for (const outputRoot of this.targets) {
      // 1. Create .kamiflow structure
      const kamiflowDir = path.join(outputRoot, '.kamiflow');
      const subDirs = ['archive', 'ideas', 'tasks', 'handoff_logs'];
      
      for (const sub of subDirs) {
        const fullPath = path.join(kamiflowDir, sub);
        await fs.ensureDir(fullPath);
        await fs.writeFile(path.join(fullPath, '.gitkeep'), '');
      }

      // 2. Copy and rename templates
      const templateMappings = [
        { src: 'context.md', dest: '.kamiflow/PROJECT_CONTEXT.md' },
        { src: 'roadmap.md', dest: '.kamiflow/ROADMAP.md' },
        { src: 'gemini.md', dest: 'GEMINI.md' }
      ];

      for (const map of templateMappings) {
        const srcPath = path.join(this.templatesDir, map.src);
        const destPath = path.join(outputRoot, map.dest);
        if (await fs.pathExists(srcPath)) {
          await fs.copy(srcPath, destPath);
          console.log(chalk.gray(`   📄 Seeded: ${map.dest}`));
        }
      }

      // 3. Generate Smart Ignores
      const gitIgnoreContent = `.kamiflow/archive/
.kamiflow/ideas/
.kamiflow/tasks/
.kamiflow/handoff_logs/
.kamiflow/docs/assets/
.gemini/tmp/
.gemini/cache/
.backup/
`;
      const geminiIgnoreContent = `!.kamiflow/archive/
!.kamiflow/ideas/
!.kamiflow/tasks/
!.kamiflow/handoff_logs/
!.kamiflow/docs/
`;

      await fs.writeFile(path.join(outputRoot, '.gitignore'), gitIgnoreContent);
      await fs.writeFile(path.join(outputRoot, '.geminiignore'), geminiIgnoreContent);
      console.log(chalk.gray(`   🛡️  Generated .gitignore & .geminiignore`));
    }
  }

  async transpileRules() {
    if (!fs.existsSync(this.rulesDir)) return;
    const rules = fs.readdirSync(this.rulesDir).filter(f => f.endsWith('.md'));
    
    for (const rule of rules) {
      const content = await fs.readFile(path.join(this.rulesDir, rule), 'utf8');
      for (const outputRoot of this.targets) {
        const targetPath = path.join(outputRoot, '.gemini/rules', rule);
        await safeWrite(targetPath, content);
      }
    }
    console.log(chalk.green('\n⚖️ Rules synced to all targets.'));
  }

  /**
   * Parse Registry MD into JSON structure
   */
  parseRegistry(content) {
    const targets = [];
    const lines = content.split('\n');
    let currentTarget = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('**Target:**')) {
        if (currentTarget) targets.push(currentTarget);
        currentTarget = {
          name: 'Anonymous Target',
          targetPath: line.split('**Target:**')[1]?.trim(),
          partials: []
        };
        for (let j = i - 1; j >= 0 && j > i - 5; j--) {
          if (lines[j].startsWith('## ') || lines[j].startsWith('### ')) {
            currentTarget.name = lines[j].replace(/^#+\s+/, '').trim();
            break;
          }
        }
      } else if (currentTarget && line.includes('**Shell:**')) {
        currentTarget.shell = line.split('**Shell:**')[1]?.trim();
      } else if (currentTarget && line.startsWith('- ')) {
        const pPath = line.substring(2).trim();
        if (pPath.endsWith('.md')) {
          currentTarget.partials.push(path.basename(pPath, '.md'));
        }
      }
    }
    if (currentTarget) targets.push(currentTarget);
    return targets;
  }
}

module.exports = { Transpiler };
