const fs = require('fs-extra');
const path = require('upath');
const logger = require('./logger');
const { EnvironmentManager } = require('../logic/env-manager');

/**
 * File Vault Utility
 * Handles safe file operations, backups, and atomic writes.
 */

async function backupFile(filePath) {
  try {
    if (await fs.pathExists(filePath)) {
      // Resolve absolute paths to avoid CWD issues
      const absoluteFilePath = path.resolve(filePath);
      
      // Use EnvironmentManager for SSOT root detection
      const env = new EnvironmentManager(process.cwd());
      const projectRoot = env.projectRoot;

      const relativePath = path.relative(projectRoot, absoluteFilePath);
      const backupPath = path.join(projectRoot, '.backup', relativePath);
      
      await fs.ensureDir(path.dirname(backupPath));
      await fs.copy(absoluteFilePath, backupPath, { overwrite: true });
      
      const displayPath = relativePath;
      logger.hint(`Backup saved to: .backup/${displayPath}`);
      return backupPath;
    }
  } catch (error) {
    logger.warn(`Backup failed for ${filePath}: ${error.message}`);
  }
  return null;
}

async function safeWrite(filePath, content) {
  try {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    logger.error(`SafeWrite failed for ${filePath}`, error);
    return false;
  }
}

module.exports = {
  backupFile,
  safeWrite
};
