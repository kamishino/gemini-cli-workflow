const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer').default || require('inquirer');
const { EnvironmentManager } = require('./env-manager');

/**
 * Get dynamic workspace paths
 */
async function getWorkspacePaths(projectRoot = process.cwd()) {
  const envManager = new EnvironmentManager(projectRoot);
  const workspaceRoot = await envManager.getAbsoluteWorkspacePath();
  
  return {
    draft: path.join(workspaceRoot, 'ideas/draft'),
    backlog: path.join(workspaceRoot, 'ideas/backlog'),
    discovery: path.join(workspaceRoot, 'ideas/discovery'),
    root: workspaceRoot
  };
}

/**
 * Generate a 4-character random Hash ID (Uppercase Alphanumeric)
 */
function generateSeedID() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a new idea draft or discovery file from AI content
 */
async function createIdea(title, content, aiSlug, type = 'draft') {
  try {
    const paths = await getWorkspacePaths();
    const id = generateSeedID();
    const isDiscovery = type === 'discovery';
    const targetDir = isDiscovery ? paths.discovery : paths.draft;
    
    let slug = aiSlug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    // Filename format: [ID]-[slug].md for draft, [ID]_[slug]_ai-discovery.md for discovery
    let fileName = isDiscovery ? `${id}_${slug}_ai-discovery.md` : `${id}-${slug}.md`;
    let targetPath = path.join(targetDir, fileName);

    // Collision check
    while (await fs.pathExists(targetPath)) {
      const newId = generateSeedID();
      fileName = isDiscovery ? `${newId}_${slug}_ai-discovery.md` : `${newId}-${slug}.md`;
      targetPath = path.join(targetDir, fileName);
    }

    // Inject ID and basic Frontmatter if not present
    let finalContent = content;
    if (!content.startsWith('---')) {
      const frontmatter = `---
id: ${id}
type: ${type.toUpperCase()}
status: ${isDiscovery ? 'discovery' : 'draft'}
created: ${new Date().toISOString().split('T')[0]}
scores:
  feasibility: 0.0
  risk: 0.0
  value: 0.0
---
`;
      finalContent = frontmatter + content;
    }

    await fs.ensureDir(targetDir);
    await fs.writeFile(targetPath, finalContent);

    console.log(chalk.green(`
✨ Idea created: ${targetPath} (ID: ${id})`));
    return targetPath;
  } catch (error) {
    console.error(chalk.red(`
❌ Failed to create idea: ${error.message}`));
    throw error;
  }
}

/**
 * Update analysis scores in Frontmatter
 */
async function analyzeIdea(filePath, scores) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    if (!(await fs.pathExists(absolutePath))) {
      throw new Error(`File not found: ${filePath}`);
    }

    let content = await fs.readFile(absolutePath, 'utf8');
    
    // Simple Regex Frontmatter replacement for scores
    // Looks for "scores:" block and replaces lines indented under it
    // Or appends if missing.
    
    // Strategy: Reconstruct frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      let fm = match[1];
      // Update or Add Scores
      const scoreBlock = `scores:
  feasibility: ${scores.feasibility || 0}
  risk: ${scores.risk || 0}
  value: ${scores.value || 0}`;
      
      if (fm.includes('scores:')) {
        // Replace existing block (naive regex, assumes standard indentation)
        fm = fm.replace(/scores:[\s\S]*?(?=(\n[a-z]|$))/, scoreBlock);
      } else {
        fm += `\n${scoreBlock}`;
      }
      
      const newContent = content.replace(frontmatterRegex, `---\n${fm}\n---`);
      await fs.writeFile(absolutePath, newContent);
      console.log(chalk.green(`✓ Scores updated: Feasibility=${scores.feasibility}`));
    } else {
      console.warn(chalk.yellow("⚠️  No frontmatter found. Scores not saved."));
    }

  } catch (error) {
    console.error(chalk.red(`❌ Analysis update failed: ${error.message}`));
  }
}

/**
 * Promote an idea from draft to backlog
 */
async function promoteIdea(filePath, options = {}) {
  try {
    const paths = await getWorkspacePaths();
    const absolutePath = path.resolve(process.cwd(), filePath);
    const fileName = path.basename(absolutePath);
    const newPath = path.join(paths.backlog, fileName);

    if (!(await fs.pathExists(absolutePath))) {
      throw new Error(`File not found: ${filePath}`);
    }

    // 1. Read Scores
    const content = await fs.readFile(absolutePath, 'utf8');
    const feasMatch = content.match(/feasibility:\s*([\d\.]+)/);
    const feasibility = feasMatch ? parseFloat(feasMatch[1]) : 0;
    
    const MIN_FEASIBILITY = 0.7; // Could load from config

    // 2. Quality Gate
    if (feasibility < MIN_FEASIBILITY && !options.force) {
      console.log(chalk.yellow(`\n⚠️  Quality Gate Blocked`));
      console.log(chalk.gray(`   Current Feasibility: ${feasibility}`));
      console.log(chalk.gray(`   Required: ${MIN_FEASIBILITY}`));
      
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
          { name: '🛑 Cancel (Refine more)', value: 'CANCEL' },
          { name: '🚀 Force Promote (I know what I am doing)', value: 'FORCE' }
        ]
      }]);

      if (action === 'CANCEL') return;
    }

    // 3. Update status
    let newContent = content.replace(/status: draft/g, 'status: backlog');
    
    await fs.writeFile(absolutePath, newContent);
    await fs.ensureDir(paths.backlog);
    await fs.move(absolutePath, newPath, { overwrite: true });

    console.log(chalk.green(`
🚀 Idea promoted to backlog: ${newPath}`));
    return newPath;
  } catch (error) {
    console.error(chalk.red(`
❌ Failed to promote idea: ${error.message}`));
    throw error;
  }
}

/**
 * Prepend a refinement version to the idea file (Legacy/Helper)
 */
async function prependRefinement(filePath, newContent) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    if (!(await fs.pathExists(absolutePath))) {
      throw new Error(`File not found: ${filePath}`);
    }

    let fileContent = await fs.readFile(absolutePath, 'utf8');
    
    // Logic: Insert after the Frontmatter
    const parts = fileContent.split('---');
    if (parts.length >= 3) {
      // [empty, frontmatter, body]
      const frontmatter = parts[1];
      const body = parts.slice(2).join('---');
      const finalContent = `---\n${frontmatter}\n---\n\n${newContent}\n\n${body}`;
      await fs.writeFile(absolutePath, finalContent);
    } else {
      // No frontmatter, prepend to top
      await fs.writeFile(absolutePath, `${newContent}\n\n${fileContent}`);
    }
    
    console.log(chalk.green(`
🌿 Refinement prepended to: ${filePath}`));
  } catch (error) {
    console.error(chalk.red(`
❌ Failed to prepend refinement: ${error.message}`));
    throw error;
  }
}

module.exports = {
  createIdea,
  prependRefinement,
  promoteIdea,
  analyzeIdea
};
