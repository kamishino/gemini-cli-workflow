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
    case "remove":
      return await removeSuite(projectDir, args[1]);
    case "find":
      return await findSuites(args.slice(1));
    case "create":
      return await createSuite(projectDir, args[1]);
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
  console.log(chalk.gray("    agk suite add <name>      Install a suite"));
  console.log(chalk.gray("    agk suite remove <name>   Uninstall a suite"));
  console.log(
    chalk.gray("    agk suite find <query>   Search for community suites"),
  );
  console.log(
    chalk.gray(
      "    agk suite create <name>  Export current project as a shareable suite",
    ),
  );
  console.log(chalk.gray("    agk suite list           List installed suites"));
  console.log(
    chalk.gray(
      "    agk suite available      Show all available built-in suites\n",
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

async function removeSuite(projectDir, suiteName) {
  if (!suiteName) {
    console.error(chalk.red("\n❌ Missing suite name."));
    console.log(chalk.gray("  Usage: agk suite remove <name>\n"));
    return 1;
  }

  const configPath = path.join(projectDir, SUITE_CONFIG_FILE);
  if (!(await fs.pathExists(configPath))) {
    console.log(chalk.yellow("\n⚠️  No suites installed.\n"));
    return 1;
  }

  const config = await fs.readJson(configPath);
  const idx = config.installed.findIndex((s) => s.name === suiteName);

  if (idx === -1) {
    console.error(chalk.red(`\n❌ Suite "${suiteName}" is not installed.\n`));
    return 1;
  }

  const removed = config.installed[idx];
  console.log(
    chalk.bold.cyan(
      `\n🗑️  Removing "${removed.displayName || suiteName}" Suite\n`,
    ),
  );

  // Find suite manifest to know what agents/workflows to clean
  const suitePath = path.join(SUITES_TEMPLATE_DIR, `${suiteName}.json`);
  let cleaned = { agents: 0, workflows: 0 };

  if (await fs.pathExists(suitePath)) {
    const suite = await fs.readJson(suitePath);

    // Find agents used by OTHER installed suites (don't remove shared agents)
    const otherSuites = config.installed.filter((_, i) => i !== idx);
    const sharedAgents = new Set();
    for (const other of otherSuites) {
      const otherPath = path.join(SUITES_TEMPLATE_DIR, `${other.name}.json`);
      if (await fs.pathExists(otherPath)) {
        const otherSuite = await fs.readJson(otherPath);
        for (const a of otherSuite.agents || []) {
          sharedAgents.add(a);
        }
      }
    }

    // Remove agents unique to this suite
    for (const agentName of suite.agents || []) {
      if (!sharedAgents.has(agentName)) {
        const agentPath = path.join(
          projectDir,
          ".agent",
          "agents",
          `${agentName}.md`,
        );
        if (await fs.pathExists(agentPath)) {
          await fs.remove(agentPath);
          cleaned.agents++;
        }
      }
    }

    // Remove workflows unique to this suite (same logic)
    const sharedWorkflows = new Set();
    for (const other of otherSuites) {
      const otherPath = path.join(SUITES_TEMPLATE_DIR, `${other.name}.json`);
      if (await fs.pathExists(otherPath)) {
        const otherSuite = await fs.readJson(otherPath);
        for (const w of otherSuite.workflows || []) {
          sharedWorkflows.add(w);
        }
      }
    }

    for (const wfName of suite.workflows || []) {
      if (!sharedWorkflows.has(wfName)) {
        const wfPath = path.join(
          projectDir,
          ".agent",
          "workflows",
          `${wfName}.md`,
        );
        if (await fs.pathExists(wfPath)) {
          await fs.remove(wfPath);
          cleaned.workflows++;
        }
      }
    }
  }

  // Remove from config
  config.installed.splice(idx, 1);
  await fs.writeJson(configPath, config, { spaces: 2 });

  console.log(
    chalk.green(`  ✅ Removed "${removed.displayName || suiteName}"`),
  );
  console.log(chalk.gray(`  • Agents removed: ${cleaned.agents}`));
  console.log(chalk.gray(`  • Workflows removed: ${cleaned.workflows}`));
  console.log(chalk.gray("  • Shared components preserved\n"));

  // Re-register agents
  try {
    const agents = require("./agents");
    await agents.run(projectDir);
  } catch {
    // Non-fatal
  }

  return 0;
}

async function findSuites(queryArgs) {
  const { execSync } = require("child_process");
  const query = queryArgs.join(" ");

  if (!query) {
    console.log(chalk.yellow("\n⚠️  Missing search query."));
    console.log(chalk.gray('  Usage: agk suite find "react"\n'));
    return 1;
  }

  console.log(chalk.cyan(`\n🔍 Searching for "${query}" suites\n`));

  // Source 1: Built-in suites that match
  const files = (await fs.readdir(SUITES_TEMPLATE_DIR)).filter((f) =>
    f.endsWith(".json"),
  );
  const matches = [];
  for (const file of files) {
    const suite = await fs.readJson(path.join(SUITES_TEMPLATE_DIR, file));
    const searchable =
      `${suite.name} ${suite.description} ${(suite.agents || []).join(" ")} ${(suite.skills || []).join(" ")}`.toLowerCase();
    if (searchable.includes(query.toLowerCase())) {
      matches.push({ name: file.replace(".json", ""), suite });
    }
  }

  if (matches.length > 0) {
    console.log(chalk.bold("  📦 Built-in matches:\n"));
    for (const m of matches) {
      console.log(`  ${chalk.green("•")} ${chalk.bold(m.suite.name)}`);
      console.log(chalk.gray(`    ${m.suite.description}`));
      console.log(chalk.yellow(`    agk suite add ${m.name}\n`));
    }
  }

  // Source 2: npm search
  try {
    const result = execSync(`npm search "agk suite ${query}" --json`, {
      encoding: "utf8",
      timeout: 15000,
      stdio: "pipe",
    });
    const packages = JSON.parse(result || "[]").slice(0, 3);
    if (packages.length > 0) {
      console.log(chalk.bold("  📦 npm packages:\n"));
      for (const pkg of packages) {
        console.log(
          `  ${chalk.green("•")} ${chalk.bold(pkg.name)} ${chalk.gray("v" + (pkg.version || "?"))}`,
        );
        if (pkg.description) {
          console.log(chalk.gray(`    ${pkg.description}`));
        }
        console.log(chalk.yellow(`    npm i ${pkg.name}\n`));
      }
    }
  } catch {
    // npm search failed
  }

  // Source 3: GitHub suggestion
  console.log(chalk.bold("  🐙 GitHub:\n"));
  console.log(
    chalk.gray(
      `  https://github.com/search?q=${encodeURIComponent("agk suite " + query + " suite.json")}&type=repositories`,
    ),
  );
  console.log();

  return 0;
}

async function createSuite(projectDir, suiteName) {
  if (!suiteName) {
    console.error(chalk.red("\n❌ Missing suite name."));
    console.log(chalk.gray('  Usage: agk suite create "my-stack"\n'));
    return 1;
  }

  console.log(
    chalk.cyan(`\n📦 Creating suite from current project: "${suiteName}"\n`),
  );

  const suite = {
    name: suiteName,
    description: "",
    version: "1.0.0",
    detectors: [],
    agents: [],
    skills: [],
    workflows: [],
    rules: [],
  };

  // Scan agents
  const agentsDir = path.join(projectDir, ".agent", "agents");
  if (await fs.pathExists(agentsDir)) {
    const files = (await fs.readdir(agentsDir)).filter((f) =>
      f.endsWith(".md"),
    );
    for (const file of files) {
      suite.agents.push(file.replace(".md", ""));
    }
  }

  // Scan skills
  const skillsDir = path.join(projectDir, ".agent", "skills");
  if (await fs.pathExists(skillsDir)) {
    const dirs = (await fs.readdir(skillsDir, { withFileTypes: true })).filter(
      (d) => d.isDirectory(),
    );
    for (const dir of dirs) {
      suite.skills.push(dir.name);
    }
  }

  // Scan workflows
  const workflowsDir = path.join(projectDir, ".agent", "workflows");
  if (await fs.pathExists(workflowsDir)) {
    const files = (await fs.readdir(workflowsDir)).filter((f) =>
      f.endsWith(".md"),
    );
    for (const file of files) {
      suite.workflows.push(file.replace(".md", ""));
    }
  }

  // Scan rules
  const rulesDir = path.join(projectDir, ".gemini", "rules");
  if (await fs.pathExists(rulesDir)) {
    const files = (await fs.readdir(rulesDir)).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      suite.rules.push(file.replace(".md", ""));
    }
  }

  // Detect project markers for detectors
  const pkg = path.join(projectDir, "package.json");
  if (await fs.pathExists(pkg)) {
    const pkgData = await fs.readJson(pkg);
    const deps = {
      ...pkgData.dependencies,
      ...pkgData.devDependencies,
    };
    // Add common detectors based on dependencies
    if (deps.next) suite.detectors.push("next.config.*");
    if (deps.react) suite.detectors.push("*.jsx", "*.tsx");
    if (deps.prisma || deps["@prisma/client"])
      suite.detectors.push("prisma/schema.prisma");
    if (deps.express) suite.detectors.push("express");
    if (deps.vue) suite.detectors.push("*.vue");
  }
  if (await fs.pathExists(path.join(projectDir, "tsconfig.json"))) {
    suite.detectors.push("tsconfig.json");
  }

  // Add description
  suite.description = `${suite.agents.length} agents, ${suite.skills.length} skills, ${suite.workflows.length} workflows for ${suiteName}`;

  // Write suite.json
  const outputPath = path.join(projectDir, "suite.json");
  await fs.writeJson(outputPath, suite, { spaces: 2 });

  console.log(chalk.green("  ✅ Created suite.json\n"));
  console.log(chalk.gray("  Summary:"));
  console.log(
    chalk.gray(
      `  • Agents: ${suite.agents.length} (${suite.agents.join(", ")})`,
    ),
  );
  console.log(
    chalk.gray(
      `  • Skills: ${suite.skills.length} (${suite.skills.join(", ")})`,
    ),
  );
  console.log(chalk.gray(`  • Workflows: ${suite.workflows.length}`));
  console.log(chalk.gray(`  • Rules: ${suite.rules.length}`));
  console.log(chalk.gray(`  • Detectors: ${suite.detectors.length}`));
  console.log();
  console.log(
    chalk.gray(
      "  Share: copy suite.json to templates/suites/ or publish to GitHub",
    ),
  );
  console.log(
    chalk.yellow(`  Install on another project: agk suite add ${suiteName}\n`),
  );

  return 0;
}

module.exports = { run };
