const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const IDEAS_DRAFT = path.join(PROJECT_ROOT, 'ideas/draft');
const IDEAS_BACKLOG = path.join(PROJECT_ROOT, 'ideas/backlog');

/**
 * Create a new idea draft from AI content
 */
async function createIdea(title, content, aiSlug, fromIdeaId) {
  try {
    let slug = aiSlug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    // Add suffix if from backlog
    if (fromIdeaId) {
      slug = `${slug}_from-${fromIdeaId}`;
    }

    let fileName = `${slug}.md`;
    let targetPath = path.join(IDEAS_DRAFT, fileName);

    // Handle duplicates
    let counter = 1;
    while (await fs.pathExists(targetPath)) {
      const suffix = fromIdeaId ? `_from-${fromIdeaId}` : '';
      const baseSlug = aiSlug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      fileName = `${baseSlug}-${counter}${suffix}.md`;
      targetPath = path.join(IDEAS_DRAFT, fileName);
      counter++;
    }

    await fs.ensureDir(IDEAS_DRAFT);
    await fs.writeFile(targetPath, content);

    console.log(chalk.green(`
✨ Idea created: ${targetPath}`));
    return targetPath;
  } catch (error) {
    console.error(chalk.red(`
❌ Failed to create idea: ${error.message}`));
    throw error;
  }
}

/**
 * Prepend a refinement version to the idea file
 */
async function prependRefinement(filePath, newContent) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    if (!(await fs.pathExists(absolutePath))) {
      throw new Error(`File not found: ${filePath}`);
    }

    let fileContent = await fs.readFile(absolutePath, 'utf8');
    
    // Logic: Insert after the # 💡 IDEA: [Title] line
    const lines = fileContent.split('\n');
    let titleIndex = lines.findIndex(l => l.startsWith('# 💡 IDEA:'));
    
    if (titleIndex === -1) titleIndex = 0; // Fallback to top

    const pre = lines.slice(0, titleIndex + 1).join('\n');
    const post = lines.slice(titleIndex + 1).join('\n');

    const finalContent = `${pre}\n\n${newContent}\n\n---\n${post}`;
    
    await fs.writeFile(absolutePath, finalContent);
    console.log(chalk.green(`
🌿 Refinement prepended to: ${filePath}`));
  } catch (error) {
    console.error(chalk.red(`
❌ Failed to prepend refinement: ${error.message}`));
    throw error;
  }
}

/**
 * Promote an idea from draft to backlog
 */
async function promoteIdea(filePath) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const fileName = path.basename(absolutePath);
    const newPath = path.join(IDEAS_BACKLOG, fileName);

    if (!(await fs.pathExists(absolutePath))) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Update status in frontmatter
    let content = await fs.readFile(absolutePath, 'utf8');
    content = content.replace(/status: draft/g, 'status: backlog');
    
    await fs.writeFile(absolutePath, content);
    await fs.ensureDir(IDEAS_BACKLOG);
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

module.exports = {
  createIdea,
  prependRefinement,
  promoteIdea
};
