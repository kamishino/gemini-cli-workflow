const { FileWatcher } = require("./file-watcher");
const { SyncManager } = require("./sync-manager");
const { ConfigManager } = require("./config-manager");
const logger = require("../utils/logger");
const fs = require("fs-extra");
const path = require("upath");

/**
 * SyncDaemon - Background sync process
 * Watches for file changes and auto-syncs based on configuration
 */
class SyncDaemon {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.configManager = new ConfigManager(projectRoot);
    this.syncManager = new SyncManager(projectRoot);
    this.watcher = null;
    this.running = false;
    this.pidFile = path.join(projectRoot, ".kamiflow/.sync/daemon.pid");
    this.logFile = path.join(projectRoot, ".kamiflow/.sync/daemon.log");
    this.syncQueue = new Set();
    this.syncTimer = null;
    this.syncDelay = 5000; // Wait 5 seconds after last change before syncing
  }

  /**
   * Start the daemon
   */
  async start() {
    if (this.running) {
      throw new Error("Daemon is already running");
    }

    // Check if another instance is running
    if (await this.isRunning()) {
      throw new Error("Another daemon instance is already running");
    }

    const config = await this.configManager.get("sync");

    if (!config?.enabled) {
      throw new Error("Sync is not enabled");
    }

    if (config.mode !== "auto") {
      throw new Error("Auto-sync mode is not enabled");
    }

    // Write PID file
    await fs.ensureDir(path.dirname(this.pidFile));
    await fs.writeFile(this.pidFile, process.pid.toString());

    // Start file watcher
    this.watcher = new FileWatcher(
      this.projectRoot,
      config.categories || ["archive", "ideas", "tasks"]
    );

    // Listen for file changes
    this.watcher.on("created", (data) => this.handleFileChange("created", data));
    this.watcher.on("modified", (data) => this.handleFileChange("modified", data));
    this.watcher.on("deleted", (data) => this.handleFileChange("deleted", data));

    await this.watcher.start();

    this.running = true;
    this.log("Daemon started");
    logger.success("Sync daemon started in background");
  }

  /**
   * Stop the daemon
   */
  async stop() {
    if (!this.running) {
      return;
    }

    // Stop watcher
    if (this.watcher) {
      this.watcher.stop();
      this.watcher = null;
    }

    // Clear sync timer
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }

    // Remove PID file
    if (await fs.pathExists(this.pidFile)) {
      await fs.remove(this.pidFile);
    }

    this.running = false;
    this.log("Daemon stopped");
    logger.info("Sync daemon stopped");
  }

  /**
   * Handle file change events
   */
  handleFileChange(event, data) {
    this.log(`File ${event}: ${data.path}`);
    this.syncQueue.add(data.path);

    // Reset sync timer
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.syncTimer = setTimeout(() => {
      this.performSync();
    }, this.syncDelay);
  }

  /**
   * Perform sync operation
   */
  async performSync() {
    if (this.syncQueue.size === 0) {
      return;
    }

    const fileCount = this.syncQueue.size;
    this.syncQueue.clear();

    this.log(`Syncing ${fileCount} file(s)...`);

    try {
      const result = await this.syncManager.push();
      this.log(`Synced ${result.synced} file(s) successfully`);
    } catch (error) {
      this.log(`Sync failed: ${error.message}`);
      logger.warn(`Auto-sync failed: ${error.message}`);
    }
  }

  /**
   * Check if daemon is running
   */
  async isRunning() {
    if (!(await fs.pathExists(this.pidFile))) {
      return false;
    }

    try {
      const pid = parseInt(await fs.readFile(this.pidFile, "utf8"));

      // Check if process exists (cross-platform)
      try {
        process.kill(pid, 0);
        return true;
      } catch {
        // Process doesn't exist, remove stale PID file
        await fs.remove(this.pidFile);
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Get daemon status
   */
  async getStatus() {
    const running = await this.isRunning();
    const config = await this.configManager.get("sync");

    return {
      running,
      mode: config?.mode || "manual",
      enabled: config?.enabled || false,
      watching: this.watcher?.getWatchedCategories() || [],
      queuedFiles: this.syncQueue.size,
    };
  }

  /**
   * Write to log file
   */
  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    try {
      await fs.ensureDir(path.dirname(this.logFile));
      await fs.appendFile(this.logFile, logMessage);
    } catch (error) {
      // Ignore log errors
    }
  }

  /**
   * Get recent logs
   */
  async getLogs(lines = 50) {
    if (!(await fs.pathExists(this.logFile))) {
      return [];
    }

    const content = await fs.readFile(this.logFile, "utf8");
    const allLines = content.trim().split("\n");
    return allLines.slice(-lines);
  }
}

module.exports = { SyncDaemon };
