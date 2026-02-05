const fs = require("fs-extra");
const path = require("upath");
const toml = require("@iarna/toml");
const chalk = require("chalk");
const logger = require("../utils/logger");

// Path adjusted for deep structure (cli-core/scripts/)
const COMMANDS_ROOT = path.join(__dirname, "../../.gemini/commands/kamiflow");

const WIKI_FILES = {
  sniper: path.join(__dirname, "../../resources/docs/commands/core.md"),
  bridge: path.join(__dirname, "../../resources/docs/commands/core.md"),
  autopilot: path.join(__dirname, "../../resources/docs/commands/dev.md"),
  management: path.join(__dirname, "../../resources/docs/commands/ops.md"),
  terminal: path.join(__dirname, "../../resources/docs/commands/terminal.md"),
  global: path.join(__dirname, "../../resources/docs/commands/README.md"),
};

const GROUP_TITLES = {
  sniper: "🎯 Sniper Model (Core Flow)",
  bridge: "🌉 The Bridge (IDE Integration)",
  autopilot: "🚀 Auto-Pilot (Automation)",
  management: "🧠 Management (Operations)",
  terminal: "🖥️ Terminal CLI Guide (Flow Suite)",
};

const GROUP_ORDER = ["sniper", "bridge", "autopilot", "management", "terminal"];

/**
 * Format plugin name for display (e.g., p-seed -> 🌱 Seed Hub)
 */
function formatPluginTitle(folderName) {
  if (folderName === "p-seed") return "🌱 The Seed Hub (Plugin)";

  // Generic formatter for other plugins
  const name = folderName
    .replace("p-", "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return `🧩 ${name} (Plugin)`;
}

async function main() {
  try {
    logger.header("KamiFlow Documentation Synchronizer");
    const reporter = logger.createReporter("Documentation Sync");

    // 1. Discover Categories (Core + Plugins)
    const commandMap = [];
    if (!fs.existsSync(COMMANDS_ROOT)) {
      throw new Error(`Commands root not found: ${COMMANDS_ROOT}`);
    }

    const categories = fs.readdirSync(COMMANDS_ROOT).filter((f) => {
      return fs.statSync(path.join(COMMANDS_ROOT, f)).isDirectory();
    });

    const pluginGroups = [];

    for (const cat of categories) {
      const catDir = path.join(COMMANDS_ROOT, cat);
      const isPlugin = cat.startsWith("p-");

      if (isPlugin) {
        const title = formatPluginTitle(cat);
        GROUP_TITLES[cat] = title;
        pluginGroups.push(cat);
      }

      const files = fs.readdirSync(catDir).filter((f) => f.endsWith(".toml"));
      for (const file of files) {
        const filePath = path.join(catDir, file);
        const content = fs.readFileSync(filePath, "utf8");
        const cleanContent = content.replace(/^\uFEFF/, "");
        const parsed = toml.parse(cleanContent);
        const cmdName = file.replace(".toml", "");

        commandMap.push({
          fullCommand: `/kamiflow:${cat}:${cmdName}`,
          folder: cat,
          name: cmdName,
          description: parsed.description || "No description provided.",
          group: parsed.group || cat, // Default to folder name as group
          order: parsed.order || 999,
        });
      }
    }

    // 2. Add Mock Terminal CLI commands
    const cliCommands = [
      { fullCommand: "kamiflow init-flow", name: "init-flow", group: "terminal", order: 10, description: "Initialize a project with KamiFlow." },
      { fullCommand: "kamiflow doctor-flow", name: "doctor-flow", group: "terminal", order: 20, description: "Check project health." },
      { fullCommand: "kamiflow sync-flow", name: "sync-flow", group: "terminal", order: 30, description: "Synchronize command documentation." },
      { fullCommand: "kamiflow archive-flow", name: "archive-flow", group: "terminal", order: 40, description: "Archive completed tasks." },
      { fullCommand: "kamiflow config-flow", name: "config-flow", group: "terminal", order: 50, description: "Manage persistent project settings." },
      {
        fullCommand: "kamiflow update-flow",
        name: "update-flow",
        group: "terminal",
        order: 60,
        description: "Update KamiFlow to the latest version.",
      },
      { fullCommand: "kamiflow info-flow", name: "info-flow", group: "terminal", order: 70, description: "Display core location and version." },
      {
        fullCommand: "kamiflow resume-flow",
        name: "resume-flow",
        group: "terminal",
        order: 75,
        description: "Resume workflow from last checkpoint.",
      },
    ];
    commandMap.push(...cliCommands);

    // 2.5. Verify v2.0 protocols exist (v2.0 enhancement)
    const SEARCH_PATHS = [
      path.join(__dirname, "../../.gemini/rules"),
      path.join(__dirname, "../../dist/.gemini/rules")
    ];

    let foundProtocols = [];
    for (const searchPath of SEARCH_PATHS) {
      if (fs.existsSync(searchPath)) {
        const files = fs.readdirSync(searchPath).filter(f => f.endsWith("-core.md"));
        files.forEach(f => {
          if (!foundProtocols.includes(f)) {
            foundProtocols.push(f);
            reporter.push(f, "SUCCESS", `Protocol verified in ${path.relative(process.cwd(), searchPath)}`);
          }
        });
      }
    }

    if (foundProtocols.length === 0) {
      reporter.push("Protocols", "WARNING", "No *-core.md protocols found in .gemini/rules");
    }

    // 3. Define Final Order (Core first, then Plugins, then Terminal)
    const FINAL_ORDER = [...GROUP_ORDER.filter((g) => g !== "terminal"), ...pluginGroups, "terminal"];

    // 4. Manual targets processing
    const TARGET_MAP = [
      { file: WIKI_FILES.sniper, groups: ["sniper", "bridge"] },
      { file: WIKI_FILES.management, groups: ["management"] },
      { file: WIKI_FILES.autopilot, groups: ["autopilot"] },
      { file: WIKI_FILES.terminal, groups: ["terminal"] },
      { file: WIKI_FILES.global, groups: FINAL_ORDER },
      { file: path.join(__dirname, "../../GEMINI.md"), groups: FINAL_ORDER },
      { file: path.join(__dirname, "../../resources/templates/gemini.md"), groups: FINAL_ORDER },
      { file: path.join(__dirname, "../../resources/docs/overview.md"), groups: FINAL_ORDER },
    ];

    const syncTasks = TARGET_MAP.map(async (target) => {
      if (!fs.existsSync(target.file)) return;

      let fullMd = "";
      for (const groupKey of target.groups) {
        fullMd += generateGroupTable(commandMap, groupKey);
      }

      const updated = updateFileWithMarkers(target.file, fullMd);
      const fileName = path.basename(target.file);
      if (updated) reporter.push(fileName, "SUCCESS", "Markers Updated");
      else reporter.push(fileName, "SUCCESS", "Up to date");
    });

    await Promise.all(syncTasks);
    reporter.print();

    logger.success("Documentation synchronization complete.");
  } catch (error) {
    logger.error(`Sync failed: ${error.message}`);
    process.exit(1);
  }
}

function generateGroupTable(commandMap, groupKey) {
  const groupCommands = commandMap.filter((c) => c.group === groupKey).sort((a, b) => a.order - b.order);

  if (groupCommands.length === 0) return "";

  let md = `\n### ${GROUP_TITLES[groupKey] || groupKey}\n\n`;
  md += `| Command | Goal |\n| :--- | :--- |\n`;

  groupCommands.forEach((cmd) => {
    const safeCommand = cmd.fullCommand.replace(/`/g, "\\`");
    md += `| \`${safeCommand}\` | **${cmd.description}** |\n`;
  });

  md += "\n";
  return md;
}

function updateFileWithMarkers(file, newContent) {
  let content = fs.readFileSync(file, "utf8");
  const markerStart = "<!-- KAMI_COMMAND_LIST_START -->";
  const markerEnd = "<!-- KAMI_COMMAND_LIST_END -->";

  if (content.indexOf(markerStart) !== -1 && content.indexOf(markerEnd) !== -1) {
    const parts = content.split(markerStart);
    const pre = parts[0];
    const rest = parts[1].split(markerEnd);
    const post = rest[1];

    const finalContent = pre + markerStart + "\n" + newContent + markerEnd + post;
    if (finalContent !== content) {
      fs.writeFileSync(file, finalContent);
      return true;
    }
  }
  return false;
}

main();
