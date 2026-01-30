const logger = require("../utils/logger");
const fs = require("fs-extra");
const path = require('upath');
const { execa } = require("execa");
const { getCache, setCache, shouldCheck } = require("../utils/update-cache");
const packageJson = require("../../package.json");

const KAMIFLOW_REPO = "https://github.com/kamishino/gemini-cli-workflow.git";
const RAW_PACKAGE_URL = "https://raw.githubusercontent.com/kamishino/gemini-cli-workflow/main/package.json";

/**
 * Detect the mode of the current project
 */
async function detectProjectMode(projectPath) {
  const kamiFlowPath = path.join(projectPath, ".kami-flow");
  const geminiPath = path.join(projectPath, ".gemini");

  const hasKamiFlow = await fs.pathExists(kamiFlowPath);
  const hasGemini = await fs.pathExists(geminiPath);

  if (hasKamiFlow) {
    try {
      const gitModulesPath = path.join(projectPath, ".gitmodules");
      if (await fs.pathExists(gitModulesPath)) {
        const content = await fs.readFile(gitModulesPath, "utf8");
        if (content.includes(".kami-flow")) {
          return "SUBMODULE";
        }
      }
    } catch (error) {
      logger.warn("Could not verify submodule status");
    }
  }

  if (hasGemini) {
    try {
      const stats = await fs.lstat(geminiPath);
      if (stats.isSymbolicLink()) {
        return "LINKED";
      }
      return "STANDALONE";
    } catch (error) {
      return "STANDALONE";
    }
  }

  return "NONE";
}

/**
 * Update project in Submodule mode
 */
async function updateSubmodule(projectPath) {
  logger.info("Updating KamiFlow submodule...");

  try {
    const submodulePath = ".kami-flow";
    await execa("git", ["submodule", "update", "--remote", "--merge", submodulePath], {
      cwd: projectPath,
      stdio: "inherit",
    });
    logger.success("Submodule updated successfully");
    return true;
  } catch (error) {
    logger.error(`Submodule update failed: ${error.message}`);
    return false;
  }
}

/**
 * Update project in Linked mode (Master Repo)
 */
async function updateLinkedMode(projectPath) {
  logger.info("Updating globally installed KamiFlow...");

  const cliRoot = path.resolve(__dirname, "../../");
  let originalHead = null;

  try {
    // 1. Get current HEAD for rollback
    const { stdout } = await execa("git", ["rev-parse", "HEAD"], { cwd: cliRoot });
    originalHead = stdout.trim();

    // 2. Pull changes
    logger.info("Pulling latest changes...");
    await execa("git", ["pull"], { cwd: cliRoot, stdio: "inherit" });

    // 3. Install dependencies
    logger.info("Installing dependencies...");
    await execa("npm", ["install"], { cwd: cliRoot, stdio: "inherit" });

    // 4. Build artifacts
    logger.info("Building distribution artifacts...");
    await execa("npm", ["run", "build"], { cwd: cliRoot, stdio: "inherit" });

    logger.success("Global package updated and built successfully");
    return true;
  } catch (error) {
    logger.error(`Update failed: ${error.message}`);
    
    if (originalHead) {
      logger.warn(`Attempting atomic rollback to ${originalHead.substring(0, 7)}...`);
      try {
        await execa("git", ["reset", "--hard", originalHead], { cwd: cliRoot });
        logger.success("Rollback complete. System restored to previous version.");
      } catch (rollbackError) {
        logger.error("Critical: Rollback failed. System may be unstable.");
      }
    }
    return false;
  }
}

/**
 * Update project in Standalone mode (Copy-based)
 */
async function updateStandaloneMode(projectPath, options = {}) {
  const cliRoot = path.resolve(__dirname, "../../");
  const sourceDist = path.join(cliRoot, "dist");
  const force = options.force || false;

  if (!(await fs.pathExists(sourceDist))) {
    logger.error("Distribution artifacts missing. Please run 'npm run build' in KamiFlow core.");
    return false;
  }

  logger.info(`Syncing standalone project files${force ? ' (FORCE MODE)' : ''}...`);

  const walkAndSync = async (src, dest) => {
    const items = await fs.readdir(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = await fs.stat(srcPath);

      if (stat.isDirectory()) {
        await fs.ensureDir(destPath);
        await walkAndSync(srcPath, destPath);
      } else {
        const exists = await fs.pathExists(destPath);
        if (exists) {
          if (force) {
            // Backup and overwrite
            const bakPath = `${destPath}.bak`;
            await fs.move(destPath, bakPath, { overwrite: true });
            await fs.copy(srcPath, destPath);
            logger.warn(`Overwritten (Backup created): ${path.relative(projectPath, destPath)}`);
          } else {
            // Skip
            logger.hint(`Skipped (Exists): ${path.relative(projectPath, destPath)}`);
          }
        } else {
          // New file
          await fs.copy(srcPath, destPath);
          logger.success(`Created: ${path.relative(projectPath, destPath)}`);
        }
      }
    }
  };

  try {
    // We sync the core folders and top-level seeds
    const coreFolders = ['.gemini', '.windsurf'];
    const seeds = ['GEMINI.md', '.kamirc.example.json'];

    for (const folder of coreFolders) {
      const src = path.join(sourceDist, folder);
      const dest = path.join(projectPath, folder);
      if (await fs.pathExists(src)) {
        await fs.ensureDir(dest);
        await walkAndSync(src, dest);
      }
    }

    for (const seed of seeds) {
      const src = path.join(sourceDist, seed);
      const dest = path.join(projectPath, seed);
      if (await fs.pathExists(src)) {
        const exists = await fs.pathExists(dest);
        if (exists) {
          if (force) {
            const bakPath = `${dest}.bak`;
            await fs.move(dest, bakPath, { overwrite: true });
            await fs.copy(src, dest);
            logger.warn(`Overwritten (Backup created): ${seed}`);
          } else {
            logger.hint(`Skipped (Exists): ${seed}`);
          }
        } else {
          await fs.copy(src, dest);
          logger.success(`Created: ${seed}`);
        }
      }
    }
    return true;
  } catch (error) {
    logger.error(`Standalone sync failed: ${error.message}`);
    return false;
  }
}

/**
 * Only synchronize global rules
 */
async function syncGlobalRules(projectPath) {
  const cliRoot = path.resolve(__dirname, "../../");
  const src = path.join(cliRoot, ".gemini/rules"); // Source is the transpiled flat rules
  const dest = path.join(projectPath, ".gemini/rules");

  if (!(await fs.pathExists(src))) {
    logger.error("Source rules directory missing.");
    return false;
  }

  logger.info("Synchronizing global behavioral rules...");

  try {
    const files = await fs.readdir(src);
    for (const file of files) {
      // Only copy global rules (prefixed with core-, flow-, std- but specifically global tier)
      // Actually, in the flat .gemini/rules, everything is ready for use.
      // But Task 090 defined 'local' rules as internal. 
      // We should only copy what's in 'global' subfolder of source blueprints.
      // Wait, Transpiler already handles this for dist/. 
      // So if we use sourceDist/.gemini/rules, we are safe.
      
      const sourceFile = path.join(cliRoot, "dist/.gemini/rules", file);
      if (await fs.pathExists(sourceFile)) {
        await fs.copy(sourceFile, path.join(dest, file));
        logger.hint(`Synced: ${file}`);
      }
    }
    logger.success("Global rules synchronized.");
    return true;
  } catch (error) {
    logger.error(`Rules sync failed: ${error.message}`);
    return false;
  }
}

/**
 * Silently check for updates
 */
async function silentCheck() {
  try {
    if (!(await shouldCheck())) return;

    const https = require('https');
    
    const getVersion = () => new Promise((resolve, reject) => {
      const options = {
        headers: { 'User-Agent': 'KamiFlow-CLI' },
        timeout: 2000
      };
      https.get(RAW_PACKAGE_URL, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data).version);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    const latestVersion = await getVersion();
    await setCache(latestVersion);

    if (latestVersion !== packageJson.version) {
      console.log(require('chalk').cyan(`\n✨ A new version of KamiFlow is available: ${latestVersion} (Current: ${packageJson.version})`));
      console.log(require('chalk').gray(`   Run 'kami upgrade' to update.\n`));
    }
  } catch (e) {
    // Fail silently
  }
}

async function checkModeConflicts(projectPath) {
  const kamiFlowPath = path.join(projectPath, ".kami-flow");
  const geminiPath = path.join(projectPath, ".gemini");

  const hasKamiFlow = await fs.pathExists(kamiFlowPath);
  const hasGemini = await fs.pathExists(geminiPath);

  if (!hasGemini) {
    return { hasConflict: false };
  }

  try {
    const stats = await fs.lstat(geminiPath);
    const isSymlink = stats.isSymbolicLink();

    if (hasKamiFlow && isSymlink) {
      const target = await fs.readlink(geminiPath);
      const normalizedTarget = path.normalize(target);

      if (normalizedTarget.includes(".kami-flow")) {
        return { hasConflict: false };
      }

      return {
        hasConflict: true,
        message: "Mixed mode detected: .kami-flow exists but .gemini links elsewhere",
      };
    }

    if (hasKamiFlow && !isSymlink) {
      return {
        hasConflict: true,
        message: "Mode conflict: Both .kami-flow (SUBMODULE) and standalone .gemini exist",
      };
    }

    return { hasConflict: false };
  } catch (error) {
    return { hasConflict: false };
  }
}

async function runUpdate(projectPath, options = {}) {
  logger.header("KamiFlow Update Manager");
  logger.info(`Project: ${projectPath}`);

  const conflictCheck = await checkModeConflicts(projectPath);
  if (conflictCheck.hasConflict) {
    logger.error("Mode Conflict Detected");
    logger.warn(conflictCheck.message);
    logger.hint("Please resolve this manually by choosing one mode (SUBMODULE or STANDALONE).");
    return { success: false, mode: "CONFLICT" };
  }

  const mode = await detectProjectMode(projectPath);
  logger.info(`Detected mode: ${mode}`);

  let success = false;

  switch (mode) {
    case "SUBMODULE":
      success = await updateSubmodule(projectPath);
      break;

    case "LINKED":
      success = await updateLinkedMode(projectPath);
      break;

    case "STANDALONE":
      success = await updateStandaloneMode(projectPath, options);
      break;

    case "NONE":
      logger.warn("No KamiFlow installation detected. Run 'kami init' first.");
      return { success: false, mode };

    default:
      logger.error(`Unknown mode: ${mode}`);
      return { success: false, mode };
  }

  if (success) {
    logger.success("Update process finished.");
  } else {
    logger.error("Update process failed.");
  }

  return { success, mode };
}

module.exports = {
  runUpdate,
  detectProjectMode,
  updateSubmodule,
  updateLinkedMode,
  updateStandaloneMode,
  syncGlobalRules,
  silentCheck,
  checkModeConflicts,
};