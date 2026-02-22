/**
 * agk suite — Install and manage development suites
 *
 * A suite bundles agents, skills, workflows, and rules into a single
 * installable package for a specific tech stack or use case.
 *
 * Subcommands:
 *   agk suite             → List installed suites
 *   agk suite add <name>  → Install a built-in or custom suite
 *   agk suite list        → List installed suites
 *   agk suite available   → Show all available built-in suites
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const ora = require("ora");

const SUITES_TEMPLATE_DIR = path.join(__dirname, "..", "templates", "suites");
const SUITE_CONFIG_FILE = ".agent/suites.json";

async function run(projectDir, args = []) {
  const subcommand = args[0] || "list";

  switch (subcommand) {
    case "add":
      return await addSuite(projectDir, args[1]);
    case "list":
      return await listSuites(projectDir);
    case "available":
      return await showAvailable();
    default:
      console.error(chalk.red(`\n❌ Unknown subcommand: ${subcommand}`));
      showUsage();
      return 1;
  }
}

function showUsage() {
  console.log(chalk.yellow("\n  Usage:"));
  console.log(
    chalk.gray(
      "    agk suite add <name>   Install a suite (react, fullstack, backend, cli)",
    ),
  );
  console.log(chalk.gray("    agk suite list         List installed suites"));
  console.log(
    chalk.gray(
      "    agk suite available    Show all available built-in suites\n",
    ),
  );
}

async function addSuite(projectDir, suiteName) {
  if (!suiteName) {
    console.error(chalk.red("\n❌ Missing suite name."));
    showUsage();
    return 1;
  }

  // 1. Find the suite manifest
  const suitePath = path.join(SUITES_TEMPLATE_DIR, `${suiteName}.json`);
  if (!(await fs.pathExists(suitePath))) {
    console.error(chalk.red(`\n❌ Suite "${suiteName}" not found.\n`));
    console.log(chalk.gray("  Available suites:"));
    await showAvailable();
    return 1;
  }

  const suite = await fs.readJson(suitePath);
  console.log(chalk.bold.cyan(`\n📦 Installing "${suite.name}" Suite\n`));

  const spinner = ora("Setting up suite...").start();
  const results = { agents: 0, skills: 0, workflows: 0, rules: 0 };

  // 2. Ensure agents exist (from templates)
  spinner.text = "Checking agents...";
  for (const agentName of suite.agents || []) {
    const agentSrc = path.join(
      __dirname,
      "..",
      "templates",
      "agents",
      `${agentName}.md`,
    );
    const agentDst = path.join(
      projectDir,
      ".agent",
      "agents",
      `${agentName}.md`,
    );
    if ((await fs.pathExists(agentSrc)) && !(await fs.pathExists(agentDst))) {
      await fs.ensureDir(path.dirname(agentDst));
      await fs.copy(agentSrc, agentDst);
      results.agents++;
    }
  }
  spinner.text = `Agents: ${results.agents} new`;

  // 3. Install skills via agk skills add
  if (suite.skills && suite.skills.length > 0) {
    spinner.text = "Installing skills...";
    spinner.stop();

    try {
      const skills = require("./skills");
      await skills.run(projectDir, ["add", ...suite.skills]);
      results.skills = suite.skills.length;
    } catch {
      // Non-fatal: skills install may fail offline
    }

    spinner.start();
  }

  // 4. Ensure workflows exist (from templates)
  spinner.text = "Checking workflows...";
  for (const wfName of suite.workflows || []) {
    const wfSrc = path.join(
      __dirname,
      "..",
      "templates",
      "workflows",
      `${wfName}.md`,
    );
    const wfDst = path.join(projectDir, ".agent", "workflows", `${wfName}.md`);
    if ((await fs.pathExists(wfSrc)) && !(await fs.pathExists(wfDst))) {
      await fs.ensureDir(path.dirname(wfDst));
      await fs.copy(wfSrc, wfDst);
      results.workflows++;
    }
  }

  // 5. Ensure rules exist (from templates)
  spinner.text = "Checking rules...";
  for (const ruleName of suite.rules || []) {
    const ruleSrc = path.join(
      __dirname,
      "..",
      "templates",
      "rules",
      `${ruleName}.md`,
    );
    const ruleDst = path.join(projectDir, ".gemini", "rules", `${ruleName}.md`);
    if ((await fs.pathExists(ruleSrc)) && !(await fs.pathExists(ruleDst))) {
      await fs.ensureDir(path.dirname(ruleDst));
      await fs.copy(ruleSrc, ruleDst);
      results.rules++;
    }
  }

  // 6. Save suite config
  const configPath = path.join(projectDir, SUITE_CONFIG_FILE);
  let config = { installed: [] };
  if (await fs.pathExists(configPath)) {
    config = await fs.readJson(configPath);
  }
  if (!config.installed.find((s) => s.name === suiteName)) {
    config.installed.push({
      name: suiteName,
      displayName: suite.name,
      version: suite.version,
      installedAt: new Date().toISOString(),
    });
    await fs.ensureDir(path.dirname(configPath));
    await fs.writeJson(configPath, config, { spaces: 2 });
  }

  // 7. Re-register agents
  spinner.text = "Registering agents...";
  try {
    const agents = require("./agents");
    await agents.run(projectDir);
  } catch {
    // Non-fatal
  }

  spinner.succeed(chalk.green(`"${suite.name}" Suite installed!`));

  // Summary
  console.log(chalk.gray("\n  Summary:"));
  console.log(
    chalk.gray(`  • Agents: ${suite.agents.length} (${results.agents} new)`),
  );
  console.log(
    chalk.gray(
      `  • Skills: ${suite.skills.length} (${results.skills} installed)`,
    ),
  );
  console.log(
    chalk.gray(
      `  • Workflows: ${(suite.workflows || []).length} (${results.workflows} new)`,
    ),
  );
  console.log(
    chalk.gray(
      `  • Rules: ${(suite.rules || []).length} (${results.rules} new)`,
    ),
  );
  console.log();

  return 0;
}

async function listSuites(projectDir) {
  const configPath = path.join(projectDir, SUITE_CONFIG_FILE);

  if (!(await fs.pathExists(configPath))) {
    console.log(chalk.yellow("\n📦 No suites installed."));
    console.log(chalk.gray("   Run: agk suite available\n"));
    return 0;
  }

  const config = await fs.readJson(configPath);

  if (!config.installed || config.installed.length === 0) {
    console.log(chalk.yellow("\n📦 No suites installed."));
    console.log(chalk.gray("   Run: agk suite available\n"));
    return 0;
  }

  console.log(
    chalk.cyan(`\n📦 Installed Suites (${config.installed.length})\n`),
  );

  for (const suite of config.installed) {
    const date = suite.installedAt
      ? chalk.gray(` (${suite.installedAt.split("T")[0]})`)
      : "";
    console.log(
      `  ${chalk.green("✓")} ${chalk.bold(suite.displayName || suite.name)} v${suite.version || "?"}${date}`,
    );
  }

  console.log();
  return 0;
}

async function showAvailable() {
  if (!(await fs.pathExists(SUITES_TEMPLATE_DIR))) {
    console.log(chalk.yellow("\n⚠️  No suite templates found.\n"));
    return 0;
  }

  const files = (await fs.readdir(SUITES_TEMPLATE_DIR)).filter((f) =>
    f.endsWith(".json"),
  );

  console.log(chalk.cyan(`\n📦 Available Suites (${files.length})\n`));

  for (const file of files) {
    const suite = await fs.readJson(path.join(SUITES_TEMPLATE_DIR, file));
    const name = file.replace(".json", "");
    const agents = (suite.agents || []).length;
    const skills = (suite.skills || []).length;
    const workflows = (suite.workflows || []).length;

    console.log(`  ${chalk.bold(suite.name)} ${chalk.gray(`(${name})`)}`);
    console.log(chalk.gray(`    ${suite.description}`));
    console.log(
      chalk.gray(
        `    ${agents} agents • ${skills} skills • ${workflows} workflows`,
      ),
    );
    console.log(chalk.yellow(`    agk suite add ${name}\n`));
  }

  return 0;
}

module.exports = { run };
