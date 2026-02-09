const fs = require('fs-extra');
const path = require('upath');
const chalk = require('chalk');
const inquirer = require('inquirer').default || require('inquirer');
const { EnvironmentManager } = require('./env-manager');
const InsightManager = require('./insight-manager');

/**
 * Extract Linked Idea ID from filename suffix (_from-ID)
 */
function extractIdeaIdFromFilename(fileName) {
  const match = fileName.match(/_from-([A-Z0-9]{4,6})\.md$/i);
  return match ? match[1].toUpperCase() : null;
}

async function runArchivist(options = {}) {
  const envManager = new EnvironmentManager();
  const workspaceRoot = await envManager.getAbsoluteWorkspacePath();
  
  const tasksDir = path.join(workspaceRoot, 'tasks');
  const archiveDir = path.join(workspaceRoot, 'archive');
  const backlogDir = path.join(workspaceRoot, 'ideas/backlog');

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

  let selectedIds = [];

  // 1. Selection Logic
  if (options.targetId) {
    if (tasks[options.targetId]) {
      selectedIds = [options.targetId];
    } else {
      console.log(chalk.red(`❌ Task ID ${options.targetId} not found in tasks folder.`));
      return;
    }
  } else if (options.all) {
    selectedIds = taskIds;
  } else {
    // Interactive Mode
    const answers = await inquirer.prompt([
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
    selectedIds = answers.selectedIds;
  }

  if (selectedIds.length === 0) {
    console.log(chalk.gray("No tasks selected."));
    return;
  }

  // 2. Confirmation Logic
  if (!options.force) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Archive ${selectedIds.length} task(s)?`,
        default: true
      }
    ]);
    if (!confirm) return;
  }

  const dateStr = new Date().toISOString().split('T')[0];

  for (const id of selectedIds) {
    const task = tasks[id];
    const folderName = `${dateStr}_${id}_${task.slug}`;
    const targetPath = path.join(archiveDir, folderName);

    await fs.ensureDir(targetPath);

    // Track linked ideas via suffix
    const linkedIdeaIds = new Set();

    for (const file of task.files) {
      const filePath = path.join(tasksDir, file);
      
      const ideaId = extractIdeaIdFromFilename(file);
      if (ideaId) linkedIdeaIds.add(ideaId);

      await fs.move(filePath, path.join(targetPath, file), { overwrite: true });
      console.log(chalk.gray(`  Moved ${file}`));
    }

    // Process linked ideas from ideas/backlog/
    if (fs.existsSync(backlogDir)) {
      const backlogFiles = fs.readdirSync(backlogDir);
      for (const ideaId of linkedIdeaIds) {
        const matchingFile = backlogFiles.find(f => f.startsWith(ideaId));
        if (matchingFile) {
          const absoluteIdeaPath = path.join(backlogDir, matchingFile);
          
          // Update status to implemented
          try {
            let ideaContent = await fs.readFile(absoluteIdeaPath, 'utf8');
            ideaContent = ideaContent.replace(/status:\s*backlog/i, 'status: implemented');
            await fs.writeFile(absoluteIdeaPath, ideaContent);

            // Move to the task archive folder
            await fs.move(absoluteIdeaPath, path.join(targetPath, matchingFile), { overwrite: true });
            console.log(chalk.cyan(`  ✓ Linked Idea harvested (Suffix Model): ${matchingFile}`));
          } catch (e) {
            console.log(chalk.yellow(`  ⚠️  Failed to process linked idea ${ideaId}: ${e.message}`));
          }
        }
      }
    }

    // --- Strategic Insight Engine (Task 137) ---
    try {
      const insightManager = new InsightManager(workspaceRoot);
      const insights = await insightManager.extractFromArchive(id);
      if (insights.length > 0) {
        await insightManager.syncToContext(insights);
      }
    } catch (e) {
      console.log(chalk.yellow(`  ⚠️  Insight Engine: Failed to harvest wisdom for Task ${id}: ${e.message}`));
    }
    // -------------------------------------------

    console.log(chalk.green(`\n✅ Archived Task ${id} and its lineage.`));
  }

  console.log(chalk.cyan("\n✨ Harmonized Archive complete."));
}

module.exports = { runArchivist };
