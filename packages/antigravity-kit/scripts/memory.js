/**
 * agk memory — Memory system management
 *
 * Subcommands:
 *   agk memory          → same as agk memory status
 *   agk memory status   → show file sizes and last updated
 *   agk memory show     → print all memory file contents
 *   agk memory clear    → reset all memory files (with confirmation)
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const readline = require("readline");

const MEMORY_FILES = [
  { file: "context.md", label: "Context" },
  { file: "decisions.md", label: "Decisions" },
  { file: "patterns.md", label: "Patterns" },
  { file: "anti-patterns.md", label: "Anti-patterns" },
];

async function run(projectDir, subcommand) {
  const memoryDir = path.join(projectDir, ".memory");

  switch (subcommand) {
    case "show":
      return await showMemory(memoryDir);
    case "clear":
      return await clearMemory(memoryDir);
    case "status":
    default:
      return await statusMemory(memoryDir);
  }
}

// --- Status ---
async function statusMemory(memoryDir) {
  console.log(chalk.bold.cyan("\n🧠 Memory Status\n"));

  if (!(await fs.pathExists(memoryDir))) {
    console.log(
      chalk.yellow("  ⚠️  .memory/ not found — run `agk init` to initialize\n"),
    );
    return 1;
  }

  for (const { file, label, desc } of MEMORY_FILES) {
    const filePath = path.join(memoryDir, file);
    const exists = await fs.pathExists(filePath);

    if (!exists) {
      console.log(
        `  ${chalk.red("✗")}  ${chalk.bold(label.padEnd(14))} ${chalk.gray("missing")}`,
      );
      continue;
    }

    const stat = await fs.stat(filePath);
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split("\n").filter((l) => l.trim()).length;
    const size = formatSize(stat.size);
    const updated = stat.mtime.toISOString().split("T")[0];

    console.log(
      `  ${chalk.green("✓")}  ${chalk.bold(label.padEnd(14))} ` +
        `${chalk.gray(size.padEnd(8))} ${chalk.gray(`${lines} lines`).padEnd(16)} ` +
        `${chalk.gray("updated " + updated)}`,
    );
  }

  console.log();
  console.log(chalk.gray("  Commands: agk memory show | agk memory clear"));
  console.log();
  return 0;
}

// --- Show ---
async function showMemory(memoryDir) {
  if (!(await fs.pathExists(memoryDir))) {
    console.log(
      chalk.yellow("\n⚠️  .memory/ not found — run `agk init` to initialize\n"),
    );
    return 1;
  }

  for (const { file, label } of MEMORY_FILES) {
    const filePath = path.join(memoryDir, file);
    if (!(await fs.pathExists(filePath))) continue;

    const content = await fs.readFile(filePath, "utf8");
    console.log(chalk.bold.cyan(`\n${"─".repeat(50)}`));
    console.log(chalk.bold(`📄 ${label} (${file})`));
    console.log(chalk.bold.cyan("─".repeat(50)));
    console.log(content.trim());
  }

  console.log();
  return 0;
}

// --- Clear ---
async function clearMemory(memoryDir) {
  if (!(await fs.pathExists(memoryDir))) {
    console.log(chalk.yellow("\n⚠️  .memory/ not found\n"));
    return 1;
  }

  console.log(
    chalk.bold.red(
      "\n⚠️  This will reset all memory files to empty templates.\n",
    ),
  );
  console.log(
    chalk.gray(
      "  Files: context.md, decisions.md, patterns.md, anti-patterns.md\n",
    ),
  );

  const confirmed = await confirm("Are you sure? (y/N) ");
  if (!confirmed) {
    console.log(chalk.gray("\n  Cancelled.\n"));
    return 0;
  }

  const TEMPLATES_DIR = path.join(__dirname, "..", "templates", "memory");

  for (const { file, label } of MEMORY_FILES) {
    const src = path.join(TEMPLATES_DIR, file);
    const dest = path.join(memoryDir, file);
    if (await fs.pathExists(src)) {
      await fs.copy(src, dest, { overwrite: true });
      console.log(chalk.green(`  ✅ ${label} reset`));
    }
  }

  console.log(chalk.bold.green("\n  Memory cleared!\n"));
  return 0;
}

// --- Helpers ---
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

module.exports = { run };
