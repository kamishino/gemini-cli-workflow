const logger = require("../utils/logger");
const fs = require("fs-extra");
const path = require('upath');
const { execa } = require("execa");
const minimatch = require("minimatch");
const presets = require("../presets.json");
const { getCache, setCache, shouldCheck } = require("../utils/update-cache");
const packageJson = require("../../package.json");
const { LayeredResolver } = require("./layered-resolver");

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

  // Detect current preset
  let currentPreset = "full";
  const configPath = path.join(projectPath, ".kamirc.json");
  if (await fs.pathExists(configPath)) {
    try {
      const config = await fs.readJson(configPath);
      currentPreset = config.preset || "full";
    } catch (e) {
      currentPreset = "full";
    }
  }

  logger.info(`Syncing standalone project files (Preset: ${currentPreset.toUpperCase()})${force ? ' [FORCE]' : ''}...`);

  const protectedFiles = [
    'GEMINI.md', 
    '.kamiflow/PROJECT_CONTEXT.md', 
    '.kamiflow/ROADMAP.md',
    '.kamirc.json'
  ];

  const isPathInPreset = (relPath, presetKey) => {
    const preset = presets[presetKey];
    if (!preset || !preset.patterns) return true;
    const normalizedPath = relPath.replace(/\\/g, "/");
    return preset.patterns.some(pattern => {
      if (pattern === "**") return true;
      return minimatch(normalizedPath, pattern);
    });
  };

  const walkAndSync = async (src, dest) => {
    const items = await fs.readdir(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = await fs.stat(srcPath);
      const relative = path.relative(sourceDist, srcPath).replace(/\\/g, "/");

      if (stat.isDirectory()) {
        // Only enter directories that are part of the preset or contain files that are
        if (relative !== "." && !isPathInPreset(relative, currentPreset) && !isPathInPreset(relative + "/*", currentPreset)) {
            continue;
        }
        await fs.ensureDir(destPath);
        await walkAndSync(srcPath, destPath);
      } else {
        const exists = await fs.pathExists(destPath);
        
        // 0. Filter by Preset
        if (!isPathInPreset(relative, currentPreset)) {
            continue;
        }

        // 1. Documentation & Whitelist: Always update
        const isDoc = relative.includes('.kamiflow/docs/');
        if (isDoc) {
          await fs.copy(srcPath, destPath);
          continue;
        }

        // 2. Protected Files: Never overwrite if they exist
        if (protectedFiles.includes(relative) && exists) {
          logger.hint(`Skipped (Protected): ${relative}`);
          continue;
        }

        // 3. Special Case: .kamirc.example.json (Always skip in projects)
        if (relative === '.kamirc.example.json') {
          if (exists) {
            await fs.remove(destPath);
            logger.warn(`Cleaned up redundant .kamirc.example.json`);
          }
          continue;
        }

        // 4. Standard Sync
        if (exists) {
          if (force) {
            // Backup and overwrite
            const { backupFile } = require('../utils/fs-vault');
            await backupFile(destPath);
            await fs.copy(srcPath, destPath);
            logger.warn(`Overwritten: ${relative} (Backup moved to .kamiflow/.backup)`);
          } else {
            logger.hint(`Skipped (Exists): ${relative}`);
          }
        } else {
          await fs.copy(srcPath, destPath);
          logger.success(`Created: ${relative}`);
        }
      }
    }
  };

  try {
    await walkAndSync(sourceDist, projectPath);

    // Apply local overrides from .kamiflow/agents/.gemini/
    const resolver = new LayeredResolver(projectPath, cliRoot);
    const localOverridesPath = path.join(
      projectPath,
      ".kamiflow/agents/.gemini",
    );

    if (await fs.pathExists(localOverridesPath)) {
      logger.info("Applying local overrides...");
      for (const category of ["commands", "rules", "skills"]) {
        const stats = await resolver.syncCategory(category);
        if (stats.overrides > 0) {
          logger.success(
            `Applied ${stats.overrides} local override(s) for ${category}`,
          );
        }
      }
    }

    // Proactive check for outdated config
    const { ConfigManager } = require("./config-manager");
    const configManager = new ConfigManager(projectPath);
    const { missing, orphaned } = await configManager.checkConfigFidelity();

    if (missing.length > 0) {
      console.log(
        require("chalk").cyan(
          `\nℹ️  Notice: Your .kamirc.json is missing ${missing.length} new setting(s).`,
        ),
      );
      console.log(
        require("chalk").gray(
          `   Missing: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "..." : ""}`,
        ),
      );
      console.log(
        require("chalk").gray(
          "   Run 'kami config sync' to automatically add them.\n",
        ),
      );
    } else if (orphaned.length > 0) {
      console.log(
        require("chalk").yellow(
          `\n⚠️  Notice: Your .kamirc.json contains ${orphaned.length} orphaned key(s).`,
        ),
      );
      console.log(
        require("chalk").gray("   Run 'kami config sync' to view details.\n"),
      );
    } else {
      console.log(
        require("chalk").gray("\n   ✅ Configuration is up to date.\n"),
      );
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
    await updateCache({
      latestVersion,
      lastChecked: Date.now()
    });

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
    if (mode === "STANDALONE" || mode === "LINKED") {
      logger.hint("Tip: Your local configuration might be outdated. Run 'kami config sync' to add new settings.");
    }
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