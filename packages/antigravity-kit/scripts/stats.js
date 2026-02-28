/**
 * agk stats — Project Intelligence Dashboard
 *
 * Shows a comprehensive overview of the AGK setup in the current project:
 * agents, workflows, skills, suites, rules, memory, brain status.
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

async function run(projectDir) {
  console.log(chalk.bold.cyan("\n📊 AGK Project Dashboard\n"));

  const stats = {
    agents: 0,
    workflows: 0,
    opencodeCommands: 0,
    skills: 0,
    suites: 0,
    rules: 0,
    memoryFiles: 0,
    brainLinked: false,
  };

  // Agents
  const agentsDir = path.join(projectDir, ".agent", "agents");
  if (await fs.pathExists(agentsDir)) {
    const files = (await fs.readdir(agentsDir)).filter((f) =>
      f.endsWith(".md"),
    );
    stats.agents = files.length;
  }

  // Workflows
  const wfDir = path.join(projectDir, ".agent", "workflows");
  if (await fs.pathExists(wfDir)) {
    const files = (await fs.readdir(wfDir)).filter((f) => f.endsWith(".md"));
    stats.workflows = files.length;
  }

  // OpenCode commands
  const opencodeDir = path.join(projectDir, ".opencode", "commands");
  if (await fs.pathExists(opencodeDir)) {
    const files = (await fs.readdir(opencodeDir)).filter((f) =>
      f.endsWith(".md"),
    );
    stats.opencodeCommands = files.length;
  }

  // Skills
  const skillsDir = path.join(projectDir, ".agent", "skills");
  if (await fs.pathExists(skillsDir)) {
    const dirs = (await fs.readdir(skillsDir, { withFileTypes: true })).filter(
      (d) => d.isDirectory(),
    );
    stats.skills = dirs.length;
  }

  // Suites
  const suitesPath = path.join(projectDir, ".agent", "suites.json");
  if (await fs.pathExists(suitesPath)) {
    const config = await fs.readJson(suitesPath);
    stats.suites = (config.installed || []).length;
  }

  // Rules
  const rulesDir = path.join(projectDir, ".gemini", "rules");
  if (await fs.pathExists(rulesDir)) {
    const files = (await fs.readdir(rulesDir)).filter((f) => f.endsWith(".md"));
    stats.rules = files.length;
  }

  // Memory
  const memDir = path.join(projectDir, ".memory");
  if (await fs.pathExists(memDir)) {
    const files = (await fs.readdir(memDir)).filter((f) => f.endsWith(".md"));
    stats.memoryFiles = files.length;
  }

  // Brain
  const brainConfig = path.join(projectDir, ".memory", ".brain-link.json");
  if (await fs.pathExists(brainConfig)) {
    stats.brainLinked = true;
  }

  // AGENTS.md
  const agentsMd = await fs.pathExists(path.join(projectDir, "AGENTS.md"));
  const geminiMd = await fs.pathExists(path.join(projectDir, "GEMINI.md"));

  // Display dashboard
  const bar = (count, max = 20) => {
    const filled = Math.min(Math.ceil((count / max) * 10), 10);
    return "█".repeat(filled) + "░".repeat(10 - filled);
  };

  console.log(
    `  ${chalk.cyan(bar(stats.agents))} ${chalk.bold("Agents")}      ${stats.agents}`,
  );
  console.log(
    `  ${chalk.cyan(bar(stats.workflows))} ${chalk.bold("Workflows")}   ${stats.workflows}`,
  );
  console.log(
    `  ${chalk.cyan(bar(stats.opencodeCommands))} ${chalk.bold("OpenCode")}    ${stats.opencodeCommands}`,
  );
  console.log(
    `  ${chalk.cyan(bar(stats.skills, 10))} ${chalk.bold("Skills")}      ${stats.skills}`,
  );
  console.log(
    `  ${chalk.cyan(bar(stats.suites, 7))} ${chalk.bold("Suites")}      ${stats.suites}`,
  );
  console.log(
    `  ${chalk.cyan(bar(stats.rules, 10))} ${chalk.bold("Rules")}       ${stats.rules}`,
  );
  console.log(
    `  ${chalk.cyan(bar(stats.memoryFiles, 4))} ${chalk.bold("Memory")}      ${stats.memoryFiles} files`,
  );

  console.log();

  // Status indicators
  console.log(chalk.bold("  Status:\n"));
  console.log(
    `  ${geminiMd ? chalk.green("✓") : chalk.red("✗")} GEMINI.md ${geminiMd ? chalk.gray("(Auto-Dispatch active)") : chalk.yellow("— run agk agents")}`,
  );
  console.log(
    `  ${agentsMd ? chalk.green("✓") : chalk.red("✗")} AGENTS.md ${agentsMd ? chalk.gray("(open standard)") : chalk.yellow("— run agk agents")}`,
  );
  console.log(
    `  ${stats.brainLinked ? chalk.green("✓") : chalk.gray("○")} Second Brain ${stats.brainLinked ? chalk.gray("(linked)") : chalk.gray("— run agk brain link")}`,
  );
  console.log();

  // Installed suites
  if (stats.suites > 0 && (await fs.pathExists(suitesPath))) {
    const config = await fs.readJson(suitesPath);
    const names = config.installed.map((s) => s.displayName || s.name);
    console.log(chalk.gray(`  Suites: ${names.join(", ")}`));
  }

  // Suggestions
  const suggestions = [];
  if (stats.agents === 0) suggestions.push("agk init");
  if (stats.opencodeCommands === 0)
    suggestions.push("agk init --target opencode");
  if (stats.suites === 0) suggestions.push("agk suggest suite");
  if (!stats.brainLinked) suggestions.push("agk brain link");

  if (suggestions.length > 0) {
    console.log(chalk.bold("\n  💡 Suggestions:\n"));
    for (const s of suggestions) {
      console.log(chalk.yellow(`    ${s}`));
    }
  }

  console.log();
  return 0;
}

module.exports = { run };
