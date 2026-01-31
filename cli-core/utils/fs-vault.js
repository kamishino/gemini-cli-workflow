const fs = require("fs-extra");
const path = require("upath");
const logger = require("./logger");
const { sanitizePath } = require("./sanitize");
const { EnvironmentManager } = require("../logic/env-manager");

/**
 * File Vault Utility
 * Handles safe file operations, backups, and atomic writes.
 */

async function backupFile(filePath) {
  try {
    // Validate and sanitize file path
    const sanitizedPath = sanitizePath(filePath);

    if (await fs.pathExists(sanitizedPath)) {
      const absoluteFilePath = path.resolve(sanitizedPath);

      const env = new EnvironmentManager(process.cwd());
      const projectRoot = env.projectRoot;

      // Security: Ensure file is within project bounds
      if (!absoluteFilePath.startsWith(projectRoot)) {
        logger.warn(`Backup attempt outside project: ${filePath}`);
        return null;
      }
      const { ConfigManager } = require("../logic/config-manager");
      const config = new ConfigManager(projectRoot);
      const maxBackups = (await config.get("maxBackups")) || 5;

      const relativePath = path.relative(projectRoot, absoluteFilePath);
      const backupBaseDir = path.join(projectRoot, ".kamiflow/.backup", path.dirname(relativePath));
      const filename = path.basename(absoluteFilePath);

      await fs.ensureDir(backupBaseDir);

      // Rotation Logic
      const existingBackups = (await fs.readdir(backupBaseDir))
        .filter((f) => f.startsWith(filename + "_"))
        .sort()
        .reverse();

      if (existingBackups.length >= maxBackups) {
        const toDelete = existingBackups.slice(maxBackups - 1);
        for (const oldFile of toDelete) {
          await fs.remove(path.join(backupBaseDir, oldFile));
        }
      }

      // Create new backup with millisecond precision for concurrency safety
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").split("Z")[0];
      const ms = now.getMilliseconds().toString().padStart(3, "0");
      const backupPath = path.join(backupBaseDir, `${filename}_${timestamp}_${ms}`);

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

async function safeWrite(filePath, content, options = {}) {
  const { maxSize = 10 * 1024 * 1024, validatePath = true } = options; // 10MB default

  try {
    // Validate and sanitize file path
    if (validatePath) {
      const sanitizedPath = sanitizePath(filePath);
      filePath = sanitizedPath;
    }

    // Security: Check content size to prevent DoS
    const contentSize = Buffer.byteLength(content, "utf8");
    if (contentSize > maxSize) {
      logger.error(`Content too large for ${filePath}: ${contentSize} bytes (max ${maxSize})`);
      return false;
    }

    // Security: Ensure write location is within project bounds
    const absolutePath = path.resolve(filePath);
    const env = new EnvironmentManager(process.cwd());
    const projectRoot = env.projectRoot;

    if (!absolutePath.startsWith(projectRoot)) {
      logger.error(`Write attempt outside project: ${filePath}`);
      return false;
    }

    const tempPath = `${filePath}.${Math.random().toString(36).substring(7)}.tmp`;

    await fs.ensureDir(path.dirname(filePath));
    // Atomic Write: Write to temp, then rename
    await fs.writeFile(tempPath, content, "utf8");
    await fs.move(tempPath, filePath, { overwrite: true });
    return true;
  } catch (error) {
    const tempPath = `${filePath}.${Math.random().toString(36).substring(7)}.tmp`;
    if (await fs.pathExists(tempPath)) await fs.remove(tempPath);
    logger.error(`SafeWrite failed for ${filePath}`, error);
    return false;
  }
}

module.exports = {
  backupFile,
  safeWrite,
};
