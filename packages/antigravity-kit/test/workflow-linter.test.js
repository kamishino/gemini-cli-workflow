const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");

const {
  findDuplicateStepNumbers,
  lintWorkflowBlueprints,
  parseWorkflowFrontmatter,
} = require("../lib/workflow-linter");

async function makeTempRoot() {
  const root = path.join(
    os.tmpdir(),
    `agk-workflow-linter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  await fs.ensureDir(root);
  return root;
}

describe("workflow-linter", () => {
  it("parses frontmatter correctly", () => {
    const parsed = parseWorkflowFrontmatter(
      ["---", "description: Hello", "name: sample", "---", "", "# Body"].join(
        "\n",
      ),
    );
    assert.equal(parsed.frontmatter.description, "Hello");
    assert.equal(parsed.frontmatter.name, "sample");
    assert.ok(parsed.body.includes("# Body"));
  });

  it("detects duplicate numbered steps", () => {
    const duplicates = findDuplicateStepNumbers(
      ["1. A", "2. B", "2. C", "3. D", "3. E"].join("\n"),
    );
    assert.deepEqual(duplicates, [2, 3]);
  });

  it("passes for valid registry and workflow", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    await fs.ensureDir(workflowsRoot);

    await fs.writeJson(path.join(workflowsRoot, "registry.json"), {
      version: 1,
      workflows: [{ id: "develop", source: "develop.md" }],
    });

    await fs.writeFile(
      path.join(workflowsRoot, "develop.md"),
      [
        "---",
        "description: Valid workflow",
        "---",
        "",
        "# /develop",
        "",
        "**Intent triggers**",
        "",
        "## When to Use",
        "",
        "## Steps",
        "1. Do",
        "2. Done",
        "",
        "## Related Workflows",
      ].join("\n"),
      "utf8",
    );

    const summary = await lintWorkflowBlueprints({ workflowsRoot });
    assert.equal(summary.ok, true);
    assert.equal(summary.errors.length, 0);

    await fs.remove(tmpRoot);
  });

  it("fails when registry source file is missing", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    await fs.ensureDir(workflowsRoot);

    await fs.writeJson(path.join(workflowsRoot, "registry.json"), {
      version: 1,
      workflows: [{ id: "missing", source: "missing.md" }],
    });

    const summary = await lintWorkflowBlueprints({ workflowsRoot });
    assert.equal(summary.ok, false);
    assert.ok(summary.errors.some((error) => error.includes("missing.md")));

    await fs.remove(tmpRoot);
  });

  it("fails when duplicate step numbers exist", async () => {
    const tmpRoot = await makeTempRoot();
    const workflowsRoot = path.join(tmpRoot, "workflows");
    await fs.ensureDir(workflowsRoot);

    await fs.writeJson(path.join(workflowsRoot, "registry.json"), {
      version: 1,
      workflows: [{ id: "release", source: "release.md" }],
    });

    await fs.writeFile(
      path.join(workflowsRoot, "release.md"),
      [
        "---",
        "description: Release workflow",
        "---",
        "",
        "# /release",
        "",
        "**Intent triggers**",
        "",
        "## Steps",
        "1. A",
        "2. B",
        "2. C",
        "",
        "## Related Workflows",
      ].join("\n"),
      "utf8",
    );

    const summary = await lintWorkflowBlueprints({ workflowsRoot });
    assert.equal(summary.ok, false);
    assert.ok(summary.errors.some((error) => error.includes("duplicate")));

    await fs.remove(tmpRoot);
  });
});
