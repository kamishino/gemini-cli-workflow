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
      // Resolve absolute paths to avoid CWD issues
      const absoluteFilePath = path.resolve(filePath);
      
      // Find project root (where .git or cli-core exists)
      let projectRoot = process.cwd();
      if (projectRoot.endsWith('cli-core') || projectRoot.endsWith('cli-core' + path.sep)) {
        projectRoot = path.dirname(projectRoot);
      }

      const relativePath = path.relative(projectRoot, absoluteFilePath);
      const backupPath = path.join(projectRoot, '.backup', relativePath);
      
      await fs.ensureDir(path.dirname(backupPath));
      await fs.copy(absoluteFilePath, backupPath, { overwrite: true });
      
      const displayPath = relativePath.replace(/\\/g, '/');
      console.log(chalk.gray(`📦 Backup saved to: .backup/${displayPath}`));
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
