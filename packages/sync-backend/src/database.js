const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH =
  process.env.DB_PATH || path.join(__dirname, "../data/kamiflow-sync.db");

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    path TEXT NOT NULL,
    content TEXT NOT NULL,
    checksum TEXT NOT NULL,
    modified INTEGER NOT NULL,
    size INTEGER NOT NULL,
    synced_at INTEGER NOT NULL,
    UNIQUE(project_id, path)
  );

  CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    git_repo TEXT,
    last_sync_at INTEGER NOT NULL,
    file_count INTEGER DEFAULT 0,
    total_size INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_project_id ON files(project_id);
  CREATE INDEX IF NOT EXISTS idx_modified ON files(modified);
  CREATE INDEX IF NOT EXISTS idx_synced_at ON files(synced_at);
`);

/**
 * Upsert project metadata
 */
function upsertProject(projectId, name, gitRepo) {
  const stats = getProjectStats(projectId);
  const stmt = db.prepare(`
    INSERT INTO projects (project_id, name, git_repo, last_sync_at, file_count, total_size)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(project_id)
    DO UPDATE SET
      name = excluded.name,
      git_repo = excluded.git_repo,
      last_sync_at = excluded.last_sync_at,
      file_count = excluded.file_count,
      total_size = excluded.total_size
  `);

  stmt.run(
    projectId,
    name,
    gitRepo,
    Date.now(),
    stats.fileCount,
    stats.totalSize,
  );
}

/**
 * Get all projects
 */
function getAllProjects() {
  return db.prepare("SELECT * FROM projects ORDER BY last_sync_at DESC").all();
}

/**
 * Upsert file
 */
function upsertFile(projectId, filePath, content, checksum, modified, size) {
  const stmt = db.prepare(`
    INSERT INTO files (project_id, path, content, checksum, modified, size, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(project_id, path)
    DO UPDATE SET
      content = excluded.content,
      checksum = excluded.checksum,
      modified = excluded.modified,
      size = excluded.size,
      synced_at = excluded.synced_at
  `);

  stmt.run(projectId, filePath, content, checksum, modified, size, Date.now());
}

/**
 * Get files modified since timestamp
 */
function getFilesSince(projectId, sinceTimestamp, limit = 100) {
  const stmt = db.prepare(`
    SELECT path, content, checksum, modified, size
    FROM files
    WHERE project_id = ? AND synced_at > ?
    ORDER BY synced_at ASC
    LIMIT ?
  `);

  return stmt.all(projectId, sinceTimestamp, limit);
}

/**
 * Get project statistics
 */
function getProjectStats(projectId) {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as fileCount,
      SUM(size) as totalSize,
      MAX(synced_at) as lastSync
    FROM files
    WHERE project_id = ?
  `);

  const result = stmt.get(projectId);
  return {
    fileCount: result.fileCount || 0,
    totalSize: result.totalSize || 0,
    lastSync: result.lastSync || null,
  };
}

/**
 * Delete file
 */
function deleteFile(projectId, filePath) {
  const stmt = db.prepare(`
    DELETE FROM files
    WHERE project_id = ? AND path = ?
  `);

  stmt.run(projectId, filePath);
}

/**
 * Delete entire project
 */
function deleteProject(projectId) {
  const deleteFiles = db.prepare("DELETE FROM files WHERE project_id = ?");
  const deleteProj = db.prepare("DELETE FROM projects WHERE project_id = ?");

  const result = db.transaction(() => {
    deleteFiles.run(projectId);
    return deleteProj.run(projectId);
  })();

  return result.changes;
}

module.exports = {
  upsertFile,
  getFilesSince,
  getProjectStats,
  deleteFile,
  deleteProject,
  upsertProject,
  getAllProjects,
};
