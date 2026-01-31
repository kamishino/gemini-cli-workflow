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
  await initI18n();
  program.parse(process.argv);
})();
