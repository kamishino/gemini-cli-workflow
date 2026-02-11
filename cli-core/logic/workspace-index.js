const fs = require("fs-extra");
const path = require("upath");
const logger = require("../utils/logger");
const crypto = require("crypto");

/**
 * WorkspaceIndex - Native SQLite FTS5 indexer for .kamiflow/ workspace
 * Enables fast full-text search across ideas, tasks, and archives
 */
class WorkspaceIndex {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.dbPath = path.join(projectRoot, ".kamiflow/.index/workspace.db");
    this.db = null;
    this.isNative = false;
    
    try {
      this.sqlite = require("node:sqlite");
      this.isNative = true;
    } catch (e) {
      this.sqlite = null;
      this.initSqlJs = require("sql.js");
    }
  }

  /**
   * Initialize database and create tables
   */
  async initialize() {
    await fs.ensureDir(path.dirname(this.dbPath));

    if (this.isNative) {
      this.db = new this.sqlite.DatabaseSync(this.dbPath);
      
      // Enable WAL mode for performance
      this.db.exec("PRAGMA journal_mode = WAL");

      // Create search table
      this.db.exec(`
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

      // Create FTS5 virtual table
      try {
        this.db.exec(`
          CREATE VIRTUAL TABLE IF NOT EXISTS files_fts USING fts5(
            file_id UNINDEXED,
            title,
            content,
            metadata UNINDEXED,
            tokenize='porter'
          )
        `);
      } catch (e) {
        logger.warn("FTS5 not supported by native driver, falling back to standard search.");
      }

      // Create relationships table for Knowledge Graph
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS relationships (
          id TEXT PRIMARY KEY,
          source_id TEXT NOT NULL,
          target_id TEXT NOT NULL,
          rel_type TEXT NOT NULL,
          weight REAL DEFAULT 1.0,
          metadata TEXT,
          created_at INTEGER
        )
      `);

      // Create workflow_states table for state management
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS workflow_states (
          task_id TEXT PRIMARY KEY,
          slug TEXT,
          current_phase TEXT NOT NULL,
          clarify_score REAL,
          metadata TEXT,
          updated_at INTEGER
        )
      `);

      // Create metadata table for file tracking
      this.db.exec(`
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

      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_project ON files_meta(project_id);
        CREATE INDEX IF NOT EXISTS idx_modified ON files_meta(modified_at);
        CREATE INDEX IF NOT EXISTS idx_category ON files_meta(category)
      `);

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS index_stats (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at INTEGER
        )
      `);
    } else {
      // Fallback to sql.js (limited FTS support)
      const SQL = await this.initSqlJs();
      if (await fs.pathExists(this.dbPath)) {
        const buffer = await fs.readFile(this.dbPath);
        this.db = new SQL.Database(buffer);
      } else {
        this.db = new SQL.Database();
      }
      // ... existing legacy init code (simplified for brevity)
      this.db.run("CREATE TABLE IF NOT EXISTS files_search (file_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, category TEXT, file_path TEXT, title TEXT, content TEXT, metadata TEXT)");
      this.db.run("CREATE TABLE IF NOT EXISTS relationships (id TEXT PRIMARY KEY, source_id TEXT NOT NULL, target_id TEXT NOT NULL, rel_type TEXT NOT NULL, weight REAL DEFAULT 1.0, metadata TEXT, created_at INTEGER)");
      this.db.run("CREATE TABLE IF NOT EXISTS workflow_states (task_id TEXT PRIMARY KEY, slug TEXT, current_phase TEXT NOT NULL, clarify_score REAL, metadata TEXT, updated_at INTEGER)");
      this.db.run("CREATE TABLE IF NOT EXISTS files_meta (file_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, category TEXT NOT NULL, file_path TEXT NOT NULL, title TEXT, created_at INTEGER, modified_at INTEGER, size_bytes INTEGER, checksum TEXT)");
      this.db.run("CREATE TABLE IF NOT EXISTS index_stats (key TEXT PRIMARY KEY, value TEXT, updated_at INTEGER)");
    }
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

    for (const file of files) {
      try {
        const fileId = this.generateFileId(file.relativePath);
        const checksum = this.calculateChecksum(file.absolutePath);

        // Check if file needs reindexing
        let existing = null;
        if (this.isNative) {
          const stmt = this.db.prepare("SELECT checksum FROM files_meta WHERE file_id = ?");
          existing = stmt.get(fileId)?.checksum;
        } else {
          existing = this.db.exec(
            "SELECT checksum FROM files_meta WHERE file_id = ?",
            [fileId],
          )[0]?.values[0];
        }

        if (existing && (this.isNative ? existing : existing[0]) === checksum) {
          skipped++;
          continue;
        }

        const { title, content, metadata } = this.extractContent(
          file.absolutePath,
        );

        // Extract relationships if in archive
        if (category === "archive") {
          const taskIdMatch = file.relativePath.match(/_(\d{3})_/);
          if (taskIdMatch) {
            const sourceId = taskIdMatch[1];
            const taskRegex = /\bTask\s+(\d{3})\b/gi;
            const rawContent = fs.readFileSync(file.absolutePath, "utf8");
            const matches = [...rawContent.matchAll(taskRegex)];
            const targets = [...new Set(matches.map((m) => m[1]))];

            for (const targetId of targets) {
              if (targetId !== sourceId) {
                this.addRelationship(sourceId, targetId, "references", {
                  path: file.relativePath,
                });
              }
            }
          }
        }

        const stats = fs.statSync(file.absolutePath);
        const projectId = this.getProjectId();

        if (this.isNative) {
          // Standard Search
          const stmtSearch = this.db.prepare(
            `INSERT OR REPLACE INTO files_search (file_id, project_id, category, file_path, title, content, metadata)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          );
          stmtSearch.run(
            fileId,
            projectId,
            category,
            file.relativePath,
            title,
            content,
            JSON.stringify(metadata)
          );

          // FTS5
          try {
            const stmtFts = this.db.prepare(
              `INSERT OR REPLACE INTO files_fts (file_id, title, content, metadata)
               VALUES (?, ?, ?, ?)`
            );
            stmtFts.run(
              fileId,
              title,
              content,
              JSON.stringify(metadata)
            );
          } catch (e) {
            // FTS might not exist
          }

          // Meta
          const stmtMeta = this.db.prepare(
            `INSERT OR REPLACE INTO files_meta (file_id, project_id, category, file_path, title, created_at, modified_at, size_bytes, checksum)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          );
          stmtMeta.run(
            fileId,
            projectId,
            category,
            file.relativePath,
            title,
            Math.floor(stats.birthtimeMs),
            Math.floor(stats.mtimeMs),
            stats.size,
            checksum
          );
        } else {
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
        }

        indexed++;
      } catch (error) {
        logger.warn(`Failed to index ${file.relativePath}: ${error.message}`);
      }
    }

    // Update stats and save
    this.updateStats("last_indexed", Date.now());
    await this.save();

    return { indexed, skipped };
  }

  /**
   * Search across indexed files
   */
  async search(query, options = {}) {
    const { category = null, projectId = null, limit = 20, offset = 0, synonyms = [] } = options;

    const startTime = Date.now();
    let results = [];

    if (this.isNative) {
      // Build FTS5 query
      let ftsQuery = query;
      if (synonyms.length > 0) {
        ftsQuery = `("${query}" OR ${synonyms.map(s => `"${s}"`).join(" OR ")})`;
      }

      try {
        let sql = `
          SELECT 
            s.file_id,
            s.category,
            s.file_path,
            s.title,
            snippet(files_fts, 2, ' <mark>', '</mark>', '...', 30) as snippet,
            meta.modified_at,
            meta.size_bytes,
            rank
          FROM files_fts s
          JOIN files_meta meta ON s.file_id = meta.file_id
          WHERE files_fts MATCH ?
        `;

        const params = [ftsQuery];

        if (category) {
          sql += " AND meta.category = ?";
          params.push(category);
        }

        sql += " ORDER BY rank LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        results = rows.map(row => ({
          fileId: row.file_id,
          category: row.category,
          filePath: row.file_path,
          title: row.title,
          snippet: row.snippet,
          score: -row.rank, // Lower rank is better in FTS5
          modified: new Date(row.modified_at),
          size: row.size_bytes
        }));
      } catch (e) {
        logger.debug("FTS search failed, falling back to LIKE: " + e.message);
        // Fallback to LIKE if FTS fails
      }
    }

    if (results.length === 0) {
      // Legacy or Fallback LIKE search
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

      sql += " ORDER BY s.title LIMIT ? OFFSET ?";
      params.push(limit, offset);

      if (this.isNative) {
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        results = rows.map(row => ({
          fileId: row.file_id,
          category: row.category,
          filePath: row.file_path,
          title: row.title,
          snippet: row.snippet,
          score: 1.0,
          modified: new Date(row.modified_at),
          size: row.size_bytes
        }));
      } else {
        const r = this.db.exec(sql, params);
        const rows = r[0]?.values || [];
        const columns = r[0]?.columns || [];
        results = rows.map((row) => {
          const obj = {};
          columns.forEach((col, idx) => { obj[col] = row[idx]; });
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
        });
      }
    }

    const took = Date.now() - startTime;

    // Auto-linking Logic (if rank is strong)
    if (this.isNative && results.length > 0 && query && !options.skipAutoLink) {
        this.performAutoLink(query, results);
    }

    return {
      results,
      totalCount: results.length,
      took: `${took}ms`,
    };
  }

  /**
   * Rebuild entire index
   */
  async rebuild() {
    logger.info("Rebuilding workspace index...");

    // Clear existing data
    if (this.isNative) {
      this.db.exec("DELETE FROM files_search");
      this.db.exec("DELETE FROM files_meta");
      this.db.exec("DELETE FROM relationships");
      try { this.db.exec("DELETE FROM files_fts"); } catch (e) {}
    } else {
      this.db.run("DELETE FROM files_search");
      this.db.run("DELETE FROM files_meta");
      this.db.run("DELETE FROM relationships");
    }

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
    let totalFiles = 0;
    let totalSize = 0;
    let lastIndexed = null;
    let byCategory = [];
    let totalRelationships = 0;

    if (this.isNative) {
      totalFiles = this.db.prepare("SELECT COUNT(*) as count FROM files_meta").get().count;
      totalSize = this.db.prepare("SELECT SUM(size_bytes) as size FROM files_meta").get().size || 0;
      lastIndexed = this.db.prepare("SELECT value FROM index_stats WHERE key = 'last_indexed'").get()?.value;
      byCategory = this.db.prepare(`
        SELECT category, COUNT(*) as count, SUM(size_bytes) as size
        FROM files_meta
        GROUP BY category
      `).all();
      totalRelationships = this.db.prepare("SELECT COUNT(*) as count FROM relationships").get().count;
    } else {
      const totalFilesResult = this.db.exec("SELECT COUNT(*) as count FROM files_meta")[0];
      totalFiles = totalFilesResult?.values[0]?.[0] || 0;

      const totalSizeResult = this.db.exec("SELECT SUM(size_bytes) as size FROM files_meta")[0];
      totalSize = totalSizeResult?.values[0]?.[0] || 0;

      const lastIndexedResult = this.db.exec("SELECT value FROM index_stats WHERE key = 'last_indexed'")[0];
      lastIndexed = lastIndexedResult?.values[0]?.[0];

      const byCategoryResult = this.db.exec(`
        SELECT category, COUNT(*) as count, SUM(size_bytes) as size
        FROM files_meta
        GROUP BY category
      `)[0];
      byCategory = byCategoryResult?.values.map((row) => ({
        category: row[0],
        count: row[1],
        size: row[2],
      })) || [];

      const totalRelationshipsResult = this.db.exec("SELECT COUNT(*) as count FROM relationships")[0];
      totalRelationships = totalRelationshipsResult?.values[0]?.[0] || 0;
    }

    return {
      totalFiles,
      totalSize,
      lastIndexed: lastIndexed ? new Date(parseInt(lastIndexed)) : null,
      byCategory,
      totalRelationships,
    };
  }

  /**
   * Add or update a relationship in the Knowledge Graph
   */
  addRelationship(source, target, type, metadata = {}) {
    const id = crypto
      .createHash("md5")
      .update(`${source}:${target}:${type}`)
      .digest("hex");
    
    if (this.isNative) {
      const stmt = this.db.prepare(
        `INSERT OR REPLACE INTO relationships (id, source_id, target_id, rel_type, weight, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run(id, source, target, type, 1.0, JSON.stringify(metadata), Date.now());
    } else {
      this.db.run(
        `INSERT OR REPLACE INTO relationships (id, source_id, target_id, rel_type, weight, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, source, target, type, 1.0, JSON.stringify(metadata), Date.now()]
      );
    }
  }

  /**
   * Auto-link similar tasks based on search rank
   */
  performAutoLink(query, results) {
    // If we have a very strong match (negative rank in FTS5 is better)
    // rank < -10.0 is usually a very strong match in BM25
    const topMatches = results.filter(r => r.score > 10.0).slice(0, 3);
    
    for (const match of topMatches) {
      const taskIdMatch = match.filePath.match(/(\d{3})/);
      if (taskIdMatch) {
        const targetId = taskIdMatch[1];
        // We don't have the sourceTaskId here easily, 
        // but we can log it for the AI to handle or use a session-based ID.
        // For now, let's just log the high-confidence similarity.
        logger.debug(`[Graph] High similarity detected between query "${query}" and Task ${targetId} (Score: ${match.score.toFixed(2)})`);
      }
    }
  }

  /**
   * Get neighboring nodes in the graph
   */
  getNeighbors(nodeId) {
    const sql = `
      SELECT target_id as node, rel_type, 'out' as direction FROM relationships WHERE source_id = ?
      UNION
      SELECT source_id as node, rel_type, 'in' as direction FROM relationships WHERE target_id = ?
    `;
    
    let rows = [];
    let columns = [];

    if (this.isNative) {
      const stmt = this.db.prepare(sql);
      const r = stmt.all(nodeId, nodeId);
      return r;
    } else {
      const results = this.db.exec(sql, [nodeId, nodeId]);
      rows = results[0]?.values || [];
      columns = results[0]?.columns || [];
      return rows.map(row => {
        const obj = {};
        columns.forEach((col, idx) => obj[col] = row[idx]);
        return obj;
      });
    }
  }

  /**
   * Export entire graph data for visualization
   */
  exportGraphData() {
    const nodesMap = new Map();
    let links = [];

    const processFiles = (rows) => {
      rows.forEach((row) => {
        // Extract Task ID (e.g. 075) from path
        const taskIdMatch = row.file_path ? row.file_path.match(/_(\d{3})_/) : null;
        const id = taskIdMatch ? taskIdMatch[1] : row.id;

        if (!nodesMap.has(id)) {
          nodesMap.set(id, {
            id: id,
            label: taskIdMatch ? `Task ${id}: ${row.label}` : row.label,
            type: row.type,
            path: row.file_path,
          });
        }
      });
    };

    if (this.isNative) {
      // 1. Get Nodes from files_meta
      const nodeRows = this.db
        .prepare("SELECT file_id as id, title as label, category as type, file_path FROM files_meta")
        .all();
      processFiles(nodeRows);

      // 2. Get Links from relationships
      links = this.db
        .prepare("SELECT source_id as source, target_id as target, rel_type as type FROM relationships")
        .all();
    } else {
      const nodeR = this.db.exec("SELECT file_id, title, category, file_path FROM files_meta")[0];
      if (nodeR) {
        const rows = nodeR.values.map((v) => ({
          id: v[0],
          label: v[1],
          type: v[2],
          file_path: v[3],
        }));
        processFiles(rows);
      }

      const linkR = this.db.exec("SELECT source_id, target_id, rel_type FROM relationships")[0];
      if (linkR) {
        links = linkR.values.map((v) => ({ source: v[0], target: v[1], type: v[2] }));
      }
    }

    // 3. Ensure all link endpoints exist as nodes (Ghost Node Protection)
    links.forEach((link) => {
      if (!nodesMap.has(link.source)) {
        nodesMap.set(link.source, { id: link.source, label: `Task ${link.source}`, type: "ghost" });
      }
      if (!nodesMap.has(link.target)) {
        nodesMap.set(link.target, { id: link.target, label: `Task ${link.target}`, type: "ghost" });
      }
    });

    return { nodes: Array.from(nodesMap.values()), links };
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      await this.save();
      if (this.isNative) {
        this.db.close();
      } else {
        this.db.close();
      }
      this.db = null;
    }
  }

  /**
   * Save database to disk
   */
  async save() {
    if (this.db) {
      if (this.isNative) {
        // Native automatically saves to file in most cases, 
        // but WAL mode benefits from checkpointing or just closing.
      } else {
        const data = this.db.export();
        await fs.writeFile(this.dbPath, Buffer.from(data));
      }
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
    if (this.isNative) {
      const stmt = this.db.prepare(
        `INSERT OR REPLACE INTO index_stats (key, value, updated_at)
         VALUES (?, ?, ?)`
      );
      stmt.run(key, value.toString(), Date.now());
    } else {
      this.db.run(
        `
        INSERT OR REPLACE INTO index_stats (key, value, updated_at)
        VALUES (?, ?, ?)
      `,
        [key, value.toString(), Date.now()],
      );
    }
  }
}

module.exports = { WorkspaceIndex };
