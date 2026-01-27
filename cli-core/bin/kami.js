#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const { initProject } = require("../logic/installer");
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

      await initProject(projectPath, options);

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

// Config command
const configFlow = program.command("config-flow").description("Manage project configuration");

configFlow
  .command("set <key> <value>")
  .description("Set a configuration value")
  .action(async (key, value) => {
    const { ConfigManager } = require("../logic/config-manager");
    const config = new ConfigManager();
    const success = await config.set(key, value);
    if (success) {
      console.log(chalk.green(`✓ Set ${key} = ${value}`));
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
  .description("List all configuration values")
  .action(async () => {
    const { ConfigManager } = require("../logic/config-manager");
    const config = new ConfigManager();
    const data = await config.load();
    console.log(chalk.cyan("\n📊 KamiFlow Project Configuration:\n"));
    console.table(data);
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

// Archive command
program
  .command("archive-flow")
  .alias("archive")
  .description("Archive completed tasks")
  .action(async () => {
    try {
      const { runArchivist } = require("../logic/archivist");
      await runArchivist();
    } catch (error) {
      console.error(chalk.red("\n❌ Archive failed:"), error.message);
    }
  });

program.parse();
