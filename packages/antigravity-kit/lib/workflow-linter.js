const fs = require("fs-extra");
const path = require("path");
const {
  loadWorkflowRegistry,
  resolveWorkflowSourceDir,
} = require("./workflow-renderer");

/**
 * Parse workflow frontmatter and body.
 * @param {string} content
 * @returns {{ frontmatter: Record<string,string>, body: string }}
 */
function parseWorkflowFrontmatter(content) {
  const normalized = String(content || "");
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return {
      frontmatter: {},
      body: normalized,
    };
  }

  const frontmatterText = match[1];
  const frontmatter = {};
  for (const line of frontmatterText.split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) {
      frontmatter[key] = value;
    }
  }

  return {
    frontmatter,
    body: normalized.slice(match[0].length),
  };
}

/**
 * Find duplicate numbered steps in markdown content.
 * @param {string} content
 * @returns {number[]}
 */
function findDuplicateStepNumbers(content) {
  const seen = new Set();
  const duplicates = new Set();

  for (const line of String(content || "").split(/\r?\n/)) {
    const match = line.match(/^\s*(\d+)\.\s+/);
    if (!match) continue;
    const step = Number(match[1]);
    if (seen.has(step)) {
      duplicates.add(step);
    } else {
      seen.add(step);
    }
  }

  return [...duplicates].sort((a, b) => a - b);
}

/**
 * Lint canonical workflow blueprints + registry contract.
 * @param {{workflowsRoot: string}} options
 * @returns {Promise<{
 *   ok: boolean,
 *   workflowsRoot: string,
 *   sourceDir: string,
 *   filesLinted: number,
 *   errors: string[],
 *   warnings: string[],
 * }>} summary
 */
async function lintWorkflowBlueprints(options) {
  const workflowsRoot = options.workflowsRoot;
  const sourceDir = await resolveWorkflowSourceDir(workflowsRoot);
  const registry = await loadWorkflowRegistry(workflowsRoot, sourceDir);

  const errors = [];
  const warnings = [];

  // Registry-level checks
  const ids = new Set();
  const sources = new Set();
  for (const entry of registry) {
    if (ids.has(entry.id)) {
      errors.push(`Duplicate workflow id in registry: ${entry.id}`);
    }
    ids.add(entry.id);

    if (sources.has(entry.source)) {
      warnings.push(`Duplicate workflow source in registry: ${entry.source}`);
    }
    sources.add(entry.source);
  }

  if (registry.length === 0) {
    errors.push("Workflow registry resolved to zero entries");
  }

  let filesLinted = 0;
  for (const entry of registry) {
    const sourcePath = path.join(sourceDir, entry.source);
    if (!(await fs.pathExists(sourcePath))) {
      errors.push(`Missing workflow source file: ${entry.source}`);
      continue;
    }

    const content = await fs.readFile(sourcePath, "utf8");
    const parsed = parseWorkflowFrontmatter(content);
    filesLinted++;

    if (!parsed.frontmatter.description) {
      errors.push(`${entry.source}: missing frontmatter description`);
    }

    const duplicateSteps = findDuplicateStepNumbers(content);
    if (duplicateSteps.length > 0) {
      errors.push(
        `${entry.source}: duplicate numbered steps detected (${duplicateSteps.join(", ")})`,
      );
    }

    // Soft contract warnings for consistent UX structure.
    if (!content.includes("Intent triggers")) {
      warnings.push(`${entry.source}: missing "Intent triggers" section`);
    }
    if (!content.includes("## Related Workflows")) {
      warnings.push(`${entry.source}: missing "Related Workflows" section`);
    }
    if (!content.includes("## When to Use")) {
      warnings.push(`${entry.source}: missing "When to Use" section`);
    }
  }

  return {
    ok: errors.length === 0,
    workflowsRoot,
    sourceDir,
    filesLinted,
    errors,
    warnings,
  };
}

module.exports = {
  findDuplicateStepNumbers,
  lintWorkflowBlueprints,
  parseWorkflowFrontmatter,
};
