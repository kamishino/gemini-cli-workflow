/**
 * agk changelog — Display changelog entries from the terminal
 *
 * Usage:
 *   agk changelog          Show latest version entry
 *   agk changelog --all    Show full changelog
 *   agk changelog N        Show last N entries
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

async function run(projectDir, args = []) {
  const changelogPath = path.join(projectDir, "CHANGELOG.md");

  // Also check in packages/antigravity-kit (dogfooding)
  const altPath = path.join(
    projectDir,
    "packages",
    "antigravity-kit",
    "CHANGELOG.md",
  );

  let filePath = changelogPath;
  if (!(await fs.pathExists(filePath))) {
    if (await fs.pathExists(altPath)) {
      filePath = altPath;
    } else {
      console.log(chalk.yellow("\n⚠️  No CHANGELOG.md found.\n"));
      console.log(
        chalk.gray("  Create one at the project root to use this command."),
      );
      console.log();
      return 1;
    }
  }

  const content = await fs.readFile(filePath, "utf8");
  const showAll = args.includes("--all");
  const countArg = args.find((a) => /^\d+$/.test(a));
  const count = countArg ? parseInt(countArg, 10) : 1;

  // Split by version headers (## [vX.Y.Z])
  const entries = splitByVersion(content);

  if (entries.length === 0) {
    console.log(chalk.yellow("\n⚠️  CHANGELOG.md has no version entries.\n"));
    return 1;
  }

  const toShow = showAll ? entries : entries.slice(0, count);

  console.log();
  console.log(chalk.bold.cyan("📋 Changelog") + chalk.gray(` (${filePath})`));
  console.log(chalk.gray("─".repeat(50)));

  for (const entry of toShow) {
    console.log(entry.trim());
    console.log(chalk.gray("─".repeat(50)));
  }

  if (!showAll && entries.length > toShow.length) {
    console.log(
      chalk.gray(`  Showing ${toShow.length} of ${entries.length} entries.`),
    );
    console.log(chalk.gray("  Run `agk changelog --all` to see everything.\n"));
  }

  return 0;
}

/**
 * Split changelog content into version entries
 */
function splitByVersion(content) {
  const lines = content.split("\n");
  const entries = [];
  let current = [];

  for (const line of lines) {
    // Match ## [vX.Y.Z] or ## [X.Y.Z]
    if (/^## \[v?\d+\.\d+/.test(line)) {
      if (current.length > 0) {
        entries.push(current.join("\n"));
      }
      current = [line];
    } else if (current.length > 0) {
      current.push(line);
    }
  }

  if (current.length > 0) {
    entries.push(current.join("\n"));
  }

  return entries;
}

module.exports = { run };
