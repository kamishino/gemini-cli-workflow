#!/usr/bin/env node

/**
 * antigravity-kit init
 *
 * Scaffolds AI guard rails into the current project:
 *   GEMINI.md           — AI system instructions
 *   .gemini/rules/      — 5 portable guard rails
 *   .gemini/skills/     — Core skills (memory-management, debugging, etc.)
 *   .agent/workflows/   — 5 development workflows
 *   .memory/            — 4 persistent context files
 *
 * Then detects project type and recommends skills from skills.sh.
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");
const CWD = process.cwd();

// --- Scaffold targets ---

const TARGETS = [
  {
    src: "GEMINI.md",
    dest: "GEMINI.md",
    label: "GEMINI.md (AI system instructions)",
  },
  {
    src: "rules",
    dest: path.join(".gemini", "rules"),
    label: ".gemini/rules/ (5 AI behavior rules)",
    dir: true,
  },
  {
    src: "skills",
    dest: path.join(".gemini", "skills"),
    label: ".gemini/skills/ (core skills)",
    dir: true,
  },
  {
    src: "workflows",
    dest: path.join(".agent", "workflows"),
    label: ".agent/workflows/ (5 development workflows)",
    dir: true,
  },
  {
    src: "memory",
    dest: ".memory",
    label: ".memory/ (persistent context — 4 files)",
    dir: true,
  },
];

// --- Project detection & skill recommendations ---

const SKILL_CATALOG = [
  // Frameworks
  {
    markers: ["next.config.*"],
    type: "Next.js",
    skills: [
      "anthropics/courses/next-best-practices",
      "anthropics/courses/vercel-react-best-practices",
    ],
  },
  {
    markers: ["vite.config.*", "vite.config.ts", "vite.config.js"],
    type: "Vite",
    skills: ["nicepkg/vite"],
  },
  {
    markers: ["nuxt.config.*"],
    type: "Nuxt",
    skills: ["anthropics/courses/nuxt"],
  },
  {
    markers: ["angular.json"],
    type: "Angular",
    skills: [],
  },
  {
    markers: ["vue.config.*", "*.vue"],
    type: "Vue",
    skills: [
      "anthropics/courses/vue-best-practices",
      "anthropics/courses/vue-router-best-practices",
    ],
  },

  // Languages
  {
    markers: ["tsconfig.json"],
    type: "TypeScript",
    skills: ["anthropics/courses/typescript-advanced-types"],
  },
  {
    markers: ["pyproject.toml", "setup.py", "requirements.txt"],
    type: "Python",
    skills: [
      "anthropics/courses/python-performance-optimization",
      "anthropics/courses/python-testing-patterns",
    ],
  },
  {
    markers: ["go.mod"],
    type: "Go",
    skills: ["anthropics/courses/golang-pro"],
  },
  {
    markers: ["Cargo.toml"],
    type: "Rust",
    skills: [],
  },

  // Testing
  {
    markers: ["jest.config.*", "jest.config.js", "jest.config.ts"],
    type: "Jest",
    skills: ["anthropics/courses/test-driven-development"],
  },
  {
    markers: ["vitest.config.*"],
    type: "Vitest",
    skills: ["anthropics/courses/vitest"],
  },

  // Infrastructure
  {
    markers: ["Dockerfile", "docker-compose.*"],
    type: "Docker",
    skills: ["anthropics/courses/docker-expert"],
  },
  {
    markers: [".github/workflows"],
    type: "GitHub Actions",
    skills: ["anthropics/courses/github-actions-templates"],
  },

  // UI
  {
    markers: ["tailwind.config.*"],
    type: "Tailwind CSS",
    skills: ["anthropics/courses/tailwind-design-system"],
  },

  // Backend
  {
    markers: ["prisma/schema.prisma"],
    type: "Prisma",
    skills: [],
  },
  {
    markers: ["supabase/config.toml", ".supabase"],
    type: "Supabase",
    skills: ["anthropics/courses/supabase-postgres-best-practices"],
  },
];

/**
 * Detect project type by checking for marker files/dirs in cwd.
 * Returns { detectedTypes: string[], recommendedSkills: string[] }
 */
function detectProject(cwd) {
  const detectedTypes = [];
  const recommendedSkills = new Set();

  for (const entry of SKILL_CATALOG) {
    for (const marker of entry.markers) {
      // Support glob-like matching (simple: check for exact or wildcard prefix)
      const matches = findMarker(cwd, marker);
      if (matches) {
        detectedTypes.push(entry.type);
        for (const skill of entry.skills) {
          recommendedSkills.add(skill);
        }
        break; // One match per catalog entry is enough
      }
    }
  }

  return {
    detectedTypes,
    recommendedSkills: [...recommendedSkills],
  };
}

/**
 * Check if a marker file/dir exists in cwd.
 * Supports simple wildcard: "next.config.*" matches any extension.
 */
function findMarker(cwd, marker) {
  if (marker.includes("*")) {
    // Wildcard: check if any file matches the prefix
    const prefix = marker.replace("*", "");
    try {
      const files = fs.readdirSync(cwd);
      return files.some((f) => f.startsWith(prefix));
    } catch {
      return false;
    }
  }

  // Check if path contains / (subdirectory marker)
  const fullPath = path.join(cwd, marker);
  return fs.existsSync(fullPath);
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);

  if (!args.includes("init")) {
    console.log(chalk.bold.cyan("\n  Antigravity Kit") + " — AI Guard Rails\n");
    console.log("  Usage: " + chalk.yellow("npx antigravity-kit init") + "\n");
    console.log(
      "  Scaffolds portable AI rules, workflows, and skills\n  into your project for structured development.\n",
    );
    process.exit(0);
  }

  const force = args.includes("--force") || args.includes("-f");

  console.log(
    chalk.bold.cyan("\n🚀 Antigravity Kit") + " — Scaffolding AI Guard Rails\n",
  );

  // Check templates exist
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(
      chalk.red(
        "❌ Templates directory not found. Run `npm run build` first.\n",
      ),
    );
    process.exit(1);
  }

  // --- Phase 1: Scaffold core files ---

  let created = 0;
  let skipped = 0;

  for (const target of TARGETS) {
    const srcPath = path.join(TEMPLATES_DIR, target.src);
    const destPath = path.join(CWD, target.dest);

    if (!fs.existsSync(srcPath)) {
      console.log(chalk.yellow(`  ⏭  ${target.label} (source not found)`));
      skipped++;
      continue;
    }

    if (fs.existsSync(destPath) && !force) {
      console.log(chalk.gray(`  ⏭  ${target.label} (already exists)`));
      skipped++;
      continue;
    }

    if (target.dir) {
      await fs.ensureDir(destPath);
      await fs.copy(srcPath, destPath, { overwrite: force });
    } else {
      await fs.ensureDir(path.dirname(destPath));
      await fs.copy(srcPath, destPath, { overwrite: force });
    }

    console.log(chalk.green(`  ✅  ${target.label}`));
    created++;
  }

  console.log();

  if (created > 0) {
    console.log(
      chalk.bold.green(`  Done!`) +
        ` Created ${created} item(s), skipped ${skipped}.\n`,
    );
  } else {
    console.log(
      chalk.yellow("  All files already exist. Use --force to overwrite.\n"),
    );
  }

  // --- Phase 2: Detect project & recommend skills ---

  const { detectedTypes, recommendedSkills } = detectProject(CWD);

  if (detectedTypes.length > 0) {
    console.log(
      chalk.bold("  🔍 Detected: ") +
        chalk.cyan(detectedTypes.join(" + ")) +
        "\n",
    );

    if (recommendedSkills.length > 0) {
      console.log(
        chalk.bold("  💡 Recommended skills ") +
          chalk.gray("(install via skills.sh):") +
          "\n",
      );
      for (const skill of recommendedSkills) {
        console.log(chalk.yellow(`     npx skills add ${skill}`));
      }
      console.log();
    }
  }

  // --- Phase 3: What's next ---

  console.log(chalk.gray("  What's next:"));
  console.log(
    chalk.gray("  • Edit GEMINI.md to customize AI behavior for your project"),
  );
  console.log(
    chalk.gray(
      "  • Use /develop, /quick-fix, /review, /sync, /release workflows",
    ),
  );
  if (recommendedSkills.length > 0) {
    console.log(
      chalk.gray("  • Install recommended skills above for your tech stack"),
    );
  }
  console.log(chalk.gray("  • Run with --force to overwrite existing files\n"));
}

main().catch((err) => {
  console.error(chalk.red(`\n❌ Error: ${err.message}\n`));
  process.exit(1);
});
