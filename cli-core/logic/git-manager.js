const { execa } = require("execa");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require('upath');

async function isGitRepo(targetPath) {
  try {
    await execa("git", ["rev-parse", "--git-dir"], { cwd: targetPath });
    return true;
  } catch {
    return false;
  }
}

async function initGitRepo(targetPath) {
  try {
    await execa("git", ["init"], { cwd: targetPath });
    return true;
  } catch (error) {
    throw new Error(`Git init failed: ${error.message}`);
  }
}

async function addSubmodule(repoUrl, targetPath, submodulePath) {
  try {
    const submoduleFullPath = path.join(targetPath, submodulePath);
    await execa("git", ["submodule", "add", repoUrl, submodulePath], {
      cwd: targetPath,
    });
    return submoduleFullPath;
  } catch (error) {
    throw new Error(`Submodule add failed: ${error.message}`);
  }
}

async function removeSubmodule(targetPath, submodulePath) {
  try {
    await execa("git", ["submodule", "deinit", "-f", submodulePath], {
      cwd: targetPath,
    });
    await execa("git", ["rm", "-f", submodulePath], { cwd: targetPath });
    const gitModulesPath = path.join(targetPath, ".git", "modules", submodulePath);
    await fs.remove(gitModulesPath);
    return true;
  } catch (error) {
    throw new Error(`Submodule removal failed: ${error.message}`);
  }
}

async function cloneRepo(repoUrl, targetPath) {
  try {
    await execa("git", ["clone", repoUrl, targetPath]);
    return true;
  } catch (error) {
    throw new Error(`Git clone failed: ${error.message}`);
  }
}

async function getRemoteUrl(targetPath) {
  try {
    const { stdout } = await execa("git", ["remote", "get-url", "origin"], {
      cwd: targetPath,
    });
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Check if a file has uncommitted changes (Dirty status)
 */
async function getFileStatus(targetPath, filePath) {
  try {
    const { stdout } = await execa("git", ["status", "--porcelain", filePath], {
      cwd: targetPath,
    });
    return stdout.trim(); // Returns empty string if clean, or something like " M path/to/file" if dirty
  } catch {
    return ""; // Assume clean or non-git
  }
}

module.exports = {
  isGitRepo,
  initGitRepo,
  addSubmodule,
  removeSubmodule,
  cloneRepo,
  getRemoteUrl,
  getFileStatus
};
