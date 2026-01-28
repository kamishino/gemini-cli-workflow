const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

/**
 * Extract Source Idea path from task file content
 */
function findSourceIdea(content) {
  const match = content.match(/Source Idea:\s*(.*)/i);
  return match ? match[1].trim() : null;
}

async function runArchivist() {
  const tasksDir = path.join(process.cwd(), 'tasks');
  const archiveDir = path.join(process.cwd(), 'archive');

  if (!fs.existsSync(tasksDir)) {
    console.log(chalk.yellow("No tasks directory found."));
    return;
  }

  const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
  
  if (files.length === 0) {
    console.log(chalk.green("Workspace is already clean!"));
    return;
  }

  // Group files by ID
  const tasks = {};
  files.forEach(file => {
    const match = file.match(/^(\d{3})-(S\d)-(BRIEF|PRD|TASK|IDEA|SPEC|BUILD|HANDOFF)-(.*)\.md$/);
    if (match) {
      const id = match[1];
      const type = match[2];
      const slug = match[4];
      if (!tasks[id]) tasks[id] = { id, slug, files: [] };
      tasks[id].files.push(file);
    }
  });

  const taskIds = Object.keys(tasks);
  
  if (taskIds.length === 0) {
    console.log(chalk.yellow("No standard task files found to archive."));
    return;
  }

  const { selectedIds } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedIds',
      message: 'Select tasks to archive:',
      choices: taskIds.map(id => ({
        name: `ID: ${id} (${tasks[id].slug})`,
        value: id
      }))
    }
  ]);

  if (selectedIds.length === 0) {
    console.log(chalk.gray("No tasks selected."));
    return;
  }

  const dateStr = new Date().toISOString().split('T')[0];

  for (const id of selectedIds) {
    const task = tasks[id];
    const folderName = `${dateStr}_${id}_${task.slug}`;
    const targetPath = path.join(archiveDir, folderName);

    await fs.ensureDir(targetPath);

    // Track linked ideas
    const sourceIdeas = new Set();

    for (const file of task.files) {
      const filePath = path.join(tasksDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      const linkedIdea = findSourceIdea(content);
      if (linkedIdea) sourceIdeas.add(linkedIdea);

      await fs.move(filePath, path.join(targetPath, file), { overwrite: true });
      console.log(chalk.gray(`  Moved ${file}`));
    }

    // Process linked ideas
    for (const ideaPath of sourceIdeas) {
      const absoluteIdeaPath = path.resolve(process.cwd(), ideaPath);
      if (await fs.pathExists(absoluteIdeaPath)) {
        const ideaFileName = path.basename(absoluteIdeaPath);
        
        // Update status to implemented
        let ideaContent = await fs.readFile(absoluteIdeaPath, 'utf8');
        ideaContent = ideaContent.replace(/status:\s*backlog/i, 'status: implemented');
        await fs.writeFile(absoluteIdeaPath, ideaContent);

        // Move to the same archive folder
        await fs.move(absoluteIdeaPath, path.join(targetPath, ideaFileName), { overwrite: true });
        console.log(chalk.cyan(`  ✓ Linked Idea harvested: ${ideaFileName}`));
      }
    }

    console.log(chalk.green(`\n✅ Archived Task ${id} and all related artifacts.`));
  }

  console.log(chalk.cyan("\n✨ Unified Archive process complete."));
}

module.exports = { runArchivist };