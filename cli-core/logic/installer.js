#!/usr/bin/env node

/**
 * KamiFlow Universal Installer & Project Initializer
 * Supported: Windows, MacOS, Linux
 */

const fs = require("fs-extra");
const path = require('upath');
const os = require("os");
const chalk = require("chalk");
const { execSync } = require("child_process");
const minimatch = require("minimatch");
const presets = require("../presets.json");

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
  // We need devDependencies (like cross-env) to run the build script
  execSync("npm install", { cwd: INSTALL_DIR, stdio: "inherit" });
  
  console.log(chalk.yellow("🏗️  Building distribution artifacts..."));
  execSync("npm run build", { cwd: INSTALL_DIR, stdio: "inherit" });

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
const { LayeredResolver } = require("./layered-resolver");
const inquirer = require("inquirer").default || require("inquirer");

/**
 * Helper to check if a path matches preset patterns
 */
function isPathInPreset(relPath, presetKey) {
  const preset = presets[presetKey];
  if (!preset || !preset.patterns) return true;
  
  // Normalize path for matching
  const normalizedPath = relPath.replace(/\\/g, "/");
  
  return preset.patterns.some(pattern => {
    if (pattern === "**") return true;
    return minimatch(normalizedPath, pattern);
  });
}

/**
 * --- PART 2: PROJECT INITIALIZER (New Logic) ---
 */

async function initializeProject(cwd, options = {}) {
  const projectGeminiPath = path.join(cwd, ".gemini");
  const envManager = new EnvironmentManager(cwd);
  const workspaceRoot = await envManager.getAbsoluteWorkspacePath();
  const isDevMode = options.dev || false;

  // 1. Check if already initialized
  if (fs.existsSync(projectGeminiPath)) {
    console.log(
      chalk.yellow(
        "ℹ️  .gemini folder already exists. Skipping initialization.",
      ),
    );
    return { success: true, message: "Already initialized." };
  }

  // 2. Select Preset
  let selectedPreset = options.preset || "basic";
  if (!options.skipInterview && !options.preset) {
    const { preset } = await inquirer.prompt([
      {
        type: "list",
        name: "preset",
        message: "Choose KamiFlow Preset:",
        choices: [
          { name: chalk.cyan("Basic") + " (Core Sniper Flow only)", value: "basic" },
          { name: chalk.green("Full") + " (Complete Suite: Plugins, Swarm, Sync)", value: "full" }
        ],
        default: "basic"
      }
    ]);
    selectedPreset = preset;
  }

  const modeText = isDevMode
    ? chalk.magenta("Contributor Mode")
    : chalk.green(`Standard Mode (${selectedPreset.toUpperCase()})`);
  console.log(chalk.cyan(`🚀 Initializing KamiFlow (${modeText})...`));

  try {
    const cliRoot = path.resolve(__dirname, "../../");

    if (isDevMode) {
      // DEV MODE: Create Portals (Symlinks/Junctions)
      console.log(chalk.gray("🔗 Creating portals to source blueprints..."));

      const links = [
        { src: ".gemini", dest: ".gemini" },
        { src: ".windsurf", dest: ".windsurf" },
      ];

      for (const link of links) {
        const target = path.join(cliRoot, link.src);
        const p = path.join(cwd, link.dest);
        const type = os.platform() === "win32" ? "junction" : "dir";
        await fs.ensureSymlink(target, p, type);
        console.log(chalk.gray(`   ✅ Linked: ${link.dest} -> ${target}`));
      }

      const targetDocs = path.join(cwd, "resources/docs");
      await fs.ensureSymlink(
        path.join(cliRoot, "resources/docs"),
        targetDocs,
        os.platform() === "win32" ? "junction" : "dir",
      );
    } else {
      // STANDARD MODE: Copy everything from dist/ with existence checks
      const sourceDist = path.join(cliRoot, "dist");

      if (!fs.existsSync(sourceDist)) {
        throw new Error(
          `Critical: Build artifacts not found at ${sourceDist}. Please run 'npm run build' in KamiFlow core.`,
        );
      }

      console.log(chalk.gray(`📦 Seeding project from distribution...`));

      const protectedFiles = [
        "GEMINI.md",
        ".kamiflow/PROJECT_CONTEXT.md",
        ".kamiflow/ROADMAP.md",
      ];

      // Copy dist content with filtering
      fs.cpSync(sourceDist, cwd, {
        recursive: true,
        filter: (src) => {
          const relative = path.relative(sourceDist, src).replace(/\\/g, "/");
          const basename = path.basename(src);

          // Basic excludes
          if (basename === ".git" || basename === "node_modules") return false;
          
          // Filter by Preset
          if (relative !== "." && !isPathInPreset(relative, selectedPreset)) {
            return false;
          }

          // Protected core files: Skip if already exists in destination
          if (protectedFiles.includes(relative)) {
            const destPath = path.join(cwd, relative);
            if (fs.existsSync(destPath)) {
              console.log(chalk.gray(`   ℹ️  Skipped existing: ${relative}`));
              return false;
            }
          }

          // Skip example config
          if (relative === ".kamirc.example.json") return false;

          // Seed .kamirc.json if missing
          if (relative === ".kamirc.json") {
            const destPath = path.join(cwd, relative);
            if (fs.existsSync(destPath)) return false;
            
            // Inject preset choice into config
            try {
                const config = fs.readJsonSync(src);
                config.preset = selectedPreset;
                fs.writeJsonSync(destPath, config, { spaces: 2 });
                console.log(chalk.cyan(`   🌱 Seeded .kamirc.json (${selectedPreset})`));
                return false; // Already handled manually
            } catch (e) {
                return true;
            }
          }

          return true;
        },
      });
    }

    // 4. Create necessary empty dirs (Only private data placeholders)
    const workspaceDirs = presets[selectedPreset].folders || ["tasks", "archive"];

    for (const dir of workspaceDirs) {
      const d = path.join(workspaceRoot, dir);
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    }

    // 5. Initialize local override structure (.kamiflow/agents/.gemini/)
    console.log(chalk.gray("📁 Setting up local override structure..."));
    const resolver = new LayeredResolver(cwd, cliRoot);
    await resolver.initLocalStructure();

    // 6. Initialize workspace index for search
    console.log(chalk.gray("🔍 Initializing workspace index..."));
    const { WorkspaceIndex } = require("./workspace-index");
    const index = new WorkspaceIndex(cwd);
    try {
      await index.initialize();
      console.log(
        chalk.gray(
          "   ✅ Index ready (run 'kami search --rebuild' to index existing files)",
        ),
      );
    } catch (error) {
      console.log(
        chalk.yellow(`   ⚠️  Index initialization skipped: ${error.message}`),
      );
    } finally {
      index.close();
    }

    // 7. Update ignore files
    updateIgnoreFile(cwd, ".gitignore", [
      ".gemini/tmp",
      ".kamiflow/agents/",
      ".kamiflow/.index/",
      ".kamiflow/.sync/",
    ]);
    
    updateIgnoreFile(cwd, ".geminiignore", [
      ".kamiflow/",
      "node_modules/",
      "dist/",
    ]);

    return { success: true, message: "KamiFlow initialized successfully!" };
  } catch (error) {
    console.error(chalk.red("❌ Init failed:"), error);
    return { success: false, error: error.message };
  }
}

function updateIgnoreFile(cwd, fileName, rules) {
  const ignorePath = path.join(cwd, fileName);
  let content = "";
  
  if (fs.existsSync(ignorePath)) {
    content = fs.readFileSync(ignorePath, "utf8");
  }

  let updated = false;
  const lines = content.split("\n").map(l => l.trim());
  
  const header = `\n# --- KamiFlow: ${fileName} ---`;
  if (!content.includes(header.trim())) {
    content = content.endsWith("\n") ? content + header : content + "\n" + header;
    updated = true;
  }

  for (const rule of rules) {
    if (!lines.includes(rule)) {
      content = content.endsWith("\n") ? `${content}${rule}\n` : `${content}\n${rule}\n`;
      updated = true;
    }
  }

  if (updated) {
    console.log(chalk.gray(`🛡️  Updating ${fileName}...`));
    fs.writeFileSync(ignorePath, content);
  }
}

function getGeneStorePath() {

  return INSTALL_DIR;

}



if (require.main === module) {

  runInstaller();

}



module.exports = { initializeProject, getGeneStorePath };
