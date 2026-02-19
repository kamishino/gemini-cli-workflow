/**
 * Unit tests for scripts/changelog.js
 *
 * Uses Node.js built-in test runner (node --test)
 */

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

// We test the splitByVersion logic by requiring the module
// The module exports { run }, but we test via a temp project setup

describe("changelog integration", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `agk-changelog-test-${Date.now()}`);
    await fs.ensureDir(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("returns exit code 1 when no CHANGELOG.md exists", async () => {
    // Suppress console output
    const log = console.log;
    console.log = () => {};
    const changelog = require("../scripts/changelog");
    const code = await changelog.run(tmpDir);
    console.log = log;
    assert.equal(code, 1);
  });

  it("returns exit code 0 when CHANGELOG.md has entries", async () => {
    await fs.writeFile(
      path.join(tmpDir, "CHANGELOG.md"),
      `# Changelog

## [v1.0.0] - 2026-01-01

### Features
- Initial release
`,
    );

    const log = console.log;
    const output = [];
    console.log = (...args) => output.push(args.join(" "));
    const changelog = require("../scripts/changelog");
    const code = await changelog.run(tmpDir);
    console.log = log;

    assert.equal(code, 0);
    // Output should contain version header
    const fullOutput = output.join("\n");
    assert.ok(fullOutput.includes("v1.0.0"));
  });
});
