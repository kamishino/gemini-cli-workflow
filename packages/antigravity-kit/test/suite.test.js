/**
 * Tests for project-analyzer and suite system
 */

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const { analyzeProject } = require("../lib/project-analyzer");

// Create a temp project for testing
async function createTempProject(structure = {}) {
  const tmpDir = path.join(
    os.tmpdir(),
    `agk-suite-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  await fs.ensureDir(tmpDir);

  // Write package.json if deps specified
  if (structure.deps) {
    await fs.writeJson(
      path.join(tmpDir, "package.json"),
      {
        name: "test-project",
        dependencies: structure.deps,
        devDependencies: structure.devDeps || {},
      },
      { spaces: 2 },
    );
  }

  // Create config files
  for (const file of structure.files || []) {
    const filePath = path.join(tmpDir, file);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, "# placeholder", "utf8");
  }

  // Create directories
  for (const dir of structure.dirs || []) {
    await fs.ensureDir(path.join(tmpDir, dir));
  }

  return tmpDir;
}

describe("project-analyzer", () => {
  it("detects Next.js + Prisma → fullstack suite", async () => {
    const tmpDir = await createTempProject({
      deps: { next: "14.0.0", react: "18.0.0", "@prisma/client": "5.0.0" },
      files: ["next.config.js", "prisma/schema.prisma", "tsconfig.json"],
      dirs: ["src/app"],
    });

    try {
      const { signals, scores, recommendations } = await analyzeProject(tmpDir);

      // Should detect multiple signals
      assert.ok(
        signals.length >= 3,
        `Expected >=3 signals, got ${signals.length}`,
      );

      // Fullstack should score highest
      const fullstackScore = scores.find((s) => s.suite === "fullstack");
      assert.ok(fullstackScore, "Fullstack suite should be scored");
      assert.ok(
        fullstackScore.confidence >= 50,
        "Fullstack confidence should be >= 50%",
      );

      // React should be skipped (subset of fullstack)
      const reactRec = recommendations.find((r) => r.suite === "react");
      if (reactRec) {
        assert.equal(
          reactRec.status,
          "skipped",
          "React should be skipped when fullstack matches",
        );
      }
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it("detects Python project → python suite", async () => {
    const tmpDir = await createTempProject({
      files: ["pyproject.toml", "requirements.txt"],
    });

    // Write pyproject.toml with fastapi dependency
    await fs.writeFile(
      path.join(tmpDir, "pyproject.toml"),
      '[project]\nname = "myapp"\ndependencies = ["fastapi", "pytest"]',
      "utf8",
    );

    try {
      const { scores } = await analyzeProject(tmpDir);
      const pythonScore = scores.find((s) => s.suite === "python");
      assert.ok(pythonScore, "Python suite should be scored");
      assert.ok(
        pythonScore.confidence >= 50,
        "Python confidence should be >= 50%",
      );
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it("detects Docker + CI → devops suite", async () => {
    const tmpDir = await createTempProject({
      files: ["Dockerfile", "docker-compose.yml"],
      dirs: [".github/workflows"],
    });

    try {
      const { scores } = await analyzeProject(tmpDir);
      const devopsScore = scores.find((s) => s.suite === "devops");
      assert.ok(devopsScore, "DevOps suite should be scored");
      assert.equal(
        devopsScore.confidence,
        100,
        "DevOps should be 100% (all config)",
      );
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it("returns empty for bare project", async () => {
    const tmpDir = await createTempProject({});

    try {
      const { signals, scores } = await analyzeProject(tmpDir);
      assert.equal(signals.length, 0, "No signals for bare project");
      assert.equal(scores.length, 0, "No scores for bare project");
    } finally {
      await fs.remove(tmpDir);
    }
  });

  it("detects multi-suite (fullstack + devops)", async () => {
    const tmpDir = await createTempProject({
      deps: { next: "14.0.0", "@prisma/client": "5.0.0" },
      files: [
        "next.config.js",
        "prisma/schema.prisma",
        "Dockerfile",
        "docker-compose.yml",
        "tsconfig.json",
      ],
      dirs: ["src/app", ".github/workflows"],
    });

    try {
      const { recommendations } = await analyzeProject(tmpDir);
      const recommended = recommendations.filter(
        (r) => r.status === "recommended",
      );
      assert.ok(
        recommended.length >= 2,
        `Expected >=2 recommended suites, got ${recommended.length}`,
      );

      const suiteNames = recommended.map((r) => r.suite);
      assert.ok(suiteNames.includes("fullstack"), "Should recommend fullstack");
      assert.ok(suiteNames.includes("devops"), "Should recommend devops");
    } finally {
      await fs.remove(tmpDir);
    }
  });
});

describe("suite add/remove", () => {
  let tmpDir;

  before(async () => {
    tmpDir = await createTempProject({});
    // Create minimal .agent structure
    await fs.ensureDir(path.join(tmpDir, ".agent", "agents"));
    await fs.ensureDir(path.join(tmpDir, ".agent", "workflows"));
    await fs.ensureDir(path.join(tmpDir, ".gemini", "rules"));
    // Create a GEMINI.md with registry markers
    await fs.writeFile(
      path.join(tmpDir, "GEMINI.md"),
      "# GEMINI\n<!-- AGK_AGENT_REGISTRY_START -->\n<!-- AGK_AGENT_REGISTRY_END -->\n",
      "utf8",
    );
  });

  after(async () => {
    await fs.remove(tmpDir);
  });

  it("adds a suite and tracks it", async () => {
    const suite = require("../scripts/suite");
    const code = await suite.run(tmpDir, ["add", "cli"]);
    assert.equal(code, 0, "Suite add should return 0");

    const configPath = path.join(tmpDir, ".agent", "suites.json");
    assert.ok(await fs.pathExists(configPath), "suites.json should exist");

    const config = await fs.readJson(configPath);
    assert.equal(config.installed.length, 1, "Should have 1 installed suite");
    assert.equal(config.installed[0].name, "cli", "Should be cli suite");
  });

  it("removes a suite and cleans up", async () => {
    const suite = require("../scripts/suite");
    const code = await suite.run(tmpDir, ["remove", "cli"]);
    assert.equal(code, 0, "Suite remove should return 0");

    const config = await fs.readJson(
      path.join(tmpDir, ".agent", "suites.json"),
    );
    assert.equal(config.installed.length, 0, "Should have 0 installed suites");
  });

  it("fails to remove non-existent suite", async () => {
    const suite = require("../scripts/suite");
    const code = await suite.run(tmpDir, ["remove", "nonexistent"]);
    assert.equal(code, 1, "Should return 1 for non-existent suite");
  });
});
