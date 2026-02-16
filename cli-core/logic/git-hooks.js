const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("upath");
const logger = require("../utils/logger");

/**
 * Git Hooks Manager
 * Install, remove, and manage git hooks for KamiFlow projects.
 */

const KAMIFLOW_MARKER = "# KamiFlow Hook";

const HOOK_TEMPLATES = {
  "pre-commit": `#!/bin/sh
${KAMIFLOW_MARKER} - pre-commit
# Auto-installed by: kamiflow hooks install
# Runs doctor check before each commit.

echo "🌊 KamiFlow: Running pre-commit checks..."

# Run doctor (non-interactive)
kamiflow doctor 2>/dev/null
RESULT=$?

if [ $RESULT -ne 0 ]; then
    echo "❌ KamiFlow doctor found issues. Fix them before committing."
    echo "   Run 'kamiflow doctor --fix' to auto-fix."
    exit 1
fi

echo "✅ KamiFlow: All checks passed."
exit 0
`,
  "commit-msg":
    [
      "#!/bin/sh",
      KAMIFLOW_MARKER + " - commit-msg",
      "# Auto-installed by: kamiflow hooks install",
      "# Validates commit message format.",
      "",
      'MSG_FILE="$1"',
      'MSG=$(cat "$MSG_FILE")',
      "",
      "# Check minimum length",
      'MSG_LEN=$(echo "$MSG" | wc -c)',
      'if [ "$MSG_LEN" -lt 10 ]; then',
      '    echo "❌ Commit message too short (min 10 chars)."',
      "    exit 1",
      "fi",
      "",
      "exit 0",
    ].join("\n") + "\n",
};

/**
 * Find the .git/hooks directory
 * @param {string} projectRoot - Project root path
 * @returns {string|null} Path to hooks directory
 */
async function findHooksDir(projectRoot) {
  const gitDir = path.join(projectRoot, ".git");
  if (!(await fs.pathExists(gitDir))) {
    return null;
  }
  const hooksDir = path.join(gitDir, "hooks");
  await fs.ensureDir(hooksDir);
  return hooksDir;
}

/**
 * Check if a hook is a KamiFlow-managed hook
 */
async function isKamiflowHook(hookPath) {
  if (!(await fs.pathExists(hookPath))) return false;
  const content = await fs.readFile(hookPath, "utf8");
  return content.includes(KAMIFLOW_MARKER);
}

/**
 * Install git hooks
 * @param {string} projectRoot - Project root path
 * @param {object} options - Install options
 */
async function installHooks(projectRoot, options = {}) {
  const hooksDir = await findHooksDir(projectRoot);
  if (!hooksDir) {
    logger.error("Not a git repository. Run 'git init' first.");
    return false;
  }

  const hookNames = options.hooks
    ? options.hooks.split(",").map((h) => h.trim())
    : Object.keys(HOOK_TEMPLATES);

  const reporter = logger.createReporter("Git Hooks Installation");

  for (const hookName of hookNames) {
    const template = HOOK_TEMPLATES[hookName];
    if (!template) {
      reporter.push(hookName, "ERROR", `Unknown hook type: ${hookName}`);
      continue;
    }

    const hookPath = path.join(hooksDir, hookName);

    // Check for existing non-KamiFlow hooks
    if (await fs.pathExists(hookPath)) {
      if (!(await isKamiflowHook(hookPath))) {
        if (!options.force) {
          reporter.push(
            hookName,
            "ERROR",
            "Existing hook found. Use --force to overwrite.",
          );
          continue;
        }
        // Backup existing hook
        const backupPath = hookPath + ".bak";
        await fs.copy(hookPath, backupPath);
        logger.hint(`Backed up existing ${hookName} → ${hookName}.bak`);
      }
    }

    await fs.writeFile(hookPath, template, { mode: 0o755 });
    reporter.push(hookName, "SUCCESS", hookPath);
  }

  reporter.print();
  return true;
}

/**
 * Remove KamiFlow git hooks
 * @param {string} projectRoot - Project root path
 */
async function removeHooks(projectRoot) {
  const hooksDir = await findHooksDir(projectRoot);
  if (!hooksDir) {
    logger.error("Not a git repository.");
    return false;
  }

  const reporter = logger.createReporter("Git Hooks Removal");

  for (const hookName of Object.keys(HOOK_TEMPLATES)) {
    const hookPath = path.join(hooksDir, hookName);

    if (await isKamiflowHook(hookPath)) {
      await fs.remove(hookPath);

      // Restore backup if exists
      const backupPath = hookPath + ".bak";
      if (await fs.pathExists(backupPath)) {
        await fs.move(backupPath, hookPath);
        reporter.push(hookName, "SUCCESS", "Removed (backup restored)");
      } else {
        reporter.push(hookName, "SUCCESS", "Removed");
      }
    } else if (await fs.pathExists(hookPath)) {
      reporter.push(hookName, "ERROR", "Not a KamiFlow hook, skipped");
    }
  }

  reporter.print();
  return true;
}

/**
 * Show status of git hooks
 * @param {string} projectRoot - Project root path
 */
async function statusHooks(projectRoot) {
  const hooksDir = await findHooksDir(projectRoot);
  if (!hooksDir) {
    logger.error("Not a git repository.");
    return;
  }

  console.log();
  logger.header("Git Hooks Status");

  for (const hookName of Object.keys(HOOK_TEMPLATES)) {
    const hookPath = path.join(hooksDir, hookName);
    const exists = await fs.pathExists(hookPath);
    const isKami = exists ? await isKamiflowHook(hookPath) : false;

    let status;
    if (isKami) {
      status = chalk.green("✓ Installed (KamiFlow)");
    } else if (exists) {
      status = chalk.yellow("⚠ Exists (custom)");
    } else {
      status = chalk.gray("✗ Not installed");
    }

    console.log(chalk.gray(`  ${hookName}:`) + `  ${status}`);
  }

  console.log(
    chalk.gray("\n  Install: ") + chalk.yellow("kamiflow hooks install") + "\n",
  );
}

module.exports = {
  installHooks,
  removeHooks,
  statusHooks,
  HOOK_TEMPLATES,
  KAMIFLOW_MARKER,
};
