const fs = require('fs-extra');
const path = require('path');
const toml = require('@iarna/toml');
const chalk = require('chalk');

const COMMANDS_ROOT = path.join(__dirname, '../.gemini/commands/kamiflow');

// Mapping Files to Groups (Fixes the overwrite bug)
const TARGET_MAP = [
  {
    file: path.join(__dirname, '../docs/commands/core.md'),
    groups: ['sniper', 'bridge']
  },
  {
    file: path.join(__dirname, '../docs/commands/ops.md'),
    groups: ['management']
  },
  {
    file: path.join(__dirname, '../docs/commands/dev.md'),
    groups: ['autopilot']
  },
  {
    file: path.join(__dirname, '../docs/commands/terminal.md'),
    groups: ['terminal']
  },
  {
    file: path.join(__dirname, '../docs/commands/README.md'),
    groups: ['sniper', 'bridge', 'autopilot', 'management', 'terminal']
  },
  {
    file: path.join(__dirname, '../GEMINI.md'),
    groups: ['sniper', 'bridge', 'autopilot', 'management', 'terminal']
  },
  {
    file: path.join(__dirname, '../docs/overview.md'),
    groups: ['sniper', 'bridge', 'autopilot', 'management', 'terminal']
  }
];

const GROUP_TITLES = {
  sniper: '🎯 Sniper Model (Core Flow)',
  bridge: '🌉 The Bridge (IDE Integration)',
  autopilot: '🚀 Auto-Pilot (Automation)',
  management: '🧠 Management (Operations)',
  terminal: '🖥️ Terminal CLI Guide (Flow Suite)'
};

const GROUP_ORDER = ['sniper', 'bridge', 'autopilot', 'management', 'terminal'];

async function main() {
  try {
    console.log(chalk.blue('ℹ️ Syncing command documentation (Encyclopedia Mode)...'));

    // 1. Build Command Map from TOML files
    const commandMap = [];
    const categories = ['core', 'ops', 'dev'];

    for (const cat of categories) {
      const catDir = path.join(COMMANDS_ROOT, cat);
      if (!fs.existsSync(catDir)) continue;

      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.toml'));
      for (const file of files) {
        const filePath = path.join(catDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const cleanContent = content.replace(/^\uFEFF/, '');
        const parsed = toml.parse(cleanContent);
        const cmdName = file.replace('.toml', '');
        
        commandMap.push({
          fullCommand: `/kamiflow:${cat}:${cmdName}`,
          folder: cat,
          name: cmdName,
          description: parsed.description || 'No description provided.',
          group: parsed.group || 'management',
          order: parsed.order || 999
        });
      }
    }

    // 2. Add Mock Terminal CLI commands
    const cliCommands = [
      { fullCommand: 'kamiflow init-flow', name: 'init-flow', group: 'terminal', order: 10, description: 'Initialize a project with KamiFlow.' },
      { fullCommand: 'kamiflow doctor-flow', name: 'doctor-flow', group: 'terminal', order: 20, description: 'Check project health.' },
      { fullCommand: 'kamiflow sync-flow', name: 'sync-flow', group: 'terminal', order: 30, description: 'Synchronize command documentation.' },
      { fullCommand: 'kamiflow archive-flow', name: 'archive-flow', group: 'terminal', order: 40, description: 'Archive completed tasks.' },
      { fullCommand: 'kamiflow config-flow', name: 'config-flow', group: 'terminal', order: 50, description: 'Manage persistent project settings.' },
      { fullCommand: 'kamiflow update-flow', name: 'update-flow', group: 'terminal', order: 60, description: 'Update KamiFlow to the latest version.' },
      { fullCommand: 'kamiflow info-flow', name: 'info-flow', group: 'terminal', order: 70, description: 'Display core location and version.' }
    ];
    commandMap.push(...cliCommands);

    // 3. Process each target file
    for (const target of TARGET_MAP) {
      if (!fs.existsSync(target.file)) continue;
      console.log(chalk.gray(`   Processing ${path.basename(target.file)}...`));

      let fullMd = '';
      for (const groupKey of target.groups) {
        fullMd += generateGroupTable(commandMap, groupKey);
      }

      updateFileWithMarkers(target.file, fullMd);
    }

    console.log(chalk.blue('ℹ️ Documentation sync complete.'));
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

function generateGroupTable(commandMap, groupKey) {
  const groupCommands = commandMap
    .filter(c => c.group === groupKey)
    .sort((a, b) => a.order - b.order);

  if (groupCommands.length === 0) return '';

  let md = `\n### ${GROUP_TITLES[groupKey]}\n\n`;
  md += `| Command | Goal |\n| :--- | :--- |\n`;
  
  groupCommands.forEach(cmd => {
    const safeCommand = cmd.fullCommand.replace(/`/g, '\`');
    md += `| \`${safeCommand}\` | **${cmd.description}** |\n`;
  });
  
  md += '\n';
  return md;
}

function updateFileWithMarkers(file, newContent) {
  let content = fs.readFileSync(file, 'utf8');
  const markerStart = '<!-- KAMI_COMMAND_LIST_START -->';
  const markerEnd = '<!-- KAMI_COMMAND_LIST_END -->';
  
  if (content.indexOf(markerStart) !== -1 && content.indexOf(markerEnd) !== -1) {
    const parts = content.split(markerStart);
    const pre = parts[0];
    const rest = parts[1].split(markerEnd);
    const post = rest[1];
    
    const finalContent = pre + markerStart + '\n' + newContent + markerEnd + post;
    if (finalContent !== content) {
      fs.writeFileSync(file, finalContent);
      console.log(chalk.green(`      ✅ Markers updated`));
    }
  }
}

main();