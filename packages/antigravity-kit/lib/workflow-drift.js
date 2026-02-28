const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const {
  isManagedWorkflow,
  normalizeModelProfile,
  normalizeTargetProfile,
  renderWorkflowTemplates,
} = require("./workflow-renderer");

function normalizeContent(content) {
  return String(content || "")
    .replace(/\r\n/g, "\n")
    .trim();
}

/**
 * Check registry-managed workflow files for render drift.
 *
 * Strategy:
 * 1) Render canonical workflows to a temporary directory (force mode).
 * 2) Compare each registry output file against templates/workflows output.
 * 3) Treat unmanaged legacy files as warnings (non-blocking by default).
 *
 * @param {{
 *   workflowsRoot: string,
 *   templatesDir: string,
 *   targetProfile?: string,
 *   modelProfile?: string,
 * }} options
 */
async function checkWorkflowDrift(options) {
  const workflowsRoot = options.workflowsRoot;
  const templatesDir = options.templatesDir;
  const targetProfile = normalizeTargetProfile(options.targetProfile);
  const modelProfile = normalizeModelProfile(options.modelProfile);

  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "agk-workflow-drift-"),
  );

  try {
    const renderResult = await renderWorkflowTemplates({
      workflowsRoot,
      outputDir: tempDir,
      targetProfile,
      modelProfile,
      force: true,
      pruneUnknown: true,
    });

    const entries = [];
    for (const file of renderResult.renderedFiles) {
      const expectedPath = path.join(tempDir, file);
      const actualPath = path.join(templatesDir, file);

      if (!(await fs.pathExists(actualPath))) {
        entries.push({ file, status: "missing", managed: false });
        continue;
      }

      const actualContent = await fs.readFile(actualPath, "utf8");
      const expectedContent = await fs.readFile(expectedPath, "utf8");
      const managed = isManagedWorkflow(actualContent);

      if (!managed) {
        entries.push({ file, status: "unmanaged", managed: false });
        continue;
      }

      const same =
        normalizeContent(actualContent) === normalizeContent(expectedContent);
      entries.push({
        file,
        status: same ? "identical" : "drifted",
        managed: true,
      });
    }

    const count = (status) =>
      entries.filter((entry) => entry.status === status).length;

    return {
      targetProfile,
      modelProfile,
      rendered: renderResult.renderedFiles.length,
      missingSourceFiles: renderResult.missingSourceFiles,
      entries,
      identical: count("identical"),
      drifted: count("drifted"),
      missing: count("missing"),
      unmanaged: count("unmanaged"),
      ok:
        count("drifted") === 0 &&
        count("missing") === 0 &&
        renderResult.missingSourceFiles.length === 0,
    };
  } finally {
    await fs.remove(tempDir);
  }
}

module.exports = {
  checkWorkflowDrift,
};
