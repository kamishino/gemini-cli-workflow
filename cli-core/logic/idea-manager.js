const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const IDEAS_DRAFT = path.join(PROJECT_ROOT, 'ideas/draft');
const IDEAS_BACKLOG = path.join(PROJECT_ROOT, 'ideas/backlog');
const TEMPLATE_PATH = path.join(PROJECT_ROOT, 'docs/templates/idea.md');

/**
 * Slugify a string
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^wd-z_-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Create a new idea draft
 */
async function createIdea(title) {
  try {
    const slug = slugify(title);
    let fileName = `${slug}.md`;
    let targetPath = path.join(IDEAS_DRAFT, fileName);

    // Handle duplicates
    let counter = 1;
    while (await fs.pathExists(targetPath)) {
      fileName = `${slug}-${counter}.md`;
      targetPath = path.join(IDEAS_DRAFT, fileName);
      counter++;
    }

    // Load template
    let content = await fs.readFile(TEMPLATE_PATH, 'utf8');
    const date = new Date().toISOString().split('T')[0];
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    content = content
      .replace(/{{TITLE}}/g, title)
      .replace(/{{ID}}/g, randomId)
      .replace(/{{DATE}}/g, date);

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
  promoteIdea
};
