/**
 * agk memory stats — Memory file analytics
 *
 * Shows word count, line count, last modified, and staleness per memory file.
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { MEMORY_FILES, relativeTime } = require("../lib/counts");

const STALE_DAYS = 7; // warn if not updated in 7 days

async function run(projectDir) {
  const memoryDir = path.join(projectDir, ".memory");

  console.log(chalk.bold.cyan("\n📊 Memory Stats\n"));

  if (!(await fs.pathExists(memoryDir))) {
    console.log(chalk.yellow("  ⚠  .memory/ not found. Run `agk init` first."));
    console.log();
    return 1;
  }

  // Gather stats for all memory files
  const stats = [];
  let totalWords = 0;
  let totalLines = 0;

  for (const file of MEMORY_FILES) {
    const filePath = path.join(memoryDir, file);
    const stat = {
      file,
      exists: false,
      words: 0,
      lines: 0,
      modified: null,
      stale: false,
    };

    if (await fs.pathExists(filePath)) {
      stat.exists = true;
      const content = await fs.readFile(filePath, "utf8");
      const fsStat = await fs.stat(filePath);

      stat.lines = content.split(/\r?\n/).length;
      stat.words = content.split(/\s+/).filter((w) => w.length > 0).length;
      stat.modified = fsStat.mtime;
      stat.freshness = relativeTime(fsStat.mtime);

      // Staleness check
      const daysSince = (Date.now() - fsStat.mtime.getTime()) / 86400000;
      stat.stale = daysSince > STALE_DAYS;

      totalWords += stat.words;
      totalLines += stat.lines;
    }

    stats.push(stat);
  }

  // Also check for extra files
  const allFiles = await fs.readdir(memoryDir);
  const extraFiles = allFiles.filter(
    (f) => f.endsWith(".md") && !MEMORY_FILES.includes(f),
  );

  // Print table
  console.log(
    chalk.gray(
      "  " +
        "File".padEnd(22) +
        "Lines".padStart(7) +
        "Words".padStart(8) +
        "  Modified",
    ),
  );
  console.log(chalk.gray("  " + "─".repeat(56)));

  for (const s of stats) {
    if (!s.exists) {
      console.log(
        `  ${chalk.red("❌")}  ${chalk.red(s.file.padEnd(20))} ${chalk.gray("— missing —")}`,
      );
      continue;
    }

    const staleIcon = s.stale ? chalk.yellow("⚠️") : chalk.green("✅");
    const freshnessStr = s.stale
      ? chalk.yellow(s.freshness)
      : chalk.gray(s.freshness);

    console.log(
      `  ${staleIcon}  ${chalk.bold(s.file.padEnd(20))} ${String(s.lines).padStart(5)}  ${String(s.words).padStart(6)}  ${freshnessStr}`,
    );
  }

  if (extraFiles.length > 0) {
    console.log();
    console.log(chalk.gray("  Extra files:"));
    for (const f of extraFiles) {
      console.log(chalk.cyan(`    🆕  ${f}`));
    }
  }

  // Summary
  console.log(chalk.gray("\n  " + "─".repeat(56)));
  console.log(
    `  📝  ${chalk.bold("Total:")} ${totalLines} lines, ${totalWords} words across ${stats.filter((s) => s.exists).length}/${MEMORY_FILES.length} files`,
  );

  const staleCount = stats.filter((s) => s.stale).length;
  if (staleCount > 0) {
    console.log(
      chalk.yellow(
        `\n  ⚠  ${staleCount} file(s) stale (>${STALE_DAYS} days). Consider updating with /sync or /wake.`,
      ),
    );
  } else {
    console.log(chalk.green("\n  ✅  All memory files are fresh."));
  }

  console.log();
  return 0;
}

module.exports = { run };
