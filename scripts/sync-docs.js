const fs = require('fs-extra');
const path = require('path');
const toml = require('@iarna/toml');
const chalk = require('chalk');

const COMMANDS_ROOT = path.join(__dirname, '../.gemini/commands/kamiflow');

const WIKI_FILES = {
  sniper: path.join(__dirname, '../docs/commands/core.md'),
  bridge: path.join(__dirname, '../docs/commands/core.md'),
  autopilot: path.join(__dirname, '../docs/commands/dev.md'),
  management: path.join(__dirname, '../docs/commands/ops.md'),
  terminal: path.join(__dirname, '../docs/commands/terminal.md'),
  global: path.join(__dirname, '../docs/commands/README.md') // All commands listed here
};

// Target files that get the full grouped list
const GLOBAL_TARGETS = [
  path.join(__dirname, '../GEMINI.md'),
  path.join(__dirname, '../docs/overview.md'),
  WIKI_FILES.global
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
      { fullCommand: 'kamiflow config-flow', name: 'config-flow', group: 'terminal', order: 50, description: 'Manage persistent project settings.' }
    ];
    commandMap.push(...cliCommands);

    // 3. Update Global Files (Full List)
    let fullMd = generateFullMd(commandMap);
    for (const file of GLOBAL_TARGETS) {
      updateFileWithMarkers(file, fullMd);
    }

    // 4. Update Specific Wiki Files (Categorized)
    for (const groupKey of GROUP_ORDER) {
      const targetFile = WIKI_FILES[groupKey];
      if (!targetFile) continue;

      const groupMd = generateGroupTable(commandMap, groupKey);
      updateFileWithMarkers(targetFile, groupMd);
    }

    console.log(chalk.blue('ℹ️ Documentation sync complete.'));
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

function generateFullMd(commandMap) {
  let md = '';
  for (const groupKey of GROUP_ORDER) {
    md += generateGroupTable(commandMap, groupKey);
  }
  return md;
}

function generateGroupTable(commandMap, groupKey) {
  const groupCommands = commandMap
    .filter(c => c.group === groupKey)
    .sort((a, b) => a.order - b.order);

  if (groupCommands.length === 0) return '';

  let md = `\n### ${GROUP_TITLES[groupKey]}\n\n`;
  md += `| Command | Goal |\n| :--- | :--- |\n`;
  
  groupCommands.forEach(cmd => {
    const safeCommand = cmd.fullCommand.replace(/`/g, '\\`');
    md += `| \`${safeCommand}\` | **${cmd.description}** |\n`;
  });
  
  md += '\n';
  return md;
}

function updateFileWithMarkers(file, newContent) {
  if (!fs.existsSync(file)) return;
  console.log(chalk.gray(`   Processing ${path.basename(file)}...`));

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
