/**
 * Tests for lib/agent-runtime.js and new v1.6.0 scripts
 *
 * Uses Node.js built-in test runner (node --test)
 */

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { scoreAgent, suggest } = require("../lib/agent-runtime");
const AGK_ROOT = path.resolve(__dirname, "..");
const INDEX_JS = path.join(AGK_ROOT, "bin", "index.js");
const INIT_JS = path.join(AGK_ROOT, "bin", "init.js");

function runCli(cmd, cwd) {
  try {
    return execSync(`node "${INDEX_JS}" ${cmd}`, {
      cwd,
      encoding: "utf8",
      timeout: 15000,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0" },
    });
  } catch (e) {
    return e.stdout || "";
  }
}

// ── scoreAgent unit tests ─────────────────────────────

describe("scoreAgent", () => {
  it("scores exact trigger match highest", () => {
    const agent = { triggers: ["debug", "error"], owns: [] };
    const score = scoreAgent(agent, ["debug"]);
    assert.ok(score >= 10, `Expected >=10, got ${score}`);
  });

  it("scores partial trigger match lower", () => {
    const agent = { triggers: ["architecture"], owns: [] };
    const exact = scoreAgent(agent, ["architecture"]);
    const partial = scoreAgent(agent, ["arch"]);
    assert.ok(exact > partial, "Exact should score higher than partial");
  });

  it("returns 0 for no matches", () => {
    const agent = { triggers: ["debug"], name: "debugger", owns: [] };
    const score = scoreAgent(agent, ["deploy", "release"]);
    assert.equal(score, 0);
  });

  it("scores name match", () => {
    const agent = {
      triggers: ["unknown"],
      name: "debugger",
      description: "",
      owns: [],
    };
    const score = scoreAgent(agent, ["debugger"]);
    assert.ok(score >= 8, `Name match should score >=8, got ${score}`);
  });

  it("scores ownership match", () => {
    const agent = {
      triggers: [],
      name: "planner",
      owns: [".memory/decisions.md"],
    };
    const score = scoreAgent(agent, ["decisions"]);
    assert.ok(score > 0, "Ownership match should score > 0");
  });
});

// ── suggest integration tests ─────────────────────────

describe("suggest (integration)", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `agk-suggest-test-${Date.now()}`);
    const agentsDir = path.join(tmpDir, ".agent", "agents");
    await fs.ensureDir(agentsDir);

    await fs.writeFile(
      path.join(agentsDir, "debugger.md"),
      `---
name: debugger
description: Bug hunting and error analysis specialist
triggers: [bug, error, crash, failing, debug]
owns:
  - .memory/anti-patterns.md
---
# Debugger
`,
    );

    await fs.writeFile(
      path.join(agentsDir, "architect.md"),
      `---
name: architect
description: Software architecture and design specialist
triggers: [architecture, design, refactor, structure]
owns:
  - .memory/decisions.md
  - .memory/patterns.md
---
# Architect
`,
    );
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("suggests debugger for bug-related queries", async () => {
    const agentsDir = path.join(tmpDir, ".agent", "agents");
    const results = await suggest(agentsDir, "There is a bug in the login");
    assert.ok(results.length > 0, "Should find matching agents");
    assert.equal(results[0].agent.name, "debugger");
  });

  it("suggests architect for design queries", async () => {
    const agentsDir = path.join(tmpDir, ".agent", "agents");
    const results = await suggest(agentsDir, "refactor the architecture");
    assert.ok(results.length > 0);
    assert.equal(results[0].agent.name, "architect");
  });

  it("returns empty for unrelated queries", async () => {
    const agentsDir = path.join(tmpDir, ".agent", "agents");
    const results = await suggest(agentsDir, "hello world");
    assert.equal(results.length, 0);
  });
});

// ── agk diff E2E ──────────────────────────────────────

describe("agk diff (E2E)", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `agk-diff-test-${Date.now()}`);
    await fs.ensureDir(tmpDir);
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "test-project",
      version: "1.0.0",
    });
    try {
      execSync(`node "${INIT_JS}"`, {
        cwd: tmpDir,
        encoding: "utf8",
        timeout: 15000,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, FORCE_COLOR: "0" },
      });
    } catch {
      // ignore stderr
    }
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("shows identical status for fresh install", () => {
    const output = runCli("diff", tmpDir);
    assert.ok(
      output.includes("identical"),
      "Fresh install should show identical files",
    );
  });

  it("detects modified files", async () => {
    // Modify a workflow
    const wfDir = path.join(tmpDir, ".agent", "workflows");
    const files = await fs.readdir(wfDir);
    if (files.length > 0) {
      await fs.appendFile(
        path.join(wfDir, files[0]),
        "\n\n# Custom addition\n",
      );
    }
    const output = runCli("diff", tmpDir);
    assert.ok(output.includes("modified"), "Should detect modified file");
  });

  it("detects missing files", async () => {
    const wfDir = path.join(tmpDir, ".agent", "workflows");
    const files = await fs.readdir(wfDir);
    if (files.length > 0) {
      await fs.remove(path.join(wfDir, files[0]));
    }
    const output = runCli("diff", tmpDir);
    assert.ok(output.includes("missing"), "Should detect missing file");
  });

  it("supports --json output", () => {
    const output = runCli("diff --json", tmpDir);
    assert.doesNotThrow(() => JSON.parse(output), "Should output valid JSON");
  });
});

// ── agk memory stats E2E ──────────────────────────────

describe("agk memory stats (E2E)", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `agk-memstats-test-${Date.now()}`);
    await fs.ensureDir(tmpDir);
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "test-project",
      version: "1.0.0",
    });
    try {
      execSync(`node "${INIT_JS}"`, {
        cwd: tmpDir,
        encoding: "utf8",
        timeout: 15000,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, FORCE_COLOR: "0" },
      });
    } catch {
      // ignore stderr
    }
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("shows stats for all memory files", () => {
    const output = runCli("memory stats", tmpDir);
    assert.ok(output.includes("context.md"));
    assert.ok(output.includes("patterns.md"));
    assert.ok(output.includes("decisions.md"));
    assert.ok(output.includes("anti-patterns.md"));
  });

  it("shows Total line with word and line counts", () => {
    const output = runCli("memory stats", tmpDir);
    assert.ok(output.includes("Total:"), "Should show total summary");
    assert.ok(output.includes("lines"), "Should mention line count");
    assert.ok(output.includes("words"), "Should mention word count");
  });

  it("reports error when .memory/ missing", async () => {
    const emptyDir = path.join(os.tmpdir(), `agk-memstats-empty-${Date.now()}`);
    await fs.ensureDir(emptyDir);
    const output = runCli("memory stats", emptyDir);
    assert.ok(
      output.includes("not found") || output.includes("agk init"),
      "Should report missing memory dir",
    );
    await fs.remove(emptyDir);
  });
});
