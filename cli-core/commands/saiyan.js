/* eslint-disable no-process-exit */
/**
 * Saiyan commands: run-saiyan, run-batch (supersaiyan)
 */

module.exports = function register(program, execute) {
  // Saiyan Command
  program
    .command("run-saiyan [input]")
    .alias("saiyan")
    .description("Execute a task with autonomous decision making")
    .option(
      "-s, --strategy <strategy>",
      "Execution strategy: BALANCED, FAST, AMBITIOUS",
      "BALANCED",
    )
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
};
