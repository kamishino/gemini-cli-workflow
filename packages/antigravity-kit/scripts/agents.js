/**
 * agk agents — Scan agents and register them in GEMINI.md for Auto-Dispatch
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { parseFrontmatter } = require("../lib/frontmatter");

const REGISTRY_START = "<!-- AGK_AGENT_REGISTRY_START -->";
const REGISTRY_END = "<!-- AGK_AGENT_REGISTRY_END -->";

async function run(projectDir) {
  const agentsDir = path.join(projectDir, ".agent", "agents");

  if (!(await fs.pathExists(agentsDir))) {
    console.error(
      chalk.red(
        "\n❌ No .agent/agents/ directory found. Run `agk init` first.\n",
      ),
    );
    return 1;
  }

  // 1. Scan all agent .md files
  const files = (await fs.readdir(agentsDir)).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    console.log(chalk.yellow("\n⚠️  No agents found in .agent/agents/\n"));
    return 0;
  }

  console.log(chalk.cyan("\n🤖 AGK Agent Registry\n"));

  const agents = [];
  for (const file of files) {
    const content = await fs.readFile(path.join(agentsDir, file), "utf8");
    const meta = parseFrontmatter(content);
    if (meta && meta.name) {
      const triggers = meta.triggers || [];
      agents.push({
        name: meta.name,
        triggers,
        file: `.agent/agents/${file}`,
      });
      const triggerStr = triggers.length > 0 ? triggers.join(", ") : "(none)";
      console.log(
        `  ${chalk.green("✓")} ${chalk.bold(meta.name)} — ${chalk.gray(triggerStr)}`,
      );
    }
  }

  // 2. Build the registry table
  const tableRows = agents
    .map((a) => {
      const triggers =
        a.triggers.length > 0 ? `\`${a.triggers.join("`, `")}\`` : "—";
      return `| ${a.name} | ${triggers} | \`${a.file}\` |`;
    })
    .join("\n");

  const registryBlock = [
    REGISTRY_START,
    "| Agent | Triggers | File |",
    "|:---|:---|:---|",
    tableRows,
    REGISTRY_END,
  ].join("\n");

  // 3. Find and update GEMINI.md
  const geminiPath = path.join(projectDir, "GEMINI.md");
  if (!(await fs.pathExists(geminiPath))) {
    console.log(
      chalk.yellow(
        "\n⚠️  No GEMINI.md found. Run `agk init` or `agk upgrade` first.\n",
      ),
    );
    return 0;
  }

  let geminiContent = await fs.readFile(geminiPath, "utf8");

  const startIdx = geminiContent.indexOf(REGISTRY_START);
  const endIdx = geminiContent.indexOf(REGISTRY_END);

  if (startIdx === -1 || endIdx === -1) {
    console.log(
      chalk.yellow(
        "\n⚠️  GEMINI.md does not contain the Agent Registry markers.",
      ),
    );
    console.log(
      chalk.gray(
        "   Run `agk upgrade --force` to get the latest GEMINI.md template.\n",
      ),
    );
    return 0;
  }

  // Replace everything between the markers (inclusive)
  geminiContent =
    geminiContent.substring(0, startIdx) +
    registryBlock +
    geminiContent.substring(endIdx + REGISTRY_END.length);

  await fs.writeFile(geminiPath, geminiContent, "utf8");

  console.log(
    chalk.green(`\n✅ Registered ${agents.length} agents in GEMINI.md`),
  );
  console.log(
    chalk.gray("   Auto-Dispatch is now active for AI assistants.\n"),
  );

  return 0;
}

module.exports = { run };
