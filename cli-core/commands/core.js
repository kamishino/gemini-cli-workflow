/* eslint-disable no-process-exit */
/**
 * Core commands: init, upgrade, sync-rules, clean-rules, info, validate, doc-audit
 */
const chalk = require("chalk");
const path = require("upath");
const fs = require("fs-extra");
const logger = require("../utils/logger");

module.exports = function register(program, execute) {
  const packageJson = require("../package.json");
  const { initializeProject } = require("../logic/installer");
  const { runUpdate, syncGlobalRules } = require("../logic/updater");

  // Init command
  program
    .command("init-project [path]")
    .alias("init")
    .description("Initialize KamiFlow in a project directory")
    .option(
      "-m, --mode <mode>",
      "Integration mode: link, submodule, or standalone",
      "link",
    )
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

  // Update command
  program
    .command("upgrade-core")
    .alias("upgrade")
    .description("Update KamiFlow to the latest version")
    .option(
      "-f, --force",
      "Force overwrite existing files (Standalone mode)",
      false,
    )
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
    .description(
      "Internal: Surgical cleanup of transpiled rules directory to prevent system redundancy",
    )
    .action(async () => {
      await execute("Surgical Clean", async () => {
        const paths = [
          path.join(process.cwd(), ".gemini/rules"),
          path.join(process.cwd(), "dist/.gemini/rules"),
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
    .option(
      "-p, --path <path>",
      "Path to directory or file to validate",
      ".gemini/commands/kamiflow",
    )
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
};
