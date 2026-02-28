/**
 * agk info — Show package install details
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { name, version } = require("../package.json");

async function run(projectDir) {
  console.log(chalk.bold.cyan("\nℹ️  AGK Info\n"));

  // Package location
  const pkgDir = path.resolve(__dirname, "..");
  const isLinked = await detectNpmLink(pkgDir);

  // Node version
  const nodeVersion = process.version;

  // SSOT rules location
  const geminiRules = path.join(projectDir, ".gemini", "rules");
  const agentRules = path.join(projectDir, ".agent", "rules");
  let rulesInfo = chalk.gray("not found");
  if (await fs.pathExists(geminiRules)) {
    const files = await fs.readdir(geminiRules);
    const count = files.filter((f) => f.endsWith(".md")).length;
    rulesInfo = `${chalk.green(".gemini/rules/")} ${chalk.gray(`(${count} rules — SSOT)`)}`;
  } else if (await fs.pathExists(agentRules)) {
    const files = await fs.readdir(agentRules);
    const count = files.filter((f) => f.endsWith(".md")).length;
    rulesInfo = `${chalk.yellow(".agent/rules/")} ${chalk.gray(`(${count} rules)`)}`;
  }

  // Workflows
  const workflowsDir = path.join(projectDir, ".agent", "workflows");
  let workflowsInfo = chalk.gray("not found");
  if (await fs.pathExists(workflowsDir)) {
    const files = await fs.readdir(workflowsDir);
    const count = files.filter((f) => f.endsWith(".md")).length;
    workflowsInfo = chalk.green(`${count} workflows`);
  }

  // OpenCode commands
  const opencodeDir = path.join(projectDir, ".opencode", "commands");
  let opencodeInfo = chalk.gray("not found");
  if (await fs.pathExists(opencodeDir)) {
    const files = await fs.readdir(opencodeDir);
    const count = files.filter((f) => f.endsWith(".md")).length;
    opencodeInfo = chalk.green(`${count} commands`);
  }

  // Print table
  printRow("Package", `${name}`);
  printRow("Version", `v${version}`);
  printRow("Location", chalk.gray(pkgDir));
  printRow(
    "Linked",
    isLinked ? chalk.green("yes (npm link)") : chalk.gray("no (installed)"),
  );
  printRow("Node", chalk.gray(nodeVersion));
  printRow("SSOT", rulesInfo);
  printRow("Workflows", workflowsInfo);
  printRow("OpenCode", opencodeInfo);

  console.log();
  return 0;
}

function printRow(label, value) {
  const padded = label.padEnd(10);
  console.log(`  ${chalk.bold(padded)}  ${value}`);
}

async function detectNpmLink(pkgDir) {
  try {
    // If the package dir is a symlink, it's npm linked
    const stat = await fs.lstat(pkgDir);
    if (stat.isSymbolicLink()) return true;
    // Also check if it's inside a node_modules with a symlink
    const realPath = await fs.realpath(pkgDir);
    return realPath !== pkgDir;
  } catch {
    return false;
  }
}

module.exports = { run };
