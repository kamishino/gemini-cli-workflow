const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { backupFile, safeWrite } = require('../utils/fs-vault');
const { validateTomlFile } = require('../validators/toml-validator');

class Transpiler {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.blueprintDir = path.join(projectRoot, 'blueprint');
    this.partialsDir = path.join(this.blueprintDir, 'partials');
    this.templatesDir = path.join(this.blueprintDir, 'templates');
  }

  /**
   * Load a partial file by name (searches subfolders)
   */
  async loadPartial(name) {
    const findFile = (dir, fileName) => {
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

    const filePath = findFile(this.partialsDir, `${name}.md`);
    if (!filePath) {
      throw new Error(`Partial not found: ${name}`);
    }
    const content = await fs.readFile(filePath, 'utf8');
    
    // Extract metadata from YAML frontmatter
    const metadata = {};
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      const fm = fmMatch[1];
      const lines = fm.split('\n');
      lines.forEach(l => {
        const [k, ...v] = l.split(':');
        if (k && v.length > 0) metadata[k.trim()] = v.join(':').trim();
      });
    }

    const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
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
      
      // Collect metadata from the first non-sync partial
      if (partialName !== 'context-sync' && Object.keys(firstMetadata).length === 0) {
        firstMetadata = metadata;
      }

      // Replace {{PARTIAL_NAME}} or {{PARTIAL-NAME}} with content
      const upperName = partialName.toUpperCase();
      const placeholders = [
        upperName,
        upperName.replace(/-/g, '_'),
        upperName.replace(/_/g, '-')
      ];
      
      for (const ph of [...new Set(placeholders)]) {
        const regex = new RegExp(`{{${ph}}}`, 'g');
        result = result.replace(regex, body);
      }
      
      // Fallback for general {{LOGIC}} placeholder
      if (partialName.includes('-logic')) {
        result = result.replace(/{{LOGIC}}/g, body);
      }
    }

    // Inject metadata into template
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
    
    if (!(await fs.pathExists(registryPath))) {
      console.log(chalk.yellow("⚠️  No registry found. Skipping."));
      return;
    }

    const registryContent = await fs.readFile(registryPath, 'utf8');
    // Simple parsing logic for the Registry MD format
    const targets = this.parseRegistry(registryContent);

    for (const target of targets) {
      console.log(chalk.white(`\n📦 Building: ${chalk.bold(target.name)}`));
      
      try {
        const assembledContent = await this.assemble(target.shell, target.partials);
        const absoluteTargetPath = path.resolve(this.projectRoot, target.targetPath);

        // 1. Backup
        await backupFile(absoluteTargetPath);

        // 2. Write
        const success = await safeWrite(absoluteTargetPath, assembledContent);
        
        if (success) {
          // 3. Validate
          if (absoluteTargetPath.endsWith('.toml')) {
            const validation = validateTomlFile(absoluteTargetPath);
            if (!validation.valid) {
              console.log(chalk.red(`❌ TOML Validation FAILED for ${target.targetPath}`));
              console.log(chalk.yellow(validation.error));
              // (Future: Trigger AI Auto-Heal here)
            } else {
              console.log(chalk.green(`✅ ${target.targetPath} built and validated.`));
            }
          } else {
            console.log(chalk.green(`✅ ${target.targetPath} built.`));
          }
        }
      } catch (error) {
        console.error(chalk.red(`💥 Failed to build ${target.name}: ${error.message}`));
      }
    }

    console.log(chalk.cyan("\n✨ Transpilation complete."));
  }

  /**
   * Parse Registry MD into JSON structure
   * (Robust parser: finds all blocks starting with **Target:**)
   */
  parseRegistry(content) {
    const targets = [];
    const lines = content.split('\n');
    
    let currentTarget = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes('**Target:**')) {
        // Start of a new target block
        if (currentTarget) targets.push(currentTarget);
        currentTarget = {
          name: 'Anonymous Target', // Will try to find a name above
          targetPath: line.split('**Target:**')[1]?.trim(),
          partials: []
        };
        
        // Try to find name in the preceding lines
        for (let j = i - 1; j >= 0 && j > i - 5; j--) {
          if (lines[j].startsWith('## ') || lines[j].startsWith('### ')) {
            currentTarget.name = lines[j].replace(/^#+\s+/, '').trim();
            break;
          }
        }
      } else if (currentTarget && line.includes('**Shell:**')) {
        currentTarget.shell = line.split('**Shell:**')[1]?.trim();
      } else if (currentTarget && line.startsWith('- ')) {
        // Assumes partials list follows **Partials:** header
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
