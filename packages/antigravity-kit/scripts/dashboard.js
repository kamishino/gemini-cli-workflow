/**
 * agk dashboard — Smart project overview with status + next actions
 *
 * Shows a compact, beautiful overview of project health
 * with actionable suggestions based on current state.
 */

const path = require("path");
const chalk = require("chalk");
const {
  countWorkflows,
  countAgents,
  countOpenCodeCommands,
  checkMemory,
  checkGuardRails,
  checkHooks,
  getSyncRemote,
  detectDogfooding,
} = require("../lib/counts");

async function run(projectDir) {
  const { name, version } = require("../package.json");
  const projectName = path.basename(projectDir);

  // Detect dogfooding
  const isDogfooding = await detectDogfooding(projectDir);

  // ── Header ──────────────────────────────────────────
  console.log();
  console.log(
    chalk.bold.cyan(`  📦 ${name}`) +
      chalk.gray(` v${version}`) +
      chalk.bold(` — ${projectName}`) +
      (isDogfooding ? chalk.magenta("  🐕 dogfooding") : ""),
  );
  console.log(chalk.gray("  " + "─".repeat(46)));

  // ── Status rows ─────────────────────────────────────
  const [
    workflows,
    agents,
    opencodeCommands,
    memory,
    guardRails,
    hooksInstalled,
    syncRemote,
  ] = await Promise.all([
    countWorkflows(projectDir),
    countAgents(projectDir),
    countOpenCodeCommands(projectDir),
    checkMemory(projectDir),
    checkGuardRails(projectDir),
    checkHooks(projectDir),
    getSyncRemote(projectDir),
  ]);

  console.log();
  row(
    "Workflows",
    workflows.count > 0 ? `${workflows.count} installed` : "none",
    workflows.count > 0,
  );
  row(
    "Agents",
    agents.count > 0 ? `${agents.count} installed` : "none",
    agents.count > 0,
  );
  row(
    "OpenCode",
    opencodeCommands.count > 0 ? `${opencodeCommands.count} commands` : "none",
    opencodeCommands.count > 0,
  );
  row(
    "Memory",
    memory.found > 0
      ? `${memory.found}/${memory.total} files${memory.freshness ? ` — ${memory.freshness}` : ""}`
      : "not initialized",
    memory.found === memory.total && memory.total > 0,
  );
  row(
    "Guard Rails",
    guardRails.count > 0 ? `${guardRails.count} rules` : "none",
    guardRails.count > 0,
  );
  row(
    "Git Hooks",
    hooksInstalled ? "installed" : "not installed",
    hooksInstalled,
  );
  row("Mem Sync", syncRemote ? "configured" : "not configured", !!syncRemote);

  // ── Next Actions ────────────────────────────────────
  const actions = [];
  const opencodeOnlyProject =
    opencodeCommands.count > 0 && workflows.count === 0 && agents.count === 0;

  if (workflows.count === 0 && opencodeCommands.count === 0) {
    actions.push({ cmd: "agk init", desc: "scaffold workflows & rules" });
  }
  if (agents.count === 0 && !opencodeOnlyProject) {
    actions.push({ cmd: "agk upgrade", desc: "install specialist agents" });
  }
  if (opencodeCommands.count === 0) {
    actions.push({
      cmd: "agk init --target opencode",
      desc: "install OpenCode slash commands",
    });
  }
  if (!hooksInstalled) {
    actions.push({ cmd: "agk hooks", desc: "install git hooks" });
  }
  if (!syncRemote) {
    actions.push({
      cmd: "agk memory sync setup <url>",
      desc: "enable cross-PC sync",
    });
  }
  if (memory.found < memory.total) {
    actions.push({ cmd: "agk init", desc: "restore missing memory files" });
  }

  // Always show upgrade as a suggestion if everything is healthy
  if (actions.length === 0) {
    actions.push({ cmd: "agk upgrade", desc: "check for template updates" });
    actions.push({ cmd: "agk doctor", desc: "run full health check" });
  }

  console.log();
  console.log(chalk.bold("  💡 Next actions:"));
  for (const action of actions.slice(0, 4)) {
    console.log(
      `     ${chalk.yellow(action.cmd.padEnd(30))} ${chalk.gray(action.desc)}`,
    );
  }

  // ── Box Footer ──────────────────────────────────────
  console.log();
  console.log(chalk.gray("  Tip: agk --help for all commands"));
  console.log();

  return 0;
}

// ── Helpers ───────────────────────────────────────────

function row(label, value, ok) {
  const symbol = ok ? chalk.green("✅") : chalk.yellow("⚠️");
  console.log(`  ${symbol}  ${chalk.bold(label.padEnd(12))} ${value}`);
}

module.exports = { run };
