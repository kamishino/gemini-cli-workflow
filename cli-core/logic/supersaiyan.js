const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer').default || require('inquirer');

/**
 * The SuperSaiyan Orchestrator
 * Manages cycles of autonomous development.
 */
async function runSuperSaiyan(source) {
  console.log(chalk.magentaBright(`
🌟 SUPER SAIYAN MODE ACTIVATED 🌟`));
  
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

  console.log(chalk.magenta(`⚡ Channeling power from: ${targetSource}`));

  // 1. Acquire Targets
  const targets = await acquireTargets(targetSource);
  
  if (targets.length === 0) {
    console.log(chalk.yellow("No targets found. The universe is at peace."));
    return;
  }

  console.log(chalk.cyan(`
🎯 Detected ${targets.length} Targets for this Cycle:`));
  targets.forEach(t => console.log(chalk.gray(`- ${t}`)));

  // 2. Execute Cycle
  console.log(chalk.magenta("\n🚀 Initiating Combat Cycle..."));
  
  for (const target of targets) {
    console.log(chalk.white(`
----------------------------------------`));
    console.log(chalk.yellowBright(`⚔️  Engaging Target: ${path.basename(target)}`));
    
    // In a real agentic loop, we would trigger the AI here.
    // Since we are inside the CLI, we instruct the user (or the AI Agent) 
    // that this is the next focus.
    
    console.log(chalk.green("✅ Target Neutralized (Simulated).")); 
    // In reality, this would be where we call `runSaiyanMode` or wait for the LLM.
  }

  console.log(chalk.magentaBright(`
🌟 Cycle Complete. Power Level Restored.`));
}

async function acquireTargets(source) {
  const backlogDir = path.join(process.cwd(), 'ideas/backlog');
  
  if (source === 'BACKLOG') {
    if (fs.existsSync(backlogDir)) {
      const files = fs.readdirSync(backlogDir).filter(f => f.endsWith('.md'));
      // Return top 3
      return files.slice(0, 3).map(f => path.join(backlogDir, f));
    }
  } else if (source === 'RESEARCH') {
    // Simulate Research
    console.log(chalk.blue("🔮 Meditating on the Market..."));
    await new Promise(r => setTimeout(r, 1000));
    return ["Generated-Idea-1", "Generated-Idea-2", "Generated-Idea-3"];
  }
  
  return [];
}

module.exports = { runSuperSaiyan };
