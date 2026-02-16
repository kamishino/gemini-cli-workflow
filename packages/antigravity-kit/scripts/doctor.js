/**
 * Antigravity Kit - Health Check System
 * Validates project setup and provides recommendations
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

/**
 * Health check result levels
 */
const LEVEL = {
  OK: { symbol: "✅", label: "OK", color: chalk.green },
  WARNING: { symbol: "⚠️", label: "Warning", color: chalk.yellow },
  ERROR: { symbol: "❌", label: "Error", color: chalk.red },
  INFO: { symbol: "💡", label: "Suggestion", color: chalk.blue },
};

/**
 * Run health check
 */
async function run(projectDir) {
  console.log(chalk.bold.cyan("\n🔍 Antigravity Kit Health Check\n"));

  const results = [];

  // Check 1: Workflows
  results.push(await checkWorkflows(projectDir));

  // Check 2: Memory System
  results.push(await checkMemorySystem(projectDir));

  // Check 3: Guard Rails
  results.push(await checkGuardRails(projectDir));

  // Display results
  displayResults(results);

  // Overall health
  const overallHealth = calculateOverallHealth(results);
  displayOverallHealth(overallHealth);

  // Return exit code (0 = ok, 1 = warnings, 2 = errors)
  return overallHealth.exitCode;
}

/**
 * Check workflows directory
 */
async function checkWorkflows(projectDir) {
  const workflowsDir = path.join(projectDir, ".agent", "workflows");
  const result = {
    category: "Workflows",
    level: LEVEL.OK,
    message: "",
    details: [],
  };

  try {
    const exists = await fs.pathExists(workflowsDir);
    if (!exists) {
      result.level = LEVEL.ERROR;
      result.message = ".agent/workflows/ directory not found";
      result.details.push("Run `npx antigravity-kit init` to initialize");
      return result;
    }

    const files = await fs.readdir(workflowsDir);
    const workflows = files.filter((f) => f.endsWith(".md"));

    if (workflows.length === 0) {
      result.level = LEVEL.WARNING;
      result.message = "No workflows found";
      result.details.push(
        "Consider adding workflows like develop.md, review.md, sync.md",
      );
    } else {
      result.message = `${workflows.length} workflow(s) found`;
      result.details = workflows.map((w) => `  - ${w}`);
    }
  } catch (error) {
    result.level = LEVEL.ERROR;
    result.message = `Failed to check workflows: ${error.message}`;
  }

  return result;
}

/**
 * Check memory system
 */
async function checkMemorySystem(projectDir) {
  const memoryDir = path.join(projectDir, ".memory");
  const result = {
    category: "Memory System",
    level: LEVEL.OK,
    message: "",
    details: [],
  };

  const expectedFiles = [
    "context.md",
    "patterns.md",
    "decisions.md",
    "anti-patterns.md",
  ];

  try {
    const exists = await fs.pathExists(memoryDir);
    if (!exists) {
      result.level = LEVEL.WARNING;
      result.message = ".memory/ directory not found";
      result.details.push("Memory system not initialized (optional)");
      return result;
    }

    const files = await fs.readdir(memoryDir);
    const foundFiles = expectedFiles.filter((f) => files.includes(f));
    const missingFiles = expectedFiles.filter((f) => !files.includes(f));

    if (foundFiles.length === 0) {
      result.level = LEVEL.WARNING;
      result.message = "Memory system empty";
      result.details.push(
        "Expected files: context.md, patterns.md, decisions.md, anti-patterns.md",
      );
    } else if (missingFiles.length > 0) {
      result.level = LEVEL.WARNING;
      result.message = `${foundFiles.length}/${expectedFiles.length} memory files present`;
      result.details.push(`Missing: ${missingFiles.join(", ")}`);
    } else {
      result.message = `${foundFiles.length}/${expectedFiles.length} memory files present`;
      result.details = foundFiles.map((f) => `  - ${f}`);
    }
  } catch (error) {
    result.level = LEVEL.ERROR;
    result.message = `Failed to check memory system: ${error.message}`;
  }

  return result;
}

/**
 * Check guard rails
 */
async function checkGuardRails(projectDir) {
  const rulesDir = path.join(projectDir, ".agent", "rules");
  const result = {
    category: "Guard Rails",
    level: LEVEL.OK,
    message: "",
    details: [],
  };

  const recommendedRules = [
    "anti-hallucination.md",
    "error-recovery.md",
    "validation-loop.md",
  ];

  try {
    const exists = await fs.pathExists(rulesDir);
    if (!exists) {
      result.level = LEVEL.WARNING;
      result.message = ".agent/rules/ directory not found";
      result.details.push("Guard rails not configured (optional)");
      return result;
    }

    const files = await fs.readdir(rulesDir);
    const rules = files.filter((f) => f.endsWith(".md"));
    const missingRecommended = recommendedRules.filter(
      (r) => !rules.includes(r),
    );

    if (rules.length === 0) {
      result.level = LEVEL.WARNING;
      result.message = "No guard rails found";
      result.details.push(
        "Recommended: anti-hallucination.md, error-recovery.md, validation-loop.md",
      );
    } else if (missingRecommended.length > 0) {
      result.level = LEVEL.INFO;
      result.message = `${rules.length} guard rail(s) found`;
      result.details.push(`Consider adding: ${missingRecommended.join(", ")}`);
    } else {
      result.message = `${rules.length} guard rail(s) found`;
      result.details = rules.map((r) => `  - ${r}`);
    }
  } catch (error) {
    result.level = LEVEL.ERROR;
    result.message = `Failed to check guard rails: ${error.message}`;
  }

  return result;
}

/**
 * Display results
 */
function displayResults(results) {
  results.forEach((result) => {
    console.log(
      `${result.level.symbol} ${chalk.bold(result.category)}: ${result.level.color(result.message)}`,
    );
    if (result.details.length > 0) {
      result.details.forEach((detail) => {
        console.log(chalk.gray(detail));
      });
    }
    console.log();
  });
}

/**
 * Calculate overall health
 */
function calculateOverallHealth(results) {
  const errors = results.filter((r) => r.level === LEVEL.ERROR).length;
  const warnings = results.filter((r) => r.level === LEVEL.WARNING).length;

  let status, emoji, exitCode;

  if (errors > 0) {
    status = "Critical Issues Found";
    emoji = "🔴";
    exitCode = 2;
  } else if (warnings > 0) {
    status = "Good (with warnings)";
    emoji = "🟡";
    exitCode = 1;
  } else {
    status = "Excellent";
    emoji = "🟢";
    exitCode = 0;
  }

  return { status, emoji, exitCode, errors, warnings };
}

/**
 * Display overall health
 */
function displayOverallHealth(health) {
  console.log(chalk.bold("─".repeat(50)));
  console.log(chalk.bold(`Overall Health: ${health.emoji} ${health.status}`));

  if (health.errors > 0 || health.warnings > 0) {
    console.log(
      chalk.gray(`  ${health.errors} error(s), ${health.warnings} warning(s)`),
    );
  }

  console.log();
}

module.exports = { run };
