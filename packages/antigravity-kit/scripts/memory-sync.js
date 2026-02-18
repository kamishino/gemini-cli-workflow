/**
 * agk memory sync — Push/pull .memory/ to a private git repo
 *
 * Subcommands:
 *   agk memory sync          → auto push if remote configured, else setup
 *   agk memory sync setup    → configure private remote repo
 *   agk memory sync push     → push .memory/ to remote
 *   agk memory sync pull     → pull .memory/ from remote
 *   agk memory sync status   → show sync status (remote, last sync)
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { spawnSync } = require("child_process");
const ora = require("ora");

const CONFIG_FILE = ".agent/config.json";
const MEMORY_DIR = ".memory";

async function run(projectDir, subcommand = "auto") {
  const configPath = path.join(projectDir, CONFIG_FILE);
  const config = await loadConfig(configPath);
  const remote = config?.memory?.syncRemote;

  switch (subcommand) {
    case "setup":
      return await setup(projectDir, configPath, config);
    case "push":
      return await push(projectDir, remote);
    case "pull":
      return await pull(projectDir, remote);
    case "status":
      return await status(projectDir, remote, config);
    case "auto":
    default:
      if (!remote) {
        console.log(chalk.yellow("\n⚠️  No sync remote configured.\n"));
        console.log(chalk.gray("  Run: agk memory sync setup\n"));
        return 1;
      }
      return await push(projectDir, remote);
  }
}

// --- Setup ---
async function setup(projectDir, configPath, config) {
  console.log(chalk.bold.cyan("\n🔧 Memory Sync Setup\n"));
  console.log(
    chalk.gray(
      "  This will configure a private git repo to sync .memory/ across PCs.\n",
    ),
  );
  console.log(chalk.bold("  Steps to prepare:"));
  console.log(
    chalk.gray(
      "  1. Create a private repo on GitHub (e.g. 'my-project-memory')",
    ),
  );
  console.log(chalk.gray("  2. Copy the repo URL (SSH or HTTPS)"));
  console.log(chalk.gray("  3. Run: agk memory sync setup <repo-url>\n"));

  const repoUrl = process.argv[process.argv.indexOf("setup") + 1];
  if (!repoUrl) {
    console.log(chalk.yellow("  Usage: agk memory sync setup <repo-url>"));
    console.log(
      chalk.gray(
        "  Example: agk memory sync setup git@github.com:you/my-project-memory.git\n",
      ),
    );
    return 1;
  }

  const spinner = ora({
    text: "Configuring sync remote...",
    indent: 2,
  }).start();

  try {
    // Save to config
    const updated = {
      ...config,
      memory: {
        ...(config?.memory || {}),
        syncRemote: repoUrl,
        lastSync: null,
      },
    };
    await fs.ensureDir(path.dirname(configPath));
    await fs.writeJson(configPath, updated, { spaces: 2 });
    spinner.succeed(chalk.green(`Remote configured: ${repoUrl}`));

    // Test connectivity
    const testSpinner = ora({
      text: "Testing remote connectivity...",
      indent: 2,
    }).start();
    const result = spawnSync("git", ["ls-remote", repoUrl], {
      encoding: "utf8",
      timeout: 10000,
    });
    if (result.status === 0) {
      testSpinner.succeed(chalk.green("Remote is accessible"));
    } else {
      testSpinner.warn(
        chalk.yellow("Could not reach remote — check URL and SSH keys"),
      );
    }

    console.log(chalk.bold.green("\n  ✅ Setup complete!\n"));
    console.log(chalk.gray("  Push:  agk memory sync push"));
    console.log(chalk.gray("  Pull:  agk memory sync pull"));
    console.log(chalk.gray("  Auto:  agk memory sync  (pushes by default)\n"));
    return 0;
  } catch (err) {
    spinner.fail(chalk.red(`Setup failed: ${err.message}`));
    return 1;
  }
}

// --- Push ---
async function push(projectDir, remote) {
  if (!remote) {
    console.log(
      chalk.yellow(
        "\n⚠️  No sync remote configured. Run: agk memory sync setup\n",
      ),
    );
    return 1;
  }

  console.log(chalk.bold.cyan("\n⬆️  Memory Sync — Push\n"));
  const memoryDir = path.join(projectDir, MEMORY_DIR);

  if (!(await fs.pathExists(memoryDir))) {
    console.log(
      chalk.yellow("  ⚠️  .memory/ not found — run `agk init` first\n"),
    );
    return 1;
  }

  const spinner = ora({
    text: `Pushing .memory/ to ${remote}...`,
    indent: 2,
  }).start();

  try {
    // Use git subtree push or a simple git bundle approach
    // Strategy: treat .memory/ as files to push via git archive + push to remote
    const result = spawnSync(
      "git",
      ["subtree", "push", "--prefix", MEMORY_DIR, remote, "main"],
      { cwd: projectDir, encoding: "utf8", timeout: 30000 },
    );

    if (result.status === 0) {
      spinner.succeed(chalk.green("Memory pushed successfully"));
      await updateLastSync(projectDir);
      console.log(chalk.gray(`\n  Remote: ${remote}`));
      console.log(chalk.gray(`  Time:   ${new Date().toISOString()}\n`));
      return 0;
    } else {
      spinner.fail(chalk.red("Push failed"));
      console.log(chalk.gray(result.stderr || result.stdout));
      console.log(
        chalk.gray(
          "\n  Tip: First push may need: git subtree push --prefix .memory <remote> main --squash\n",
        ),
      );
      return 1;
    }
  } catch (err) {
    spinner.fail(chalk.red(`Push failed: ${err.message}`));
    return 1;
  }
}

// --- Pull ---
async function pull(projectDir, remote) {
  if (!remote) {
    console.log(
      chalk.yellow(
        "\n⚠️  No sync remote configured. Run: agk memory sync setup\n",
      ),
    );
    return 1;
  }

  console.log(chalk.bold.cyan("\n⬇️  Memory Sync — Pull\n"));
  const spinner = ora({
    text: `Pulling .memory/ from ${remote}...`,
    indent: 2,
  }).start();

  try {
    const result = spawnSync(
      "git",
      ["subtree", "pull", "--prefix", MEMORY_DIR, remote, "main", "--squash"],
      { cwd: projectDir, encoding: "utf8", timeout: 30000 },
    );

    if (result.status === 0) {
      spinner.succeed(chalk.green("Memory pulled successfully"));
      await updateLastSync(projectDir);
      console.log(chalk.gray(`\n  Remote: ${remote}`));
      console.log(chalk.gray(`  Time:   ${new Date().toISOString()}\n`));
      return 0;
    } else {
      spinner.fail(chalk.red("Pull failed"));
      console.log(chalk.gray(result.stderr || result.stdout));
      return 1;
    }
  } catch (err) {
    spinner.fail(chalk.red(`Pull failed: ${err.message}`));
    return 1;
  }
}

// --- Status ---
async function status(projectDir, remote, config) {
  console.log(chalk.bold.cyan("\n🔄 Memory Sync Status\n"));

  const remoteStr = remote
    ? chalk.green(remote)
    : chalk.yellow("not configured (run: agk memory sync setup)");

  const lastSync = config?.memory?.lastSync
    ? chalk.gray(config.memory.lastSync)
    : chalk.gray("never");

  const memoryDir = path.join(projectDir, MEMORY_DIR);
  const hasMemory = await fs.pathExists(memoryDir);

  printRow("Remote", remoteStr);
  printRow("Last sync", lastSync);
  printRow(
    "Memory",
    hasMemory ? chalk.green("found") : chalk.yellow("missing"),
  );

  console.log();
  if (remote) {
    console.log(
      chalk.gray("  Commands: agk memory sync push | agk memory sync pull"),
    );
  } else {
    console.log(chalk.gray("  Setup:    agk memory sync setup <repo-url>"));
  }
  console.log();
  return 0;
}

// --- Helpers ---
function printRow(label, value) {
  console.log(`  ${chalk.bold(label.padEnd(10))}  ${value}`);
}

async function updateLastSync(projectDir) {
  try {
    const configPath = path.join(projectDir, CONFIG_FILE);
    const config = (await loadConfig(configPath)) || {};
    config.memory = { ...config.memory, lastSync: new Date().toISOString() };
    await fs.writeJson(configPath, config, { spaces: 2 });
  } catch {
    /* non-critical */
  }
}

async function loadConfig(configPath) {
  try {
    return await fs.readJson(configPath);
  } catch {
    return {};
  }
}

module.exports = { run };
