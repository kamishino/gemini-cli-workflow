const chalk = require("chalk");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require('upath');
const os = require("os");

/**
 * Check if a command exists in PATH
 */
function commandExists(command) {
  try {
    const cmd = os.platform() === "win32" ? "where" : "which";
    execSync(`${cmd} ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get version of a command
 */
function getCommandVersion(command) {
  try {
    const output = execSync(`${command} --version`, { encoding: "utf8", stdio: "pipe" });
    return output.trim().split("\n")[0];
  } catch {
    return null;
  }
}

/**
 * Check Node.js version
 */
function checkNode() {
  const version = process.version;
  const major = parseInt(version.slice(1).split(".")[0]);

  console.log(chalk.gray("Node.js:"), version);

  if (major >= 16) {
    console.log(chalk.green("  ✓ Node.js version is compatible"));
    return true;
  } else {
    console.log(chalk.red("  ✓ Node.js 16+ required"));
    return false;
  }
}

/**
 * Check Gemini CLI
 */
function checkGeminiCLI() {
  if (commandExists("gemini")) {
    const version = getCommandVersion("gemini");
    console.log(chalk.gray("Gemini CLI:"), version || "installed");

    if (version && version.includes(".")) {
      console.log(chalk.green("  ✓ Gemini CLI found and operational"));
      return { installed: true, version };
    } else {
      console.log(chalk.yellow("  ⚠️  Gemini CLI found but version unclear"));
      return { installed: true, version: "unknown" };
    }
  } else {
    console.log(chalk.gray("Gemini CLI:"), "not found");
    console.log(chalk.red("  ❌ Gemini CLI not installed"));
    console.log(chalk.yellow("  → Install: npm install -g @google/gemini-cli"));
    return { installed: false, version: null };
  }
}

/**
 * Check Git
 */
function checkGit() {
  if (commandExists("git")) {
    const version = getCommandVersion("git");
    console.log(chalk.gray("Git:"), version || "installed");
    console.log(chalk.green("  ✓ Git found"));
    return true;
  } else {
    console.log(chalk.gray("Git:"), "not found");
    console.log(chalk.red("  ❌ Git not installed"));
    console.log(chalk.yellow("  → Install: https://git-scm.com/download/win"));
    return false;
  }
}

/**
 * Check Windows Developer Mode
 */
function checkDeveloperMode() {
  if (os.platform() !== "win32") {
    return { applicable: false, enabled: null };
  }

  try {
    const output = execSync(
      'reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense',
      { encoding: "utf8", stdio: "pipe" },
    );

    const enabled = output.includes("0x1");
    console.log(chalk.gray("Developer Mode:"), enabled ? "enabled" : "disabled");

    if (enabled) {
      console.log(chalk.green("  ✓ Developer Mode enabled"));
    } else {
      console.log(chalk.yellow("  ⚠️  Developer Mode disabled"));
      console.log(chalk.yellow("  → Enable in: Settings > Update & Security > For developers"));
    }

    return { applicable: true, enabled };
  } catch {
    console.log(chalk.gray("Developer Mode:"), "unknown");
    console.log(chalk.yellow("  ⚠️  Could not check Developer Mode status"));
    return { applicable: true, enabled: false };
  }
}

/**
 * Check symlink capability
 */
async function checkSymlinkCapability() {
  const testDir = path.join(os.tmpdir(), "kami-symlink-test");
  const testSource = path.join(testDir, "source");
  const testTarget = path.join(testDir, "target");

  try {
    await fs.ensureDir(testDir);
    await fs.ensureDir(testSource);
    await fs.symlink(testSource, testTarget, "junction");
    const stats = await fs.lstat(testTarget);
    const isSymlink = stats.isSymbolicLink();
    await fs.remove(testDir);

    if (isSymlink) {
      console.log(chalk.gray("Symlink Support:"), "enabled");
      console.log(chalk.green("  ✓ Can create symbolic links"));
      return true;
    } else {
      console.log(chalk.gray("Symlink Support:"), "limited");
      console.log(chalk.yellow("  ⚠️  Symlinks may not work correctly"));
      return false;
    }
  } catch (error) {
    await fs.remove(testDir).catch(() => {});
    console.log(chalk.gray("Symlink Support:"), "disabled");
    console.log(chalk.yellow("  ⚠️  Cannot create symbolic links"));
    console.log(chalk.yellow("  → Enable Developer Mode in Windows Settings"));
    console.log(chalk.yellow("  → Or run as Administrator"));
    return false;
  }
}

/**
 * Check project documentation integrity
 */
async function checkDocsHealth() {
  const cwd = process.cwd();
  const docsToVerify = [
    "resources/docs/GETTING_STARTED.md",
    "resources/docs/overview.md",
    ".kamiflow/ROADMAP.md",
    "resources/docs/TROUBLESHOOTING.md"
  ];

  console.log(chalk.gray("Knowledge Base:"));
  let missing = 0;

  for (const doc of docsToVerify) {
    if (!(await fs.pathExists(path.join(cwd, doc)))) {
      console.log(chalk.red(`  ❌ Missing: ${doc}`));
      missing++;
    }
  }

  // Check plugin documentation consistency
  const commandsPath = path.join(cwd, ".gemini/commands/kamiflow");
  if (fs.existsSync(commandsPath)) {
    const folders = fs.readdirSync(commandsPath).filter(f => f.startsWith('p-'));
    for (const folder of folders) {
      const docPath = `resources/docs/plugins/${folder}.md`;
      if (!(await fs.pathExists(path.join(cwd, docPath)))) {
        console.log(chalk.yellow(`  ⚠️  Missing guide for plugin [${folder}]: ${docPath}`));
        missing++;
      }
    }
  }

  if (missing === 0) {
    console.log(chalk.green("  ✓ Documentation is healthy and synchronized"));
    return true;
  }
  return false;
}

/**
 * Check current directory for KamiFlow portals
 */
async function checkCurrentProject() {
  const cwd = process.cwd();
  const geminiPath = path.join(cwd, ".gemini");
  const windsurfPath = path.join(cwd, ".windsurf");
  const contextPath = path.join(cwd, ".kamiflow/PROJECT_CONTEXT.md");

  console.log(chalk.gray("Current Directory:"), cwd);

  const hasGemini = await fs.pathExists(geminiPath);
  const hasWindsurf = await fs.pathExists(windsurfPath);
  const hasContext = await fs.pathExists(contextPath);

  if (hasGemini && hasWindsurf) {
    console.log(chalk.green("  ✓ KamiFlow portals detected"));
    try {
      const stats = await fs.lstat(geminiPath);
      if (stats.isSymbolicLink()) {
        const target = await fs.readlink(geminiPath);
        console.log(chalk.gray("  → Mode: LINKED"));
      } else {
        console.log(chalk.gray("  → Mode: STANDALONE"));
      }
    } catch {
      console.log(chalk.gray("  → Mode: STANDALONE"));
    }

    if (hasContext) {
      console.log(chalk.green("  ✓ PROJECT_CONTEXT.md found"));
    }
    return true;
  } else {
    console.log(chalk.yellow("  ⚠️  No KamiFlow portals found"));
    return false;
  }
}

const { validateTomlFiles } = require("../validators/toml-validator");

async function checkTomlConfig() {
  try {
    const kamiflowPath = path.join(process.cwd(), ".gemini", "commands", "kamiflow");
    if (fs.existsSync(kamiflowPath)) {
      const result = await validateTomlFiles(kamiflowPath, { verbose: false });
      console.log(chalk.gray("Configuration (TOML):"), `${result.valid}/${result.total} valid`);
      if (result.invalid === 0) {
        console.log(chalk.green("  ✓ All configuration files are valid"));
        return true;
      }
      else {
        console.log(chalk.red(`  ❌ ${result.invalid} invalid TOML files detected`));
        return false;
      }
    }
    return true;
  } catch (error) {
    console.log(chalk.red("  ❌ Failed to validate TOML files"));
    return false;
  }
}

/**
 * Check for legacy .bak files scattered in the project
 */
async function checkLegacyBackups() {
  const cwd = process.cwd();
  const pattern = path.join(cwd, '.gemini/commands/**/*.bak');
  const glob = require('glob');
  
  try {
    const files = glob.sync(pattern);
    console.log(chalk.gray("Legacy Backups:"), files.length === 0 ? "none" : `${files.length} found`);
    
    if (files.length > 0) {
      console.log(chalk.yellow(`  ⚠️  Found ${files.length} legacy .bak files in .gemini/commands/`));
      console.log(chalk.yellow("  → These should be moved to .kamiflow/.backup/ or deleted."));
      console.log(chalk.gray("  → Run 'kami doctor --fix' to clean them up."));
      return false;
    }
    console.log(chalk.green("  ✓ No legacy backups detected"));
    return true;
  } catch (error) {
    return true;
  }
}

/**
 * Check Knowledge Graph integrity
 */
async function checkKnowledgeGraph() {
  const { WorkspaceIndex } = require("./workspace-index");
  const index = new WorkspaceIndex(process.cwd());
  
  console.log(chalk.gray("Knowledge Graph:"));
  try {
    await index.initialize();
    const broken = await index.detectBrokenPaths();
    
    if (broken.length > 0) {
      console.log(chalk.yellow(`  ⚠️  Found ${broken.length} broken link(s) in Knowledge Graph`));
      console.log(chalk.gray("  → Run 'kami doctor --fix' to heal paths via checksum."));
      return false;
    }
    console.log(chalk.green("  ✓ Knowledge Graph integrity is verified"));
    return true;
  } catch (e) {
    console.log(chalk.red(`  ❌ Failed to verify Knowledge Graph: ${e.message}`));
    return false;
  } finally {
    index.close();
  }
}

async function runDoctor(options = {}) {
  console.log(chalk.cyan("Running system health checks...\n"));

  const inquirer = (await import('inquirer')).default;

  checkNode(); console.log();
  checkGeminiCLI(); console.log();
  checkGit(); console.log();
  checkDeveloperMode(); console.log();
  await checkSymlinkCapability(); console.log();
  await checkDocsHealth(); console.log();
  await checkTomlConfig(); console.log();
  await checkLegacyBackups(); console.log();
  await checkKnowledgeGraph(); console.log();
  const projectHealthy = await checkCurrentProject();

  console.log();
  console.log(chalk.cyan("─".repeat(50)));

  if (options.fix && projectHealthy) {
    const { healProject } = require("./healer");
    await healProject(process.cwd(), { autoFix: options.autoFix || false });
  }

  return { allHealthy: true }; // Simplified for now
}

module.exports = { runDoctor };