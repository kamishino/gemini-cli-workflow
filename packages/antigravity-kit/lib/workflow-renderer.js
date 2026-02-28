const fs = require("fs-extra");
const path = require("path");

const WORKFLOW_MARKER_PREFIX = "<!-- AGK_WORKFLOW_RENDER:";

const TARGET_ALIASES = {
  antigravity: "antigravity",
  agk: "antigravity",
  default: "antigravity",
  opencode: "opencode",
  "open-code": "opencode",
  gemini: "gemini-cli",
  "gemini-cli": "gemini-cli",
  codex: "codex-cli",
  "codex-cli": "codex-cli",
};

const MODEL_ALIASES = {
  default: "default",
  codex: "codex",
};

/**
 * Normalize workflow target profile name.
 * @param {string} value
 * @returns {string}
 */
function normalizeTargetProfile(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return TARGET_ALIASES[normalized] || "antigravity";
}

/**
 * Normalize model profile name.
 * @param {string} value
 * @returns {string}
 */
function normalizeModelProfile(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return MODEL_ALIASES[normalized] || "default";
}

/**
 * Resolve the canonical source directory for core workflows.
 * Supports both:
 * - resources/blueprints/workflows/*.md (legacy layout)
 * - resources/blueprints/workflows/core/*.md (new layout)
 * @param {string} workflowsRoot
 * @returns {Promise<string>}
 */
async function resolveWorkflowSourceDir(workflowsRoot) {
  const coreDir = path.join(workflowsRoot, "core");
  if (!(await fs.pathExists(coreDir))) {
    return workflowsRoot;
  }

  const files = await fs.readdir(coreDir);
  const hasMarkdown = files.some((file) => file.endsWith(".md"));
  return hasMarkdown ? coreDir : workflowsRoot;
}

/**
 * Discover all workflow markdown files from source directory.
 * @param {string} sourceDir
 * @returns {Promise<Array<{id: string, source: string, output: string}>>}
 */
async function discoverWorkflows(sourceDir) {
  if (!(await fs.pathExists(sourceDir))) {
    return [];
  }

  const files = (await fs.readdir(sourceDir))
    .filter((file) => file.endsWith(".md"))
    .sort();

  return files.map((file) => ({
    id: path.basename(file, ".md"),
    source: file,
    output: file,
  }));
}

/**
 * Load workflow registry if present, otherwise fallback to source discovery.
 * @param {string} workflowsRoot
 * @param {string} sourceDir
 * @returns {Promise<Array<{id: string, source: string, output: string}>>}
 */
async function loadWorkflowRegistry(workflowsRoot, sourceDir) {
  const registryPath = path.join(workflowsRoot, "registry.json");
  if (!(await fs.pathExists(registryPath))) {
    return discoverWorkflows(sourceDir);
  }

  let registry;
  try {
    registry = await fs.readJson(registryPath);
  } catch {
    return discoverWorkflows(sourceDir);
  }

  if (!registry || !Array.isArray(registry.workflows)) {
    return discoverWorkflows(sourceDir);
  }

  const entries = [];
  for (const item of registry.workflows) {
    if (!item) continue;
    const id = String(item.id || "").trim();
    const source = String(item.source || `${id}.md`).trim();
    if (!id || !source) continue;

    entries.push({
      id,
      source,
      output: String(item.output || `${id}.md`).trim(),
    });
  }

  if (entries.length === 0) {
    return discoverWorkflows(sourceDir);
  }

  return entries;
}

/**
 * Read optional profile block markdown.
 * @param {string} workflowsRoot
 * @param {"targets"|"models"} profileKind
 * @param {string} profileName
 * @returns {Promise<string>}
 */
async function loadProfileBlock(workflowsRoot, profileKind, profileName) {
  const profilePath = path.join(
    workflowsRoot,
    "profiles",
    profileKind,
    `${profileName}.md`,
  );

  if (!(await fs.pathExists(profilePath))) {
    return "";
  }

  return fs.readFile(profilePath, "utf8");
}

/**
 * Returns true when workflow file is AGK-managed.
 * @param {string} content
 * @returns {boolean}
 */
function isManagedWorkflow(content) {
  return String(content || "").includes(WORKFLOW_MARKER_PREFIX);
}

/**
 * Inject (or replace) workflow renderer marker.
 * Marker is inserted after frontmatter to keep markdown parsers intact.
 * @param {string} content
 * @param {{workflowId: string, targetProfile: string, modelProfile: string}} metadata
 * @returns {string}
 */
function injectWorkflowMarker(content, metadata) {
  const marker = `${WORKFLOW_MARKER_PREFIX} id=${metadata.workflowId}; target=${metadata.targetProfile}; model=${metadata.modelProfile} -->`;
  const normalizedContent = String(content || "");

  if (normalizedContent.includes(WORKFLOW_MARKER_PREFIX)) {
    return normalizedContent.replace(
      /<!-- AGK_WORKFLOW_RENDER:[^\n]*-->/,
      marker,
    );
  }

  const fmMatch = normalizedContent.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  if (!fmMatch) {
    return `${marker}\n${normalizedContent}`;
  }

  const frontmatter = fmMatch[0];
  const body = normalizedContent.slice(frontmatter.length);
  return `${frontmatter}${marker}\n${body}`;
}

/**
 * Apply workflow placeholders for target/model aware rendering.
 * @param {string} content
 * @param {{
 *   workflowId: string,
 *   targetProfile: string,
 *   modelProfile: string,
 *   targetBlock: string,
 *   modelBlock: string,
 * }} context
 * @returns {string}
 */
function applyWorkflowPlaceholders(content, context) {
  let rendered = String(content || "");
  const replacements = {
    "{{WORKFLOW_ID}}": context.workflowId,
    "{{TARGET_PROFILE}}": context.targetProfile,
    "{{MODEL_PROFILE}}": context.modelProfile,
    "{{TARGET_OVERLAY}}": context.targetBlock,
    "{{MODEL_OVERLAY}}": context.modelBlock,
    "{{TARGET_BLOCK}}": context.targetBlock,
    "{{MODEL_BLOCK}}": context.modelBlock,
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    rendered = rendered.split(placeholder).join(value || "");
  }

  return rendered;
}

/**
 * Render workflow templates from canonical blueprints.
 * Default behavior is non-destructive:
 * - Existing non-managed files are preserved unless `force` is true.
 * - Existing managed files are updated.
 * @param {{
 *   workflowsRoot: string,
 *   outputDir: string,
 *   targetProfile?: string,
 *   modelProfile?: string,
 *   pruneUnknown?: boolean,
 *   force?: boolean,
 * }} options
 */
async function renderWorkflowTemplates(options) {
  const workflowsRoot = options.workflowsRoot;
  const outputDir = options.outputDir;
  const targetProfile = normalizeTargetProfile(options.targetProfile);
  const modelProfile = normalizeModelProfile(options.modelProfile);
  const pruneUnknown = Boolean(options.pruneUnknown);
  const force = Boolean(options.force);

  const sourceDir = await resolveWorkflowSourceDir(workflowsRoot);
  const registry = await loadWorkflowRegistry(workflowsRoot, sourceDir);

  const targetBlock = await loadProfileBlock(
    workflowsRoot,
    "targets",
    targetProfile,
  );
  const modelBlock = await loadProfileBlock(
    workflowsRoot,
    "models",
    modelProfile,
  );

  await fs.ensureDir(outputDir);

  const renderedFiles = [];
  const createdFiles = [];
  const updatedFiles = [];
  const skippedLegacyFiles = [];
  const missingSourceFiles = [];

  for (const workflow of registry) {
    const sourcePath = path.join(sourceDir, workflow.source);
    if (!(await fs.pathExists(sourcePath))) {
      missingSourceFiles.push(workflow.source);
      continue;
    }

    const sourceContent = await fs.readFile(sourcePath, "utf8");
    let rendered = applyWorkflowPlaceholders(sourceContent, {
      workflowId: workflow.id,
      targetProfile,
      modelProfile,
      targetBlock,
      modelBlock,
    });
    rendered = injectWorkflowMarker(rendered, {
      workflowId: workflow.id,
      targetProfile,
      modelProfile,
    });

    if (!rendered.endsWith("\n")) {
      rendered += "\n";
    }

    const outputFile = workflow.output || `${workflow.id}.md`;
    const outputPath = path.join(outputDir, outputFile);
    renderedFiles.push(outputFile);

    const exists = await fs.pathExists(outputPath);
    if (!exists) {
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, rendered, "utf8");
      createdFiles.push(outputFile);
      continue;
    }

    const current = await fs.readFile(outputPath, "utf8");
    const canOverwrite = force || isManagedWorkflow(current);
    if (!canOverwrite) {
      skippedLegacyFiles.push(outputFile);
      continue;
    }

    const normalize = (value) => value.replace(/\r\n/g, "\n").trim();
    if (normalize(current) !== normalize(rendered)) {
      await fs.writeFile(outputPath, rendered, "utf8");
      updatedFiles.push(outputFile);
    }
  }

  const existingFiles = (await fs.readdir(outputDir)).filter((file) =>
    file.endsWith(".md"),
  );

  const managedSet = new Set(renderedFiles);
  const extraFiles = existingFiles.filter((file) => !managedSet.has(file));
  const removedFiles = [];

  if (pruneUnknown) {
    for (const file of extraFiles) {
      const fullPath = path.join(outputDir, file);
      const current = await fs.readFile(fullPath, "utf8");
      if (!force && !isManagedWorkflow(current)) {
        continue;
      }
      await fs.remove(fullPath);
      removedFiles.push(file);
    }
  }

  return {
    targetProfile,
    modelProfile,
    sourceDir,
    renderedFiles,
    createdFiles,
    updatedFiles,
    skippedLegacyFiles,
    missingSourceFiles,
    extraFiles,
    removedFiles,
  };
}

module.exports = {
  WORKFLOW_MARKER_PREFIX,
  applyWorkflowPlaceholders,
  injectWorkflowMarker,
  isManagedWorkflow,
  loadWorkflowRegistry,
  normalizeModelProfile,
  normalizeTargetProfile,
  renderWorkflowTemplates,
  resolveWorkflowSourceDir,
};
