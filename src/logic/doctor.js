const chalk = require("chalk");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

/**
 * Check if a command exists in PATH
 */
function commandExists(command) {
  try {
    const cmd = os.platform() === "win32" ? "where" : "which";
    execSync(`${cmd} ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get version of a command
 */
function getCommandVersion(command) {
  try {
    const output = execSync(`${command} --version`, { encoding: "utf8", stdio: "pipe" });
    return output.trim().split("\n")[0];
  } catch {
    return null;
  }
}

/**
 * Check Node.js version
 */
function checkNode() {
  const version = process.version;
  const major = parseInt(version.slice(1).split(".")[0]);

  console.log(chalk.gray("Node.js:"), version);

  if (major >= 16) {
    console.log(chalk.green("  ✓ Node.js version is compatible"));
    return true;
  } else {
    console.log(chalk.red("  ✗ Node.js 16+ required"));
    return false;
  }
}

/**
 * Check Gemini CLI
 */
function checkGeminiCLI() {
  if (commandExists("gemini")) {
    const version = getCommandVersion("gemini");
    console.log(chalk.gray("Gemini CLI:"), version || "installed");
    console.log(chalk.green("  ✓ Gemini CLI found"));
    return true;
  } else {
    console.log(chalk.gray("Gemini CLI:"), "not found");
    console.log(chalk.red("  ✗ Gemini CLI not installed"));
    console.log(chalk.yellow("  → Install: npm install -g @google/gemini-cli"));
    return false;
  }
}

/**
 * Check Git
 */
function checkGit() {
  if (commandExists("git")) {
    const version = getCommandVersion("git");
    console.log(chalk.gray("Git:"), version || "installed");
    console.log(chalk.green("  ✓ Git found"));
    return true;
  } else {
    console.log(chalk.gray("Git:"), "not found");
    console.log(chalk.red("  ✗ Git not installed"));
    console.log(chalk.yellow("  → Install: https://git-scm.com/download/win"));
    return false;
  }
}

/**
 * Check symlink capability
 */
async function checkSymlinkCapability() {
  const testDir = path.join(os.tmpdir(), "kami-symlink-test");
  const testSource = path.join(testDir, "source");
  const testTarget = path.join(testDir, "target");

  try {
    // Create test directory and source
    await fs.ensureDir(testDir);
    await fs.ensureDir(testSource);

    // Try creating symlink
    await fs.symlink(testSource, testTarget, "junction");

    // Verify it works
    const stats = await fs.lstat(testTarget);
    const isSymlink = stats.isSymbolicLink();

    // Cleanup
    await fs.remove(testDir);

    if (isSymlink) {
      console.log(chalk.gray("Symlink Support:"), "enabled");
      console.log(chalk.green("  ✓ Can create symbolic links"));
      return true;
    } else {
      console.log(chalk.gray("Symlink Support:"), "limited");
      console.log(chalk.yellow("  ⚠️  Symlinks may not work correctly"));
      return false;
    }
  } catch (error) {
    await fs.remove(testDir).catch(() => {});

    console.log(chalk.gray("Symlink Support:"), "disabled");
    console.log(chalk.yellow("  ⚠️  Cannot create symbolic links"));
    console.log(chalk.yellow("  → Enable Developer Mode in Windows Settings"));
    console.log(chalk.yellow("  → Or run as Administrator"));
    console.log(chalk.yellow("  → Fallback: Use STANDALONE mode"));
    return false;
  }
}

/**
 * Check current directory for KamiFlow portals
 */
async function checkCurrentProject() {
  const cwd = process.cwd();
  const geminiPath = path.join(cwd, ".gemini");
  const windsurfPath = path.join(cwd, ".windsurf");
  const contextPath = path.join(cwd, "PROJECT_CONTEXT.md");

  console.log(chalk.gray("Current Directory:"), cwd);

  const hasGemini = await fs.pathExists(geminiPath);
  const hasWindsurf = await fs.pathExists(windsurfPath);
  const hasContext = await fs.pathExists(contextPath);

  if (hasGemini && hasWindsurf) {
    console.log(chalk.green("  ✓ KamiFlow portals detected"));

    // Check if symlink
    try {
      const stats = await fs.lstat(geminiPath);
      if (stats.isSymbolicLink()) {
        const target = await fs.readlink(geminiPath);
        console.log(chalk.gray("  → Mode: LINKED"));
        console.log(chalk.gray("  → Target:"), target);
      } else {
        console.log(chalk.gray("  → Mode: STANDALONE"));
      }
    } catch {
      console.log(chalk.gray("  → Mode: STANDALONE"));
    }

    if (hasContext) {
      console.log(chalk.green("  ✓ PROJECT_CONTEXT.md found"));
    }

    return true;
  } else {
    console.log(chalk.yellow("  ⚠️  No KamiFlow portals found"));
    console.log(chalk.yellow("  → Run: gemini-cli-kamiflow init"));
    return false;
  }
}

/**
 * Run all health checks
 */
async function runDoctor() {
  console.log(chalk.cyan("Running system health checks...\n"));

  const results = {
    node: checkNode(),
    gemini: checkGeminiCLI(),
    git: checkGit(),
    symlink: await checkSymlinkCapability(),
    project: await checkCurrentProject(),
  };

  console.log();
  console.log(chalk.cyan("─".repeat(50)));

  const allHealthy = results.node && results.gemini && results.git;
  results.allHealthy = allHealthy;

  if (!allHealthy) {
    console.log(chalk.red("\n⚠️  Some dependencies are missing"));
    console.log(chalk.yellow("Please install missing components and run doctor again\n"));
  }

  if (!results.symlink) {
    console.log(chalk.yellow("\n💡 Tip: Symlink support is optional"));
    console.log(chalk.yellow("   You can still use STANDALONE mode\n"));
  }

  return results;
}

module.exports = { runDoctor };
