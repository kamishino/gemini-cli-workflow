const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { backupFile, safeWrite } = require('../utils/fs-vault');
const { validateTomlFile } = require('../validators/toml-validator');

class Transpiler {
  constructor(cwd = process.cwd()) {
    // If called from inside cli-core, the project root is one level up (Master Repo)
    if (cwd.endsWith('cli-core') || cwd.endsWith('cli-core' + path.sep)) {
      this.projectRoot = path.dirname(cwd);
    } else {
      this.projectRoot = cwd;
    }

    this.blueprintDir = path.join(this.projectRoot, 'resources/blueprints');
    this.templatesDir = path.join(this.projectRoot, 'resources/templates');
    this.rulesDir = path.join(this.projectRoot, 'resources/rules');
    
    // Resolve target roots and workspace prefix based on environment
    const { targets, workspacePrefix } = this.resolveEnvConfig(this.projectRoot);
    this.targets = targets;
    this.workspacePrefix = workspacePrefix;
  }

  /**
   * Resolve output directories and workspace prefix based on KAMI_ENV
   */
  resolveEnvConfig(root) {
    const env = process.env.KAMI_ENV || 'standard';
    const targets = [];
    let workspacePrefix = './';

    if (env === 'dev' || env === 'all') {
      // Factory Mode: Output TOMLs to Root, but logic points to .kamiflow/workspace/
      targets.push(root); 
      workspacePrefix = '.kamiflow/workspace/';
    }
    
    if (env === 'prod' || env === 'all') {
      // Distribution Mode: Output to dist folder, logic points to project root
      targets.push(path.join(root, 'dist'));
      if (env === 'prod') workspacePrefix = './';
    }

    if (targets.length === 0) {
      targets.push(root);
      workspacePrefix = './';
    }

    return { targets: [...new Set(targets)], workspacePrefix };
  }

  /**
   * Load a partial file by name (searches subfolders recursively)
   */
  async loadPartial(name) {
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
    console.log(chalk.cyan("\n🔨 Starting Universal Transpilation..."));
    console.log(chalk.gray(`📡 Mode: ${process.env.KAMI_ENV || 'standard'} | Workspace: ${this.workspacePrefix}`));
    
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

    console.log(chalk.cyan("\n✨ Transpilation complete."));
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
