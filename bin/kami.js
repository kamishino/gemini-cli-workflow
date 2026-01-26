#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const { initProject } = require("../src/logic/installer");
const { runDoctor } = require("../src/logic/doctor");
const { runUpdate } = require("../src/logic/updater");
const path = require("path");
const fs = require("fs-extra");

const program = new Command();

// Get version from package.json
const packageJson = require("../package.json");

program.name("gemini-cli-kamiflow").description("Professional CLI manager for KamiFlow - The Indie Builder's OS").version(packageJson.version);

// Init command
program
  .command("init [path]")
  .description("Initialize KamiFlow in a project directory")
  .option("-m, --mode <mode>", "Integration mode: link, submodule, or standalone", "link")
  .option("--skip-interview", "Skip interactive questions and use defaults")
  .action(async (targetPath, options) => {
    try {
      const projectPath = path.resolve(process.cwd(), targetPath || ".");

      console.log(chalk.cyan("\n========================================================"));
      console.log(chalk.cyan("  🌊 KamiFlow CLI Manager v" + packageJson.version));
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
  .command("doctor")
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
  .command("update")
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
  .command("info")
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
  .command("validate")
  .description("Validate configuration files (TOML)")
  .option("-p, --path <path>", "Path to directory or file to validate", ".gemini/commands/kamiflow")
  .action(async (options) => {
    try {
      const { validateTomlFiles } = require("../src/validators/toml-validator");
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

program.parse();
