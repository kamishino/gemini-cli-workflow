const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

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
    
    for (const file of task.files) {
      await fs.move(path.join(tasksDir, file), path.join(targetPath, file), { overwrite: true });
      console.log(chalk.gray(`  Moved ${file}`));
    }
    
    console.log(chalk.green(`✓ Archived Task ${id}`));
  }

  console.log(chalk.cyan("\n✨ Archive process complete."));
}

module.exports = { runArchivist };
