#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const logger = require("../utils/logger");
const { initI18n, t } = require("../utils/i18n");
const { initializeProject } = require("../logic/installer");
const { runDoctor } = require("../logic/doctor");
const { runUpdate, silentCheck, syncGlobalRules } = require("../logic/updater");
const path = require("upath");
const fs = require("fs-extra");

const program = new Command();

/**
 * Execute a command action with standard error handling and logging
 */
async function execute(title, action) {
  try {
    // Inject silent version check
    await silentCheck();

    if (title) logger.header(title);
    await action();
  } catch (error) {
    logger.error(error.message);
    if (process.env.KAMI_DEBUG === "true") {
      console.error(error);
    }
    process.exit(1);
  }
}

// Get version from package.json
const packageJson = require("../package.json");

program.name("kamiflow").description("KamiFlow CLI - The Orchestrator for Indie Builders").version(packageJson.version);

// --- CLI UX Alignment (Task 110 & 111) ---
const isDev = process.env.KAMI_ENV === "development";

const CATEGORIES = {
  project: {
    title: "📁 PROJECT MANAGEMENT",
    color: chalk.green,
    commands: ["init-project", "check-health", "upgrade-core", "sync-rules", "show-info", "check-config", "manage-config", "archive-task", "search-workspace", "sync-db", "resume-workflow", "update-roadmap"],
  },
  automation: {
    title: "🤖 AUTOMATION & SWARM",
    color: chalk.magenta,
    commands: ["run-saiyan", "run-batch", "check-swarm", "lock-swarm", "unlock-swarm"],
  },
  maintenance: {
    title: "🔧 MAINTENANCE (MASTER REPO)",
    color: chalk.red,
    commands: ["clean-rules", "audit-docs", "sync-docs", "build-agents", "sync-skills", "_agent-scan", "_idea-create", "_idea-refine", "_idea-promote", "_idea-analyze", "_rules-update"],
    hidden: !isDev,
  },
};

program.configureHelp({
  formatHelp: (cmd, helper) => {
    const header = chalk.bold.cyan(`\nKamiFlow CLI v${packageJson.version}`) + " - " + chalk.italic(cmd.description()) + "\n";
    const usage = `\n${chalk.yellow("Usage:")} ${helper.commandUsage(cmd)}\n`;

    let sections = [header, usage];

    for (const key in CATEGORIES) {
      const group = CATEGORIES[key];
      if (group.hidden) continue;

      const groupCommands = cmd.commands.filter((c) => group.commands.includes(c.name()));
      if (groupCommands.length === 0) continue;

      let groupOutput = `\n${group.color(chalk.bold(group.title))}\n`;
      groupCommands.sort((a, b) => {
        return group.commands.indexOf(a.name()) - group.commands.indexOf(b.name());
      }).forEach((c) => {
        if (c.name().startsWith("_")) return;
        
        const alias = c.alias();
        const name = c.name();
        const desc = c.description();

        const col1 = alias ? chalk.cyan(alias) : chalk.cyan(name);
        const col2 = alias ? chalk.gray(`[${name}]`) : "";
        
        groupOutput += `  ${col1.padEnd(25)} ${col2.padEnd(25)} ${desc}\n`;
      });
      sections.push(groupOutput);
    }

    const optionsList = helper.visibleOptions(cmd);
    if (optionsList.length > 0) {
      const options = `\n${chalk.yellow("Options:")}\n` + optionsList.map(o => `  ${helper.optionTerm(o).padEnd(25)} ${helper.optionDescription(o)}`).join('\n') + '\n';
      sections.push(options);
    }

    return sections.join("");
  }
});

// Init command
program
  .command("init-project [path]")
  .alias("init")
  .description("Initialize KamiFlow in a project directory")
  .option("-m, --mode <mode>", "Integration mode: link, submodule, or standalone", "link")
  .option("-p, --preset <preset>", "Project preset: basic or full", "basic")
  .option("-d, --dev", "Enable contributor mode with symbolic links", false)
  .option("--skip-interview", "Skip interactive questions and use defaults")
  .action(async (targetPath, options) => {
    await execute(`KamiFlow CLI v${packageJson.version}`, async () => {
      const projectPath = path.resolve(process.cwd(), targetPath || ".");
      await initializeProject(projectPath, options);

      logger.success("KamiFlow initialization complete!");
      console.log(chalk.gray("\nNext steps:"));
      console.log(chalk.gray(`  1. cd ${targetPath || "."}`));
      console.log(chalk.gray("  2. gemini"));
      console.log(chalk.gray("  3. /kamiflow:ops:wake\n"));
    });
  });

// Doctor command
program
  .command("check-health")
  .alias("doctor")
  .description("Check system health and KamiFlow configuration")
  .option("--fix", "Attempt to automatically fix detected issues")
  .option("--auto-fix", "Bypass confirmation prompts during healing")
  .action(async (options) => {
    await execute("KamiFlow System Doctor", async () => {
      const results = await runDoctor(options);
      if (results.allHealthy) {
        logger.success("All systems operational!\n");
      } else {
        logger.warn("Some issues detected. See above for details.\n");
        process.exit(1);
      }
    });
  });

// Update command
program
  .command("upgrade-core")
  .alias("upgrade")
  .description("Update KamiFlow to the latest version")
  .option("-f, --force", "Force overwrite existing files (Standalone mode)", false)
  .action(async (options) => {
    await execute(null, async () => {
      const projectPath = process.cwd();
      const result = await runUpdate(projectPath, options);
      if (!result.success) {
        process.exit(1);
      }
    });
  });

// Sync Rules command
program
  .command("sync-rules")
  .alias("rules")
  .description("Synchronize only global behavioral rules from KamiFlow core")
  .action(async () => {
    await execute(null, async () => {
      const projectPath = process.cwd();
      const success = await syncGlobalRules(projectPath);
      if (!success) {
        process.exit(1);
      }
    });
  });

// Clean rules command
program
  .command("clean-rules")
  .alias("wipe")
  .description("Internal: Surgical cleanup of transpiled rules directory to prevent system redundancy")
  .action(async () => {
    await execute("Surgical Clean", async () => {
      const paths = [
        path.join(process.cwd(), ".gemini/rules"),
        path.join(process.cwd(), "dist/.gemini/rules")
      ];
      
      for (const p of paths) {
        if (await fs.pathExists(p)) {
          const files = await fs.readdir(p);
          for (const file of files) {
            await fs.remove(path.join(p, file));
          }
          logger.hint(`Cleared: ${path.relative(process.cwd(), p)}`);
        }
      }
      logger.success("System rules directory cleared.");
    });
  });

// Info command
program
  .command("show-info")
  .alias("info")
  .description("Display KamiFlow core location and version")
  .action(() => {
    const corePath = path.resolve(__dirname, "..");
    console.log(chalk.cyan("\n📦 KamiFlow Core Information:\n"));
    console.log(chalk.gray("Version:"), chalk.white(packageJson.version));
    console.log(chalk.gray("Location:"), chalk.white(corePath));
    console.log(chalk.gray("Bin:"), chalk.white(__filename));
    console.log();
  });

// Validate command
program
  .command("check-config")
  .alias("validate")
  .description("Validate configuration files (TOML)")
  .option("-p, --path <path>", "Path to directory or file to validate", ".gemini/commands/kamiflow")
  .action(async (options) => {
    await execute("KamiFlow Configuration Validator", async () => {
      const { validateTomlFiles } = require("../validators/toml-validator");
      const targetPath = path.resolve(process.cwd(), options.path);
      const result = await validateTomlFiles(targetPath);

      console.log(chalk.cyan("\n" + "─".repeat(50)));
      if (result.invalid === 0) {
        logger.success(`All ${result.total} TOML files are valid!\n`);
      } else {
        logger.error(`Found ${result.invalid} invalid TOML files.\n`);
        process.exit(1);
      }
    });
  });

// Doc Audit command
program
  .command("audit-docs")
  .alias("audit")
  .description("Scan documentation for broken links and drift")
  .option("--fix", "Automatically attempt to fix issues")
  .option("--dry-run", "Report only, no prompts")
  .action(async (options) => {
    await execute(null, async () => {
      const { runDocAudit } = require("../logic/doc-auditor");
      await runDocAudit(options);
    });
  });

// Config command
const configFlow = program
  .command("manage-config")
  .alias("config")
  .description("Manage project configuration. Common keys: language, strategy, maxRetries.");

configFlow
  .command("set <key> <value>")
  .description("Set a configuration value")
  .option("-g, --global", "Set globally for the current user", false)
  .action(async (key, value, options) => {
    await execute(null, async () => {
      const { ConfigManager } = require("../logic/config-manager");
      const config = new ConfigManager();
      const success = await config.set(key, value, options.global);
      if (success) {
        logger.success(`Set ${key} = ${value} (${options.global ? "Global" : "Local"})`);
      }
    });
  });

configFlow
  .command("get <key>")
  .description("Get a configuration value")
  .action(async (key) => {
    await execute(null, async () => {
      const { ConfigManager } = require("../logic/config-manager");
      const config = new ConfigManager();
      const value = await config.get(key);
      console.log(value !== undefined ? value : chalk.yellow("Not set"));
    });
  });

configFlow
  .command("sync")
  .description("Synchronize local configuration with latest system defaults (adds missing keys)")
  .action(async () => {
    await execute(null, async () => {
      const { ConfigManager } = require("../logic/config-manager");
      const config = new ConfigManager();
      const report = await config.syncLocalConfig();

      if (report.success) {
        if (report.added.length > 0) {
          logger.success(`Synchronized configuration. Added ${report.added.length} missing key(s).`);
          report.added.forEach((key) => logger.hint(`   [+] ${key}`));
        } else {
          logger.success("Project configuration is already up to date.");
        }

        if (report.orphaned.length > 0) {
          console.log(chalk.yellow(`\n⚠️  Found ${report.orphaned.length} orphaned key(s) not in current schema:`));
          report.orphaned.forEach((key) => console.log(chalk.gray(`   [-] ${key}`)));
          console.log(chalk.gray("   (These keys are preserved but ignored by the system)\n"));
        }
      }
    });
  });

configFlow
  .command("list")
  .alias("ls")
  .description("List all configuration values with their sources")
  .action(async () => {
    await execute(null, async () => {
      const { ConfigManager } = require("../logic/config-manager");
      const config = new ConfigManager();
      const data = await config.list();
      logger.header("KamiFlow Combined Configuration");
      if (data.length > 0) {
        console.table(data);
      } else {
        logger.info("No configuration found.");
      }
      console.log();
    });
  });

configFlow
  .command("get-state <key>")
  .description("Get a global state value")
  .action(async (key) => {
    await execute(null, async () => {
      const { ConfigManager } = require("../logic/config-manager");
      const config = new ConfigManager();
      const value = await config.getGlobalState(key);
      console.log(value !== undefined ? value : "undefined");
    });
  });

configFlow
  .command("set-state <key> <value>")
  .description("Set a global state value")
  .action(async (key, value) => {
    await execute(null, async () => {
      const { ConfigManager } = require("../logic/config-manager");
      const config = new ConfigManager();
      // Handle boolean strings
      let finalValue = value;
      if (value === "true") finalValue = true;
      if (value === "false") finalValue = false;

      const success = await config.setGlobalState(key, finalValue);
      if (success) {
        logger.success(`Set global state: ${key} = ${finalValue}`);
      }
    });
  });

// Documentation sync command
program
  .command("sync-docs")
  .alias("sync")
  .description("Synchronize command documentation")
  .action(async () => {
    await execute(null, async () => {
      logger.info("Synchronizing documentation...\n");
      const execa = require("execa");
      const scriptPath = path.join(__dirname, "../scripts/sync-docs.js");
      await execa("node", [scriptPath], { stdio: "inherit" });
    });
  });

// Roadmap update command
program
  .command("update-roadmap")
  .alias("roadmap")
  .description("Synchronize and update the strategic roadmap")
  .action(async () => {
    await execute(null, async () => {
      logger.info("Generating roadmap structure...\n");
      const execa = require("execa");
      const scriptPath = path.join(__dirname, "../scripts/roadmap-generator.js");
      await execa("node", [scriptPath], { stdio: "inherit" });
    });
  });

// Resume workflow command
program
  .command("resume-workflow [id]")
  .alias("resume")
  .description("Resume an interrupted workflow from the last checkpoint")
  .action(async () => {
    console.log(chalk.cyan("\n📍 Workflow Resurrector:\n"));
    console.log(chalk.white("This is an AI-Logic command that requires Gemini's reasoning engine."));
    console.log(chalk.gray("👉 Please use:"), chalk.yellow("/kamiflow:ops:resume [id]"), chalk.gray("inside Gemini CLI.\n"));
  });

// Strategic Expert Advisor command
program
  .command("advice [target]")
  .alias("consult")
  .description("Get strategic directions and UX/UI advice from the AI Advisor")
  .action(async () => {
    console.log(chalk.cyan("\n🧭 Strategic Expert Advisor:\n"));
    console.log(chalk.white("This is an AI-Logic command that requires Gemini's reasoning engine."));
    console.log(chalk.gray("👉 Please use:"), chalk.yellow("/kamiflow:ops:advice [target]"), chalk.gray("inside Gemini CLI.\n"));
  });

// Sync Agents command
program
  .command("build-agents")
  .alias("transpile")
  .description("Assemble AI Agent configurations from Markdown blueprints")
  .action(async () => {
    await execute(null, async () => {
      const { Transpiler } = require("../logic/transpiler");
      const transpiler = new Transpiler(process.cwd());
      await transpiler.runFromRegistry(path.join(transpiler.blueprintDir, "registry.md"));
    });
  });

// Archive command
program
  .command("archive-task [id]")
  .alias("archive")
  .description("Archive completed tasks")
  .option("-f, --force", "Skip confirmation prompt")
  .option("-a, --all", "Archive all completed tasks")
  .action(async (id, options) => {
    await execute(null, async () => {
      const { runArchivist } = require("../logic/archivist");
      await runArchivist({
        targetId: id,
        force: options.force,
        all: options.all,
      });
    });
  });

// Idea Sandbox Logic
program
  .command("_idea-create <title>", { hidden: true })
  .description("Internal: Create a new idea draft (used by Gemini CLI)")
  .option("-c, --content <content>", "Full content of the idea")
  .option("-s, --slug <slug>", "Summarized slug for filename")
  .option("-t, --type <type>", "Idea type: draft or discovery", "draft")
  .action(async (title, options) => {
    await execute(null, async () => {
      const { createIdea } = require("../logic/idea-manager");
      await createIdea(title, options.content, options.slug, options.type);
    });
  });

program
  .command("_idea-refine <path> <content>", { hidden: true })
  .description("Internal: Prepend a refinement to an idea (used by Gemini CLI)")
  .action(async (filePath, content) => {
    await execute(null, async () => {
      const { prependRefinement } = require("../logic/idea-manager");
      await prependRefinement(filePath, content);
    });
  });

program
  .command("_idea-promote <path>", { hidden: true })
  .description("Internal: Promote an idea draft (used by Gemini CLI)")
  .option("-f, --force", "Bypass quality gate")
  .action(async (filePath, options) => {
    await execute(null, async () => {
      const { promoteIdea } = require("../logic/idea-manager");
      await promoteIdea(filePath, options);
    });
  });

program
  .command("_idea-analyze <path> <scoresJson>", { hidden: true })
  .description("Internal: Update idea scores (used by Gemini CLI)")
  .action(async (filePath, scoresJson) => {
    await execute(null, async () => {
      const { analyzeIdea } = require("../logic/idea-manager");
      const scores = JSON.parse(scoresJson);
      await analyzeIdea(filePath, scores);
    });
  });

// Agent Management Logic
program
  .command("_agent-scan", { hidden: true })
  .description("Internal: Scan for active AI agents in the project")
  .action(async () => {
    await execute(null, async () => {
      const { scanActiveAgents } = require("../logic/agent-manager");
      await scanActiveAgents();
    });
  });

program
  .command("_rules-update <skillName> <link>", { hidden: true })
  .description("Internal: Update the central rules template with a new skill")
  .action(async (skillName, link) => {
    await execute(null, async () => {
      const { updateCentralTemplate } = require("../logic/agent-manager");
      await updateCentralTemplate(skillName, link);
    });
  });

program
  .command("sync-skills")
  .alias("skills")
  .description("Sync skills from resources/skills/ to .gemini/skills/")
  .action(async () => {
    await execute("Syncing Skills", async () => {
      const { syncSkills } = require("../logic/skill-sync");
      await syncSkills();
    });
  });

const { isLocked, acquireLock, releaseLock, getSwarmStatus } = require("../logic/swarm-dispatcher");

/**
 * --- SWARM COMMANDS ---
 */

program
  .command("check-swarm")
  .alias("swarm")
  .description("Show active locks and swarm health")
  .action(async () => {
    await execute(null, async () => {
      const status = await getSwarmStatus();
      if (status.activeLocks && status.activeLocks.length > 0) {
        logger.warn("Active Swarm Locks:");
        status.activeLocks.forEach((l) => {
          logger.hint(`${l.folder}: Locked by ${l.agent} (${l.timestamp})`);
        });
      } else {
        logger.success("Swarm is ready. No active locks.");
      }
    });
  });

program
  .command("lock-swarm <folder> <agentId>")
  .description("Manually set a swarm lock")
  .action(async (folder, agentId) => {
    await execute(null, async () => {
      await acquireLock(path.resolve(process.cwd(), folder), agentId);
    });
  });

program
  .command("unlock-swarm <folder>")
  .description("Manually release a swarm lock")
  .action(async (folder) => {
    await execute(null, async () => {
      await releaseLock(path.resolve(process.cwd(), folder));
    });
  });

program
  .command("search-workspace [query]")
  .alias("search")
  .description("Search workspace files (ideas, tasks, archives)")
  .option("-c, --category <category>", "Filter by category: ideas, tasks, archive")
  .option("-l, --limit <limit>", "Maximum results to show", "20")
  .option("-s, --synonyms <synonyms>", "Comma-separated list of synonyms for query expansion")
  .option("--rebuild", "Rebuild index before searching")
  .option("--stats", "Show index statistics")
  .action(async (query, options) => {
    await execute(null, async () => {
      const { WorkspaceIndex } = require("../logic/workspace-index");
      const index = new WorkspaceIndex(process.cwd());
      
      try {
        await index.initialize();
        
        if (options.stats) {
          const stats = index.getStats();
          console.log(chalk.cyan("\n📊 Workspace Index Statistics\n"));
          console.log(chalk.gray("Total files:"), chalk.white(stats.totalFiles));
          console.log(chalk.gray("Knowledge Graph:"), chalk.white(`${stats.totalRelationships} relationships`));
          console.log(chalk.gray("Total size:"), chalk.white(`${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`));
          console.log(chalk.gray("Last indexed:"), chalk.white(stats.lastIndexed ? stats.lastIndexed.toLocaleString() : "Never"));
          
          if (stats.byCategory && stats.byCategory.length > 0) {
            console.log(chalk.gray("\nBy category:"));
            stats.byCategory.forEach((data) => {
              console.log(chalk.gray(`  ${data.category}:`), chalk.white(`${data.count} files, ${(data.size / 1024).toFixed(1)} KB`));
            });
          }
          console.log();
          return;
        }
        
        if (options.rebuild) {
          console.log(chalk.gray("Rebuilding index..."));
          const stats = await index.rebuild();
          console.log(chalk.green(`✅ Indexed ${stats.total} files\n`));
          if (!query) return;
        }
        
        if (!query) {
          console.log(chalk.yellow("No search query provided. Use --stats or --rebuild, or provide a query.\n"));
          return;
        }
        
        const synonyms = options.synonyms ? options.synonyms.split(",").map(s => s.trim()) : [];
        const results = await index.search(query, {
          category: options.category,
          limit: parseInt(options.limit),
          synonyms
        });
        
        console.log(chalk.cyan(`\n🔍 Searching workspace for: "${query}"${synonyms.length > 0 ? ` (expanded: ${synonyms.join(", ")})` : ""}\n`));
        
        if (results.results.length === 0) {
          console.log(chalk.yellow("No results found.\n"));
          return;
        }
        
        results.results.forEach((result, idx) => {
          console.log(chalk.white(`${idx + 1}. `) + chalk.cyan(result.title));
          console.log(chalk.gray(`   ${result.category}/${result.filePath}`));
          if (result.snippet) {
            console.log(chalk.gray(`   ${result.snippet.replace(/<mark>/g, chalk.yellow("<mark>")).replace(/<\/mark>/g, "</mark>")}`));
          }
          console.log(chalk.gray(`   Score: ${result.score.toFixed(2)} | Modified: ${result.modified.toLocaleDateString()}`));
          console.log();
        });
        
        console.log(chalk.gray(`Found ${results.results.length} results in ${results.took}\n`));
        
      } finally {
        index.close();
      }
    });
  });

// Workspace Database Sync Command Group
const syncDbFlow = program
  .command("sync-db")
  .alias("db")
  .description("Synchronize private workspace data (.kamiflow/)");

syncDbFlow
  .command("setup")
  .description("Configure sync backend and credentials")
  .option("--backend <url>", "Backend URL")
  .option(
    "--api-key <key>",
    "API key (not recommended, use interactive prompt)",
  )
  .option("--mode <mode>", "Sync mode: manual, auto, on-command")
  .action(async (options) => {
    await execute("KamiFlow Sync Setup", async () => {
      const { setupSync } = require("../logic/sync-setup");
      await setupSync(process.cwd(), options);
    });
  });

syncDbFlow
  .command("push")
  .description("Upload local changes to sync backend")
  .action(async () => {
    await execute(null, async () => {
      const { SyncManager } = require("../logic/sync-manager");
      const manager = new SyncManager(process.cwd());
      await manager.push();
    });
  });

syncDbFlow
  .command("pull")
  .description("Download remote changes from sync backend")
  .action(async () => {
    await execute(null, async () => {
      const { SyncManager } = require("../logic/sync-manager");
      const manager = new SyncManager(process.cwd());
      await manager.pull();
    });
  });

syncDbFlow
  .command("status")
  .description("Show sync status and pending changes")
  .action(async () => {
    await execute(null, async () => {
      const { SyncManager } = require("../logic/sync-manager");
      const manager = new SyncManager(process.cwd());
      const status = await manager.status();

      console.log(chalk.cyan("\n📊 Sync Status\n"));
      console.log(chalk.gray("Backend:"), chalk.white(status.backend));
      console.log(chalk.gray("Project ID:"), chalk.white(status.projectId));
      console.log(chalk.gray("Mode:"), chalk.white(status.mode));
      console.log(
        chalk.gray("Last sync:"),
        chalk.white(
          status.lastSync
            ? new Date(status.lastSync).toLocaleString()
            : "Never",
        ),
      );
      console.log(
        chalk.gray("Pending files:"),
        chalk.white(status.pendingFiles),
      );

      if (status.pendingFiles > 0) {
        console.log(chalk.gray("\nFiles to sync:"));
        status.files.slice(0, 5).forEach((f) => {
          console.log(
            chalk.gray(`  • ${f.path} (${(f.size / 1024).toFixed(1)} KB)`),
          );
        });
        if (status.files.length > 5) {
          console.log(chalk.gray(`  ... and ${status.files.length - 5} more`));
        }
      }
      console.log();
    });
  });

syncDbFlow
  .command("update-key")
  .description("Update API key for sync backend")
  .action(async () => {
    await execute(null, async () => {
      const { updateApiKey } = require("../logic/sync-setup");
      await updateApiKey(process.cwd());
    });
  });

syncDbFlow
  .command("delete-remote")
  .description("Delete all remote data (requires confirmation)")
  .option("--confirm", "Skip confirmation prompt")
  .action(async (options) => {
    await execute(null, async () => {
      const inquirer = require("inquirer").default;

      if (!options.confirm) {
        const { confirmed } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirmed",
            message: chalk.yellow(
              "⚠️  Delete ALL remote data? This cannot be undone.",
            ),
            default: false,
          },
        ]);

        if (!confirmed) {
          console.log(chalk.gray("\nCancelled.\n"));
          return;
        }
      }

      const { SyncManager } = require("../logic/sync-manager");
      const manager = new SyncManager(process.cwd());
      await manager.deleteRemote();
    });
  });

syncDbFlow
  .command("daemon-start")
  .description("Start auto-sync daemon in background")
  .action(async () => {
    await execute(null, async () => {
      const { SyncDaemon } = require("../logic/sync-daemon");
      const daemon = new SyncDaemon(process.cwd());

      const status = await daemon.getStatus();
      if (status.running) {
        console.log(chalk.yellow("⚠️  Daemon is already running\n"));
        return;
      }

      await daemon.start();
      console.log(chalk.gray("\n💡 Daemon will sync changes automatically"));
      console.log(chalk.gray("   Run 'kami sync-db daemon-stop' to stop\n"));
    });
  });

syncDbFlow
  .command("daemon-stop")
  .description("Stop auto-sync daemon")
  .action(async () => {
    await execute(null, async () => {
      const { SyncDaemon } = require("../logic/sync-daemon");
      const daemon = new SyncDaemon(process.cwd());

      const status = await daemon.getStatus();
      if (!status.running) {
        console.log(chalk.gray("Daemon is not running\n"));
        return;
      }

      await daemon.stop();
    });
  });

syncDbFlow
  .command("daemon-status")
  .description("Show auto-sync daemon status")
  .action(async () => {
    await execute(null, async () => {
      const { SyncDaemon } = require("../logic/sync-daemon");
      const daemon = new SyncDaemon(process.cwd());
      const status = await daemon.getStatus();

      console.log(chalk.cyan("\n🤖 Daemon Status\n"));
      console.log(
        chalk.gray("Status:"),
        status.running ? chalk.green("Running") : chalk.yellow("Stopped"),
      );
      console.log(chalk.gray("Mode:"), chalk.white(status.mode));
      console.log(
        chalk.gray("Enabled:"),
        status.enabled ? chalk.green("Yes") : chalk.red("No"),
      );

      if (status.running) {
        console.log(
          chalk.gray("Watching:"),
          chalk.white(status.watching.join(", ")),
        );
        console.log(
          chalk.gray("Queued:"),
          chalk.white(status.queuedFiles + " file(s)"),
        );
      }
      console.log();
    });
  });

syncDbFlow
  .command("daemon-logs")
  .description("Show auto-sync daemon logs")
  .option("-n, --lines <number>", "Number of log lines to show", "50")
  .action(async (options) => {
    await execute(null, async () => {
      const { SyncDaemon } = require("../logic/sync-daemon");
      const daemon = new SyncDaemon(process.cwd());
      const logs = await daemon.getLogs(parseInt(options.lines));

      if (logs.length === 0) {
        console.log(chalk.gray("\nNo logs available\n"));
        return;
      }

      console.log(chalk.cyan("\n📋 Daemon Logs\n"));
      logs.forEach((line) => console.log(chalk.gray(line)));
      console.log();
    });
  });

syncDbFlow
  .command("conflicts")
  .description("List unresolved sync conflicts")
  .action(async () => {
    await execute(null, async () => {
      const { ConflictResolver } = require("../logic/conflict-resolver");
      const resolver = new ConflictResolver(process.cwd());
      const conflicts = await resolver.getConflicts();

      if (conflicts.length === 0) {
        console.log(chalk.green("\n✅ No conflicts\n"));
        return;
      }

      console.log(chalk.yellow(`\n⚠️  ${conflicts.length} Conflict(s)\n`));

      conflicts.forEach((conflict, index) => {
        console.log(chalk.white(`${index + 1}. ${conflict.filePath}`));
        console.log(chalk.gray(`   ID: ${conflict.id}`));
        console.log(
          chalk.gray(
            `   Date: ${new Date(conflict.timestamp).toLocaleString()}\n`,
          ),
        );
      });

      console.log(
        chalk.gray("Run 'kami sync-db resolve <id>' to resolve a conflict\n"),
      );
    });
  });

syncDbFlow
  .command("resolve <conflictId>")
  .description("Resolve a sync conflict")
  .option(
    "-s, --strategy <strategy>",
    "Resolution strategy: keep-local, keep-remote, merge, manual",
  )
  .action(async (conflictId, options) => {
    await execute(null, async () => {
      const inquirer = require("inquirer").default;
      const { ConflictResolver } = require("../logic/conflict-resolver");
      const resolver = new ConflictResolver(process.cwd());

      const conflict = await resolver.getConflict(conflictId);

      console.log(chalk.cyan("\n🔀 Conflict Resolution\n"));
      console.log(chalk.gray("File:"), chalk.white(conflict.filePath));
      console.log(
        chalk.gray("Local checksum:"),
        chalk.white(conflict.local.checksum.substring(0, 16) + "..."),
      );
      console.log(
        chalk.gray("Remote checksum:"),
        chalk.white(conflict.remote.checksum.substring(0, 16) + "..."),
      );

      let strategy = options.strategy;

      if (!strategy) {
        const { chosenStrategy } = await inquirer.prompt([
          {
            type: "list",
            name: "chosenStrategy",
            message: "Choose resolution strategy:",
            choices: [
              { name: "Keep local version", value: "keep-local" },
              { name: "Keep remote version", value: "keep-remote" },
              { name: "Attempt auto-merge", value: "merge" },
              { name: "Edit manually", value: "manual" },
            ],
          },
        ]);
        strategy = chosenStrategy;
      }

      let customContent = null;
      if (strategy === "manual") {
        console.log(chalk.gray("\n📝 Opening editor for manual resolution..."));
        console.log(
          chalk.gray(
            "(Feature requires external editor - showing content instead)\n",
          ),
        );
        console.log(chalk.yellow("=== LOCAL VERSION ==="));
        console.log(conflict.local.content.substring(0, 500) + "...\n");
        console.log(chalk.yellow("=== REMOTE VERSION ==="));
        console.log(conflict.remote.content.substring(0, 500) + "...\n");

        const { useLocal } = await inquirer.prompt([
          {
            type: "confirm",
            name: "useLocal",
            message: "Use local version?",
            default: true,
          },
        ]);

        strategy = useLocal ? "keep-local" : "keep-remote";
      }

      const result = await resolver.resolveConflict(
        conflictId,
        strategy,
        customContent,
      );

      console.log(chalk.green(`\n✅ Conflict resolved using: ${strategy}`));
      console.log(chalk.gray(`   File: ${result.filePath}\n`));
    });
  });

// Saiyan Command
program
  .command("run-saiyan [input]")
  .alias("saiyan")
  .description("Execute a task with autonomous decision making")
  .option("-s, --strategy <strategy>", "Execution strategy: BALANCED, FAST, AMBITIOUS", "BALANCED")
  .action(async (input, options) => {
    await execute("Saiyan Mode Engaged", async () => {
      const { runSaiyanMode } = require("../logic/saiyan");
      await runSaiyanMode(input, options);
    });
  });

// SuperSaiyan Command
program
  .command("run-batch")
  .alias("supersaiyan")
  .description("Execute a batch of tasks autonomously")
  .option("-s, --source <source>", "Source of ideas: BACKLOG or RESEARCH")
  .action(async (options) => {
    await execute("SuperSaiyan Cycle", async () => {
      const { runSuperSaiyan } = require("../logic/supersaiyan");
      await runSuperSaiyan(options.source);
    });
  });

// Unknown command handler
program.on("command:*", (operands) => {
  logger.error(t("cli.error.commandNotFound", { command: operands[0] }));
  logger.hint(t("cli.hint.tryHelp"));
  process.exit(1);
});

// Initialize i18n and parse arguments
(async () => {
  try {
    await initI18n();
program
  .command("_insights", { hidden: true })
  .description("Internal: Display categorized strategic patterns from Memory Bank")
  .option("-c, --category <category>", "Filter by category")
  .option("-t, --task <taskId>", "Show knowledge graph for a specific task")
  .option("-v, --visualize", "Generate Mermaid diagram for task relationships")
  .option("-e, --export", "Export full knowledge graph to interactive HTML")
  .action(async (options) => {
    const InsightManager = require("../logic/insight-manager");
    const insightManager = new InsightManager(process.cwd());

    if (options.export) {
      try {
        const filePath = await insightManager.exportHTMLGraph();
        console.log(chalk.green(`\n✨ Knowledge Graph exported to: ${filePath}`));
        console.log(chalk.gray(`   Open this file in your browser to explore the interactive map.\n`));
      } catch (error) {
        console.error(chalk.red(`\n❌ Export failed: ${error.message}\n`));
      }
      return;
    }

    if (options.task) {
      await insightManager.displayGraph(options.task, { visualize: options.visualize });
      return;
    }

    const fs = require("fs-extra");
    const path = require("upath");
    const { EnvironmentManager } = require("../logic/env-manager");
    const env = new EnvironmentManager();
    const workspaceRoot = await env.getAbsoluteWorkspacePath();
    const contextPath = path.join(workspaceRoot, "PROJECT_CONTEXT.md");

    if (!fs.existsSync(contextPath)) {
      console.log("❌ Memory Bank not found.");
      return;
    }

    const content = await fs.readFile(contextPath, "utf8");
    const header = "## 📚 Project Wisdom: Strategic Patterns";
    if (!content.includes(header)) {
      console.log("💭 No strategic patterns harvested yet.");
      return;
    }

    const wisdomSection = content.split(header)[1];
    if (options.category) {
      const categoryHeader = `### #${options.category}`;
      if (!wisdomSection.includes(categoryHeader)) {
        console.log(`💭 No patterns found for category #${options.category}`);
        return;
      }
      const categoryContent =
        wisdomSection.split(categoryHeader)[1].split("###")[0];
      console.log(
        `# 📚 Project Wisdom: #${options.category}\n${categoryContent.trim()}`,
      );
    } else {
      console.log(
        `# 📚 Project Wisdom: Strategic Patterns\n${wisdomSection.trim()}`,
      );
    }
  });

program
  .command("_workflow", { hidden: true })
  .description("Internal: Manage Sniper Model workflow state and artifacts")
  .option("--init <taskId>", "Initialize a new task state")
  .option("--slug <slug>", "Slug for the task")
  .option("--save <phase>", "Save an artifact for a specific phase (IDEA, SPEC, BUILD, HANDOFF)")
  .option("--content <content>", "Markdown content of the artifact")
  .option("--score <score>", "Clarify Score for this task")
  .option("--status <taskId>", "Get the current status of a task")
  .action(async (options) => {
    const WorkflowEngine = require("../logic/workflow-engine");
    const engine = new WorkflowEngine(process.cwd());

    try {
      if (options.init) {
        const result = await engine.initTask(options.init, options.slug || "new-task");
        console.log(JSON.stringify(result));
      } else if (options.save) {
        const result = await engine.saveArtifact({
          taskId: options.save.split("-")[0], // If passed as ID-PHASE
          phase: options.save,
          slug: options.slug,
          content: options.content,
          score: parseFloat(options.score || "0"),
        });
        console.log(chalk.green(`✅ Artifact saved: ${result.path}`));
      } else if (options.status) {
        const state = await engine.getTaskState(options.status);
        if (state) {
          console.log(JSON.stringify(state, null, 2));
        } else {
          console.log(chalk.yellow(`Task ${options.status} not found.`));
        }
      }
    } catch (error) {
      console.error(chalk.red(`❌ Workflow Error: ${error.message}`));
      process.exit(1);
    }
  });

    program.parse(process.argv);
  } catch (error) {
    logger.error(`Failed to initialize CLI: ${error.message}`);
    if (process.env.KAMI_DEBUG === "true") {
      console.error(error);
    }
    process.exit(1);
  }
})();



