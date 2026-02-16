const fs = require("fs-extra");
const path = require("upath");
const { EventEmitter } = require("events");
const logger = require("../utils/logger");

/**
 * FileWatcher - Monitors .kamiflow directories for changes
 * Emits events when files are created, modified, or deleted
 */
class FileWatcher extends EventEmitter {
  constructor(projectRoot, categories = ["archive", "ideas", "tasks"]) {
    super();
    this.projectRoot = projectRoot;
    this.categories = categories;
    this.watchers = new Map();
    this.fileStates = new Map();
    this.debounceTimers = new Map();
    this.debounceDelay = 1000; // 1 second
  }

  /**
   * Start watching directories
   */
  async start() {
    for (const category of this.categories) {
      const categoryPath = path.join(this.projectRoot, ".kamiflow", category);

      if (!(await fs.pathExists(categoryPath))) {
        logger.debug(`Category path not found: ${categoryPath}`);
        continue;
      }

      // Initialize file states
      await this.scanDirectory(categoryPath, category);

      // Start watching (simplified polling approach for cross-platform compatibility)
      const watcher = setInterval(() => {
        this.checkChanges(categoryPath, category);
      }, 2000); // Check every 2 seconds

      this.watchers.set(category, watcher);
      logger.debug(`Watching ${category} for changes`);
    }
  }

  /**
   * Stop watching all directories
   */
  stop() {
    for (const [category, watcher] of this.watchers) {
      clearInterval(watcher);
      logger.debug(`Stopped watching ${category}`);
    }
    this.watchers.clear();
  }

  /**
   * Scan directory and initialize file states
   */
  async scanDirectory(dir, category) {
    const walk = async (currentDir, prefix = "") => {
      try {
        const items = await fs.readdir(currentDir);

        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const relativePath = prefix ? path.join(prefix, item) : item;
          const stat = await fs.stat(fullPath);

          if (stat.isDirectory()) {
            await walk(fullPath, relativePath);
          } else if (item.endsWith(".md")) {
            const filePath = path.join(category, relativePath);
            this.fileStates.set(filePath, {
              mtime: stat.mtimeMs,
              size: stat.size,
            });
          }
        }
      } catch (error) {
        logger.debug(`Error scanning ${currentDir}: ${error.message}`);
      }
    };

    await walk(dir);
  }

  /**
   * Check for file changes
   */
  async checkChanges(dir, category) {
    const currentFiles = new Set();

    const walk = async (currentDir, prefix = "") => {
      try {
        const items = await fs.readdir(currentDir);

        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const relativePath = prefix ? path.join(prefix, item) : item;
          const stat = await fs.stat(fullPath);

          if (stat.isDirectory()) {
            await walk(fullPath, relativePath);
          } else if (item.endsWith(".md")) {
            const filePath = path.join(category, relativePath);
            currentFiles.add(filePath);

            const oldState = this.fileStates.get(filePath);

            if (!oldState) {
              // New file
              this.fileStates.set(filePath, {
                mtime: stat.mtimeMs,
                size: stat.size,
              });
              this.emitDebounced("created", { path: filePath, category });
            } else if (
              stat.mtimeMs !== oldState.mtime ||
              stat.size !== oldState.size
            ) {
              // Modified file
              this.fileStates.set(filePath, {
                mtime: stat.mtimeMs,
                size: stat.size,
              });
              this.emitDebounced("modified", { path: filePath, category });
            }
          }
        }
      } catch (error) {
        logger.debug(
          `Error checking changes in ${currentDir}: ${error.message}`,
        );
      }
    };

    await walk(dir);

    // Check for deleted files
    for (const [filePath, state] of this.fileStates) {
      if (filePath.startsWith(category + "/") && !currentFiles.has(filePath)) {
        this.fileStates.delete(filePath);
        this.emitDebounced("deleted", { path: filePath, category });
      }
    }
  }

  /**
   * Emit events with debouncing to avoid rapid-fire events
   */
  emitDebounced(event, data) {
    const key = `${event}:${data.path}`;

    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.emit(event, data);
      this.debounceTimers.delete(key);
    }, this.debounceDelay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Get list of watched categories
   */
  getWatchedCategories() {
    return Array.from(this.watchers.keys());
  }

  /**
   * Check if watcher is active
   */
  isWatching() {
    return this.watchers.size > 0;
  }
}

module.exports = { FileWatcher };
