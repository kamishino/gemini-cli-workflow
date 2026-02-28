const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");

const { checkWorkflowDrift } = require("../lib/workflow-drift");
const { renderWorkflowTemplates } = require("../lib/workflow-renderer");

async function makeTempRoot() {
  const root = path.join(
    os.tmpdir(),
    `agk-workflow-drift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  await fs.ensureDir(root);
  return root;
}

async function makeBaseWorkflowSource(workflowsRoot) {
  await fs.ensureDir(path.join(workflowsRoot, "profiles", "targets"));
  await fs.ensureDir(path.join(workflowsRoot, "profiles", "models"));

  await fs.writeJson(path.join(workflowsRoot, "registry.json"), {
    version: 1,
    workflows: [{ id: "develop", source: "develop.md" }],
  });

  await fs.writeFile(
    path.join(workflowsRoot, "develop.md"),
    [
      "---",
      "description: dev",
      "---",
      "",
      "# /develop",
      "",
      "{{TARGET_OVERLAY}}",
      "{{MODEL_OVERLAY}}",
      "",
      "## Steps",
      "1. Do",
    ].join("\n"),
    "utf8",
  );

  await fs.writeFile(
    path.join(workflowsRoot, "profiles", "targets", "antigravity.md"),
    "TargetBlock",
    "utf8",
  );
  await fs.writeFile(
    path.join(workflowsRoot, "profiles", "models", "default.md"),
    "ModelBlock",
    "utf8",
  );
}

describe("workflow-drift", () => {
  it("passes when managed outputs match rendered templates", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    const templatesDir = path.join(tmpRoot, "templates");

    await makeBaseWorkflowSource(workflowsRoot);
    await renderWorkflowTemplates({
      workflowsRoot,
      outputDir: templatesDir,
      targetProfile: "antigravity",
      modelProfile: "default",
      force: true,
    });

    const result = await checkWorkflowDrift({ workflowsRoot, templatesDir });
    assert.equal(result.ok, true);
    assert.equal(result.identical, 1);
    assert.equal(result.drifted, 0);
    assert.equal(result.missing, 0);

    await fs.remove(tmpRoot);
  });

  it("flags unmanaged files as non-blocking warnings", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    const templatesDir = path.join(tmpRoot, "templates");

    await makeBaseWorkflowSource(workflowsRoot);
    await fs.ensureDir(templatesDir);
    await fs.writeFile(
      path.join(templatesDir, "develop.md"),
      "# legacy\n",
      "utf8",
    );

    const result = await checkWorkflowDrift({ workflowsRoot, templatesDir });
    assert.equal(result.ok, true);
    assert.equal(result.unmanaged, 1);
    assert.equal(result.drifted, 0);

    await fs.remove(tmpRoot);
  });

  it("fails when managed files drift", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    const templatesDir = path.join(tmpRoot, "templates");

    await makeBaseWorkflowSource(workflowsRoot);
    await renderWorkflowTemplates({
      workflowsRoot,
      outputDir: templatesDir,
      targetProfile: "antigravity",
      modelProfile: "default",
      force: true,
    });

    const managedPath = path.join(templatesDir, "develop.md");
    await fs.appendFile(managedPath, "\n# local change\n", "utf8");

    const result = await checkWorkflowDrift({ workflowsRoot, templatesDir });
    assert.equal(result.ok, false);
    assert.equal(result.drifted, 1);

    await fs.remove(tmpRoot);
  });

  it("fails when registry output file is missing", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    const templatesDir = path.join(tmpRoot, "templates");

    await makeBaseWorkflowSource(workflowsRoot);
    await fs.ensureDir(templatesDir);

    const result = await checkWorkflowDrift({ workflowsRoot, templatesDir });
    assert.equal(result.ok, false);
    assert.equal(result.missing, 1);

    await fs.remove(tmpRoot);
  });
});
