const fs = require('fs-extra');
const path = require('upath');
const chalk = require('chalk');
const logger = require('../utils/logger');
const { EnvironmentManager } = require('./env-manager');

/**
 * The SuperSaiyan Orchestrator
 * Manages cycles of autonomous development.
 */
async function runSuperSaiyan(source) {
  const inquirer = (await import('inquirer')).default;
  const env = new EnvironmentManager();
  logger.header("SUPER SAIYAN MODE ACTIVATED");
  
  let targetSource = source;
  
  if (!targetSource) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'source',
        message: 'Select Source of Power:',
        choices: [
          { name: '📚 Backlog (ideas/backlog)', value: 'BACKLOG' },
          { name: '🔮 Research (Generate New Ideas)', value: 'RESEARCH' }
        ]
      }
    ]);
    targetSource = answers.source;
  }

  logger.info(`Channeling power from: ${targetSource}`);

  const targets = await acquireTargets(targetSource, env);
  
  if (targets.length === 0) {
    logger.warn("No targets found. The universe is at peace.");
    return;
  }

  logger.info(`Detected ${targets.length} Targets for this Cycle:`);
  targets.forEach(t => logger.hint(path.basename(t)));

  logger.info("Initiating Combat Cycle...");
  
  for (const target of targets) {
    console.log(chalk.gray("\n----------------------------------------"));
    logger.info(`Engaging Target: ${path.basename(target)}`);
    await new Promise(r => setTimeout(r, 500));
    logger.success("Target Neutralized (Simulated)."); 
  }

  logger.success("Cycle Complete. Power Level Restored.");
}

async function acquireTargets(source, env) {
  const workspaceRoot = await env.getAbsoluteWorkspacePath();
  const backlogDir = path.join(workspaceRoot, 'ideas/backlog');
  
  if (source === 'BACKLOG') {
    if (fs.existsSync(backlogDir)) {
      const files = fs.readdirSync(backlogDir).filter(f => f.endsWith('.md'));
      return files.slice(0, 3).map(f => path.join(backlogDir, f));
    }
  } else if (source === 'RESEARCH') {
    logger.info("Meditating on the Market...");
    await new Promise(r => setTimeout(r, 1000));
    return ["Generated-Idea-1", "Generated-Idea-2", "Generated-Idea-3"];
  }
  
  return [];
}

module.exports = { runSuperSaiyan };
