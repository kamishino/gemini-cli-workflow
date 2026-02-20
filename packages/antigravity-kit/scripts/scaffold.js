/**
 * agk scaffold — Generate boilerplate for agents, workflows, and rules
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

// Helper: Convert "Database Expert" -> "database-expert"
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

function getAgentTemplate(name, desc) {
  return `---
name: ${name}
description: ${desc}
triggers: []
owns: []
---

# Identity
You are the ${name}. ${desc}

# Rules
1. 
2. 

# Behavior
- 
`;
}

function getWorkflowTemplate(name, desc) {
  return `---
description: ${desc}
---

# ${name}

## 1. Goal
Explain the specific goal of this workflow here.

## 2. Steps
- Step 1
- Step 2
`;
}

function getRuleTemplate(name, desc) {
  return `# ${name}

> ${desc}

## Description
Explain the rule here...

## Examples

### ✅ Good
\`\`\`
code here
\`\`\`

### ❌ Bad
\`\`\`
code here
\`\`\`
`;
}

async function run(projectDir, args = []) {
  if (args.length < 2) {
    console.error(
      chalk.red(
        "❌ Error: Missing arguments. Use `agk scaffold <type> <name> [description]`",
      ),
    );
    console.log(chalk.yellow("  Types supported: agent | workflow | rule"));
    return 1;
  }

  const type = args[0].toLowerCase();
  const rawName = args[1];
  const desc = args[2] || "Missing description";
  const slug = slugify(rawName);
  const filename = `${slug}.md`;

  let destDir = "";
  let templateContent = "";

  switch (type) {
    case "agent":
      destDir = path.join(projectDir, ".agent", "agents");
      templateContent = getAgentTemplate(rawName, desc);
      break;
    case "workflow":
      destDir = path.join(projectDir, ".agent", "workflows");
      templateContent = getWorkflowTemplate(rawName, desc);
      break;
    case "rule":
      destDir = path.join(projectDir, ".gemini", "rules");
      templateContent = getRuleTemplate(rawName, desc);
      break;
    default:
      console.error(chalk.red(`❌ Error: Unknown scaffold type "${type}".`));
      console.log(chalk.yellow("  Types supported: agent | workflow | rule"));
      return 1;
  }

  console.log(`✨ Scaffolding new ${type}...\n`);

  try {
    const filePath = path.join(destDir, filename);

    // Make sure the target directory exists
    await fs.ensureDir(destDir);

    if (await fs.pathExists(filePath)) {
      console.error(
        chalk.red(`❌ Error: A ${type} named "${filename}" already exists at:`),
      );
      console.log(chalk.gray(`   ${filePath}`));
      return 1;
    }

    await fs.writeFile(filePath, templateContent, "utf8");

    console.log(
      chalk.green(`✅ Created ${type}: ${path.relative(projectDir, filePath)}`),
    );
    console.log(
      chalk.gray(`   Tip: Open the file and customize the contents!`),
    );

    return 0;
  } catch (error) {
    console.error(
      chalk.red(`\n❌ Failed to scaffold ${type}: ${error.message}\n`),
    );
    return 1;
  }
}

module.exports = { run };
