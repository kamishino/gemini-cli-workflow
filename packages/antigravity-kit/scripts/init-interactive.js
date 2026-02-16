/**
 * Antigravity Kit - Interactive Setup Wizard
 * Guided initialization with workflow and feature selection
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const inquirer = require("inquirer");

/**
 * Available workflows
 */
const WORKFLOWS = [
  {
    name: "develop.md",
    description: "Full idea-to-ship workflow with planning gates",
    recommended: true,
  },
  {
    name: "quick-fix.md",
    description: "Fast track for small, obvious changes",
    recommended: true,
  },
  {
    name: "review.md",
    description: "Structured code review with anti-pattern detection",
    recommended: true,
  },
  {
    name: "sync.md",
    description: "Update memory, review session work, create unified commit",
    recommended: true,
  },
  {
    name: "release.md",
    description: "Smart version bump, changelog generation, release commit",
    recommended: false,
  },
];

/**
 * Guard rails
 */
const GUARD_RAILS = [
  {
    name: "anti-hallucination.md",
    description: "Prevent AI from inventing files/functions",
    recommended: true,
  },
  {
    name: "error-recovery.md",
    description: "3-level retry model for self-healing",
    recommended: true,
  },
  {
    name: "validation-loop.md",
    description: "Syntax → Functional → Traceability validation",
    recommended: true,
  },
  {
    name: "fast-track.md",
    description: "Bypass full workflow for small changes",
    recommended: false,
  },
  {
    name: "reflection.md",
    description: "Quality gate before marking tasks complete",
    recommended: false,
  },
];

/**
 * Run interactive setup
 */
async function run(targetDir) {
  console.log(chalk.bold.cyan("\n✨ Antigravity Kit - Interactive Setup\n"));

  try {
    // Prompt 1: Workflows
    const { selectedWorkflows } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedWorkflows",
        message: "Select workflows to install:",
        choices: WORKFLOWS.map((w) => ({
          name: `${w.name.padEnd(20)} - ${w.description}`,
          value: w.name,
          checked: w.recommended,
        })),
        validate: (answer) => {
          if (answer.length === 0) {
            return "You must select at least one workflow.";
          }
          return true;
        },
      },
    ]);

    // Prompt 2: Memory System
    const { memorySystem } = await inquirer.prompt([
      {
        type: "list",
        name: "memorySystem",
        message: "Choose memory system:",
        choices: [
          {
            name: "Basic (context, patterns, decisions, anti-patterns)",
            value: "basic",
          },
          { name: "None (skip memory system)", value: "none" },
        ],
        default: "basic",
      },
    ]);

    // Prompt 3: Guard Rails
    const { selectedGuardRails } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "selectedGuardRails",
        message: "Select guard rails to install:",
        choices: GUARD_RAILS.map((r) => ({
          name: `${r.name.padEnd(25)} - ${r.description}`,
          value: r.name,
          checked: r.recommended,
        })),
      },
    ]);

    // Summary
    console.log(chalk.bold("\n📋 Configuration Summary:\n"));
    console.log(
      chalk.gray(`  Workflows: ${selectedWorkflows.length} selected`),
    );
    console.log(
      chalk.gray(
        `  Memory System: ${memorySystem === "basic" ? "Basic" : "None"}`,
      ),
    );
    console.log(
      chalk.gray(`  Guard Rails: ${selectedGuardRails.length} selected\n`),
    );

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Proceed with installation?",
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("\n⚠️  Installation cancelled.\n"));
      return;
    }

    // Install selected components
    await installComponents(targetDir, {
      workflows: selectedWorkflows,
      memorySystem,
      guardRails: selectedGuardRails,
    });

    console.log(
      chalk.bold.green("\n✅ Antigravity Kit installed successfully!\n"),
    );
    console.log(chalk.gray("Next steps:"));
    console.log(
      chalk.gray("  1. Review installed files in .agent/ and .memory/"),
    );
    console.log(
      chalk.gray("  2. Run `npx antigravity-kit doctor` to verify setup"),
    );
    console.log(
      chalk.gray("  3. Start using workflows with /develop, /review, etc.\n"),
    );
  } catch (error) {
    console.error(chalk.red("\n❌ Installation failed:"), error.message);
    throw error;
  }
}

/**
 * Install selected components
 */
async function installComponents(targetDir, config) {
  const templateDir = path.join(__dirname, "..", "templates");

  // Create directories
  const agentDir = path.join(targetDir, ".agent");
  const workflowsDir = path.join(agentDir, "workflows");
  const rulesDir = path.join(agentDir, "rules");

  await fs.ensureDir(workflowsDir);
  await fs.ensureDir(rulesDir);

  // Install workflows
  console.log(chalk.cyan("\n📁 Installing workflows..."));
  for (const workflow of config.workflows) {
    const src = path.join(templateDir, "workflows", workflow);
    const dest = path.join(workflowsDir, workflow);

    if (await fs.pathExists(src)) {
      await fs.copy(src, dest);
      console.log(chalk.gray(`  ✓ ${workflow}`));
    } else {
      console.log(chalk.yellow(`  ⚠ ${workflow} not found, skipping`));
    }
  }

  // Install memory system
  if (config.memorySystem === "basic") {
    console.log(chalk.cyan("\n🧠 Installing memory system..."));
    const memoryDir = path.join(targetDir, ".memory");
    await fs.ensureDir(memoryDir);

    const memoryFiles = [
      "context.md",
      "patterns.md",
      "decisions.md",
      "anti-patterns.md",
    ];
    for (const file of memoryFiles) {
      const src = path.join(templateDir, "memory", file);
      const dest = path.join(memoryDir, file);

      if (await fs.pathExists(src)) {
        await fs.copy(src, dest);
        console.log(chalk.gray(`  ✓ ${file}`));
      } else {
        // Create empty file if template doesn't exist
        await fs.writeFile(
          dest,
          `# ${file.replace(".md", "").replace("-", " ").toUpperCase()}\n\n`,
        );
        console.log(chalk.gray(`  ✓ ${file} (created empty)`));
      }
    }
  }

  // Install guard rails
  if (config.guardRails.length > 0) {
    console.log(chalk.cyan("\n🛡️  Installing guard rails..."));
    for (const rule of config.guardRails) {
      const src = path.join(templateDir, "rules", rule);
      const dest = path.join(rulesDir, rule);

      if (await fs.pathExists(src)) {
        await fs.copy(src, dest);
        console.log(chalk.gray(`  ✓ ${rule}`));
      } else {
        console.log(chalk.yellow(`  ⚠ ${rule} not found, skipping`));
      }
    }
  }

  // Save config
  const configPath = path.join(agentDir, "config.json");
  await fs.writeJson(
    configPath,
    {
      installedAt: new Date().toISOString(),
      workflows: config.workflows,
      memorySystem: config.memorySystem,
      guardRails: config.guardRails,
    },
    { spaces: 2 },
  );

  console.log(chalk.gray(`\n  ✓ Saved configuration to .agent/config.json`));
}

module.exports = { run };
