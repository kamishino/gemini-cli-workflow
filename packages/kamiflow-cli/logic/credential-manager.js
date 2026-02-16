const fs = require("fs-extra");
const path = require("upath");
const crypto = require("crypto");
const os = require("os");
const logger = require("../utils/logger");

let keytar;
try {
  keytar = require("keytar");
} catch (error) {
  logger.debug("keytar not available, using fallback credential storage");
}

const SERVICE_NAME = "kamiflow-sync";

/**
 * CredentialManager - Secure API key storage using OS keychain
 * Fallback to encrypted file for systems without keychain support
 */
class CredentialManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.projectId = this.getProjectId();
    this.fallbackPath = path.join(
      projectRoot,
      ".kamiflow/.sync/credentials.enc",
    );
  }

  /**
   * Generate or retrieve unique project ID
   */
  getProjectId() {
    const configPath = path.join(this.projectRoot, ".kamirc.json");

    if (fs.existsSync(configPath)) {
      try {
        const config = fs.readJsonSync(configPath);
        if (config.sync?.projectId) {
          return config.sync.projectId;
        }
      } catch (error) {
        logger.debug(`Failed to read project ID: ${error.message}`);
      }
    }

    // Generate new project ID
    return crypto.randomBytes(16).toString("hex");
  }

  /**
   * Store API key securely
   * @returns {Promise<{method: string, success: boolean}>}
   */
  async setApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== "string") {
      throw new Error("API key must be a non-empty string");
    }

    // Try OS keychain first
    if (keytar) {
      try {
        await keytar.setPassword(SERVICE_NAME, this.projectId, apiKey);
        return { method: "keychain", success: true };
      } catch (error) {
        logger.warn(`Keychain storage failed: ${error.message}`);
      }
    }

    // Fallback to encrypted file
    return await this.setApiKeyFallback(apiKey);
  }

  /**
   * Retrieve API key
   * Priority: ENV > Keychain > Encrypted File
   * @returns {Promise<string|null>}
   */
  async getApiKey() {
    // Priority 1: Environment variable (for CI/CD)
    if (process.env.KAMIFLOW_SYNC_API_KEY) {
      return process.env.KAMIFLOW_SYNC_API_KEY;
    }

    // Priority 2: OS Keychain
    if (keytar) {
      try {
        const apiKey = await keytar.getPassword(SERVICE_NAME, this.projectId);
        if (apiKey) return apiKey;
      } catch (error) {
        logger.debug(`Failed to retrieve from keychain: ${error.message}`);
      }
    }

    // Priority 3: Encrypted file fallback
    return await this.getApiKeyFallback();
  }

  /**
   * Delete API key from all storage locations
   * @returns {Promise<boolean>}
   */
  async deleteApiKey() {
    let deleted = false;

    // Delete from keychain
    if (keytar) {
      try {
        await keytar.deletePassword(SERVICE_NAME, this.projectId);
        deleted = true;
      } catch (error) {
        logger.debug(`Failed to delete from keychain: ${error.message}`);
      }
    }

    // Delete encrypted file
    if (await fs.pathExists(this.fallbackPath)) {
      await fs.remove(this.fallbackPath);
      deleted = true;
    }

    return deleted;
  }

  /**
   * Check if credentials are stored
   * @returns {Promise<boolean>}
   */
  async hasCredentials() {
    const apiKey = await this.getApiKey();
    return !!apiKey;
  }

  /**
   * Update existing API key
   * @returns {Promise<{method: string, success: boolean}>}
   */
  async updateApiKey(newApiKey) {
    await this.deleteApiKey();
    return await this.setApiKey(newApiKey);
  }

  /**
   * Fallback: Store API key in encrypted file
   */
  async setApiKeyFallback(apiKey) {
    try {
      const masterKey = this.getMasterKey();
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", masterKey, iv);

      let encrypted = cipher.update(apiKey, "utf8", "hex");
      encrypted += cipher.final("hex");

      const data = {
        iv: iv.toString("hex"),
        encrypted: encrypted,
      };

      await fs.ensureDir(path.dirname(this.fallbackPath));
      await fs.writeJson(this.fallbackPath, data);

      return { method: "encrypted-file", success: true };
    } catch (error) {
      throw new Error(`Failed to store credentials: ${error.message}`);
    }
  }

  /**
   * Fallback: Retrieve API key from encrypted file
   */
  async getApiKeyFallback() {
    try {
      if (!(await fs.pathExists(this.fallbackPath))) {
        return null;
      }

      const data = await fs.readJson(this.fallbackPath);
      const masterKey = this.getMasterKey();
      const iv = Buffer.from(data.iv, "hex");
      const decipher = crypto.createDecipheriv("aes-256-cbc", masterKey, iv);

      let decrypted = decipher.update(data.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      logger.warn(`Failed to decrypt credentials: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate machine-specific master key for encryption
   * Uses hostname + username as entropy source
   */
  getMasterKey() {
    const entropy = `${os.hostname()}:${os.userInfo().username}:kamiflow-salt-v1`;
    return crypto.createHash("sha256").update(entropy).digest();
  }

  /**
   * Get storage method being used
   * @returns {Promise<string>} 'env' | 'keychain' | 'encrypted-file' | 'none'
   */
  async getStorageMethod() {
    if (process.env.KAMIFLOW_SYNC_API_KEY) {
      return "env";
    }

    if (keytar) {
      try {
        const apiKey = await keytar.getPassword(SERVICE_NAME, this.projectId);
        if (apiKey) return "keychain";
      } catch {
        // Ignore
      }
    }

    if (await fs.pathExists(this.fallbackPath)) {
      return "encrypted-file";
    }

    return "none";
  }

  /**
   * Export configuration (without sensitive data)
   * Useful for debugging
   */
  async getDebugInfo() {
    return {
      projectId: this.projectId,
      projectRoot: this.projectRoot,
      storageMethod: await this.getStorageMethod(),
      hasCredentials: await this.hasCredentials(),
      keytarAvailable: !!keytar,
      fallbackPath: this.fallbackPath,
    };
  }
}

module.exports = { CredentialManager };
