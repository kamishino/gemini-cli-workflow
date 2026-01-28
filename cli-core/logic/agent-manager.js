const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

const PROJECT_ROOT = path.resolve(__dirname, "../../");
const CENTRAL_TEMPLATE = path.join(
  PROJECT_ROOT,
  "docs/templates/universal-agent-rules.md",
);

const AGENT_MAP = {
  amp: ".agents/",
  "kimi-cli": ".agents/",
  antigravity: ".agent/",
  "claude-code": ".claude/",
  moltbot: "skills/",
  cline: ".cline/",
  codebuddy: ".codebuddy/",
  codex: ".codex/",
  "command-code": ".commandcode/",
  continue: ".continue/",
  crush: ".crush/",
  cursor: ".cursor/",
  droid: ".factory/",
  "gemini-cli": ".gemini/",
  "github-copilot": ".github/",
  goose: ".goose/",
  junie: ".junie/",
  kilo: ".kilocode/",
  "kiro-cli": ".kiro/",
  kode: ".kode/",
  mcpjam: ".mcpjam/",
  mux: ".mux/",
  opencode: ".opencode/",
  openhands: ".openhands/",
  pi: ".pi/",
  qoder: ".qoder/",
  "qwen-code": ".qwen/",
  roo: ".roo/",
  trae: ".trae/",
  windsurf: ".windsurf/",
  zencoder: ".zencoder/",
  neovate: ".neovate/",
  pochi: ".pochi/",
};

/**
 * Scan for active agents in the project
 */
async function scanActiveAgents() {
  const active = [];
  for (const [name, dir] of Object.entries(AGENT_MAP)) {
    const fullPath = path.join(PROJECT_ROOT, dir);
    if (await fs.pathExists(fullPath)) {
      active.push({ name, path: dir });
    }
  }

  if (active.length > 0) {
    console.log(chalk.cyan("\n🔍 Active Agents detected:"));
    active.forEach((a) => console.log(`  - ${a.name} (${a.path})`));
  } else {
    console.log(chalk.yellow("\n⚠️ No common AI agent directories found."));
  }

  return active;
}

/**
 * Update the central rules template with new skill reference
 */
async function updateCentralTemplate(skillName, link) {
  try {
    if (!(await fs.pathExists(CENTRAL_TEMPLATE))) {
      // Initialize from kamiflow-rules if missing
      const source = path.join(
        PROJECT_ROOT,
        ".windsurf/rules/kamiflow-rules.md",
      );
      if (await fs.pathExists(source)) {
        await fs.copy(source, CENTRAL_TEMPLATE);
      } else {
        await fs.writeFile(CENTRAL_TEMPLATE, "# 🌊 Universal Agent Rules\n\n");
      }
    }

    let content = await fs.readFile(CENTRAL_TEMPLATE, "utf8");
    const skillEntry = `- **${skillName}**: ${link}`;

    if (!content.includes("## 🧩 EXTENSION SKILLS")) {
      content += `\n\n## 🧩 EXTENSION SKILLS (Auto-managed)\n${skillEntry}\n`;
    } else if (!content.includes(skillName)) {
      content = content.replace(
        "## 🧩 EXTENSION SKILLS (Auto-managed)",
        `## 🧩 EXTENSION SKILLS (Auto-managed)\n${skillEntry}`,
      );
    }

    await fs.writeFile(CENTRAL_TEMPLATE, content);
    console.log(
      chalk.green(
        `\n✅ Updated central template: ${path.basename(CENTRAL_TEMPLATE)}`,
      ),
    );
  } catch (error) {
    console.error(
      chalk.red(`\n❌ Failed to update template: ${error.message}`),
    );
  }
}

module.exports = {
  scanActiveAgents,
  updateCentralTemplate,
};
