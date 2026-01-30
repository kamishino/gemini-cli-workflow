const fs = require('fs-extra');
const path = require('upath');
const chalk = require('chalk');
const { execSync } = require('child_process');

async function runDocAudit(options = {}) {
  console.log(chalk.cyan("\n🔍 Starting Documentation Audit..."));

  const inquirer = (await import('inquirer')).default;

  const rootDir = process.cwd();
  const docsDir = path.join(rootDir, '.kamiflow/docs');
  const readmePath = path.join(rootDir, 'README.md');
  const geminiPath = path.join(rootDir, 'GEMINI.md');

  // 1. Collect Files
  const filesToScan = [readmePath, geminiPath];
  if (fs.existsSync(docsDir)) {
    const docFiles = getAllFiles(docsDir, ['.md']);
    filesToScan.push(...docFiles);
  }

  console.log(chalk.gray(`Scanning ${filesToScan.length} files...`));

  const issues = [];

  // 2. Scan Links
  for (const file of filesToScan) {
    if (fs.existsSync(file)) {
      const fileIssues = checkFileLinks(file, rootDir);
      issues.push(...fileIssues);
    }
  }

  // 3. Check Version Drift
  const versionIssues = checkVersionDrift(rootDir);
  issues.push(...versionIssues);

  // 4. Report
  if (issues.length === 0) {
    console.log(chalk.green("\n✨ No issues found! Documentation is healthy."));
    return;
  }

  console.log(chalk.yellow(`\n⚠️  Found ${issues.length} issues:`));
  issues.forEach(issue => {
    console.log(`- ${chalk.bold(path.relative(rootDir, issue.file))}: ${issue.message} ${chalk.gray(issue.location || '')}`);
  });

  // 5. Healing
  if (options.fix) {
    await applyFixes(issues, options, rootDir);
  } else if (!options.dryRun) {
    const { fix } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'fix',
        message: 'Do you want to attempt automatic fixes?',
        default: false
      }
    ]);
    if (fix) {
      await applyFixes(issues, options, rootDir);
    }
  }
}

function getAllFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extensions));
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

function checkFileLinks(filePath, rootDir) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const lines = content.split('\n');
  
  // Regex for Markdown links: [text](url)
  const linkRegex = /\ \[([^\\\]]+)\]\(([^)]+)\)/g;

  lines.forEach((line, index) => {
    let match;
    while ((match = linkRegex.exec(line)) !== null) {
      const url = match[2];
      // Skip external links, anchors only, and mailto
      if (url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:')) continue;

      try {
        const absolutePath = path.resolve(path.dirname(filePath), url.split('#')[0]);
        if (!fs.existsSync(absolutePath)) {
          issues.push({
            file: filePath,
            type: 'DEAD_LINK',
            message: `Dead link: ${url}`,
            location: `Line ${index + 1}`,
            fixable: false // Complex to fix automatically without search
          });
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  });

  return issues;
}

function checkVersionDrift(rootDir) {
  const issues = [];
  try {
    const packageJsonPath = path.join(rootDir, 'cli-core/package.json');
    if (!fs.existsSync(packageJsonPath)) return [];

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const realVersion = pkg.version;

    // Check README badge
    const readmePath = path.join(rootDir, 'README.md');
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf8');
      if (!content.includes(realVersion)) {
        issues.push({
          file: readmePath,
          type: 'VERSION_MISMATCH',
          message: `Version mismatch. Real: ${realVersion}, Docs seem outdated.`,
          fixable: true
        });
      }
    }
  } catch (e) {
    // Ignore
  }
  return issues;
}

async function applyFixes(issues, options, rootDir) {
  console.log(chalk.cyan("\n🩹 Applying fixes..."));
  
  const fixableIssues = issues.filter(i => i.fixable);
  
  if (fixableIssues.length === 0) {
    console.log(chalk.yellow("No automatically fixable issues found."));
    return;
  }

  // Version/Command Drift -> Run Sync
  if (issues.some(i => i.type === 'VERSION_MISMATCH')) {
    console.log(chalk.gray("Running 'kami sync' to fix version/command drift..."));
    try {
      execSync('node cli-core/scripts/sync-version.js', { stdio: 'inherit' });
      execSync('node cli-core/scripts/sync-docs.js', { stdio: 'inherit' });
      console.log(chalk.green("✓ Sync complete."));
    } catch (e) {
      console.log(chalk.red("✗ Sync failed."));
    }
  }

  console.log(chalk.green("\n✅ Audit & Heal complete."));
}

module.exports = { runDocAudit };
