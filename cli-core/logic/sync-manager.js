const fs = require("fs-extra");
const path = require("upath");
const crypto = require("crypto");
const { SyncClient } = require("./sync-client");
const { CredentialManager } = require("./credential-manager");
const { ConfigManager } = require("./config-manager");
const logger = require("../utils/logger");

/**
 * SyncManager - Orchestrates workspace synchronization
 * Handles push, pull, and bi-directional sync operations
 */
class SyncManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.configManager = new ConfigManager(projectRoot);
    this.credentialManager = new CredentialManager(projectRoot);
    this.stateFile = path.join(projectRoot, ".kamiflow/.sync/state.json");
  }

  /**
   * Initialize sync system
   */
  async initialize() {
    const config = await this.configManager.get("sync");
    
    if (!config?.enabled) {
      throw new Error("Sync is not enabled. Run 'kami sync-db setup' first.");
    }
    
    if (!config.backend) {
      throw new Error("Sync backend URL not configured.");
    }
    
    const apiKey = await this.credentialManager.getApiKey();
    if (!apiKey) {
      throw new Error(
        "API key not found. Run 'kami sync-db setup' to configure credentials.",
      );
    }
    
    this.client = new SyncClient(config.backend, apiKey);
    this.config = config;
  }

  /**
   * Push local changes to backend
   */
  async push() {
    await this.initialize();
    
    logger.info("Scanning local workspace...");
    
    const categories = this.config.categories || ["archive", "ideas", "tasks"];
    const files = [];
    const state = await this.loadState();
    
    for (const category of categories) {
      const categoryPath = path.join(this.projectRoot, ".kamiflow", category);
      
      if (await fs.pathExists(categoryPath)) {
        const categoryFiles = await this.scanDirectory(categoryPath, category, state);
        files.push(...categoryFiles);
      }
    }
    
    if (files.length === 0) {
      logger.success("No changes to sync.");
      return { synced: 0 };
    }
    
    logger.info(`Uploading ${files.length} file(s)...`);
    
    const metadata = await this.getProjectMetadata();
    const result = await this.client.pushFiles(
      this.config.projectId,
      files,
      [],
      metadata
    );
    
    // Update state
    for (const file of files) {
      state.files[file.path] = {
        checksum: file.checksum,
        modified: file.modified,
        synced: Date.now()
      };
    }
    
    state.lastPushAt = Date.now();
    await this.saveState(state);
    
    logger.success(`Synced ${result.synced} file(s).`);
    return result;
  }

  /**
   * Pull remote changes to local
   */
  async pull() {
    await this.initialize();
    
    logger.info("Fetching remote changes...");
    
    const state = await this.loadState();
    const sinceTimestamp = state.lastPullAt || 0;
    
    const result = await this.client.pullFiles(
      this.config.projectId,
      sinceTimestamp
    );
    
    if (!result.files || result.files.length === 0) {
      logger.success("Already up to date.");
      return { pulled: 0 };
    }
    
    logger.info(`Downloading ${result.files.length} file(s)...`);
    
    let pulled = 0;
    for (const file of result.files) {
      const localPath = path.join(this.projectRoot, ".kamiflow", file.path);
      
      await fs.ensureDir(path.dirname(localPath));
      await fs.writeFile(localPath, file.content);
      
      state.files[file.path] = {
        checksum: file.checksum,
        modified: file.modified,
        synced: Date.now()
      };
      
      pulled++;
    }
    
    state.lastPullAt = Date.now();
    await this.saveState(state);
    
    logger.success(`Downloaded ${pulled} file(s).`);
    return { pulled };
  }

  /**
   * Bi-directional sync (pull then push)
   */
  async sync() {
    await this.pull();
    await this.push();
  }

  /**
   * Get sync status
   */
  async status() {
    await this.initialize();
    
    const state = await this.loadState();
    const categories = this.config.categories || ["archive", "ideas", "tasks"];
    const pendingFiles = [];
    
    for (const category of categories) {
      const categoryPath = path.join(this.projectRoot, ".kamiflow", category);
      
      if (await fs.pathExists(categoryPath)) {
        const files = await this.scanDirectory(categoryPath, category, state);
        pendingFiles.push(...files);
      }
    }
    
    return {
      backend: this.config.backend,
      projectId: this.config.projectId,
      mode: this.config.mode,
      lastSync: state.lastPushAt || state.lastPullAt,
      pendingFiles: pendingFiles.length,
      files: pendingFiles.map(f => ({ path: f.path, size: f.size }))
    };
  }

  /**
   * Get project metadata from package.json
   */
  async getProjectMetadata() {
    const pkgPath = path.join(this.projectRoot, "package.json");
    let name = path.basename(this.projectRoot);
    let gitRepo = "";

    if (await fs.pathExists(pkgPath)) {
      try {
        const pkg = await fs.readJson(pkgPath);
        if (pkg.name) name = pkg.name;
        if (pkg.repository?.url) {
          gitRepo = pkg.repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
        }
      } catch (e) {
        // Fallback to defaults
      }
    }

    return { name, gitRepo };
  }

  /**
   * Scan directory for changed files
   */
  async scanDirectory(dir, category, state) {
    const files = [];
    
    const walk = async (currentDir, prefix = "") => {
      const items = await fs.readdir(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relativePath = prefix ? path.join(prefix, item) : item;
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          await walk(fullPath, relativePath);
        } else if (item.endsWith(".md")) {
          const filePath = path.join(category, relativePath);
          const content = await fs.readFile(fullPath, "utf8");
          const checksum = this.calculateChecksum(content);
          
          // Check if file changed
          const existingState = state.files[filePath];
          if (!existingState || existingState.checksum !== checksum) {
            files.push({
              path: filePath,
              checksum: checksum,
              modified: Math.floor(stat.mtimeMs),
              size: stat.size,
              content: content
            });
          }
        }
      }
    };
    
    await walk(dir);
    return files;
  }

  /**
   * Load sync state
   */
  async loadState() {
    if (await fs.pathExists(this.stateFile)) {
      return await fs.readJson(this.stateFile);
    }
    
    return {
      projectId: this.config.projectId,
      lastPushAt: null,
      lastPullAt: null,
      files: {}
    };
  }

  /**
   * Save sync state
   */
  async saveState(state) {
    await fs.ensureDir(path.dirname(this.stateFile));
    await fs.writeJson(this.stateFile, state, { spaces: 2 });
  }

  /**
   * Calculate file checksum
   */
  calculateChecksum(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Delete all remote data
   */
  async deleteRemote() {
    await this.initialize();
    
    logger.warn("Deleting all remote data...");
    const result = await this.client.deleteProject(this.config.projectId);
    
    // Clear local state
    if (await fs.pathExists(this.stateFile)) {
      await fs.remove(this.stateFile);
    }
    
    logger.success(`Deleted ${result.deleted} remote file(s).`);
    return result;
  }
}

module.exports = { SyncManager };
