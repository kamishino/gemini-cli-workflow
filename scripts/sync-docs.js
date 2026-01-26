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

async function main() {
  try {
    console.log(chalk.blue('ℹ️ Syncing command documentation...'));

    // 1. Build Command Map
    const commandMap = [];
    const categories = ['core', 'ops', 'dev'];

    for (const cat of categories) {
      const catDir = path.join(COMMANDS_ROOT, cat);
      console.log(chalk.gray(`   Scanning ${catDir}...`));
      if (!fs.existsSync(catDir)) {
          console.log(chalk.yellow(`   ⚠️ Directory not found: ${catDir}`));
          continue;
      }

      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.toml'));
      console.log(chalk.gray(`   Found ${files.length} commands in ${cat}`));
      for (const file of files) {
        const filePath = path.join(catDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        // Handle BOM and other potential TOML parsing issues
        const cleanContent = content.replace(/^\uFEFF/, '');
        const parsed = toml.parse(cleanContent);
        const cmdName = file.replace('.toml', '');
        
        commandMap.push({
          fullCommand: `/kamiflow:${cat}:${cmdName}`,
          folder: cat,
          name: cmdName,
          description: parsed.description || 'No description provided.'
        });
      }
    }

    // 2. Generate Markdown Table
    let tableMd = `| Command | Folder | Goal |\n| :--- | :--- | :--- |\n`;
    commandMap.sort((a, b) => {
        // Sort by folder then name
        if (a.folder !== b.folder) return a.folder.localeCompare(b.folder);
        return a.name.localeCompare(b.name);
    }).forEach(cmd => {
      tableMd += `| \`${cmd.fullCommand}\` | ${cmd.folder} | **${cmd.description}** |\n`;
    });

    // 3. Update Markdown Files
    for (const file of TARGET_FILES) {
      if (!fs.existsSync(file)) continue;
      console.log(chalk.gray(`   Processing ${path.relative(process.cwd(), file)}...`));

      let content = fs.readFileSync(file, 'utf8');
      let updated = false;

      // A. Placeholder Update
      const markerStart = '<!-- KAMI_COMMAND_LIST_START -->';
      const markerEnd = '<!-- KAMI_COMMAND_LIST_END -->';
      
      if (content.includes(markerStart) && content.includes(markerEnd)) {
        const markerRegex = new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`, 'g');
        content = content.replace(markerRegex, `${markerStart}\n\n${tableMd}\n${markerEnd}`);
        updated = true;
      }

      // B. Regex Auto-Correction (Police)
      // 1. Correct slashes to colons: /kamiflow:xxx/yyy -> /kamiflow:xxx:yyy
      const slashRegex = /\/kamiflow:(\w+)\/(\w+)/g;
      if (slashRegex.test(content)) {
        content = content.replace(slashRegex, '/kamiflow:$1:$2');
        updated = true;
      }

      // 2. Fix legacy short commands /kamiflow:name to /kamiflow:folder:name
      commandMap.forEach(cmd => {
        const shortRegex = new RegExp(`\/kamiflow:${cmd.name}\b(?!:)`, 'g');
        if (shortRegex.test(content)) {
          content = content.replace(shortRegex, cmd.fullCommand);
          updated = true;
        }
      });

      if (updated) {
        fs.writeFileSync(file, content);
        console.log(chalk.green(`✅ Updated ${path.relative(process.cwd(), file)}`));
      }
    }

    console.log(chalk.blue('ℹ️ Documentation sync complete.'));
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
}

main();