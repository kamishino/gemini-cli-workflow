/**
 * agk dashboard — Smart project overview with status + next actions
 *
 * Shows a compact, beautiful overview of project health
 * with actionable suggestions based on current state.
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

const CONFIG_FILE = ".agent/config.json";

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
  const [workflows, agents, memory, guardRails, hooksInstalled, syncRemote] =
    await Promise.all([
      count(projectDir, path.join(".agent", "workflows"), ".md"),
      count(projectDir, path.join(".agent", "agents"), ".md"),
      checkMemory(projectDir),
      checkGuardRails(projectDir),
      checkHooks(projectDir),
      getSyncRemote(projectDir),
    ]);

  console.log();
  row(
    "Workflows",
    workflows > 0 ? `${workflows} installed` : "none",
    workflows > 0,
  );
  row("Agents", agents > 0 ? `${agents} installed` : "none", agents > 0);
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

  if (workflows === 0) {
    actions.push({ cmd: "agk init", desc: "scaffold workflows & rules" });
  }
  if (agents === 0) {
    actions.push({ cmd: "agk upgrade", desc: "install specialist agents" });
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

async function count(projectDir, subDir, ext) {
  const dir = path.join(projectDir, subDir);
  try {
    if (!(await fs.pathExists(dir))) return 0;
    const files = await fs.readdir(dir);
    return files.filter((f) => f.endsWith(ext)).length;
  } catch {
    return 0;
  }
}

async function checkMemory(projectDir) {
  const memoryDir = path.join(projectDir, ".memory");
  const expected = [
    "context.md",
    "patterns.md",
    "decisions.md",
    "anti-patterns.md",
  ];
  try {
    if (!(await fs.pathExists(memoryDir)))
      return { found: 0, total: expected.length, freshness: null };
    const files = await fs.readdir(memoryDir);
    const found = expected.filter((f) => files.includes(f)).length;

    // Freshness
    let freshness = null;
    const contextPath = path.join(memoryDir, "context.md");
    if (await fs.pathExists(contextPath)) {
      const stat = await fs.stat(contextPath);
      freshness = relativeTime(stat.mtime);
    }

    return { found, total: expected.length, freshness };
  } catch {
    return { found: 0, total: expected.length, freshness: null };
  }
}

function relativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toISOString().split("T")[0];
}

async function checkGuardRails(projectDir) {
  for (const sub of [
    path.join(".gemini", "rules"),
    path.join(".agent", "rules"),
  ]) {
    const dir = path.join(projectDir, sub);
    try {
      if (await fs.pathExists(dir)) {
        const files = await fs.readdir(dir);
        return { count: files.filter((f) => f.endsWith(".md")).length };
      }
    } catch {
      // continue
    }
  }
  return { count: 0 };
}

async function checkHooks(projectDir) {
  const hookPath = path.join(projectDir, ".git", "hooks", "pre-commit");
  try {
    if (!(await fs.pathExists(hookPath))) return false;
    const content = await fs.readFile(hookPath, "utf8");
    return content.includes("antigravity") || content.includes("agk");
  } catch {
    return false;
  }
}

async function getSyncRemote(projectDir) {
  try {
    const config = await fs.readJson(path.join(projectDir, CONFIG_FILE));
    return config?.memory?.syncRemote || null;
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
      return pkg.name === "@kamishino/antigravity-kit";
    }
  } catch {
    // ignore
  }
  return false;
}

module.exports = { run };
