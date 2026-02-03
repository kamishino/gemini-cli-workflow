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

// Init command
program
  .command("init-flow [path]")
  .alias("init")
  .description("Initialize KamiFlow in a project directory")
  .option("-m, --mode <mode>", "Integration mode: link, submodule, or standalone", "link")
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
  .command("doctor-flow")
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
  .command("update-flow")
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

// Info command
program
  .command("info-flow")
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
  .command("validate-flow")
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
  .command("doc-audit")
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
  .command("config-flow")
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

// Sync command
program
  .command("sync-flow")
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

// Sync Agents command
program
  .command("sync-agents")
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
  .command("archive-flow [id]")
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
  .command("create-idea <title>")
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
  .command("refine-idea <path> <content>")
  .description("Internal: Prepend a refinement to an idea (used by Gemini CLI)")
  .action(async (filePath, content) => {
    await execute(null, async () => {
      const { prependRefinement } = require("../logic/idea-manager");
      await prependRefinement(filePath, content);
    });
  });

program
  .command("promote-idea <path>")
  .description("Internal: Promote an idea draft (used by Gemini CLI)")
  .option("-f, --force", "Bypass quality gate")
  .action(async (filePath, options) => {
    await execute(null, async () => {
      const { promoteIdea } = require("../logic/idea-manager");
      await promoteIdea(filePath, options);
    });
  });

program
  .command("analyze-idea <path> <scoresJson>")
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
  .command("scan-agents")
  .description("Internal: Scan for active AI agents in the project")
  .action(async () => {
    await execute(null, async () => {
      const { scanActiveAgents } = require("../logic/agent-manager");
      await scanActiveAgents();
    });
  });

program
  .command("update-central-rules <skillName> <link>")
  .description("Internal: Update the central rules template with a new skill")
  .action(async (skillName, link) => {
    await execute(null, async () => {
      const { updateCentralTemplate } = require("../logic/agent-manager");
      await updateCentralTemplate(skillName, link);
    });
  });

program
  .command("sync-skills")
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
  .command("swarm-status")
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
  .command("swarm-lock <folder> <agentId>")
  .description("Manually set a swarm lock")
  .action(async (folder, agentId) => {
    await execute(null, async () => {
      await acquireLock(path.resolve(process.cwd(), folder), agentId);
    });
  });

program
  .command("swarm-unlock <folder>")
  .description("Manually release a swarm lock")
  .action(async (folder) => {
    await execute(null, async () => {
      await releaseLock(path.resolve(process.cwd(), folder));
    });
  });

// Search Command
program
  .command("search [query]")
  .description("Search workspace files (ideas, tasks, archives)")
  .option("-c, --category <category>", "Filter by category: ideas, tasks, archive")
  .option("-l, --limit <limit>", "Maximum results to show", "20")
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
          console.log(chalk.gray("Total size:"), chalk.white(`${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`));
          console.log(chalk.gray("Last indexed:"), chalk.white(stats.lastIndexed ? stats.lastIndexed.toLocaleString() : "Never"));
          
          if (stats.byCategory && Object.keys(stats.byCategory).length > 0) {
            console.log(chalk.gray("\nBy category:"));
            Object.entries(stats.byCategory).forEach(([cat, data]) => {
              console.log(chalk.gray(`  ${cat}:`), chalk.white(`${data.count} files, ${(data.size / 1024).toFixed(1)} KB`));
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
        
        const results = await index.search(query, {
          category: options.category,
          limit: parseInt(options.limit)
        });
        
        console.log(chalk.cyan(`\n🔍 Searching workspace for: "${query}"\n`));
        
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

// Sync Command Group
const syncFlow = program
  .command("sync-flow")
  .alias("sync")
  .description("Synchronize private workspace data");

syncFlow
  .command("setup")
  .description("Configure sync backend and credentials")
  .option("--backend <url>", "Backend URL")
  .option("--api-key <key>", "API key (not recommended, use interactive prompt)")
  .option("--mode <mode>", "Sync mode: manual, auto, on-command")
  .action(async (options) => {
    await execute("KamiFlow Sync Setup", async () => {
      const { setupSync } = require("../logic/sync-setup");
      await setupSync(process.cwd(), options);
    });
  });

syncFlow
  .command("push")
  .description("Upload local changes to sync backend")
  .action(async () => {
    await execute(null, async () => {
      const { SyncManager } = require("../logic/sync-manager");
      const manager = new SyncManager(process.cwd());
      await manager.push();
    });
  });

syncFlow
  .command("pull")
  .description("Download remote changes from sync backend")
  .action(async () => {
    await execute(null, async () => {
      const { SyncManager } = require("../logic/sync-manager");
      const manager = new SyncManager(process.cwd());
      await manager.pull();
    });
  });

syncFlow
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
      console.log(chalk.gray("Last sync:"), chalk.white(status.lastSync ? new Date(status.lastSync).toLocaleString() : "Never"));
      console.log(chalk.gray("Pending files:"), chalk.white(status.pendingFiles));
      
      if (status.pendingFiles > 0) {
        console.log(chalk.gray("\nFiles to sync:"));
        status.files.slice(0, 5).forEach(f => {
          console.log(chalk.gray(`  • ${f.path} (${(f.size / 1024).toFixed(1)} KB)`));
        });
        if (status.files.length > 5) {
          console.log(chalk.gray(`  ... and ${status.files.length - 5} more`));
        }
      }
      console.log();
    });
  });

syncFlow
  .command("update-key")
  .description("Update API key for sync backend")
  .action(async () => {
    await execute(null, async () => {
      const { updateApiKey } = require("../logic/sync-setup");
      await updateApiKey(process.cwd());
    });
  });

syncFlow
  .command("delete-remote")
  .description("Delete all remote data (requires confirmation)")
  .option("--confirm", "Skip confirmation prompt")
  .action(async (options) => {
    await execute(null, async () => {
      const inquirer = require("inquirer").default;
      
      if (!options.confirm) {
        const { confirmed } = await inquirer.prompt([{
          type: "confirm",
          name: "confirmed",
          message: chalk.yellow("⚠️  Delete ALL remote data? This cannot be undone."),
          default: false
        }]);
        
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

// Saiyan Command
program
  .command("saiyan [input]")
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
  .command("supersaiyan")
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
    program.parse(process.argv);
  } catch (error) {
    logger.error(`Failed to initialize CLI: ${error.message}`);
    if (process.env.KAMI_DEBUG === "true") {
      console.error(error);
    }
    process.exit(1);
  }
})();
