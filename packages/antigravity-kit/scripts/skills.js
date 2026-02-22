/**
 * agk skills — Install and manage agent skills from skills.sh
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { execSync } = require("child_process");
const { parseFrontmatter } = require("../lib/frontmatter");

async function run(projectDir, args = []) {
  const subcommand = args[0] || "list";

  switch (subcommand) {
    case "add":
      return await addSkills(projectDir, args.slice(1));
    case "find":
      return await npxPassthrough(projectDir, "find", args.slice(1));
    case "check":
      return await npxPassthrough(projectDir, "check", args.slice(1));
    case "update":
      return await npxPassthrough(projectDir, "update", args.slice(1));
    case "list":
      return await listSkills(projectDir);
    default:
      console.error(chalk.red(`\n❌ Unknown subcommand: ${subcommand}`));
      showUsage();
      return 1;
  }
}

function showUsage() {
  console.log(chalk.yellow("\n  Usage:"));
  console.log(
    chalk.gray("    agk skills add <name>    Install a skill from skills.sh"),
  );
  console.log(
    chalk.gray("    agk skills find <query>  Search for skills by keyword"),
  );
  console.log(chalk.gray("    agk skills list          List installed skills"));
  console.log(
    chalk.gray("    agk skills check         Check for skill updates"),
  );
  console.log(
    chalk.gray("    agk skills update        Update all installed skills\n"),
  );
}

async function npxPassthrough(projectDir, cmd, args) {
  const query = args.join(" ");
  try {
    execSync(`npx -y skills ${cmd} ${query}`, {
      cwd: projectDir,
      stdio: "inherit",
      timeout: 30000,
    });
    return 0;
  } catch {
    return 1;
  }
}

async function addSkills(projectDir, names) {
  if (names.length === 0) {
    console.error(
      chalk.red(
        "\n❌ Missing skill name. Usage: agk skills add <name> [name2...]\n",
      ),
    );
    console.log(
      chalk.gray("  Browse available skills at https://skills.sh/\n"),
    );
    return 1;
  }

  console.log(chalk.cyan("\n🔧 Installing skills...\n"));

  let installed = 0;
  for (const name of names) {
    try {
      console.log(chalk.gray(`  ⏳ Fetching ${name}...`));
      execSync(`npx -y skills add ${name}`, {
        cwd: projectDir,
        stdio: "pipe",
        timeout: 30000,
      });

      // Verify install
      const skillDir = path.join(projectDir, ".agent", "skills", name);
      const altSkillDir = path.join(projectDir, ".cursor", "skills", name);
      if (
        (await fs.pathExists(skillDir)) ||
        (await fs.pathExists(altSkillDir))
      ) {
        // Move from .cursor/skills to .agent/skills if needed
        if (
          !(await fs.pathExists(skillDir)) &&
          (await fs.pathExists(altSkillDir))
        ) {
          await fs.ensureDir(path.join(projectDir, ".agent", "skills"));
          await fs.move(altSkillDir, skillDir);
        }
        console.log(chalk.green(`  ✓ ${name}`));
        installed++;
      } else {
        console.log(chalk.green(`  ✓ ${name} (installed)`));
        installed++;
      }
    } catch (error) {
      console.log(
        chalk.red(`  ✗ ${name} — failed: ${error.message.split("\n")[0]}`),
      );
    }
  }

  console.log(
    chalk.green(`\n✅ ${installed}/${names.length} skills installed`),
  );
  if (installed > 0) {
    console.log(
      chalk.gray(
        "   Tip: Link skills to agents via the `skills` field in agent frontmatter.\n",
      ),
    );
  }
  return 0;
}

async function listSkills(projectDir) {
  const skillsDir = path.join(projectDir, ".agent", "skills");

  if (!(await fs.pathExists(skillsDir))) {
    console.log(chalk.yellow("\n📦 No skills installed yet."));
    console.log(chalk.gray("   Run: agk skills add <name>"));
    console.log(chalk.gray("   Browse: https://skills.sh/\n"));
    return 0;
  }

  const dirs = (await fs.readdir(skillsDir, { withFileTypes: true })).filter(
    (d) => d.isDirectory(),
  );

  if (dirs.length === 0) {
    console.log(chalk.yellow("\n📦 No skills installed yet."));
    console.log(chalk.gray("   Run: agk skills add <name>\n"));
    return 0;
  }

  console.log(chalk.cyan(`\n🔧 Installed Skills (${dirs.length})\n`));

  for (const dir of dirs) {
    const skillFile = path.join(skillsDir, dir.name, "SKILL.md");
    let desc = "";
    if (await fs.pathExists(skillFile)) {
      const content = await fs.readFile(skillFile, "utf8");
      const meta = parseFrontmatter(content);
      if (meta && meta.description) {
        desc = chalk.gray(` — ${meta.description}`);
      }
    }
    console.log(`  ${chalk.green("✓")} ${chalk.bold(dir.name)}${desc}`);
  }

  // Show which agents reference these skills
  const agentsDir = path.join(projectDir, ".agent", "agents");
  if (await fs.pathExists(agentsDir)) {
    const agentFiles = (await fs.readdir(agentsDir)).filter((f) =>
      f.endsWith(".md"),
    );
    const links = [];
    for (const file of agentFiles) {
      const content = await fs.readFile(path.join(agentsDir, file), "utf8");
      const meta = parseFrontmatter(content);
      if (meta && meta.skills && meta.skills.length > 0) {
        links.push({ agent: meta.name || file, skills: meta.skills });
      }
    }
    if (links.length > 0) {
      console.log(chalk.cyan("\n🔗 Agent → Skill Links\n"));
      for (const link of links) {
        console.log(
          `  ${chalk.bold(link.agent)} → ${chalk.gray(link.skills.join(", "))}`,
        );
      }
    }
  }

  console.log();
  return 0;
}

module.exports = { run };
