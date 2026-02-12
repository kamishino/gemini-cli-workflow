const fs = require("fs-extra");
const path = require("upath");
const toml = require("@iarna/toml");
const logger = require("../utils/logger");

/**
 * DocSyncManager - Handles synchronization of command documentation and Wiki files
 * Modularized from scripts/sync-docs.js for use by Chronicler and CLI
 */
class DocSyncManager {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.commandsRoot = path.join(projectRoot, ".gemini/commands/kamiflow");
    
    this.wikiFiles = {
      sniper: path.join(projectRoot, "resources/docs/commands/core.md"),
      bridge: path.join(projectRoot, "resources/docs/commands/core.md"),
      autopilot: path.join(projectRoot, "resources/docs/commands/dev.md"),
      ops: path.join(projectRoot, "resources/docs/commands/ops.md"),
      terminal: path.join(projectRoot, "resources/docs/commands/terminal.md"),
      global: path.join(projectRoot, "resources/docs/commands/README.md"),
    };

    this.groupTitles = {
      sniper: "🎯 Sniper Model (Core Flow)",
      bridge: "🌉 The Bridge (IDE Integration)",
      autopilot: "🚀 Auto-Pilot (Automation)",
      ops: "🧠 Operations (Management)",
      terminal: "🖥️ Terminal CLI Guide (Flow Suite)",
    };

    this.groupOrder = ["sniper", "bridge", "autopilot", "ops", "terminal"];
  }

  /**
   * Run the full documentation sync process
   */
  async sync() {
    try {
      const reporter = logger.createReporter("Documentation Sync");
      
      // 1. Discover Commands
      const commandMap = await this.discoverCommands();
      
      // 2. Add CLI Commands
      commandMap.push(...this.getCliCommands());

      // 3. Verify Protocols
      this.verifyProtocols(reporter);

      // 4. Determine Groups
      const pluginGroups = commandMap
        .filter(c => c.folder && c.folder.startsWith("p-"))
        .map(c => c.folder)
        .filter((v, i, a) => a.indexOf(v) === i);
      
      const finalOrder = [
        ...this.groupOrder.filter((g) => g !== "terminal"),
        ...pluginGroups,
        "terminal",
      ];

      // 5. Update Targets
      const targetMap = [
        { file: this.wikiFiles.sniper, groups: ["sniper", "bridge"] },
        { file: this.wikiFiles.ops, groups: ["ops"] },
        { file: this.wikiFiles.autopilot, groups: ["autopilot"] },
        { file: this.wikiFiles.terminal, groups: ["terminal"] },
        { file: this.wikiFiles.global, groups: finalOrder },
        { file: path.join(this.projectRoot, "GEMINI.md"), groups: finalOrder },
        { file: path.join(this.projectRoot, "resources/templates/gemini.md"), groups: finalOrder },
        { file: path.join(this.projectRoot, "resources/docs/overview.md"), groups: finalOrder },
      ];

      for (const target of targetMap) {
        if (!fs.existsSync(target.file)) continue;

        let fullMd = "";
        for (const groupKey of target.groups) {
          fullMd += this.generateGroupTable(commandMap, groupKey);
        }

        const updated = this.updateFileWithMarkers(target.file, fullMd);
        const fileName = path.basename(target.file);
        if (updated) reporter.push(fileName, "SUCCESS", "Markers Updated");
        else reporter.push(fileName, "SUCCESS", "Up to date");
      }

      reporter.print();
      return true;
    } catch (error) {
      logger.error(`DocSync failed: ${error.message}`);
      return false;
    }
  }

  async discoverCommands() {
    const commandMap = [];
    if (!fs.existsSync(this.commandsRoot)) return [];

    const categories = fs.readdirSync(this.commandsRoot).filter((f) => {
      return fs.statSync(path.join(this.commandsRoot, f)).isDirectory();
    });

    for (const cat of categories) {
      const catDir = path.join(this.commandsRoot, cat);
      if (cat.startsWith("p-")) {
        this.groupTitles[cat] = this.formatPluginTitle(cat);
      }

      const files = fs.readdirSync(catDir).filter((f) => f.endsWith(".toml"));
      for (const file of files) {
        const filePath = path.join(catDir, file);
        const content = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
        const parsed = toml.parse(content);
        const cmdName = file.replace(".toml", "");

        commandMap.push({
          fullCommand: `/kamiflow:${cat}:${cmdName}`,
          folder: cat,
          name: cmdName,
          description: parsed.description || "No description provided.",
          group: parsed.group || cat,
          order: parsed.order || 999,
        });
      }
    }
    return commandMap;
  }

  getCliCommands() {
    return [
      { fullCommand: "kamiflow init", name: "init", group: "terminal", order: 10, description: "Initialize a project with KamiFlow." },
      { fullCommand: "kamiflow doctor", name: "doctor", group: "terminal", order: 20, description: "Check project health." },
      { fullCommand: "kamiflow sync", name: "sync", group: "terminal", order: 30, description: "Synchronize command documentation." },
      { fullCommand: "kamiflow archive", name: "archive", group: "terminal", order: 40, description: "Archive completed tasks." },
      { fullCommand: "kamiflow config", name: "config", group: "terminal", order: 50, description: "Manage persistent project settings." },
      { fullCommand: "kamiflow upgrade", name: "upgrade", group: "terminal", order: 60, description: "Update KamiFlow to the latest version." },
      { fullCommand: "kamiflow info", name: "info", group: "terminal", order: 70, description: "Display core location and version." },
      { fullCommand: "kamiflow resume", name: "resume", group: "terminal", order: 75, description: "Resume workflow from last checkpoint." },
    ];
  }

  verifyProtocols(reporter) {
    const searchPaths = [
      path.join(this.projectRoot, ".gemini/rules"),
      path.join(this.projectRoot, "dist/.gemini/rules"),
    ];

    let found = false;
    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        const files = fs.readdirSync(p).filter(f => f.endsWith("-core.md"));
        if (files.length > 0) found = true;
      }
    }
    if (!found) reporter.push("Protocols", "WARNING", "No *-core.md found");
  }

  formatPluginTitle(folderName) {
    if (folderName === "p-seed") return "🌱 The Seed Hub (Plugin)";
    const name = folderName.replace("p-", "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return `🧩 ${name} (Plugin)`;
  }

  generateGroupTable(commandMap, groupKey) {
    const groupCommands = commandMap
      .filter((c) => c.group === groupKey)
      .sort((a, b) => a.order - b.order);

    if (groupCommands.length === 0) return "";

    let md = `
### ${this.groupTitles[groupKey] || groupKey}

`;
    md += `| Command | Goal |
| :--- | :--- |
`;

    groupCommands.forEach((cmd) => {
      const safeCommand = cmd.fullCommand.replace(/`/g, "\\`").replace(/\$/g, "\\$");
      md += `| \`${safeCommand}\` | **${cmd.description}** |\n`;
    });

    md += "\n";
    return md;
  }

  updateFileWithMarkers(file, newContent) {
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
}

module.exports = DocSyncManager;
