#!/usr/bin/env node

/**
 * KamiFlow Universal Installer & Project Initializer
 * Supported: Windows, MacOS, Linux
 */

const inquirer = require("inquirer").default || require("inquirer");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const { z } = require("zod");
const { isGitRepo, initGitRepo, addSubmodule } = require("./git-manager");

// Schema for project configuration
const ProjectConfigSchema = z.object({
  name: z.string().min(1),
  method: z.enum(["LINK", "SUBMODULE", "STANDALONE"]),
  corePath: z.string(),
  rootPath: z.string(),
  features: z.array(z.string()).default(["core", "windsurf", "docs"]),
});

const KAMIFLOW_REPO = "https://github.com/kamishino/gemini-cli-workflow.git";
const INSTALL_DIR = path.join(os.homedir(), ".kami-flow");

/**
 * --- PART 1: UNIVERSAL INSTALLER (Direct Execution) ---
 */

async function runInstaller() {
  console.log(chalk.cyan("\n========================================================"));
  console.log(chalk.cyan("  🌊 KamiFlow Universal Installer"));
  console.log(chalk.cyan("========================================================\n"));

  try {
    // 1. Environment Check
    checkPrerequisites();

    // 2. Install Directory Prep
    prepareInstallDir();

    // 3. Clone Repository
    cloneRepo();

    // 4. Install & Link
    installAndLink();

    // 5. Success
    showSuccess();
  } catch (error) {
    console.error(chalk.red("\n❌ Installation failed:"), error.message);
    process.exit(1);
  }
}

function checkPrerequisites() {
  process.stdout.write("🔍 Checking environment... ");
  try {
    // Check Node
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.replace("v", "").split(".")[0]);
    if (major < 16) {
      throw new Error(`Node.js version must be >= 16. Current: ${nodeVersion}`);
    }

    // Check Git
    try {
      execSync("git --version", { stdio: "ignore" });
    } catch (e) {
      throw new Error("Git is not installed. Please install Git from https://git-scm.com/");
    }

    console.log(chalk.green("Ready!"));
  } catch (err) {
    console.log(chalk.red("Failed"));
    throw err;
  }
}

function prepareInstallDir() {
  if (fs.existsSync(INSTALL_DIR)) {
    console.log(chalk.yellow(`⚠️  Installation directory already exists: ${INSTALL_DIR}`));
    console.log(chalk.gray("   Updating existing installation..."));
  } else {
    console.log(chalk.gray(`📂 Target directory: ${INSTALL_DIR}`));
  }
}

function cloneRepo() {
  if (fs.existsSync(INSTALL_DIR)) {
    console.log("📡 Updating source code...");
    try {
      execSync("git pull", { cwd: INSTALL_DIR, stdio: "inherit" });
    } catch (e) {
      console.log(chalk.yellow("   Pull failed, attempting fresh clone..."));
      fs.removeSync(INSTALL_DIR);
      execSync(`git clone ${KAMIFLOW_REPO} "${INSTALL_DIR}"`, { stdio: "inherit" });
    }
  } else {
    console.log("📡 Cloning repository...");
    execSync(`git clone ${KAMIFLOW_REPO} "${INSTALL_DIR}"`, { stdio: "inherit" });
  }
}

function installAndLink() {
  console.log("📦 Installing dependencies and linking CLI...");
  execSync("npm install --production", { cwd: INSTALL_DIR, stdio: "inherit" });
  console.log(chalk.gray("🔗 Linking globally..."));
  execSync("npm install -g .", { cwd: INSTALL_DIR, stdio: "inherit" });
}

function showSuccess() {
  console.log(chalk.green("\n✨ KamiFlow installed successfully!\n"));
  console.log(chalk.white("You can now run:"));
  console.log(chalk.cyan("  kami doctor  ") + chalk.gray("- To check your environment"));
  console.log(chalk.cyan("  kami init    ") + chalk.gray("- To set up a new project\n"));
}

/**
 * --- PART 2: PROJECT INITIALIZER (Module Exports) ---
 */

function getGeneStorePath() {
  return path.join(os.homedir(), ".kami-flow");
}

function getGlobalCorePath() {
  return path.resolve(__dirname, "..", "..");
}

async function ensureGeneStore() {
  const geneStorePath = getGeneStorePath();
  if (await fs.pathExists(geneStorePath)) {
    return geneStorePath;
  }
  // If gene store doesn't exist, we might be in a dev environment or first run
  // For simplicity, we assume the user should run the installer first
  throw new Error("KamiFlow Core not found. Please run the installer first.");
}

async function createPortal(mapping, method) {
  const { source, target, isDirectory } = mapping;
  try {
    if (await fs.pathExists(target)) {
      console.log(chalk.yellow(`[KAMI] ⚠️  ${path.basename(target)} already exists, skipping`));
      return;
    }
    await fs.ensureDir(path.dirname(target));
    if (method === "LINK") {
      const type = isDirectory ? "junction" : "file";
      await fs.symlink(source, target, type);
      console.log(chalk.green(`[KAMI] ✓ Linked ${path.basename(target)}`));
    } else {
      if (isDirectory) {
        await fs.copy(source, target);
      } else {
        await fs.copyFile(source, target);
      }
      console.log(chalk.green(`[KAMI] ✓ Copied ${path.basename(target)}`));
    }
  } catch (error) {
    if (method === "LINK" && error.code === "EPERM") {
      console.log(chalk.red("\n❌ Symlink permission denied."));
      console.log(chalk.yellow("👉 Please run your terminal as Administrator to enable LINK mode."));
      console.log(chalk.gray("   Or choose 'Standalone' mode for a physical copy.\n"));
      throw new Error("SYMLINK_PERMISSION_DENIED");
    }
    throw error;
  }
}

async function seedProjectFiles(projectPath, corePath, projectName, method) {
  const geminiPath = path.join(projectPath, "GEMINI.md");
  if (!(await fs.pathExists(geminiPath))) {
    const templatePath = path.join(corePath, "docs", "templates", "gemini.md");
    if (await fs.pathExists(templatePath)) {
      await fs.copyFile(templatePath, geminiPath);
      console.log(chalk.green("[KAMI] ✓ Created GEMINI.md from template"));
    }
  }

  const contextPath = path.join(projectPath, "PROJECT_CONTEXT.md");
  if (!(await fs.pathExists(contextPath))) {
    const templatePath = path.join(corePath, "docs", "templates", "context.md");
    if (await fs.pathExists(templatePath)) {
      let content = await fs.readFile(templatePath, "utf8");
      content = content.replace(/\[Project Name\]/g, projectName);
      await fs.writeFile(contextPath, content, "utf8");
      console.log(chalk.green("[KAMI] ✓ Created PROJECT_CONTEXT.md"));
    }
  }

  const roadmapPath = path.join(projectPath, "docs", "roadmap.md");
  if (!(await fs.pathExists(roadmapPath))) {
    const templatePath = path.join(corePath, "docs", "templates", "roadmap.md");
    if (await fs.pathExists(templatePath)) {
      await fs.ensureDir(path.dirname(roadmapPath));
      await fs.copyFile(templatePath, roadmapPath);
      console.log(chalk.green("[KAMI] ✓ Created docs/roadmap.md"));
    }
  }

  const universalRulesPath = path.join(projectPath, "docs", "universal-agent-rules.md");
  if (!(await fs.pathExists(universalRulesPath))) {
    const templatePath = path.join(corePath, "docs", "templates", "universal-agent-rules.md");
    if (await fs.pathExists(templatePath)) {
      await fs.ensureDir(path.dirname(universalRulesPath));
      await fs.copyFile(templatePath, universalRulesPath);
      console.log(chalk.green("[KAMI] ✓ Created docs/universal-agent-rules.md"));
    }
  }

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

async function initProject(projectPath, options) {
  await fs.ensureDir(projectPath);
  console.log(chalk.cyan("[KAMI] Target path:"), chalk.gray(projectPath));

  let corePath;
  if (options.mode && options.mode.toUpperCase() === "SUBMODULE") {
    corePath = await ensureGeneStore();
  } else {
    corePath = getGlobalCorePath();
    console.log(chalk.cyan("[KAMI] Core location:"), chalk.gray(corePath));
  }

  let config;
  if (options.skipInterview) {
    config = {
      name: path.basename(projectPath),
      method: (options.mode || "LINK").toUpperCase(),
      corePath,
      rootPath: projectPath,
      features: ["core", "windsurf", "docs"],
    };
  } else {
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

  const validConfig = ProjectConfigSchema.parse(config);
  let method = validConfig.method;

  // 1. Core Folders
  await fs.ensureDir(path.join(projectPath, "tasks"));
  await fs.ensureDir(path.join(projectPath, "ideas/draft"));
  await fs.ensureDir(path.join(projectPath, "ideas/backlog"));
  await fs.ensureDir(path.join(projectPath, "ideas/discovery"));
  await fs.ensureDir(path.join(projectPath, "docs/handoff_logs"));

  const portals = [
    { source: path.join(corePath, ".gemini"), target: path.join(projectPath, ".gemini"), isDirectory: true },
    { source: path.join(corePath, ".windsurf"), target: path.join(projectPath, ".windsurf"), isDirectory: true },
  ];

  for (const portal of portals) {
    try {
      await createPortal(portal, method);
    } catch (error) {
      if (error.message === "SYMLINK_PERMISSION_DENIED" && method === "LINK") {
        const fallback = await inquirer.prompt([{ 
          type: "confirm",
          name: "useCopy",
          message: "Fallback to physical copy mode?",
          default: true,
        }]);
        if (fallback.useCopy) {
          method = "STANDALONE";
          await createPortal(portal, method);
        } else {
          throw new Error("Setup cancelled.");
        }
      } else {
        throw error;
      }
    }
  }

  await seedProjectFiles(projectPath, corePath, validConfig.name, method);
  return validConfig;
}

if (require.main === module) {
  runInstaller();
}

module.exports = { initProject, getGlobalCorePath, getGeneStorePath, ensureGeneStore };