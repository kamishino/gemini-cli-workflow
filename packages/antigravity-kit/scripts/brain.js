/**
 * agk brain — Centralized "Second Brain" Management
 *
 * Subcommands:
 *   agk brain setup <path>  → Set local path for central repo
 *   agk brain link [name]   → Move current .memory/ to brain and symlink it
 *   agk brain status        → Dashboard showing all linked projects & sync state
 *   agk brain sync          → Commit and push the central repo to GitHub
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { execSync } = require("child_process");
const ora = require("ora");
const { getGlobalConfig, setGlobalConfig } = require("../lib/config");
const { relativeTime } = require("../lib/counts");

async function run(projectDir, subArgs = []) {
  const subcommand = subArgs[0] || "status";
  const config = await getGlobalConfig();
  const brainPath = config.brainPath;

  if (subcommand === "setup") {
    return await setup(subArgs[1]);
  }

  if (subcommand === "pull") {
    return await pull(projectDir, brainPath, subArgs[1]);
  }

  // All other commands require brainPath to be set
  if (!brainPath || !(await fs.pathExists(brainPath))) {
    console.log(
      chalk.yellow(
        "\n⚠️  AGK Brain is not configured or path does not exist.\n",
      ),
    );
    console.log(chalk.gray("  Run: agk brain setup <absolute-path-to-repo>\n"));
    return 1;
  }

  switch (subcommand) {
    case "link":
      return await link(projectDir, brainPath, subArgs[1]);
    case "sync":
      return await sync(brainPath);
    case "status":
    default:
      return await status(brainPath, projectDir);
  }
}

// --- Setup ---
async function setup(targetPath) {
  if (!targetPath) {
    console.log(chalk.yellow("\n⚠️  Missing path for AGK Brain.\n"));
    console.log(chalk.gray("  Usage: agk brain setup <absolute-path>\n"));
    return 1;
  }

  const absolutePath = path.resolve(targetPath);
  console.log(chalk.bold.cyan("\n🧠 AGK Brain Setup\n"));

  const spinner = ora("Configuring brain repository...").start();

  try {
    await fs.ensureDir(absolutePath);

    // Initialize git if not already a repo
    const gitDir = path.join(absolutePath, ".git");
    if (!(await fs.pathExists(gitDir))) {
      execSync("git init", { cwd: absolutePath, stdio: "ignore" });
      spinner.info(`Initialized empty Git repository in ${absolutePath}`);
    }

    await setGlobalConfig("brainPath", absolutePath);
    spinner.succeed(chalk.green(`Brain path set to: ${absolutePath}`));

    console.log(chalk.bold("\n  Next steps:"));
    console.log(chalk.gray(`  1. cd ${absolutePath}`));
    console.log(
      chalk.gray(`  2. git remote add origin <your-private-repo-url>`),
    );
    console.log(
      chalk.gray(`  3. agk brain link (inside any project to connect it)\n`),
    );
    return 0;
  } catch (err) {
    spinner.fail(chalk.red(`Setup failed: ${err.message}`));
    return 1;
  }
}

// --- Link ---
async function link(projectDir, brainPath, projectName) {
  const name = projectName || path.basename(projectDir);
  const localMemory = path.join(projectDir, ".memory");
  const brainMemory = path.join(brainPath, name);

  console.log(chalk.bold.cyan(`\n🔗 Linking to AGK Brain (${name})\n`));

  try {
    const localExists = await fs.pathExists(localMemory);
    const localStat = localExists ? await fs.lstat(localMemory) : null;
    const isSymlink = localStat ? localStat.isSymbolicLink() : false;

    if (isSymlink) {
      console.log(chalk.green("  ✅ Already linked to brain."));
      console.log();
      return 0;
    }

    // Connect logic
    await fs.ensureDir(brainPath);

    if (localExists && !(await fs.pathExists(brainMemory))) {
      // Move local to brain
      console.log(chalk.gray(`  Moving .memory/ to ${brainMemory}...`));
      await fs.move(localMemory, brainMemory);
    } else if (!localExists && !(await fs.pathExists(brainMemory))) {
      // Neither exists, create empty in brain
      await fs.ensureDir(brainMemory);
    } else if (localExists && (await fs.pathExists(brainMemory))) {
      console.log(
        chalk.yellow(
          `  ⚠️  Both local .memory/ and brain folder '${name}' exist.\n` +
            `  Please manually merge or remove local .memory/ before linking.\n`,
        ),
      );
      return 1;
    }

    // Remove local dir if it exists (it was moved or handled)
    if (await fs.pathExists(localMemory)) {
      await fs.remove(localMemory);
    }

    // Create symlink
    const type = process.platform === "win32" ? "junction" : "dir";
    await fs.symlink(brainMemory, localMemory, type);
    console.log(chalk.green(`  ✅ Linked: .memory/ → ${brainMemory}`));

    // Auto-ignore .memory in the local project's .gitignore if it exists
    const gitignorePath = path.join(projectDir, ".gitignore");
    if (await fs.pathExists(gitignorePath)) {
      const gitignore = await fs.readFile(gitignorePath, "utf8");
      if (!gitignore.includes(".memory")) {
        await fs.appendFile(
          gitignorePath,
          "\n# AGK Brain\n.memory/\n.memory\n",
        );
        console.log(chalk.gray(`  Added .memory/ to .gitignore`));
      }
    }

    console.log();
    return 0;
  } catch (err) {
    console.error(chalk.red(`  Link failed: ${err.message}\n`));
    return 1;
  }
}

// --- Status (Dashboard) ---
async function status(brainPath, currentProjectDir) {
  console.log(chalk.bold.cyan("\n🧠 AGK Second Brain Dashboard\n"));
  console.log(`  📍 Location: ${chalk.gray(brainPath)}`);

  // 1. Sync Status (Git)
  let syncStatus = chalk.gray("Not a git repository");
  try {
    const s = execSync("git status --porcelain", {
      cwd: brainPath,
      encoding: "utf8",
    }).trim();
    const changesCount = s ? s.split("\n").length : 0;

    let branchInfo = "";
    try {
      branchInfo = execSync("git rev-list --left-right --count HEAD...@{u}", {
        cwd: brainPath,
        encoding: "utf8",
        stdio: "pipe",
      }).trim();
    } catch (e) {
      // no upstream or not on a branch
    }

    let upstreamStr = "";
    if (branchInfo) {
      const [ahead, behind] = branchInfo.split("\t").map(Number);
      if (ahead > 0) upstreamStr += ` | ⬆️ ${ahead} commit(s) ahead`;
      if (behind > 0) upstreamStr += ` | ⬇️ ${behind} commit(s) behind`;
    }

    if (changesCount === 0 && !upstreamStr) {
      syncStatus = chalk.green("✅ Up to date");
    } else {
      let parts = [];
      if (changesCount > 0)
        parts.push(chalk.yellow(`⚠️ ${changesCount} uncommitted changes`));
      if (upstreamStr) parts.push(chalk.cyan(upstreamStr.replace(" | ", "")));
      syncStatus = parts.join(" | ");
    }
  } catch {
    // ignore git errors
  }
  console.log(`  📡 Sync Status: ${syncStatus}\n`);

  // 2. Projects List
  console.log(chalk.bold("Projects:"));

  const items = await fs.readdir(brainPath);
  let projectFound = false;

  for (const item of items) {
    if (item === ".git") continue;
    const itemPath = path.join(brainPath, item);
    const stat = await fs.stat(itemPath);

    if (!stat.isDirectory()) continue;
    projectFound = true;

    // Count lines and find newest file
    let totalLines = 0;
    let newestTime = stat.mtime;

    const memoryFiles = await fs.readdir(itemPath);
    for (const mf of memoryFiles) {
      if (!mf.endsWith(".md")) continue;
      const mfPath = path.join(itemPath, mf);
      const mfStat = await fs.stat(mfPath);
      if (mfStat.mtime > newestTime) newestTime = mfStat.mtime;

      try {
        const content = await fs.readFile(mfPath, "utf8");
        totalLines += content.split(/\r?\n/).length;
      } catch (e) {
        // ignore JSON parse error
      }
    }

    // Check if current project is linked to this item
    let isLinkedHere = false;
    const localMemory = path.join(currentProjectDir, ".memory");
    try {
      const localStat = await fs.lstat(localMemory);
      if (localStat.isSymbolicLink()) {
        const linkTarget = await fs.realpath(localMemory);
        if (path.resolve(linkTarget) === path.resolve(itemPath)) {
          isLinkedHere = true;
        }
      }
    } catch (e) {
      // Not a symlink or doesn't exist
    }

    const icon = isLinkedHere ? chalk.green("🔗") : chalk.gray("📁");
    const freshness = relativeTime(newestTime);

    console.log(
      `  ${icon} ${chalk.bold(item.padEnd(20))} ${chalk.gray(`${totalLines} lines`.padStart(10))}   ${chalk.gray(`(updated ${freshness})`)}`,
    );
  }

  if (!projectFound) {
    console.log(chalk.gray("  No projects found in brain yet."));
  }

  console.log(chalk.gray("\n  Commands:"));
  console.log(chalk.gray("    agk brain sync     → Commit and sync to GitHub"));
  console.log(
    chalk.gray(
      "    agk brain link     → Link current directory to the brain\n",
    ),
  );

  return 0;
}

// --- Sync ---
async function sync(brainPath) {
  console.log(chalk.bold.cyan("\n🧠 AGK Brain Sync\n"));
  const spinner = ora("Syncing brain repository...").start();

  try {
    // git add .
    execSync("git add .", { cwd: brainPath, stdio: "ignore" });

    // git commit
    try {
      execSync('git commit -m "chore: auto-sync memory"', {
        cwd: brainPath,
        stdio: "ignore",
      });
      spinner.info("Committed new changes");
    } catch {
      // Nothing to commit
    }

    // git pull
    spinner.text = "Pulling from remote...";
    try {
      execSync("git pull --rebase origin main", {
        cwd: brainPath,
        stdio: "ignore",
      });
    } catch (e) {
      try {
        execSync("git pull --rebase origin master", {
          cwd: brainPath,
          stdio: "ignore",
        });
      } catch (err) {
        // Ignoring pull errors
      }
    }

    // git push
    spinner.text = "Pushing to remote...";
    execSync("git push origin HEAD", { cwd: brainPath, stdio: "ignore" });

    spinner.succeed(chalk.green("Brain synced successfully!"));
    console.log(chalk.gray(`  Time: ${new Date().toISOString()}\n`));
    return 0;
  } catch (err) {
    spinner.fail(chalk.red("Sync failed"));
    console.log(
      chalk.gray(
        `\n  Ensure remote is configured (cd ${brainPath} && git remote -v)`,
      ),
    );
    console.log(chalk.gray(`  Error: ${err.message}\n`));
    return 1;
  }
}

// --- Pull ---
async function pull(projectDir, existingBrainPath, remoteUrl) {
  console.log(chalk.bold.cyan("\n🧠 AGK Brain Pull\n"));
  const spinner = ora("Pulling brain repository...").start();

  try {
    if (existingBrainPath && (await fs.pathExists(existingBrainPath))) {
      // Brain repo exists locally — just git pull
      spinner.text = "Pulling latest changes...";
      try {
        execSync("git pull --rebase origin main", {
          cwd: existingBrainPath,
          stdio: "ignore",
        });
      } catch {
        try {
          execSync("git pull --rebase origin master", {
            cwd: existingBrainPath,
            stdio: "ignore",
          });
        } catch {
          // No remote yet, that's OK
        }
      }
      spinner.succeed(chalk.green("Brain updated!"));
    } else if (remoteUrl) {
      // No local brain — clone from remote URL
      const defaultPath = path.join(require("os").homedir(), "agk-brain");
      spinner.text = `Cloning brain to ${defaultPath}...`;
      execSync(`git clone ${remoteUrl} "${defaultPath}"`, { stdio: "ignore" });
      await setGlobalConfig({ brainPath: defaultPath });
      spinner.succeed(chalk.green(`Brain cloned to ${defaultPath}`));
    } else {
      spinner.fail(
        chalk.red("No brain configured and no remote URL provided."),
      );
      console.log(chalk.gray("\n  Usage: agk brain pull <git-remote-url>\n"));
      return 1;
    }

    // Re-link the current project if a project dir exists in the brain
    const config = await getGlobalConfig();
    const brainPath = config.brainPath;
    if (brainPath) {
      const projectName = path.basename(projectDir);
      const brainProjectDir = path.join(brainPath, projectName);
      const memoryDir = path.join(projectDir, ".memory");

      if (
        (await fs.pathExists(brainProjectDir)) &&
        !(await isLinked(memoryDir))
      ) {
        spinner.start("Re-linking .memory/ to brain...");
        // Remove existing .memory/ and create junction
        if (await fs.pathExists(memoryDir)) {
          await fs.remove(memoryDir);
        }
        if (process.platform === "win32") {
          execSync(`cmd /c mklink /J "${memoryDir}" "${brainProjectDir}"`, {
            stdio: "ignore",
          });
        } else {
          await fs.ensureSymlink(brainProjectDir, memoryDir);
        }
        spinner.succeed(chalk.green("Re-linked .memory/ → brain"));
      }
    }

    console.log();
    return 0;
  } catch (err) {
    spinner.fail(chalk.red("Pull failed"));
    console.log(chalk.gray(`  Error: ${err.message}\n`));
    return 1;
  }
}

async function isLinked(filepath) {
  try {
    const stat = await fs.lstat(filepath);
    return stat.isSymbolicLink() || stat.isDirectory();
  } catch {
    return false;
  }
}

module.exports = { run, isLinked };
