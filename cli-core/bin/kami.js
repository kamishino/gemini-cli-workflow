#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const { initializeProject } = require("../logic/installer");
const { runDoctor } = require("../logic/doctor");
const { runUpdate } = require("../logic/updater");
const path = require("path");
const fs = require("fs-extra");

const program = new Command();

// Get version from package.json
const packageJson = require("../package.json");

program
  .name("kamiflow")
  .description("KamiFlow CLI - The Orchestrator for Indie Builders")
  .version(packageJson.version);

// Init command
program
  .command("init-flow [path]")
  .alias("init")
  .description("Initialize KamiFlow in a project directory")
  .option("-m, --mode <mode>", "Integration mode: link, submodule, or standalone", "link")
  .option("--skip-interview", "Skip interactive questions and use defaults")
  .action(async (targetPath, options) => {
    try {
      const projectPath = path.resolve(process.cwd(), targetPath || ".");

      console.log(chalk.cyan("\n========================================================"));
      console.log(chalk.cyan("  🌊 KamiFlow CLI v" + packageJson.version));
      console.log(chalk.cyan("========================================================\n"));

      await initializeProject(projectPath);

      console.log(chalk.green("\n✅ KamiFlow initialization complete!"));
      console.log(chalk.gray("\nNext steps:"));
      console.log(chalk.gray("  1. cd " + (targetPath || ".")));
      console.log(chalk.gray("  2. gemini"));
      console.log(chalk.gray("  3. /kamiflow:ops:wake\n"));
    } catch (error) {
      console.error(chalk.red("\n❌ Error:"), error.message);
      process.exit(1);
    }
  });

// Doctor command
program
  .command("doctor-flow")
  .alias("doctor")
  .description("Check system health and KamiFlow configuration")
  .option("--fix", "Attempt to automatically fix detected issues")
  .action(async (options) => {
    try {
      console.log(chalk.cyan("\n========================================================"));
      console.log(chalk.cyan("  🏥 KamiFlow System Doctor"));
      console.log(chalk.cyan("========================================================\n"));

      const results = await runDoctor(options);

      if (results.allHealthy) {
        console.log(chalk.green("\n✅ All systems operational!\n"));
      } else {
        console.log(chalk.yellow("\n⚠️  Some issues detected. See above for details.\n"));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("\n❌ Error:"), error.message);
      process.exit(1);
    }
  });

// Update command
program
  .command("update-flow")
  .alias("upgrade")
  .description("Update KamiFlow to the latest version")
  .action(async () => {
    try {
      const projectPath = process.cwd();
      const result = await runUpdate(projectPath);

      if (!result.success) {
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("\n❌ Error:"), error.message);
      process.exit(1);
    }
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
    try {
      const { validateTomlFiles } = require("../validators/toml-validator");
      const targetPath = path.resolve(process.cwd(), options.path);
      
      console.log(chalk.cyan("\n========================================================"));
      console.log(chalk.cyan("  🔍 KamiFlow Configuration Validator"));
      console.log(chalk.cyan("========================================================\n"));
      
      const result = await validateTomlFiles(targetPath);
      
      console.log(chalk.cyan("\n" + "─".repeat(50)));
      if (result.invalid === 0) {
        console.log(chalk.green(`\n✨ All ${result.total} TOML files are valid!\n`));
      } else {
        console.log(chalk.red(`\n⚠️  Found ${result.invalid} invalid TOML files.\n`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red("\n❌ Error:"), error.message);
      process.exit(1);
    }
  });

// Doc Audit command
program
  .command("doc-audit")
  .alias("audit")
  .description("Scan documentation for broken links and drift")
  .option("--fix", "Automatically attempt to fix issues")
  .option("--dry-run", "Report only, no prompts")
  .action(async (options) => {
    try {
      const { runDocAudit } = require("../logic/doc-auditor");
      await runDocAudit(options);
    } catch (error) {
      console.error(chalk.red("\n❌ Audit failed:"), error.message);
    }
  });

// Config command
const configFlow = program.command("config-flow").description("Manage project configuration");

configFlow
  .command("set <key> <value>")
  .description("Set a configuration value")
  .option("-g, --global", "Set globally for the current user", false)
  .action(async (key, value, options) => {
    const { ConfigManager } = require("../logic/config-manager");
    const config = new ConfigManager();
    const success = await config.set(key, value, options.global);
    if (success) {
      console.log(chalk.green(`✓ Set ${key} = ${value} (${options.global ? 'Global' : 'Local'})`));
    }
  });

configFlow
  .command("get <key>")
  .description("Get a configuration value")
  .action(async (key) => {
    const { ConfigManager } = require("../logic/config-manager");
    const config = new ConfigManager();
    const value = await config.get(key);
    console.log(value !== undefined ? value : chalk.yellow("Not set"));
  });

configFlow
  .command("list")
  .alias("ls")
  .description("List all configuration values with their sources")
  .action(async () => {
    const { ConfigManager } = require("../logic/config-manager");
    const config = new ConfigManager();
    const data = await config.list();
    console.log(chalk.cyan("\n📊 KamiFlow Combined Configuration:\n"));
    if (data.length > 0) {
      console.table(data);
    } else {
      console.log(chalk.gray("No configuration found."));
    }
    console.log();
  });

// Sync command
program
  .command("sync-flow")
  .alias("sync")
  .description("Synchronize command documentation")
  .action(async () => {
    try {
      console.log(chalk.cyan("\n🔄 Synchronizing documentation...\n"));
      // We run the script directly via node to ensure it uses the project's logic
      const execa = require("execa");
      const scriptPath = path.join(__dirname, "../scripts/sync-docs.js");
      await execa("node", [scriptPath], { stdio: "inherit" });
    } catch (error) {
      console.error(chalk.red("\n❌ Sync failed:"), error.message);
    }
  });

// Sync Agents command
program
  .command("sync-agents")
  .alias("transpile")
  .description("Assemble AI Agent configurations from Markdown blueprints")
  .action(async () => {
    try {
      const { Transpiler } = require("../logic/transpiler");
      const transpiler = new Transpiler(process.cwd());
      await transpiler.runFromRegistry(path.join(process.cwd(), 'docs/blueprint/registry.md'));
    } catch (error) {
      console.error(chalk.red("\n❌ Transpilation failed:"), error.message);
    }
  });

// Archive command
program
  .command("archive-flow [id]")
  .alias("archive")
  .description("Archive completed tasks")
  .option("-f, --force", "Skip confirmation prompt")
  .option("-a, --all", "Archive all completed tasks")
  .action(async (id, options) => {
    try {
      const { runArchivist } = require("../logic/archivist");
      await runArchivist({
        targetId: id,
        force: options.force,
        all: options.all
      });
    } catch (error) {
      console.error(chalk.red("\n❌ Archive failed:"), error.message);
    }
  });

// Idea Sandbox Logic
program
  .command("create-idea <title>")
  .description("Internal: Create a new idea draft (used by Gemini CLI)")
  .option("-c, --content <content>", "Full content of the idea")
  .option("-s, --slug <slug>", "Summarized slug for filename")
  .option("-t, --type <type>", "Idea type: draft or discovery", "draft")
  .action(async (title, options) => {
    try {
      const { createIdea } = require("../logic/idea-manager");
      await createIdea(title, options.content, options.slug, options.type);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command("refine-idea <path> <content>")
  .description("Internal: Prepend a refinement to an idea (used by Gemini CLI)")
  .action(async (filePath, content) => {
    try {
      const { prependRefinement } = require("../logic/idea-manager");
      await prependRefinement(filePath, content);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command("promote-idea <path>")
  .description("Internal: Promote an idea draft (used by Gemini CLI)")
  .option("-f, --force", "Bypass quality gate")
  .action(async (filePath, options) => {
    try {
      const { promoteIdea } = require("../logic/idea-manager");
      await promoteIdea(filePath, options);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command("analyze-idea <path> <scoresJson>")
  .description("Internal: Update idea scores (used by Gemini CLI)")
  .action(async (filePath, scoresJson) => {
    try {
      const { analyzeIdea } = require("../logic/idea-manager");
      const scores = JSON.parse(scoresJson);
      await analyzeIdea(filePath, scores);
    } catch (error) {
      console.error(chalk.red("Failed to parse scores JSON"));
      process.exit(1);
    }
  });

// Agent Management Logic
program
  .command("scan-agents")
  .description("Internal: Scan for active AI agents in the project")
  .action(async () => {
    try {
      const { scanActiveAgents } = require("../logic/agent-manager");
      await scanActiveAgents();
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command("update-central-rules <skillName> <link>")
  .description("Internal: Update the central rules template with a new skill")
  .action(async (skillName, link) => {
    try {
      const { updateCentralTemplate } = require("../logic/agent-manager");
      await updateCentralTemplate(skillName, link);
    } catch (error) {
      process.exit(1);
    }
  });

const { isLocked, acquireLock, releaseLock, getSwarmStatus } = require("../logic/swarm-dispatcher");

// ... existing code ...

/**
 * --- SWARM COMMANDS ---
 */

program
  .command("swarm-status")
  .description("Show active locks and swarm health")
  .action(async () => {
    try {
      const status = await getSwarmStatus();
      if (status.activeLocks && status.activeLocks.length > 0) {
        console.log(chalk.cyan("\n🚦 Active Swarm Locks:"));
        status.activeLocks.forEach(l => {
          console.log(chalk.yellow(`- ${l.folder}: Locked by ${l.agent} (${l.timestamp})`));
        });
      } else {
        console.log(chalk.green("\n🟢 Swarm is ready. No active locks."));
      }
    } catch (err) {
      console.error(chalk.red("Error fetching status:"), err.message);
    }
  });

program
  .command("swarm-lock <folder> <agentId>")
  .description("Manually set a swarm lock")
  .action(async (folder, agentId) => {
    try {
      await acquireLock(path.resolve(process.cwd(), folder), agentId);
    } catch (err) {
      console.error(chalk.red("Fail:"), err.message);
    }
  });

program
  .command("swarm-unlock <folder>")
  .description("Manually release a swarm lock")
  .action(async (folder) => {
    try {
      await releaseLock(path.resolve(process.cwd(), folder));
    } catch (err) {
      console.error(chalk.red("Fail:"), err.message);
    }
  });

// Saiyan Command
program
  .command("saiyan [input]")
  .description("Execute a task with autonomous decision making")
  .option("-s, --strategy <strategy>", "Execution strategy: BALANCED, FAST, AMBITIOUS", "BALANCED")
  .action(async (input, options) => {
    try {
      const { runSaiyanMode } = require("../logic/saiyan");
      await runSaiyanMode(input, options);
    } catch (error) {
      console.error(chalk.red("\n❌ Saiyan Mode failed:"), error.message);
    }
  });

// SuperSaiyan Command
program
  .command("supersaiyan")
  .description("Execute a batch of tasks autonomously")
  .option("-s, --source <source>", "Source of ideas: BACKLOG or RESEARCH")
  .action(async (options) => {
    try {
      const { runSuperSaiyan } = require("../logic/supersaiyan");
      await runSuperSaiyan(options.source);
    } catch (error) {
      console.error(chalk.red("\n❌ SuperSaiyan Mode failed:"), error.message);
    }
  });

program.parse(process.argv);
