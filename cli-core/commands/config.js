/* eslint-disable no-process-exit */
/**
 * Config command group: set, get, sync, list, get-state, set-state
 */
const chalk = require("chalk");
const logger = require("../utils/logger");

module.exports = function register(program, execute) {
  const configFlow = program
    .command("manage-config")
    .alias("config")
    .description(
      "Manage project configuration. Common keys: language, strategy, maxRetries.",
    );

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
          logger.success(
            `Set ${key} = ${value} (${options.global ? "Global" : "Local"})`,
          );
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
    .description(
      "Synchronize local configuration with latest system defaults (adds missing keys)",
    )
    .action(async () => {
      await execute(null, async () => {
        const { ConfigManager } = require("../logic/config-manager");
        const config = new ConfigManager();
        const report = await config.syncLocalConfig();

        if (report.success) {
          if (report.added.length > 0) {
            logger.success(
              `Synchronized configuration. Added ${report.added.length} missing key(s).`,
            );
            report.added.forEach((key) => logger.hint(`   [+] ${key}`));
          } else {
            logger.success("Project configuration is already up to date.");
          }

          if (report.orphaned.length > 0) {
            console.log(
              chalk.yellow(
                `\n⚠️  Found ${report.orphaned.length} orphaned key(s) not in current schema:`,
              ),
            );
            report.orphaned.forEach((key) =>
              console.log(chalk.gray(`   [-] ${key}`)),
            );
            console.log(
              chalk.gray(
                "   (These keys are preserved but ignored by the system)\n",
              ),
            );
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
};
