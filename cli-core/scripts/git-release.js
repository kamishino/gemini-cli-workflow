const { execSync } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../../');
const PACKAGE_PATH = path.resolve(__dirname, '../package.json');

function log(msg, type = 'info') {
  if (type === 'success') console.log(chalk.green(`✅ ${msg}`));
  else if (type === 'error') console.log(chalk.red(`❌ ${msg}`));
  else console.log(chalk.blue(`ℹ️ ${msg}`));
}

async function main() {
  try {
    // 1. Load version from package.json
    if (!fs.existsSync(PACKAGE_PATH)) {
      throw new Error(`Package file not found at: ${PACKAGE_PATH}`);
    }
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
    const version = pkg.version;

    log(`Starting Git Release for v${version}...`);

    // 2. Stage all changes at project root
    log('Staging files at root...');
    execSync('git add .', { cwd: PROJECT_ROOT, stdio: 'inherit' });

    // 3. Commit with proper message
    const commitMsg = `chore(release): ${version}`;
    log(`Creating commit: "${commitMsg}"...`);
    execSync(`git commit -m "${commitMsg}"`, { cwd: PROJECT_ROOT, stdio: 'inherit' });

    // 4. Create tag
    const tagName = `v${version}`;
    log(`Creating tag: ${tagName}...`);
    // Delete tag if already exists locally (in case of retry)
    try {
        execSync(`git tag -d ${tagName}`, { cwd: PROJECT_ROOT, stdio: 'ignore' });
    } catch (e) {
        // Tag doesn't exist, fine
    }
    execSync(`git tag ${tagName}`, { cwd: PROJECT_ROOT, stdio: 'inherit' });

    log(`Git Release v${version} complete!`, 'success');

  } catch (error) {
    log(error.message, 'error');
    process.exit(1);
  }
}

main();
