/* eslint-disable no-empty */
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("upath");
const { getGeneStorePath } = require("./installer");

async function detectBrokenPortals(projectPath) {
  const issues = [];
  const portals = [
    { name: ".gemini", path: path.join(projectPath, ".gemini") },
    { name: ".windsurf", path: path.join(projectPath, ".windsurf") },
  ];

  for (const portal of portals) {
    const exists = await fs.pathExists(portal.path);

    if (!exists) {
      issues.push({
        type: "MISSING_PORTAL",
        portal: portal.name,
        path: portal.path,
      });
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
      issues.push({
        type: "ACCESS_ERROR",
        portal: portal.name,
        path: portal.path,
        error: error.message,
      });
    }
  }

  return issues;
}

async function detectMissingFiles(projectPath) {
  const issues = [];
  const requiredFiles = [
    { name: "GEMINI.md", path: path.join(projectPath, "GEMINI.md") },
    {
      name: "PROJECT_CONTEXT.md",
      path: path.join(projectPath, ".kamiflow", "PROJECT_CONTEXT.md"),
    },
    {
      name: "ROADMAP.md",
      path: path.join(projectPath, ".kamiflow", "ROADMAP.md"),
    },
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

    const sourcePath = hasSubmodule
      ? path.join(submodulePath, issue.portal)
      : path.join(geneStorePath, issue.portal);

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

    const sourcePath = hasSubmodule
      ? path.join(submodulePath, issue.portal)
      : path.join(geneStorePath, issue.portal);

    if (!(await fs.pathExists(sourcePath))) {
      console.log(chalk.red(`[HEALER] ✗ Source not found: ${sourcePath}`));
      return false;
    }

    await fs.ensureDir(path.dirname(issue.path));

    const stats = await fs.stat(sourcePath);
    const type = stats.isDirectory() ? "junction" : "file";

    try {
      await fs.symlink(sourcePath, issue.path, type);
      console.log(
        chalk.green(`[HEALER] ✓ Portal restored via symlink: ${issue.portal}`),
      );
      return true;
    } catch (symlinkError) {
      if (symlinkError.code === "EPERM") {
        console.log(
          chalk.yellow("[HEALER] Symlink failed, using copy fallback..."),
        );
        await fs.copy(sourcePath, issue.path);
        console.log(
          chalk.green(`[HEALER] ✓ Portal restored via copy: ${issue.portal}`),
        );
        return true;
      }
      throw symlinkError;
    }
  } catch (error) {
    console.log(chalk.red(`[HEALER] ✗ Failed to restore: ${error.message}`));
    return false;
  }
}

async function restoreMissingFile(
  issue,
  geneStorePath,
  projectPath,
  projectName,
) {
  console.log(chalk.cyan(`[HEALER] Restoring missing file: ${issue.file}`));

  try {
    const submodulePath = path.join(projectPath, ".kami-flow");
    const hasSubmodule = await fs.pathExists(submodulePath);

    const templatesPath = hasSubmodule
      ? path.join(submodulePath, "docs", "templates")
      : path.join(geneStorePath, "docs", "templates");

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
      content = content.replace(
        /\[Project Name\]/g,
        projectName || "My Project",
      );
    }

    await fs.writeFile(issue.path, content, "utf8");
    console.log(chalk.green(`[HEALER] ✓ File restored: ${issue.file}`));
    return true;
  } catch (error) {
    console.log(chalk.red(`[HEALER] ✗ Failed to restore: ${error.message}`));
    return false;
  }
}

async function detectLegacyBackups(projectPath) {
  const issues = [];
  const glob = require("glob");
  const pattern = path.join(projectPath, ".gemini/commands/**/*.bak");

  try {
    const files = glob.sync(pattern);
    if (files.length > 0) {
      issues.push({ type: "LEGACY_BACKUPS", count: files.length, files });
    }
  } catch (e) {}

  return issues;
}

async function cleanupLegacyBackups(issue, projectPath) {
  console.log(
    chalk.cyan(`[HEALER] Cleaning up ${issue.count} legacy backup(s)...`),
  );
  const { backupFile } = require("../utils/fs-vault");

  let fixed = 0;
  for (const file of issue.files) {
    try {
      // The backupFile utility handles moving to .kamiflow/.backup/ and rotation
      // But we need to remove the original .bak file after 'backing it up' (migrating it)
      const success = await backupFile(file);
      if (success) {
        await fs.remove(file);
        fixed++;
      }
    } catch (e) {
      console.log(
        chalk.yellow(`   ⚠️  Failed to migrate: ${path.basename(file)}`),
      );
    }
  }
  return fixed === issue.count;
}

async function detectBrokenGraphPaths(projectPath) {
  const { WorkspaceIndex } = require("./workspace-index");
  const index = new WorkspaceIndex(projectPath);
  try {
    await index.initialize();
    const broken = await index.detectBrokenPaths();
    return broken.length > 0
      ? [{ type: "BROKEN_GRAPH_PATHS", count: broken.length, details: broken }]
      : [];
  } catch (e) {
    return [];
  } finally {
    index.close();
  }
}

async function repairGraphPaths(issue, projectPath) {
  const { WorkspaceIndex } = require("./workspace-index");
  const index = new WorkspaceIndex(projectPath);
  try {
    await index.initialize();
    const healed = await index.healPaths();
    return healed > 0;
  } catch (e) {
    return false;
  } finally {
    index.close();
  }
}

async function healProject(projectPath, options = {}) {
  console.log(chalk.cyan("\n🔧 KamiFlow Self-Healing Engine\n"));

  const inquirer = (await import("inquirer")).default;

  const geneStorePath = getGeneStorePath();

  if (!(await fs.pathExists(geneStorePath))) {
    console.log(chalk.yellow("[HEALER] Gene Store not found. Initializing..."));
    const { ensureGeneStore } = require("./installer");
    await ensureGeneStore();
  }

  console.log(chalk.gray("[HEALER] Scanning for issues...\n"));

  const portalIssues = await detectBrokenPortals(projectPath);
  const fileIssues = await detectMissingFiles(projectPath);
  const backupIssues = await detectLegacyBackups(projectPath);
  const graphIssues = await detectBrokenGraphPaths(projectPath);

  const allIssues = [
    ...portalIssues,
    ...fileIssues,
    ...backupIssues,
    ...graphIssues,
  ];

  if (allIssues.length === 0) {
    console.log(chalk.green("✓ No issues detected. Project is healthy!\n"));
    return { fixed: 0, failed: 0 };
  }

  console.log(chalk.yellow(`Found ${allIssues.length} issue(s):\n`));
  allIssues.forEach((issue, idx) => {
    console.log(
      chalk.yellow(
        `  ${idx + 1}. ${issue.type}: ${issue.portal || issue.file || issue.count + " files"}`,
      ),
    );
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
        success = await restoreMissingFile(
          issue,
          geneStorePath,
          projectPath,
          projectName,
        );
        break;
      case "LEGACY_BACKUPS":
        success = await cleanupLegacyBackups(issue, projectPath);
        break;
      case "BROKEN_GRAPH_PATHS":
        success = await repairGraphPaths(issue, projectPath);
        break;
      default:
        console.log(
          chalk.yellow(`[HEALER] Skipping unknown issue type: ${issue.type}`),
        );
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

