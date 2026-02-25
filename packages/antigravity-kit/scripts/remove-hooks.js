/**
 * Antigravity Kit - Remove Git Hooks
 *
 * Removes the AGK pre-commit hook and .agent/hooks/sync-memory.cjs
 * Only removes hooks that were installed by AGK (checks for AGK_HOOK_MARKER).
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

const AGK_MARKER = "AGK_HOOK_MARKER";

async function run(projectDir = process.cwd()) {
  console.log(chalk.cyan("\n🪝 Removing Git Hooks...\n"));

  let removed = 0;

  try {
    // 1. Remove pre-commit hook (only if AGK-owned)
    const gitDir = path.join(projectDir, ".git");
    const preCommitPath = path.join(gitDir, "hooks", "pre-commit");

    if (await fs.pathExists(preCommitPath)) {
      const content = await fs.readFile(preCommitPath, "utf8");
      if (content.includes(AGK_MARKER)) {
        await fs.remove(preCommitPath);
        console.log(chalk.gray("  ✓ Removed .git/hooks/pre-commit"));
        removed++;
      } else {
        console.log(
          chalk.yellow(
            "  ⚠  pre-commit hook was NOT installed by AGK — skipping",
          ),
        );
        console.log(chalk.gray("     (Remove manually if needed)"));
      }
    } else {
      console.log(chalk.gray("  ℹ  No pre-commit hook found"));
    }

    // 2. Remove .agent/hooks/sync-memory.cjs (and .js legacy)
    const agentHooksDir = path.join(projectDir, ".agent", "hooks");
    const cjsHook = path.join(agentHooksDir, "sync-memory.cjs");
    const jsHook = path.join(agentHooksDir, "sync-memory.js");

    if (await fs.pathExists(cjsHook)) {
      await fs.remove(cjsHook);
      console.log(chalk.gray("  ✓ Removed .agent/hooks/sync-memory.cjs"));
      removed++;
    }
    if (await fs.pathExists(jsHook)) {
      await fs.remove(jsHook);
      console.log(
        chalk.gray("  ✓ Removed .agent/hooks/sync-memory.js (legacy)"),
      );
      removed++;
    }

    // 3. Remove .agent/hooks/ dir if empty
    if (await fs.pathExists(agentHooksDir)) {
      const remaining = await fs.readdir(agentHooksDir);
      if (remaining.length === 0) {
        await fs.remove(agentHooksDir);
        console.log(chalk.gray("  ✓ Removed empty .agent/hooks/ directory"));
      }
    }

    if (removed > 0) {
      console.log(
        chalk.green(
          `\n✅ AGK Git hooks removed (${removed} file${removed > 1 ? "s" : ""}).\n`,
        ),
      );
    } else {
      console.log(chalk.yellow("\n⚠  No AGK hooks were found to remove.\n"));
    }

    return 0;
  } catch (error) {
    console.error(chalk.red(`\n❌ Removal failed: ${error.message}\n`));
    return 1;
  }
}

module.exports = { run };

if (require.main === module) {
  run().then((code) => process.exit(code));
}
