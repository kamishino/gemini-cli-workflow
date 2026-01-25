const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const { z } = require("zod");
const { execSync } = require("child_process");

// Schema for project configuration
const ProjectConfigSchema = z.object({
  name: z.string().min(1),
  method: z.enum(["LINK", "SUBMODULE", "STANDALONE"]),
  corePath: z.string(),
  rootPath: z.string(),
  features: z.array(z.string()).default(["core", "windsurf", "docs"]),
});

/**
 * Get the global core path (where this package is installed)
 */
function getGlobalCorePath() {
  return path.resolve(__dirname, "..", "..");
}

/**
 * Create a portal (symlink or copy)
 */
async function createPortal(mapping, method) {
  const { source, target, isDirectory } = mapping;

  try {
    // Check if target already exists
    if (await fs.pathExists(target)) {
      console.log(chalk.yellow(`[KAMI] ⚠️  ${path.basename(target)} already exists, skipping`));
      return;
    }

    // Ensure parent directory exists
    await fs.ensureDir(path.dirname(target));

    if (method === "LINK") {
      // Create symlink
      const type = isDirectory ? "junction" : "file";
      await fs.symlink(source, target, type);
      console.log(chalk.green(`[KAMI] ✓ Linked ${path.basename(target)}`));
    } else {
      // Physical copy
      if (isDirectory) {
        await fs.copy(source, target);
      } else {
        await fs.copyFile(source, target);
      }
      console.log(chalk.green(`[KAMI] ✓ Copied ${path.basename(target)}`));
    }
  } catch (error) {
    if (method === "LINK" && error.code === "EPERM") {
      console.log(chalk.yellow(`[KAMI] ⚠️  Symlink permission denied for ${path.basename(target)}`));
      throw new Error("SYMLINK_PERMISSION_DENIED");
    }
    throw error;
  }
}

/**
 * Seed project-specific files
 */
async function seedProjectFiles(projectPath, corePath, projectName, method) {
  // Seed GEMINI.md
  const geminiPath = path.join(projectPath, "GEMINI.md");
  if (!(await fs.pathExists(geminiPath))) {
    if (method === "LINK") {
      const proxyContent = `<!-- Imported from: .gemini/GEMINI.md -->
<!-- This file is a PROXY. Add project-specific rules below. -->

# Project-Specific Customizations (Optional)

<!-- Add your custom AI instructions here -->
`;
      await fs.writeFile(geminiPath, proxyContent, "utf8");
    } else {
      // Copy full GEMINI.md for standalone
      const sourceGemini = path.join(corePath, "GEMINI.md");
      if (await fs.pathExists(sourceGemini)) {
        await fs.copyFile(sourceGemini, geminiPath);
      }
    }
    console.log(chalk.green("[KAMI] ✓ Created GEMINI.md"));
  }

  // Seed PROJECT_CONTEXT.md from template
  const contextPath = path.join(projectPath, "PROJECT_CONTEXT.md");
  if (!(await fs.pathExists(contextPath))) {
    const templatePath = path.join(corePath, "docs", "templates", "context.md");
    if (await fs.pathExists(templatePath)) {
      let content = await fs.readFile(templatePath, "utf8");
      // Replace placeholder with project name
      content = content.replace(/\[Project Name\]/g, projectName);
      await fs.writeFile(contextPath, content, "utf8");
      console.log(chalk.green("[KAMI] ✓ Created PROJECT_CONTEXT.md"));
    }
  }

  // Seed docs/roadmap.md from template
  const roadmapPath = path.join(projectPath, "docs", "roadmap.md");
  if (!(await fs.pathExists(roadmapPath))) {
    const templatePath = path.join(corePath, "docs", "templates", "roadmap.md");
    if (await fs.pathExists(templatePath)) {
      await fs.ensureDir(path.dirname(roadmapPath));
      await fs.copyFile(templatePath, roadmapPath);
      console.log(chalk.green("[KAMI] ✓ Created docs/roadmap.md"));
    }
  }

  // Configure .geminiignore
  const ignorePath = path.join(projectPath, ".geminiignore");
  const ignoreEntry = "\n# Ignore KamiFlow core (accessed via portals)\n.gemini/\n.windsurf/\n";

  if (await fs.pathExists(ignorePath)) {
    const content = await fs.readFile(ignorePath, "utf8");
    if (!content.includes(".gemini/")) {
      await fs.appendFile(ignorePath, ignoreEntry, "utf8");
      console.log(chalk.green("[KAMI] ✓ Updated .geminiignore"));
    }
  } else {
    await fs.writeFile(ignorePath, ignoreEntry.trim() + "\n", "utf8");
    console.log(chalk.green("[KAMI] ✓ Created .geminiignore"));
  }
}

/**
 * Main initialization function
 */
async function initProject(projectPath, options) {
  const corePath = getGlobalCorePath();

  // Ensure project directory exists
  await fs.ensureDir(projectPath);

  console.log(chalk.cyan("[KAMI] Core location:"), chalk.gray(corePath));
  console.log(chalk.cyan("[KAMI] Target path:"), chalk.gray(projectPath));
  console.log();

  let config;

  if (options.skipInterview) {
    // Use defaults
    config = {
      name: path.basename(projectPath),
      method: options.mode.toUpperCase(),
      corePath,
      rootPath: projectPath,
      features: ["core", "windsurf", "docs"],
    };
  } else {
    // Interactive interview
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Project name:",
        default: path.basename(projectPath),
      },
      {
        type: "list",
        name: "method",
        message: "Select integration mode:",
        choices: [
          { name: "🔗 Linked (Recommended - Auto-updates from global core)", value: "LINK" },
          { name: "📦 Standalone (Clean copy - Manual updates)", value: "STANDALONE" },
        ],
        default: "LINK",
      },
    ]);

    config = {
      name: answers.name,
      method: answers.method,
      corePath,
      rootPath: projectPath,
      features: ["core", "windsurf", "docs"],
    };
  }

  // Validate config
  const validConfig = ProjectConfigSchema.parse(config);

  console.log();
  console.log(chalk.cyan("[KAMI] Setting up portal network..."));
  console.log();

  // Define portal mappings
  const portals = [
    {
      source: path.join(corePath, ".gemini"),
      target: path.join(projectPath, ".gemini"),
      isDirectory: true,
    },
    {
      source: path.join(corePath, ".windsurf"),
      target: path.join(projectPath, ".windsurf"),
      isDirectory: true,
    },
    {
      source: path.join(corePath, "docs", "protocols"),
      target: path.join(projectPath, "docs", "protocols"),
      isDirectory: true,
    },
    {
      source: path.join(corePath, "docs", "overview.md"),
      target: path.join(projectPath, "docs", "overview.md"),
      isDirectory: false,
    },
  ];

  // Create portals
  let method = validConfig.method;
  for (const portal of portals) {
    try {
      await createPortal(portal, method);
    } catch (error) {
      if (error.message === "SYMLINK_PERMISSION_DENIED" && method === "LINK") {
        console.log();
        console.log(chalk.yellow("[KAMI] ⚠️  Symlink creation requires admin rights or Developer Mode"));
        console.log();

        const fallback = await inquirer.prompt([
          {
            type: "confirm",
            name: "useCopy",
            message: "Fallback to physical copy mode?",
            default: true,
          },
        ]);

        if (fallback.useCopy) {
          method = "STANDALONE";
          console.log();
          console.log(chalk.cyan("[KAMI] Switching to STANDALONE mode..."));
          console.log();

          // Retry this portal with STANDALONE
          await createPortal(portal, method);
        } else {
          throw new Error("Setup cancelled. Please enable Developer Mode or run as Administrator.");
        }
      } else {
        throw error;
      }
    }
  }

  console.log();
  console.log(chalk.cyan("[KAMI] Seeding project files..."));
  console.log();

  // Seed project files
  await seedProjectFiles(projectPath, corePath, validConfig.name, method);

  // Initialize Git if needed
  const gitPath = path.join(projectPath, ".git");
  if (!(await fs.pathExists(gitPath))) {
    console.log();
    const initGit = await inquirer.prompt([
      {
        type: "confirm",
        name: "init",
        message: "Initialize Git repository?",
        default: true,
      },
    ]);

    if (initGit.init) {
      try {
        execSync("git init", { cwd: projectPath, stdio: "ignore" });
        console.log(chalk.green("[KAMI] ✓ Git repository initialized"));
      } catch (error) {
        console.log(chalk.yellow("[KAMI] ⚠️  Git init failed (not critical)"));
      }
    }
  }

  return validConfig;
}

module.exports = { initProject, getGlobalCorePath };
