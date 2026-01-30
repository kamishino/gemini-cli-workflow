#!/usr/bin/env node

/**
 * KamiFlow Universal Installer & Project Initializer
 * Supported: Windows, MacOS, Linux
 */

const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const chalk = require("chalk");
const { execSync } = require("child_process");

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

const { EnvironmentManager } = require("./env-manager");

/**
 * --- PART 2: PROJECT INITIALIZER (New Logic) ---
 */

async function initializeProject(cwd) {
  const projectGeminiPath = path.join(cwd, '.gemini');
  const envManager = new EnvironmentManager(cwd);
  const workspaceRoot = await envManager.getAbsoluteWorkspacePath();
  
  // 1. Check if already initialized
  if (fs.existsSync(projectGeminiPath)) {
    console.log(chalk.yellow('ℹ️  .gemini folder already exists. Skipping initialization.'));
    return { success: true, message: 'Already initialized.' };
  }

  console.log(chalk.cyan('🚀 Initializing KamiFlow (Template Copy Mode)...'));

  try {
    // 2. Resolve Source Template
    // Strategy: Use the CLI's own .gemini folder as the master template
    const cliRoot = path.resolve(__dirname, '../../'); // cli-core/../
    const sourceGemini = path.join(cliRoot, '.gemini');

    if (!fs.existsSync(sourceGemini)) {
      throw new Error(`Critical: Source template not found at ${sourceGemini}`);
    }

    // 3. Perform Copy (.gemini folder)
    console.log(chalk.gray(`📦 Copying template from ${sourceGemini}...`));
    
    fs.cpSync(sourceGemini, projectGeminiPath, {
      recursive: true,
      filter: (src, dest) => {
        const basename = path.basename(src);
        // Exclude internal dev artifacts and git metadata
        if (basename === 'tmp' || basename === 'cache' || basename === 'handoff_logs') return false;
        if (basename === '.git') return false; 
        return true;
      }
    });

    // 3.1 Perform Copy (docs folder - NEW SSOT)
    const sourceDocs = path.join(cliRoot, 'docs');
    const targetDocs = path.join(cwd, 'docs');
    if (fs.existsSync(sourceDocs)) {
      console.log(chalk.gray('📦 Syncing documentation and blueprints...'));
      fs.cpSync(sourceDocs, targetDocs, { recursive: true });
    }

    // 4. Create necessary empty dirs
    const systemDirs = ['.gemini/tmp', '.gemini/cache', '.backup'];
    const workspaceDirs = ['tasks', 'archive', 'ideas/draft', 'ideas/discovery', 'ideas/backlog', 'handoff_logs'];

    for (const dir of systemDirs) {
      const d = path.join(cwd, dir);
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    }

    for (const dir of workspaceDirs) {
      const d = path.join(workspaceRoot, dir);
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    }

    // 5. Update .gitignore
    updateGitIgnore(cwd);

    // 6. Project Context Bootstrap
    const contextPath = path.join(workspaceRoot, 'PROJECT_CONTEXT.md');
    if (!fs.existsSync(contextPath)) {
      console.log(chalk.green('📄 Creating PROJECT_CONTEXT.md...'));
      const templateContext = path.join(cliRoot, 'docs/templates/context.md');
      if (fs.existsSync(templateContext)) {
         fs.copyFileSync(templateContext, contextPath);
      } else {
         fs.writeFileSync(contextPath, '# Project Context\n\nRun /kamiflow:ops:wake to initialize.');
      }
    }

    return { success: true, message: 'KamiFlow initialized successfully!' };

  } catch (error) {
    console.error(chalk.red('❌ Init failed:'), error);
    return { success: false, error: error.message };
  }
}

function updateGitIgnore(cwd) {
  const gitIgnorePath = path.join(cwd, '.gitignore');
  const rule = '.gemini/tmp';
  
  let content = '';
  if (fs.existsSync(gitIgnorePath)) {
    content = fs.readFileSync(gitIgnorePath, 'utf8');
  }

  if (!content.includes(rule)) {
    console.log(chalk.gray('🛡️  Updating .gitignore...'));
    const newContent = content.endsWith('\n') ? `${content}${rule}\n` : `${content}\n${rule}\n`;
    fs.writeFileSync(gitIgnorePath, newContent);
  }
}

if (require.main === module) {
  runInstaller();
}

module.exports = { initializeProject };