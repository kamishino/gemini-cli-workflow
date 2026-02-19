/**
 * agk diff — Template drift detection
 *
 * Compares installed files against bundled templates to show
 * which files have been modified, are outdated, or are missing.
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const crypto = require("crypto");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");

const DIFF_TARGETS = [
  {
    label: "Workflows",
    templateDir: "workflows",
    destDir: path.join(".agent", "workflows"),
    ext: ".md",
  },
  {
    label: "Agents",
    templateDir: "agents",
    destDir: path.join(".agent", "agents"),
    ext: ".md",
  },
  {
    label: "Rules",
    templateDir: "rules",
    destDir: path.join(".gemini", "rules"),
    ext: ".md",
    altDestDir: path.join(".agent", "rules"),
  },
  {
    label: "Skills",
    templateDir: "skills",
    destDir: path.join(".gemini", "skills"),
    ext: ".md",
  },
  {
    label: "Memory",
    templateDir: "memory",
    destDir: ".memory",
    ext: ".md",
  },
];

/**
 * Hash file content for comparison (ignores line endings)
 */
function hashContent(content) {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  return crypto.createHash("md5").update(normalized).digest("hex");
}

async function run(projectDir, args = []) {
  const showAll = args.includes("--all") || args.includes("-a");
  const jsonOutput = args.includes("--json");

  if (!jsonOutput) {
    console.log(chalk.bold.cyan("\n🔍 AGK Template Drift Report\n"));
  }

  const allResults = [];
  let totalModified = 0;
  let totalMissing = 0;
  let totalMatch = 0;
  let totalCustom = 0;

  for (const target of DIFF_TARGETS) {
    const templateDir = path.join(TEMPLATES_DIR, target.templateDir);
    if (!(await fs.pathExists(templateDir))) continue;

    // Resolve destination
    let destDir = path.join(projectDir, target.destDir);
    if (target.altDestDir && !(await fs.pathExists(destDir))) {
      const altDest = path.join(projectDir, target.altDestDir);
      if (await fs.pathExists(altDest)) destDir = altDest;
    }

    const templateFiles = (await fs.readdir(templateDir)).filter((f) =>
      f.endsWith(target.ext),
    );

    const results = [];

    for (const file of templateFiles) {
      const srcPath = path.join(templateDir, file);
      const destPath = path.join(destDir, file);

      if (!(await fs.pathExists(destPath))) {
        results.push({ file, status: "missing", icon: "❌", color: chalk.red });
        totalMissing++;
        continue;
      }

      const srcContent = await fs.readFile(srcPath, "utf8");
      const destContent = await fs.readFile(destPath, "utf8");
      const srcHash = hashContent(srcContent);
      const destHash = hashContent(destContent);

      if (srcHash === destHash) {
        results.push({
          file,
          status: "identical",
          icon: "✅",
          color: chalk.gray,
        });
        totalMatch++;
      } else {
        results.push({
          file,
          status: "modified",
          icon: "🔀",
          color: chalk.yellow,
        });
        totalModified++;
      }
    }

    // Check for custom files (exist in dest but not in templates)
    if (await fs.pathExists(destDir)) {
      const installedFiles = (await fs.readdir(destDir)).filter((f) =>
        f.endsWith(target.ext),
      );
      for (const file of installedFiles) {
        if (!templateFiles.includes(file)) {
          results.push({
            file,
            status: "custom",
            icon: "🆕",
            color: chalk.cyan,
          });
          totalCustom++;
        }
      }
    }

    allResults.push({ group: target.label, results });
  }

  if (jsonOutput) {
    console.log(JSON.stringify(allResults, null, 2));
    return 0;
  }

  // Print results
  for (const group of allResults) {
    const nonIdentical = group.results.filter((r) => r.status !== "identical");
    if (!showAll && nonIdentical.length === 0) {
      console.log(
        `  ${chalk.green("✅")}  ${chalk.bold(group.group.padEnd(12))} ${chalk.gray(`${group.results.length} files — all identical`)}`,
      );
      continue;
    }

    console.log(chalk.bold(`  ${group.group}:`));
    const toShow = showAll ? group.results : nonIdentical;
    for (const r of toShow) {
      console.log(
        `    ${r.icon}  ${r.color(r.file.padEnd(35))} ${r.color(r.status)}`,
      );
    }
    console.log();
  }

  // Summary
  console.log(chalk.gray("  " + "─".repeat(46)));
  const parts = [];
  if (totalMatch > 0) parts.push(chalk.green(`${totalMatch} identical`));
  if (totalModified > 0) parts.push(chalk.yellow(`${totalModified} modified`));
  if (totalMissing > 0) parts.push(chalk.red(`${totalMissing} missing`));
  if (totalCustom > 0) parts.push(chalk.cyan(`${totalCustom} custom`));
  console.log(`  ${parts.join(chalk.gray(" · "))}`);

  if (totalModified > 0 || totalMissing > 0) {
    console.log(
      chalk.gray("\n  Tip: run `agk upgrade` to sync modified/missing files"),
    );
    console.log(
      chalk.gray("  Tip: run `agk diff --all` to show identical files too"),
    );
  }

  console.log();
  return 0;
}

module.exports = { run };
