#!/usr/bin/env node

/**
 * agk — Antigravity Kit CLI Router
 *
 * Usage:
 *   agk              → smart default (init if new, doctor if exists)
 *   agk init         → scaffold all templates
 *   agk init -i      → interactive setup wizard
 *   agk status       → quick project summary
 *   agk doctor       → full health check
 *   agk hooks        → install git hooks
 *   agk --help       → show usage
 *   agk --version    → show version
 */

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const { version } = require("../package.json");

const CWD = process.cwd();
const args = process.argv.slice(2);
const command = args[0];
const subArgs = args.slice(1);

// --- Help text ---
function showHelp() {
  console.log(`
${chalk.bold.cyan("agk")} — Antigravity Kit v${version}

${chalk.bold("USAGE")}
  ${chalk.yellow("agk")}                  Smart default (init if new, doctor if exists)
  ${chalk.yellow("agk init")}             Scaffold all templates
  ${chalk.yellow("agk init -i")}          Interactive setup wizard
  ${chalk.yellow("agk status")}           Quick project summary
  ${chalk.yellow("agk doctor")}           Full health check
  ${chalk.yellow("agk upgrade")}          Update workflows & rules from templates
  ${chalk.yellow("agk hooks")}            Install git hooks
  ${chalk.yellow("agk --help")}           Show this help
  ${chalk.yellow("agk --version")}        Show version

${chalk.bold("EXAMPLES")}
  ${chalk.gray("# First time setup")}
  agk init -i

  ${chalk.gray("# Quick status overview")}
  agk status

  ${chalk.gray("# Full health check")}
  agk doctor

  ${chalk.gray("# Enable memory auto-sync")}
  agk hooks
`);
}

// --- Main (async to support smart default) ---
async function main() {
  switch (command) {
    case undefined: {
      // Smart default: init if .agent/ not found, doctor if already set up
      const hasAgent = await fs.pathExists(path.join(CWD, ".agent"));
      if (hasAgent) {
        console.log(
          chalk.gray("💡 Project initialized — running health check...\n"),
        );
        const doctor = require("../scripts/doctor");
        const code = await doctor.run(CWD);
        process.exit(code);
      } else {
        console.log(chalk.gray("💡 No .agent/ found — running init...\n"));
        process.argv = [process.argv[0], process.argv[1]];
        require("./init");
      }
      break;
    }

    case "init": {
      // Pass remaining args (e.g. -i, --interactive, --force) to init
      process.argv = [process.argv[0], process.argv[1], ...subArgs];
      require("./init");
      break;
    }

    case "status": {
      const status = require("../scripts/status");
      const code = await status.run(CWD);
      process.exit(code);
      break;
    }

    case "doctor": {
      const doctor = require("../scripts/doctor");
      const code = await doctor.run(CWD);
      process.exit(code);
      break;
    }

    case "upgrade": {
      const upgrade = require("../scripts/upgrade");
      const code = await upgrade.run(CWD);
      process.exit(code);
      break;
    }

    case "hooks": {
      const installHooks = require("../scripts/install-hooks");
      const code = await installHooks.run(CWD);
      process.exit(code);
      break;
    }

    case "--help":
    case "-h": {
      showHelp();
      process.exit(0);
      break;
    }

    case "--version":
    case "-v": {
      console.log(`agk v${version}`);
      process.exit(0);
      break;
    }

    default: {
      console.error(chalk.red(`\nUnknown command: ${command}\n`));
      showHelp();
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(chalk.red("Error:"), err.message);
  process.exit(1);
});
