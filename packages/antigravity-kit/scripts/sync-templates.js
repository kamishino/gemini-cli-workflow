#!/usr/bin/env node

/**
 * sync-templates.js
 *
 * Build script: syncs SSOT blueprints into the package's templates/ directory.
 *
 * SSOT Sources:
 *   resources/blueprints/rules/global/antigravity/  →  templates/rules/
 *   resources/blueprints/workflows/                 →  templates/workflows/ (renderer-driven)
 *   resources/blueprints/skills/ (subset)           →  templates/skills/
 *   resources/blueprints/templates/GEMINI-antigravity.md → templates/GEMINI.md
 *
 * IMPORTANT:
 * - Only SSOT-managed targets are refreshed.
 * - Other package-owned template directories (agents, suites, hooks, ci, agents-md)
 *   are preserved to keep structure stable.
 * - Workflows use safe overwrite by default to protect legacy files during migration.
 */

const fs = require("fs-extra");
const path = require("path");
const { renderWorkflowTemplates } = require("../lib/workflow-renderer");

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

  // Ensure template root exists (do not wipe whole directory).
  await fs.ensureDir(TEMPLATES);

  for (const item of SYNC_MAP) {
    if (!fs.existsSync(item.src)) {
      console.log(`  ⏭  ${item.label} (source not found: ${item.src})`);
      continue;
    }

    if (item.isFile) {
      await fs.ensureDir(path.dirname(item.dest));
      // Refresh managed target
      await fs.remove(item.dest);
      await fs.copy(item.src, item.dest);
    } else {
      // Refresh managed target directory only
      await fs.remove(item.dest);
      await fs.copy(item.src, item.dest);
    }

    console.log(`  ✅  ${item.label}`);
  }

  // Render workflows from SSOT with safe overwrite policy.
  const workflowsRoot = path.join(BLUEPRINTS, "workflows");
  const workflowsDest = path.join(TEMPLATES, "workflows");

  if (fs.existsSync(workflowsRoot)) {
    const forceWorkflows =
      process.env.AGK_FORCE_WORKFLOW_SYNC === "1" ||
      process.env.AGK_FORCE_WORKFLOW_SYNC === "true";

    const workflowResult = await renderWorkflowTemplates({
      workflowsRoot,
      outputDir: workflowsDest,
      targetProfile: "antigravity",
      modelProfile: "default",
      force: forceWorkflows,
      pruneUnknown: false,
    });

    console.log(
      `  ✅  workflows (${workflowResult.renderedFiles.length} rendered, ${workflowResult.createdFiles.length} created, ${workflowResult.updatedFiles.length} updated)`,
    );

    if (workflowResult.skippedLegacyFiles.length > 0 && !forceWorkflows) {
      console.log(
        `  ⏭  workflows (${workflowResult.skippedLegacyFiles.length} legacy file(s) preserved; set AGK_FORCE_WORKFLOW_SYNC=1 to overwrite)`,
      );
    }

    if (workflowResult.missingSourceFiles.length > 0) {
      console.log(
        `  ⚠️  workflows (${workflowResult.missingSourceFiles.length} registry source file(s) missing)`,
      );
    }
  } else {
    console.log(`  ⏭  workflows (source not found: ${workflowsRoot})`);
  }

  // Copy selected skills
  const skillsSrc = path.join(BLUEPRINTS, "skills");
  const skillsDest = path.join(TEMPLATES, "skills");
  await fs.remove(skillsDest);
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
