const fs = require("fs-extra");
const path = require("upath");
const logger = require("../utils/logger");
const { getFileStatus } = require("./git-manager");
const DocSyncManager = require("./doc-sync-manager");
const { MemoryManager } = require("./memory-manager");

/**
 * Chronicler - The "Autonomous Clerk" for KamiFlow
 * Listens to workspace events and updates documentation/memory bank safely.
 */
class Chronicler {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.docSync = new DocSyncManager(projectRoot);
    this.memoryManager = new MemoryManager(projectRoot);
    this.fragmentDir = path.join(projectRoot, ".kamiflow/fragments");
    this.debounceTime = 2000;
    this.timers = new Map();
  }

  /**
   * Start watching an index for changes
   */
  watch(index) {
    logger.debug("[Chronicler] Engaged and watching workspace events.");
    
    index.on("file:changed", (data) => {
      // Only auto-sync blueprints to docs
      if (data.category === "blueprints" || data.absolutePath.includes(".gemini/commands")) {
        this.debounce("sync-docs", () => this.syncDocs());
      }
    });
  }

  /**
   * Handle task completion event
   */
  async onTaskCompleted(taskId) {
    logger.debug(`[Chronicler] Processing completion of Task ${taskId}`);
    
    try {
      // 1. Synthesize wisdom from the task
      const recall = await this.memoryManager.generateRecall(`Task ${taskId}`, { skipAutoLink: true });
      
      if (!recall || recall.includes("No relevant memories")) return;

      // 2. Determine target file
      const contextPath = path.join(this.projectRoot, ".kamiflow/PROJECT_CONTEXT.md");
      
      // 3. Conflict Guard
      const isDirty = await getFileStatus(this.projectRoot, contextPath);
      
      if (isDirty) {
        logger.warn(`[Chronicler] Conflict detected: ${path.basename(contextPath)} is being edited. Saving to Fragment.`);
        await this.createFragment(contextPath, recall, taskId);
      } else {
        await this.updateProjectContext(contextPath, recall, taskId);
      }
    } catch (error) {
      logger.debug(`[Chronicler] Failed to record wisdom for Task ${taskId}: ${error.message}`);
    }
  }

  /**
   * Update PROJECT_CONTEXT.md with new wisdom
   */
  async updateProjectContext(filePath, wisdom, taskId) {
    if (!(await fs.pathExists(filePath))) return;

    let content = await fs.readFile(filePath, "utf8");
    const header = "## 📚 Project Wisdom: Strategic Patterns";
    
    if (content.includes(header)) {
      const parts = content.split(header);
      const wisdomEntry = `
| ${taskId} | ${this.extractTitle(wisdom)} | **Recall:** ${wisdom} | Task ${taskId} |
`;
      
      // Inject after header but before any existing table rows
      const lines = parts[1].trim().split("\n");
      const tableHeaderIndex = lines.findIndex(l => l.includes("| ID | Pattern |"));
      
      if (tableHeaderIndex !== -1) {
        lines.splice(tableHeaderIndex + 2, 0, wisdomEntry.trim());
        content = parts[0] + header + "\n\n" + lines.join("\n");
      } else {
        content = parts[0] + header + "\n\n" + wisdomEntry + parts[1];
      }
      
      await fs.writeFile(filePath, content);
      logger.success(`[Chronicler] Live Sync: Updated project wisdom with Task ${taskId}.`);
    }
  }

  /**
   * Save wisdom to a fragment file when conflict is detected
   */
  async createFragment(targetFile, content, taskId) {
    await fs.ensureDir(this.fragmentDir);
    const fileName = `${Date.now()}-${taskId}.json`;
    const fragmentPath = path.join(this.fragmentDir, fileName);
    
    const fragment = {
      target: path.relative(this.projectRoot, targetFile),
      taskId,
      timestamp: Date.now(),
      content,
      type: "wisdom"
    };
    
    await fs.writeJson(fragmentPath, fragment, { spaces: 2 });
    logger.hint(`[Chronicler] Fragment created: ${path.relative(this.projectRoot, fragmentPath)}`);
  }

  /**
   * Sync documentation Wiki
   */
  async syncDocs() {
    logger.debug("[Chronicler] Auto-syncing blueprints to documentation...");
    await this.docSync.sync();
  }

  /**
   * Helper: Debounce actions
   */
  debounce(key, fn) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    const timer = setTimeout(() => {
      fn();
      this.timers.delete(key);
    }, this.debounceTime);
    
    this.timers.set(key, timer);
  }

  extractTitle(wisdom) {
    const match = wisdom.match(/learned that ([^.]+)/i);
    if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    return "New Project Insight";
  }
}

module.exports = Chronicler;
