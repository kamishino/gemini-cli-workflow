#!/usr/bin/env node

/**
 * antigravity-kit init
 *
 * Scaffolds AI guard rails into the current project:
 *   GEMINI.md           — AI system instructions
 *   .gemini/rules/      — 5 portable guard rails
 *   .gemini/skills/     — Core skills (memory-management, debugging, etc.)
 *   .agent/workflows/   — 12 development workflows
 *   .agent/agents/      — 4 specialist agents (architect, reviewer, debugger, planner)
 *   .memory/            — 4 persistent context files
 *
 * Modes:
 *   --interactive       — Guided wizard with workflow/feature selection
 *   (default)           — Install all templates (original behavior)
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const ora = require("ora");

const TEMPLATES_DIR = path.join(__dirname, "..", "templates");
const CWD = process.cwd();

// Check for flags
const args = process.argv.slice(2);
const isInteractive = args.includes("--interactive") || args.includes("-i");

// --- Scaffold targets (for standard init) ---

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
    label: ".agent/workflows/ (12 development workflows)",
    dir: true,
  },
  {
    src: "agents",
    dest: path.join(".agent", "agents"),
    label:
      ".agent/agents/ (4 specialist agents — architect, reviewer, debugger, planner)",
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

  // Show help only when explicitly requested
  if (args.includes("--help") || args.includes("-h")) {
    console.log(chalk.bold.cyan("\n  Antigravity Kit") + " — AI Guard Rails\n");
    console.log("  Usage: " + chalk.yellow("npx antigravity-kit init") + "\n");
    console.log(
      "  Scaffolds portable AI rules, workflows, and skills\n  into your project for structured development.\n",
    );
    process.exit(0);
  }

  const force = args.includes("--force") || args.includes("-f");
  const withNeuralMemory = args.includes("--with-neuralmemory");

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
    const spinner = ora({ text: target.label, indent: 2 }).start();

    if (!fs.existsSync(srcPath)) {
      spinner.warn(`${target.label} ${chalk.gray("(source not found)")}`);
      skipped++;
      continue;
    }

    if (fs.existsSync(destPath) && !force) {
      spinner.stopAndPersist({
        symbol: chalk.gray("⏭"),
        text: chalk.gray(`${target.label} (already exists)`),
      });
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

    spinner.succeed(chalk.green(target.label));
    created++;
  }

  // --- Phase 1.5: Optional NeuralMemory setup ---

  if (withNeuralMemory) {
    const nmCreated = await scaffoldNeuralMemory(CWD, force);
    created += nmCreated;
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

  // --- Phase 2.5: Auto-register agents in GEMINI.md ---
  try {
    const agents = require("../scripts/agents");
    await agents.run(CWD);
  } catch (_e) {
    // Non-fatal: agent registration is a nice-to-have
  }

  // --- Phase 3: Getting Started banner ---

  const B = chalk.gray;
  const Y = chalk.yellow;
  const C = chalk.cyan;

  console.log(B("  ┌─────────────────────────────────────────────────┐"));
  console.log(
    B("  │") +
      chalk.bold.green("  🚀 Antigravity Kit — Ready!") +
      B("                      │"),
  );
  console.log(
    B("  │") + B("                                                 │"),
  );
  console.log(
    B("  │") + C("  Try these first:") + B("                               │"),
  );
  console.log(
    B("  │") + Y("    /develop   ") + B(" structured dev workflow          │"),
  );
  console.log(
    B("  │") + Y("    /quick-fix ") + B(" fast track for small changes     │"),
  );
  console.log(
    B("  │") + Y("    /debug     ") + B(" systematic debugging             │"),
  );
  console.log(
    B("  │") + Y("    agk status ") + B(" check project health             │"),
  );
  console.log(
    B("  │") + Y("    agk doctor ") + B(" full health check                │"),
  );
  console.log(
    B("  │") + B("                                                 │"),
  );

  if (recommendedSkills.length > 0) {
    console.log(
      B("  │") +
        C("  Recommended skills:") +
        B("                            │"),
    );
    for (const skill of recommendedSkills.slice(0, 2)) {
      const padded = `    npx skills add ${skill}`;
      console.log(B("  │") + Y(padded.padEnd(49)) + B("│"));
    }
    console.log(
      B("  │") + B("                                                 │"),
    );
  }

  if (withNeuralMemory) {
    console.log(
      B("  │") + C("  NeuralMemory:") + B(" fill API keys in .env           │"),
    );
    console.log(
      B("  │") + B("                                                 │"),
    );
  }

  console.log(
    B("  │") + B("  Tip: agk upgrade --force to update templates   │"),
  );
  console.log(B("  └─────────────────────────────────────────────────┘"));
  console.log();
}

// --- NeuralMemory optional setup ---

const NEURAL_MEMORY_MCP_CONFIG = {
  mcpServers: {
    neuralmemory: {
      command: "uv",
      args: ["--directory", "<path-to-mcp-neuralmemory>", "run", "main.py"],
      env: {
        NEO4J_URI: "bolt://localhost:7687",
        NEO4J_USER: "neo4j",
        NEO4J_PASSWORD: "${NEO4J_PASSWORD}",
        GEMINI_API_KEY: "${GEMINI_API_KEY}",
      },
    },
  },
};

const NEURAL_MEMORY_ENV = `# NeuralMemory Configuration
# Fill these in to activate graph-based AI memory
# See: https://github.com/Hexecu/mcp-neuralmemory

# Required: Google Gemini API key (free tier available)
# Get yours at: https://aistudio.google.com/apikey
GEMINI_API_KEY=

# Required: Neo4j database credentials
# Install Neo4j: https://neo4j.com/download/
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=
`;

const NEURAL_MEMORY_README = `# 🧠 NeuralMemory Setup

This project is configured for optional NeuralMemory integration.

## Prerequisites

1. **Neo4j** — Install from [neo4j.com/download](https://neo4j.com/download/)
2. **Python 3.11+** — [python.org](https://python.org)
3. **uv** — \`pip install uv\` or see [astral.sh/uv](https://astral.sh/uv)

## Setup Steps

\`\`\`bash
# 1. Clone NeuralMemory
git clone https://github.com/Hexecu/mcp-neuralmemory.git

# 2. Fill in your API keys
#    Edit .env in your project root

# 3. Update mcp-config.json
#    Replace <path-to-mcp-neuralmemory> with the actual path

# 4. Start Neo4j and run
uv --directory /path/to/mcp-neuralmemory run main.py
\`\`\`

## MCP Config

Copy the contents of \`mcp-config.json\` into your IDE's MCP settings:
- **Antigravity**: \`.gemini/settings.json\`
- **VS Code**: \`.vscode/mcp.json\`
- **Cursor**: \`.cursor/mcp.json\`

## Without NeuralMemory

The project works perfectly without NeuralMemory.
\`.memory/\` provides lightweight file-based memory with zero dependencies.
NeuralMemory adds graph-based search and semantic memory on top.
`;

async function scaffoldNeuralMemory(cwd, force) {
  let count = 0;

  const files = [
    {
      dest: path.join(".neuralmemory", "mcp-config.json"),
      content: JSON.stringify(NEURAL_MEMORY_MCP_CONFIG, null, 2) + "\n",
      label: ".neuralmemory/mcp-config.json (MCP server config)",
    },
    {
      dest: path.join(".neuralmemory", "README.md"),
      content: NEURAL_MEMORY_README,
      label: ".neuralmemory/README.md (setup instructions)",
    },
    {
      dest: ".env",
      content: NEURAL_MEMORY_ENV,
      label: ".env (API key placeholders)",
    },
  ];

  console.log();
  console.log(
    chalk.bold.magenta("  🧠 NeuralMemory") + " — Optional Graph Memory\n",
  );

  for (const file of files) {
    const destPath = path.join(cwd, file.dest);

    if (fs.existsSync(destPath) && !force) {
      console.log(chalk.gray(`  ⏭  ${file.label} (already exists)`));
      continue;
    }

    await fs.ensureDir(path.dirname(destPath));
    await fs.writeFile(destPath, file.content, "utf8");
    console.log(chalk.green(`  ✅  ${file.label}`));
    count++;
  }

  // Add .env to .gitignore if not already there
  const gitignorePath = path.join(cwd, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignore = await fs.readFile(gitignorePath, "utf8");
    if (!gitignore.includes(".env")) {
      await fs.appendFile(gitignorePath, "\n# NeuralMemory secrets\n.env\n");
      console.log(chalk.green("  ✅  .gitignore (added .env)"));
      count++;
    }
  }

  return count;
}

// --- Entry point: choose init mode ---
if (isInteractive) {
  // Run interactive setup
  const initInteractive = require("../scripts/init-interactive");
  initInteractive.run(CWD).catch((error) => {
    console.error(chalk.red("Installation failed:"), error.message);
    process.exit(1);
  });
} else {
  // Run standard init
  main().catch((err) => {
    console.error(
      chalk.red(`\n✖ Fatal error during initialization:`),
      err.message,
    );
    process.exit(1);
  });
}
