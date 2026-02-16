/* eslint-disable no-process-exit */
/**
 * Workspace commands: sync-docs, roadmap, resume, advice, build-agents, archive, search
 */
const chalk = require("chalk");
const path = require("upath");
const logger = require("../utils/logger");

module.exports = function register(program, execute) {
  // Documentation sync command
  program
    .command("sync-docs")
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

  // Roadmap update command
  program
    .command("update-roadmap")
    .alias("roadmap")
    .description("Synchronize and update the strategic roadmap")
    .action(async () => {
      await execute(null, async () => {
        logger.info("Generating roadmap structure...\n");
        const execa = require("execa");
        const scriptPath = path.join(
          __dirname,
          "../scripts/roadmap-generator.js",
        );
        await execa("node", [scriptPath], { stdio: "inherit" });
      });
    });

  // Resume workflow command
  program
    .command("resume-workflow [id]")
    .alias("resume")
    .description("Resume an interrupted workflow from the last checkpoint")
    .action(async () => {
      console.log(chalk.cyan("\n🔁 Workflow Resurrector:\n"));
      console.log(
        chalk.white(
          "This is an AI-Logic command that requires Gemini's reasoning engine.",
        ),
      );
      console.log(
        chalk.gray("👉 Please use:"),
        chalk.yellow("/kamiflow:ops:resume [id]"),
        chalk.gray("inside Gemini CLI.\n"),
      );
    });

  // Strategic Expert Advisor command
  program
    .command("advice [target]")
    .alias("consult")
    .description(
      "Get strategic directions and UX/UI advice from the AI Advisor",
    )
    .action(async () => {
      console.log(chalk.cyan("\n🧭 Strategic Expert Advisor:\n"));
      console.log(
        chalk.white(
          "This is an AI-Logic command that requires Gemini's reasoning engine.",
        ),
      );
      console.log(
        chalk.gray("👉 Please use:"),
        chalk.yellow("/kamiflow:ops:advice [target]"),
        chalk.gray("inside Gemini CLI.\n"),
      );
    });

  // Sync Agents / transpile command
  program
    .command("build-agents")
    .alias("transpile")
    .description("Assemble AI Agent configurations from Markdown blueprints")
    .action(async () => {
      await execute(null, async () => {
        const { Transpiler } = require("../logic/transpiler");
        const Chronicler = require("../logic/chronicler");
        const transpiler = new Transpiler(process.cwd());
        const chronicler = new Chronicler(process.cwd());

        await transpiler.runFromRegistry(
          path.join(transpiler.blueprintDir, "registry.md"),
        );

        // Auto-sync docs after transpilation
        await chronicler.syncDocs();
      });
    });

  // Archive command
  program
    .command("archive-task [id]")
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

  // Search workspace command
  program
    .command("search-workspace [query]")
    .alias("search")
    .description("Search workspace files (ideas, tasks, archives)")
    .option(
      "-c, --category <category>",
      "Filter by category: ideas, tasks, archive",
    )
    .option("-l, --limit <limit>", "Maximum results to show", "20")
    .option(
      "-s, --synonyms <synonyms>",
      "Comma-separated list of synonyms for query expansion",
    )
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
            console.log(
              chalk.gray("Total files:"),
              chalk.white(stats.totalFiles),
            );
            console.log(
              chalk.gray("Knowledge Graph:"),
              chalk.white(`${stats.totalRelationships} relationships`),
            );
            console.log(
              chalk.gray("Total size:"),
              chalk.white(`${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`),
            );
            console.log(
              chalk.gray("Last indexed:"),
              chalk.white(
                stats.lastIndexed
                  ? stats.lastIndexed.toLocaleString()
                  : "Never",
              ),
            );

            if (stats.byCategory && stats.byCategory.length > 0) {
              console.log(chalk.gray("\nBy category:"));
              stats.byCategory.forEach((data) => {
                console.log(
                  chalk.gray(`  ${data.category}:`),
                  chalk.white(
                    `${data.count} files, ${(data.size / 1024).toFixed(1)} KB`,
                  ),
                );
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
            console.log(
              chalk.yellow(
                "No search query provided. Use --stats or --rebuild, or provide a query.\n",
              ),
            );
            return;
          }

          const synonyms = options.synonyms
            ? options.synonyms.split(",").map((s) => s.trim())
            : [];
          const results = await index.search(query, {
            category: options.category,
            limit: parseInt(options.limit),
            synonyms,
          });

          console.log(
            chalk.cyan(
              `\n🔍 Searching workspace for: "${query}"${synonyms.length > 0 ? ` (expanded: ${synonyms.join(", ")})` : ""}\n`,
            ),
          );

          if (results.results.length === 0) {
            console.log(chalk.yellow("No results found.\n"));
            return;
          }

          results.results.forEach((result, idx) => {
            console.log(chalk.white(`${idx + 1}. `) + chalk.cyan(result.title));
            console.log(chalk.gray(`   ${result.category}/${result.filePath}`));
            if (result.snippet) {
              console.log(
                chalk.gray(
                  `   ${result.snippet.replace(/<mark>/g, chalk.yellow("<mark>")).replace(/<\/mark>/g, "</mark>")}`,
                ),
              );
            }
            console.log(
              chalk.gray(
                `   Score: ${result.score.toFixed(2)} | Modified: ${result.modified.toLocaleDateString()}`,
              ),
            );
            console.log();
          });

          console.log(
            chalk.gray(
              `Found ${results.results.length} results in ${results.took}\n`,
            ),
          );
        } finally {
          index.close();
        }
      });
    });
};
