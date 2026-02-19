/**
 * Shared counting + status helpers for AGK scripts
 *
 * Used by: status.js, dashboard.js, doctor.js
 */

const fs = require("fs-extra");
const path = require("path");

const MEMORY_FILES = [
  "context.md",
  "patterns.md",
  "decisions.md",
  "anti-patterns.md",
];

/**
 * Count .md files in a subdirectory
 */
async function countMdFiles(projectDir, ...subParts) {
  const dir = path.join(projectDir, ...subParts);
  try {
    if (!(await fs.pathExists(dir))) return { count: 0, files: [] };
    const files = await fs.readdir(dir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    return { count: mdFiles.length, files: mdFiles };
  } catch {
    return { count: 0, files: [] };
  }
}

/**
 * Count workflows in .agent/workflows/
 */
function countWorkflows(projectDir) {
  return countMdFiles(projectDir, ".agent", "workflows");
}

/**
 * Count agents in .agent/agents/
 */
function countAgents(projectDir) {
  return countMdFiles(projectDir, ".agent", "agents");
}

/**
 * Check memory system status
 */
async function checkMemory(projectDir) {
  const memoryDir = path.join(projectDir, ".memory");
  try {
    if (!(await fs.pathExists(memoryDir))) {
      return { found: 0, total: MEMORY_FILES.length, freshness: null };
    }
    const files = await fs.readdir(memoryDir);
    const found = MEMORY_FILES.filter((f) => files.includes(f)).length;

    // Freshness — check most recently modified memory file
    let freshness = null;
    for (const mf of ["context.md", "decisions.md"]) {
      const fp = path.join(memoryDir, mf);
      if (await fs.pathExists(fp)) {
        const stat = await fs.stat(fp);
        freshness = relativeTime(stat.mtime);
        break;
      }
    }

    return { found, total: MEMORY_FILES.length, freshness };
  } catch {
    return { found: 0, total: MEMORY_FILES.length, freshness: null };
  }
}

/**
 * Check guard rails in .gemini/rules/ or .agent/rules/
 */
async function checkGuardRails(projectDir) {
  const candidates = [
    { sub: [".gemini", "rules"], label: ".gemini/rules" },
    { sub: [".agent", "rules"], label: ".agent/rules" },
  ];
  for (const c of candidates) {
    const dir = path.join(projectDir, ...c.sub);
    try {
      if (await fs.pathExists(dir)) {
        const files = await fs.readdir(dir);
        const mdFiles = files.filter((f) => f.endsWith(".md"));
        return { count: mdFiles.length, files: mdFiles, location: c.label };
      }
    } catch {
      // continue
    }
  }
  return { count: 0, files: [], location: null };
}

/**
 * Check if git hooks are installed
 */
async function checkHooks(projectDir) {
  const hookPath = path.join(projectDir, ".git", "hooks", "pre-commit");
  try {
    if (!(await fs.pathExists(hookPath))) return false;
    const content = await fs.readFile(hookPath, "utf8");
    return (
      content.includes("sync-memory") ||
      content.includes("antigravity") ||
      content.includes("agk")
    );
  } catch {
    return false;
  }
}

/**
 * Get memory sync remote URL from config
 */
async function getSyncRemote(projectDir) {
  try {
    const config = await fs.readJson(
      path.join(projectDir, ".agent", "config.json"),
    );
    return config?.memory?.syncRemote || null;
  } catch {
    return null;
  }
}

/**
 * Detect if running inside the antigravity-kit source repo (dogfooding)
 */
async function detectDogfooding(projectDir) {
  try {
    const candidates = [
      path.join(projectDir, "packages", "antigravity-kit", "package.json"),
      path.join(projectDir, "package.json"),
    ];
    for (const pkgPath of candidates) {
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        if (
          pkg.name === "@kamishino/antigravity-kit" ||
          pkg.name === "antigravity-kit"
        ) {
          return true;
        }
      }
    }
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * Convert a date to a human-readable relative time string
 */
function relativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toISOString().split("T")[0];
}

module.exports = {
  MEMORY_FILES,
  countMdFiles,
  countWorkflows,
  countAgents,
  checkMemory,
  checkGuardRails,
  checkHooks,
  getSyncRemote,
  detectDogfooding,
  relativeTime,
};
