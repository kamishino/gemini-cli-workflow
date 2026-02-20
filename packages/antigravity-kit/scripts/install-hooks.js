/**
 * Antigravity Kit - Install Git Hooks
 *
 * Installs pre-commit hook for memory auto-sync
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

async function run(projectDir = process.cwd()) {
  console.log(chalk.cyan("\n🪝 Installing Git Hooks...\n"));

  try {
    // Check if .git exists
    const gitDir = path.join(projectDir, ".git");
    if (!(await fs.pathExists(gitDir))) {
      console.error(
        chalk.red("❌ Not a git repository. Initialize git first.\n"),
      );
      return 1;
    }

    // Create .agent/hooks/ directory
    const agentHooksDir = path.join(projectDir, ".agent", "hooks");
    await fs.ensureDir(agentHooksDir);

    // Copy sync-memory.js to .agent/hooks/
    const templateDir = path.join(__dirname, "..", "templates", "hooks");
    const syncMemorySrc = path.join(templateDir, "sync-memory.js");
    const syncMemoryDest = path.join(agentHooksDir, "sync-memory.js");
    await fs.copy(syncMemorySrc, syncMemoryDest);
    console.log(chalk.gray("  ✓ Copied sync-memory.js to .agent/hooks/"));

    // Copy pre-commit hook template
    const preCommitTemplate = path.join(templateDir, "pre-commit");
    const gitHooksDir = path.join(gitDir, "hooks");
    const preCommitDest = path.join(gitHooksDir, "pre-commit");

    await fs.ensureDir(gitHooksDir);

    // Check if pre-commit already exists
    if (await fs.pathExists(preCommitDest)) {
      console.log(chalk.yellow("  ⚠  pre-commit hook already exists"));
      console.log(chalk.gray("     Add this line to your existing hook:"));
      console.log(
        chalk.cyan("     node .agent/hooks/sync-memory.js || exit 0\n"),
      );
    } else {
      await fs.copy(preCommitTemplate, preCommitDest);

      // Make executable (Unix-like systems)
      if (process.platform !== "win32") {
        await fs.chmod(preCommitDest, "755");
      }

      console.log(chalk.gray("  ✓ Installed pre-commit hook"));
    }

    console.log(chalk.green("\n✅ Git hooks installed successfully!"));
    console.log(
      chalk.gray("\nMemory auto-sync will now run on every commit.\n"),
    );

    return 0;
  } catch (error) {
    console.error(chalk.red(`\n❌ Installation failed: ${error.message}\n`));
    return 1;
  }
}

module.exports = { run };

// Run if called directly
if (require.main === module) {
  run().then((code) => process.exit(code));
}
