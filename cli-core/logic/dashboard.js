/* eslint-disable no-useless-escape */
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("upath");
const { execSync } = require("child_process");
const logger = require("../utils/logger");

/**
 * Dashboard - Project overview with ASCII charts and metrics
 * Aggregates health, progress, and git status at a glance.
 */

/**
 * Parse ROADMAP.md for task counts
 * @param {string} projectRoot - Project root path
 * @returns {object} Task counts { completed, inProgress, backlog, total }
 */
async function parseRoadmapMetrics(projectRoot) {
  const metrics = { completed: 0, inProgress: 0, backlog: 0, total: 0 };

  // Try .kamiflow/ first, then project root
  const candidates = [
    path.join(projectRoot, ".kamiflow", "ROADMAP.md"),
    path.join(projectRoot, "ROADMAP.md"),
  ];

  let content = null;
  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) {
      content = await fs.readFile(candidate, "utf8");
      break;
    }
  }

  if (!content) return metrics;

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- [x]") || trimmed.startsWith("- [X]")) {
      metrics.completed++;
    } else if (trimmed.startsWith("- [/]")) {
      metrics.inProgress++;
    } else if (trimmed.startsWith("- [ ]")) {
      metrics.backlog++;
    }
  }

  metrics.total = metrics.completed + metrics.inProgress + metrics.backlog;
  return metrics;
}

/**
 * Get git information for the project
 * @param {string} projectRoot - Project root path
 * @returns {object} Git info { branch, uncommitted, lastCommit }
 */
function getGitInfo(projectRoot) {
  const info = { branch: "N/A", uncommitted: 0, lastCommit: "N/A" };

  try {
    info.branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    /* not a git repo */
  }

  try {
    const status = execSync("git status --porcelain", {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    info.uncommitted = status ? status.split("\n").length : 0;
  } catch {
    /* ignore */
  }

  try {
    info.lastCommit = execSync(
      'git log -1 --format="%s (%ar)" --no-walk 2>nul || git log -1 --format="%s (%ar)" --no-walk 2>/dev/null',
      {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      },
    ).trim();
    if (info.lastCommit.length > 60) {
      info.lastCommit = info.lastCommit.substring(0, 57) + "...";
    }
  } catch {
    /* ignore */
  }

  return info;
}

/**
 * Render an ASCII progress bar
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 * @param {number} width - Bar width in characters
 * @returns {string} Formatted bar
 */
function renderBar(value, max, width = 30) {
  if (max === 0) return chalk.gray("░".repeat(width)) + " 0%";

  const ratio = Math.min(value / max, 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  const percent = Math.round(ratio * 100);

  let color = chalk.green;
  if (percent < 30) color = chalk.red;
  else if (percent < 70) color = chalk.yellow;

  return (
    color("█".repeat(filled)) + chalk.gray("░".repeat(empty)) + ` ${percent}%`
  );
}

/**
 * Count files in a directory (non-recursive)
 */
async function countFiles(dirPath) {
  try {
    if (!(await fs.pathExists(dirPath))) return 0;
    const items = await fs.readdir(dirPath);
    return items.length;
  } catch {
    return 0;
  }
}

/**
 * Run the dashboard display
 * @param {object} options - Dashboard options
 */
async function runDashboard(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();
  const termWidth = process.stdout.columns || 80;
  const boxWidth = Math.min(72, termWidth - 4);

  console.log();
  logger.header("KamiFlow Dashboard");

  // === Section 1: Project Info ===
  let projectName = "Unknown";
  let projectVersion = "N/A";

  try {
    const pkgPath = path.join(projectRoot, "package.json");
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      projectName = pkg.name || projectName;
      projectVersion = pkg.version || projectVersion;
    }
  } catch {
    /* ignore */
  }

  console.log(chalk.bold.white("  📦 Project"));
  console.log(chalk.gray(`     Name:    `) + chalk.white(projectName));
  console.log(chalk.gray(`     Version: `) + chalk.cyan(`v${projectVersion}`));
  console.log(chalk.gray(`     Path:    `) + chalk.gray(projectRoot));
  console.log();

  // === Section 2: Git Status ===
  const git = getGitInfo(projectRoot);
  console.log(chalk.bold.white("  🔀 Git Status"));
  console.log(chalk.gray(`     Branch:  `) + chalk.magenta(git.branch));
  console.log(
    chalk.gray(`     Changes: `) +
      (git.uncommitted > 0
        ? chalk.yellow(`${git.uncommitted} uncommitted`)
        : chalk.green("Clean")),
  );
  console.log(chalk.gray(`     Latest:  `) + chalk.gray(git.lastCommit));
  console.log();

  // === Section 3: Roadmap Progress ===
  const roadmap = await parseRoadmapMetrics(projectRoot);
  console.log(chalk.bold.white("  📊 Roadmap Progress"));

  if (roadmap.total > 0) {
    console.log(
      chalk.gray(`     Completed:   `) +
        renderBar(roadmap.completed, roadmap.total) +
        chalk.gray(` (${roadmap.completed}/${roadmap.total})`),
    );
    console.log(
      chalk.gray(`     In Progress: `) +
        chalk.blue(`${roadmap.inProgress} task(s)`),
    );
    console.log(
      chalk.gray(`     Backlog:     `) +
        chalk.gray(`${roadmap.backlog} task(s)`),
    );
  } else {
    console.log(chalk.gray("     No roadmap data found."));
  }
  console.log();

  // === Section 4: Workspace Health ===
  console.log(chalk.bold.white("  🏥 Workspace Health"));

  const checks = [
    {
      name: ".gemini/",
      ok: await fs.pathExists(path.join(projectRoot, ".gemini")),
    },
    {
      name: ".kamiflow/",
      ok: await fs.pathExists(path.join(projectRoot, ".kamiflow")),
    },
    {
      name: "package.json",
      ok: await fs.pathExists(path.join(projectRoot, "package.json")),
    },
    {
      name: "ROADMAP.md",
      ok:
        (await fs.pathExists(
          path.join(projectRoot, ".kamiflow", "ROADMAP.md"),
        )) || (await fs.pathExists(path.join(projectRoot, "ROADMAP.md"))),
    },
  ];

  for (const check of checks) {
    const icon = check.ok ? chalk.green("✓") : chalk.red("✗");
    console.log(chalk.gray(`     ${icon}  ${check.name}`));
  }

  const healthyCount = checks.filter((c) => c.ok).length;
  console.log(
    chalk.gray(`\n     Health: `) + renderBar(healthyCount, checks.length, 20),
  );
  console.log();

  // === Section 5: Workspace Stats ===
  const kamiflowDir = path.join(projectRoot, ".kamiflow");
  const ideasCount = await countFiles(
    path.join(kamiflowDir, "ideas", "drafts"),
  );
  const archiveCount = await countFiles(path.join(kamiflowDir, "archive"));

  console.log(chalk.bold.white("  📁 Workspace Stats"));
  console.log(chalk.gray(`     Ideas:    `) + chalk.white(ideasCount));
  console.log(chalk.gray(`     Archived: `) + chalk.white(archiveCount));
  console.log();

  // Footer with tip
  console.log(
    chalk.gray("  💡 Tip: Run ") +
      chalk.yellow("kamiflow doctor") +
      chalk.gray(" for a detailed health check.\n"),
  );
}

module.exports = { runDashboard, parseRoadmapMetrics, getGitInfo, renderBar };
