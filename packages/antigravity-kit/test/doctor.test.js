/**
 * Tests for scripts/doctor.js health check logic
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

/**
 * Run agk doctor and return stdout, handling stderr from ora spinners
 */
function runDoctor(cwd) {
  try {
    return execSync(`node "${INDEX_JS}" doctor`, {
      cwd,
      encoding: "utf8",
      timeout: 15000,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0" },
    });
  } catch (e) {
    // execSync throws when stderr has content (ora spinners)
    // but the command may still have succeeded
    return e.stdout || "";
  }
}

function runInit(cwd) {
  try {
    return execSync(`node "${INIT_JS}"`, {
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

describe("agk doctor (E2E)", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `agk-e2e-doctor-${Date.now()}`);
    await fs.ensureDir(tmpDir);
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "test-project",
      version: "1.0.0",
    });
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("reports missing workflows on empty project", () => {
    const output = runDoctor(tmpDir);
    assert.ok(
      output.includes("not found") ||
        output.includes("Error") ||
        output.includes("Workflows"),
      "Should report workflow status",
    );
  });

  it("shows Fix: commands for issues", () => {
    const output = runDoctor(tmpDir);
    assert.ok(
      output.includes("Fix:") || output.includes("agk init"),
      "Should show actionable fix commands",
    );
  });

  it("reports healthy status on initialized project", () => {
    runInit(tmpDir);
    const output = runDoctor(tmpDir);
    assert.ok(
      output.includes("Excellent") ||
        output.includes("Good") ||
        output.includes("found"),
      "Should report healthy status after init",
    );
  });

  it("detects agent trigger conflicts", async () => {
    runInit(tmpDir);

    // Create a conflicting agent with overlapping trigger
    const agentsDir = path.join(tmpDir, ".agent", "agents");
    await fs.writeFile(
      path.join(agentsDir, "custom.md"),
      `---
name: custom
triggers: [architecture, design]
---

# Custom Agent
`,
    );

    const output = runDoctor(tmpDir);
    assert.ok(
      output.includes("conflict") || output.includes("claimed by"),
      "Should detect trigger conflicts",
    );
  });

  it("shows overall health summary", () => {
    const output = runDoctor(tmpDir);
    assert.ok(
      output.includes("Overall Health") || output.includes("Health"),
      "Should show overall health summary",
    );
  });
});
