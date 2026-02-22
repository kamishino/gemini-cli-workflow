/**
 * agk suggest — Intelligent agent recommendation
 *
 * Suggests the best agent(s) for a given task based on:
 * - Text query matching against agent triggers
 * - Git diff analysis (changed files vs agent ownership)
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { execSync } = require("child_process");
const { suggest, suggestFromFiles } = require("../lib/agent-runtime");

async function run(projectDir, args = []) {
  // Handle "agk suggest suite" subcommand
  if (args[0] === "suite") {
    return await suggestSuites(projectDir);
  }

  const agentsDir = path.join(projectDir, ".agent", "agents");

  if (!(await fs.pathExists(agentsDir))) {
    console.log(
      chalk.yellow("\n  ⚠  No agents installed. Run `agk upgrade` first.\n"),
    );
    return 1;
  }

  const query = args.filter((a) => !a.startsWith("--")).join(" ");
  const useGit = args.includes("--git") || args.includes("-g");
  const showAll = args.includes("--all") || args.includes("-a");

  let results = [];

  if (useGit || !query) {
    // Auto-detect from git diff
    let changedFiles = [];
    try {
      const diffOutput = execSync("git diff --name-only HEAD", {
        cwd: projectDir,
        encoding: "utf8",
        timeout: 5000,
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();

      if (!diffOutput) {
        // Try staged files
        const stagedOutput = execSync("git diff --name-only --cached", {
          cwd: projectDir,
          encoding: "utf8",
          timeout: 5000,
          stdio: ["pipe", "pipe", "pipe"],
        }).trim();
        if (stagedOutput) {
          changedFiles = stagedOutput.split("\n").filter(Boolean);
        }
      } else {
        changedFiles = diffOutput.split("\n").filter(Boolean);
      }
    } catch {
      // Not a git repo or no changes
    }

    if (changedFiles.length > 0) {
      console.log(
        chalk.bold.cyan("\n🤖 Agent Suggestion") +
          chalk.gray(` (from ${changedFiles.length} changed files)\n`),
      );
      results = await suggestFromFiles(agentsDir, changedFiles);

      // Also try text-based suggestion from file paths
      if (results.length === 0) {
        const queryFromFiles = changedFiles.join(" ");
        results = await suggest(agentsDir, queryFromFiles);
      }
    } else if (query) {
      console.log(chalk.bold.cyan("\n🤖 Agent Suggestion\n"));
      results = await suggest(agentsDir, query);
    } else {
      console.log(chalk.bold.cyan("\n🤖 Agent Suggestion\n"));
      console.log(
        chalk.gray("  No git changes detected and no query provided."),
      );
      console.log(chalk.gray("\n  Usage:"));
      console.log(
        chalk.yellow("    agk suggest <query>") +
          chalk.gray("    — match by text"),
      );
      console.log(
        chalk.yellow("    agk suggest --git") +
          chalk.gray("      — match by git diff"),
      );
      console.log();
      return 0;
    }
  } else {
    console.log(chalk.bold.cyan("\n🤖 Agent Suggestion\n"));
    results = await suggest(agentsDir, query);
  }

  if (results.length === 0) {
    console.log(chalk.gray("  No matching agents found for this context."));
    console.log();
    return 0;
  }

  // Show results
  const toShow = showAll ? results : results.slice(0, 3);
  const maxScore = toShow[0].score;

  for (let i = 0; i < toShow.length; i++) {
    const { agent, score } = toShow[i];
    const pct = Math.round((score / maxScore) * 100);
    const bar =
      "█".repeat(Math.ceil(pct / 10)) + "░".repeat(10 - Math.ceil(pct / 10));
    const rank = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";

    console.log(
      `  ${rank} ${chalk.bold(agent.name || agent.file)} ${chalk.gray(`(${pct}%)`)}`,
    );
    console.log(
      `     ${chalk.cyan(bar)}  ${chalk.gray(agent.description || "")}`,
    );

    if (agent.triggers && agent.triggers.length > 0) {
      console.log(chalk.gray(`     triggers: ${agent.triggers.join(", ")}`));
    }
    if (agent.owns && agent.owns.length > 0) {
      console.log(chalk.gray(`     owns: ${agent.owns.join(", ")}`));
    }
    console.log();
  }

  if (!showAll && results.length > 3) {
    console.log(
      chalk.gray(`  ... and ${results.length - 3} more. Use --all to see all.`),
    );
    console.log();
  }

  return 0;
}

/**
 * agk suggest suite — Deep project analysis + smart suite recommendations
 */
async function suggestSuites(projectDir) {
  const { analyzeProject } = require("../lib/project-analyzer");

  console.log(chalk.bold.cyan("\n📊 Smart Suite Analysis\n"));
  console.log(chalk.gray("  Scanning project...\n"));

  const { signals, scores, recommendations } = await analyzeProject(projectDir);

  // Show detected signals
  if (signals.length > 0) {
    console.log(chalk.bold("  🔍 Evidence detected:\n"));
    const byType = {};
    for (const s of signals) {
      byType[s.type] = byType[s.type] || [];
      byType[s.type].push(s.source);
    }
    for (const [type, sources] of Object.entries(byType)) {
      const icon =
        type === "dependency" ? "📦" : type === "configFile" ? "⚙️" : "📁";
      console.log(
        `  ${icon} ${chalk.bold(type)}: ${chalk.gray(sources.join(", "))}`,
      );
    }
    console.log();
  }

  // Show scored suites
  if (scores.length > 0) {
    console.log(chalk.bold("  📊 Suite scores:\n"));
    for (const entry of scores) {
      const bar =
        "█".repeat(Math.ceil(entry.confidence / 10)) +
        "░".repeat(10 - Math.ceil(entry.confidence / 10));
      console.log(
        `  ${chalk.cyan(bar)} ${chalk.bold(entry.suite)} ${chalk.gray(`(${entry.confidence}%)`)}`,
      );
    }
    console.log();
  }

  // Show recommendations
  if (recommendations.length > 0) {
    console.log(chalk.bold("  📦 Recommendations:\n"));
    for (const rec of recommendations) {
      if (rec.status === "recommended") {
        console.log(
          `  ${chalk.green("✓")} ${chalk.bold(rec.suite)} ${chalk.green(`${rec.confidence}% match`)}`,
        );
        console.log(chalk.yellow(`    agk suite add ${rec.suite}`));
      } else {
        console.log(
          `  ${chalk.gray("○")} ${chalk.gray(rec.suite)} ${chalk.gray(`${rec.confidence}% — ${rec.reason}`)}`,
        );
      }
    }
    console.log();

    // Suggest install command for all recommended suites
    const toInstall = recommendations
      .filter((r) => r.status === "recommended")
      .map((r) => r.suite);
    if (toInstall.length > 1) {
      console.log(chalk.bold("  💡 Install all recommended suites:\n"));
      for (const s of toInstall) {
        console.log(chalk.yellow(`    agk suite add ${s}`));
      }
      console.log();
    }
  } else {
    console.log(
      chalk.gray(
        "  No suite matches found. Try `agk suite available` to browse.\n",
      ),
    );
  }

  return 0;
}

module.exports = { run };
