/* eslint-disable no-process-exit */
/**
 * Sync Database command group: setup, push, pull, status, update-key, delete-remote,
 * daemon-start, daemon-stop, daemon-status, daemon-logs, conflicts, resolve
 */
const chalk = require("chalk");
const logger = require("../utils/logger");

module.exports = function register(program, execute) {
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
            console.log(
              chalk.gray(`  ... and ${status.files.length - 5} more`),
            );
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
          console.log(
            chalk.gray("\n📝 Opening editor for manual resolution..."),
          );
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
};
