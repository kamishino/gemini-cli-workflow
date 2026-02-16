#!/usr/bin/env node

/**
 * sync-templates.js
 *
 * Build script: copies SSOT blueprints into the package's templates/ directory.
 *
 * SSOT Sources:
 *   resources/blueprints/rules/global/antigravity/  →  templates/rules/
 *   resources/blueprints/workflows/                 →  templates/workflows/
 *   resources/blueprints/skills/ (subset)           →  templates/skills/
 *   resources/blueprints/templates/GEMINI-antigravity.md → templates/GEMINI.md
 */

const fs = require("fs-extra");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..", "..");
const BLUEPRINTS = path.join(ROOT, "resources", "blueprints");
const TEMPLATES = path.join(__dirname, "..", "templates");

const SYNC_MAP = [
  {
    src: path.join(BLUEPRINTS, "rules", "global", "antigravity"),
    dest: path.join(TEMPLATES, "rules"),
    label: "rules",
  },
  {
    src: path.join(BLUEPRINTS, "workflows"),
    dest: path.join(TEMPLATES, "workflows"),
    label: "workflows",
  },
  {
    src: path.join(BLUEPRINTS, "templates", "GEMINI-antigravity.md"),
    dest: path.join(TEMPLATES, "GEMINI.md"),
    label: "GEMINI.md",
    isFile: true,
  },
  {
    src: path.join(BLUEPRINTS, "memory"),
    dest: path.join(TEMPLATES, "memory"),
    label: "memory",
  },
];

// Skills: copy select skills only
const SKILL_DIRS = [
  "memory-management",
  "systematic-debugging",
  "verification-before-completion",
  "web-design-guidelines",
];

async function main() {
  console.log("🔄 Syncing templates from SSOT blueprints...\n");

  // Clean templates dir
  await fs.emptyDir(TEMPLATES);

  for (const item of SYNC_MAP) {
    if (!fs.existsSync(item.src)) {
      console.log(`  ⏭  ${item.label} (source not found: ${item.src})`);
      continue;
    }

    if (item.isFile) {
      await fs.ensureDir(path.dirname(item.dest));
      await fs.copy(item.src, item.dest);
    } else {
      await fs.copy(item.src, item.dest);
    }

    console.log(`  ✅  ${item.label}`);
  }

  // Copy selected skills
  const skillsSrc = path.join(BLUEPRINTS, "skills");
  const skillsDest = path.join(TEMPLATES, "skills");
  await fs.ensureDir(skillsDest);

  for (const skillDir of SKILL_DIRS) {
    const src = path.join(skillsSrc, skillDir);
    const dest = path.join(skillsDest, skillDir);

    if (fs.existsSync(src)) {
      await fs.copy(src, dest);
      console.log(`  ✅  skills/${skillDir}`);
    } else {
      console.log(`  ⏭  skills/${skillDir} (not found)`);
    }
  }

  console.log("\n✨ Templates synced successfully.\n");
}

main().catch((err) => {
  console.error(`❌ Sync failed: ${err.message}`);
  process.exit(1);
});
