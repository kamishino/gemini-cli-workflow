const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const { execa } = require("execa");

const KAMIFLOW_REPO = "https://github.com/kamishino/gemini-cli-workflow.git";

async function detectProjectMode(projectPath) {
  const kamiFlowPath = path.join(projectPath, ".kami-flow");
  const geminiPath = path.join(projectPath, ".gemini");

  const hasKamiFlow = await fs.pathExists(kamiFlowPath);
  const hasGemini = await fs.pathExists(geminiPath);

  if (hasKamiFlow) {
    try {
      const gitModulesPath = path.join(projectPath, ".gitmodules");
      if (await fs.pathExists(gitModulesPath)) {
        const content = await fs.readFile(gitModulesPath, "utf8");
        if (content.includes(".kami-flow")) {
          return "SUBMODULE";
        }
      }
    } catch (error) {
      console.log(chalk.yellow("[UPDATER] Warning: Could not verify submodule status"));
    }
  }

  if (hasGemini) {
    try {
      const stats = await fs.lstat(geminiPath);
      if (stats.isSymbolicLink()) {
        return "LINKED";
      }
      return "STANDALONE";
    } catch (error) {
      return "STANDALONE";
    }
  }

  return "NONE";
}

async function updateSubmodule(projectPath) {
  console.log(chalk.cyan("[UPDATER] Updating KamiFlow submodule...\n"));

  try {
    const submodulePath = ".kami-flow";

    console.log(chalk.gray("[UPDATER] Running: git submodule update --remote --merge"));
    await execa("git", ["submodule", "update", "--remote", "--merge", submodulePath], {
      cwd: projectPath,
      stdio: "inherit",
    });

    console.log(chalk.green("\n[UPDATER] ✓ Submodule updated successfully"));
    return true;
  } catch (error) {
    console.log(chalk.red(`\n[UPDATER] ✗ Submodule update failed: ${error.message}`));
    return false;
  }
}

async function updateLinkedMode(projectPath) {
  console.log(chalk.cyan("[UPDATER] Updating globally installed KamiFlow...\n"));

  try {
    const cliRoot = path.resolve(__dirname, "../../");
    
    console.log(chalk.gray("[UPDATER] Pulling latest changes..."));
    await execa("git", ["pull"], { cwd: cliRoot, stdio: "inherit" });

    console.log(chalk.gray("[UPDATER] Installing dependencies..."));
    await execa("npm", ["install"], { cwd: cliRoot, stdio: "inherit" });

    console.log(chalk.yellow("[UPDATER] Building distribution artifacts..."));
    await execa("npm", ["run", "build"], { cwd: cliRoot, stdio: "inherit" });

    console.log(chalk.green("\n[UPDATER] ✓ Global package updated and built successfully"));
    return true;
  } catch (error) {
    console.log(chalk.red(`\n[UPDATER] ✗ Update failed: ${error.message}`));
    return false;
  }
}

async function checkModeConflicts(projectPath) {
  const kamiFlowPath = path.join(projectPath, ".kami-flow");
  const geminiPath = path.join(projectPath, ".gemini");

  const hasKamiFlow = await fs.pathExists(kamiFlowPath);
  const hasGemini = await fs.pathExists(geminiPath);

  if (!hasGemini) {
    return { hasConflict: false };
  }

  try {
    const stats = await fs.lstat(geminiPath);
    const isSymlink = stats.isSymbolicLink();

    if (hasKamiFlow && isSymlink) {
      const target = await fs.readlink(geminiPath);
      const normalizedTarget = path.normalize(target);

      if (normalizedTarget.includes(".kami-flow")) {
        return { hasConflict: false };
      }

      return {
        hasConflict: true,
        message: "Mixed mode detected: .kami-flow exists but .gemini links elsewhere",
      };
    }

    if (hasKamiFlow && !isSymlink) {
      return {
        hasConflict: true,
        message: "Mode conflict: Both .kami-flow (SUBMODULE) and standalone .gemini exist",
      };
    }

    return { hasConflict: false };
  } catch (error) {
    return { hasConflict: false };
  }
}

async function runUpdate(projectPath, options = {}) {
  console.log(chalk.cyan("\n========================================================"));
  console.log(chalk.cyan("  🔄 KamiFlow Update Manager"));
  console.log(chalk.cyan("========================================================\n"));

  console.log(chalk.gray("[UPDATER] Project path:"), projectPath);
  console.log();

  const conflictCheck = await checkModeConflicts(projectPath);
  if (conflictCheck.hasConflict) {
    console.log(chalk.red("❌ Mode Conflict Detected\n"));
    console.log(chalk.yellow(conflictCheck.message));
    console.log(chalk.gray("\nPlease resolve this manually by choosing one mode:"));
    console.log(chalk.gray("  - SUBMODULE: Keep .kami-flow, link .gemini to it"));
    console.log(chalk.gray("  - STANDALONE: Remove .kami-flow, keep standalone .gemini"));
    return { success: false, mode: "CONFLICT" };
  }

  const mode = await detectProjectMode(projectPath);
  console.log(chalk.cyan("[UPDATER] Detected mode:"), chalk.white(mode));
  console.log();

  let success = false;

  switch (mode) {
    case "SUBMODULE":
      success = await updateSubmodule(projectPath);
      break;

    case "LINKED":
      success = await updateLinkedMode(projectPath);
      break;

    case "STANDALONE":
      console.log(chalk.yellow("[UPDATER] Standalone mode detected"));
      console.log(chalk.gray("[UPDATER] Standalone projects must be updated manually:"));
      console.log(chalk.gray("  1. Delete .gemini and .windsurf folders"));
      console.log(chalk.gray("  2. Run: kami init --mode standalone"));
      console.log(chalk.gray("\nOr convert to SUBMODULE mode for automatic updates."));
      return { success: false, mode };

    case "NONE":
      console.log(chalk.yellow("[UPDATER] No KamiFlow installation detected"));
      console.log(chalk.gray("[UPDATER] Run 'kami init' to set up KamiFlow"));
      return { success: false, mode };

    default:
      console.log(chalk.red("[UPDATER] Unknown mode"));
      return { success: false, mode };
  }

  if (success) {
    console.log();
    console.log(chalk.green("✅ Update complete!\n"));
  } else {
    console.log();
    console.log(chalk.red("❌ Update failed. See errors above.\n"));
  }

  return { success, mode };
}

module.exports = {
  runUpdate,
  detectProjectMode,
  updateSubmodule,
  updateLinkedMode,
  checkModeConflicts,
};
