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
      const absoluteFilePath = path.resolve(filePath);
      
      const env = new EnvironmentManager(process.cwd());
      const projectRoot = env.projectRoot;
      const { ConfigManager } = require('../logic/config-manager');
      const config = new ConfigManager(projectRoot);
      const maxBackups = await config.get('maxBackups') || 5;

      const relativePath = path.relative(projectRoot, absoluteFilePath);
      const backupBaseDir = path.join(projectRoot, '.kamiflow/.backup', path.dirname(relativePath));
      const filename = path.basename(absoluteFilePath);
      
      await fs.ensureDir(backupBaseDir);

      // Rotation Logic
      const existingBackups = (await fs.readdir(backupBaseDir))
        .filter(f => f.startsWith(filename + '_'))
        .sort()
        .reverse(); // Newest first

      if (existingBackups.length >= maxBackups) {
        const toDelete = existingBackups.slice(maxBackups - 1);
        for (const oldFile of toDelete) {
          await fs.remove(path.join(backupBaseDir, oldFile));
        }
      }

      // Create new backup with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('Z')[0];
      const backupPath = path.join(backupBaseDir, `${filename}_${timestamp}`);
      
      await fs.copy(absoluteFilePath, backupPath, { overwrite: true });
      
      const displayPath = path.relative(projectRoot, backupPath);
      logger.hint(`Backup saved to: ${displayPath}`);
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
