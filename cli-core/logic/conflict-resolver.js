const fs = require("fs-extra");
const path = require("upath");
const crypto = require("crypto");

/**
 * ConflictResolver - Handles sync conflicts with 3-way merge
 * Provides strategies for resolving conflicts in Markdown files
 */
class ConflictResolver {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.conflictsDir = path.join(projectRoot, ".kamiflow/.sync/conflicts");
  }

  /**
   * Detect and store conflicts
   */
  async detectConflict(filePath, localContent, remoteContent, baseContent = null) {
    const conflictId = this.generateConflictId(filePath);
    const conflictPath = path.join(this.conflictsDir, `${conflictId}.json`);

    const conflict = {
      id: conflictId,
      filePath,
      timestamp: Date.now(),
      status: "unresolved",
      local: {
        content: localContent,
        checksum: this.calculateChecksum(localContent),
      },
      remote: {
        content: remoteContent,
        checksum: this.calculateChecksum(remoteContent),
      },
      base: baseContent
        ? {
            content: baseContent,
            checksum: this.calculateChecksum(baseContent),
          }
        : null,
    };

    await fs.ensureDir(this.conflictsDir);
    await fs.writeJson(conflictPath, conflict, { spaces: 2 });

    return conflict;
  }

  /**
   * Get all unresolved conflicts
   */
  async getConflicts() {
    if (!(await fs.pathExists(this.conflictsDir))) {
      return [];
    }

    const files = await fs.readdir(this.conflictsDir);
    const conflicts = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const conflictPath = path.join(this.conflictsDir, file);
        const conflict = await fs.readJson(conflictPath);

        if (conflict.status === "unresolved") {
          conflicts.push(conflict);
        }
      }
    }

    return conflicts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Resolve conflict with strategy
   */
  async resolveConflict(conflictId, strategy, customContent = null) {
    const conflictPath = path.join(this.conflictsDir, `${conflictId}.json`);

    if (!(await fs.pathExists(conflictPath))) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    const conflict = await fs.readJson(conflictPath);
    let resolvedContent;

    switch (strategy) {
      case "keep-local":
        resolvedContent = conflict.local.content;
        break;

      case "keep-remote":
        resolvedContent = conflict.remote.content;
        break;

      case "merge":
        resolvedContent = this.attemptAutoMerge(conflict);
        if (!resolvedContent) {
          throw new Error("Auto-merge failed. Please resolve manually.");
        }
        break;

      case "manual":
        if (!customContent) {
          throw new Error("Custom content required for manual resolution");
        }
        resolvedContent = customContent;
        break;

      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`);
    }

    // Write resolved content to file
    const filePath = path.join(this.projectRoot, ".kamiflow", conflict.filePath);
    await fs.writeFile(filePath, resolvedContent);

    // Mark conflict as resolved
    conflict.status = "resolved";
    conflict.resolvedAt = Date.now();
    conflict.strategy = strategy;
    conflict.resolvedContent = resolvedContent;

    await fs.writeJson(conflictPath, conflict, { spaces: 2 });

    return {
      filePath: conflict.filePath,
      strategy,
      content: resolvedContent,
    };
  }

  /**
   * Attempt automatic 3-way merge for Markdown
   */
  attemptAutoMerge(conflict) {
    const { local, remote, base } = conflict;

    // If no base, can't do 3-way merge
    if (!base) {
      return this.simpleMerge(local.content, remote.content);
    }

    const localLines = local.content.split("\n");
    const remoteLines = remote.content.split("\n");
    const baseLines = base.content.split("\n");

    const result = [];
    let i = 0,
      j = 0,
      k = 0;

    while (i < localLines.length || j < remoteLines.length || k < baseLines.length) {
      const localLine = localLines[i] || "";
      const remoteLine = remoteLines[j] || "";
      const baseLine = baseLines[k] || "";

      // All same - no conflict
      if (localLine === remoteLine && remoteLine === baseLine) {
        result.push(localLine);
        i++;
        j++;
        k++;
        continue;
      }

      // Local changed, remote didn't
      if (localLine !== baseLine && remoteLine === baseLine) {
        result.push(localLine);
        i++;
        j++;
        k++;
        continue;
      }

      // Remote changed, local didn't
      if (remoteLine !== baseLine && localLine === baseLine) {
        result.push(remoteLine);
        i++;
        j++;
        k++;
        continue;
      }

      // Both changed - conflict
      return null;
    }

    return result.join("\n");
  }

  /**
   * Simple merge for files without base version
   */
  simpleMerge(localContent, remoteContent) {
    // For Markdown, append both versions with conflict markers
    return `${localContent}\n\n<!-- MERGE CONFLICT -->\n<!-- Remote version below -->\n\n${remoteContent}`;
  }

  /**
   * Create conflict markers in content
   */
  createConflictMarkers(localContent, remoteContent) {
    return `<<<<<<< LOCAL\n${localContent}\n=======\n${remoteContent}\n>>>>>>> REMOTE`;
  }

  /**
   * Delete resolved conflicts older than retention period
   */
  async cleanupResolvedConflicts(retentionDays = 30) {
    if (!(await fs.pathExists(this.conflictsDir))) {
      return 0;
    }

    const files = await fs.readdir(this.conflictsDir);
    const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    let deleted = 0;

    for (const file of files) {
      if (file.endsWith(".json")) {
        const conflictPath = path.join(this.conflictsDir, file);
        const conflict = await fs.readJson(conflictPath);

        if (
          conflict.status === "resolved" &&
          conflict.resolvedAt < cutoffTime
        ) {
          await fs.remove(conflictPath);
          deleted++;
        }
      }
    }

    return deleted;
  }

  /**
   * Generate conflict ID
   */
  generateConflictId(filePath) {
    const hash = crypto.createHash("md5").update(filePath).digest("hex");
    return `${Date.now()}-${hash.substring(0, 8)}`;
  }

  /**
   * Calculate content checksum
   */
  calculateChecksum(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Get conflict details
   */
  async getConflict(conflictId) {
    const conflictPath = path.join(this.conflictsDir, `${conflictId}.json`);

    if (!(await fs.pathExists(conflictPath))) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    return await fs.readJson(conflictPath);
  }
}

module.exports = { ConflictResolver };
