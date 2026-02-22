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
 *   agk upgrade      → update workflows & rules from templates
 *   agk hooks        → install git hooks
 *   agk ci           → generate GitHub Actions health check
 *   agk memory       → memory status
 *   agk memory show  → print all memory files
 *   agk memory clear → reset memory to templates
 *   agk memory sync            → push .memory/ to private git repo
 *   agk memory sync setup <url> → configure private remote
 *   agk memory sync push       → push .memory/
 *   agk memory sync pull       → pull .memory/ from remote
 *   agk memory sync status     → show sync status
 *   agk info         → show install details
 *   agk version      → show version
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
  ${chalk.yellow("agk ci")}               Generate GitHub Actions health check
  ${chalk.yellow("agk memory")}           Memory status
  ${chalk.yellow("agk memory show")}      Print all memory files
  ${chalk.yellow("agk memory clear")}     Reset memory to templates
  ${chalk.yellow("agk memory sync")}      Push memory to private git repo
  ${chalk.yellow("agk memory sync pull")} Pull memory from private git repo
  ${chalk.yellow("agk changelog")}        Show version changelog
  ${chalk.yellow("agk scaffold <type>")}  Generate agent/workflow/rule boilerplate
  ${chalk.yellow("agk agents")}            Register agents + generate AGENTS.md
  ${chalk.yellow("agk agents find <q>")}   Search community agent templates
  ${chalk.yellow("agk agents list")}       List installed agents
  ${chalk.yellow("agk suite add <name>")}  Install a development suite
  ${chalk.yellow("agk suite remove <n>")} Uninstall a suite cleanly
  ${chalk.yellow("agk suite find <q>")}   Search for community suites
  ${chalk.yellow("agk suite create <n>")} Export project as a shareable suite
  ${chalk.yellow("agk suite available")}   Show all available suites
  ${chalk.yellow("agk suite list")}        List installed suites
  ${chalk.yellow("agk skills add <n>")}    Install skills from skills.sh
  ${chalk.yellow("agk skills find <q>")}   Search for skills by keyword
  ${chalk.yellow("agk skills list")}       List installed skills
  ${chalk.yellow("agk skills check")}      Check for skill updates
  ${chalk.yellow("agk skills update")}     Update all installed skills
  ${chalk.yellow("agk suggest <query>")}    Find the best agent for a task
  ${chalk.yellow("agk suggest suite")}      Analyze project and recommend suites
  ${chalk.yellow("agk suggest --git")}     Suggest agent from git changes
  ${chalk.yellow("agk brain")}             Open Second Brain dashboard
  ${chalk.yellow("agk brain setup")}       Configure central memory repo
  ${chalk.yellow("agk brain link")}        Link current project memory to brain
  ${chalk.yellow("agk brain sync")}        Commit and push brain to GitHub
  ${chalk.yellow("agk brain pull")}        Pull brain from GitHub (new PC)
  ${chalk.yellow("agk info")}              Show install details
  ${chalk.yellow("agk help")}              Show this help
  ${chalk.yellow("agk --version")}         Show version

${chalk.bold("EXAMPLES")}
  ${chalk.gray("# First time setup")}
  agk init -i

  ${chalk.gray("# Quick status overview")}
  agk status

  ${chalk.gray("# Full health check")}
  agk doctor

  ${chalk.gray("# Enable memory auto-sync")}
  agk hooks

  ${chalk.gray("# Check memory state")}
  agk memory
`);
}

// --- Main (async to support smart default) ---
async function main() {
  switch (command) {
    case "help":
    case "--help":
    case "-h": {
      showHelp();
      process.exit(0);
      break;
    }

    case undefined: {
      // Smart default: init if not initialized, dashboard if already set up
      // Check both .agent/ (workflows) and .gemini/ (rules) — either means initialized
      const hasAgent = await fs.pathExists(path.join(CWD, ".agent"));
      const hasGemini = await fs.pathExists(path.join(CWD, ".gemini", "rules"));
      if (hasAgent || hasGemini) {
        const dashboard = require("../scripts/dashboard");
        const code = await dashboard.run(CWD);
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

    case "ci": {
      const ci = require("../scripts/ci");
      const code = await ci.run(CWD);
      process.exit(code);
      break;
    }

    case "memory": {
      const subcommand = subArgs[0] || "status";
      if (subcommand === "stats") {
        const memoryStats = require("../scripts/memory-stats");
        const code = await memoryStats.run(CWD);
        process.exit(code);
      }
      const memory = require("../scripts/memory");
      const code = await memory.run(CWD, subcommand, subArgs.slice(1));
      process.exit(code);
      break;
    }

    case "brain": {
      const brain = require("../scripts/brain");
      const code = await brain.run(CWD, subArgs);
      process.exit(code);
      break;
    }

    case "skills": {
      const skills = require("../scripts/skills");
      const code = await skills.run(CWD, subArgs);
      process.exit(code);
      break;
    }

    case "agents": {
      const agents = require("../scripts/agents");
      const code = await agents.run(CWD, subArgs);
      process.exit(code);
      break;
    }

    case "scaffold": {
      const scaffold = require("../scripts/scaffold");
      const code = await scaffold.run(CWD, subArgs);
      process.exit(code);
      break;
    }

    case "suite": {
      const suite = require("../scripts/suite");
      const code = await suite.run(CWD, subArgs);
      process.exit(code);
      break;
    }

    case "info": {
      const info = require("../scripts/info");
      const code = await info.run(CWD);
      process.exit(code);
      break;
    }

    case "hooks": {
      const installHooks = require("../scripts/install-hooks");
      const code = await installHooks.run(CWD);
      process.exit(code);
      break;
    }

    case "changelog": {
      const changelog = require("../scripts/changelog");
      const code = await changelog.run(CWD, subArgs);
      process.exit(code);
      break;
    }

    case "diff": {
      const diff = require("../scripts/diff");
      const code = await diff.run(CWD, subArgs);
      process.exit(code);
      break;
    }

    case "suggest": {
      const suggest = require("../scripts/suggest");
      const code = await suggest.run(CWD, subArgs);
      process.exit(code);
      break;
    }

    case "--version":
    case "-v":
    case "version": {
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
