const fs = require("fs-extra");
const path = require("upath");
const chalk = require("chalk");

const PROJECT_ROOT = path.resolve(__dirname, "../../");
const RESOURCES_SKILLS = path.join(PROJECT_ROOT, "resources/blueprints/skills");
const GEMINI_SKILLS = path.join(PROJECT_ROOT, ".gemini/skills");

/**
 * Sync skills from resources/skills/ to .gemini/skills/
 * This follows the SSOT pattern: source in resources/, generated in .gemini/
 */
async function syncSkills() {
  console.log(chalk.cyan("\n🧩 Syncing Skills..."));
  console.log(chalk.gray(`   Source: ${RESOURCES_SKILLS}`));
  console.log(chalk.gray(`   Target: ${GEMINI_SKILLS}\n`));

  // Check if source directory exists
  if (!(await fs.pathExists(RESOURCES_SKILLS))) {
    console.log(
      chalk.yellow("⚠️ No skills directory found at resources/skills/"),
    );
    console.log(
      chalk.gray("   Create skills there to sync them to .gemini/skills/"),
    );
    return { synced: 0, skipped: 0 };
  }

  // Ensure target directory exists
  await fs.ensureDir(GEMINI_SKILLS);

  // Get all skill directories (exclude README.md and other files)
  const entries = await fs.readdir(RESOURCES_SKILLS, { withFileTypes: true });
  const skillDirs = entries.filter((e) => e.isDirectory());

  if (skillDirs.length === 0) {
    console.log(
      chalk.yellow("⚠️ No skill directories found in resources/skills/"),
    );
    return { synced: 0, skipped: 0 };
  }

  let synced = 0;
  let skipped = 0;

  for (const dir of skillDirs) {
    const skillName = dir.name;
    const sourcePath = path.join(RESOURCES_SKILLS, skillName);
    const targetPath = path.join(GEMINI_SKILLS, skillName);
    const skillMdPath = path.join(sourcePath, "SKILL.md");

    // Validate skill has SKILL.md
    if (!(await fs.pathExists(skillMdPath))) {
      console.log(
        chalk.yellow(`   ⏭️ Skipping ${skillName}: No SKILL.md found`),
      );
      skipped++;
      continue;
    }

    // Validate SKILL.md has required frontmatter
    const skillContent = await fs.readFile(skillMdPath, "utf8");
    if (
      !skillContent.includes("name:") ||
      !skillContent.includes("description:")
    ) {
      console.log(
        chalk.yellow(
          `   ⏭️ Skipping ${skillName}: Missing required frontmatter (name, description)`,
        ),
      );
      skipped++;
      continue;
    }

    // Copy skill directory to .gemini/skills/
    await fs.copy(sourcePath, targetPath, { overwrite: true });
    console.log(chalk.green(`   ✅ Synced: ${skillName}`));
    synced++;
  }

  console.log(chalk.cyan(`\n📊 Summary: ${synced} synced, ${skipped} skipped`));

  if (synced > 0) {
    console.log(chalk.gray("\n💡 Skills are now available in Gemini CLI."));
    console.log(chalk.gray("   Use /skills list in Gemini CLI to see them."));
  }

  return { synced, skipped };
}

/**
 * Sync skills to multiple agents (for skills.sh ecosystem)
 * This handles Cursor, Windsurf, and other agents that use skills.sh
 */
async function syncSkillsToAgents(skillName, agents) {
  const { scanActiveAgents } = require("./agent-manager");
  const activeAgents = agents || (await scanActiveAgents());

  const agentSkillPaths = {
    cursor: ".cursor/skills",
    windsurf: ".windsurf/skills",
    "gemini-cli": ".gemini/skills",
  };

  let synced = 0;

  for (const agent of activeAgents) {
    const skillPath = agentSkillPaths[agent.name];
    if (!skillPath) continue;

    const sourcePath = path.join(RESOURCES_SKILLS, skillName);
    const targetPath = path.join(PROJECT_ROOT, skillPath, skillName);

    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, targetPath, { overwrite: true });
      console.log(chalk.green(`   ✅ Synced ${skillName} to ${agent.name}`));
      synced++;
    }
  }

  return synced;
}

module.exports = {
  syncSkills,
  syncSkillsToAgents,
};
