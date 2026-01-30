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
  const cliRoot = path.resolve(__dirname, "../../");
  const isGlobal = cliRoot.toLowerCase().includes(".kami-flow");

  console.log(chalk.green("\n✨ KamiFlow installed successfully!\n"));
  
  if (!isGlobal) {
    console.log(chalk.yellow("🚀 Local Clone Detected"));
    console.log(chalk.gray("   To use this local version as your global 'kami' command, run:"));
    console.log(chalk.cyan("   npm link\n"));
  }

  console.log(chalk.white("You can now run:"));
  console.log(chalk.cyan("  kami doctor  ") + chalk.gray("- To check your environment"));
  console.log(chalk.cyan("  kami init    ") + chalk.gray("- To set up a new project\n"));
}

const { EnvironmentManager } = require("./env-manager");

/**
 * --- PART 2: PROJECT INITIALIZER (New Logic) ---
 */

async function initializeProject(cwd, options = {}) {
  const projectGeminiPath = path.join(cwd, '.gemini');
  const envManager = new EnvironmentManager(cwd);
  const workspaceRoot = await envManager.getAbsoluteWorkspacePath();
  const isDevMode = options.dev || false;
  
  // 1. Check if already initialized
  if (fs.existsSync(projectGeminiPath)) {
    console.log(chalk.yellow('ℹ️  .gemini folder already exists. Skipping initialization.'));
    return { success: true, message: 'Already initialized.' };
  }

  const modeText = isDevMode ? chalk.magenta('Contributor Mode') : chalk.green('Standard Mode');
  console.log(chalk.cyan(`🚀 Initializing KamiFlow (${modeText})...`));

  try {
    const cliRoot = path.resolve(__dirname, '../../'); 
    
    if (isDevMode) {
      // DEV MODE: Create Portals (Symlinks/Junctions)
      console.log(chalk.gray('🔗 Creating portals to source blueprints...'));
      
      // Source folders to link
      const links = [
        { src: '.gemini', dest: '.gemini' },
        { src: '.windsurf', dest: '.windsurf' }
      ];

      for (const link of links) {
        const target = path.join(cliRoot, link.src);
        const p = path.join(cwd, link.dest);
        
        // Use Junction on Windows for directories to avoid admin requirement
        const type = os.platform() === 'win32' ? 'junction' : 'dir';
        await fs.ensureSymlink(target, p, type);
        console.log(chalk.gray(`   ✅ Linked: ${link.dest} -> ${target}`));
      }
    } else {
      // STANDARD MODE: Copy from dist/
      const sourceDist = path.join(cliRoot, 'dist');
      const sourceGemini = path.join(sourceDist, '.gemini');

      if (!fs.existsSync(sourceGemini)) {
        throw new Error(`Critical: Build artifacts not found at ${sourceGemini}. Please run 'npm run build' in KamiFlow core.`);
      }

      console.log(chalk.gray(`📦 Copying distribution files from ${sourceDist}...`));
      
      // Copy .gemini
      fs.cpSync(sourceGemini, projectGeminiPath, { recursive: true });
      
      // Copy .windsurf (from core source as it might not be in dist if not transpiled)
      const sourceWindsurf = path.join(cliRoot, '.windsurf');
      if (fs.existsSync(sourceWindsurf)) {
        fs.cpSync(sourceWindsurf, path.join(cwd, '.windsurf'), { recursive: true });
      }

      // Copy GEMINI.md if exists in dist
      const sourceGeminiMd = path.join(sourceDist, 'GEMINI.md');
      if (fs.existsSync(sourceGeminiMd)) {
        fs.copyFileSync(sourceGeminiMd, path.join(cwd, 'GEMINI.md'));
      }
    }

    // 3.1 Perform Copy (docs folder - NEW SSOT)
    // In Dev mode, maybe link docs? User said Contributor Solution should distinguish.
    // For now, let's keep docs as physical copies or linked?
    // User priority is End-User. Let's keep docs copied for both for now, or link for dev.
    if (isDevMode) {
        const targetDocs = path.join(cwd, 'resources/docs');
        await fs.ensureSymlink(path.join(cliRoot, 'resources/docs'), targetDocs, os.platform() === 'win32' ? 'junction' : 'dir');
    } else {
        const sourceDocs = path.join(cliRoot, 'resources/docs');
        const targetDocs = path.join(cwd, 'resources/docs');
        if (fs.existsSync(sourceDocs)) {
          console.log(chalk.gray('📦 Syncing documentation and blueprints...'));
          fs.cpSync(sourceDocs, targetDocs, { recursive: true });
        }
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
      const templateContext = path.join(cliRoot, 'resources/templates/context.md');
      if (fs.existsSync(templateContext)) {
         fs.copyFileSync(templateContext, contextPath);
      } else {
         fs.writeFileSync(contextPath, '# Project Context\n\nRun /kamiflow:ops:wake to initialize.');
      }
    }

    // 6.1 Additional Seeds (Registry & Agent Rules)
    const seeds = [
      { src: 'resources/templates/registry.md', dest: 'registry.md' },
      { src: 'resources/templates/universal-agent-rules.md', dest: 'universal-agent-rules.md' },
      { src: 'resources/templates/roadmap.md', dest: 'ROADMAP.md' }
    ];

    for (const seed of seeds) {
      const sPath = path.join(cliRoot, seed.src);
      const dPath = path.join(workspaceRoot, seed.dest);
      if (fs.existsSync(sPath) && !fs.existsSync(dPath)) {
        fs.copyFileSync(sPath, dPath);
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