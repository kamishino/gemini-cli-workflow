const fs = require('fs-extra');
const path = require('path');
const toml = require('@iarna/toml');
const chalk = require('chalk');

const COMMANDS_ROOT = path.join(__dirname, '../.gemini/commands/kamiflow');
const TARGET_FILES = [
  path.join(__dirname, '../README.md'),
  path.join(__dirname, '../docs/overview.md'),
  path.join(__dirname, '../docs/GETTING_STARTED.md'),
  path.join(__dirname, '../GEMINI.md')
];

const GROUP_TITLES = {
  sniper: '🎯 Sniper Model (Core Flow)',
  bridge: '🌉 The Bridge (IDE Integration)',
  autopilot: '🚀 Auto-Pilot (Automation)',
  management: '🧠 Management (Operations)'
};

const GROUP_ORDER = ['sniper', 'bridge', 'autopilot', 'management'];

async function main() {
  try {
    console.log(chalk.blue('ℹ️ Syncing command documentation (Grouped Mode)...'));

    // 1. Build Command Map
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

    // 2. Generate Grouped Markdown content
    let fullMd = '';
    
    for (const groupKey of GROUP_ORDER) {
      const groupCommands = commandMap
        .filter(c => c.group === groupKey)
        .sort((a, b) => a.order - b.order);

      if (groupCommands.length === 0) continue;

      fullMd += `\n### ${GROUP_TITLES[groupKey]}\n\n`;
      fullMd += `| Command | Goal |\n| :--- | :--- |\n`;
      
      groupCommands.forEach(cmd => {
        // Escape backticks for markdown table
        const safeCommand = cmd.fullCommand.replace(/`/g, '\\`');
        fullMd += `| \`${safeCommand}\` | **${cmd.description}** |\n`;
      });
      
      fullMd += '\n';
    }

    // 3. Update Markdown Files
    for (const file of TARGET_FILES) {
      if (!fs.existsSync(file)) continue;
      console.log(chalk.gray(`   Processing ${path.relative(process.cwd(), file)}...`));

      let content = fs.readFileSync(file, 'utf8');
      let updated = false;

      // A. Placeholder Update (Safe split/join)
      const markerStart = '<!-- KAMI_COMMAND_LIST_START -->';
      const markerEnd = '<!-- KAMI_COMMAND_LIST_END -->';
      
      if (content.indexOf(markerStart) !== -1 && content.indexOf(markerEnd) !== -1) {
        const parts = content.split(markerStart);
        const pre = parts[0];
        const rest = parts[1].split(markerEnd);
        const post = rest[1];
        
        const newContent = pre + markerStart + '\n' + fullMd + markerEnd + post;
        if (newContent !== content) {
            content = newContent;
            updated = true;
            console.log(chalk.green(`      Markers updated in ${path.basename(file)}`));
        }
      }

      // B. Regex Auto-Correction (Police)
      const oldSlash = content;
      content = content.replace(/\/kamiflow:(\w+)\/(\w+)/g, '/kamiflow:$1:$2');
      if (oldSlash !== content) updated = true;

      const oldShort = content;
      commandMap.forEach(cmd => {
        const shortRegex = new RegExp(`\\/kamiflow:${cmd.name}\b(?!:)`, 'g');
        content = content.replace(shortRegex, cmd.fullCommand);
      });
      if (oldShort !== content) updated = true;

      if (updated) {
        fs.writeFileSync(file, content);
        console.log(chalk.green(`✅ File saved: ${path.relative(process.cwd(), file)}`));
      }
    }

    console.log(chalk.blue('ℹ️ Documentation sync complete.'));
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

main();