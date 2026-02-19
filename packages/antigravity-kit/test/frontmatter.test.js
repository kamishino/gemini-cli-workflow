/**
 * Unit tests for lib/frontmatter.js
 *
 * Uses Node.js built-in test runner (node --test)
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  parseFrontmatter,
  detectTriggerConflicts,
  detectOwnershipOverlaps,
} = require("../lib/frontmatter");

// ── parseFrontmatter ──────────────────────────────────

describe("parseFrontmatter", () => {
  it("parses name, triggers, and owns from valid frontmatter", () => {
    const content = `---
name: architect
description: Software architecture specialist
triggers:
  [
    architecture,
    design,
    refactor,
  ]
owns:
  - .memory/decisions.md
  - .memory/patterns.md
---

# Architect Agent
`;
    const result = parseFrontmatter(content);
    assert.ok(result);
    assert.equal(result.name, "architect");
    assert.equal(result.description, "Software architecture specialist");
    assert.deepEqual(result.triggers, ["architecture", "design", "refactor"]);
    assert.deepEqual(result.owns, [
      ".memory/decisions.md",
      ".memory/patterns.md",
    ]);
  });

  it("returns null for content without frontmatter", () => {
    const result = parseFrontmatter("# Just a regular markdown file");
    assert.equal(result, null);
  });

  it("handles frontmatter without owns field", () => {
    const content = `---
name: reviewer
triggers: [review, PR]
---

# Reviewer
`;
    const result = parseFrontmatter(content);
    assert.ok(result);
    assert.equal(result.name, "reviewer");
    assert.deepEqual(result.triggers, ["review", "PR"]);
    assert.deepEqual(result.owns, []);
  });

  it("handles frontmatter without triggers field", () => {
    const content = `---
name: custom
description: Custom agent
---

# Custom
`;
    const result = parseFrontmatter(content);
    assert.ok(result);
    assert.equal(result.name, "custom");
    assert.deepEqual(result.triggers, []);
    assert.deepEqual(result.owns, []);
  });

  it("handles Windows-style CRLF line endings", () => {
    const content =
      "---\r\nname: test\r\ntriggers: [bug, error]\r\nowns:\r\n  - .memory/anti-patterns.md\r\n---\r\n\r\n# Test";
    const result = parseFrontmatter(content);
    assert.ok(result);
    assert.equal(result.name, "test");
    assert.deepEqual(result.triggers, ["bug", "error"]);
    assert.deepEqual(result.owns, [".memory/anti-patterns.md"]);
  });

  it("handles single-item triggers array", () => {
    const content = `---
name: solo
triggers: [debug]
---
`;
    const result = parseFrontmatter(content);
    assert.ok(result);
    assert.deepEqual(result.triggers, ["debug"]);
  });
});

// ── detectTriggerConflicts ────────────────────────────

describe("detectTriggerConflicts", () => {
  it("returns empty array when no conflicts exist", () => {
    const agents = [
      { file: "a.md", triggers: ["design", "architecture"] },
      { file: "b.md", triggers: ["bug", "error"] },
    ];
    assert.deepEqual(detectTriggerConflicts(agents), []);
  });

  it("detects shared trigger keywords", () => {
    const agents = [
      { file: "a.md", triggers: ["fix", "repair"] },
      { file: "b.md", triggers: ["fix", "debug"] },
    ];
    const conflicts = detectTriggerConflicts(agents);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].keyword, "fix");
    assert.deepEqual(conflicts[0].owners, ["a.md", "b.md"]);
  });

  it("is case-insensitive", () => {
    const agents = [
      { file: "a.md", triggers: ["Design"] },
      { file: "b.md", triggers: ["design"] },
    ];
    const conflicts = detectTriggerConflicts(agents);
    assert.equal(conflicts.length, 1);
  });

  it("handles agents with no triggers", () => {
    const agents = [
      { file: "a.md", triggers: [] },
      { file: "b.md", triggers: ["debug"] },
    ];
    assert.deepEqual(detectTriggerConflicts(agents), []);
  });
});

// ── detectOwnershipOverlaps ───────────────────────────

describe("detectOwnershipOverlaps", () => {
  it("returns empty array when no overlaps exist", () => {
    const agents = [
      { file: "a.md", owns: [".memory/decisions.md"] },
      { file: "b.md", owns: [".memory/anti-patterns.md"] },
    ];
    assert.deepEqual(detectOwnershipOverlaps(agents), []);
  });

  it("detects shared file ownership", () => {
    const agents = [
      { file: "a.md", owns: [".memory/decisions.md"] },
      { file: "b.md", owns: [".memory/decisions.md", ".memory/context.md"] },
    ];
    const overlaps = detectOwnershipOverlaps(agents);
    assert.equal(overlaps.length, 1);
    assert.equal(overlaps[0].file, ".memory/decisions.md");
    assert.deepEqual(overlaps[0].owners, ["a.md", "b.md"]);
  });

  it("handles agents with no owns field", () => {
    const agents = [
      { file: "a.md", owns: [] },
      { file: "b.md", owns: [".memory/decisions.md"] },
    ];
    assert.deepEqual(detectOwnershipOverlaps(agents), []);
  });
});
