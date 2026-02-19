/**
 * YAML frontmatter parser for agent markdown files
 *
 * Used by: doctor.js (conflict detection), future agent runtime
 */

/**
 * Parse YAML-like frontmatter from a markdown agent file
 * @param {string} content - Full file content
 * @returns {{ name: string, description: string, triggers: string[], owns: string[] } | null}
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fm = match[1];
  const result = { name: null, description: null, triggers: [], owns: [] };

  // name: value
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  if (nameMatch) result.name = nameMatch[1].trim();

  // description: value
  const descMatch = fm.match(/^description:\s*(.+)$/m);
  if (descMatch) result.description = descMatch[1].trim();

  // triggers: [ ... ] (inline YAML array)
  const triggersMatch = fm.match(/triggers:\s*\[([^\]]+)\]/s);
  if (triggersMatch) {
    result.triggers = triggersMatch[1]
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  // owns: (YAML list with - items)
  const ownsSection = fm.match(/owns:\s*\n((?:\s+-\s+.+\n?)+)/);
  if (ownsSection) {
    result.owns = ownsSection[1]
      .split("\n")
      .map((l) => l.replace(/^\s*-\s*/, "").trim())
      .filter(Boolean);
  }

  return result;
}

/**
 * Parse all agent files in a directory
 * @param {string} agentsDir - Absolute path to agents directory
 * @returns {Promise<Array<{ file: string, name: string, triggers: string[], owns: string[] }>>}
 */
async function parseAllAgents(agentsDir) {
  const fs = require("fs-extra");
  const files = await fs.readdir(agentsDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const agents = [];
  for (const file of mdFiles) {
    const content = await fs.readFile(
      require("path").join(agentsDir, file),
      "utf8",
    );
    const fm = parseFrontmatter(content);
    if (fm) {
      agents.push({ file, ...fm });
    }
  }
  return agents;
}

/**
 * Detect trigger keyword conflicts across agents
 * @param {Array<{ file: string, triggers: string[] }>} agents
 * @returns {Array<{ keyword: string, owners: string[] }>}
 */
function detectTriggerConflicts(agents) {
  const triggerMap = new Map();
  for (const agent of agents) {
    for (const trigger of agent.triggers || []) {
      const key = trigger.toLowerCase().trim();
      if (!triggerMap.has(key)) triggerMap.set(key, []);
      triggerMap.get(key).push(agent.file);
    }
  }

  const conflicts = [];
  for (const [keyword, owners] of triggerMap) {
    if (owners.length > 1) {
      conflicts.push({ keyword, owners });
    }
  }
  return conflicts;
}

/**
 * Detect ownership overlaps across agents
 * @param {Array<{ file: string, owns: string[] }>} agents
 * @returns {Array<{ file: string, owners: string[] }>}
 */
function detectOwnershipOverlaps(agents) {
  const ownsMap = new Map();
  for (const agent of agents) {
    for (const owned of agent.owns || []) {
      const key = owned.trim();
      if (!ownsMap.has(key)) ownsMap.set(key, []);
      ownsMap.get(key).push(agent.file);
    }
  }

  const overlaps = [];
  for (const [filePath, owners] of ownsMap) {
    if (owners.length > 1) {
      overlaps.push({ file: filePath, owners });
    }
  }
  return overlaps;
}

module.exports = {
  parseFrontmatter,
  parseAllAgents,
  detectTriggerConflicts,
  detectOwnershipOverlaps,
};
