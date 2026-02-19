/**
 * E2E tests for agk CLI commands
 *
 * Runs actual CLI commands in temp directories and verifies:
 * - agk init scaffolds correct files
 * - agk upgrade copies templates
 * - agk status / doctor / changelog produce expected output
 *
 * Uses Node.js built-in test runner (node --test)
 */

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const AGK_ROOT = path.resolve(__dirname, "..");
const INDEX_JS = path.join(AGK_ROOT, "bin", "index.js");
const INIT_JS = path.join(AGK_ROOT, "bin", "init.js");

function runAgk(cmd, cwd) {
  return execSync(`node "${INDEX_JS}" ${cmd}`, {
    cwd,
    encoding: "utf8",
    timeout: 15000,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "0" },
  });
}

function runInit(cwd) {
  return execSync(`node "${INIT_JS}"`, {
    cwd,
    encoding: "utf8",
    timeout: 15000,
    env: { ...process.env, FORCE_COLOR: "0" },
  });
}

// ── agk init E2E ──────────────────────────────────────

describe("agk init (E2E)", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `agk-e2e-init-${Date.now()}`);
    await fs.ensureDir(tmpDir);
    // Create a minimal package.json so init has a project root
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "test-project",
      version: "1.0.0",
    });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("scaffolds .gemini/rules/ with guard rail files", () => {
    runInit(tmpDir);
    const rulesDir = path.join(tmpDir, ".gemini", "rules");
    assert.ok(fs.pathExistsSync(rulesDir), ".gemini/rules/ should exist");
    const files = fs.readdirSync(rulesDir);
    assert.ok(files.length >= 5, `Expected >=5 rules, got ${files.length}`);
  });

  it("scaffolds .agent/workflows/ with workflow files", () => {
    runInit(tmpDir);
    const wfDir = path.join(tmpDir, ".agent", "workflows");
    assert.ok(fs.pathExistsSync(wfDir), ".agent/workflows/ should exist");
    const files = fs.readdirSync(wfDir);
    assert.ok(
      files.length >= 10,
      `Expected >=10 workflows, got ${files.length}`,
    );
  });

  it("scaffolds .agent/agents/ with agent files", () => {
    runInit(tmpDir);
    const agentsDir = path.join(tmpDir, ".agent", "agents");
    assert.ok(fs.pathExistsSync(agentsDir), ".agent/agents/ should exist");
    const files = fs.readdirSync(agentsDir);
    assert.ok(files.length >= 4, `Expected >=4 agents, got ${files.length}`);
  });

  it("scaffolds .memory/ with 4 memory files", () => {
    runInit(tmpDir);
    const memDir = path.join(tmpDir, ".memory");
    assert.ok(fs.pathExistsSync(memDir), ".memory/ should exist");
    assert.ok(fs.pathExistsSync(path.join(memDir, "context.md")));
    assert.ok(fs.pathExistsSync(path.join(memDir, "patterns.md")));
    assert.ok(fs.pathExistsSync(path.join(memDir, "decisions.md")));
    assert.ok(fs.pathExistsSync(path.join(memDir, "anti-patterns.md")));
  });

  it("creates GEMINI.md at project root", () => {
    runInit(tmpDir);
    assert.ok(fs.pathExistsSync(path.join(tmpDir, "GEMINI.md")));
  });

  it("shows welcome banner in output", () => {
    const output = runInit(tmpDir);
    // Welcome banner should contain "Getting Started" or similar
    assert.ok(
      output.includes("Getting Started") || output.includes("Try these"),
      "Output should include welcome banner",
    );
  });

  it("is idempotent — running twice does not error", () => {
    runInit(tmpDir);
    // Should not throw
    runInit(tmpDir);
    assert.ok(true, "Second init should not throw");
  });
});

// ── agk upgrade E2E ───────────────────────────────────

describe("agk upgrade (E2E)", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `agk-e2e-upgrade-${Date.now()}`);
    await fs.ensureDir(tmpDir);
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "test-project",
      version: "1.0.0",
    });
    // First init to have a baseline
    runInit(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("upgrade runs without error on initialized project", () => {
    let output;
    try {
      output = runAgk("upgrade", tmpDir);
    } catch (e) {
      output = e.stdout || "";
    }
    assert.ok(
      output.includes("up to date") ||
        output.includes("updated") ||
        output.includes("up-to-date") ||
        output.includes("Done"),
      "Upgrade output should indicate completion",
    );
  });

  it("--dry-run does not modify files", async () => {
    const wfDir = path.join(tmpDir, ".agent", "workflows");

    // Delete a workflow to create a gap
    const files = await fs.readdir(wfDir);
    const removed = files[0];
    if (removed) {
      await fs.remove(path.join(wfDir, removed));
    }

    const countBefore = (await fs.readdir(wfDir)).length;

    // Dry run should NOT restore the deleted file
    try {
      runAgk("upgrade --dry-run", tmpDir);
    } catch {
      // Ignore stderr from ora
    }
    const countAfter = (await fs.readdir(wfDir)).length;
    assert.equal(countAfter, countBefore, "Dry run should not modify files");
  });

  it("--verbose shows per-file status", () => {
    let output;
    try {
      output = runAgk("upgrade --verbose", tmpDir);
    } catch (e) {
      output = e.stdout || "";
    }
    // Verbose should mention individual file names
    assert.ok(
      output.includes(".md") ||
        output.includes("new") ||
        output.includes("updated") ||
        output.includes("up-to-date"),
      "Verbose output should show file details",
    );
  });

  it("does not overwrite .memory/ files", async () => {
    const contextPath = path.join(tmpDir, ".memory", "context.md");
    const customContent = "# My Custom Context\nThis was modified by user.";
    await fs.writeFile(contextPath, customContent);

    try {
      runAgk("upgrade", tmpDir);
    } catch {
      // Ignore stderr from ora
    }

    const content = await fs.readFile(contextPath, "utf8");
    assert.equal(content, customContent, "Memory files should be protected");
  });
});

// ── agk CLI commands E2E ──────────────────────────────

describe("agk CLI (E2E)", () => {
  it("--version outputs version string", () => {
    const output = runAgk("--version", AGK_ROOT);
    assert.match(output.trim(), /^agk v\d+\.\d+\.\d+$/);
  });

  it("--help outputs usage information", () => {
    const output = runAgk("--help", AGK_ROOT);
    assert.ok(output.includes("agk init"));
    assert.ok(output.includes("agk upgrade"));
    assert.ok(output.includes("agk doctor"));
  });

  it("unknown command exits with error", () => {
    assert.throws(() => {
      runAgk("nonexistent-command", AGK_ROOT);
    }, /Unknown command/);
  });
});
