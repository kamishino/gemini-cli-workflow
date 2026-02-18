/**
 * agk status — Quick project summary
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { version, name } = require("../package.json");

async function run(projectDir) {
  // Detect dogfooding
  const isDogfooding = await detectDogfooding(projectDir);
  const projectName = path.basename(projectDir);

  // Header
  console.log();
  console.log(`📦 ${chalk.bold(name)} ${chalk.gray("v" + version)}`);
  console.log(
    `📁 Project: ${chalk.bold(projectName)}` +
      (isDogfooding ? chalk.magenta("  🐕 dogfooding") : ""),
  );
  console.log();

  // Gather all stats in parallel
  const [workflows, memory, guardRails, hooksInstalled, lastMemoryUpdate] =
    await Promise.all([
      countWorkflows(projectDir),
      countMemoryFiles(projectDir),
      countGuardRails(projectDir),
      checkHooksInstalled(projectDir),
      getLastMemoryUpdate(projectDir),
    ]);

  // Print status table
  printRow(
    "Workflows",
    workflows.count > 0 ? `${workflows.count} installed` : "none",
    workflows.count > 0,
  );
  printRow(
    "Memory",
    memory.total > 0
      ? `${memory.found}/${memory.total} files`
      : "not initialized",
    memory.found === memory.total && memory.total > 0,
  );
  printRow(
    "Guard Rails",
    guardRails.count > 0
      ? `${guardRails.count} rules in ${guardRails.location}`
      : "not configured",
    guardRails.count > 0,
  );
  printRow(
    "Git Hooks",
    hooksInstalled ? "installed" : "not installed",
    hooksInstalled,
  );

  console.log();

  if (lastMemoryUpdate) {
    console.log(chalk.gray(`Last memory update: ${lastMemoryUpdate}`));
  }

  console.log();
  return 0;
}

function printRow(label, value, ok) {
  const icon = ok ? chalk.green("✅") : chalk.yellow("⚠️ ");
  const paddedLabel = label.padEnd(13);
  console.log(`  ${icon}  ${chalk.bold(paddedLabel)} ${chalk.gray(value)}`);
}

async function countWorkflows(projectDir) {
  const dir = path.join(projectDir, ".agent", "workflows");
  try {
    if (!(await fs.pathExists(dir))) return { count: 0 };
    const files = await fs.readdir(dir);
    return { count: files.filter((f) => f.endsWith(".md")).length };
  } catch {
    return { count: 0 };
  }
}

async function countMemoryFiles(projectDir) {
  const dir = path.join(projectDir, ".memory");
  const expected = [
    "context.md",
    "patterns.md",
    "decisions.md",
    "anti-patterns.md",
  ];
  try {
    if (!(await fs.pathExists(dir))) return { found: 0, total: 4 };
    const files = await fs.readdir(dir);
    return {
      found: expected.filter((f) => files.includes(f)).length,
      total: 4,
    };
  } catch {
    return { found: 0, total: 4 };
  }
}

async function countGuardRails(projectDir) {
  const candidates = [
    { dir: path.join(projectDir, ".agent", "rules"), label: ".agent/rules" },
    { dir: path.join(projectDir, ".gemini", "rules"), label: ".gemini/rules" },
  ];
  try {
    for (const c of candidates) {
      if (await fs.pathExists(c.dir)) {
        const files = await fs.readdir(c.dir);
        return {
          count: files.filter((f) => f.endsWith(".md")).length,
          location: c.label,
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { count: 0, location: null };
}

async function checkHooksInstalled(projectDir) {
  const hookPath = path.join(projectDir, ".git", "hooks", "pre-commit");
  try {
    if (!(await fs.pathExists(hookPath))) return false;
    const content = await fs.readFile(hookPath, "utf8");
    return content.includes("sync-memory");
  } catch {
    return false;
  }
}

async function getLastMemoryUpdate(projectDir) {
  const decisionsPath = path.join(projectDir, ".memory", "decisions.md");
  try {
    if (!(await fs.pathExists(decisionsPath))) return null;
    const stat = await fs.stat(decisionsPath);
    return stat.mtime.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

async function detectDogfooding(projectDir) {
  try {
    const pkgPath = path.join(
      projectDir,
      "packages",
      "antigravity-kit",
      "package.json",
    );
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      return (
        pkg.name === "@kamishino/antigravity-kit" ||
        pkg.name === "antigravity-kit"
      );
    }
    const localPkg = path.join(projectDir, "package.json");
    if (await fs.pathExists(localPkg)) {
      const pkg = await fs.readJson(localPkg);
      return (
        pkg.name === "@kamishino/antigravity-kit" ||
        pkg.name === "antigravity-kit"
      );
    }
  } catch {
    /* ignore */
  }
  return false;
}

module.exports = { run };
