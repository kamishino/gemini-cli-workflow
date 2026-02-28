const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");

const {
  REGISTRY_START,
  REGISTRY_END,
  buildRegistryBlock,
  detectTargetProfile,
  normalizeTargetProfile,
  renderAgentsMarkdown,
  replaceRegistryBlock,
} = require("../lib/agents-md");

describe("agents-md", () => {
  it("normalizes target profile aliases", () => {
    assert.equal(normalizeTargetProfile("opencode"), "opencode");
    assert.equal(normalizeTargetProfile("codex"), "opencode");
    assert.equal(normalizeTargetProfile("all"), "hybrid");
    assert.equal(normalizeTargetProfile("unknown-value"), "antigravity");
  });

  it("builds marker-wrapped registry block", () => {
    const block = buildRegistryBlock([
      {
        name: "architect",
        description: "Architecture specialist",
        triggers: ["architecture", "design"],
      },
    ]);

    assert.ok(block.includes(REGISTRY_START));
    assert.ok(block.includes(REGISTRY_END));
    assert.ok(block.includes("| architect | Architecture specialist |"));
  });

  it("replaces registry block inside AGENTS content", () => {
    const original = [
      "# AGENTS.md",
      "",
      REGISTRY_START,
      "old block",
      REGISTRY_END,
      "",
      "footer",
    ].join("\n");

    const replacement = [REGISTRY_START, "new block", REGISTRY_END].join("\n");
    const updated = replaceRegistryBlock(original, replacement);

    assert.ok(updated);
    assert.ok(updated.includes("new block"));
    assert.ok(!updated.includes("old block"));
  });

  it("renders target/model-aware AGENTS markdown", async () => {
    const rendered = await renderAgentsMarkdown({
      projectDir: path.join(process.cwd(), "tmp-project"),
      agents: [
        {
          name: "reviewer",
          description: "Code review specialist",
          triggers: ["review"],
        },
      ],
      targetProfile: "opencode",
      modelProfile: "codex",
    });

    assert.ok(rendered.includes("Target profile: `opencode`"));
    assert.ok(rendered.includes("Model profile: `codex`"));
    assert.ok(rendered.includes("### OpenCode Runtime"));
    assert.ok(rendered.includes("### Codex Model Profile"));
    assert.ok(rendered.includes(REGISTRY_START));
  });

  it("detects target profile from project structure", async () => {
    const tmpDir = path.join(os.tmpdir(), `agk-target-detect-${Date.now()}`);
    await fs.ensureDir(path.join(tmpDir, ".opencode", "commands"));

    const opencodeOnly = await detectTargetProfile(tmpDir);
    assert.equal(opencodeOnly, "opencode");

    await fs.ensureDir(path.join(tmpDir, ".agent", "workflows"));
    const hybrid = await detectTargetProfile(tmpDir);
    assert.equal(hybrid, "hybrid");

    await fs.remove(tmpDir);
  });
});
