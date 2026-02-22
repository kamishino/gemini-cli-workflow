/**
 * Tests for scripts/scaffold.js (AGK Scaffold)
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

function runScaffold(args, cwd) {
  try {
    return execSync(`node "${INDEX_JS}" scaffold ${args} 2>&1`, {
      cwd,
      encoding: "utf8",
      timeout: 10000,
      env: { ...process.env, FORCE_COLOR: "0" },
    });
  } catch (e) {
    return e.stdout || "";
  }
}

describe("agk scaffold (E2E)", () => {
  let tmpRoot;

  beforeEach(async () => {
    tmpRoot = path.join(os.tmpdir(), `agk-scaffold-test-${Date.now()}`);
    await fs.ensureDir(tmpRoot);

    // Give it a generic package.json to behave like a normal project
    await fs.writeJson(path.join(tmpRoot, "package.json"), {
      name: "my-scaffold-test",
      version: "1.0.0",
    });

    // Run init to create directories
    execSync(`node "${INIT_JS}"`, {
      cwd: tmpRoot,
      encoding: "utf8",
      stdio: "ignore",
    });
  });

  afterEach(async () => {
    await fs.remove(tmpRoot);
  });

  it("requires arguments", () => {
    const output = runScaffold("", tmpRoot);
    assert.ok(output.includes("Missing arguments"));
  });

  it("fails on invalid type", () => {
    const output = runScaffold(`magic "Super Magic"`, tmpRoot);
    assert.ok(output.includes("Unknown scaffold type"));
  });

  it("scaffolds an agent and slugifies the name", async () => {
    const output = runScaffold(
      `agent "Data Pipeline Expert" "ETL Master"`,
      tmpRoot,
    );
    assert.ok(
      output.includes("Created agent"),
      "Output should indicate success",
    );

    const expectedFile = path.join(
      tmpRoot,
      ".agent",
      "agents",
      "data-pipeline-expert.md",
    );
    assert.ok(await fs.pathExists(expectedFile), "File should be created");

    const content = await fs.readFile(expectedFile, "utf8");
    assert.ok(
      content.includes("name: Data Pipeline Expert"),
      "Frontmatter name",
    );
    assert.ok(content.includes("description: ETL Master"), "Frontmatter desc");
    assert.ok(
      content.includes("You are the Data Pipeline Expert"),
      "Identity block",
    );
  });

  it("scaffolds a workflow", async () => {
    const output = runScaffold(
      `workflow "Deploy App" "Steps to deploy to AWS"`,
      tmpRoot,
    );
    assert.ok(output.includes("Created workflow"));

    const expectedFile = path.join(
      tmpRoot,
      ".agent",
      "workflows",
      "deploy-app.md",
    );
    assert.ok(await fs.pathExists(expectedFile));

    const content = await fs.readFile(expectedFile, "utf8");
    assert.ok(content.includes("description: Steps to deploy to AWS"));
    assert.ok(content.includes("# Deploy App"));
  });

  it("scaffolds a rule", async () => {
    const output = runScaffold(
      `rule "No Any" "Avoid typescript any type"`,
      tmpRoot,
    );
    assert.ok(output.includes("Created rule"));

    const expectedFile = path.join(tmpRoot, ".gemini", "rules", "no-any.md");
    assert.ok(await fs.pathExists(expectedFile));

    const content = await fs.readFile(expectedFile, "utf8");
    assert.ok(content.includes("# No Any"));
    assert.ok(content.includes("> Avoid typescript any type"));
  });

  it("prevents overwriting an existing agent", async () => {
    // Generate first
    runScaffold(`agent "Tester"`, tmpRoot);

    // Generate second with same name
    const output2 = runScaffold(`agent "Tester"`, tmpRoot);
    assert.ok(output2.includes("already exists"));
  });

  it("slugifies complex names safely", async () => {
    runScaffold(`agent "  Sr. C++ & Rust _ Developer! "`, tmpRoot);

    // special characters removed, spaces become hyphens, leading/trailing trimmed.
    const expectedFile = path.join(
      tmpRoot,
      ".agent",
      "agents",
      "sr-c-rust-_-developer.md",
    );
    assert.ok(await fs.pathExists(expectedFile));
  });
});
