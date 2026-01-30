const chalk = require("chalk");
const fs = require("fs-extra");
const path = require('upath');
const inquirer = require("inquirer");
const { getGeneStorePath } = require("./installer");

async function detectBrokenPortals(projectPath) {
  const issues = [];
  const portals = [
    { name: ".gemini", path: path.join(projectPath, ".gemini") },
    { name: ".windsurf", path: path.join(projectPath, ".windsurf") },
    { name: "docs/protocols", path: path.join(projectPath, "docs", "protocols") },
    { name: "docs/overview.md", path: path.join(projectPath, "docs", "overview.md") },
  ];

  for (const portal of portals) {
    const exists = await fs.pathExists(portal.path);

    if (!exists) {
      issues.push({ type: "MISSING_PORTAL", portal: portal.name, path: portal.path });
      continue;
    }

    try {
      const stats = await fs.lstat(portal.path);
      if (stats.isSymbolicLink()) {
        const target = await fs.readlink(portal.path);
        const targetExists = await fs.pathExists(target);

        if (!targetExists) {
          issues.push({
            type: "BROKEN_SYMLINK",
            portal: portal.name,
            path: portal.path,
            target,
          });
        }
      }
    } catch (error) {
      issues.push({ type: "ACCESS_ERROR", portal: portal.name, path: portal.path, error: error.message });
    }
  }

  return issues;
}

async function detectMissingFiles(projectPath) {
  const issues = [];
  const requiredFiles = [
    { name: "GEMINI.md", path: path.join(projectPath, "GEMINI.md") },
    { name: "PROJECT_CONTEXT.md", path: path.join(projectPath, "PROJECT_CONTEXT.md") },
  ];

  for (const file of requiredFiles) {
    const exists = await fs.pathExists(file.path);
    if (!exists) {
      issues.push({ type: "MISSING_FILE", file: file.name, path: file.path });
    }
  }

  return issues;
}

async function repairBrokenSymlink(issue, geneStorePath, projectPath) {
  console.log(chalk.cyan(`[HEALER] Repairing broken symlink: ${issue.portal}`));

  try {
    await fs.remove(issue.path);

    const submodulePath = path.join(projectPath, ".kami-flow");
    const hasSubmodule = await fs.pathExists(submodulePath);

    const sourcePath = hasSubmodule ? path.join(submodulePath, issue.portal) : path.join(geneStorePath, issue.portal);

    if (!(await fs.pathExists(sourcePath))) {
      console.log(chalk.red(`[HEALER] ✗ Source not found: ${sourcePath}`));
      return false;
    }

    await fs.ensureDir(path.dirname(issue.path));

    const stats = await fs.stat(sourcePath);
    const type = stats.isDirectory() ? "junction" : "file";
    await fs.symlink(sourcePath, issue.path, type);

    console.log(chalk.green(`[HEALER] ✓ Symlink repaired: ${issue.portal}`));
    return true;
  } catch (error) {
    console.log(chalk.red(`[HEALER] ✗ Failed to repair: ${error.message}`));
    return false;
  }
}

async function restoreMissingPortal(issue, geneStorePath, projectPath) {
  console.log(chalk.cyan(`[HEALER] Restoring missing portal: ${issue.portal}`));

  try {
    const submodulePath = path.join(projectPath, ".kami-flow");
    const hasSubmodule = await fs.pathExists(submodulePath);

    const sourcePath = hasSubmodule ? path.join(submodulePath, issue.portal) : path.join(geneStorePath, issue.portal);

    if (!(await fs.pathExists(sourcePath))) {
      console.log(chalk.red(`[HEALER] ✗ Source not found: ${sourcePath}`));
      return false;
    }

    await fs.ensureDir(path.dirname(issue.path));

    const stats = await fs.stat(sourcePath);
    const type = stats.isDirectory() ? "junction" : "file";

    try {
      await fs.symlink(sourcePath, issue.path, type);
      console.log(chalk.green(`[HEALER] ✓ Portal restored via symlink: ${issue.portal}`));
      return true;
    } catch (symlinkError) {
      if (symlinkError.code === "EPERM") {
        console.log(chalk.yellow("[HEALER] Symlink failed, using copy fallback..."));
        await fs.copy(sourcePath, issue.path);
        console.log(chalk.green(`[HEALER] ✓ Portal restored via copy: ${issue.portal}`));
        return true;
      }
      throw symlinkError;
    }
  } catch (error) {
    console.log(chalk.red(`[HEALER] ✗ Failed to restore: ${error.message}`));
    return false;
  }
}

async function restoreMissingFile(issue, geneStorePath, projectPath, projectName) {
  console.log(chalk.cyan(`[HEALER] Restoring missing file: ${issue.file}`));

  try {
    const submodulePath = path.join(projectPath, ".kami-flow");
    const hasSubmodule = await fs.pathExists(submodulePath);

    const templatesPath = hasSubmodule ? path.join(submodulePath, "docs", "templates") : path.join(geneStorePath, "docs", "templates");

    let templateFile;
    if (issue.file === "GEMINI.md") {
      templateFile = path.join(templatesPath, "..", "..", "GEMINI.md");
    } else if (issue.file === "PROJECT_CONTEXT.md") {
      templateFile = path.join(templatesPath, "context.md");
    }

    if (!(await fs.pathExists(templateFile))) {
      console.log(chalk.red(`[HEALER] ✗ Template not found: ${templateFile}`));
      return false;
    }

    let content = await fs.readFile(templateFile, "utf8");

    if (issue.file === "PROJECT_CONTEXT.md") {
      content = content.replace(/\[Project Name\]/g, projectName || "My Project");
    }

    await fs.writeFile(issue.path, content, "utf8");
    console.log(chalk.green(`[HEALER] ✓ File restored: ${issue.file}`));
    return true;
  } catch (error) {
    console.log(chalk.red(`[HEALER] ✗ Failed to restore: ${error.message}`));
    return false;
  }
}

async function healProject(projectPath, options = {}) {
  console.log(chalk.cyan("\n🔧 KamiFlow Self-Healing Engine\n"));

  const geneStorePath = getGeneStorePath();

  if (!(await fs.pathExists(geneStorePath))) {
    console.log(chalk.yellow("[HEALER] Gene Store not found. Initializing..."));
    const { ensureGeneStore } = require("./installer");
    await ensureGeneStore();
  }

  console.log(chalk.gray("[HEALER] Scanning for issues...\n"));

  const portalIssues = await detectBrokenPortals(projectPath);
  const fileIssues = await detectMissingFiles(projectPath);

  const allIssues = [...portalIssues, ...fileIssues];

  if (allIssues.length === 0) {
    console.log(chalk.green("✓ No issues detected. Project is healthy!\n"));
    return { fixed: 0, failed: 0 };
  }

  console.log(chalk.yellow(`Found ${allIssues.length} issue(s):\n`));
  allIssues.forEach((issue, idx) => {
    console.log(chalk.yellow(`  ${idx + 1}. ${issue.type}: ${issue.portal || issue.file}`));
  });
  console.log();

  if (!options.autoFix) {
    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "fix",
        message: "Attempt to fix these issues automatically?",
        default: true,
      },
    ]);

    if (!confirm.fix) {
      console.log(chalk.gray("Healing cancelled.\n"));
      return { fixed: 0, failed: 0 };
    }
  }

  console.log(chalk.cyan("\n[HEALER] Starting repairs...\n"));

  let fixed = 0;
  let failed = 0;
  const projectName = path.basename(projectPath);

  for (const issue of allIssues) {
    let success = false;

    switch (issue.type) {
      case "BROKEN_SYMLINK":
        success = await repairBrokenSymlink(issue, geneStorePath, projectPath);
        break;
      case "MISSING_PORTAL":
        success = await restoreMissingPortal(issue, geneStorePath, projectPath);
        break;
      case "MISSING_FILE":
        success = await restoreMissingFile(issue, geneStorePath, projectPath, projectName);
        break;
      default:
        console.log(chalk.yellow(`[HEALER] Skipping unknown issue type: ${issue.type}`));
    }

    if (success) {
      fixed++;
    } else {
      failed++;
    }
  }

  console.log();
  console.log(chalk.cyan("─".repeat(50)));
  console.log(chalk.green(`\n✓ Fixed: ${fixed}`));
  if (failed > 0) {
    console.log(chalk.red(`✗ Failed: ${failed}`));
  }
  console.log();

  return { fixed, failed };
}

module.exports = { healProject, detectBrokenPortals, detectMissingFiles };
