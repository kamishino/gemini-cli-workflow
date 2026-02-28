const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");

const {
  buildOpenCodeCommand,
  loadOpenCodeCommandTemplates,
  parseWorkflowTemplate,
  resolveOpenCodeAgent,
} = require("../lib/opencode-commands");

describe("opencode-commands", () => {
  it("parses workflow frontmatter and body", () => {
    const source = [
      "---",
      "description: Review code",
      "---",
      "",
      "# review workflow",
    ].join("\n");

    const parsed = parseWorkflowTemplate(source);
    assert.equal(parsed.description, "Review code");
    assert.ok(parsed.body.includes("# review workflow"));
  });

  it("resolves default agent by workflow type", () => {
    assert.equal(resolveOpenCodeAgent("review.md"), "plan");
    assert.equal(resolveOpenCodeAgent("develop.md"), "build");
  });

  it("builds OpenCode command content with arguments passthrough", () => {
    const content = buildOpenCodeCommand({
      fileName: "develop.md",
      description: "Feature implementation",
      body: "# Workflow body\n",
      agent: "build",
    });

    assert.ok(content.includes('description: "Feature implementation"'));
    assert.ok(content.includes("agent: build"));
    assert.ok(content.includes("$ARGUMENTS"));
    assert.ok(content.includes("# Workflow body"));
  });

  it("loads and renders templates from workflow directory", async () => {
    const tmpDir = path.join(os.tmpdir(), `agk-opencode-${Date.now()}`);
    await fs.ensureDir(tmpDir);

    await fs.writeFile(
      path.join(tmpDir, "review.md"),
      ["---", "description: Review task", "---", "", "Review body"].join("\n"),
      "utf8",
    );
    await fs.writeFile(
      path.join(tmpDir, "develop.md"),
      ["---", "description: Build task", "---", "", "Develop body"].join("\n"),
      "utf8",
    );

    const templates = await loadOpenCodeCommandTemplates(tmpDir);
    assert.equal(templates.length, 2);
    assert.ok(templates.some((t) => t.fileName === "review.md"));
    assert.ok(templates.some((t) => t.fileName === "develop.md"));
    assert.ok(
      templates.every((t) => t.content.includes("$ARGUMENTS")),
      "All generated commands should include argument passthrough",
    );

    await fs.remove(tmpDir);
  });
});
