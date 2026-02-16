/**
 * Antigravity Kit - Memory Auto-sync
 *
 * Detects significant changes and prompts to update .memory/ files
 * Designed to run as a git pre-commit hook
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Significant file extensions that trigger memory updates
 */
const SIGNIFICANT_EXTENSIONS = [
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".py",
  ".java",
  ".go",
  ".rs",
  ".c",
  ".cpp",
  ".h",
  ".cs",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".md",
];

/**
 * Directories to monitor for changes
 */
const MONITORED_DIRS = [
  "src",
  "lib",
  "packages",
  "components",
  "services",
  "utils",
  "core",
  "api",
];

/**
 * Run memory sync
 */
async function run(projectDir) {
  try {
    // Check if .memory/ exists
    const memoryDir = path.join(projectDir, ".memory");
    const hasMemory = await fs.pathExists(memoryDir);

    if (!hasMemory) {
      // Memory system not enabled, skip silently
      return 0;
    }

    // Get staged files
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    const { stdout: stagedFiles } = await execAsync(
      "git diff --cached --name-only",
      { cwd: projectDir },
    );
    const files = stagedFiles.trim().split("\n").filter(Boolean);

    if (files.length === 0) {
      return 0; // No staged files
    }

    // Analyze changes
    const significantChanges = analyzeChanges(files);

    if (significantChanges.length === 0) {
      return 0; // No significant changes
    }

    // Display detected changes
    console.log(chalk.cyan("\n🧠 Memory Auto-sync\n"));
    console.log(chalk.gray("Detected significant changes:\n"));

    const additions = significantChanges.filter((c) => c.type === "added");
    const modifications = significantChanges.filter(
      (c) => c.type === "modified",
    );
    const deletions = significantChanges.filter((c) => c.type === "deleted");

    if (additions.length > 0) {
      console.log(chalk.green("  Added:"));
      additions.forEach((c) => console.log(chalk.gray(`    + ${c.file}`)));
    }
    if (modifications.length > 0) {
      console.log(chalk.yellow("\n  Modified:"));
      modifications.forEach((c) => console.log(chalk.gray(`    ~ ${c.file}`)));
    }
    if (deletions.length > 0) {
      console.log(chalk.red("\n  Deleted:"));
      deletions.forEach((c) => console.log(chalk.gray(`    - ${c.file}`)));
    }

    // Generate suggestions
    const suggestion = generateSuggestion(significantChanges);

    if (suggestion) {
      console.log(chalk.cyan("\n💡 Suggested context update:"));
      console.log(chalk.gray(`  "${suggestion}"\n`));
    }

    // Prompt for update (if interactive)
    if (process.stdout.isTTY) {
      const inquirer = require("inquirer");
      const { updateMemory } = await inquirer.prompt([
        {
          type: "confirm",
          name: "updateMemory",
          message: "Update .memory/decisions.md with this change?",
          default: true,
        },
      ]);

      if (updateMemory) {
        await appendToDecisions(
          memoryDir,
          suggestion || "Committed changes",
          significantChanges,
        );
        console.log(chalk.green("\n✅ Memory updated!\n"));

        // Stage the updated memory file
        await execAsync("git add .memory/decisions.md", { cwd: projectDir });
      }
    }

    return 0;
  } catch (error) {
    console.error(chalk.yellow(`\n⚠️  Memory sync failed: ${error.message}`));
    // Don't block commits on memory sync failures
    return 0;
  }
}

/**
 * Analyze changes to determine significance
 */
function analyzeChanges(files) {
  const changes = [];

  for (const file of files) {
    const ext = path.extname(file);
    const dir = file.split("/")[0] || file.split("\\")[0];

    // Check if file is significant
    if (SIGNIFICANT_EXTENSIONS.includes(ext) || MONITORED_DIRS.includes(dir)) {
      // Determine change type (simplified - would need git status in real impl)
      changes.push({
        file,
        type: "modified", // Simplified - would detect added/deleted/modified
        ext,
        dir,
      });
    }
  }

  return changes;
}

/**
 * Generate contextual suggestion
 */
function generateSuggestion(changes) {
  if (changes.length === 0) return null;

  const additions = changes.filter((c) => c.type === "added");
  const modifications = changes.filter((c) => c.type === "modified");
  const deletions = changes.filter((c) => c.type === "deleted");

  const parts = [];

  if (additions.length > 0) {
    const fileList = additions.map((c) => path.basename(c.file)).join(", ");
    parts.push(`Added ${fileList}`);
  }

  if (modifications.length > 0) {
    const fileList = modifications.map((c) => path.basename(c.file)).join(", ");
    parts.push(`Modified ${fileList}`);
  }

  if (deletions.length > 0) {
    const fileList = deletions.map((c) => path.basename(c.file)).join(", ");
    parts.push(`Removed ${fileList}`);
  }

  return parts.join("; ");
}

/**
 * Append entry to decisions.md
 */
async function appendToDecisions(memoryDir, description, changes) {
  const decisionsPath = path.join(memoryDir, "decisions.md");
  const timestamp = new Date().toISOString().split("T")[0];

  const entry = `\n## ${timestamp} - ${description}\n\n`;
  const changesList = changes.map((c) => `- ${c.file}`).join("\n");

  await fs.appendFile(decisionsPath, entry + changesList + "\n");
}

module.exports = { run };

// Run if called directly
if (require.main === module) {
  run(process.cwd())
    .then((code) => process.exit(code))
    .catch((error) => {
      console.error("Failed:", error.message);
      process.exit(0); // Don't block commits
    });
}
