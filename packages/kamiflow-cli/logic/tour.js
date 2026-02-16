/* eslint-disable no-process-exit */
const chalk = require("chalk");
const logger = require("../utils/logger");

/**
 * Interactive Tour - Step-by-step walkthrough of KamiFlow features
 * Teaches new users the core workflow and available commands.
 */

const TOUR_STEPS = [
  {
    title: "Welcome to KamiFlow! 🌊",
    icon: "🏠",
    content: [
      "KamiFlow is The Orchestrator for Indie Builders using Gemini CLI.",
      'Philosophy: "Aesthetics + Utility" — Ship fast, break nothing important.',
      "",
      "This tour will walk you through the core features in ~3 minutes.",
    ],
  },
  {
    title: "The Sniper Model 🎯",
    icon: "🎯",
    content: [
      "KamiFlow uses a 3-step fused kernel for every feature:",
      "",
      "  Step 1: IDEA   → Diagnostic interview to find the root cause",
      "  Step 2: SPEC   → Schema-First technical specification",
      "  Step 3: BUILD  → Task breakdown with Legacy Code awareness",
      "",
      "Command: /kamiflow:dev:flow  (orchestrates all 3 steps)",
    ],
  },
  {
    title: "Essential Commands ⚡",
    icon: "⚡",
    content: [
      "Here are the commands you'll use daily:",
      "",
      "  kamiflow doctor     → Check system health",
      "  kamiflow dashboard   → View project metrics at a glance",
      "  kamiflow search      → Search workspace files",
      "  kamiflow archive     → Archive completed tasks",
      "  kamiflow config ls   → View your configuration",
    ],
  },
  {
    title: "Saiyan Automation Suite 🚀",
    icon: "🚀",
    content: [
      "For power users who want maximum automation:",
      "",
      "  /kamiflow:dev:superlazy  → Auto-generate all artifacts",
      "  /kamiflow:dev:saiyan     → Autonomous execution (God Mode)",
      "  /kamiflow:dev:supersaiyan → Batch processing cycles",
      "",
      "These commands run inside the Gemini CLI session.",
    ],
  },
  {
    title: "Knowledge Graph 🧠",
    icon: "🧠",
    content: [
      "KamiFlow maintains a persistent Knowledge Graph:",
      "",
      "  kamiflow search <query>   → Semantic search across workspace",
      "  _insights --task <id>     → View task relationships",
      "  _insights --export        → Export interactive HTML map",
      "",
      "Every task you complete feeds back into the knowledge base.",
    ],
  },
  {
    title: "Sync & Collaboration 🔄",
    icon: "🔄",
    content: [
      "Keep your workspace data in sync across machines:",
      "",
      "  kamiflow db setup    → Configure sync backend",
      "  kamiflow db push     → Upload local changes",
      "  kamiflow db pull     → Download remote changes",
      "  kamiflow db status   → Show sync status",
      "",
      "Supports auto-sync daemon for hands-free operation.",
    ],
  },
  {
    title: "Project Health & Hooks 🛡️",
    icon: "🛡️",
    content: [
      "Keep your project healthy:",
      "",
      "  kamiflow doctor       → Run health checks",
      "  kamiflow doctor --fix → Auto-fix detected issues",
      "  kamiflow hooks install → Add git pre-commit validation",
      "  kamiflow validate     → Check config files",
    ],
  },
  {
    title: "You're Ready! 🎉",
    icon: "🎉",
    content: [
      "You now know the essentials of KamiFlow!",
      "",
      "Getting Started:",
      "  1. Run: kamiflow doctor     (check your setup)",
      "  2. Run: kamiflow dashboard   (see project status)",
      "  3. Open Gemini CLI and try: /kamiflow:dev:flow",
      "",
      "Full docs: packages/kamiflow-cli/docs/commands/README.md",
      "Help: kamiflow --help",
    ],
  },
];

/**
 * Render a single tour step with a styled box
 */
function renderStep(step, current, total) {
  const termWidth = process.stdout.columns || 80;
  const boxWidth = Math.min(72, termWidth - 4);
  const innerWidth = boxWidth - 4;

  const top = chalk.cyan("┌" + "─".repeat(boxWidth - 2) + "┐");
  const bottom = chalk.cyan("└" + "─".repeat(boxWidth - 2) + "┘");
  const empty = chalk.cyan("│") + " ".repeat(boxWidth - 2) + chalk.cyan("│");

  const progress = `[${current + 1}/${total}]`;
  const titleText = `${step.icon}  ${step.title}`;
  const titlePad = boxWidth - 4 - titleText.length - progress.length;

  let output = "\n" + top + "\n";
  output += empty + "\n";
  output +=
    chalk.cyan("│") +
    "  " +
    chalk.bold.white(titleText) +
    " ".repeat(Math.max(1, titlePad)) +
    chalk.gray(progress) +
    " " +
    chalk.cyan("│") +
    "\n";
  output += empty + "\n";

  // Separator
  output +=
    chalk.cyan("│") +
    " " +
    chalk.gray("─".repeat(boxWidth - 4)) +
    " " +
    chalk.cyan("│") +
    "\n";

  // Content lines
  for (const line of step.content) {
    const displayLine = line || "";
    const linePad = innerWidth - displayLine.length;
    output +=
      chalk.cyan("│") +
      "  " +
      chalk.white(displayLine) +
      " ".repeat(Math.max(1, linePad)) +
      " " +
      chalk.cyan("│") +
      "\n";
  }

  output += empty + "\n";
  output += bottom + "\n";

  return output;
}

/**
 * Run the interactive tour
 * @param {object} options - Tour options
 * @param {boolean} options.quick - Show all steps without prompts
 */
async function runTour(options = {}) {
  const total = TOUR_STEPS.length;

  console.log();
  logger.header("KamiFlow Interactive Tour");
  console.log(
    chalk.gray("  Navigate through the core features of KamiFlow.\n"),
  );

  if (options.quick) {
    // Quick mode: print all steps
    for (let i = 0; i < total; i++) {
      console.log(renderStep(TOUR_STEPS[i], i, total));
    }
    console.log(chalk.green("\n✅ Tour complete! Happy building! 🚀\n"));
    return;
  }

  // Interactive mode
  const inquirer = require("inquirer").default;

  for (let i = 0; i < total; i++) {
    console.log(renderStep(TOUR_STEPS[i], i, total));

    if (i < total - 1) {
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: chalk.gray("What next?"),
          choices: [
            { name: chalk.green("→ Next step"), value: "next" },
            { name: chalk.yellow("⏩ Skip to end"), value: "skip" },
            { name: chalk.red("✕ Exit tour"), value: "exit" },
          ],
        },
      ]);

      if (action === "exit") {
        console.log(
          chalk.gray(
            "\n  Tour paused. Run `kamiflow tour` anytime to restart.\n",
          ),
        );
        return;
      }
      if (action === "skip") {
        // Show final step
        console.log(renderStep(TOUR_STEPS[total - 1], total - 1, total));
        break;
      }
    }
  }

  console.log(chalk.green("\n✅ Tour complete! Happy building! 🚀\n"));
}

module.exports = { runTour, TOUR_STEPS };
