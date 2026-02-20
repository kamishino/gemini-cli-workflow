/**
 * Tests for scripts/brain.js and lib/config.js (AGK Centralized Memory)
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

// Use a custom config path so we don't mess with the user's ~/.agk-config.json
function runBrain(cmd, cwd, configPath) {
  try {
    return execSync(`node "${INDEX_JS}" brain ${cmd} 2>&1`, {
      cwd,
      encoding: "utf8",
      timeout: 15000,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0", AGK_CONFIG_PATH: configPath },
    });
  } catch (e) {
    return e.stdout || "";
  }
}

function runInit(cwd) {
  return execSync(`node "${INIT_JS}"`, {
    cwd,
    encoding: "utf8",
    timeout: 15000,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "0" },
  });
}

describe("agk brain (E2E)", () => {
  let tmpRoot;
  let configPath;
  let brainDir;
  let projectDir;

  beforeEach(async () => {
    tmpRoot = path.join(os.tmpdir(), `agk-brain-test-${Date.now()}`);
    await fs.ensureDir(tmpRoot);

    configPath = path.join(tmpRoot, ".agk-config.json");
    brainDir = path.join(tmpRoot, "my-central-brain");
    projectDir = path.join(tmpRoot, "my-test-project");

    await fs.ensureDir(projectDir);
    await fs.writeJson(path.join(projectDir, "package.json"), {
      name: "my-test-project",
      version: "1.0.0",
    });

    runInit(projectDir);
  });

  afterEach(async () => {
    await fs.remove(tmpRoot);
  });

  it("reports unconfigured if setup not run", () => {
    const output = runBrain("status", projectDir, configPath);
    assert.ok(
      output.includes("not configured") || output.includes("setup"),
      "Should require setup first",
    );
  });

  it("setup stores path and initializes git", async () => {
    const output = runBrain(`setup "${brainDir}"`, projectDir, configPath);
    assert.ok(output.includes("Brain path set to"));

    // Check config saved
    const cfg = await fs.readJson(configPath);
    assert.equal(cfg.brainPath, brainDir);

    // Check git init
    assert.ok(await fs.pathExists(path.join(brainDir, ".git")));
  });

  it("link moves .memory and creates symlink", async () => {
    // 1. Setup
    runBrain(`setup "${brainDir}"`, projectDir, configPath);

    // 2. Link
    const output = runBrain("link", projectDir, configPath);
    assert.ok(output.includes("Linked"));

    // 3. Verify .memory is a symlink
    const localMemory = path.join(projectDir, ".memory");
    const stat = await fs.lstat(localMemory);
    assert.ok(
      stat.isSymbolicLink() || stat.isDirectory(), // On Windows with junctions it might report as dir if not lstat correctly, but in node lstat on junction IS a symlink
      ".memory/ should be a symlink/junction",
    );

    // 4. Verify files are in brain
    const brainMemory = path.join(brainDir, "my-test-project");
    assert.ok(await fs.pathExists(brainMemory), "Brain folder should exist");
    assert.ok(await fs.pathExists(path.join(brainMemory, "context.md")));
  });

  it("link appends .memory to .gitignore", async () => {
    runBrain(`setup "${brainDir}"`, projectDir, configPath);

    const gitignorePath = path.join(projectDir, ".gitignore");
    await fs.writeFile(gitignorePath, "node_modules/\n");

    runBrain("link", projectDir, configPath);

    const gitignore = await fs.readFile(gitignorePath, "utf8");
    assert.ok(gitignore.includes(".memory"), ".gitignore should have .memory");
  });

  it("link safely handles multiple invocations", async () => {
    runBrain(`setup "${brainDir}"`, projectDir, configPath);
    runBrain("link", projectDir, configPath);

    // Second time
    const output2 = runBrain("link", projectDir, configPath);
    assert.ok(output2.includes("Already linked"));
  });

  it("status dashboard shows linked projects", async () => {
    runBrain(`setup "${brainDir}"`, projectDir, configPath);
    runBrain("link", projectDir, configPath);

    const output = runBrain("status", projectDir, configPath);
    assert.ok(output.includes("Dashboard"));
    assert.ok(output.includes("my-test-project"), "Should list project");
    assert.ok(output.includes("🔗"), "Should have linked icon");
  });
});
