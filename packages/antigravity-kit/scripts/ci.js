/**
 * agk ci — Generate CI integration for AGK health check
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const ora = require("ora");

const TEMPLATE = path.join(__dirname, "..", "templates", "ci", "ai-health.yml");
const CI_DEST = path.join(".github", "workflows", "ai-health.yml");

async function run(projectDir) {
  console.log(chalk.bold.cyan("\n🔧 AGK CI Generator\n"));

  const destPath = path.join(projectDir, CI_DEST);

  // Check if already exists
  if (await fs.pathExists(destPath)) {
    console.log(chalk.yellow(`  ⚠️  ${CI_DEST} already exists`));
    console.log(chalk.gray("     Use --force to overwrite\n"));

    const force = process.argv.includes("--force");
    if (!force) return 0;
  }

  const spinner = ora({ text: `Generating ${CI_DEST}...`, indent: 2 }).start();

  try {
    await fs.ensureDir(path.dirname(destPath));
    await fs.copy(TEMPLATE, destPath, { overwrite: true });
    spinner.succeed(chalk.green(`${CI_DEST} created`));
  } catch (err) {
    spinner.fail(chalk.red(`Failed: ${err.message}`));
    return 1;
  }

  console.log();
  console.log(chalk.bold("  What this does:"));
  console.log(
    chalk.gray("  • Runs `agk doctor` on every push and pull request"),
  );
  console.log(chalk.gray("  • Fails CI if workflows are missing or broken"));
  console.log(
    chalk.gray("  • Ensures AI guard rails stay healthy across the team"),
  );
  console.log();
  console.log(chalk.bold("  Next steps:"));
  console.log(chalk.gray(`  • Commit ${CI_DEST}`));
  console.log(
    chalk.gray("  • Push to GitHub — health check runs automatically"),
  );
  console.log();

  return 0;
}

module.exports = { run };
