/**
 * agk agents — Scan, register, find, and render AI agent surfaces
 *
 * Subcommands:
 *   agk agents                         → Register agents in GEMINI.md + refresh AGENTS.md registry
 *   agk agents render                  → Render target/model-aware AGENTS.md from SSOT templates
 *   agk agents find <q>                → Search community agent templates
 *   agk agents list                    → List installed agents
 *
 * Useful flags:
 *   --target antigravity|opencode|hybrid
 *   --model-profile <name>
 *   --force
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { execSync } = require("child_process");
const { parseFrontmatter } = require("../lib/frontmatter");
const {
  REGISTRY_START,
  REGISTRY_END,
  buildRegistryBlock,
  detectTargetProfile,
  normalizeTargetProfile,
  renderAgentsMarkdown,
  replaceRegistryBlock,
  isManagedAgentsFile,
} = require("../lib/agents-md");

const SUPPORTED_SUBCOMMANDS = new Set(["register", "render", "find", "list"]);

/**
 * Read flag value supporting `--flag value` and `--flag=value`.
 */
function getFlagValue(args, flag) {
  const directIndex = args.indexOf(flag);
  if (directIndex !== -1 && args[directIndex + 1]) {
    return args[directIndex + 1];
  }

  const prefix = `${flag}=`;
  const withEquals = args.find((arg) => arg.startsWith(prefix));
  if (withEquals) {
    return withEquals.slice(prefix.length);
  }

  return null;
}

/**
 * Parse command-line options for agents script.
 */
function parseAgentArgs(args = []) {
  let subcommand = "register";
  let rest = [...args];

  if (rest[0] && SUPPORTED_SUBCOMMANDS.has(rest[0])) {
    subcommand = rest[0];
    rest = rest.slice(1);
  }

  const targetFlag = getFlagValue(rest, "--target");
  const modelProfile = (getFlagValue(rest, "--model-profile") || "default")
    .trim()
    .toLowerCase();

  const unknownTargets = [];
  let targetProfile = null;
  if (targetFlag) {
    const normalized = normalizeTargetProfile(targetFlag);
    if (
      [
        "antigravity",
        "agk",
        "default",
        "opencode",
        "open-code",
        "codex",
        "hybrid",
        "all",
        "both",
      ].includes(targetFlag.trim().toLowerCase())
    ) {
      targetProfile = normalized;
    } else {
      unknownTargets.push(targetFlag);
      targetProfile = normalized;
    }
  }

  const positionalArgs = rest.filter((arg, index) => {
    if (arg.startsWith("--target=")) return false;
    if (arg.startsWith("--model-profile=")) return false;
    if (["--force", "-f"].includes(arg)) return false;

    const prev = rest[index - 1];
    if (prev === "--target" || prev === "--model-profile") return false;

    return !arg.startsWith("--");
  });

  return {
    subcommand,
    targetProfile,
    modelProfile,
    force: rest.includes("--force") || rest.includes("-f"),
    positionalArgs,
    unknownTargets,
  };
}

/**
 * Scan installed `.agent/agents/*.md` files and parse frontmatter.
 */
async function scanInstalledAgents(projectDir, opts = {}) {
  const { allowMissing = false } = opts;
  const agentsDir = path.join(projectDir, ".agent", "agents");

  if (!(await fs.pathExists(agentsDir))) {
    if (allowMissing) {
      return [];
    }
    throw new Error("No .agent/agents/ directory found. Run `agk init` first.");
  }

  const files = (await fs.readdir(agentsDir))
    .filter((file) => file.endsWith(".md"))
    .sort();

  const agents = [];
  for (const file of files) {
    const content = await fs.readFile(path.join(agentsDir, file), "utf8");
    const meta = parseFrontmatter(content) || {};
    const name = meta.name || file.replace(/\.md$/, "");
    const triggers = Array.isArray(meta.triggers) ? meta.triggers : [];
    const description = meta.description || "";

    agents.push({
      name,
      description,
      triggers,
      file: `.agent/agents/${file}`,
    });
  }

  return agents;
}

/**
 * Build GEMINI.md registry table block.
 */
function buildGeminiRegistryBlock(agents) {
  const rows =
    agents.length > 0
      ? agents
          .map((agent) => {
            const triggers =
              agent.triggers.length > 0
                ? `\`${agent.triggers.join("`, `")}\``
                : "—";
            return `| ${agent.name} | ${triggers} | \`${agent.file}\` |`;
          })
          .join("\n")
      : "| _none_ | — | — |";

  return [
    REGISTRY_START,
    "| Agent | Triggers | File |",
    "|:---|:---|:---|",
    rows,
    REGISTRY_END,
  ].join("\n");
}

/**
 * Update GEMINI.md registry markers if present.
 */
async function updateGeminiRegistry(projectDir, agents) {
  const geminiPath = path.join(projectDir, "GEMINI.md");
  if (!(await fs.pathExists(geminiPath))) {
    return false;
  }

  const geminiContent = await fs.readFile(geminiPath, "utf8");
  const startIdx = geminiContent.indexOf(REGISTRY_START);
  const endIdx = geminiContent.indexOf(REGISTRY_END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    return false;
  }

  const registryBlock = buildGeminiRegistryBlock(agents);
  const updated =
    geminiContent.slice(0, startIdx) +
    registryBlock +
    geminiContent.slice(endIdx + REGISTRY_END.length);

  await fs.writeFile(geminiPath, updated, "utf8");
  return true;
}

/**
 * Render full AGENTS.md content from templates and write it safely.
 */
async function renderAgentsFile(projectDir, options) {
  const agents = await scanInstalledAgents(projectDir, { allowMissing: true });
  const targetProfile =
    options.targetProfile || (await detectTargetProfile(projectDir));
  const modelProfile = options.modelProfile || "default";

  const rendered = await renderAgentsMarkdown({
    projectDir,
    agents,
    targetProfile,
    modelProfile,
  });

  const agentsPath = path.join(projectDir, "AGENTS.md");
  const generatedPath = path.join(projectDir, "AGENTS.generated.md");

  if (!(await fs.pathExists(agentsPath))) {
    await fs.writeFile(agentsPath, rendered, "utf8");
    return { mode: "created", path: agentsPath, targetProfile, modelProfile };
  }

  const existing = await fs.readFile(agentsPath, "utf8");
  if (options.force || isManagedAgentsFile(existing)) {
    await fs.writeFile(agentsPath, rendered, "utf8");
    return { mode: "updated", path: agentsPath, targetProfile, modelProfile };
  }

  await fs.writeFile(generatedPath, rendered, "utf8");
  return {
    mode: "generated",
    path: generatedPath,
    targetProfile,
    modelProfile,
  };
}

/**
 * Register mode: refresh GEMINI registry and keep AGENTS.md non-destructive.
 */
async function register(projectDir, options) {
  let agents;
  try {
    agents = await scanInstalledAgents(projectDir);
  } catch (error) {
    console.error(chalk.red(`\n❌ ${error.message}\n`));
    return 1;
  }

  console.log(chalk.cyan("\n🤖 AGK Agent Registry\n"));
  if (agents.length === 0) {
    console.log(chalk.yellow("  ⚠️  No agents found in .agent/agents/\n"));
  } else {
    for (const agent of agents) {
      const triggerStr =
        agent.triggers.length > 0 ? agent.triggers.join(", ") : "(none)";
      console.log(
        `  ${chalk.green("✓")} ${chalk.bold(agent.name)} — ${chalk.gray(triggerStr)}`,
      );
    }
    console.log();
  }

  await updateGeminiRegistry(projectDir, agents);

  const agentsPath = path.join(projectDir, "AGENTS.md");
  const generatedPath = path.join(projectDir, "AGENTS.generated.md");
  const targetProfile =
    options.targetProfile || (await detectTargetProfile(projectDir));
  const modelProfile = options.modelProfile || "default";

  const rendered = await renderAgentsMarkdown({
    projectDir,
    agents,
    targetProfile,
    modelProfile,
  });

  if (!(await fs.pathExists(agentsPath))) {
    await fs.writeFile(agentsPath, rendered, "utf8");
    console.log(chalk.green("✅ Created AGENTS.md"));
  } else {
    const current = await fs.readFile(agentsPath, "utf8");

    if (isManagedAgentsFile(current)) {
      await fs.writeFile(agentsPath, rendered, "utf8");
      console.log(chalk.green("✅ Refreshed managed AGENTS.md"));
    } else {
      const patched = replaceRegistryBlock(current, buildRegistryBlock(agents));
      if (patched !== null) {
        await fs.writeFile(agentsPath, patched, "utf8");
        console.log(chalk.green("✅ Updated AGENTS.md registry block"));
      } else {
        await fs.writeFile(generatedPath, rendered, "utf8");
        console.log(
          chalk.yellow(
            "⚠️  Existing AGENTS.md is user-managed (no AGK markers).",
          ),
        );
        console.log(
          chalk.gray(
            `   Wrote generated output to ${path.basename(generatedPath)}`,
          ),
        );
      }
    }
  }

  console.log(
    chalk.green(`\n✅ Registered ${agents.length} agents in GEMINI.md`),
  );
  console.log(chalk.gray("   Agent-aware registry is now up to date.\n"));

  return 0;
}

async function run(projectDir, args = []) {
  const parsed = parseAgentArgs(args);

  if (parsed.unknownTargets.length > 0) {
    console.log(
      chalk.yellow(
        `\n⚠️  Unknown --target value(s): ${parsed.unknownTargets.join(", ")}`,
      ),
    );
    console.log(
      chalk.gray("   Supported: antigravity, opencode, hybrid (or all)\n"),
    );
  }

  switch (parsed.subcommand) {
    case "register":
      return register(projectDir, {
        targetProfile: parsed.targetProfile,
        modelProfile: parsed.modelProfile,
      });
    case "render": {
      const result = await renderAgentsFile(projectDir, {
        targetProfile: parsed.targetProfile,
        modelProfile: parsed.modelProfile,
        force: parsed.force,
      });

      console.log(chalk.cyan("\n🧩 AGENTS.md Render\n"));
      if (result.mode === "created") {
        console.log(chalk.green(`  ✓ Created ${path.basename(result.path)}`));
      } else if (result.mode === "updated") {
        console.log(chalk.green(`  ✓ Updated ${path.basename(result.path)}`));
      } else {
        console.log(
          chalk.yellow(
            `  ⚠️  Existing AGENTS.md preserved; wrote ${path.basename(result.path)}`,
          ),
        );
        console.log(
          chalk.gray(
            "     Use --force to replace AGENTS.md with rendered output.",
          ),
        );
      }
      console.log(chalk.gray(`  target: ${result.targetProfile}`));
      console.log(chalk.gray(`  model profile: ${result.modelProfile}\n`));
      return 0;
    }
    case "find":
      return findAgents(projectDir, parsed.positionalArgs);
    case "list":
      return listAgents(projectDir);
    default:
      return register(projectDir, {
        targetProfile: parsed.targetProfile,
        modelProfile: parsed.modelProfile,
      });
  }
}

/**
 * Search for community agent templates via npx claude-code-templates
 * and npm search.
 */
async function findAgents(_projectDir, queryArgs) {
  const query = queryArgs.join(" ");

  if (!query) {
    console.log(chalk.yellow("\n⚠️  Missing search query."));
    console.log(chalk.gray('  Usage: agk agents find "react"\n'));
    return 1;
  }

  console.log(chalk.cyan(`\n🔍 Searching for agent templates: "${query}"\n`));

  let found = false;

  // Source 1: npm search for agent packages
  try {
    console.log(chalk.gray("  Searching npm for agent packages..."));
    const result = execSync(
      `npm search "claude agent ${query}" --json --long 2>nul`,
      {
        encoding: "utf8",
        timeout: 15000,
        stdio: "pipe",
      },
    );

    const packages = JSON.parse(result || "[]").slice(0, 5);
    if (packages.length > 0) {
      console.log(chalk.bold("\n  📦 npm packages:\n"));
      for (const pkg of packages) {
        console.log(
          `  ${chalk.green("•")} ${chalk.bold(pkg.name)} ${chalk.gray("v" + (pkg.version || "?"))}`,
        );
        if (pkg.description) {
          console.log(chalk.gray(`    ${pkg.description}`));
        }
        console.log(chalk.yellow(`    npm i ${pkg.name}\n`));
      }
      found = true;
    }
  } catch {
    // npm search failed — skip
  }

  // Source 2: GitHub search suggestion
  console.log(chalk.bold("  🐙 GitHub:\n"));
  console.log(
    chalk.gray(
      `  Search GitHub for agent templates: https://github.com/search?q=${encodeURIComponent(query + " agent AGENTS.md")}&type=repositories`,
    ),
  );
  console.log();

  // Source 3: Claude Code Templates
  console.log(chalk.bold("  📋 Claude Code Templates:\n"));
  console.log(chalk.gray("  Browse agents at: https://aitmpl.com"));
  console.log(
    chalk.yellow(`  npx claude-code-templates@latest --agent "${query}"`),
  );
  console.log();

  // Source 4: skills.sh
  console.log(chalk.bold("  🔧 Skills.sh:\n"));
  console.log(chalk.yellow(`  agk skills find ${query}`));
  console.log();

  if (!found) {
    console.log(
      chalk.gray(
        "  Tip: You can also create your own agent with `agk scaffold agent`\n",
      ),
    );
  }

  return 0;
}

async function listAgents(projectDir) {
  const agentsDir = path.join(projectDir, ".agent", "agents");

  if (!(await fs.pathExists(agentsDir))) {
    console.log(chalk.yellow("\n📦 No agents installed."));
    console.log(chalk.gray("   Run: agk init\n"));
    return 0;
  }

  const files = (await fs.readdir(agentsDir)).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    console.log(chalk.yellow("\n📦 No agents found.\n"));
    return 0;
  }

  console.log(chalk.cyan(`\n🤖 Installed Agents (${files.length})\n`));

  for (const file of files) {
    const content = await fs.readFile(path.join(agentsDir, file), "utf8");
    const meta = parseFrontmatter(content);
    const name = (meta && meta.name) || file.replace(".md", "");
    const desc = (meta && meta.description) || "";
    const skills = (meta && meta.skills) || [];
    const skillStr =
      skills.length > 0 ? chalk.blue(` [${skills.join(", ")}]`) : "";
    console.log(
      `  ${chalk.green("✓")} ${chalk.bold(name)}${desc ? chalk.gray(` — ${desc}`) : ""}${skillStr}`,
    );
  }

  console.log();
  return 0;
}

module.exports = { run };
