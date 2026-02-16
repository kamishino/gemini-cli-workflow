#!/usr/bin/env node

/**
 * antigravity-kit init
 *
 * Scaffolds AI guard rails into the current project:
 *   .gemini/GEMINI.md
 *   .gemini/rules/  (5 portable rules)
 *   .gemini/skills/structured-dev/
 *   .agent/workflows/ (5 workflows)
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");
const CWD = process.cwd();

const TARGETS = [
  {
    src: "GEMINI.md",
    dest: "GEMINI.md",
    label: "GEMINI.md (AI system instructions)",
  },
  {
    src: "rules",
    dest: path.join(".gemini", "rules"),
    label: ".gemini/rules/ (5 AI behavior rules)",
    dir: true,
  },
  {
    src: "skills",
    dest: path.join(".gemini", "skills"),
    label: ".gemini/skills/ (structured-dev skill)",
    dir: true,
  },
  {
    src: "workflows",
    dest: path.join(".agent", "workflows"),
    label: ".agent/workflows/ (5 development workflows)",
    dir: true,
  },
];

async function main() {
  const args = process.argv.slice(2);

  if (!args.includes("init")) {
    console.log(chalk.bold.cyan("\n  Antigravity Kit") + " — AI Guard Rails\n");
    console.log("  Usage: " + chalk.yellow("npx antigravity-kit init") + "\n");
    console.log(
      "  Scaffolds portable AI rules, workflows, and skills\n  into your project for structured development.\n",
    );
    process.exit(0);
  }

  const force = args.includes("--force") || args.includes("-f");

  console.log(
    chalk.bold.cyan("\n🚀 Antigravity Kit") + " — Scaffolding AI Guard Rails\n",
  );

  // Check templates exist
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(
      chalk.red(
        "❌ Templates directory not found. Run `npm run build` first.\n",
      ),
    );
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const target of TARGETS) {
    const srcPath = path.join(TEMPLATES_DIR, target.src);
    const destPath = path.join(CWD, target.dest);

    if (!fs.existsSync(srcPath)) {
      console.log(chalk.yellow(`  ⏭  ${target.label} (source not found)`));
      skipped++;
      continue;
    }

    if (fs.existsSync(destPath) && !force) {
      console.log(chalk.gray(`  ⏭  ${target.label} (already exists)`));
      skipped++;
      continue;
    }

    if (target.dir) {
      await fs.ensureDir(destPath);
      await fs.copy(srcPath, destPath, { overwrite: force });
    } else {
      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(srcPath, destPath, { overwrite: force });
    }

    console.log(chalk.green(`  ✅  ${target.label}`));
    created++;
  }

  console.log();

  if (created > 0) {
    console.log(
      chalk.bold.green(`  Done!`) +
        ` Created ${created} item(s), skipped ${skipped}.\n`,
    );
    console.log(chalk.gray("  What's next:"));
    console.log(
      chalk.gray(
        "  • Edit GEMINI.md to customize AI behavior for your project",
      ),
    );
    console.log(
      chalk.gray(
        "  • Use /develop, /quick-fix, /review, /sync, /release workflows",
      ),
    );
    console.log(
      chalk.gray("  • Run with --force to overwrite existing files\n"),
    );
  } else {
    console.log(
      chalk.yellow("  All files already exist. Use --force to overwrite.\n"),
    );
  }
}

main().catch((err) => {
  console.error(chalk.red(`\n❌ Error: ${err.message}\n`));
  process.exit(1);
});
