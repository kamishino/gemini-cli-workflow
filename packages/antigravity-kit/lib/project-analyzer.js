/**
 * lib/project-analyzer.js — Deep project analysis for smart suite suggestions
 *
 * Scans: package.json deps, directory structure, file patterns, config files.
 * Produces a scored recommendation of which suites best fit the project.
 */

const fs = require("fs-extra");
const path = require("path");

// Signal weights — higher weight = stronger indicator
const SIGNAL_WEIGHTS = {
  dependency: 3, // package.json / pyproject.toml dependency
  configFile: 2, // config file exists (next.config.js, tsconfig.json)
  directory: 1, // directory pattern (src/app, prisma/)
  filePattern: 1, // file extension pattern (*.py, *.tsx)
};

// Dependency → suite mapping (high-confidence signals)
const DEP_SIGNALS = {
  // React / Next.js
  next: ["react", "fullstack"],
  react: ["react"],
  "react-native": ["mobile"],
  expo: ["mobile"],
  vue: [],
  nuxt: [],
  // Database
  prisma: ["fullstack", "backend"],
  "@prisma/client": ["fullstack", "backend"],
  mongoose: ["backend"],
  sequelize: ["backend"],
  typeorm: ["backend"],
  knex: ["backend"],
  // Backend
  express: ["backend"],
  fastify: ["backend"],
  koa: ["backend"],
  hono: ["backend"],
  // Testing
  jest: ["react", "fullstack", "backend", "cli"],
  vitest: ["react", "fullstack"],
  mocha: ["backend", "cli"],
  // Python (from pyproject.toml)
  django: ["python"],
  flask: ["python"],
  fastapi: ["python"],
  pytest: ["python"],
  // CLI
  commander: ["cli"],
  yargs: ["cli"],
  meow: ["cli"],
  inquirer: ["cli"],
  // DevOps markers
  "docker-compose": ["devops"],
};

// Config file → suite mapping
const CONFIG_SIGNALS = {
  "next.config.js": ["react", "fullstack"],
  "next.config.mjs": ["react", "fullstack"],
  "next.config.ts": ["react", "fullstack"],
  "prisma/schema.prisma": ["fullstack", "backend"],
  Dockerfile: ["devops"],
  "docker-compose.yml": ["devops"],
  "docker-compose.yaml": ["devops"],
  ".github/workflows": ["devops"],
  "tsconfig.json": ["react", "fullstack", "backend"],
  "app.json": ["mobile"],
  "app.config.js": ["mobile"],
  "app.config.ts": ["mobile"],
  "pyproject.toml": ["python"],
  "setup.py": ["python"],
  "requirements.txt": ["python"],
  Pipfile: ["python"],
  "poetry.lock": ["python"],
  ".terraform": ["devops"],
  "ansible.cfg": ["devops"],
  "k8s/": ["devops"],
  "kubernetes/": ["devops"],
};

// Directory patterns → suite mapping
const DIR_SIGNALS = {
  "src/app": ["react", "fullstack"],
  "src/pages": ["react", "fullstack"],
  "src/components": ["react", "fullstack", "mobile"],
  "src/screens": ["mobile"],
  "src/routes": ["backend"],
  "src/api": ["backend"],
  "src/controllers": ["backend"],
  "src/models": ["backend"],
  "bin/": ["cli"],
  "scripts/": ["cli"],
  "ios/": ["mobile"],
  "android/": ["mobile"],
  "infra/": ["devops"],
  "deploy/": ["devops"],
};

/**
 * Analyze a project and return scored suite recommendations.
 *
 * @param {string} projectDir - Path to project root
 * @returns {Promise<{signals: Object[], scores: Object[], recommendations: Object[]}>}
 */
async function analyzeProject(projectDir) {
  const signals = [];
  const suiteScores = {};

  // 1. Scan package.json dependencies
  const pkgPath = path.join(projectDir, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    for (const [dep, suites] of Object.entries(DEP_SIGNALS)) {
      if (allDeps[dep]) {
        signals.push({
          type: "dependency",
          source: `package.json → ${dep}`,
          suites,
          weight: SIGNAL_WEIGHTS.dependency,
        });
        for (const suite of suites) {
          suiteScores[suite] =
            (suiteScores[suite] || 0) + SIGNAL_WEIGHTS.dependency;
        }
      }
    }
  }

  // 2. Scan pyproject.toml dependencies (basic parser)
  const pyprojectPath = path.join(projectDir, "pyproject.toml");
  if (await fs.pathExists(pyprojectPath)) {
    const content = await fs.readFile(pyprojectPath, "utf8");
    for (const [dep, suites] of Object.entries(DEP_SIGNALS)) {
      if (content.includes(dep)) {
        signals.push({
          type: "dependency",
          source: `pyproject.toml → ${dep}`,
          suites,
          weight: SIGNAL_WEIGHTS.dependency,
        });
        for (const suite of suites) {
          suiteScores[suite] =
            (suiteScores[suite] || 0) + SIGNAL_WEIGHTS.dependency;
        }
      }
    }
  }

  // 3. Scan config files
  for (const [configFile, suites] of Object.entries(CONFIG_SIGNALS)) {
    const fullPath = path.join(projectDir, configFile);
    if (await fs.pathExists(fullPath)) {
      signals.push({
        type: "configFile",
        source: configFile,
        suites,
        weight: SIGNAL_WEIGHTS.configFile,
      });
      for (const suite of suites) {
        suiteScores[suite] =
          (suiteScores[suite] || 0) + SIGNAL_WEIGHTS.configFile;
      }
    }
  }

  // 4. Scan directory patterns
  for (const [dir, suites] of Object.entries(DIR_SIGNALS)) {
    const fullPath = path.join(projectDir, dir);
    if (await fs.pathExists(fullPath)) {
      signals.push({
        type: "directory",
        source: `${dir}/`,
        suites,
        weight: SIGNAL_WEIGHTS.directory,
      });
      for (const suite of suites) {
        suiteScores[suite] =
          (suiteScores[suite] || 0) + SIGNAL_WEIGHTS.directory;
      }
    }
  }

  // 5. Calculate confidence percentages
  const maxPossibleScore = Math.max(...Object.values(suiteScores), 1);
  const scores = Object.entries(suiteScores)
    .map(([suite, score]) => ({
      suite,
      score,
      confidence: Math.min(Math.round((score / maxPossibleScore) * 100), 100),
    }))
    .sort((a, b) => b.score - a.score);

  // 6. Build recommendations (multi-suite, filter subsets)
  const recommendations = buildRecommendations(scores);

  return { signals, scores, recommendations };
}

/**
 * Build smart recommendations — exclude suites that are subsets of higher-ranked ones,
 * but include complementary suites.
 */
function buildRecommendations(scores) {
  if (scores.length === 0) return [];

  // Suite overlap groups — suites that overlap heavily
  const OVERLAPS = {
    react: ["fullstack"], // React is a subset of Fullstack
  };

  const recommendations = [];
  const installed = new Set();

  for (const entry of scores) {
    // Skip if confidence too low
    if (entry.confidence < 30) continue;

    // Skip if this suite overlaps with an already-recommended higher-scored suite
    const overlappedBy = Object.entries(OVERLAPS).find(
      ([subset, parents]) =>
        entry.suite === subset && parents.some((p) => installed.has(p)),
    );

    if (overlappedBy) {
      recommendations.push({
        ...entry,
        status: "skipped",
        reason: `subset of ${overlappedBy[1].find((p) => installed.has(p))}`,
      });
      continue;
    }

    recommendations.push({
      ...entry,
      status: "recommended",
    });
    installed.add(entry.suite);
  }

  return recommendations;
}

module.exports = { analyzeProject, SIGNAL_WEIGHTS };
