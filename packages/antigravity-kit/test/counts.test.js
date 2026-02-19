/**
 * Unit tests for lib/counts.js
 *
 * Uses Node.js built-in test runner (node --test)
 */

const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { relativeTime, MEMORY_FILES } = require("../lib/counts");

// ── relativeTime ──────────────────────────────────────

describe("relativeTime", () => {
  it("returns 'just now' for dates less than 1 minute ago", () => {
    const result = relativeTime(new Date());
    assert.equal(result, "just now");
  });

  it("returns minutes for < 60 min", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    const result = relativeTime(date);
    assert.equal(result, "5m ago");
  });

  it("returns hours for < 24 hours", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const result = relativeTime(date);
    assert.equal(result, "3h ago");
  });

  it("returns 'yesterday' for 1 day ago", () => {
    const date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const result = relativeTime(date);
    assert.equal(result, "yesterday");
  });

  it("returns days for < 7 days", () => {
    const date = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    const result = relativeTime(date);
    assert.equal(result, "4 days ago");
  });

  it("returns ISO date for >= 7 days", () => {
    const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = relativeTime(date);
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });
});

// ── MEMORY_FILES constant ─────────────────────────────

describe("MEMORY_FILES", () => {
  it("contains 4 expected memory files", () => {
    assert.equal(MEMORY_FILES.length, 4);
    assert.ok(MEMORY_FILES.includes("context.md"));
    assert.ok(MEMORY_FILES.includes("patterns.md"));
    assert.ok(MEMORY_FILES.includes("decisions.md"));
    assert.ok(MEMORY_FILES.includes("anti-patterns.md"));
  });
});

// ── Integration: countMdFiles with temp directory ─────

const { countMdFiles } = require("../lib/counts");

describe("countMdFiles", () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = path.join(os.tmpdir(), `agk-test-${Date.now()}`);
    await fs.ensureDir(tmpDir);
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("returns 0 for non-existent directory", async () => {
    const result = await countMdFiles(tmpDir, "nonexistent");
    assert.deepEqual(result, { count: 0, files: [] });
  });

  it("returns 0 for empty directory", async () => {
    await fs.ensureDir(path.join(tmpDir, "empty"));
    const result = await countMdFiles(tmpDir, "empty");
    assert.deepEqual(result, { count: 0, files: [] });
  });

  it("counts only .md files", async () => {
    const sub = path.join(tmpDir, "mixed");
    await fs.ensureDir(sub);
    await fs.writeFile(path.join(sub, "a.md"), "# A");
    await fs.writeFile(path.join(sub, "b.md"), "# B");
    await fs.writeFile(path.join(sub, "c.txt"), "not md");
    await fs.writeFile(path.join(sub, "d.js"), "not md");

    const result = await countMdFiles(tmpDir, "mixed");
    assert.equal(result.count, 2);
    assert.ok(result.files.includes("a.md"));
    assert.ok(result.files.includes("b.md"));
  });
});
