const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");

const {
  WORKFLOW_MARKER_PREFIX,
  normalizeModelProfile,
  normalizeTargetProfile,
  renderWorkflowTemplates,
} = require("../lib/workflow-renderer");

async function makeTempRoot() {
  const root = path.join(
    os.tmpdir(),
    `agk-workflow-renderer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  await fs.ensureDir(root);
  return root;
}

describe("workflow-renderer", () => {
  it("normalizes target and model aliases", () => {
    assert.equal(normalizeTargetProfile("agk"), "antigravity");
    assert.equal(normalizeTargetProfile("codex"), "codex-cli");
    assert.equal(normalizeTargetProfile("open-code"), "opencode");
    assert.equal(normalizeModelProfile("codex"), "codex");
    assert.equal(normalizeModelProfile("unknown"), "default");
  });

  it("renders workflows with placeholder replacement and marker", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    const outputDir = path.join(tmpRoot, "out");

    await fs.ensureDir(path.join(workflowsRoot, "profiles", "targets"));
    await fs.ensureDir(path.join(workflowsRoot, "profiles", "models"));

    await fs.writeFile(
      path.join(workflowsRoot, "develop.md"),
      [
        "---",
        "description: test",
        "---",
        "",
        "# {{WORKFLOW_ID}}",
        "Target: {{TARGET_PROFILE}}",
        "Model: {{MODEL_PROFILE}}",
        "",
        "{{TARGET_OVERLAY}}",
        "{{MODEL_OVERLAY}}",
      ].join("\n"),
      "utf8",
    );

    await fs.writeFile(
      path.join(workflowsRoot, "profiles", "targets", "antigravity.md"),
      "Target Overlay Block",
      "utf8",
    );
    await fs.writeFile(
      path.join(workflowsRoot, "profiles", "models", "default.md"),
      "Model Overlay Block",
      "utf8",
    );

    const result = await renderWorkflowTemplates({
      workflowsRoot,
      outputDir,
      targetProfile: "antigravity",
      modelProfile: "default",
    });

    assert.equal(result.createdFiles.length, 1);
    const output = await fs.readFile(
      path.join(outputDir, "develop.md"),
      "utf8",
    );

    assert.ok(output.includes(WORKFLOW_MARKER_PREFIX));
    assert.ok(output.includes("# develop"));
    assert.ok(output.includes("Target: antigravity"));
    assert.ok(output.includes("Model: default"));
    assert.ok(output.includes("Target Overlay Block"));
    assert.ok(output.includes("Model Overlay Block"));

    await fs.remove(tmpRoot);
  });

  it("preserves legacy files by default and overwrites with force", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    const outputDir = path.join(tmpRoot, "out");

    await fs.ensureDir(workflowsRoot);
    await fs.ensureDir(outputDir);

    await fs.writeFile(
      path.join(workflowsRoot, "release.md"),
      "---\ndescription: release\n---\n\n# release\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(outputDir, "release.md"),
      "# Legacy workflow\n",
      "utf8",
    );

    const safeRun = await renderWorkflowTemplates({
      workflowsRoot,
      outputDir,
      targetProfile: "antigravity",
      modelProfile: "default",
    });

    assert.ok(safeRun.skippedLegacyFiles.includes("release.md"));
    const legacyContent = await fs.readFile(
      path.join(outputDir, "release.md"),
      "utf8",
    );
    assert.equal(legacyContent, "# Legacy workflow\n");

    const forceRun = await renderWorkflowTemplates({
      workflowsRoot,
      outputDir,
      targetProfile: "antigravity",
      modelProfile: "default",
      force: true,
    });

    assert.ok(forceRun.updatedFiles.includes("release.md"));
    const forcedContent = await fs.readFile(
      path.join(outputDir, "release.md"),
      "utf8",
    );
    assert.ok(forcedContent.includes(WORKFLOW_MARKER_PREFIX));

    await fs.remove(tmpRoot);
  });

  it("honors registry entries and reports missing source files", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    const outputDir = path.join(tmpRoot, "out");

    await fs.ensureDir(workflowsRoot);
    await fs.writeJson(path.join(workflowsRoot, "registry.json"), {
      version: 1,
      workflows: [
        { id: "sync", source: "sync.md" },
        { id: "missing", source: "missing.md" },
      ],
    });

    await fs.writeFile(
      path.join(workflowsRoot, "sync.md"),
      "---\ndescription: sync\n---\n\n# sync\n",
      "utf8",
    );

    const result = await renderWorkflowTemplates({
      workflowsRoot,
      outputDir,
      force: true,
    });

    assert.ok(result.renderedFiles.includes("sync.md"));
    assert.ok(result.missingSourceFiles.includes("missing.md"));
    assert.ok(await fs.pathExists(path.join(outputDir, "sync.md")));

    await fs.remove(tmpRoot);
  });

  it("prunes only managed extra files when enabled", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    const outputDir = path.join(tmpRoot, "out");

    await fs.ensureDir(workflowsRoot);
    await fs.ensureDir(outputDir);

    await fs.writeFile(
      path.join(workflowsRoot, "review.md"),
      "---\ndescription: review\n---\n\n# review\n",
      "utf8",
    );

    await fs.writeFile(
      path.join(outputDir, "old-managed.md"),
      `${WORKFLOW_MARKER_PREFIX} id=old; target=antigravity; model=default -->\n# old\n`,
      "utf8",
    );
    await fs.writeFile(
      path.join(outputDir, "legacy-custom.md"),
      "# Custom workflow\n",
      "utf8",
    );

    const result = await renderWorkflowTemplates({
      workflowsRoot,
      outputDir,
      pruneUnknown: true,
    });

    assert.ok(result.removedFiles.includes("old-managed.md"));
    assert.ok(!(await fs.pathExists(path.join(outputDir, "old-managed.md"))));
    assert.ok(await fs.pathExists(path.join(outputDir, "legacy-custom.md")));

    await fs.remove(tmpRoot);
  });
});
