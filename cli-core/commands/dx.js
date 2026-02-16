/* eslint-disable no-process-exit */
/**
 * Developer Experience (DX) commands: tour, dashboard, completions, hooks, perf
 */

module.exports = function register(program, execute) {
  // Interactive Tour command
  program
    .command("learn-flow")
    .alias("tour")
    .description("Interactive walkthrough of KamiFlow features")
    .option("-q, --quick", "Show all steps without prompts")
    .action(async (options) => {
      await execute(null, async () => {
        const { runTour } = require("../logic/tour");
        await runTour(options);
      });
    });

  // Dashboard command
  program
    .command("show-dashboard")
    .alias("dashboard")
    .description("Display project metrics and health at a glance")
    .action(async () => {
      await execute(null, async () => {
        const { runDashboard } = require("../logic/dashboard");
        await runDashboard();
      });
    });

  // Completions command
  program
    .command("generate-completions [shell]")
    .alias("completions")
    .description(
      "Generate shell completion scripts (bash, zsh, fish, powershell)",
    )
    .action(async (shell) => {
      await execute(null, async () => {
        const { runCompletions } = require("../logic/completions");
        await runCompletions(shell);
      });
    });

  // Git Hooks command group
  const hooksFlow = program
    .command("manage-hooks")
    .alias("hooks")
    .description("Manage KamiFlow git hooks");

  hooksFlow
    .command("install")
    .description("Install pre-commit and commit-msg hooks")
    .action(async () => {
      await execute(null, async () => {
        const { installHooks } = require("../logic/git-hooks");
        await installHooks(process.cwd());
      });
    });

  hooksFlow
    .command("remove")
    .description("Remove KamiFlow git hooks")
    .action(async () => {
      await execute(null, async () => {
        const { removeHooks } = require("../logic/git-hooks");
        await removeHooks(process.cwd());
      });
    });

  hooksFlow
    .command("status")
    .description("Show installed git hooks")
    .action(async () => {
      await execute(null, async () => {
        const { statusHooks } = require("../logic/git-hooks");
        await statusHooks(process.cwd());
      });
    });

  // Performance Benchmarks Dashboard
  program
    .command("bench-dashboard")
    .alias("perf")
    .description("Run benchmarks and display performance dashboard")
    .option("--compare", "Compare with previous benchmark run")
    .option("--history <count>", "Show sparkline trend for last N runs", "10")
    .action(async (options) => {
      await execute(null, async () => {
        const { runBenchDashboard } = require("../logic/bench-dashboard");
        await runBenchDashboard(options);
      });
    });
};
