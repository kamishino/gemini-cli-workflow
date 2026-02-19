/**
 * agk upgrade — Update installed workflows and rules from templates
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const ora = require("ora");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

// Upgradeable target groups
const UPGRADE_TARGETS = [
  {
    label: "Workflows",
    templateDir: "workflows",
    destDir: path.join(".agent", "workflows"),
    ext: ".md",
  },
  {
    label: "Agents",
    templateDir: "agents",
    destDir: path.join(".agent", "agents"),
    ext: ".md",
  },
  {
    label: "Rules",
    templateDir: "rules",
    destDir: path.join(".gemini", "rules"), // SSOT for Antigravity
    ext: ".md",
    altDestDir: path.join(".agent", "rules"), // fallback only
  },
  {
    label: "Memory templates",
    templateDir: "memory",
    destDir: ".memory",
    ext: ".md",
    skipIfExists: true, // Never overwrite memory — user data
  },
];

async function run(projectDir) {
  console.log(chalk.bold.cyan("\n⬆️  AGK Upgrade\n"));

  const forceAll = process.argv.includes("--force");
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalNew = 0;

  for (const target of UPGRADE_TARGETS) {
    const spinner = ora(`Checking ${target.label}...`).start();

    const templateDir = path.join(TEMPLATES_DIR, target.templateDir);
    if (!(await fs.pathExists(templateDir))) {
      spinner.warn(`${target.label}: no templates found`);
      continue;
    }

    // Resolve destination (check alt dir too)
    let destDir = path.join(projectDir, target.destDir);
    if (target.altDestDir && !(await fs.pathExists(destDir))) {
      const altDest = path.join(projectDir, target.altDestDir);
      if (await fs.pathExists(altDest)) {
        destDir = altDest;
      }
    }

    if (!(await fs.pathExists(destDir))) {
      spinner.info(`${target.label}: not installed (run agk init first)`);
      continue;
    }

    const templateFiles = (await fs.readdir(templateDir)).filter((f) =>
      f.endsWith(target.ext),
    );

    const results = { updated: 0, skipped: 0, new: 0 };

    for (const file of templateFiles) {
      const src = path.join(templateDir, file);
      const dest = path.join(destDir, file);
      const exists = await fs.pathExists(dest);

      // Skip memory files — they contain user data
      if (target.skipIfExists && exists) {
        results.skipped++;
        continue;
      }

      if (!exists) {
        // New file — always install
        await fs.copy(src, dest);
        results.new++;
      } else if (forceAll || (await isOutdated(src, dest))) {
        // Outdated — update
        await fs.copy(src, dest);
        results.updated++;
      } else {
        results.skipped++;
      }
    }

    totalUpdated += results.updated;
    totalSkipped += results.skipped;
    totalNew += results.new;

    const parts = [];
    if (results.new > 0) parts.push(chalk.green(`${results.new} new`));
    if (results.updated > 0)
      parts.push(chalk.yellow(`${results.updated} updated`));
    if (results.skipped > 0)
      parts.push(chalk.gray(`${results.skipped} up-to-date`));

    if (results.updated > 0 || results.new > 0) {
      spinner.succeed(`${target.label}: ${parts.join(", ")}`);
    } else {
      spinner.succeed(`${target.label}: ${parts.join(", ")}`);
    }
  }

  console.log();

  if (totalUpdated === 0 && totalNew === 0) {
    console.log(chalk.green("✅ Everything is up to date!"));
  } else {
    console.log(
      chalk.green(`✅ Done!`) +
        chalk.gray(
          ` ${totalNew} new, ${totalUpdated} updated, ${totalSkipped} unchanged`,
        ),
    );
  }

  if (!forceAll && totalSkipped > 0) {
    console.log(
      chalk.gray("\n  Tip: run `agk upgrade --force` to overwrite all files"),
    );
  }

  console.log();
  return 0;
}

/**
 * Compare source and dest — dest is outdated if src is newer
 */
async function isOutdated(src, dest) {
  try {
    const [srcStat, destStat] = await Promise.all([
      fs.stat(src),
      fs.stat(dest),
    ]);
    return srcStat.mtime > destStat.mtime;
  } catch {
    return false;
  }
}

module.exports = { run };
