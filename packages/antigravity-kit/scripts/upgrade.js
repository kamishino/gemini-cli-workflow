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
  const forceAll = process.argv.includes("--force");
  const verbose =
    process.argv.includes("--verbose") || process.argv.includes("-v");
  const dryRun = process.argv.includes("--dry-run");

  if (dryRun) {
    console.log(
      chalk.bold.cyan("\n⬆️  AGK Upgrade") + chalk.yellow(" (dry-run)\n"),
    );
  } else {
    console.log(chalk.bold.cyan("\n⬆️  AGK Upgrade\n"));
  }

  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalNew = 0;
  const fileDetails = []; // for verbose/dry-run output

  for (const target of UPGRADE_TARGETS) {
    const spinner = dryRun ? null : ora(`Checking ${target.label}...`).start();

    const templateDir = path.join(TEMPLATES_DIR, target.templateDir);
    if (!(await fs.pathExists(templateDir))) {
      if (spinner) spinner.warn(`${target.label}: no templates found`);
      else
        console.log(chalk.yellow(`  ⚠  ${target.label}: no templates found`));
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
      if (spinner)
        spinner.info(`${target.label}: not installed (run agk init first)`);
      else
        console.log(
          chalk.blue(
            `  ℹ  ${target.label}: not installed (run agk init first)`,
          ),
        );
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
        if (verbose || dryRun) {
          fileDetails.push({
            group: target.label,
            file,
            status: "protected",
            color: chalk.gray,
          });
        }
        continue;
      }

      if (!exists) {
        if (!dryRun) await fs.copy(src, dest);
        results.new++;
        if (verbose || dryRun) {
          fileDetails.push({
            group: target.label,
            file,
            status: "new",
            color: chalk.green,
          });
        }
      } else if (forceAll || (await isOutdated(src, dest))) {
        if (!dryRun) await fs.copy(src, dest);
        results.updated++;
        if (verbose || dryRun) {
          fileDetails.push({
            group: target.label,
            file,
            status: "updated",
            color: chalk.yellow,
          });
        }
      } else {
        results.skipped++;
        if (verbose || dryRun) {
          fileDetails.push({
            group: target.label,
            file,
            status: "up-to-date",
            color: chalk.gray,
          });
        }
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

    if (spinner) {
      spinner.succeed(`${target.label}: ${parts.join(", ")}`);
    } else {
      console.log(`  ✔  ${target.label}: ${parts.join(", ")}`);
    }
  }

  // Verbose / dry-run: show per-file details
  if ((verbose || dryRun) && fileDetails.length > 0) {
    console.log();
    let currentGroup = null;
    for (const d of fileDetails) {
      if (d.group !== currentGroup) {
        currentGroup = d.group;
        console.log(chalk.bold(`  ${currentGroup}:`));
      }
      const icon =
        d.status === "new"
          ? "✨"
          : d.status === "updated"
            ? "🔄"
            : d.status === "protected"
              ? "🔒"
              : "⏭ ";
      console.log(
        `    ${icon}  ${d.color(d.file.padEnd(30))} ${d.color(d.status)}`,
      );
    }
  }

  console.log();

  if (dryRun) {
    if (totalUpdated === 0 && totalNew === 0) {
      console.log(
        chalk.green("✅ Everything is up to date — nothing to change."),
      );
    } else {
      console.log(
        chalk.yellow(`⚠️  Dry-run:`) +
          chalk.gray(
            ` ${totalNew} would be added, ${totalUpdated} would be updated, ${totalSkipped} unchanged`,
          ),
      );
      console.log(chalk.gray("\n  Run `agk upgrade` to apply these changes."));
    }
  } else {
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
  }

  if (!forceAll && totalSkipped > 0 && !dryRun) {
    console.log(
      chalk.gray("\n  Tip: run `agk upgrade --force` to overwrite all files"),
    );
  }

  if (!dryRun && !verbose) {
    console.log(
      chalk.gray("  Tip: run `agk upgrade --verbose` for per-file details"),
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
