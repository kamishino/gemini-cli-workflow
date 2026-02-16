#!/usr/bin/env node
/* eslint-disable no-process-exit */

const { Command } = require("commander");
const chalk = require("chalk");
const logger = require("../utils/logger");
const { initI18n, t } = require("../utils/i18n");
const { silentCheck } = require("../logic/updater");
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

program
  .name("kamiflow")
  .description("KamiFlow CLI - The Orchestrator for Indie Builders")
  .version(packageJson.version);

// --- CLI UX Alignment (Task 110 & 111) ---
const isDev = process.env.KAMI_ENV === "development";

const CATEGORIES = {
  project: {
    title: "📁 PROJECT MANAGEMENT",
    color: chalk.green,
    commands: [
      "init-project",
      "check-health",
      "upgrade-core",
      "sync-rules",
      "show-info",
      "check-config",
      "manage-config",
      "archive-task",
      "search-workspace",
      "sync-db",
      "resume-workflow",
      "update-roadmap",
    ],
  },
  dx: {
    title: "🎯 DEVELOPER EXPERIENCE",
    color: chalk.blue,
    commands: [
      "learn-flow",
      "show-dashboard",
      "generate-completions",
      "manage-hooks",
      "bench-dashboard",
    ],
  },
  automation: {
    title: "🤖 AUTOMATION & SWARM",
    color: chalk.magenta,
    commands: [
      "run-saiyan",
      "run-batch",
      "check-swarm",
      "lock-swarm",
      "unlock-swarm",
    ],
  },
  maintenance: {
    title: "🔧 MAINTENANCE (MASTER REPO)",
    color: chalk.red,
    commands: [
      "clean-rules",
      "audit-docs",
      "sync-docs",
      "build-agents",
      "sync-skills",
      "_agent-scan",
      "_idea-create",
      "_idea-refine",
      "_idea-promote",
      "_idea-analyze",
      "_rules-update",
    ],
    hidden: !isDev,
  },
};

program.configureHelp({
  formatHelp: (cmd, helper) => {
    const header =
      chalk.bold.cyan(`\nKamiFlow CLI v${packageJson.version}`) +
      " - " +
      chalk.italic(cmd.description()) +
      "\n";
    const usage = `\n${chalk.yellow("Usage:")} ${helper.commandUsage(cmd)}\n`;

    let sections = [header, usage];

    for (const key in CATEGORIES) {
      const group = CATEGORIES[key];
      if (group.hidden) continue;

      const groupCommands = cmd.commands.filter((c) =>
        group.commands.includes(c.name()),
      );
      if (groupCommands.length === 0) continue;

      let groupOutput = `\n${group.color(chalk.bold(group.title))}\n`;
      groupCommands
        .sort((a, b) => {
          return (
            group.commands.indexOf(a.name()) - group.commands.indexOf(b.name())
          );
        })
        .forEach((c) => {
          if (c.name().startsWith("_")) return;

          const alias = c.alias();
          const name = c.name();
          const desc = c.description();

          const col1 = alias ? chalk.cyan(alias) : chalk.cyan(name);
          const col2 = alias ? chalk.gray(`[${name}]`) : "";

          groupOutput += `  ${col1.padEnd(25)} ${col2.padEnd(25)} ${desc}\n`;
        });
      sections.push(groupOutput);
    }

    const optionsList = helper.visibleOptions(cmd);
    if (optionsList.length > 0) {
      const options =
        `\n${chalk.yellow("Options:")}\n` +
        optionsList
          .map(
            (o) =>
              `  ${helper.optionTerm(o).padEnd(25)} ${helper.optionDescription(o)}`,
          )
          .join("\n") +
        "\n";
      sections.push(options);
    }

    return sections.join("");
  },
});

// ----------------------------------------------------------
// Load commands from commands/ directory (Pattern A + B)
// ----------------------------------------------------------
const commandsPath = path.join(__dirname, "../commands");
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((f) => f.endsWith(".js"));
  for (const file of commandFiles) {
    try {
      const cmdModule = require(path.join(commandsPath, file));

      // Pattern B: register(program, execute)
      if (typeof cmdModule === "function") {
        cmdModule(program, execute);
        continue;
      }

      // Pattern A: declarative object { name, alias, description, options, action }
      const cmd = program
        .command(cmdModule.name)
        .description(cmdModule.description);

      if (cmdModule.alias) cmd.alias(cmdModule.alias);

      if (cmdModule.options) {
        cmdModule.options.forEach((opt) => {
          cmd.option(opt.flags, opt.description, opt.defaultValue);
        });
      }

      cmd.action(async (args, options) => {
        const actualArgs = typeof args === "string" ? args : null;
        const actualOptions = typeof args === "object" ? args : options;

        await execute(cmdModule.header || null, async () => {
          await cmdModule.action(actualOptions, actualArgs);
        });
      });
    } catch (error) {
      logger.error(`Failed to load command from ${file}: ${error.message}`);
    }
  }
}

// ----------------------------------------------------------
// Unknown command handler with fuzzy matching
// ----------------------------------------------------------
program.on("command:*", (operands) => {
  const unknown = operands[0];
  logger.error(t("cli.error.commandNotFound", { command: unknown }));

  // Levenshtein distance for fuzzy matching
  const levenshtein = (a, b) => {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) =>
        i === 0 ? j : j === 0 ? i : 0,
      ),
    );
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0),
        );
      }
    }
    return matrix[a.length][b.length];
  };

  // Collect all command names and aliases
  const allNames = [];
  program.commands.forEach((cmd) => {
    allNames.push(cmd.name());
    const aliases = cmd.aliases();
    if (aliases) allNames.push(...aliases);
  });

  // Find closest matches
  const scored = allNames
    .filter((name) => !name.startsWith("_"))
    .map((name) => ({
      name,
      dist: levenshtein(unknown.toLowerCase(), name.toLowerCase()),
    }))
    .filter((s) => s.dist <= 3)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);

  if (scored.length > 0) {
    console.log(chalk.yellow("\n  Did you mean?"));
    scored.forEach((s) => {
      console.log(chalk.gray("    → ") + chalk.cyan(`kamiflow ${s.name}`));
    });
    console.log();
  } else {
    logger.hint(t("cli.hint.tryHelp"));
  }

  process.exit(1);
});

// ----------------------------------------------------------
// Initialize i18n and parse
// ----------------------------------------------------------
(async () => {
  try {
    await initI18n();
    program.parse(process.argv);
  } catch (error) {
    logger.error(`Failed to initialize CLI: ${error.message}`);
    if (process.env.KAMI_DEBUG === "true") {
      console.error(error);
    }
    process.exit(1);
  }
})();
