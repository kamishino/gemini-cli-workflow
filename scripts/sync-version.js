const fs = require('fs');
const path = require('path');
const execa = require('execa');
const chalk = require('chalk');

// --- Configuration ---
const PACKAGE_PATH = path.join(__dirname, '../package.json');
const README_PATH = path.join(__dirname, '../README.md');
const CONTEXT_PATH = path.join(__dirname, '../PROJECT_CONTEXT.md');
const BIN_PATH = path.join(__dirname, '../bin/kami.js');
const CHANGELOG_PATH = path.join(__dirname, '../CHANGELOG.md');

// --- Helpers ---
function log(msg, type = 'info') {
  if (type === 'success') console.log(chalk.green(`✅ ${msg}`));
  else if (type === 'error') console.log(chalk.red(`❌ ${msg}`));
  else console.log(chalk.blue(`ℹ️ ${msg}`));
}

// --- Main Logic ---
async function main() {
  try {
    // 1. Get New Version (npm version updates package.json BEFORE running this script)
    const packageJson = require(PACKAGE_PATH);
    const newVersion = packageJson.version;
    log(`Syncing version: v${newVersion}`);

    // 2. Update README.md
    if (fs.existsSync(README_PATH)) {
      let readme = fs.readFileSync(README_PATH, 'utf8');
      // Regex to find "Version: vX.Y.Z" or similar
      readme = readme.replace(/(Version:\s*v?)\d+\.\d+\.\d+/g, `$1${newVersion}`);
      // Badge urls like "v2.10.0"
      readme = readme.replace(/v\d+\.\d+\.\d+/g, `v${newVersion}`);
      // GitHub npx/install urls: #v2.10.0
      readme = readme.replace(/#v\d+\.\d+\.\d+/g, `#v${newVersion}`);
      // Git checkout tags/v2.10.0
      readme = readme.replace(/tags\/v\d+\.\d+\.\d+/g, `tags/v${newVersion}`);
      
      fs.writeFileSync(README_PATH, readme);
      log(`Updated README.md`, 'success');
    }

    // 3. Update PROJECT_CONTEXT.md
    if (fs.existsSync(CONTEXT_PATH)) {
      let context = fs.readFileSync(CONTEXT_PATH, 'utf8');
      // Fix: Use more specific regex to match the entire version string and avoid accumulation
      // Matches "Template v2.15.7..." and replaces the version part
      context = context.replace(/(Template v?)\d+\.\d+\.\d+[-\w.]*/g, `$1${newVersion}`);
      // Matches "Version: 2.15.7..."
      context = context.replace(/(Version:?\s*)\d+\.\d+\.\d+[-\w.]*/g, `$1${newVersion}`);
      fs.writeFileSync(CONTEXT_PATH, context);
      log(`Updated PROJECT_CONTEXT.md`, 'success');
    }

    // 4. Update bin/kami.js
    if (fs.existsSync(BIN_PATH)) {
      let binContent = fs.readFileSync(BIN_PATH, 'utf8');
      // .version('2.10.0')
      binContent = binContent.replace(/\.version\(['"](.*?)['"]\)/, `.version('${newVersion}')`);
      fs.writeFileSync(BIN_PATH, binContent);
      log(`Updated bin/kami.js`, 'success');
    }

    // 5. Generate Changelog
    await generateChangelog(newVersion);

    // 6. Stage files (Git Add) is handled by the calling command in package.json
    // But we can do it here explicitly to be safe
    // await execa('git', ['add', README_PATH, CONTEXT_PATH, BIN_PATH, CHANGELOG_PATH]);
    
  } catch (error) {
    log(error.message, 'error');
    process.exit(1);
  }
}

async function generateChangelog(newVersion) {
  try {
    // Get last tag
    let lastTag = '';
    try {
      // Use sort=-creatordate to find the most recently created tag, regardless of graph reachability
      const { stdout } = await execa('git', ['tag', '--sort=-creatordate']);
      const tags = stdout.split('\n').filter(Boolean);
      lastTag = tags[0] || '';
    } catch (e) {
      log('No previous tags found. Generating full log.', 'info');
    }

    const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
    
    // Get commits
    // Format: hash|subject|author
    const { stdout: commitsRaw } = await execa('git', ['log', range, '--pretty=format:%h|%s|%an']);
    
    if (!commitsRaw) {
      log('No new commits found.', 'info');
      return;
    }

    const commits = commitsRaw.split('\n').map(line => {
      const [hash, subject, author] = line.split('|');
      return { hash, subject, author };
    });

    // Grouping
    const groups = {
      feat: [],
      fix: [],
      chore: [],
      docs: [],
      other: []
    };

    commits.forEach(c => {
      // Ignore release commits to prevent duplication
      if (c.subject.match(/^chore\(release\):/)) return;
      if (c.subject.match(/^\d+\.\d+\.\d+/)) return; // Ignore "2.10.1" style

      const match = c.subject.match(/^(feat|fix|chore|docs|refactor|test)(\(.*\))?: (.*)$/);
      if (match) {
        const type = match[1];
        if (groups[type]) groups[type].push(c);
        else groups.other.push(c);
      } else {
        groups.other.push(c);
      }
    });

    // Build Markdown
    const date = new Date().toISOString().split('T')[0];
    let md = `
## [v${newVersion}] - ${date}

`;

    if (groups.feat.length > 0) {
      md += `### 🚀 Features
`;
      groups.feat.forEach(c => md += `- ${c.subject} (${c.hash})
`);
      md += `
`;
    }

    if (groups.fix.length > 0) {
      md += `### 🐛 Fixes
`;
      groups.fix.forEach(c => md += `- ${c.subject} (${c.hash})
`);
      md += `
`;
    }
    
    // Merge chore, docs, refactor into "Others" for cleaner log, or separate if desired
    const others = [...groups.chore, ...groups.docs, ...groups.other];
    if (others.length > 0) {
      md += `### 🧹 Chores & Others
`;
      others.forEach(c => md += `- ${c.subject} (${c.hash})
`);
      md += `
`;
    }

    // Prepend to File
    let currentContent = '';
    if (fs.existsSync(CHANGELOG_PATH)) {
      currentContent = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    } else {
      currentContent = '# Changelog\nAll notable changes to this project will be documented in this file.\n';
    }

    // Remove Title if exists to append after it
    const titleRegex = /# Changelog\n.*?\n/s;
    const hasTitle = titleRegex.test(currentContent);
    
    if (hasTitle) {
        // Insert after title
        const newContent = currentContent.replace(/(# Changelog\n.*?\n)/s, `$1${md}`);
        fs.writeFileSync(CHANGELOG_PATH, newContent);
    } else {
        fs.writeFileSync(CHANGELOG_PATH, md + currentContent);
    }

    log(`Generated Changelog for v${newVersion}`, 'success');

  } catch (error) {
    log(`Changelog Error: ${error.message}`, 'error');
  }
}

main();
