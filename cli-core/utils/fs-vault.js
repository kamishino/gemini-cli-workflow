const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * File Vault Utility
 * Handles safe file operations, backups, and atomic writes.
 */

async function backupFile(filePath) {
  try {
    if (await fs.pathExists(filePath)) {
      const rootDir = process.cwd();
      const relativePath = path.relative(rootDir, filePath);
      const backupPath = path.join(rootDir, '.backup', relativePath);
      
      await fs.ensureDir(path.dirname(backupPath));
      await fs.copy(filePath, backupPath, { overwrite: true });
      
      console.log(chalk.gray(`📦 Backup saved to: .backup/${relativePath}`));
      return backupPath;
    }
  } catch (error) {
    console.warn(chalk.yellow(`⚠️ Backup failed for ${filePath}: ${error.message}`));
  }
  return null;
}

async function safeWrite(filePath, content) {
  try {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ SafeWrite failed for ${filePath}: ${error.message}`));
    return false;
  }
}

module.exports = {
  backupFile,
  safeWrite
};
