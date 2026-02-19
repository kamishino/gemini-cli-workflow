/**
 * agk status — Quick project summary
 */

const path = require("path");
const chalk = require("chalk");
const { version, name } = require("../package.json");
const {
  countWorkflows,
  countAgents,
  checkMemory,
  checkGuardRails,
  checkHooks,
  getSyncRemote,
  detectDogfooding,
} = require("../lib/counts");

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
  const [
    workflows,
    memory,
    guardRails,
    hooksInstalled,
    memorySyncRemote,
    agents,
  ] = await Promise.all([
    countWorkflows(projectDir),
    checkMemory(projectDir),
    checkGuardRails(projectDir),
    checkHooks(projectDir),
    getSyncRemote(projectDir),
    countAgents(projectDir),
  ]);

  // Print status table
  printRow(
    "Workflows",
    workflows.count > 0 ? `${workflows.count} installed` : "none",
    workflows.count > 0,
  );
  printRow(
    "Agents",
    agents.count > 0 ? `${agents.count} installed` : "none (run agk upgrade)",
    agents.count > 0,
  );
  printRow(
    "Memory",
    memory.found > 0
      ? `${memory.found}/${memory.total} files${memory.freshness ? ` — ${memory.freshness}` : ""}`
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

  printRow(
    "Mem Sync",
    memorySyncRemote ? `configured` : "not configured (agk memory sync setup)",
    !!memorySyncRemote,
  );

  console.log();
  console.log();
  return 0;
}

function printRow(label, value, ok) {
  const icon = ok ? chalk.green("✅") : chalk.yellow("⚠️ ");
  const paddedLabel = label.padEnd(13);
  console.log(`  ${icon}  ${chalk.bold(paddedLabel)} ${chalk.gray(value)}`);
}

module.exports = { run };
