const fs = require("fs-extra");
const path = require("upath");
const initSqlJs = require("sql.js");
const logger = require("../utils/logger");
const crypto = require("crypto");

/**
 * WorkspaceIndex - SQLite FTS5 indexer for .kamiflow/ workspace
 * Enables fast full-text search across ideas, tasks, and archives
 */
class WorkspaceIndex {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.dbPath = path.join(projectRoot, ".kamiflow/.index/workspace.db");
    this.db = null;
  }

  /**
   * Initialize database and create tables
   */
  async initialize() {
    await fs.ensureDir(path.dirname(this.dbPath));

    const SQL = await initSqlJs();

    // Load existing database or create new
    if (await fs.pathExists(this.dbPath)) {
      const buffer = await fs.readFile(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    // Create search table (simplified without FTS5)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS files_search (
        file_id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        category TEXT,
        file_path TEXT,
        title TEXT,
        content TEXT,
        metadata TEXT
      )
    `);

    // Create metadata table for file tracking
    this.db.run(`
      CREATE TABLE IF NOT EXISTS files_meta (
        file_id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        category TEXT NOT NULL,
        file_path TEXT NOT NULL,
        title TEXT,
        created_at INTEGER,
        modified_at INTEGER,
        size_bytes INTEGER,
        checksum TEXT
      )
    `);

    // Create indexes
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_project ON files_meta(project_id);
      CREATE INDEX IF NOT EXISTS idx_modified ON files_meta(modified_at);
      CREATE INDEX IF NOT EXISTS idx_category ON files_meta(category)
    `);

    // Create stats table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS index_stats (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER
      )
    `);

    // Save database to disk
    await this.save();
  }

  /**
   * Index a directory (archive, ideas, or tasks)
   */
  async indexDirectory(category) {
    const categoryPath = path.join(this.projectRoot, ".kamiflow", category);

    if (!(await fs.pathExists(categoryPath))) {
      logger.debug(`Directory not found: ${categoryPath}`);
      return { indexed: 0, skipped: 0 };
    }

    const files = await this.walkDirectory(categoryPath, ".md");
    let indexed = 0;
    let skipped = 0;

    const transaction = async (filesToIndex) => {
      for (const file of filesToIndex) {
        try {
          const fileId = this.generateFileId(file.relativePath);
          const checksum = this.calculateChecksum(file.absolutePath);

          // Check if file needs reindexing
          const existing = this.db.exec(
            "SELECT checksum FROM files_meta WHERE file_id = ?",
            [fileId],
          )[0]?.values[0];

          if (existing && existing[0] === checksum) {
            skipped++;
            continue;
          }

          const { title, content, metadata } = this.extractContent(
            file.absolutePath,
          );
          const stats = fs.statSync(file.absolutePath);
          const projectId = this.getProjectId();

          this.db.run(
            `INSERT OR REPLACE INTO files_search (file_id, project_id, category, file_path, title, content, metadata)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              fileId,
              projectId,
              category,
              file.relativePath,
              title,
              content,
              JSON.stringify(metadata),
            ],
          );

          this.db.run(
            `INSERT OR REPLACE INTO files_meta (file_id, project_id, category, file_path, title, created_at, modified_at, size_bytes, checksum)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              fileId,
              projectId,
              category,
              file.relativePath,
              title,
              Math.floor(stats.birthtimeMs),
              Math.floor(stats.mtimeMs),
              stats.size,
              checksum,
            ],
          );

          indexed++;
        } catch (error) {
          logger.warn(`Failed to index ${file.relativePath}: ${error.message}`);
        }
      }
    };

    transaction(files);

    // Update stats and save
    this.updateStats("last_indexed", Date.now());
    await this.save();

    return { indexed, skipped };
  }

  /**
   * Search across indexed files
   */
  async search(query, options = {}) {
    const {
      category = null,
      projectId = null,
      limit = 20,
      offset = 0,
    } = options;

    const startTime = Date.now();

    // Simple LIKE-based search (fallback without FTS5)
    let sql = `
      SELECT 
        s.file_id,
        s.category,
        s.file_path,
        s.title,
        substr(s.content, 1, 200) as snippet,
        meta.modified_at,
        meta.size_bytes
      FROM files_search s
      LEFT JOIN files_meta meta ON s.file_id = meta.file_id
      WHERE s.title LIKE ? OR s.content LIKE ?
    `;

    const searchPattern = `%${query}%`;
    const params = [searchPattern, searchPattern];

    if (category) {
      sql += " AND s.category = ?";
      params.push(category);
    }

    if (projectId) {
      sql += " AND s.project_id = ?";
      params.push(projectId);
    }

    sql += " ORDER BY s.title LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const results = this.db.exec(sql, params);
    const rows = results[0]?.values || [];
    const columns = results[0]?.columns || [];

    const took = Date.now() - startTime;

    return {
      results: rows.map((row) => {
        const obj = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return {
          fileId: obj.file_id,
          category: obj.category,
          filePath: obj.file_path,
          title: obj.title,
          snippet: obj.snippet || "",
          score: 1.0,
          modified: new Date(obj.modified_at),
          size: obj.size_bytes,
        };
      }),
      totalCount: rows.length,
      took: `${took}ms`,
    };
  }

  /**
   * Rebuild entire index
   */
  async rebuild() {
    logger.info("Rebuilding workspace index...");

    // Clear existing data
    this.db.run("DELETE FROM files_search");
    this.db.run("DELETE FROM files_meta");

    // Reindex all categories
    const categories = ["archive", "ideas", "tasks"];
    const stats = { total: 0 };

    for (const category of categories) {
      const result = await this.indexDirectory(category);
      stats[category] = result;
      stats.total += result.indexed;
    }

    await this.save();
    logger.success(`Indexed ${stats.total} files`);
    return stats;
  }

  /**
   * Get index statistics
   */
  getStats() {
    const totalFilesResult = this.db.exec(
      "SELECT COUNT(*) as count FROM files_meta",
    )[0];
    const totalFiles = totalFilesResult?.values[0]?.[0] || 0;

    const totalSizeResult = this.db.exec(
      "SELECT SUM(size_bytes) as size FROM files_meta",
    )[0];
    const totalSize = totalSizeResult?.values[0]?.[0] || 0;

    const lastIndexedResult = this.db.exec(
      "SELECT value FROM index_stats WHERE key = 'last_indexed'",
    )[0];
    const lastIndexed = lastIndexedResult?.values[0]?.[0];

    const byCategoryResult = this.db.exec(`
      SELECT category, COUNT(*) as count, SUM(size_bytes) as size
      FROM files_meta
      GROUP BY category
    `)[0];
    const byCategory =
      byCategoryResult?.values.map((row) => ({
        category: row[0],
        count: row[1],
        size: row[2],
      })) || [];

    return {
      totalFiles,
      totalSize,
      lastIndexed: lastIndexed ? new Date(parseInt(lastIndexed)) : null,
      byCategory,
    };
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      await this.save();
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Save database to disk
   */
  async save() {
    if (this.db) {
      const data = this.db.export();
      await fs.writeFile(this.dbPath, Buffer.from(data));
    }
  }

  /**
   * Walk directory recursively and find markdown files
   */
  async walkDirectory(dir, extension) {
    const results = [];

    const walk = async (currentDir, prefix = "") => {
      const items = await fs.readdir(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relativePath = prefix ? path.join(prefix, item) : item;
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          await walk(fullPath, relativePath);
        } else if (item.endsWith(extension)) {
          results.push({
            absolutePath: fullPath,
            relativePath: relativePath,
          });
        }
      }
    };

    await walk(dir);
    return results;
  }

  /**
   * Extract title, content, and metadata from markdown file
   */
  extractContent(filePath) {
    const content = fs.readFileSync(filePath, "utf8");

    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let metadata = {};
    let mainContent = content;

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      mainContent = content.substring(frontmatterMatch[0].length).trim();

      // Simple YAML parser for common fields
      const lines = frontmatter.split("\n");
      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          metadata[match[1]] = match[2].trim();
        }
      }
    }

    // Extract title (first # heading or from frontmatter)
    let title = metadata.title || path.basename(filePath, ".md");
    const titleMatch = mainContent.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1];
    }

    // Remove markdown syntax for better indexing
    const cleanContent = mainContent
      .replace(/^#{1,6}\s+/gm, "") // Remove headers
      .replace(/\*\*(.+?)\*\*/g, "$1") // Bold
      .replace(/\*(.+?)\*/g, "$1") // Italic
      .replace(/`(.+?)`/g, "$1") // Inline code
      .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Links
      .replace(/```[\s\S]*?```/g, "") // Code blocks
      .trim();

    return {
      title,
      content: cleanContent,
      metadata,
    };
  }

  /**
   * Generate unique file ID from relative path
   */
  generateFileId(relativePath) {
    return crypto.createHash("md5").update(relativePath).digest("hex");
  }

  /**
   * Calculate file checksum for change detection
   */
  calculateChecksum(filePath) {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Get project ID from config
   */
  getProjectId() {
    const configPath = path.join(this.projectRoot, ".kamirc.json");
    if (fs.existsSync(configPath)) {
      try {
        const config = fs.readJsonSync(configPath);
        return config.sync?.projectId || "local";
      } catch {
        return "local";
      }
    }
    return "local";
  }

  /**
   * Update index statistics
   */
  updateStats(key, value) {
    this.db.run(
      `
      INSERT OR REPLACE INTO index_stats (key, value, updated_at)
      VALUES (?, ?, ?)
    `,
      [key, value.toString(), Date.now()],
    );
  }
}

module.exports = { WorkspaceIndex };
