const fs = require("fs-extra");
const path = require('upath');
const chalk = require("chalk");

/**
 * Swarm Concurrency Guard & Dispatcher
 */

const LOCK_FILE = ".swarm-lock";

/**
 * Check if a directory is locked by another agent
 */
async function isLocked(dirPath) {
  const lockPath = path.join(dirPath, LOCK_FILE);
  return await fs.pathExists(lockPath);
}

/**
 * Set a lock on a directory
 */
async function acquireLock(dirPath, agentId) {
  const lockPath = path.join(dirPath, LOCK_FILE);
  if (await isLocked(dirPath)) {
    const existingLock = await fs.readJson(lockPath);
    throw new Error(`Directory ${dirPath} is locked by agent: ${existingLock.agent}`);
  }
  
  const lockData = {
    agent: agentId,
    timestamp: new Date().toISOString(),
    pid: process.pid
  };
  
  await fs.writeJson(lockPath, lockData, { spaces: 2 });
  console.log(chalk.yellow(`[SWARM] Lock acquired for ${agentId} on ${dirPath}`));
}

/**
 * Release a lock
 */
async function releaseLock(dirPath) {
  const lockPath = path.join(dirPath, LOCK_FILE);
  if (await fs.pathExists(lockPath)) {
    await fs.remove(lockPath);
    console.log(chalk.gray(`[SWARM] Lock released for ${dirPath}`));
  }
}

/**
 * Get swarm status from registry
 */
async function getSwarmStatus() {
  const registryPath = path.join(process.cwd(), "docs/agents/registry.md");
  if (!fs.existsSync(registryPath)) return "UNKNOWN";
  
  const content = await fs.readFile(registryPath, "utf8");
  const locks = await findActiveLocks(process.cwd());
  
  return {
    registryExists: true,
    activeLocks: locks
  };
}

async function findActiveLocks(baseDir) {
  const folders = ["tasks", "ideas/discovery", "ideas/draft", "ideas/backlog"];
  const active = [];
  
  for (const f of folders) {
    const p = path.join(baseDir, f);
    if (fs.existsSync(p) && await isLocked(p)) {
      const data = await fs.readJson(path.join(p, LOCK_FILE));
      active.push({ folder: f, ...data });
    }
  }
  return active;
}

module.exports = { isLocked, acquireLock, releaseLock, getSwarmStatus };
