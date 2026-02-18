#!/usr/bin/env node

/**
 * agk — Antigravity Kit CLI Router
 *
 * Usage:
 *   agk              → scaffold (same as agk init)
 *   agk init         → scaffold all templates
 *   agk init -i      → interactive setup wizard
 *   agk doctor       → health check
 *   agk hooks        → install git hooks
 *   agk --help       → show usage
 *   agk --version    → show version
 */

const chalk = require("chalk");
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
  ${chalk.yellow("agk")}                  Scaffold AI guard rails (default)
  ${chalk.yellow("agk init")}             Scaffold all templates
  ${chalk.yellow("agk init -i")}          Interactive setup wizard
  ${chalk.yellow("agk doctor")}           Health check
  ${chalk.yellow("agk hooks")}            Install git hooks
  ${chalk.yellow("agk --help")}           Show this help
  ${chalk.yellow("agk --version")}        Show version

${chalk.bold("EXAMPLES")}
  ${chalk.gray("# First time setup")}
  agk init -i

  ${chalk.gray("# Check project health")}
  agk doctor

  ${chalk.gray("# Enable memory auto-sync")}
  agk hooks
`);
}

// --- Route command ---
switch (command) {
  case undefined:
  case "init": {
    // Pass remaining args (e.g. -i, --interactive, --force) to init
    process.argv = [process.argv[0], process.argv[1], ...subArgs];
    require("./init");
    break;
  }

  case "doctor": {
    const doctor = require("../scripts/doctor");
    doctor
      .run(CWD)
      .then((code) => process.exit(code))
      .catch((err) => {
        console.error(chalk.red("Health check failed:"), err.message);
        process.exit(1);
      });
    break;
  }

  case "hooks": {
    const installHooks = require("../scripts/install-hooks");
    installHooks
      .run(CWD)
      .then((code) => process.exit(code))
      .catch((err) => {
        console.error(chalk.red("Hook installation failed:"), err.message);
        process.exit(1);
      });
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
